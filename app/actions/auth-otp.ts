'use server'

import { sanitizeInternalNextPath } from '@lib/auth/internal-next'
import { createServerSupabaseClient } from '@lib/supabase/server'
import { createServiceRoleClient } from '@lib/supabase/admin'

export type RequestMagicLinkState = {
  ok: boolean
  message: string
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * 이메일 매직링크 발송 (`signInWithOtp` — 기본 이메일 템플릿이 링크형 매직링크).
 * - `shouldCreateUser`: 이미 auth.users 에 동일 이메일이 있으면 false (재방문·기존 계정으로 이어가기).
 * - 없으면 true (첫 가입).
 */
export async function requestReportMagicLink(
  _prev: RequestMagicLinkState,
  formData: FormData,
): Promise<RequestMagicLinkState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const nextRaw = String(formData.get('next') ?? '').trim()
  const safeNext = sanitizeInternalNextPath(nextRaw || '/')

  if (!email || !emailRe.test(email)) {
    return { ok: false, message: '유효한 이메일 주소를 입력해 주세요.' }
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '')
  if (!siteUrl) {
    return {
      ok: false,
      message: '메일 발송 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.',
    }
  }

  let shouldCreateUser = true
  try {
    const admin = createServiceRoleClient()
    const { data, error } = await admin.rpc('kindra_auth_user_email_exists', {
      p_email: email,
    })
    if (!error && data === true) {
      shouldCreateUser = false
    }
  } catch {
    /* 마이그레이션 미적용·service_role 없으면 기본 true */
  }

  const callback = new URL('/auth/callback', siteUrl)
  callback.searchParams.set('next', safeNext)
  const emailRedirectTo = callback.toString()

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser,
      emailRedirectTo,
    },
  })

  if (error) {
    return { ok: false, message: error.message }
  }

  return {
    ok: true,
    message: shouldCreateUser
      ? '입력하신 주소로 링크를 보냈어요. 메일에서 링크를 눌러 로그인해 주세요. (처음 방문이시라면 계정이 함께 만들어져요.)'
      : '입력하신 주소로 매직링크를 보냈어요. 메일의 링크로 기존 계정에 이어서 로그인할 수 있어요.',
  }
}

export const requestMagicLinkInitialState: RequestMagicLinkState = {
  ok: false,
  message: '',
}
