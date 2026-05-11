/** 매직링크 콜백에서만 발급 — 주소창 직접 입력만으로는 리포트 페이지를 열 수 없게 함 */
export const KINDRA_REPORT_UNLOCK_COOKIE = 'kindra_report_unlock'

/** 초 단위 — 리포트 잠금 해제 쿠키 유지 기간 (30일). `/auth/callback` 에서 매직링크로 들어올 때마다 동일 쿠키를 새로 심으며 maxAge 가 그 시점부터 다시 30일로 갱신됩니다. */
export const KINDRA_REPORT_UNLOCK_MAX_AGE = 60 * 60 * 24 * 30