'use server'

import { createServerSupabaseClient } from '@lib/supabase/server'

const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const MAX_DEPOSITOR = 80

export type SaveBankDepositorResult =
  | { ok: true }
  | { ok: false; message: string; needAuth?: boolean }

/**
 * 무통장 입금자명 저장. RLS: 로그인 이메일 = 해당 리포트 `owner_email` 일 때만 갱신됩니다.
 */
export async function saveBankDepositorName(reportId: string, depositorNameRaw: string): Promise<SaveBankDepositorResult> {
  const id = String(reportId ?? '').trim()
  if (!uuidRe.test(id)) {
    return { ok: false, message: '주소에 문제가 있어요. 신청 직후 열린 페이지에서 다시 시도해 주세요.' }
  }

  const name = depositorNameRaw.trim().replace(/\s+/g, ' ')
  if (!name) {
    return { ok: false, message: '입금자명을 입력해 주세요.' }
  }
  if (name.length > MAX_DEPOSITOR) {
    return { ok: false, message: `입금자명은 ${MAX_DEPOSITOR}자 이내로 입력해 주세요.` }
  }

  const supabase = await createServerSupabaseClient()
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr || !userData.user?.email) {
    return { ok: false, message: '입금자명을 저장하려면 로그인이 필요해요.', needAuth: true }
  }

  const { data, error } = await supabase
    .from('kindra_reports')
    .update({ bank_depositor_name: name })
    .eq('id', id)
    .select('id')
    .maybeSingle()

  if (error) {
    console.error('[saveBankDepositorName]', error.message)
    return { ok: false, message: '저장에 실패했어요. 잠시 후 다시 시도해 주세요.' }
  }
  if (!data) {
    return {
      ok: false,
      message: '입금자명을 저장할 수 없어요. 신청 시 사용한 이메일로 로그인되어 있는지 확인해 주세요.',
    }
  }

  return { ok: true }
}
