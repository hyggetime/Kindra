import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Footer } from '@/components/layout/Footer'
import { isDevIntakeBypassEnabled } from '@lib/intake/dev-intake-bypass'

import { DevIntakeBypassClient } from './DevIntakeBypassClient'

export default function DevIntakeBypassPage() {
  if (!isDevIntakeBypassEnabled()) {
    notFound()
  }

  return (
    <div className="min-h-svh bg-cream text-ink">
      <header className="border-b border-sage/15 bg-cream/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="text-lg font-semibold tracking-tight text-sage">
            Kindra
          </Link>
          <Link href="/" className="text-xs text-ink/50 transition hover:text-sage">
            ← 홈
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <h1 className="text-xl font-semibold text-ink">인테이크 바이패스 (로컬)</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink/70">
          <code className="rounded bg-white px-1 font-mono text-xs">.env.local</code> 에{' '}
          <code className="rounded bg-white px-1 font-mono text-xs">KINDRA_DEV_INTAKE_BYPASS=true</code> 가 있어야 이
          페이지가 열립니다.
        </p>
        <div className="mt-8">
          <DevIntakeBypassClient />
        </div>
      </main>

      <Footer />
    </div>
  )
}
