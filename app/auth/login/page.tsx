import Link from 'next/link'
import { Suspense } from 'react'
import { MagicLinkRequestForm } from './MagicLinkRequestForm'

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
