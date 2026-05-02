import 'server-only'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * 서버 전용(RSC, Server Actions, Route Handlers).
 * — 쿠키 기반 세션으로 사용자 컨텍스트를 유지합니다.
 * — RLS 를 우회해야 할 때만 `@lib/supabase/admin` 의 service_role 클라이언트를
 *   Server Action 등 서버 코드에서 사용하세요.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          /* Server Component 등 읽기 전용 컨텍스트 — 세션 갱신은 middleware에서 처리 */
        }
      },
    },
  })
}
