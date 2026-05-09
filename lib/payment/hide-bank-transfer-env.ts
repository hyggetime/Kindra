/**
 * 결제 페이지 무통장 블록 숨김 — `NEXT_PUBLIC_PAYMENT_HIDE_BANK_TRANSFER`
 * 서버·클라이언트 공통 (NEXT_PUBLIC_* 는 빌드 시 번들에 포함됨).
 */
export function isPaymentHideBankTransferEnabled(): boolean {
  const raw = process.env.NEXT_PUBLIC_PAYMENT_HIDE_BANK_TRANSFER
  const v = typeof raw === 'string' ? raw.trim().toLowerCase() : ''
  return v === 'true' || v === '1' || v === 'yes'
}
