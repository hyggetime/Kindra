/**
 * 토스 `successUrl` / `failUrl` 등 **브라우저로 돌아오는 리다이렉트**의 기준 origin.
 *
 * 모바일에서 PC의 `next dev` 를 열 때 `http://localhost:3000` 대신 `http://192.168.x.x:3000`
 * 처럼 LAN 주소를 써야 하는데, 실수로 localhost 로 접속하면 결제 완료 후에도 토스가
 * `localhost` 로 돌려보내서 **폰의 localhost**(존재하지 않음)로 연결 시도 → ERR_CONNECTION_REFUSED.
 *
 * 로컬에서 폰 테스트 시 `.env.local` 에 실제 접속 주소를 넣어 덮어쓸 수 있음:
 * `NEXT_PUBLIC_PAYMENT_REDIRECT_ORIGIN=http://192.168.0.12:3000`
 *
 * 비우면 `window.location.origin` (현재 주소창 기준).
 */
export function getPaymentRedirectOrigin(): string {
  const override = process.env.NEXT_PUBLIC_PAYMENT_REDIRECT_ORIGIN?.trim()
  if (override) return override.replace(/\/$/, '')
  if (typeof window !== 'undefined') return window.location.origin
  return ''
}
