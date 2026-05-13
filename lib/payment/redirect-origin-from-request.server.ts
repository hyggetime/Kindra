import 'server-only'

/**
 * 토스 `successUrl` / `failUrl` 에 넣을 origin.
 * 클라이언트의 `window.location.origin` 은 adb reverse·북마크 등으로 `localhost` 가 되기 쉬워,
 * **같은 TCP 연결로 들어온** `POST /api/payments/toss/prepare` 의 URL·프록시 헤더를 우선합니다.
 */
export function getRedirectOriginForTossCallbacks(req: Request): string {
  const fromEnv = process.env.NEXT_PUBLIC_PAYMENT_REDIRECT_ORIGIN?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, '')

  const protoRaw = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim()
  const hostRaw = req.headers.get('x-forwarded-host')?.split(',')[0]?.trim()
  if (protoRaw && hostRaw) {
    const p = protoRaw === 'https' ? 'https' : 'http'
    return `${p}://${hostRaw}`
  }

  try {
    return new URL(req.url).origin
  } catch {
    return ''
  }
}
