import Link from 'next/link'

import { Footer } from '@/components/layout/Footer'

type Props = {
  children: React.ReactNode
}

/** `/apply` 계열 페이지 공통 레이아웃 */
export function ApplyPageShell({ children }: Props) {
  return (
    <div className="min-h-svh bg-[#FDFBF9] text-[#4A4A4A]">
      <header className="border-b border-[#EDE8E0] bg-[#FDFBF9]/90 px-5 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight text-[#7C9070]">
            Kindra
          </Link>
          <Link href="/" className="text-xs text-[#8A8A8A] transition hover:text-[#7C9070]">
            ← 킨드라 홈으로
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-5 py-14 sm:py-20">{children}</div>

      <Footer />
    </div>
  )
}
