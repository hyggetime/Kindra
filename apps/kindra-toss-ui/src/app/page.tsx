'use client'

import { useCallback, useState } from 'react'

import { ConsentEmailStep } from '@/components/flow/ConsentEmailStep'
import { LoadingPollStep } from '@/components/flow/LoadingPollStep'
import { PremiumIntakeAndPayStep } from '@/components/flow/PremiumIntakeAndPayStep'
import { ResultPentagonChart } from '@/components/flow/ResultPentagonChart'
import { ReportShowcaseSection } from '@/components/home/ReportShowcaseSection'
import type { MiniappOrderRow } from '@/lib/orderTypes'
import { createSupabaseBrowserClient, isSupabaseBrowserConfigured } from '@/lib/supabaseBrowser'

type FlowMode = 'premium' | 'legacy'
type Step = 'consent' | 'loading' | 'result'

export default function MiniappHomePage() {
  const [flow, setFlow] = useState<FlowMode>('premium')
  const [step, setStep] = useState<Step>('consent')
  const [order, setOrder] = useState<MiniappOrderRow | null>(null)
  const [error, setError] = useState<string | null>(null)

  const supabaseReady = isSupabaseBrowserConfigured()

  const onConsentSubmit = useCallback(
    async (input: { email: string; terms: boolean; marketing: boolean }) => {
      setError(null)
      if (!isSupabaseBrowserConfigured()) {
        setError('서비스 연결 설정이 완료되지 않았습니다. 잠시 후 다시 시도해 주세요.')
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
    <main className="mx-auto flex min-w-0 max-w-lg flex-col gap-4 px-4 py-6 sm:px-5 sm:py-8">
      <header className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#7c9070]">Kindra</p>
        <h1 className="mt-1.5 text-lg font-bold leading-snug tracking-tight text-[#2a3428] sm:text-xl">
          아이의 그림이 전하는 이야기
        </h1>
        <p className="mt-1.5 text-[13px] leading-snug text-[#5c5c5c]">5장의 그림에서 발달과 정서의 결을 읽어드려요.</p>
      </header>

      <ReportShowcaseSection />

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      {flow === 'premium' ? <PremiumIntakeAndPayStep onSwitchLegacy={() => setFlow('legacy')} /> : null}

      {flow === 'legacy' ? (
        <>
          {step === 'consent' ? <ConsentEmailStep onSubmit={onConsentSubmit} disabled={!supabaseReady} /> : null}
          {step === 'loading' && order ? (
            <LoadingPollStep orderId={order.id} minWaitMs={45_000} pollIntervalMs={3000} onDone={onPollComplete} />
          ) : null}
          {step === 'result' && order ? <ResultPentagonChart order={order} /> : null}
        </>
      ) : null}
    </main>
  )
}
