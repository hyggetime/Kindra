import 'server-only'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const STORAGE_BUCKET = 'intake-drawings'

export type CleanupExpiredIntakesResult = {
  dryRun: boolean
  expiryHours: number
  cutoffIso: string
  candidateCount: number
  skippedPaidCount: number
  deleteTargetCount: number
  deletedIntakes: number
  deletedReports: number
  removedFiles: number
}

type IntakeRow = {
  id: string
  created_at: string
  drawing_paths: unknown
  payment_confirmed_at: string | null
}

type ReportPayRow = {
  id: string
  deposit_confirmed: boolean | null
  toss_payment_key: string | null
}

function hoursExpiry(): number {
  const raw = process.env.CLEANUP_EXPIRY_HOURS
  if (!raw) return 72
  const n = Number(raw.trim())
  return Number.isFinite(n) && n > 0 ? n : 72
}

function normalizeDrawingPaths(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((x): x is string => typeof x === 'string' && x.trim().length > 0).map((s) => s.trim())
}

function createCleanupAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL 및 SUPABASE_SERVICE_ROLE_KEY 가 필요합니다(.env.local 또는 환경 변수).',
    )
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

async function reportsBlockDeletion(admin: SupabaseClient, intakeId: string): Promise<boolean> {
  const { data: reps, error } = await admin
    .from('kindra_reports')
    .select('id, deposit_confirmed, toss_payment_key')
    .eq('intake_id', intakeId)

  if (error) {
    console.error(`[cleanup] intake ${intakeId} reports 조회 실패:`, error.message)
    return true
  }

  for (const r of (reps ?? []) as ReportPayRow[]) {
    if (r.deposit_confirmed === true) return true
    if (typeof r.toss_payment_key === 'string' && r.toss_payment_key.trim().length > 0) return true
  }
  return false
}

/**
 * 미결제 intake 만료 정리 (Storage → 리포트 → intake).
 * 환경:`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, 선택 `CLEANUP_EXPIRY_HOURS`(기본 72).
 */
export async function runCleanupExpiredIntakes(opts: { dryRun: boolean }): Promise<CleanupExpiredIntakesResult> {
  const { dryRun } = opts
  const expiryHours = hoursExpiry()
  const admin = createCleanupAdminClient()

  const cutoffMs = Date.now() - expiryHours * 60 * 60 * 1000
  const cutoffIso = new Date(cutoffMs).toISOString()

  const { data: candidates, error: qErr } = await admin
    .from('kindra_intakes')
    .select('id, created_at, drawing_paths, payment_confirmed_at')
    .is('payment_confirmed_at', null)
    .lt('created_at', cutoffIso)

  if (qErr) {
    console.error('[cleanup] 만료 후보 조회 실패:', qErr.message)
    throw new Error(qErr.message)
  }

  const rows = (candidates ?? []) as IntakeRow[]

  const toProcess: IntakeRow[] = []
  const skippedPaid: string[] = []

  for (const row of rows) {
    const blocked = await reportsBlockDeletion(admin, row.id)
    if (blocked) skippedPaid.push(row.id)
    else toProcess.push(row)
  }

  console.log(
    `[cleanup] 만료 후보: ${rows.length}건 (payment_confirmed_at IS NULL, created_at < ${cutoffIso}), 결제 징후로 제외: ${skippedPaid.length}건, 삭제 대상: ${toProcess.length}건${dryRun ? ' [DRY-RUN]' : ''}`,
  )

  const base: CleanupExpiredIntakesResult = {
    dryRun,
    expiryHours,
    cutoffIso,
    candidateCount: rows.length,
    skippedPaidCount: skippedPaid.length,
    deleteTargetCount: toProcess.length,
    deletedIntakes: 0,
    deletedReports: 0,
    removedFiles: 0,
  }

  if (dryRun) {
    for (const r of toProcess) {
      const paths = normalizeDrawingPaths(r.drawing_paths)
      console.log(`  [dry-run] intake ${r.id} · created ${r.created_at} · storage 파일 ${paths.length}개`)
      const { data: repIds } = await admin.from('kindra_reports').select('id').eq('intake_id', r.id)
      const n = repIds?.length ?? 0
      console.log(`            연결된 리포트 ${n}건`)
    }
    console.log(
      `\n총 ${toProcess.length}개의 만료된 데이터와 관련 파일이 삭제 대상입니다(실제 삭제는 수행하지 않았습니다).`,
    )
    return base
  }

  let deletedIntakes = 0
  let deletedReports = 0
  let removedFiles = 0

  for (const intake of toProcess) {
    const paths = normalizeDrawingPaths(intake.drawing_paths)
    if (paths.length > 0) {
      const { error: stErr } = await admin.storage.from(STORAGE_BUCKET).remove(paths)
      if (stErr) {
        console.error(`[cleanup] intake ${intake.id} Storage 삭제 경고:`, stErr.message)
      } else {
        removedFiles += paths.length
      }
    }

    const { data: reportRows, error: rErr } = await admin.from('kindra_reports').select('id').eq('intake_id', intake.id)
    if (rErr) {
      console.error(`[cleanup] intake ${intake.id} 리포트 목록 실패 — intake 삭제 건너뜀:`, rErr.message)
      continue
    }

    const reportIds = (reportRows ?? []).map((x: { id: string }) => x.id)
    if (reportIds.length > 0) {
      const { error: delRepErr } = await admin.from('kindra_reports').delete().in('id', reportIds)
      if (delRepErr) {
        console.error(`[cleanup] 리포트 삭제 실패 intake ${intake.id}:`, delRepErr.message)
        continue
      }
      deletedReports += reportIds.length
    }

    const { error: delInErr } = await admin.from('kindra_intakes').delete().eq('id', intake.id)
    if (delInErr) {
      console.error(`[cleanup] intake 삭제 실패 ${intake.id}:`, delInErr.message)
      continue
    }
    deletedIntakes += 1
  }

  console.log(
    `[cleanup] 완료: intake ${deletedIntakes}건 삭제, 리포트 ${deletedReports}건 삭제, Storage 객체 ${removedFiles}개 제거.`,
  )
  console.log(`총 ${deletedIntakes}개의 만료된 데이터와 관련 파일을 삭제했습니다.`)

  return {
    ...base,
    deletedIntakes,
    deletedReports,
    removedFiles,
  }
}
