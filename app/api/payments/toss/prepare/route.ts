import { randomUUID } from 'crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { resolveCheckoutCouponAsync } from '@lib/payment/coupon-campaigns.server'
import { getRedirectOriginForTossCallbacks } from '@lib/payment/redirect-origin-from-request.server'
import { saveTossCheckoutSession } from '@lib/payment/toss-checkout-session.server'
import { encodeCheckoutCookie, type TossCheckoutPayload } from '@lib/payment/toss-checkout-token.server'
import { getListedPriceWonForReport } from '@lib/payment/report-checkout.server'
import { warnIfClientSentChannel } from '@lib/reports/resolve-report-channel.server'

export const runtime = 'nodejs'

const COOKIE = 'kindra_toss_checkout'
const MAX_AGE = 30 * 60

type Body = {
  reportId?: string | null
  couponCode?: string | null
}

export async function POST(req: Request) {
  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  warnIfClientSentChannel(body, 'payments/toss/prepare')

  const reportRaw = body.reportId
  const reportId =
    typeof reportRaw === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(reportRaw.trim())
      ? reportRaw.trim().toLowerCase()
      : null

  const listedPriceWon = await getListedPriceWonForReport(reportId)
  const couponRaw = typeof body.couponCode === 'string' ? body.couponCode : ''
  const resolved = await resolveCheckoutCouponAsync(listedPriceWon, couponRaw, reportId)

  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.message }, { status: 400 })
  }

  const amount = resolved.amountWon
  const orderId = `kr_${randomUUID().replace(/-/g, '')}`
  const exp = Date.now() + MAX_AGE * 1000

  const payloadClean: TossCheckoutPayload = {
    orderId,
    amount,
    exp,
    reportId,
    listedPriceWon,
    couponCode: resolved.couponNormalized,
  }

  let cookieValue: string
  try {
    cookieValue = encodeCheckoutCookie(payloadClean)
  } catch {
    return NextResponse.json(
      { error: '서버에 TOSS_SECRET_KEY(또는 TOSS_WIDGET_SECRET_KEY/TOSS_CHECKOUT_SIGNING_SECRET)가 설정되어 있지 않아요.' },
      { status: 503 },
    )
  }

  const saved = await saveTossCheckoutSession(payloadClean)
  if (!saved.ok) {
    return NextResponse.json(
      { error: '결제 준비 정보를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.' },
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

  const orderName = '킨드라 아이 그림 심리 관찰 리포트'
  const redirectOrigin = getRedirectOriginForTossCallbacks(req)

  return NextResponse.json({
    orderId,
    amount,
    orderName,
    redirectOrigin,
  })
}
