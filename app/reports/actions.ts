'use server'

import { createServerSupabaseClient } from '@lib/supabase/server'

const MAX_REVIEW_LEN = 2000

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function saveKindraReportReview(
  reportId: string,
  reviewText: string,
): Promise<{ ok: boolean; message?: string }> {
  const id = String(reportId ?? '').trim()
  if (!UUID_RE.test(id)) {
    return { ok: false, message: '잘못된 리포트 식별자입니다.' }
  }

  const text = String(reviewText ?? '').trim()
  if (text.length > MAX_REVIEW_LEN) {
    return { ok: false, message: `후기는 ${MAX_REVIEW_LEN}자 이내로 작성해 주세요.` }
  }

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('kindra_reports')
    .update({ review_text: text || null })
    .eq('id', id)
    .select('id')
    .maybeSingle()

  if (error) {
    console.error('[reports] save review', error.message)
    if (/row-level security|RLS/i.test(error.message)) {
      return { ok: false, message: '로그인한 계정이 이 리포트의 소유자일 때만 후기를 저장할 수 있어요.' }
    }
    return { ok: false, message: '저장에 실패했습니다. 잠시 후 다시 시도해 주세요.' }
  }
  if (!data) {
    return { ok: false, message: '이 리포트를 수정할 권한이 없거나 존재하지 않습니다.' }
  }

  return { ok: true }
}
