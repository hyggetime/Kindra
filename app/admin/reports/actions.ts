'use server'

import { createServiceRoleClient } from '@lib/supabase/admin'

function assertAdminPassword(pw: string): boolean {
  const expected = process.env.ADMIN_PASSWORD
  return typeof expected === 'string' && expected.length > 0 && pw === expected
}

const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isPaidTier(t: string | null | undefined): boolean {
  return t === 'discount' || t === 'normal'
}

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
      .select('price_tier, deposit_confirmed')
      .eq('id', id)
      .maybeSingle()

    if (fetchErr || !row) {
      console.error('[admin/reports] update is_sent prefetch', fetchErr?.message)
      return { ok: false }
    }
    const pt = row.price_tier as string | null | undefined
    const dep = Boolean((row as { deposit_confirmed?: boolean }).deposit_confirmed)
    if (isPaidTier(pt) && !dep) {
      return { ok: false, reason: 'deposit_required' }
    }
  }

  const { error } = await supabase.from('kindra_reports').update({ is_sent: isSent }).eq('id', id)

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
  const { error } = await supabase.from('kindra_reports').update({ deposit_confirmed: depositConfirmed }).eq('id', id)

  if (error) {
    console.error('[admin/reports] update deposit_confirmed', error.message)
    return { ok: false }
  }
  return { ok: true }
}

export async function setStep2EnabledFlag(pw: string, enabled: boolean): Promise<{ ok: boolean }> {
  if (!assertAdminPassword(pw)) return { ok: false }
  const supabase = createServiceRoleClient()
  const { error } = await supabase
    .from('feature_flags')
    .upsert({ key: 'is_step2_enabled', value_bool: enabled, updated_at: new Date().toISOString() }, { onConflict: 'key' })

  if (error) {
    console.error('[admin/reports] setStep2', error.message)
    return { ok: false }
  }
  return { ok: true }
}
