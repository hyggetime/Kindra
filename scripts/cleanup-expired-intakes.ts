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

import { runCleanupExpiredIntakes } from '@lib/jobs/cleanup-expired-intakes-core'

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

async function main(): Promise<void> {
  loadEnvLocal()
  const { dryRun } = parseArgs()
  await runCleanupExpiredIntakes({ dryRun })
}

main().catch((e) => {
  console.error('[cleanup] 치명적 오류:', e)
  process.exit(1)
})
