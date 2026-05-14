import 'server-only'

import { LIST_PRICE_WON, MIN_CHECKOUT_WON } from '@lib/constants'

export type CouponResolveOk = {
  ok: true
  amountWon: number
  discountWon: number
  couponNormalized: string | null
  /** DB 캠페인 표시명(있을 때) */
  displayName?: string | null
}

export type CouponResolveErr = { ok: false; message: string }

export type CouponResolveResult = CouponResolveOk | CouponResolveErr

/**
 * 청구 기준가(listed)에서 차감분을 반영한 최종 청구액. 최소 결제(MIN_CHECKOUT_WON) 미만이면 바닥으로 맞춤.
 */
export function checkoutAmountAfterDiscountWon(listedPriceWon: number, discountWon: number): {
  amountWon: number
  discountWon: number
} {
  const listed = Math.max(0, Math.round(Number(listedPriceWon) || 0))
  const disc = Math.max(0, Math.round(Number(discountWon) || 0))
  const amountWon = Math.max(MIN_CHECKOUT_WON, listed - disc)
  return { amountWon, discountWon: listed - amountWon }
}

/** 미리보기·검증용 기본 청구 기준가(런칭 할인가) */
export function defaultListedPriceWon(): number {
  return LIST_PRICE_WON
}
