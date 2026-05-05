/**
 * 토스페이먼츠 **결제 위젯(Payment Widget) V2** 연동용 공개 설정.
 *
 * - `NEXT_PUBLIC_TOSS_WIDGET_CLIENT_KEY` — 개발자센터 **결제위젯 연동** 클라이언트 키 (브라우저).
 * - `TOSS_WIDGET_SECRET_KEY` — 같은 메뉴의 **시크릿 키** (서버 전용, 절대 `NEXT_PUBLIC_` 금지). 승인 API에 사용.
 * - `NEXT_PUBLIC_TOSS_MID` — 상점 MID (선택, UI·디버그 표시). 비우면 코드 기본값.
 * - 주문 위조 방지를 위해 `POST /api/payments/toss/prepare` 가 쿠키에 서명된 주문을 싹습니다. 서명에는
 *   `TOSS_CHECKOUT_SIGNING_SECRET`(선택) 또는 `TOSS_WIDGET_SECRET_KEY` 를 사용합니다.
 *
 * @see https://docs.tosspayments.com/guides/v2/payment-widget/integration-window
 */

/** 상점 MID — env 미설정 시 사용 */
const KINDRA_TOSS_PAYMENTS_DEFAULT_MID = 'vkindrwnal'

export function getTossPaymentsMid(): string {
  if (typeof process === 'undefined') return ''
  const fromEnv = process.env.NEXT_PUBLIC_TOSS_MID
  if (fromEnv !== undefined) return fromEnv.trim()
  return KINDRA_TOSS_PAYMENTS_DEFAULT_MID
}

/** 결제위젯 연동 클라이언트 키 (브라우저 SDK 초기화) */
export function getTossWidgetClientKey(): string {
  if (typeof process === 'undefined') return ''
  return process.env.NEXT_PUBLIC_TOSS_WIDGET_CLIENT_KEY?.trim() ?? ''
}

/**
 * SDK로 결제 UI를 띄울 수 있는지 — **클라이언트 키**가 있어야 합니다.
 * (MID만으로는 스크립트를 초기화할 수 없습니다.)
 */
export function isTossPaymentsWidgetConfigured(): boolean {
  return getTossWidgetClientKey().length > 0
}
