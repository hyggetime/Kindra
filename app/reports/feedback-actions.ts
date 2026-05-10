'use server'

import { createServerSupabaseClient } from '@lib/supabase/server'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const MAX_FEEDBACK_LEN = 4000

export type SubmitFeedbackResult =
  | { ok: true }
  | { ok: false; message: string; duplicate?: boolean }

/**
 * kindra_feedbacks 에 피드백 저장. 리포트 소유자(JWT 이메일 = owner_email)만 insert 가능(RLS).
 * 리포트당 1건(unique report_id).
 */
export async function submitKindraReportFeedback(
  reportId: string,
  contentRaw: string,
  rating: number | null,
): Promise<SubmitFeedbackResult> {
  const id = String(reportId ?? '').trim().toLowerCase()
  if (!UUID_RE.test(id)) {
    return { ok: false, message: '리포트 식별 정보가 올바르지 않습니다.' }
  }

  const content = String(contentRaw ?? '').trim()
  if (!content) {
    return { ok: false, message: '피드백 내용을 입력해 주세요.' }
  }
  if (content.length > MAX_FEEDBACK_LEN) {
    return { ok: false, message: `피드백은 ${MAX_FEEDBACK_LEN}자 이내로 작성해 주세요.` }
  }

  let r = rating
  if (r !== null && r !== undefined) {
    if (!Number.isInteger(r) || r < 1 || r > 5) {
      return { ok: false, message: '별점은 1~5 사이로 선택해 주세요.' }
    }
  } else {
    r = null
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('kindra_feedbacks').insert({
    report_id: id,
    content,
    rating: r,
  })

  if (error) {
    console.error('[submitKindraReportFeedback]', error.code, error.message)
    if (error.code === '23505') {
      return { ok: false, message: '이미 이 리포트에 대한 의견을 남기셨습니다.', duplicate: true }
    }
    if (/row-level security|RLS|permission denied/i.test(error.message)) {
      return {
        ok: false,
        message: '로그인한 계정이 이 리포트의 신청 이메일과 같을 때만 의견을 보낼 수 있어요.',
      }
    }
    return { ok: false, message: '전송에 실패했습니다. 잠시 후 다시 시도해 주세요.' }
  }

  return { ok: true }
}
