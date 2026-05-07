import { randomUUID } from 'crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { type PriceTier } from '@lib/constants'
import { effectiveTossChargeWonForTier } from '@lib/payment/payment-charge-override'
import { encodeCheckoutCookie, type TossCheckoutPayload } from '@lib/payment/toss-checkout-token.server'

export const runtime = 'nodejs'

const COOKIE = 'kindra_toss_checkout'
const MAX_AGE = 30 * 60

type Body = {
  tier?: string
  reportId?: string | null
}

export async function POST(req: Request) {
  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const tier = body.tier
  if (tier !== 'free' && tier !== 'discount' && tier !== 'normal') {
    return NextResponse.json({ error: '요금 구간을 알 수 없어요. 페이지를 새로고침한 뒤 다시 시도해 주세요.' }, { status: 400 })
  }

  const reportRaw = body.reportId
  const reportId =
    typeof reportRaw === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(reportRaw.trim())
      ? reportRaw.trim().toLowerCase()
      : null

  const amount = effectiveTossChargeWonForTier(tier)
  const orderId = `kr_${randomUUID().replace(/-/g, '')}`
  const exp = Date.now() + MAX_AGE * 1000

  const payload: TossCheckoutPayload = {
    orderId,
    amount,
    exp,
    tier: tier as PriceTier,
    reportId,
  }

  let cookieValue: string
  try {
    cookieValue = encodeCheckoutCookie(payload)
  } catch {
    return NextResponse.json(
      { error: '서버에 TOSS_SECRET_KEY(또는 TOSS_WIDGET_SECRET_KEY/TOSS_CHECKOUT_SIGNING_SECRET)가 설정되어 있지 않아요.' },
      { status: 503 },
    )
  }

  const cookieStore = await cookies()
  cookieStore.set(COOKIE, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  })

  const orderName =
    tier === 'free'
      ? '킨드라 아이 그림 심리 관찰 리포트 (무료 혜택·결제 확인)'
      : tier === 'discount'
        ? '킨드라 아이 그림 심리 관찰 리포트 (할인가)'
        : '킨드라 아이 그림 심리 관찰 리포트 (정상가)'

  return NextResponse.json({
    orderId,
    amount,
    orderName,
  })
}
