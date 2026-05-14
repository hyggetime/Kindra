/**
 * 결제 페이지에서 토스 통합결제창(카드·간편결제) UI 숨김 — `NEXT_PUBLIC_PAYMENT_HIDE_TOSS`
 * 심사 전 테스트 기간에는 사용자 혼란을 줄이기 위해 기본적으로 숨김(true).
 * 로컬에서 토스를 다시 켜려면 `.env.local` 에 `NEXT_PUBLIC_PAYMENT_HIDE_TOSS=false` 를 넣으세요.
 */
export function isPaymentHideTossWidgetEnabled(): boolean {
  const raw = process.env.NEXT_PUBLIC_PAYMENT_HIDE_TOSS
  const v = typeof raw === 'string' ? raw.trim().toLowerCase() : ''
  if (v === 'false' || v === '0' || v === 'no' || v === 'off') return false
  if (v === 'true' || v === '1' || v === 'yes' || v === 'on') return true
  return true
}
