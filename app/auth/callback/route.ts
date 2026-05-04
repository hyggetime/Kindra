import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { sanitizeInternalNextPath } from '@lib/auth/internal-next'
import {
  KINDRA_REPORT_UNLOCK_COOKIE,
  KINDRA_REPORT_UNLOCK_MAX_AGE,
} from '@lib/auth/report-gate'

/**
 * 이메일 매직링크(PKCE) 수신 — `code` 가 있을 때만 세션을 만들고 `next` 로 이동합니다.
 * `/reports/{uuid}` 로 갈 때 잠금 해제 쿠키를 십니다.
 */
export async function GET(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const nextRaw = requestUrl.searchParams.get('next')
  const safeNext = sanitizeInternalNextPath(nextRaw)
  const redirectTarget = new URL(safeNext, requestUrl.origin)

  if (!url || !anonKey) {
    return NextResponse.redirect(new URL('/', requestUrl.origin))
  }

  if (!code) {
    const login = new URL('/auth/login', requestUrl.origin)
    login.searchParams.set('next', safeNext)
    login.searchParams.set('reason', 'missing_code')
    return NextResponse.redirect(login)
  }

  const response = NextResponse.redirect(redirectTarget)

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    const errUrl = new URL('/auth/login', requestUrl.origin)
    errUrl.searchParams.set('error', encodeURIComponent(error.message))
    errUrl.searchParams.set('next', safeNext)
    return NextResponse.redirect(errUrl)
  }

  const reportsMatch = /^\/reports\/([0-9a-f-]{36})\/?$/i.exec(redirectTarget.pathname)
  const unlockValue = (reportsMatch?.[1] ?? '').toLowerCase() || null

  if (unlockValue) {
    response.cookies.set(KINDRA_REPORT_UNLOCK_COOKIE, unlockValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: KINDRA_REPORT_UNLOCK_MAX_AGE,
    })
  }

  return response
}
