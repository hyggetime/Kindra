import 'server-only'

import type { PriceTier } from '@lib/constants'
import { adminChildNameFromReportJson, adminParentEmailFromReportJson } from '@lib/admin/report-json-admin-fields'
import { getIsStep2Enabled } from '@lib/intake-pricing.server'
import { createServiceRoleClient } from '@lib/supabase/admin'

import type { AdminReportRowVm } from './types'

export async function loadAdminReportRows(
  pw: string,
): Promise<{ ok: true; rows: AdminReportRowVm[]; isStep2Enabled: boolean } | { ok: false }> {
  const expected = process.env.ADMIN_PASSWORD
  if (typeof expected !== 'string' || expected.length === 0 || pw !== expected) {
    return { ok: false }
  }

  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from('kindra_reports')
    .select(
      'id, created_at, report_json, owner_email, is_sent, price_tier, review_text, bank_depositor_name, deposit_confirmed',
    )
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[admin/reports] load', error.message)
    const isStep2Enabled = await getIsStep2Enabled()
    return { ok: true, rows: [], isStep2Enabled }
  }

  const rows: AdminReportRowVm[] = (data ?? []).map((r) => {
    const owner = typeof r.owner_email === 'string' ? r.owner_email : ''
    const pt = r.price_tier as string | null
    const priceTier: PriceTier | null =
      pt === 'free' || pt === 'discount' || pt === 'normal' ? (pt as PriceTier) : null
    const rt = (r as { review_text?: unknown }).review_text
    const reviewText = typeof rt === 'string' && rt.trim() ? rt : null
    const bdn = (r as { bank_depositor_name?: unknown }).bank_depositor_name
    const bankDepositorName = typeof bdn === 'string' && bdn.trim() ? bdn.trim() : null
    const depositConfirmed = Boolean((r as { deposit_confirmed?: unknown }).deposit_confirmed)

    return {
      id: r.id as string,
      createdAt: typeof r.created_at === 'string' ? r.created_at : '',
      childName: adminChildNameFromReportJson(r.report_json),
      parentEmail: adminParentEmailFromReportJson(r.report_json, owner),
      isSent: Boolean(r.is_sent),
      priceTier,
      reviewText,
      bankDepositorName,
      depositConfirmed,
    }
  })

  const isStep2Enabled = await getIsStep2Enabled()

  return { ok: true, rows, isStep2Enabled }
}
