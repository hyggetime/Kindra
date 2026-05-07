'use server'

import { cookies } from 'next/headers'

import {
  REPORT_ACCESS_COOKIE,
  decodeReportAccessCookie,
  isReportAccessExpired,
} from '@lib/payment/report-access-cookie.server'
import { createServerSupabaseClient } from '@lib/supabase/server'
import { createServiceRoleClient } from '@lib/supabase/admin'

const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const MAX_DEPOSITOR = 80

export type SaveBankDepositorResult =
  | { ok: true }
  | { ok: false; message: string; needAuth?: boolean }

function normalizeId(id: string): string {
  return id.trim().toLowerCase()
}

/**
 * 무통장 입금자명 → `kindra_reports.bank_depositor_name`
 *
 * 1) 신청 직후 발급된 HttpOnly 서명 쿠키(`kindra_report_access`)가 해당 리포트와 일치하면 로그인 없이 저장.
 * 2) Supabase 로그인 세션이 있고 이메일이 행의 owner_email 과 일치하면(RLS) 저장.
 */
export async function saveBankDepositorName(reportId: string, depositorNameRaw: string): Promise<SaveBankDepositorResult> {
  const id = normalizeId(String(reportId ?? ''))
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

  const jar = await cookies()
  const raw = jar.get(REPORT_ACCESS_COOKIE)?.value
  const access = raw ? decodeReportAccessCookie(raw) : null
  const cookieOk =
    access &&
    !isReportAccessExpired(access) &&
    access.reportId === id

  if (cookieOk) {
    const admin = createServiceRoleClient()
    const { data, error } = await admin
      .from('kindra_reports')
      .update({ bank_depositor_name: name })
      .eq('id', id)
      .select('id')
      .maybeSingle()

    if (error) {
      console.error('[saveBankDepositorName] service', error.message)
      return { ok: false, message: '저장에 실패했어요. 잠시 후 다시 시도해 주세요.' }
    }
    if (!data) {
      return { ok: false, message: '해당 신청을 찾을 수 없어요. 같은 브라우저에서 신청 직후 페이지를 이용해 주세요.' }
    }
    return { ok: true }
  }

  const supabase = await createServerSupabaseClient()
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (!userErr && userData.user?.email) {
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

  return {
    ok: false,
    message:
      '입금자명 저장 세션이 없어요. 신청을 마친 직후 같은 브라우저·기기에서 다시 시도해 주시거나, 카카오톡으로 입금자명을 알려 주세요.',
  }
}
