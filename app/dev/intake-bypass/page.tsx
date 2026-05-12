import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Footer } from '@/components/layout/Footer'
import { devIntakeBypassEnvStatus, isDevIntakeBypassEnabled } from '@lib/intake/dev-intake-bypass'

import { DevIntakeBypassClient } from './DevIntakeBypassClient'

export default function DevIntakeBypassPage() {
  const bypassOn = isDevIntakeBypassEnabled()
  const isDev = process.env.NODE_ENV === 'development'

  if (!isDev) {
    notFound()
  }

  if (!bypassOn) {
    const st = devIntakeBypassEnvStatus()
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
          <p className="mt-4 text-sm leading-relaxed text-ink/80">
            이 페이지는 <code className="rounded bg-white px-1 font-mono text-xs">npm run dev</code> 로 띄운
            개발 서버에서만 열리며, 환경 변수로 켭니다.
          </p>
          <div className="mt-4 rounded-lg border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-ink/85">
            <p className="font-medium text-ink">현재 서버가 보는 값</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <code className="font-mono text-xs">NODE_ENV</code> →{' '}
                <code className="rounded bg-white px-1 font-mono text-xs">{st.nodeEnv}</code>
                {st.nodeEnv !== 'development' ? (
                  <span className="text-ink/70">
                    {' '}
                    — 프로덕션 모드면 바이패스는 의도적으로 꺼집니다. 로컬은{' '}
                    <code className="font-mono text-xs">npm run dev</code> 를 쓰세요.
                  </span>
                ) : null}
              </li>
              <li>
                <code className="font-mono text-xs">KINDRA_DEV_INTAKE_BYPASS</code> → 변수 존재:{' '}
                {st.flagRawLength > 0 ? '예' : '아니오(비어 있음)'} · 인식(켜짐):{' '}
                {st.flagRecognized ? '예' : '아니오'}
              </li>
              {!st.flagRecognized && st.normalizedDebug ? (
                <li className="break-all">
                  정규화된 값(디버그): <code className="font-mono text-xs">{st.normalizedDebug}</code>
                  <span className="block pt-1 text-ink/65">
                    위가 <code className="font-mono text-xs">&quot;true&quot;</code>,{' '}
                    <code className="font-mono text-xs">&quot;1&quot;</code>,{' '}
                    <code className="font-mono text-xs">&quot;yes&quot;</code>,{' '}
                    <code className="font-mono text-xs">&quot;on&quot;</code> 중 하나가 아니면 꺼짐으로 봅니다.
                  </span>
                </li>
              ) : null}
            </ul>
          </div>
          <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm text-ink/80">
            <li>
              프로젝트 루트 <code className="rounded bg-white px-1 font-mono text-xs">.env.local</code> 예:{' '}
              <code className="rounded bg-white px-1 font-mono text-xs">KINDRA_DEV_INTAKE_BYPASS=true</code> — 같은 줄에{' '}
              <code className="font-mono text-xs"># 주석</code> 가능. <code className="font-mono text-xs">1</code>,{' '}
              <code className="font-mono text-xs">yes</code>, <code className="font-mono text-xs">on</code> 도 인식합니다.
            </li>
            <li>
              저장 후 <code className="rounded bg-white px-1 font-mono text-xs">npm run dev</code> 를 껐다 켜 주세요.
            </li>
            <li>
              변수 이름은 <code className="font-mono text-xs">NEXT_PUBLIC_</code> 접두사 없이 위와 동일해야 합니다.
            </li>
          </ol>
        </main>
        <Footer />
      </div>
    )
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
