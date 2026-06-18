import 'server-only'

import { createHash, timingSafeEqual } from 'node:crypto'

/** SHA-256 다이제스트 timing-safe 비교 (원문 길이 누출 완화). */
export function constantTimeEqualToken(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a, 'utf8').digest()
  const hb = createHash('sha256').update(b, 'utf8').digest()
  return ha.length === hb.length && timingSafeEqual(ha, hb)
}

export function bearerTokenFromHeaders(headers: Headers): string | null {
  const raw = headers.get('authorization')?.trim()
  if (!raw) return null
  const m = /^Bearer\s+(.+)$/i.exec(raw)
  if (!m) return null
  return m[1]!.trim() || null
}

/** 설치형(데스크톱) 클라이언트 — `KINDRA_DESKTOP_API_SECRET` */
export function desktopApiSecret(): string | undefined {
  const s = process.env.KINDRA_DESKTOP_API_SECRET?.trim()
  return s || undefined
}

/** 토스 미니앱 등 — `KINDRA_MINIAPP_SHARED_SECRET` */
export function miniappSharedSecret(): string | undefined {
  const s = process.env.KINDRA_MINIAPP_SHARED_SECRET?.trim()
  return s || undefined
}

function headerToken(headers: Headers, name: string): string | null {
  const v = headers.get(name)?.trim()
  return v || null
}

export function isDesktopClientAuthorized(headers: Headers): boolean {
  const secret = desktopApiSecret()
  if (!secret) return false
  const bearer = bearerTokenFromHeaders(headers)
  const headerTokenRaw = headerToken(headers, 'x-kindra-desktop-token')
  const candidate = bearer ?? headerTokenRaw
  if (!candidate) return false
  return constantTimeEqualToken(candidate, secret)
}

export function isMiniappClientAuthorized(headers: Headers): boolean {
  const secret = miniappSharedSecret()
  if (!secret) return false
  const bearer = bearerTokenFromHeaders(headers)
  if (!bearer) return false
  return constantTimeEqualToken(bearer, secret)
}
