import 'server-only'

import { getTossSecretKey } from '@lib/payment/toss-secret.server'

/** POST /v1/payments/confirm — API 개별 연동 시크릿 키 사용 */
export async function confirmTossWidgetPayment(params: {
  paymentKey: string
  orderId: string
  amount: number
}): Promise<unknown> {
  const secretKey = getTossSecretKey()
  if (!secretKey) {
    throw new Error('TOSS_SECRET_KEY(또는 TOSS_WIDGET_SECRET_KEY)가 설정되어 있지 않습니다.')
  }

  const encoded = Buffer.from(`${secretKey}:`, 'utf8').toString('base64')

  const res = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${encoded}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      paymentKey: params.paymentKey,
      orderId: params.orderId,
      amount: params.amount,
    }),
  })

  const body = (await res.json().catch(() => ({}))) as { message?: string; code?: string }

  if (!res.ok) {
    const msg = typeof body.message === 'string' ? body.message : '결제 승인에 실패했습니다.'
    throw new Error(msg)
  }

  return body
}
