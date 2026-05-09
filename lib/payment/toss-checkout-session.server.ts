import 'server-only'

import { createServiceRoleClient } from '@lib/supabase/admin'
import type { TossCheckoutPayload } from '@lib/payment/toss-checkout-token.server'

type Row = {
  order_id: string
  report_id: string | null
  amount: number
  listed_price_won: number
  coupon_code: string | null
  expires_at: string
}

export async function saveTossCheckoutSession(payload: TossCheckoutPayload): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const admin = createServiceRoleClient()
    const { error } = await admin.from('kindra_toss_checkout_sessions').insert({
      order_id: payload.orderId,
      report_id: payload.reportId,
      amount: payload.amount,
      listed_price_won: payload.listedPriceWon,
      coupon_code: payload.couponCode,
      expires_at: new Date(payload.exp).toISOString(),
    })
    if (error) {
      console.error('[kindra:toss] checkout session insert:', error.message)
      return { ok: false, message: error.message }
    }
    return { ok: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[kindra:toss] checkout session insert:', msg)
    return { ok: false, message: msg }
  }
}

/** URL의 orderId·amount와 일치하는 행을 조회해 쿠키와 동일한 페이로드로 복원합니다. */
export async function loadTossCheckoutSession(
  orderId: string,
  urlAmount: number,
): Promise<TossCheckoutPayload | null> {
  try {
    const admin = createServiceRoleClient()
    const { data, error } = await admin
      .from('kindra_toss_checkout_sessions')
      .select('order_id, report_id, amount, listed_price_won, coupon_code, expires_at')
      .eq('order_id', orderId)
      .maybeSingle()

    if (error || !data) return null
    const row = data as Row
    if (row.amount !== urlAmount) return null
    const expMs = new Date(row.expires_at).getTime()
    if (!Number.isFinite(expMs) || Date.now() > expMs) return null

    return {
      orderId: row.order_id,
      amount: row.amount,
      exp: expMs,
      reportId: row.report_id,
      listedPriceWon: row.listed_price_won,
      couponCode: row.coupon_code,
    }
  } catch {
    return null
  }
}

export async function deleteTossCheckoutSession(orderId: string): Promise<void> {
  try {
    const admin = createServiceRoleClient()
    await admin.from('kindra_toss_checkout_sessions').delete().eq('order_id', orderId)
  } catch {
    /* ignore */
  }
}
