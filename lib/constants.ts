/**
 * 킨드라 단계별 유동 가격·오픈 정책 상수 (클라이언트에서도 import 가능)
 */
export const FREE_LIMIT = 30
export const DISCOUNT_LIMIT = 100
/** 할인 단계 가격 (원) */
export const DISCOUNT_PRICE_WON = 4_900
/** 정상가 (원) */
export const NORMAL_PRICE_WON = 9_900

export type PriceTier = 'free' | 'discount' | 'normal'

/**
 * @param reportCount — 현재 `kindra_reports` 총 행 수 (이번 INSERT 직전 기준)
 * @param isStep2Enabled — false면 1단계(무료 UI·과금 면제)로 고정
 */
export function effectivePriceTier(reportCount: number, isStep2Enabled: boolean): PriceTier {
  if (!isStep2Enabled) return 'free'
  if (reportCount < FREE_LIMIT) return 'free'
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
