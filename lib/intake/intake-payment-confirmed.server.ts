import 'server-only'

/** 결제(카드·무통장 확인) 확정 여부 — AI 분석 트리거 가능 조건 */
export function isPaymentConfirmedForAi(
  intake: { payment_confirmed_at?: string | null },
  report: { deposit_confirmed?: boolean | null; toss_payment_key?: string | null },
): boolean {
  if (intake.payment_confirmed_at && String(intake.payment_confirmed_at).trim()) return true
  if (report.deposit_confirmed === true) return true
  const k = report.toss_payment_key
  if (typeof k === 'string' && k.trim().length > 0) return true
  return false
}
