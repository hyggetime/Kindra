import 'server-only'

import { LIST_PRICE_WON } from '@lib/constants'

/**
 * 결제 페이지·토스 prepare 에서 사용하는 정상가.
 * DB `listed_price_won` 과 무관하게 코드 상 LIST_PRICE_WON(9,900원) 고정 — 할인은 쿠폰 코드로만 적용.
 */
export async function getListedPriceWonForReport(reportId: string | null | undefined): Promise<number> {
  void reportId
  return LIST_PRICE_WON
}
