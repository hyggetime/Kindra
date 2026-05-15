/**
 * 통합 리포트 이메일 발송 — 고객 안내·약관·서버 메시지에서 동일 정책을 쓰기 위한 문구 상수.
 * (운영 정책 변경 시 이 파일만 조정하면 됩니다.)
 */

/** 약관·개인정보처리방침 등 — 격식체 */
export const REPORT_EMAIL_DELIVERY_POLICY_FORMAL =
  '결제 확인 후 순차적으로 발송하며, 운영 시간 외 결제 건은 익일 오전에 처리될 수 있습니다.'

/** 신청·FAQ·결제 안내 등 — 대화체 */
export const REPORT_EMAIL_DELIVERY_POLICY_CASUAL =
  '결제 확인 후 순차적으로 발송하며, 운영 시간 외 결제 건은 익일 오전에 처리될 수 있어요.'

/** 괄호 안·한 줄 부가 안내용 (짧게) */
export const REPORT_EMAIL_DELIVERY_POLICY_SHORT_CASUAL =
  '결제 확인 후 순차 발송이며, 운영 시간 외 건은 익일 오전에 처리될 수 있어요.'

/** 결제 안내 박스용(격식, 괄호 없이 단독 줄) */
export const REPORT_EMAIL_DELIVERY_POLICY_PAYMENT_LINE =
  '이메일 발송: 결제 확인 후 순차 발송되며, 운영 시간 외 건은 익일 오전에 처리됩니다.'

/** 신청 폼 필수 동의 바로 아래 괄호 안 한 줄 */
export const REPORT_EMAIL_DELIVERY_POLICY_APPLY_FORM_NOTE =
  '(접수·결제 확인이 되면 순차적으로 이메일 발송됩니다. 운영 시간 외 결제 건은 익일 오전에 처리됩니다.)'
