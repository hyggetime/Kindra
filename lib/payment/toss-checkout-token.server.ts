import 'server-only'

import { createHmac, timingSafeEqual } from 'crypto'

import type { PriceTier } from '@lib/constants'

export type TossCheckoutPayload = {
  orderId: string
  amount: number
  exp: number
  tier: PriceTier
  reportId: string | null
}

const PREFIX = 'v1.'

function getSigningSecret(): string {
  const s = process.env.TOSS_CHECKOUT_SIGNING_SECRET?.trim() || process.env.TOSS_WIDGET_SECRET_KEY?.trim()
  if (!s) throw new Error('TOSS_WIDGET_SECRET_KEY 또는 TOSS_CHECKOUT_SIGNING_SECRET 이 필요합니다.')
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
      !['free', 'discount', 'normal'].includes(parsed.tier)
    ) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function isCheckoutExpired(exp: number): boolean {
  return Date.now() > exp
}
