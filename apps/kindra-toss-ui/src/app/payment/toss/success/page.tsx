'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

import {
  KINDRA_LIVE_STRUCTURED_REPORT_STORAGE_KEY,
  KINDRA_PREMIUM_INTAKE_STORAGE_KEY,
  type KindraPremiumIntakePayload,
  type KindraPremiumIntakePaymentBody,
} from '@/lib/kindraPremiumIntakeTypes'
import {
  postPremiumIntakeAfterPayment,
  runStructuredReportFromPremiumPayload,
} from '@/lib/kindraPremiumPipeline'

function readPayload(): KindraPremiumIntakePayload | null {
  if (typeof window === 'undefined') return null
  const raw = sessionStorage.getItem(KINDRA_PREMIUM_INTAKE_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as KindraPremiumIntakePayload
  } catch {
    return null
  }
}

function SuccessInner() {
  const router = useRouter()
  const sp = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [startAt] = useState(() => Date.now())

  useEffect(() => {
    const paymentKey = sp.get('paymentKey') ?? ''
    const orderId = sp.get('orderId') ?? ''
    const amount = Number(sp.get('amount') ?? '0')

    if (!paymentKey || !orderId) {
      setError('결제 정보(paymentKey, orderId)를 찾을 수 없습니다.')
      return
    }

    const payload = readPayload()
    if (!payload) {
      setError('인테이크 데이터가 없습니다. 신청 화면에서 다시 결제를 시도해 주세요.')
      return
    }

    const body: KindraPremiumIntakePaymentBody = {
      payload,
      payment: { paymentKey, orderId, amount },
    }

    let cancelled = false
    ;(async () => {
      try {
        const serverReport = await postPremiumIntakeAfterPayment(body, { softFail: true })
        const report =
          serverReport ?? (await runStructuredReportFromPremiumPayload(payload))
        if (cancelled) return
        const minWaitMs = 90_000
        const elapsed = Date.now() - startAt
        if (elapsed < minWaitMs) {
          await new Promise<void>((resolve) => {
            window.setTimeout(resolve, minWaitMs - elapsed)
          })
        }
        if (cancelled) return
        sessionStorage.setItem(KINDRA_LIVE_STRUCTURED_REPORT_STORAGE_KEY, JSON.stringify(report))
        router.replace('/preview/structured-report?live=1')
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : '처리 중 오류가 났습니다.')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [router, sp])

  if (error) {
    return (
      <main className="mx-auto max-w-lg px-4 py-10">
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {error}
        </p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10 text-center">
      <div
        className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[#7c9070]/30 border-t-[#7c9070]"
        aria-hidden
      />
      <p className="text-sm text-[#5c5c5c]">결제가 확인되었습니다. 리포트를 준비하는 중이에요… (최대 약 90초)</p>
    </main>
  )
}

export default function TossPaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-lg px-4 py-10 text-center text-sm text-[#5c5c5c]">불러오는 중…</main>
      }
    >
      <SuccessInner />
    </Suspense>
  )
}
