'use server'

import { recordCouponRedemptionAfterPayment } from '@lib/payment/coupon-campaigns.server'
import { REPORT_STATUS } from '@lib/reports/report-lifecycle'
import { updateKindraReportStatusIfAllowed } from '@lib/reports/report-status-transition.server'
import { createServiceRoleClient } from '@lib/supabase/admin'
import { triggerAiAnalysis } from '@lib/intake/trigger-ai-analysis.server'

function assertAdminPassword(pw: string): boolean {
  const expected = process.env.ADMIN_PASSWORD
  return typeof expected === 'string' && expected.length > 0 && pw === expected
}

const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function updateKindraReportIsSent(
  pw: string,
  reportId: string,
  isSent: boolean,
): Promise<{ ok: boolean; reason?: 'deposit_required' }> {
  if (!assertAdminPassword(pw)) return { ok: false }
  const id = String(reportId ?? '').trim()
  if (!uuidRe.test(id)) {
    return { ok: false }
  }

  const supabase = createServiceRoleClient()

  if (isSent) {
    const { data: row, error: fetchErr } = await supabase
      .from('kindra_reports')
      .select('deposit_confirmed, toss_payment_key')
      .eq('id', id)
      .maybeSingle()

    if (fetchErr || !row) {
      console.error('[admin/reports] update is_sent prefetch', fetchErr?.message)
      return { ok: false }
    }
    const tpk = (row as { toss_payment_key?: unknown }).toss_payment_key
    const dep = Boolean((row as { deposit_confirmed?: boolean }).deposit_confirmed)
    const hasCard = typeof tpk === 'string' && tpk.trim().length > 0
    if (!hasCard && !dep) {
      return { ok: false, reason: 'deposit_required' }
    }
  }

  if (isSent) {
    const statusResult = await updateKindraReportStatusIfAllowed(supabase, id, REPORT_STATUS.SENT, {
      is_sent: true,
    })
    if (!statusResult.ok) {
      console.error('[admin/reports] update is_sent status', statusResult.reason)
      return { ok: false }
    }
    return { ok: true }
  }

  const { error } = await supabase.from('kindra_reports').update({ is_sent: false }).eq('id', id)

  if (error) {
    console.error('[admin/reports] update is_sent', error.message)
    return { ok: false }
  }
  return { ok: true }
}

export async function updateKindraReportDepositConfirmed(
  pw: string,
  reportId: string,
  depositConfirmed: boolean,
): Promise<{ ok: boolean }> {
  if (!assertAdminPassword(pw)) return { ok: false }
  const id = String(reportId ?? '').trim()
  if (!uuidRe.test(id)) return { ok: false }

  const supabase = createServiceRoleClient()
  const { data: before } = await supabase
    .from('kindra_reports')
    .select('intake_id, status')
    .eq('id', id)
    .maybeSingle()
  const intakeId =
    before && typeof (before as { intake_id?: string | null }).intake_id === 'string'
      ? (before as { intake_id: string }).intake_id
      : null

  if (!depositConfirmed) {
    const { error } = await supabase.from('kindra_reports').update({ deposit_confirmed: false }).eq('id', id)
    if (error) {
      console.error('[admin/reports] update deposit_confirmed', error.message)
      return { ok: false }
    }
    return { ok: true }
  }

  const statusResult = await updateKindraReportStatusIfAllowed(supabase, id, REPORT_STATUS.PAYMENT_CONFIRMED, {
    deposit_confirmed: true,
  })
  if (!statusResult.ok) {
    console.error('[admin/reports] update deposit_confirmed status', statusResult.reason)
    return { ok: false }
  }
  if (!statusResult.applied) {
    const { error } = await supabase.from('kindra_reports').update({ deposit_confirmed: true }).eq('id', id)
    if (error) {
      console.error('[admin/reports] update deposit_confirmed only', error.message)
      return { ok: false }
    }
  }

  if (intakeId) {
    const now = new Date().toISOString()
    const { error: pErr } = await supabase
      .from('kindra_intakes')
      .update({ payment_confirmed_at: now })
      .eq('id', intakeId)
    if (pErr) {
      console.error('[admin/reports] payment_confirmed_at on intake', pErr.message)
    }
    const { data: repRow } = await supabase
      .from('kindra_reports')
      .select('coupon_code_applied')
      .eq('id', id)
      .maybeSingle()
    const cc =
      repRow && typeof (repRow as { coupon_code_applied?: unknown }).coupon_code_applied === 'string'
        ? (repRow as { coupon_code_applied: string }).coupon_code_applied.trim()
        : ''
    if (cc) {
      await recordCouponRedemptionAfterPayment(id, cc, 'bank_deposit')
    }
    const ai = await triggerAiAnalysis(intakeId)
    if (!ai.ok) {
      console.error('[admin/reports] triggerAiAnalysis', ai.message)
    }
  }

  return { ok: true }
}
