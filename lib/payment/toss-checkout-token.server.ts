import 'server-only'

import { createHmac, timingSafeEqual } from 'crypto'

import { getTossSecretKey } from '@lib/payment/toss-secret.server'

export type TossCheckoutPayload = {
  orderId: string
  amount: number
  exp: number
  /** 신청 리포트 UUID */
  reportId: string | null
  /** 결제 시점 청구 기준가(원) 스냅샷 */
  listedPriceWon: number
  /** 적용 쿠폰(대문자) 또는 없음 */
  couponCode: string | null
}

const PREFIX = 'v1.'

function getSigningSecret(): string {
  const s = process.env.TOSS_CHECKOUT_SIGNING_SECRET?.trim() || getTossSecretKey()
  if (!s) throw new Error('TOSS_SECRET_KEY(또는 TOSS_WIDGET_SECRET_KEY) 또는 TOSS_CHECKOUT_SIGNING_SECRET 이 필요합니다.')
  return s
}

/** HTTP-only 쿠키에 넣을 서명 문자열 */
export function encodeCheckoutCookie(payload: TossCheckoutPayload): string {
  const secret = getSigningSecret()
  const json = JSON.stringify(payload)
  const body = Buffer.from(json, 'utf8')
  const sig = createHmac('sha256', secret).update(body).digest('base64url')
  return `${PREFIX}${body.toString('base64url')}.${sig}`
}

export function decodeCheckoutCookie(cookieValue: string): TossCheckoutPayload | null {
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
    const parsed = JSON.parse(body.toString('utf8')) as TossCheckoutPayload
    if (
      typeof parsed.orderId !== 'string' ||
      typeof parsed.amount !== 'number' ||
      typeof parsed.exp !== 'number' ||
      typeof parsed.listedPriceWon !== 'number'
    ) {
      return null
    }
    if (parsed.couponCode !== null && typeof parsed.couponCode !== 'string') return null
    return parsed
  } catch {
    return null
  }
}

export function isCheckoutExpired(exp: number): boolean {
  return Date.now() > exp
}
