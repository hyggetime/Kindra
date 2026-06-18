import 'server-only'

import { fetchTossPaymentByPaymentKey } from '@lib/payment/toss-fetch-payment.server'
import { getTossSecretKey } from '@lib/payment/toss-secret.server'

/** 프리미엄 미니앱 결제 스펙 — `useKindraPayment` 와 동일 금액이어야 승인됩니다. */
export const KINDRA_PREMIUM_PAYMENT_AMOUNT_WON = 5000

const TOSS_CONFIRM_URL = 'https://api.tosspayments.com/v1/payments/confirm'

function tossBasicAuthHeader(): string | null {
  const secretKey = getTossSecretKey()
  if (!secretKey) return null
  return `Basic ${Buffer.from(`${secretKey}:`, 'utf8').toString('base64')}`
}

function paymentRecordMatches(
  remote: Record<string, unknown>,
  expected: { orderId: string; amount: number },
): boolean {
  if (remote.status !== 'DONE') return false
  if (typeof remote.orderId !== 'string' || remote.orderId !== expected.orderId) return false
  const total =
    typeof remote.totalAmount === 'number'
      ? remote.totalAmount
      : typeof remote.totalAmount === 'string'
        ? Number(remote.totalAmount)
        : NaN
  if (!Number.isFinite(total)) return false
  return Math.floor(total) === Math.floor(expected.amount)
}

/**
 * 토스 결제 영수증 검증: 우선 승인(confirm) API, 이미 승인된 건은 GET 으로 재검증.
 * 성공 시에만 `ok: true` — 그 외는 AI 호출 전에 차단합니다.
 */
export async function verifyTossPremiumPaymentReceipt(params: {
  paymentKey: string
  orderId: string
  amount: number
}): Promise<{ ok: true } | { ok: false; status: 400 | 403 | 500; message: string; code?: string }> {
  const paymentKey = params.paymentKey?.trim()
  const orderId = params.orderId?.trim()
  if (!paymentKey || !orderId) {
    return { ok: false, status: 400, message: 'paymentKey 또는 orderId 가 비어 있습니다.' }
  }
  if (!Number.isFinite(params.amount) || params.amount <= 0) {
    return { ok: false, status: 400, message: 'amount 가 올바르지 않습니다.' }
  }
  const amountInt = Math.floor(params.amount)
  if (amountInt !== KINDRA_PREMIUM_PAYMENT_AMOUNT_WON) {
    return {
      ok: false,
      status: 400,
      message: `프리미엄 상품 결제 금액은 ${KINDRA_PREMIUM_PAYMENT_AMOUNT_WON}원이어야 합니다.`,
    }
  }

  const auth = tossBasicAuthHeader()
  if (!auth) {
    return {
      ok: false,
      status: 500,
      message: '서버에 TOSS_SECRET_KEY(또는 TOSS_WIDGET_SECRET_KEY)가 설정되어 있지 않습니다.',
    }
  }

  const res = await fetch(TOSS_CONFIRM_URL, {
    method: 'POST',
    headers: {
      Authorization: auth,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      paymentKey,
      orderId,
      amount: amountInt,
    }),
  })

  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>

  if (res.ok) {
    if (paymentRecordMatches(body, { orderId, amount: amountInt })) {
      return { ok: true }
    }
    return {
      ok: false,
      status: 403,
      message: '결제 응답이 완료(DONE) 상태가 아니거나 주문·금액이 일치하지 않습니다.',
    }
  }

  const code = typeof body.code === 'string' ? body.code : ''
  const message = typeof body.message === 'string' ? body.message : '결제 검증에 실패했습니다.'

  const alreadyProcessed =
    code === 'ALREADY_PROCESSED_PAYMENT' ||
    code === 'DUPLICATED_ORDER_ID' ||
    /이미.*(처리|승인|완료)/i.test(message) ||
    /already/i.test(message)

  if (alreadyProcessed) {
    const remote = await fetchTossPaymentByPaymentKey(paymentKey)
    if (remote && paymentRecordMatches(remote, { orderId, amount: amountInt })) {
      return { ok: true }
    }
    return {
      ok: false,
      status: 403,
      message: '이미 처리된 결제로 보이나, 주문·금액이 일치하지 않습니다.',
      code: code || undefined,
    }
  }

  const httpStatus: 400 | 403 = res.status === 401 || res.status === 403 ? 403 : 400
  return {
    ok: false,
    status: httpStatus,
    message: code ? `${message} (${code})` : message,
    code: code || undefined,
  }
}

/** @deprecated import from `@lib/auth/kindra-client-auth.server` */
export { constantTimeEqualToken } from '@lib/auth/kindra-client-auth.server'
