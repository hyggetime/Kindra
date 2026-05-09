'use server'

import { resolveCheckoutAmountWon } from '@lib/payment/coupon-resolve.server'

export async function previewCheckoutCoupon(listedPriceWon: number, couponRaw: string) {
  return resolveCheckoutAmountWon(listedPriceWon, couponRaw)
}
