import 'server-only'

import { generateKindraMultimodalReport, type GeminiInlineImage } from '@lib/gemini/generate'
import {
  completedMonthsFromDaysSinceBirth,
  formatBirthAgeHintFromDate,
  formatBirthLineForReportCard,
  isoDateLocal,
  parseBirthDateIso,
} from '@lib/intake/age-months'
import { buildStructuredParentNoteForGemini } from '@lib/intake/parent-note-for-gemini'
import { loadGrowthStatsJsonRaw } from '@lib/intake/load-growth-stats.server'
import {
  BODY_GROWTH_DISCLAIMER_MARKDOWN,
  buildPhysioEmotionalSectionMarkdown,
  injectPhysioMarkdownBeforeParentsSection,
  parseGrowthStatsJson,
  shouldAppendBodyGrowthRangeDisclaimer,
} from '@lib/intake/physio-emotional-from-growth'
import type { IntakeReportSessionPayload } from '@lib/intake/intake-report-session'
import { buildReportSessionImageFields, type ReportSlotBuffer } from '@lib/intake/report-session-images.server'
import { allocateKindraReportSerial } from '@lib/intake/report-serial-allocation.server'
import { STORED_KINDRA_INTAKE_SCHEMA } from '@lib/reports/resolve-report-json'
import { createServiceRoleClient } from '@lib/supabase/admin'
import { isPaymentConfirmedForAi } from '@lib/intake/intake-payment-confirmed.server'

const STORAGE_BUCKET = 'intake-drawings'

export type TriggerAiAnalysisResult =
  | { ok: true; skipped: true; reason?: string }
  | { ok: true; skipped: false }
  | { ok: false; message: string }

type IntakeRow = {
  id: string
  email: string
  parent_display_name: string
  child_display_name: string
  child_gender: string
  child_note: string | null
  child_height_cm: number | null
  child_weight_kg: number | null
  child_birthday: string | null
  drawn_at: string | null
  child_age_in_months: number | null
  child_age_hint: string | null
  drawing_paths: unknown
  gemini_status: string | null
  payment_confirmed_at?: string | null
}

type ReportRow = {
  id: string
  intake_id: string | null
  owner_email: string | null
  deposit_confirmed: boolean | null
  toss_payment_key: string | null
  report_json: unknown
}

function mimeFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase()
  if (ext === 'png') return 'image/png'
  if (ext === 'webp') return 'image/webp'
  return 'image/jpeg'
}

function normalizeDrawingPaths(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((x): x is string => typeof x === 'string' && x.trim().length > 0).map((s) => s.trim())
}

function genderCodeFromStoredLabel(label: string): 'male' | 'female' {
  const t = label.trim()
  if (t === '여아') return 'female'
  return 'male'
}

function drawingMemosFromReportJson(reportJson: unknown): string[] {
  if (!reportJson || typeof reportJson !== 'object') return []
  const root = reportJson as Record<string, unknown>
  const session = root.session
  if (!session || typeof session !== 'object') return []
  const memos = (session as Record<string, unknown>).drawingMemos
  if (!Array.isArray(memos)) return []
  return memos.filter((x): x is string => typeof x === 'string')
}

function readSessionReportIdFromReportJson(reportJson: unknown): string | null {
  if (!reportJson || typeof reportJson !== 'object') return null
  const session = (reportJson as Record<string, unknown>).session
  if (!session || typeof session !== 'object') return null
  const rid = (session as Record<string, unknown>).reportId
  if (typeof rid !== 'string') return null
  const t = rid.trim()
  return t.length > 0 ? t : null
}

/**
 * 결제 확정 후 통합 리포트 AI 분석 실행 (중복·결제 미확정 시 스킵).
 */
