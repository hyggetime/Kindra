'use server'

import type { IntegratedIntakeState } from '@lib/intake/form-state'
import { assertAllowedImageMime, generateKindraMultimodalReport, type GeminiInlineImage } from '@lib/gemini/generate'
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
  buildPhysioEmotionalSectionMarkdown,
  injectPhysioMarkdownBeforeParentsSection,
  parseGrowthStatsJson,
} from '@lib/intake/physio-emotional-from-growth'
import { randomUUID } from 'node:crypto'

import type { IntakeReportSessionPayload } from '@lib/intake/intake-report-session'
import { buildIntakeReportIdentifiers } from '@lib/intake/report-id'
import { effectivePriceTier } from '@lib/constants'
import { getIntakePricingContext } from '@lib/intake-pricing.server'
import { STORED_KINDRA_INTAKE_SCHEMA } from '@lib/reports/resolve-report-json'
import { createServiceRoleClient } from '@lib/supabase/admin'

const MAX_BYTES_PER_IMAGE = 4 * 1024 * 1024
const IMAGE_FIELDS = ['image1', 'image2', 'image3', 'image4', 'image5'] as const
const MAX_DRAWING_MEMO_LEN = 500
const STORAGE_BUCKET = 'intake-drawings'
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const CHILD_GENDER_CODES = ['male', 'female'] as const
type ChildGenderCode = (typeof CHILD_GENDER_CODES)[number]

const CHILD_GENDER_LABEL: Record<ChildGenderCode, string> = {
  male: '남아',
  female: '여아',
}

function parseChildGender(raw: string): ChildGenderCode | null {
  const v = raw.trim().toLowerCase()
  return (CHILD_GENDER_CODES as readonly string[]).includes(v) ? (v as ChildGenderCode) : null
}

/** 키(cm)·몸무게(kg) 선택 입력. 범위 밖이면 무시(null). */
function parseOptionalBodyMetric(raw: string, min: number, max: number): number | null {
  const t = String(raw ?? '').trim()
  if (!t) return null
  const v = Number(t.replace(',', '.'))
  if (!Number.isFinite(v)) return null
  if (v < min || v > max) return null
  return v
}

/** 마케팅 알림 동의: yes | no (필수) */
function parseMarketingOptIn(raw: string): string | null {
  const v = String(raw ?? '').trim().toLowerCase()
  if (v === 'yes' || v === 'no') return v
  return null
}

/** 정식 가격 의향: yes | no_expensive | no_uninterested | null */
function parsePricingIntent(raw: string): string | null {
  const v = String(raw ?? '').trim()
  if (v === 'yes' || v === 'no_expensive' || v === 'no_uninterested') return v
  return null
}

function mimeToExt(mime: string): string {
  const m = mime.toLowerCase().split(';')[0].trim()
  if (m === 'image/png') return 'png'
  if (m === 'image/webp') return 'webp'
  return 'jpg'
}

/**
 * 신청 정보 + 그림(1~5장, 빈 슬롯 제외)을 한 번에 처리합니다.
 * 1) `kindra_intakes` insert (신청마다 새 행)
 * 2) Storage `intake-drawings/{intake_id}/1..n` 업로드
 * 3) Gemini 멀티모달 분석 후 같은 행에 저장
 */
