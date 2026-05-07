/**
 * 토스페이먼츠 SDK — **API 개별 연동 키** + 결제창(`payment`) 연동.
 *
 * - `NEXT_PUBLIC_TOSS_CLIENT_KEY` — 개발자센터 **API 개별 연동** 클라이언트 키만 사용 (브라우저).
 *   결제위젯 연동 클라이언트 키는 넣지 마세요. 예전 `NEXT_PUBLIC_TOSS_WIDGET_CLIENT_KEY` 폴백은 제거했습니다.
 * - `TOSS_SECRET_KEY` — 같은 묶음의 **시크릿 키** (서버 전용). 결제 승인·쿠키 서명에 사용.
 * - 하위 호환: 서버 시크릿만 `TOSS_WIDGET_SECRET_KEY` 이름도 허용.
 * - `NEXT_PUBLIC_TOSS_MID` — 상점 MID (선택, UI·디버그). 비우면 코드 기본값.
 * - 주문 위조 방지: `POST /api/payments/toss/prepare` 가 서명 쿠키를 싹니다. 서명은
 *   `TOSS_CHECKOUT_SIGNING_SECRET`(선택) 또는 `TOSS_SECRET_KEY` / `TOSS_WIDGET_SECRET_KEY`.
 *
 * @see https://docs.tosspayments.com/guides/v2/payment-window/integration
 */

/** 상점 MID — env 미설정 시 사용 */
const KINDRA_TOSS_PAYMENTS_DEFAULT_MID = 'vkindrwnal'

export function getTossPaymentsMid(): string {
  if (typeof process === 'undefined') return ''
  const fromEnv = process.env.NEXT_PUBLIC_TOSS_MID
  if (fromEnv !== undefined) return fromEnv.trim()
  return KINDRA_TOSS_PAYMENTS_DEFAULT_MID
}

/** API 개별 연동 클라이언트 키 — `loadTossPayments` / 통합결제창 (결제위젯 키 폴백 없음) */
export function getTossClientKey(): string {
  if (typeof process === 'undefined') return ''
  return process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY?.trim() ?? ''
}

/** @deprecated Use getTossClientKey */
export function getTossWidgetClientKey(): string {
  return getTossClientKey()
}

/** SDK로 통합결제창을 띄울 수 있는지 — 클라이언트 키 필요 */
export function isTossPaymentsConfigured(): boolean {
  return getTossClientKey().length > 0
}

/** @deprecated Use isTossPaymentsConfigured */
export function isTossPaymentsWidgetConfigured(): boolean {
  return isTossPaymentsConfigured()
}
