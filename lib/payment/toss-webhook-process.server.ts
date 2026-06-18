import 'server-only'

import { triggerAiAnalysis } from '@lib/intake/trigger-ai-analysis.server'
import { createServiceRoleClient } from '@lib/supabase/admin'
import { fetchTossPaymentByPaymentKey } from '@lib/payment/toss-fetch-payment.server'
import { REPORT_STATUS, type ReportStatus } from '@lib/reports/report-lifecycle'
import { reportChannelPatchOnVerifiedTossPayment } from '@lib/reports/resolve-report-channel.server'
import { updateKindraReportStatusIfAllowed } from '@lib/reports/report-status-transition.server'

export type TossWebhookPayload = {
  eventType?: string
  createdAt?: string
  data?: Record<string, unknown>
}

function pickPaymentKey(data: Record<string, unknown> | undefined): string {
  if (!data) return ''
  const pk = data.paymentKey
  if (typeof pk === 'string') return pk
  const nested = data.payment as { paymentKey?: string } | undefined
  if (nested && typeof nested.paymentKey === 'string') return nested.paymentKey
  return ''
}

function pickOrderId(data: Record<string, unknown> | undefined): string {
  if (!data) return ''
  const oid = data.orderId
  return typeof oid === 'string' ? oid : ''
}

async function resolveReportRowByPayment(
  paymentKey: string,
  orderIdHint: string,
  remote: Record<string, unknown> | null,
): Promise<{ reportId: string; intakeId: string | null; channel: string | null } | null> {
  const admin = createServiceRoleClient()

  const { data: byKey } = await admin
    .from('kindra_reports')
    .select('id, intake_id, channel')
    .eq('toss_payment_key', paymentKey)
    .maybeSingle()

  if (byKey && typeof (byKey as { id?: string }).id === 'string') {
    const intakeRaw = (byKey as { intake_id?: string | null }).intake_id
    const channelRaw = (byKey as { channel?: string | null }).channel
    return {
      reportId: (byKey as { id: string }).id,
      intakeId: typeof intakeRaw === 'string' ? intakeRaw : null,
      channel: typeof channelRaw === 'string' ? channelRaw : null,
    }
  }

  const orderId =
    (remote && typeof remote.orderId === 'string' ? remote.orderId : '') || orderIdHint
  if (!orderId) return null

  const { data: sessionRow } = await admin
    .from('kindra_toss_checkout_sessions')
    .select('report_id')
    .eq('order_id', orderId)
    .maybeSingle()

  const reportId = sessionRow ? (sessionRow as { report_id?: string | null }).report_id : null
  if (!reportId || typeof reportId !== 'string') return null

  const { data: report } = await admin
    .from('kindra_reports')
    .select('id, intake_id, channel')
    .eq('id', reportId)
    .maybeSingle()

  if (!report || typeof (report as { id?: string }).id !== 'string') return null

  const intakeRaw = (report as { intake_id?: string | null }).intake_id
  const channelRaw = (report as { channel?: string | null }).channel
  return {
    reportId: (report as { id: string }).id,
    intakeId: typeof intakeRaw === 'string' ? intakeRaw : null,
    channel: typeof channelRaw === 'string' ? channelRaw : null,
  }
}

/** 토스 메타데이터는 항상 반영하고, status 변경만 전이 엔진을 거칩니다. */
async function applyKindraReportTossPatch(
  admin: ReturnType<typeof createServiceRoleClient>,
  reportId: string,
  basePatch: Record<string, unknown>,
  proposedStatus?: ReportStatus,
): Promise<void> {
  const { error: baseErr } = await admin.from('kindra_reports').update(basePatch).eq('id', reportId)
  if (baseErr) {
    console.error('[kindra:toss-webhook] report base patch failed', reportId, baseErr.message)
    return
  }

  if (!proposedStatus) return

  const statusResult = await updateKindraReportStatusIfAllowed(admin, reportId, proposedStatus)
  if (!statusResult.ok) {
    console.error('[kindra:toss-webhook] report status transition failed', reportId, statusResult.reason)
    return
  }
  if (!statusResult.applied && !statusResult.decision.apply) {
    console.info('[kindra:toss-webhook] report status transition skipped', {
      reportId,
      proposed: proposedStatus,
      reason: statusResult.decision.reason,
    })
  }
}

