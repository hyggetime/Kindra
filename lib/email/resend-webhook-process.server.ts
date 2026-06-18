import 'server-only'

import { createServiceRoleClient } from '@lib/supabase/admin'
import { REPORT_STATUS, type ReportStatus } from '@lib/reports/report-lifecycle'
import { updateKindraReportStatusIfAllowed } from '@lib/reports/report-status-transition.server'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export type ResendWebhookPayload = {
  type?: string
  created_at?: string
  data?: Record<string, unknown>
}

function pickEmailId(data: Record<string, unknown> | undefined): string | null {
  if (!data) return null
  const id = data.email_id
  return typeof id === 'string' && id.trim() ? id.trim() : null
}

function pickReportIdFromTags(data: Record<string, unknown> | undefined): string | null {
  if (!data) return null
  const tags = data.tags
  if (!tags || typeof tags !== 'object') return null
  const raw = (tags as Record<string, unknown>).report_id
  if (typeof raw !== 'string') return null
  const id = raw.trim().toLowerCase()
  return UUID_RE.test(id) ? id : null
}

function formatDeliveryFailure(data: Record<string, unknown> | undefined, eventType: string): string {
  if (!data) return eventType
  const bounce = data.bounce
  if (bounce && typeof bounce === 'object') {
    const b = bounce as Record<string, unknown>
    const parts = [
      typeof b.type === 'string' ? b.type : null,
      typeof b.subType === 'string' ? b.subType : null,
      typeof b.message === 'string' ? b.message : null,
    ].filter(Boolean)
    if (parts.length > 0) return parts.join(' · ')
  }
  const failed = data.failed
  if (failed && typeof failed === 'object') {
    const f = failed as Record<string, unknown>
    if (typeof f.reason === 'string' && f.reason.trim()) return f.reason.trim()
  }
  if (typeof data.error === 'string' && data.error.trim()) return data.error.trim()
  return eventType
}

function mapResendEventToStatus(eventType: string): ReportStatus | null {
  switch (eventType) {
    case 'email.sent':
      return REPORT_STATUS.EMAIL_SEND_REQUESTED
    case 'email.delivered':
      return REPORT_STATUS.EMAIL_DELIVERED
    case 'email.bounced':
    case 'email.failed':
    case 'email.delivery_failed':
      return REPORT_STATUS.EMAIL_DELIVERY_FAILED
    default:
      return null
  }
}

async function resolveReportId(emailId: string | null, data: Record<string, unknown> | undefined): Promise<string | null> {
  const fromTag = pickReportIdFromTags(data)
  if (fromTag) return fromTag

  if (!emailId) return null
  const admin = createServiceRoleClient()
  const { data: row } = await admin
    .from('kindra_reports')
    .select('id')
    .eq('resend_email_id', emailId)
    .maybeSingle()

  const id = row ? (row as { id?: string }).id : null
  return typeof id === 'string' ? id : null
}

export type ProcessResendWebhookResult = {
  handled: boolean
  reportId: string | null
  eventType: string
  proposedStatus: ReportStatus | null
  applied: boolean
}

export async function processResendWebhookPayload(payload: ResendWebhookPayload): Promise<ProcessResendWebhookResult> {
  const eventType = typeof payload.type === 'string' ? payload.type.trim() : ''
  const data = payload.data
  const emailId = pickEmailId(data)
  const proposed = mapResendEventToStatus(eventType)

  const base: ProcessResendWebhookResult = {
    handled: false,
    reportId: null,
    eventType,
    proposedStatus: proposed,
    applied: false,
  }

  if (!proposed) {
    console.info('[kindra:resend-webhook] ignored eventType', eventType)
    return base
  }

  const reportId = await resolveReportId(emailId, data)
  if (!reportId) {
    console.warn('[kindra:resend-webhook] report not found', { eventType, emailId })
    return { ...base, handled: true }
  }

  const now = new Date().toISOString()
  const extra: Record<string, unknown> = {
    email_delivery_updated_at: now,
  }
  if (emailId) extra.resend_email_id = emailId

  if (proposed === REPORT_STATUS.EMAIL_DELIVERY_FAILED) {
    const reason = formatDeliveryFailure(data, eventType)
    extra.email_delivery_error = reason
    console.error('[kindra:resend-webhook] email delivery failed', {
      reportId,
      emailId,
      eventType,
      reason,
    })
  } else if (proposed === REPORT_STATUS.EMAIL_DELIVERED) {
    extra.email_delivery_error = null
    extra.is_sent = true
  }

  const admin = createServiceRoleClient()
  const result = await updateKindraReportStatusIfAllowed(admin, reportId, proposed, extra)

  if (!result.ok) {
    console.error('[kindra:resend-webhook] status update failed', reportId, result.reason)
    return { ...base, handled: true, reportId }
  }

  return {
    handled: true,
    reportId,
    eventType,
    proposedStatus: proposed,
    applied: result.applied,
  }
}

/** 웹훅 claim 전 report_id 추정(멱등 로그용) */
export async function peekReportIdForResendPayload(payload: ResendWebhookPayload): Promise<string | null> {
  const data = payload.data
  return resolveReportId(pickEmailId(data), data)
}
