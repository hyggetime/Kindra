import { after } from 'next/server'

import { claimResendWebhookEvent } from '@lib/email/resend-webhook-claim.server'
import {
  peekReportIdForResendPayload,
  processResendWebhookPayload,
  type ResendWebhookPayload,
} from '@lib/email/resend-webhook-process.server'
import { readResendSvixHeaders, verifyResendWebhookPayload } from '@lib/email/resend-webhook-verify.server'

export const runtime = 'nodejs'

function resendWebhookSecret(): string | null {
  const s = process.env.RESEND_WEBHOOK_SECRET?.trim()
  return s || null
}

export async function POST(req: Request) {
  const secret = resendWebhookSecret()
  if (!secret) {
    console.error('[kindra:resend-webhook] RESEND_WEBHOOK_SECRET not configured')
    return Response.json({ error: 'webhook not configured' }, { status: 503 })
  }

  const svix = readResendSvixHeaders(req)
  if (!svix) {
    return Response.json({ error: 'missing svix headers' }, { status: 400 })
  }

  let rawText: string
  try {
    rawText = await req.text()
  } catch {
    return Response.json({ error: 'empty body' }, { status: 400 })
  }

  if (!verifyResendWebhookPayload(secret, rawText, svix)) {
    return Response.json({ error: 'invalid signature' }, { status: 401 })
  }

  let payload: ResendWebhookPayload
  try {
    payload = JSON.parse(rawText) as ResendWebhookPayload
  } catch {
    return Response.json({ error: 'invalid json' }, { status: 400 })
  }

  const eventType = typeof payload.type === 'string' ? payload.type : ''
  const emailId =
    payload.data && typeof payload.data.email_id === 'string' ? payload.data.email_id.trim() : null
  const reportId = await peekReportIdForResendPayload(payload)

  const claimed = await claimResendWebhookEvent({
    svixId: svix.id,
    eventType,
    resendEmailId: emailId,
    reportId,
  })

  if (!claimed) {
    return Response.json({ ok: true, duplicate: true })
  }

  after(async () => {
    await processResendWebhookPayload(payload).catch((e) =>
      console.error('[kindra:resend-webhook] process failed:', e),
    )
  })

  return Response.json({ ok: true })
}

export async function GET() {
  return new Response('Method Not Allowed', { status: 405 })
}
