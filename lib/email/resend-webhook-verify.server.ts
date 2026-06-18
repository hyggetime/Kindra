import 'server-only'

import { createHmac, timingSafeEqual } from 'node:crypto'

const SVIX_TOLERANCE_SEC = 5 * 60

export type ResendSvixHeaders = {
  id: string
  timestamp: string
  signature: string
}

export function readResendSvixHeaders(req: Request): ResendSvixHeaders | null {
  const id = req.headers.get('svix-id')?.trim()
  const timestamp = req.headers.get('svix-timestamp')?.trim()
  const signature = req.headers.get('svix-signature')?.trim()
  if (!id || !timestamp || !signature) return null
  return { id, timestamp, signature }
}

function decodeSvixSecret(secret: string): Buffer {
  const trimmed = secret.trim()
  const raw = trimmed.startsWith('whsec_') ? trimmed.slice(6) : trimmed
  return Buffer.from(raw, 'base64')
}

function secureCompareBase64(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, 'base64')
    const bb = Buffer.from(b, 'base64')
    if (ba.length !== bb.length) return false
    return timingSafeEqual(ba, bb)
  } catch {
    return false
  }
}

/**
 * Resend(Svix) 웹훅 서명 검증 — 반드시 raw body 문자열을 사용하세요.
 * @see https://resend.com/docs/webhooks/verify-webhooks-requests
 */
export function verifyResendWebhookPayload(secret: string, rawBody: string, headers: ResendSvixHeaders): boolean {
  const ts = Number(headers.timestamp)
  if (!Number.isFinite(ts)) return false
  const nowSec = Math.floor(Date.now() / 1000)
  if (Math.abs(nowSec - ts) > SVIX_TOLERANCE_SEC) return false

  const key = decodeSvixSecret(secret)
  const signed = `${headers.id}.${headers.timestamp}.${rawBody}`
  const expected = createHmac('sha256', key).update(signed, 'utf8').digest('base64')

  for (const part of headers.signature.split(' ')) {
    const comma = part.indexOf(',')
    if (comma <= 0) continue
    const version = part.slice(0, comma)
    const sig = part.slice(comma + 1)
    if (version === 'v1' && sig && secureCompareBase64(sig, expected)) {
      return true
    }
  }
  return false
}
