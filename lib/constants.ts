/**
 * 킨드라 가격·최소 결제·쿠폰 코드 (클라이언트에서도 import 가능)
 */

/** 리포트 정상가 (원) — 결제 안내·DB listed_price_won 기본값 */
export const LIST_PRICE_WON = 9_900

/**
 * PG·무통장 확인용 최소 청구 금액 (원). 0원 결제가 어려울 때 사용.
 * 이벤트 쿠폰(KINDRA100 등) 적용 시 최종 금액이 이 값이 되도록 맞춤.
 */
export const MIN_CHECKOUT_WON = 100

/** 이벤트 쿠폰: 최종 청구액이 MIN_CHECKOUT_WON 이 되도록 할인 적용 */
export const EVENT_COUPON_TO_MIN_CHECKOUT = 'KINDRA100' as const

export function formatPriceWon(won: number): string {
  return won <= 0 ? '무료' : `${won.toLocaleString('ko-KR')}원`
}
