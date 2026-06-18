/**
 * `kindra_reports.channel` · `kindra_reports.status` 값 (DB text 컬럼).
 * @see supabase/migrations/20260519120000_kindra_reports_channel_status.sql
 */
export const REPORT_CHANNEL = {
  WEB: 'web',
  TOSS: 'toss',
  DESKTOP: 'desktop',
} as const

export type ReportChannel = (typeof REPORT_CHANNEL)[keyof typeof REPORT_CHANNEL]

export const REPORT_STATUS = {
  CREATED: 'created',
  AWAITING_PAYMENT: 'awaiting_payment',
  AWAITING_DEPOSIT: 'awaiting_deposit',
  PAYMENT_CONFIRMED: 'payment_confirmed',
  ANALYSIS_COMPLETE: 'analysis_complete',
  /** 관리자 수동 발송 표시 */
  SENT: 'sent',
  /** Resend `email.sent` — 발송 요청 완료 */
  EMAIL_SEND_REQUESTED: 'email_send_requested',
  /** Resend `email.bounced` / `email.failed` — 발송 실패 */
  EMAIL_DELIVERY_FAILED: 'email_delivery_failed',
  /** Resend `email.delivered` — 배송 완료 */
  EMAIL_DELIVERED: 'email_delivered',
  CANCELLED: 'cancelled',
} as const

export type ReportStatus = (typeof REPORT_STATUS)[keyof typeof REPORT_STATUS]

export function reportCreateFields(opts: {
  channel: ReportChannel
  status?: ReportStatus
}): { channel: ReportChannel; status: ReportStatus } {
  return {
    channel: opts.channel,
    status: opts.status ?? REPORT_STATUS.CREATED,
  }
}

export function reportStatusPatch(status: ReportStatus): { status: ReportStatus } {
  return { status }
}
