/**
 * 로컬 테스트용 인테이크 바이패스 — `NODE_ENV=development` 이고 `KINDRA_DEV_INTAKE_BYPASS=true` 일 때만 활성.
 * 프로덕션 빌드에서는 항상 false (NEXT 빌드 시 NODE_ENV=production).
 */
export function isDevIntakeBypassEnabled(): boolean {
  return process.env.NODE_ENV === 'development' && process.env.KINDRA_DEV_INTAKE_BYPASS === 'true'
}
