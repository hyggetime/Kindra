/**
 * 카드·간편결제(토스) UI 표시 여부.
 * - `NEXT_PUBLIC_PAYMENT_SHOW_TOSS=true` 이면 표시.
 * - 하위 호환: `NEXT_PUBLIC_PAYMENT_HIDE_TOSS=false` 이면 표시(예전 “숨김 끄기”).
 * - 그 외(미설정 포함)는 비표시 — 배포·테스트 기본은 토스 창 숨김.
 */
export function isPaymentShowTossWidgetEnabled(): boolean {
  const showRaw = process.env.NEXT_PUBLIC_PAYMENT_SHOW_TOSS
  const sv = typeof showRaw === 'string' ? showRaw.trim().toLowerCase() : ''
  if (sv === 'true' || sv === '1' || sv === 'yes' || sv === 'on') return true

  const hideRaw = process.env.NEXT_PUBLIC_PAYMENT_HIDE_TOSS
  const hv = typeof hideRaw === 'string' ? hideRaw.trim().toLowerCase() : ''
  if (hv === 'false' || hv === '0' || hv === 'no' || hv === 'off') return true

  return false
}
