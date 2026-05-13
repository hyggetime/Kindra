/**
 * 통합 리포트 이메일 발송 — 고객 안내·약관·서버 메시지에서 동일 정책을 쓰기 위한 문구 상수.
 * (운영 정책 변경 시 이 파일만 조정하면 됩니다.)
 */
export const REPORT_EMAIL_SLA_MAX_HOURS = 2

/** 예: `최대 2시간 이내` */
export const REPORT_EMAIL_SLA_MAX_PHRASE = `최대 ${REPORT_EMAIL_SLA_MAX_HOURS}시간 이내`

/** 예: `2시간 이내` */
export const REPORT_EMAIL_SLA_WITHIN_PHRASE = `${REPORT_EMAIL_SLA_MAX_HOURS}시간 이내`

/** FAQ·신청 동의·절차 안내 등 — 목표 시간을 넘길 수 있는 대표 사유 */
export const REPORT_EMAIL_SLA_DELAY_NOTE =
  '동시에 접수가 몰리거나 결제·입금 확인이 잠시 지연되면 순서에 따라 안내 시각이 늦어질 수 있어요.'
