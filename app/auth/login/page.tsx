import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

import { SITE_OG_IMAGE } from '@lib/site-og'

import { MagicLinkRequestForm } from './MagicLinkRequestForm'

const LOGIN_DESC =
  '킨드라 리포트 열람·신청을 위해 이메일로 안전하게 로그인하세요. 매직링크로 별도 비밀번호 없이 이용할 수 있습니다.'

export const metadata: Metadata = {
  title: '로그인 — 킨드라 Kindra',
  description: LOGIN_DESC,
  robots: { index: false, follow: false },
  alternates: { canonical: '/auth/login' },
  openGraph: {
    title: '로그인 — 킨드라 Kindra',
    description: LOGIN_DESC,
    url: '/auth/login',
    images: [SITE_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: '로그인 — 킨드라 Kindra',
    description: LOGIN_DESC,
    images: [SITE_OG_IMAGE.url],
  },
}

/** APPLY_REQUIRE_AUTH=true 일 때 /apply 에서 리다이렉트되거나, 리포트 게이트에서 온 로그인 */
export default function AuthLoginPage() {
  return (
    <div className="min-h-svh bg-[#FDFBF9] text-[#4A4A4A]">
      <header className="border-b border-[#EDE8E0] px-5 py-4 text-center">
        <Link href="/" className="text-sm font-semibold tracking-tight text-[#7C9070]">
          Kindra
        </Link>
      </header>
      <Suspense
        fallback={
          <p className="mx-auto max-w-md px-5 py-16 text-center text-sm text-[#6B6B6B]">불러오는 중…</p>
        }
      >
        <MagicLinkRequestForm />
      </Suspense>
      <p className="mx-auto max-w-md px-5 pb-16 text-center">
        <Link href="/" className="text-sm text-[#7C9070] underline-offset-4 hover:underline">
          킨드라 홈으로
        </Link>
      </p>
    </div>
  )
}
