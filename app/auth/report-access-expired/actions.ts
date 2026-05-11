'use server'

import { isReportsUuidSegment, sanitizeInternalNextPath } from '@lib/auth/internal-next'
import { createServerSupabaseClient } from '@lib/supabase/server'
import { createServiceRoleClient } from '@lib/supabase/admin'

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type ReportAccessRenewalState = {
  ok: boolean
  message: string
  /** 이메일 조회 실패 등 — 수동 로그인 안내 */
  needsManualLogin?: boolean
}

export const reportAccessRenewalInitialState: ReportAccessRenewalState = {
  ok: false,
  message: '',
}

function parentEmailFromReportJson(reportJson: unknown): string | null {
  if (!reportJson || typeof reportJson !== 'object') return null
  const o = reportJson as Record<string, unknown>
  if (typeof o.parentEmail === 'string' && o.parentEmail.trim()) {
    return o.parentEmail.trim().toLowerCase()
  }
  return null
}

/**
 * 리포트 행에 저장된 신청 이메일로만 매직링크 발송(클라이언트가 이메일을 넘기지 않음).
 */
export async function sendReportAccessRenewalMagicLink(
  _prev: ReportAccessRenewalState,
  formData: FormData,
): Promise<ReportAccessRenewalState> {
  const reportUuid = String(formData.get('reportUuid') ?? '').trim().toLowerCase()
  const nextRaw = String(formData.get('next') ?? '').trim()

  if (!isReportsUuidSegment(reportUuid)) {
    return { ok: false, message: '리포트 정보가 올바르지 않아요.', needsManualLogin: true }
  }

  const safeNext = sanitizeInternalNextPath(nextRaw || `/reports/${reportUuid}`)
  const expected = `/reports/${reportUuid}`
  if (safeNext !== expected) {
    return { ok: false, message: '요청 경로를 확인할 수 없어요.', needsManualLogin: true }
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '')
  if (!siteUrl) {
    return {
      ok: false,
      message: '메일 발송 설정을 확인할 수 없어요. 잠시 후 다시 시도해 주세요.',
      needsManualLogin: true,
    }
  }

  let admin
  try {
    admin = createServiceRoleClient()
  } catch {
    return { ok: false, message: '서버 연결에 문제가 있어요.', needsManualLogin: true }
  }

  const { data: row, error } = await admin
    .from('kindra_reports')
    .select('owner_email, report_json')
    .eq('id', reportUuid)
    .maybeSingle()

  if (error || !row) {
    return { ok: false, message: '리포트를 찾을 수 없어요.', needsManualLogin: true }
  }

  let email = typeof (row as { owner_email?: string | null }).owner_email === 'string'
    ? (row as { owner_email: string }).owner_email.trim().toLowerCase()
    : ''

  if (!email) {
    const fromJson = parentEmailFromReportJson((row as { report_json?: unknown }).report_json)
    if (fromJson) email = fromJson
  }

  if (!email || !emailRe.test(email)) {
    return {
      ok: false,
      message: '등록된 이메일을 찾지 못했어요.',
      needsManualLogin: true,
    }
  }

  let shouldCreateUser = true
  try {
    const { data, error: rpcErr } = await admin.rpc('kindra_auth_user_email_exists', {
      p_email: email,
    })
    if (!rpcErr && data === true) {
      shouldCreateUser = false
    }
  } catch {
    /* 마이그레이션 미적용 시 기본 true */
  }

  const callback = new URL('/auth/callback', siteUrl)
  callback.searchParams.set('next', safeNext)
  const emailRedirectTo = callback.toString()

  const supabase = await createServerSupabaseClient()
  const { error: otpErr } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser,
      emailRedirectTo,
    },
  })

  if (otpErr) {
    return { ok: false, message: otpErr.message, needsManualLogin: true }
  }

  return {
    ok: true,
    message: '메일이 발송되었습니다! 메일함의 링크를 클릭하면 즉시 열람이 가능합니다.',
  }
}
