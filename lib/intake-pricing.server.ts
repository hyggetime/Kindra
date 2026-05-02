import 'server-only'

import { createServiceRoleClient } from '@lib/supabase/admin'

const STEP2_KEY = 'is_step2_enabled'

/** `kindra_reports` 총 행 수 (서비스 롤, RLS 우회) */
export async function getKindraReportsCount(): Promise<number> {
  try {
    const supabase = createServiceRoleClient()
    const { count, error } = await supabase.from('kindra_reports').select('*', { count: 'exact', head: true })
    if (error) {
      console.error('[intake-pricing] count', error.message)
      return 0
    }
    return typeof count === 'number' ? count : 0
  } catch {
    return 0
  }
}

/** `feature_flags.is_step2_enabled` — 없으면 false */
export async function getIsStep2Enabled(): Promise<boolean> {
  try {
    const supabase = createServiceRoleClient()
    const { data, error } = await supabase.from('feature_flags').select('value_bool').eq('key', STEP2_KEY).maybeSingle()
    if (error || data == null) return false
    return Boolean((data as { value_bool?: boolean }).value_bool)
  } catch {
    return false
  }
}

export async function getIntakePricingContext(): Promise<{ count: number; isStep2Enabled: boolean }> {
  const [count, isStep2Enabled] = await Promise.all([getKindraReportsCount(), getIsStep2Enabled()])
  return { count, isStep2Enabled }
}
