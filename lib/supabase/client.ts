'use client'

import { createBrowserClient } from '@supabase/ssr'

/**
 * 브라우저 전용 Supabase 클라이언트.
 * — RLS 정책 하에서 anon 키만 사용합니다.
 * — 서버 비밀(service_role)은 절대 여기서 쓰지 마세요.
 */
export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  return createBrowserClient(url, anonKey)
}
