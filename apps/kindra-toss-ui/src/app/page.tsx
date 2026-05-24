'use client'

import { useCallback, useState } from 'react'

import { ConsentEmailStep } from '@/components/flow/ConsentEmailStep'
import { LoadingPollStep } from '@/components/flow/LoadingPollStep'
import { ResultPentagonChart } from '@/components/flow/ResultPentagonChart'
import type { MiniappOrderRow } from '@/lib/orderTypes'
import { createSupabaseBrowserClient, isSupabaseBrowserConfigured } from '@/lib/supabaseBrowser'

type Step = 'consent' | 'loading' | 'result'

export default function MiniappHomePage() {
  const [step, setStep] = useState<Step>('consent')
  const [order, setOrder] = useState<MiniappOrderRow | null>(null)
  const [error, setError] = useState<string | null>(null)

  const supabaseReady = isSupabaseBrowserConfigured()

  const onConsentSubmit = useCallback(
    async (input: { email: string; terms: boolean; marketing: boolean }) => {
      setError(null)
      if (!isSupabaseBrowserConfigured()) {
        setError('Supabase 환경 변수가 없습니다. .env.local 을 설정하거나 Mock 프리뷰 경로를 이용하세요.')
        return
      }
      const sb = createSupabaseBrowserClient()
      const { data, error: insErr } = await sb
        .from('kindra_miniapp_orders')
        .insert({
          status: 'pending',
          email: input.email,
          marketing_opt_in: input.marketing,
          terms_agreed_at: input.terms ? new Date().toISOString() : null,
        })
        .select('id,status,email,result,error,created_at')
        .single()

      if (insErr || !data) {
        setError(insErr?.message ?? 'insert failed')
        return
      }
      setOrder(data as MiniappOrderRow)
      setStep('loading')
    },
    [],
  )

  const onPollComplete = useCallback((row: MiniappOrderRow) => {
    setOrder(row)
    setStep('result')
  }, [])

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-8 px-5 py-10">
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#7c9070]">Kindra mini</p>
        <h1 className="mt-2 text-xl font-bold tracking-tight">토스 미니앱 플로우 (뼈대)</h1>
        <p className="mt-2 text-sm leading-relaxed text-[#5c5c5c]">
          약관·이메일 → 최소 45초 로딩 + 3초 폴링 → 오각형 결과. 테이블·RLS는 제안 SQL을 적용한 뒤 사용하세요.
        </p>
        <p className="mt-3">
          <a
            className="text-sm font-semibold text-[#4d6b46] underline decoration-[#7c9070]/50 underline-offset-2"
            href="/preview/structured-report/"
          >
            Mock 구조화 리포트 프리뷰 (고정 JSON · 대기/결과 즉시 전환)
          </a>
        </p>
      </header>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      {step === 'consent' ? <ConsentEmailStep onSubmit={onConsentSubmit} disabled={!supabaseReady} /> : null}
      {step === 'loading' && order ? (
        <LoadingPollStep orderId={order.id} minWaitMs={45_000} pollIntervalMs={3000} onDone={onPollComplete} />
      ) : null}
      {step === 'result' && order ? <ResultPentagonChart order={order} /> : null}
    </main>
  )
}
