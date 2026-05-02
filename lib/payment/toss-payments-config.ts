/**
 * 토스페이먼츠 **결제 위젯(Payment Widget)** 연동을 위한 공개 설정만 둡니다.
 *
 * - `NEXT_PUBLIC_TOSS_MID` — 상점 아이디(MID). 설정하면 그 값을 쓰고, **미설정(undefined)** 이면 아래 기본 MID를 씁니다.
 *   빈 문자열(`NEXT_PUBLIC_TOSS_MID=`)으로 두면 **위젯 비활성**(심사 전 등)으로 둘 수 있습니다.
 * - 추후 연동 시(예시): `NEXT_PUBLIC_TOSS_CLIENT_KEY` 는 브라우저 SDK용, `TOSS_WIDGET_SECRET_KEY` 등은
 *   **서버 전용** env 로 두고 결제 승인·조회 API만 서버에서 호출하세요. (시크릿은 절대 `NEXT_PUBLIC_` 금지)
 *
 * @see https://docs.tosspayments.com/guides/v2/payment-widget
 */

/** 상점 MID — env 미설정 시 사용(무통장 기본값 등 다른 결제 설정과 별도). */
const KINDRA_TOSS_PAYMENTS_DEFAULT_MID = 'vkindrwnal'

export function getTossPaymentsMid(): string {
  if (typeof process === 'undefined') return ''
  const fromEnv = process.env.NEXT_PUBLIC_TOSS_MID
  if (fromEnv !== undefined) return fromEnv.trim()
  return KINDRA_TOSS_PAYMENTS_DEFAULT_MID
}

/** MID 가 설정되어 있으면 결제 위젯 마운트·SDK 로드 단계로 진행할 수 있음 */
export function isTossPaymentsWidgetConfigured(): boolean {
  return getTossPaymentsMid().length > 0
}