export async function processTossWebhookPayload(payload: TossWebhookPayload): Promise<void> {
  const eventType = payload.eventType ?? ''
  const data = payload.data

  const verifyApi = process.env.TOSS_WEBHOOK_VERIFY_WITH_API !== 'false'

  if (eventType === 'PAYMENT_STATUS_CHANGED') {
    const paymentKey = pickPaymentKey(data)
    const orderIdHint = pickOrderId(data)
    const statusFromPayload = typeof data?.status === 'string' ? data.status : ''

    if (!paymentKey) {
      console.warn('[kindra:toss-webhook] PAYMENT_STATUS_CHANGED missing paymentKey')
      return
    }

    const remote = verifyApi ? await fetchTossPaymentByPaymentKey(paymentKey) : null
    if (verifyApi && !remote) {
      console.warn('[kindra:toss-webhook] payment GET failed for', paymentKey)
      return
    }

    const orderId =
      (remote && typeof remote.orderId === 'string' ? remote.orderId : '') || orderIdHint
    const status =
      (remote && typeof remote.status === 'string' ? remote.status : '') || statusFromPayload

    if (verifyApi && remote && statusFromPayload && remote.status !== statusFromPayload) {
      console.warn('[kindra:toss-webhook] status mismatch payload vs API', statusFromPayload, remote.status)
      return
    }

    const resolved = await resolveReportRowByPayment(paymentKey, orderId, remote)
    if (!resolved) {
      console.warn('[kindra:toss-webhook] no report for paymentKey', paymentKey)
      return
    }

    const admin = createServiceRoleClient()
    const now = new Date().toISOString()

    const patch: Record<string, unknown> = {
      toss_payment_status: status || null,
      toss_webhook_updated_at: now,
      ...reportChannelPatchOnVerifiedTossPayment({
        orderId,
        existingChannel: resolved.channel,
      }),
    }

    let proposedStatus: ReportStatus | undefined
    if (status === 'CANCELED' || status === 'PARTIAL_CANCELED') {
      patch.payment_cancelled_at = now
      proposedStatus = REPORT_STATUS.CANCELLED
    } else if (status === 'DONE') {
      proposedStatus = REPORT_STATUS.PAYMENT_CONFIRMED
    }

    await applyKindraReportTossPatch(admin, resolved.reportId, patch, proposedStatus)

    if (resolved.intakeId) {
      if (status === 'DONE') {
        await admin
          .from('kindra_intakes')
          .update({
            payment_confirmed_at: now,
            payment_failed_at: null,
            payment_cancelled_at: null,
          })
          .eq('id', resolved.intakeId)
        void triggerAiAnalysis(resolved.intakeId).then((r) => {
          if (!r.ok) {
            console.warn('[kindra:toss-webhook] triggerAiAnalysis', r.message)
            return
          }
          if (r.skipped) {
            console.info('[kindra:toss-webhook] triggerAiAnalysis skipped', r.reason ?? '')
          }
        })
      } else if (status === 'ABORTED' || status === 'EXPIRED') {
        await admin
          .from('kindra_intakes')
          .update({ payment_failed_at: now })
          .eq('id', resolved.intakeId)
      } else if (status === 'CANCELED' || status === 'PARTIAL_CANCELED') {
        await admin
          .from('kindra_intakes')
          .update({
            payment_cancelled_at: now,
            payment_confirmed_at: null,
          })
          .eq('id', resolved.intakeId)
      }
    }

    console.info('[kindra:toss-webhook] PAYMENT_STATUS_CHANGED', paymentKey, status)
    return
  }

  if (eventType === 'CANCEL_STATUS_CHANGED') {
    /** 해외 간편결제 취소 등 — 국내 카드는 보통 PAYMENT_STATUS_CHANGED 의 CANCELED 로 동기화됨 */
    const paymentKey = pickPaymentKey(data)
    if (!paymentKey) {
      console.warn('[kindra:toss-webhook] CANCEL_STATUS_CHANGED missing paymentKey')
      return
    }

    const remote = verifyApi ? await fetchTossPaymentByPaymentKey(paymentKey) : null
    const orderId =
      (remote && typeof remote.orderId === 'string' ? remote.orderId : '') || pickOrderId(data)

    const resolved = await resolveReportRowByPayment(paymentKey, orderId, remote)
    if (!resolved) return

    const admin = createServiceRoleClient()
    const now = new Date().toISOString()

    await applyKindraReportTossPatch(
      admin,
      resolved.reportId,
      {
        toss_payment_status:
          remote && typeof remote.status === 'string' ? remote.status : 'CANCELED',
        toss_webhook_updated_at: now,
        payment_cancelled_at: now,
        ...reportChannelPatchOnVerifiedTossPayment({
          orderId,
          existingChannel: resolved.channel,
        }),
      },
      REPORT_STATUS.CANCELLED,
    )

    if (resolved.intakeId) {
      await admin
        .from('kindra_intakes')
        .update({
          payment_cancelled_at: now,
          payment_confirmed_at: null,
        })
        .eq('id', resolved.intakeId)
    }

    console.info('[kindra:toss-webhook] CANCEL_STATUS_CHANGED', paymentKey)
    return
  }

  console.info('[kindra:toss-webhook] ignored eventType', eventType)
}
