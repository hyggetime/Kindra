import 'server-only'

import { adminChildNameFromReportJson, adminParentEmailFromReportJson } from '@lib/admin/report-json-admin-fields'
import { LIST_PRICE_WON } from '@lib/constants'
import { createServiceRoleClient } from '@lib/supabase/admin'

import type { AdminReportRowVm } from './types'

export async function loadAdminReportRows(pw: string): Promise<{ ok: true; rows: AdminReportRowVm[] } | { ok: false }> {
  const expected = process.env.ADMIN_PASSWORD
  if (typeof expected !== 'string' || expected.length === 0 || pw !== expected) {
    return { ok: false }
  }

  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from('kindra_reports')
    .select(
      `
      id,
      created_at,
      report_json,
      owner_email,
      is_sent,
      listed_price_won,
      coupon_code_applied,
      charged_amount_won,
      intake_id,
      review_text,
      bank_depositor_name,
      deposit_confirmed,
      toss_payment_key
    `,
    )
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[admin/reports] load', error.message)
    return { ok: true, rows: [] }
  }

  const intakeIds = [
    ...new Set(
      (data ?? [])
        .map((r) => (r as { intake_id?: unknown }).intake_id)
        .filter((x): x is string => typeof x === 'string' && x.length > 0),
    ),
  ]

  let intakeMap = new Map<string, { drawn_at: string | null; child_age_in_months: number | null }>()
  if (intakeIds.length > 0) {
    const { data: intakes, error: ie } = await supabase
      .from('kindra_intakes')
      .select('id, drawn_at, child_age_in_months')
      .in('id', intakeIds)
    if (!ie && intakes) {
      intakeMap = new Map(
        intakes.map((row) => {
          const id = row.id as string
          const d = row.drawn_at
          const drawn_at = typeof d === 'string' ? d : null
          const m = row.child_age_in_months
          const child_age_in_months =
            typeof m === 'number' && Number.isFinite(m) ? Math.round(m) : null
          return [id, { drawn_at, child_age_in_months }]
        }),
      )
    }
  }

  const rows: AdminReportRowVm[] = (data ?? []).map((r) => {
    const owner = typeof r.owner_email === 'string' ? r.owner_email : ''
    const rt = (r as { review_text?: unknown }).review_text
    const reviewText = typeof rt === 'string' && rt.trim() ? rt : null
    const bdn = (r as { bank_depositor_name?: unknown }).bank_depositor_name
    const bankDepositorName = typeof bdn === 'string' && bdn.trim() ? bdn.trim() : null
    const depositConfirmed = Boolean((r as { deposit_confirmed?: unknown }).deposit_confirmed)
    const listedRaw = (r as { listed_price_won?: unknown }).listed_price_won
    const listedPriceWon =
      typeof listedRaw === 'number' && Number.isFinite(listedRaw) ? Math.round(listedRaw) : LIST_PRICE_WON
    const cc = (r as { coupon_code_applied?: unknown }).coupon_code_applied
    const couponCodeApplied = typeof cc === 'string' && cc.trim() ? cc.trim() : null
    const ch = (r as { charged_amount_won?: unknown }).charged_amount_won
    const chargedAmountWon =
      typeof ch === 'number' && Number.isFinite(ch) ? Math.round(ch) : null
    const tpk = (r as { toss_payment_key?: unknown }).toss_payment_key
    const tossPaymentKey = typeof tpk === 'string' && tpk.trim() ? tpk.trim() : null

    const iid = (r as { intake_id?: unknown }).intake_id
    const intakeId = typeof iid === 'string' ? iid : null
    const intakeRow = intakeId ? intakeMap.get(intakeId) : undefined
    const drawnAt = intakeRow?.drawn_at ?? null
    const childAgeMonthsAtDrawing = intakeRow?.child_age_in_months ?? null

    return {
      id: r.id as string,
      createdAt: typeof r.created_at === 'string' ? r.created_at : '',
      childName: adminChildNameFromReportJson(r.report_json),
      parentEmail: adminParentEmailFromReportJson(r.report_json, owner),
      isSent: Boolean(r.is_sent),
      listedPriceWon,
      couponCodeApplied,
      chargedAmountWon,
      tossPaymentKey,
      drawnAt,
      childAgeMonthsAtDrawing,
      reviewText,
      bankDepositorName,
      depositConfirmed,
    }
  })

  return { ok: true, rows }
}
