import 'server-only'

import { getTossSecretKey } from '@lib/payment/toss-secret.server'

/** GET /v1/payments/{paymentKey} — 웹훅 검증·동기화용 */
export async function fetchTossPaymentByPaymentKey(paymentKey: string): Promise<Record<string, unknown> | null> {
  const secretKey = getTossSecretKey()
  if (!secretKey || !paymentKey) return null

  const encoded = Buffer.from(`${secretKey}:`, 'utf8').toString('base64')

  const res = await fetch(`https://api.tosspayments.com/v1/payments/${encodeURIComponent(paymentKey)}`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${encoded}`,
    },
  })

  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (!res.ok) return null
  return body
}
