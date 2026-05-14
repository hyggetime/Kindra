/**
 * 킨드라 가격·최소 결제·프로모션 코드 안내 (클라이언트에서도 import 가능)
 */

/** 리포트 정상가(원) — 랜딩·취소선·가격 인지 설문 등 */
export const LIST_PRICE_MSRP_WON = 12_900

/**
 * 런칭 이벤트 할인가(원) — 고정. 결제 안내·DB listed_price_won 기본값과 동일하게 유지.
 */
export const LIST_PRICE_WON = 9_900

/** @deprecated `LIST_PRICE_MSRP_WON` 사용 */
export const LIST_PRICE_REFERENCE_WON = LIST_PRICE_MSRP_WON

/** PG·무통장 확인용 최소 청구 금액 (원). 0원 결제가 어려울 때 사용. */
export const MIN_CHECKOUT_WON = 100

/** 공개 프로모션 코드 — DB `kindra_coupon_campaigns.code` 와 맞춤 */
export const PUBLIC_PROMO_COUPON_CODE = 'HELLOKINDRA' as const

export const PUBLIC_PROMO_COUPON_DISPLAY_NAME = 'Hello Kindra'

/**
 * Hello Kindra 쿠폰 적용 시 **최종 청구가**(원) — 할인액이 아니라 이 금액으로 결제됩니다.
 * (DB `discount_won` 은 listed − 이 값 = 5,000 으로 두어야 함.)
 */
export const HELLO_KINDRA_COUPON_FINAL_PRICE_WON = 4_900

export function formatPriceWon(won: number): string {
  return won <= 0 ? '무료' : `${won.toLocaleString('ko-KR')}원`
}
