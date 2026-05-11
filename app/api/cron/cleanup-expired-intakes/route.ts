import { NextResponse } from 'next/server'

import { runCleanupExpiredIntakes } from '@lib/jobs/cleanup-expired-intakes-core'

/** Vercel Cron 등 장시간 작업용 (플랜에 따라 상한 조정) */
export const maxDuration = 300

export const dynamic = 'force-dynamic'

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret) return false
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${secret}`
}

/**
 * GitHub Actions 와 중복 스케줄 시 같은 작업이 두 번 도는 것은 부담된다면 Cron 한쪽만 켜 두세요.
 */
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const result = await runCleanupExpiredIntakes({ dryRun: false })
    return NextResponse.json({ ok: true, result })
  } catch (e) {
    console.error('[cron/cleanup-expired-intakes]', e)
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