export async function submitIntegratedIntake(
  _prev: IntegratedIntakeState,
  formData: FormData,
): Promise<IntegratedIntakeState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const parentName = String(formData.get('parentName') ?? '').trim()
  const childDisplayName = String(formData.get('childDisplayName') ?? '').trim()
  const childGenderRaw = String(formData.get('childGender') ?? '')
  const childNote = String(formData.get('childNote') ?? '').trim()
  const birthDateRaw = String(formData.get('birthDate') ?? '').trim()
  const marketingOptIn = parseMarketingOptIn(String(formData.get('marketingOptIn') ?? ''))
  const pricingIntent = parsePricingIntent(String(formData.get('pricingIntent') ?? ''))

  if (!marketingOptIn) {
    return { ok: false, message: '마케팅 동의(알림 수신) 여부를 선택해 주세요.' }
  }
  if (!pricingIntent) {
    return { ok: false, message: '서비스 이용료 설문에 답해 주세요.' }
  }

  const bodyMetricsUnknown = String(formData.get('bodyMetricsUnknown') ?? '') === 'on'
  const childHeightCm = bodyMetricsUnknown
    ? null
    : parseOptionalBodyMetric(String(formData.get('childHeightCm') ?? ''), 40, 140)
  const childWeightKg = bodyMetricsUnknown
    ? null
    : parseOptionalBodyMetric(String(formData.get('childWeightKg') ?? ''), 1, 55)

  if (!email || !emailRe.test(email)) {
    return { ok: false, message: '유효한 이메일을 입력해 주세요.' }
  }
  if (!parentName) {
    return { ok: false, message: '보호자 이름(또는 호칭)을 입력해 주세요.' }
  }
  if (parentName.length > 20) {
    return { ok: false, message: '이름이 너무 길어요. 20자 이내로 입력해 주세요.' }
  }
  if (!childDisplayName) {
    return { ok: false, message: '아이 이름(또는 호칭)을 입력해 주세요.' }
  }
  if (childDisplayName.length > 20) {
    return { ok: false, message: '아이 이름이 너무 길어요. 20자 이내로 입력해 주세요.' }
  }
  const childGenderCode = parseChildGender(childGenderRaw)
  if (!childGenderCode) {
    return { ok: false, message: '아이 성별을 선택해 주세요.' }
  }
  const childGenderLabel = CHILD_GENDER_LABEL[childGenderCode]
  if (childNote.length > 500) {
    return { ok: false, message: '아이에 대한 내용이 너무 길어요. 500자 이내로 줄여 주세요.' }
  }
  const birthParts = parseBirthDateIso(birthDateRaw)
  if (!birthParts) {
    return { ok: false, message: '아이 생년월일을 선택해 주세요.' }
  }
  const birth = new Date(birthParts.y, birthParts.m - 1, birthParts.d)
  const today0 = new Date()
  today0.setHours(0, 0, 0, 0)
  if (birth.getTime() > today0.getTime()) {
    return { ok: false, message: '생년월일은 오늘 날짜 이전으로 선택해 주세요.' }
  }
  const minBirth = new Date(1995, 0, 1)
  if (birth.getTime() < minBirth.getTime()) {
    return { ok: false, message: '1995년 1월 1일 이후의 생년월일을 입력해 주세요.' }
  }
  const childAgeHint = formatBirthAgeHintFromDate(birthParts.y, birthParts.m, birthParts.d, new Date())
  if (childAgeHint.length > 200) {
    return { ok: false, message: '생년월일을 다시 확인해 주세요.' }
  }

  type SlotPayload = { buf: Buffer; mime: string }
  const uploaded: (SlotPayload | null)[] = []

  for (let i = 0; i < IMAGE_FIELDS.length; i++) {
    const key = IMAGE_FIELDS[i]!
    const entry = formData.get(key)
    if (!(entry instanceof File) || entry.size === 0) {
      if (i === 0) {
        return { ok: false, message: '그림 1번을 첨부해 주세요.' }
      }
      uploaded.push(null)
      continue
    }
    if (entry.size > MAX_BYTES_PER_IMAGE) {
      return { ok: false, message: '그림 한 장은 최대 4MB까지 올릴 수 있어요.' }
    }
    const mime = entry.type || 'image/jpeg'
    assertAllowedImageMime(mime)
    const buf = Buffer.from(await entry.arrayBuffer())
    uploaded.push({ buf, mime: mime.toLowerCase().split(';')[0].trim() })
  }

  /** 실제로 올라온 슬롯만 순서대로 수집합니다. 빈 슬롯을 이전 이미지로 채우지 않습니다(분석 왜곡 방지). */
  const slots: SlotPayload[] = []
  for (let i = 0; i < uploaded.length; i++) {
    const u = uploaded[i]
    if (u) slots.push(u)
  }
  if (slots.length === 0) {
    return { ok: false, message: '그림 1번을 첨부해 주세요.' }
  }
  if (slots.length > 5) {
    return { ok: false, message: '그림은 최대 5장까지 올릴 수 있어요.' }
  }

  const drawingMemos: string[] = []
  for (let i = 0; i < slots.length; i++) {
    const raw = String(formData.get(`drawingMemo${i + 1}`) ?? '').trim()
    if (raw.length > MAX_DRAWING_MEMO_LEN) {
      return { ok: false, message: `그림 ${i + 1} 메모는 ${MAX_DRAWING_MEMO_LEN}자 이내로 적어 주세요.` }
    }
    drawingMemos.push(raw)
  }

  const buffers = slots.map((s) => s.buf)
  const mimes = slots.map((s) => s.mime)
  const blobs: GeminiInlineImage[] = slots.map((s) => ({
    mimeType: s.mime,
    base64: s.buf.toString('base64'),
  }))

  let admin
  try {
    admin = createServiceRoleClient()
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return {
      ok: false,
      message: msg.includes('SUPABASE_SERVICE_ROLE_KEY')
        ? '서버 연결에 문제가 생겼어요. 잠시 후 다시 시도해 주시거나, 카카오톡으로 문의해 주세요.'
        : msg,
    }
  }

  const now = new Date().toISOString()

  const { data: row, error: insertError } = await admin
    .from('kindra_intakes')
    .insert({
      email,
      parent_display_name: parentName,
      child_display_name: childDisplayName,
      child_gender: childGenderLabel,
      child_note: childNote || null,
      child_age_hint: childAgeHint || null,
      marketing_opt_in: marketingOptIn,
      pricing_intent: pricingIntent,
      updated_at: now,
      gemini_status: 'running',
      gemini_error: null,
      gemini_report_markdown: null,
    })
    .select('id')
    .single()

  if (insertError || !row?.id) {
    const msg = insertError?.message ?? '신청을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.'
    if (
      /duplicate key|unique constraint/i.test(msg) &&
      (msg.includes('email_normalized') || msg.includes('kindra_intakes_email_normalized'))
    ) {
      return {
        ok: false,
        message:
          '이 이메일로는 이미 접수 기록이 있어, 지금은 동일한 주소로 다시 보내지 못할 수 있어요. 잠시 후 다시 시도하시거나, 반복되면 카카오톡으로 알려 주시면 돼요.',
      }
    }
    if (msg.includes('relation') || msg.includes('does not exist') || msg.includes('column')) {
      return {
        ok: false,
        message:
          '신청을 처리하는 중 오류가 발생했어요. 잠시 후 다시 시도해 주시거나, 카카오톡으로 알려 주세요.',
      }
    }
    if (/row[- ]level security/i.test(msg)) {
      return {
        ok: false,
        message:
          '신청을 처리하는 중 오류가 발생했어요. 잠시 후 다시 시도해 주시거나, 카카오톡으로 알려 주세요.',
      }
    }
    return { ok: false, message: msg }
  }

  const intakeId = row.id as string
  const paths: string[] = []

  for (let i = 0; i < buffers.length; i++) {
    const path = `${intakeId}/${i + 1}.${mimeToExt(mimes[i]!)}`
    const { error: up } = await admin.storage.from(STORAGE_BUCKET).upload(path, buffers[i]!, {
      contentType: mimes[i]!,
      upsert: true,
    })
    if (up) {
      await admin
        .from('kindra_intakes')
        .update({
          gemini_status: 'failed',
          gemini_error: `이미지 저장 실패: ${up.message}`,
          drawing_paths: paths.length ? paths : [],
          updated_at: new Date().toISOString(),
        })
        .eq('id', intakeId)
      return {
        ok: false,
        message: `그림 ${i + 1}을 전송하는 데 문제가 생겼어요. 잠시 후 다시 시도해 주세요.`,
      }
    }
    paths.push(path)
  }

  await admin
    .from('kindra_intakes')
    .update({
      drawing_paths: paths,
      updated_at: new Date().toISOString(),
    })
    .eq('id', intakeId)

  try {
    const refNow = new Date()
    const parentNoteForGemini = buildStructuredParentNoteForGemini({
      analysisDateIso: isoDateLocal(refNow),
      ageHintLine: childAgeHint || '(없음)',
      childNote,
      drawingMemos,
    })

    let reportMarkdown = await generateKindraMultimodalReport(blobs, {
      childDisplayName,
      childGenderLabel,
      childAgeHint: childAgeHint || undefined,
      parentNote: parentNoteForGemini,
    })

    const growthRaw = loadGrowthStatsJsonRaw()
    const growthStats = growthRaw ? parseGrowthStatsJson(growthRaw) : null
    if (growthStats) {
      const months = completedMonthsFromDaysSinceBirth(birthParts.y, birthParts.m, birthParts.d, new Date())
      const physio = buildPhysioEmotionalSectionMarkdown(growthStats, {
        childShortName: childDisplayName,
        sex: childGenderCode,
        completedMonths: months,
        heightCm: childHeightCm,
        weightKg: childWeightKg,
      })
      if (physio) {
        reportMarkdown = injectPhysioMarkdownBeforeParentsSection(reportMarkdown, physio)
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

    const birthLine = formatBirthLineForReportCard(birthParts.y, birthParts.m, birthParts.d, new Date())
    const birthAndMaterials = [birthLine, `제출 그림 ${slots.length}장`].join(' · ')
    const { reportId } = buildIntakeReportIdentifiers(childDisplayName, intakeId)

    const heroTitleLines: [string, string] = [
      `${childDisplayName}의 그림 ${slots.length}장`,
      '마음의 무늬를 차분히 살펴봤어요',
    ]
    const sessionPayload: IntakeReportSessionPayload = {
      v: 2,
      reportId,
      intakeId,
      markdown: reportMarkdown,
      subject: {
        applicantLabel: `${parentName} 님`,
        childLabel: `${childDisplayName} (${childGenderLabel})`,
        birthAndMaterials,
      },
      childShortName: childDisplayName,
      heroTitleLines,
    }

    const { count: reportCountBefore, isStep2Enabled } = await getIntakePricingContext()
    const priceTier = effectivePriceTier(reportCountBefore, isStep2Enabled)

    const reportUuid = randomUUID()
    const { error: reportInsertError } = await admin.from('kindra_reports').insert({
      id: reportUuid,
      owner_email: email,
      title: `${childDisplayName} · 통합 리포트`,
      price_tier: priceTier,
      report_json: {
        schema: STORED_KINDRA_INTAKE_SCHEMA,
        childName: childDisplayName,
        parentEmail: email,
        session: sessionPayload,
      },
    })

    if (reportInsertError) {
      return {
        ok: false,
        message: '그림은 잘 받았어요. 리포트 생성 중 문제가 생겼으니 카카오톡으로 알려 주시면 바로 도와드릴게요.',
      }
    }

    return {
      ok: true,
      message: '전송이 완료됐어요. 리포트는 24시간 이내 이메일로 보내 드릴게요.',
      priceTier,
      reportRowId: reportUuid,
    }
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
    return {
      ok: false,
      message: '그림은 안전하게 받았어요. 분석 중 문제가 생겼으니 카카오톡으로 알려 주시면 바로 도와드릴게요.',
    }
  }
}
