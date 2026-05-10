/**
 * 미결제 신청(intake) 만료 정리 — 결제 확정 없이 72시간(기본) 경과 시
 * Storage 원본 그림 → 관련 kindra_reports → kindra_intakes 순 삭제.
 *
 * 선행: Supabase 마이그레이션 적용(`payment_confirmed_at` 등).
 * 실행(로컬): `.env.local` 에 NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 *
 *   npx tsx scripts/cleanup-expired-intakes.ts
 *   npx tsx scripts/cleanup-expired-intakes.ts --dry-run
 *
 * 만료 시간 변경: CLEANUP_EXPIRY_HOURS=168 npx tsx ...
 */

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { createClient } from '@supabase/supabase-js'

const STORAGE_BUCKET = 'intake-drawings'

function loadEnvLocal(): void {
  const p = resolve(process.cwd(), '.env.local')
  if (!existsSync(p)) return
  for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i === -1) continue
    const key = t.slice(0, i).trim()
    let val = t.slice(i + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (process.env[key] === undefined) process.env[key] = val
  }
}

function parseArgs(): { dryRun: boolean } {
  const dryRun = process.argv.includes('--dry-run') || process.argv.includes('-n')
  return { dryRun }
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

function createAdminClient() {
  loadEnvLocal()
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

async function reportsBlockDeletion(admin: ReturnType<typeof createAdminClient>, intakeId: string): Promise<boolean> {
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

async function main(): Promise<void> {
  const { dryRun } = parseArgs()
  const expiryHours = hoursExpiry()
  const admin = createAdminClient()

  const cutoffMs = Date.now() - expiryHours * 60 * 60 * 1000
  const cutoffIso = new Date(cutoffMs).toISOString()

  const { data: candidates, error: qErr } = await admin
    .from('kindra_intakes')
    .select('id, created_at, drawing_paths, payment_confirmed_at')
    .is('payment_confirmed_at', null)
    .lt('created_at', cutoffIso)

  if (qErr) {
    console.error('[cleanup] 만료 후보 조회 실패:', qErr.message)
    process.exit(1)
  }

  const rows = (candidates ?? []) as IntakeRow[]

  /** 결제로 간주되는 리포트가 있으면 스킵(무통장 입금 확인·카드 결제 등). */
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
    return
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
}

main().catch((e) => {
  console.error('[cleanup] 치명적 오류:', e)
  process.exit(1)
})
