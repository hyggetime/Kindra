'use server'

import { resolveCheckoutCouponAsync } from '@lib/payment/coupon-campaigns.server'

export async function previewCheckoutCoupon(
  listedPriceWon: number,
  couponRaw: string,
  reportId?: string | null,
) {
  return resolveCheckoutCouponAsync(listedPriceWon, couponRaw, reportId ?? null)
}
