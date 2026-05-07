import 'server-only'

import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'

import { getTossSecretKey } from '@lib/payment/toss-secret.server'

/** 무통장 입금자명 저장 등 — 신청 직후 같은 브라우저에서만 쓰는 리포트 식별 쿠키 */
export const REPORT_ACCESS_COOKIE = 'kindra_report_access'

const PREFIX = 'ra1.'
const MAX_AGE_SEC = 60 * 60 * 24 * 14

export type ReportAccessPayload = {
  reportId: string
  exp: number
}

function getSigningSecret(): string {
  const s =
    process.env.REPORT_ACCESS_SIGNING_SECRET?.trim() ||
    process.env.TOSS_CHECKOUT_SIGNING_SECRET?.trim() ||
    getTossSecretKey()
  if (!s) {
    throw new Error('REPORT_ACCESS_SIGNING_SECRET 또는 TOSS_SECRET_KEY(또는 TOSS_CHECKOUT_SIGNING_SECRET)가 필요합니다.')
  }
  return s
}

function normalizeReportId(id: string): string {
  return id.trim().toLowerCase()
}

export function encodeReportAccessCookieValue(reportId: string): string {
  const id = normalizeReportId(reportId)
  const exp = Date.now() + MAX_AGE_SEC * 1000
  const payload: ReportAccessPayload = { reportId: id, exp }
  const secret = getSigningSecret()
  const json = JSON.stringify(payload)
  const body = Buffer.from(json, 'utf8')
  const sig = createHmac('sha256', secret).update(body).digest('base64url')
  return `${PREFIX}${body.toString('base64url')}.${sig}`
}

export function decodeReportAccessCookie(cookieValue: string): ReportAccessPayload | null {
  let secret: string
  try {
    secret = getSigningSecret()
  } catch {
    return null
  }
  if (!cookieValue.startsWith(PREFIX)) return null
  const rest = cookieValue.slice(PREFIX.length)
  const dot = rest.lastIndexOf('.')
  if (dot <= 0) return null
  const bodyB64 = rest.slice(0, dot)
  const sig = rest.slice(dot + 1)
  const body = Buffer.from(bodyB64, 'base64url')
  const expected = createHmac('sha256', secret).update(body).digest('base64url')
  const sigBuf = Buffer.from(sig, 'utf8')
  const expBuf = Buffer.from(expected, 'utf8')
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null
  try {
    const parsed = JSON.parse(body.toString('utf8')) as ReportAccessPayload
    if (typeof parsed.reportId !== 'string' || typeof parsed.exp !== 'number') return null
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(parsed.reportId)) {
      return null
    }
    return { reportId: normalizeReportId(parsed.reportId), exp: parsed.exp }
  } catch {
    return null
  }
}

export function isReportAccessExpired(payload: ReportAccessPayload): boolean {
  return Date.now() > payload.exp
}

/** 신청 성공 직후 서버 액션에서 호출 — 같은 브라우저에서 무통장 입금자명 저장 허용 */
export async function setReportAccessCookie(reportId: string): Promise<void> {
  const value = encodeReportAccessCookieValue(reportId)
  const jar = await cookies()
  jar.set(REPORT_ACCESS_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SEC,
  })
}