export async function triggerAiAnalysis(intakeIdRaw: string): Promise<TriggerAiAnalysisResult> {
  const intakeId = String(intakeIdRaw ?? '').trim()
  if (!intakeId) return { ok: false, message: 'intake id 없음' }

  const admin = createServiceRoleClient()

  const { data: intake, error: iErr } = await admin
    .from('kindra_intakes')
    .select(
      'id, email, parent_display_name, child_display_name, child_gender, child_note, child_height_cm, child_weight_kg, child_birthday, drawn_at, child_age_in_months, child_age_hint, drawing_paths, gemini_status, payment_confirmed_at',
    )
    .eq('id', intakeId)
    .maybeSingle()

  if (iErr || !intake) {
    console.error('[triggerAiAnalysis] intake load', iErr?.message)
    return { ok: false, message: '신청 정보를 찾을 수 없습니다.' }
  }

  const row = intake as IntakeRow

  const { data: report, error: rErr } = await admin
    .from('kindra_reports')
    .select('id, intake_id, owner_email, deposit_confirmed, toss_payment_key, report_json')
    .eq('intake_id', intakeId)
    .maybeSingle()

  if (rErr || !report) {
    console.error('[triggerAiAnalysis] report load', rErr?.message)
    return { ok: false, message: '리포트 행을 찾을 수 없습니다.' }
  }

  const rep = report as ReportRow

  if (!isPaymentConfirmedForAi(row, rep)) {
    console.warn('[triggerAiAnalysis] payment not confirmed, skip', intakeId)
    return { ok: true, skipped: true, reason: 'payment_not_confirmed' }
  }

  if (row.gemini_status === 'completed') {
    return { ok: true, skipped: true, reason: 'already_completed' }
  }

  const { data: locked } = await admin
    .from('kindra_intakes')
    .update({
      gemini_status: 'running',
      gemini_error: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', intakeId)
    .in('gemini_status', ['pending', 'failed'])
    .select('id')
    .maybeSingle()

  if (!locked) {
    const { data: cur } = await admin.from('kindra_intakes').select('gemini_status').eq('id', intakeId).maybeSingle()
    const st = (cur as { gemini_status?: string } | null)?.gemini_status
    if (st === 'completed') return { ok: true, skipped: true, reason: 'already_completed' }
    return { ok: true, skipped: true, reason: st === 'running' ? 'already_running' : 'not_pending' }
  }

  const paths = normalizeDrawingPaths(row.drawing_paths)
  if (paths.length === 0) {
    await admin
      .from('kindra_intakes')
      .update({
        gemini_status: 'failed',
        gemini_error: '저장된 그림 경로가 없습니다.',
        updated_at: new Date().toISOString(),
      })
      .eq('id', intakeId)
    return { ok: false, message: '그림 경로 없음' }
  }

  const slots: ReportSlotBuffer[] = []
  for (const path of paths) {
    const { data: blob, error: dlErr } = await admin.storage.from(STORAGE_BUCKET).download(path)
    if (dlErr || !blob) {
      await admin
        .from('kindra_intakes')
        .update({
          gemini_status: 'failed',
          gemini_error: `그림 불러오기 실패: ${dlErr?.message ?? path}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', intakeId)
      return { ok: false, message: dlErr?.message ?? 'storage download' }
    }
    const buf = Buffer.from(await blob.arrayBuffer())
    const mime = mimeFromPath(path)
    slots.push({ buf, mime })
  }

  const blobs: GeminiInlineImage[] = slots.map((s) => ({
    mimeType: s.mime,
    base64: s.buf.toString('base64'),
  }))

  const birthParts = row.child_birthday ? parseBirthDateIso(row.child_birthday) : null
  if (!birthParts) {
    await admin
      .from('kindra_intakes')
      .update({
        gemini_status: 'failed',
        gemini_error: '생년월일 데이터가 없습니다.',
        updated_at: new Date().toISOString(),
      })
      .eq('id', intakeId)
    return { ok: false, message: 'birthday missing' }
  }

  const drawnIso = row.drawn_at?.trim() || isoDateLocal(new Date())
  const drawnParts = parseBirthDateIso(drawnIso) ?? {
    y: new Date().getFullYear(),
    m: new Date().getMonth() + 1,
    d: new Date().getDate(),
  }
  const drawnDay = new Date(drawnParts.y, drawnParts.m - 1, drawnParts.d)

  const childGenderCode = genderCodeFromStoredLabel(row.child_gender)
  const childGenderLabel = row.child_gender.trim() || (childGenderCode === 'female' ? '여아' : '남아')

  const childAgeMonthsAtDrawing =
    typeof row.child_age_in_months === 'number' && Number.isFinite(row.child_age_in_months)
      ? row.child_age_in_months
      : completedMonthsFromDaysSinceBirth(birthParts.y, birthParts.m, birthParts.d, drawnDay)

  const childAgeHint =
    row.child_age_hint?.trim() ||
    formatBirthAgeHintFromDate(birthParts.y, birthParts.m, birthParts.d, drawnDay)

  const drawingMemos = drawingMemosFromReportJson(rep.report_json)

  const childHeightCm =
    typeof row.child_height_cm === 'number' && Number.isFinite(row.child_height_cm)
      ? row.child_height_cm
      : null
  const childWeightKg =
    typeof row.child_weight_kg === 'number' && Number.isFinite(row.child_weight_kg)
      ? row.child_weight_kg
      : null

  try {
    const parentNoteForGemini = buildStructuredParentNoteForGemini({
      analysisDateIso: isoDateLocal(drawnDay),
      ageHintLine: childAgeHint || '(없음)',
      childNote: row.child_note ?? '',
      drawingMemos,
    })

    let reportMarkdown = await generateKindraMultimodalReport(blobs, {
      childDisplayName: row.child_display_name,
      childGenderLabel,
      childAgeHint: childAgeHint || undefined,
      parentNote: parentNoteForGemini,
      completedMonths: childAgeMonthsAtDrawing,
    })

    const growthRaw = loadGrowthStatsJsonRaw()
    const growthStats = growthRaw ? parseGrowthStatsJson(growthRaw) : null
    if (growthStats) {
      const physio = buildPhysioEmotionalSectionMarkdown(growthStats, {
        childShortName: row.child_display_name,
        sex: childGenderCode,
        completedMonths: childAgeMonthsAtDrawing,
        heightCm: childHeightCm,
        weightKg: childWeightKg,
      })
      if (physio) {
        reportMarkdown = injectPhysioMarkdownBeforeParentsSection(reportMarkdown, physio)
      }
      if (
        shouldAppendBodyGrowthRangeDisclaimer(
          growthStats,
          childGenderCode,
          childAgeMonthsAtDrawing,
          childHeightCm,
          childWeightKg,
        )
      ) {
        reportMarkdown = `${reportMarkdown.trimEnd()}\n\n${BODY_GROWTH_DISCLAIMER_MARKDOWN}\n`
      }
    }

    await admin
      .from('kindra_intakes')
      .update({
        gemini_report_markdown: reportMarkdown,
        gemini_status: 'completed',
        gemini_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', intakeId)

    const birthLine = formatBirthLineForReportCard(birthParts.y, birthParts.m, birthParts.d, drawnDay)
    const birthAndMaterials = [birthLine, `제출 그림 ${slots.length}장`].join(' · ')
    const reportId =
      readSessionReportIdFromReportJson(rep.report_json) ??
      (await allocateKindraReportSerial(admin, {
        ownerEmail: row.email.trim().toLowerCase(),
        childDisplayName: row.child_display_name,
        excludeReportRowId: rep.id,
      }))

    const heroTitleLines: [string, string] = [
      `${row.child_display_name}의 그림 ${slots.length}장`,
      '마음의 무늬를 차분히 살펴봤어요',
    ]

    const { heroImageDataUrl, drawingThumbDataUrls } = await buildReportSessionImageFields(slots)

    const sessionPayload: IntakeReportSessionPayload = {
      v: 2,
      reportId,
      intakeId,
      markdown: reportMarkdown,
      subject: {
        applicantLabel: `${row.parent_display_name} 님`,
        childLabel: `${row.child_display_name} (${childGenderLabel})`,
        birthAndMaterials,
      },
      childShortName: row.child_display_name,
      heroTitleLines,
      heroImageDataUrl,
      drawingThumbDataUrls,
      drawnAtIso: drawnIso,
      childAgeInMonthsAtDrawing: childAgeMonthsAtDrawing,
      analysisPending: false,
      drawingMemos,
    }

    const ownerEmail = (rep.owner_email ?? row.email).trim().toLowerCase()

    const { error: upRepErr } = await admin
      .from('kindra_reports')
      .update({
        report_json: {
          schema: STORED_KINDRA_INTAKE_SCHEMA,
          childName: row.child_display_name,
          parentEmail: ownerEmail,
          session: sessionPayload,
        },
      })
      .eq('id', rep.id)

    if (upRepErr) {
      console.error('[triggerAiAnalysis] report_json update', upRepErr.message)
      await admin
        .from('kindra_intakes')
        .update({
          gemini_status: 'failed',
          gemini_error: `리포트 JSON 갱신 실패: ${upRepErr.message}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', intakeId)
      return { ok: false, message: upRepErr.message }
    }

    return { ok: true, skipped: false }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    await admin
      .from('kindra_intakes')
      .update({
        gemini_status: 'failed',
        gemini_error: msg,
        updated_at: new Date().toISOString(),
      })
      .eq('id', intakeId)
    console.error('[triggerAiAnalysis]', e)
    return { ok: false, message: msg }
  }
}
