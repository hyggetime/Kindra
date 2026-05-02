import 'server-only'

import { createClient } from '@supabase/supabase-js'

/** JWT payload 의 role (검증 없이 형식만 확인 — 키 종류 오설정 방지) */
function jwtPayloadRole(jwt: string): string | null {
  const parts = jwt.split('.')
  if (parts.length < 2) return null
  const b64 = parts[1]!.replace(/-/g, '+').replace(/_/g, '/')
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4))
  try {
    const json = Buffer.from(b64 + pad, 'base64').toString('utf8')
    const p = JSON.parse(json) as { role?: string }
    return typeof p.role === 'string' ? p.role : null
  } catch {
    return null
  }
}

function assertServiceRoleJwt(key: string): void {
  const role = jwtPayloadRole(key)
  if (role === 'anon' || role === 'authenticated') {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY 에 Project API 의 anon/authenticated 키가 들어 있습니다. Settings → API 의 **service_role** secret 을 넣어야 kindra_intakes INSERT 가 RLS 에 막히지 않습니다.',
    )
  }
  if (role !== null && role !== undefined && role !== 'service_role') {
    throw new Error(
      `SUPABASE_SERVICE_ROLE_KEY JWT 의 role 이 service_role 이 아닙니다(현재: ${role}). Settings → API 의 service_role secret 을 사용하세요.`,
    )
  }
}

/**
 * Service role 클라이언트 — **RLS 를 우회**합니다.
 *
 * 사용처: Server Action / Route Handler 등 **서버에서만** import 하세요.
 * `server-only` 패키지로 클라이언트 번들 오염을 막습니다.
 *
 * 기본 원칙: 로그인 사용자 세션 + `createServerSupabaseClient()` + RLS 로
 * 해결할 수 있으면 service_role 을 쓰지 마세요.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  assertServiceRoleJwt(serviceRoleKey.trim())

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
