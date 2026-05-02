import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * 동일 `owner_email`로 여러 `kindra_reports` 행이 있을 때, **가장 최근(created_at desc) 1건**만 조회.
 * 매직링크/세션에서 “내 최신 리포트”가 필요할 때 사용.
 */
export function kindraReportsLatestByOwnerEmail(
  supabase: SupabaseClient,
  ownerEmail: string,
) {
  const email = ownerEmail.trim().toLowerCase()
  return supabase
    .from('kindra_reports')
    .select('id, report_json, review_text, created_at, owner_email')
    .eq('owner_email', email)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
}
