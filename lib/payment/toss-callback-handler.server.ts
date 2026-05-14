import 'server-only'

import { cookies } from 'next/headers'
import { after } from 'next/server'
import { NextResponse } from 'next/server'

import { confirmTossWidgetPayment } from '@lib/payment/toss-confirm-payment.server'
import { deleteTossCheckoutSession, loadTossCheckoutSession } from '@lib/payment/toss-checkout-session.server'
import { decodeCheckoutCookie, isCheckoutExpired } from '@lib/payment/toss-checkout-token.server'
import { recordCouponRedemptionAfterPayment } from '@lib/payment/coupon-campaigns.server'
import { attachTossPaymentKeyToReport } from '@lib/payment/toss-record-payment.server'
import { triggerAiAnalysis } from '@lib/intake/trigger-ai-analysis.server'
import { createServiceRoleClient } from '@lib/supabase/admin'

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

  /** 결제 키를 먼저 저장해야 웹훅이 `toss_payment_key` 로 행을 찾을 수 있음. 세션 삭제는 그 뒤에. */
  await attachTossPaymentKeyToReport(checkout.reportId, paymentKey, {
    couponCode: checkout.couponCode,
    chargedAmountWon: amount,
  })
  await recordCouponRedemptionAfterPayment(checkout.reportId, checkout.couponCode, 'toss')
  jar.delete(CHECKOUT_COOKIE)
  await deleteTossCheckoutSession(orderId)

  try {
    const admin = createServiceRoleClient()
    const { data: rep } = await admin.from('kindra_reports').select('intake_id').eq('id', checkout.reportId).maybeSingle()
    const intakeId =
      rep && typeof (rep as { intake_id?: string | null }).intake_id === 'string'
        ? (rep as { intake_id: string }).intake_id
        : null
    if (intakeId) {
      /** Vercel 등은 응답(302) 후 람다가 바로 종료될 수 있어 `void` 백그라운드는 끊길 수 있음 — `after` 로 연장 */
      after(async () => {
        try {
          const r = await triggerAiAnalysis(intakeId)
          if (!r.ok) console.warn('[kindra:toss-callback] triggerAiAnalysis', r.message)
          else if (r.skipped) console.info('[kindra:toss-callback] triggerAiAnalysis skipped', r.reason ?? '')
        } catch (e) {
          console.warn('[kindra:toss-callback] triggerAiAnalysis threw', e)
        }
      })
    }
  } catch (e) {
    console.warn('[kindra:toss-callback] triggerAiAnalysis dispatch', e)
  }

  return NextResponse.redirect(resultUrl(origin, 'success'), 302)
}
