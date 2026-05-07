import type { PriceTier } from '@lib/constants'
import { tossChargeAmountWonForTier } from '@lib/constants'

/**
 * `NEXT_PUBLIC_KINDRA_PAYMENT_TEST_CHARGE_WON` 이 설정되어 있으면 토스 표시·prepare 쿠키에 이 금액을 씁니다.
 * 비우면 티어 기본 청구액(`tossChargeAmountWonForTier`).
 */
export function effectiveTossChargeWonForTier(tier: PriceTier): number {
  const o = getPaymentTestChargeOverrideWon()
  if (o !== null) return o
  return tossChargeAmountWonForTier(tier)
}

export function getPaymentTestChargeOverrideWon(): number | null {
  const raw = process.env.NEXT_PUBLIC_KINDRA_PAYMENT_TEST_CHARGE_WON
  if (raw === undefined || raw === '') return null
  const n = Number(String(raw).trim())
  if (!Number.isFinite(n) || n < 0) return null
  return Math.round(n)
}
