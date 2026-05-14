import 'server-only'

import { LIST_PRICE_WON } from '@lib/constants'

/**
 * 결제 페이지·토스 prepare 에서 사용하는 청구 기준가(런칭 할인가).
 * 쿠폰 할인·한도는 DB `kindra_coupon_campaigns` / `kindra_coupon_redemptions` 와 `lib/payment/coupon-campaigns.server.ts` 에서 처리합니다.
 */
export async function getListedPriceWonForReport(reportId: string | null | undefined): Promise<number> {
  void reportId
  return LIST_PRICE_WON
}
