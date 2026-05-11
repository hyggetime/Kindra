/**
 * 개발·테스트 시 결제 없이 제출 직후 AI 분석을 실행할지 여부.
 * `NEXT_PUBLIC_SKIP_PAYMENT_FOR_ANALYSIS=true` 이면 프로덕션 결제 후 분석 흐름 대신 기존 즉시 분석 경로를 탑니다.
 */
export function isSkipPaymentForAnalysis(): boolean {
  const v = process.env.NEXT_PUBLIC_SKIP_PAYMENT_FOR_ANALYSIS?.trim().toLowerCase()
  return v === 'true' || v === '1' || v === 'yes'
}
