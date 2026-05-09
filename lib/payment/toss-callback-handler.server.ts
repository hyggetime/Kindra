import 'server-only'

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { confirmTossWidgetPayment } from '@lib/payment/toss-confirm-payment.server'
import { deleteTossCheckoutSession, loadTossCheckoutSession } from '@lib/payment/toss-checkout-session.server'
import { decodeCheckoutCookie, isCheckoutExpired } from '@lib/payment/toss-checkout-token.server'
import { attachTossPaymentKeyToReport } from '@lib/payment/toss-record-payment.server'

const CHECKOUT_COOKIE = 'kindra_toss_checkout'

const RESULT_PATH = '/apply/payment/toss/result'

function resultUrl(origin: string, status: string, extra?: Record<string, string>) {
  const u = new URL(RESULT_PATH, origin)
  u.searchParams.set('status', status)
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v) u.searchParams.set(k, v)
    }
  }
  return u.toString()
}

const DETAIL_MAX = 1200

/**
 * 토스 성공 리디렉트(GET). 쿠키 삭제는 Route Handler 에서만 허용(Next.js 15).
 */
export async function handleTossPaymentCallbackGet(request: Request): Promise<NextResponse> {
  const reqUrl = new URL(request.url)
  const origin = reqUrl.origin

  const paymentKey = reqUrl.searchParams.get('paymentKey')?.trim() ?? ''
  const orderId = reqUrl.searchParams.get('orderId')?.trim() ?? ''
  const amountRaw = reqUrl.searchParams.get('amount') ?? ''
  const amount = Number(amountRaw)

  if (!paymentKey || !orderId || !Number.isFinite(amount) || amount < 0) {
    return NextResponse.redirect(resultUrl(origin, 'invalid_query'), 302)
  }

  const jar = await cookies()
  const raw = jar.get(CHECKOUT_COOKIE)?.value
  const fromCookie = raw ? decodeCheckoutCookie(raw) : null
  const checkoutMatchesCookie =
    fromCookie !== null && fromCookie.orderId === orderId && fromCookie.amount === amount
  const checkout = checkoutMatchesCookie ? fromCookie : await loadTossCheckoutSession(orderId, amount)

  if (!checkout) {
    return NextResponse.redirect(resultUrl(origin, 'mismatch'), 302)
  }

  if (isCheckoutExpired(checkout.exp)) {
    jar.delete(CHECKOUT_COOKIE)
    await deleteTossCheckoutSession(orderId)
    return NextResponse.redirect(resultUrl(origin, 'expired'), 302)
  }

  try {
    await confirmTossWidgetPayment({ paymentKey, orderId, amount })
  } catch (e) {
    const msg = e instanceof Error ? e.message : '결제 승인에 실패했습니다.'
    const detail = msg.length > DETAIL_MAX ? `${msg.slice(0, DETAIL_MAX)}…` : msg
    return NextResponse.redirect(resultUrl(origin, 'confirm_failed', { detail }), 302)
  }

  jar.delete(CHECKOUT_COOKIE)
  await deleteTossCheckoutSession(orderId)
  await attachTossPaymentKeyToReport(checkout.reportId, paymentKey, {
    couponCode: checkout.couponCode,
    chargedAmountWon: amount,
  })

  return NextResponse.redirect(resultUrl(origin, 'success'), 302)
}
