import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'

import { REPORT_STATUS, type ReportStatus } from '@lib/reports/report-lifecycle'

/** 단조 증가 순위 — 낮은 값으로의 후퇴(예: sent → payment_confirmed)를 막습니다. */
const STATUS_RANK: Record<ReportStatus, number> = {
  [REPORT_STATUS.CANCELLED]: 0,
  [REPORT_STATUS.CREATED]: 10,
  [REPORT_STATUS.AWAITING_PAYMENT]: 20,
  [REPORT_STATUS.AWAITING_DEPOSIT]: 30,
  [REPORT_STATUS.PAYMENT_CONFIRMED]: 40,
  [REPORT_STATUS.ANALYSIS_COMPLETE]: 50,
  [REPORT_STATUS.SENT]: 60,
  [REPORT_STATUS.EMAIL_SEND_REQUESTED]: 70,
  [REPORT_STATUS.EMAIL_DELIVERY_FAILED]: 75,
  [REPORT_STATUS.EMAIL_DELIVERED]: 80,
}

const EMAIL_DELIVERY_STATUSES = new Set<ReportStatus>([
  REPORT_STATUS.EMAIL_SEND_REQUESTED,
  REPORT_STATUS.EMAIL_DELIVERY_FAILED,
  REPORT_STATUS.EMAIL_DELIVERED,
])

/** sent(60) 이상 — 리포트 발송·이메일 배송 단계 이후에는 cancelled 로 후퇴 불가 */
const CANCEL_BLOCKED_FROM_RANK = STATUS_RANK[REPORT_STATUS.SENT]

const KNOWN_STATUSES = new Set<string>(Object.values(REPORT_STATUS))

export function normalizeReportStatus(raw: string | null | undefined): ReportStatus | null {
  const v = (raw ?? '').trim().toLowerCase()
  if (!v || !KNOWN_STATUSES.has(v)) return null
  return v as ReportStatus
}

export function reportStatusRank(status: ReportStatus): number {
  return STATUS_RANK[status]
}

export type ReportStatusTransitionDecision =
  | { apply: true; reason: 'advance' | 'idempotent' }
  | {
      apply: false
      reason:
        | 'unknown_current'
        | 'downgrade'
        | 'email_before_ready'
        | 'failed_after_delivered'
        | 'cancelled_terminal'
        | 'cancel_after_fulfillment'
    }

/**
 * Resend·관리자 등 모든 status 갱신 전에 호출합니다.
 * - 동일 status: idempotent (메타데이터만 갱신 가능)
 * - cancelled: 순위 후퇴 규칙을 우회하되, sent(60) 이상에서는 거부
 * - 이메일 단계: analysis_complete(50) 이상 또는 sent(60) 이후만 허용
 * - email_delivered 이후 email_delivery_failed 금지
 */
export function evaluateReportStatusTransition(
  currentRaw: string | null | undefined,
  proposed: ReportStatus,
): ReportStatusTransitionDecision {
  const current = normalizeReportStatus(currentRaw)

  if (!current) {
    if (EMAIL_DELIVERY_STATUSES.has(proposed)) {
      return { apply: false, reason: 'email_before_ready' }
    }
    return { apply: true, reason: 'advance' }
  }

  if (current === proposed) {
    return { apply: true, reason: 'idempotent' }
  }

  if (current === REPORT_STATUS.CANCELLED) {
    return { apply: false, reason: 'cancelled_terminal' }
  }

  if (proposed === REPORT_STATUS.CANCELLED) {
    if (reportStatusRank(current) >= CANCEL_BLOCKED_FROM_RANK) {
      return { apply: false, reason: 'cancel_after_fulfillment' }
    }
    return { apply: true, reason: 'advance' }
  }

  if (EMAIL_DELIVERY_STATUSES.has(proposed)) {
    const fromRank = reportStatusRank(current)
    const minReady = reportStatusRank(REPORT_STATUS.ANALYSIS_COMPLETE)
    if (fromRank < minReady && current !== REPORT_STATUS.SENT) {
      return { apply: false, reason: 'email_before_ready' }
    }
    if (
      proposed === REPORT_STATUS.EMAIL_DELIVERY_FAILED &&
      fromRank >= reportStatusRank(REPORT_STATUS.EMAIL_DELIVERED)
    ) {
      return { apply: false, reason: 'failed_after_delivered' }
    }
    if (reportStatusRank(proposed) < fromRank) {
      return { apply: false, reason: 'downgrade' }
    }
    return { apply: true, reason: 'advance' }
  }

  if (reportStatusRank(proposed) < reportStatusRank(current)) {
    return { apply: false, reason: 'downgrade' }
  }

  return { apply: true, reason: 'advance' }
}

export async function updateKindraReportStatusIfAllowed(
  admin: SupabaseClient,
  reportId: string,
  proposed: ReportStatus,
  extraPatch?: Record<string, unknown>,
): Promise<
  | { ok: true; applied: boolean; status: ReportStatus; decision: ReportStatusTransitionDecision }
  | { ok: false; reason: string }
> {
  const { data: row, error } = await admin
    .from('kindra_reports')
    .select('status')
    .eq('id', reportId)
    .maybeSingle()

  if (error) {
    return { ok: false, reason: error.message }
  }
  if (!row) {
    return { ok: false, reason: 'report_not_found' }
  }

  const currentRaw = (row as { status?: string | null }).status
  const decision = evaluateReportStatusTransition(currentRaw, proposed)

  if (!decision.apply) {
    console.info('[kindra:report-status] skipped transition', {
      reportId,
      from: currentRaw,
      to: proposed,
      reason: decision.reason,
    })
    return { ok: true, applied: false, status: normalizeReportStatus(currentRaw) ?? proposed, decision }
  }

  const patch: Record<string, unknown> = {
    ...(decision.reason === 'advance' ? { status: proposed } : {}),
    ...extraPatch,
  }

  if (Object.keys(patch).length === 0) {
    return { ok: true, applied: false, status: proposed, decision }
  }

  const { error: upErr } = await admin.from('kindra_reports').update(patch).eq('id', reportId)
  if (upErr) {
    return { ok: false, reason: upErr.message }
  }

  return { ok: true, applied: true, status: proposed, decision }
}
