import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { KINDRA_REPORT_UNLOCK_COOKIE } from '@lib/auth/report-gate'

/**
 * Supabase 세션 쿠키 갱신 + (선택) /apply 보호 + 리포트 게이트 (/reports/[id], /report/[slug]).
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    return supabaseResponse
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options)
        })
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  /** `REPORT_GATE_ENABLED=true` 일 때만: 매직링크 콜백으로 받은 쿠키 + 로그인 필요 */
  const reportGateOn = process.env.REPORT_GATE_ENABLED === 'true'

  const reportsUuidMatch = /^\/reports\/([0-9a-f-]{36})\/?$/i.exec(pathname)
  const legacySlugMatch = /^\/report\/([^/]+)\/?$/.exec(pathname)
  const gateKeyRaw = reportsUuidMatch?.[1] ?? legacySlugMatch?.[1] ?? null
  const gateKey = gateKeyRaw ? gateKeyRaw.toLowerCase() : null

  if (gateKey && reportGateOn && (reportsUuidMatch || legacySlugMatch)) {
    const unlock = request.cookies.get(KINDRA_REPORT_UNLOCK_COOKIE)?.value?.toLowerCase() ?? ''

    if (!user) {
      const login = new URL('/auth/login', request.url)
      login.searchParams.set(
        'next',
        reportsUuidMatch ? `/reports/${gateKey}` : `/report/${legacySlugMatch![1]}`,
      )
      login.searchParams.set('reason', 'login_required')
      return NextResponse.redirect(login)
    }
    if (unlock !== gateKey) {
      const login = new URL('/auth/login', request.url)
      login.searchParams.set(
        'next',
        reportsUuidMatch ? `/reports/${gateKey}` : `/report/${legacySlugMatch![1]}`,
      )
      login.searchParams.set('reason', 'magic_link_only')
      return NextResponse.redirect(login)
    }
  }

  const requireAuthForApply = process.env.APPLY_REQUIRE_AUTH === 'true'

  if (requireAuthForApply && pathname.startsWith('/apply') && !user) {
    const login = new URL('/auth/login', request.url)
    login.searchParams.set('next', pathname)
    return NextResponse.redirect(login)
  }

  return supabaseResponse
}
