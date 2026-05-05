/**
 * 킨드라 단계별 유동 가격·오픈 정책 상수 (클라이언트에서도 import 가능)
 */
export const DISCOUNT_LIMIT = 100
/** 할인 단계 가격 (원) */
export const DISCOUNT_PRICE_WON = 4_900
/** 정상가 (원) */
export const NORMAL_PRICE_WON = 9_900

export type PriceTier = 'free' | 'discount' | 'normal'

/**
 * 무료 혜택 구간도 토스·입금 플로를 태울 때 사용하는 청구 금액(원).
 * 0원은 PG에서 처리하기 어려운 경우가 많아 최소 금액으로 통일합니다.
 */
export const FREE_TIER_CHECKOUT_WON = 100

/** 토스 결제창·prepare 쿠키에 넣는 실제 청구 금액 */
export function tossChargeAmountWonForTier(tier: PriceTier): number {
  if (tier === 'free') return FREE_TIER_CHECKOUT_WON
  return displayPriceWonForTier(tier)
}

/**
 * @param reportCount — 현재 `kindra_reports` 총 행 수 (이번 INSERT 직전 기준)
 * @param isStep2Enabled — false면 1단계(무료 혜택 티어)로 고정
 */
export function effectivePriceTier(reportCount: number, isStep2Enabled: boolean): PriceTier {
  if (!isStep2Enabled) return 'free'
  if (reportCount < DISCOUNT_LIMIT) return 'discount'
  return 'normal'
}

export function priceTierLabelKo(tier: PriceTier | null | undefined): string {
  if (!tier) return '미분류'
  if (tier === 'free') return '무료 대상'
  if (tier === 'discount') return '할인(유료)'
  return '정상가(유료)'
}

export function displayPriceWonForTier(tier: PriceTier): number {
  if (tier === 'free') return 0
  if (tier === 'discount') return DISCOUNT_PRICE_WON
  return NORMAL_PRICE_WON
}

export function formatPriceWon(won: number): string {
  return won <= 0 ? '무료' : `${won.toLocaleString('ko-KR')}원`
}
