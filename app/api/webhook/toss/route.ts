import { after } from 'next/server'

import { claimTossWebhookEvent } from '@lib/payment/toss-webhook-claim.server'
import { processTossWebhookPayload, type TossWebhookPayload } from '@lib/payment/toss-webhook-process.server'

export const runtime = 'nodejs'

/** POST 전용 — 다른 메서드는 405 */
export async function POST(req: Request) {
  const tokenEnv = process.env.TOSS_WEBHOOK_URL_TOKEN?.trim()
  if (tokenEnv) {
    const url = new URL(req.url)
    if (url.searchParams.get('token') !== tokenEnv) {
      return new Response('Forbidden', { status: 403 })
    }
  }

  const transmissionId = req.headers.get('tosspayments-webhook-transmission-id')?.trim()
  if (!transmissionId) {
    return Response.json({ error: 'missing tosspayments-webhook-transmission-id' }, { status: 400 })
  }

  let rawText: string
  try {
    rawText = await req.text()
  } catch {
    return Response.json({ error: 'empty body' }, { status: 400 })
  }

  let body: TossWebhookPayload
  try {
    body = JSON.parse(rawText) as TossWebhookPayload
  } catch {
    return Response.json({ error: 'invalid json' }, { status: 400 })
  }

  const eventType = typeof body.eventType === 'string' ? body.eventType : ''
  const data = body.data
  const paymentKey =
    data && typeof data.paymentKey === 'string'
      ? data.paymentKey
      : data?.payment && typeof (data.payment as { paymentKey?: string }).paymentKey === 'string'
        ? (data.payment as { paymentKey: string }).paymentKey
        : null
  const orderId = data && typeof data.orderId === 'string' ? data.orderId : null

  const claimed = await claimTossWebhookEvent({
    transmissionId,
    eventType,
    paymentKey,
    orderId,
  })

  if (!claimed) {
    return Response.json({ ok: true, duplicate: true })
  }

  after(async () => {
    await processTossWebhookPayload(body).catch((e) =>
      console.error('[kindra:toss-webhook] process failed:', e),
    )
  })

  return Response.json({ ok: true })
}

export async function GET() {
  return new Response('Method Not Allowed', { status: 405 })
}
