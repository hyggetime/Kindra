import 'server-only'

import { EVENT_COUPON_TO_MIN_CHECKOUT, LIST_PRICE_WON, MIN_CHECKOUT_WON } from '@lib/constants'

export type CouponResolveOk = {
  ok: true
  amountWon: number
  discountWon: number
  couponNormalized: string | null
}

export type CouponResolveErr = { ok: false; message: string }

export type CouponResolveResult = CouponResolveOk | CouponResolveErr

/**
 * 정상가에서 쿠폰을 적용한 최종 청구 금액.
 * - 빈 문자열: 할인 없음(정상가).
 * - 알 수 없는 코드: 오류(고객에게 표시).
 */
export function resolveCheckoutAmountWon(listedPriceWon: number, couponRaw: string | null | undefined): CouponResolveResult {
  const listed = Math.max(0, Math.round(Number(listedPriceWon) || 0))
  const trimmed = String(couponRaw ?? '').trim()
  if (!trimmed) {
    return { ok: true, amountWon: listed, discountWon: 0, couponNormalized: null }
  }

  const code = trimmed.toUpperCase()

  if (code === EVENT_COUPON_TO_MIN_CHECKOUT) {
    const finalAmt = MIN_CHECKOUT_WON
    return {
      ok: true,
      amountWon: finalAmt,
      discountWon: Math.max(0, listed - finalAmt),
      couponNormalized: code,
    }
  }

  return {
    ok: false,
    message: '사용할 수 없는 쿠폰 코드예요. 코드를 확인하거나 비워 두고 진행해 주세요.',
  }
}

/** 미리보기·검증용 기본 정상가 */
export function defaultListedPriceWon(): number {
  return LIST_PRICE_WON
}
