'use client'

import Link from 'next/link'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'

import { StructuredReportPremium } from '@/components/preview/StructuredReportPremium'
import { MockStructuredReportProvider } from '@/lib/MockStructuredReportContext'
import { MOCK_KINDRA_STRUCTURED_REPORT } from '@/lib/kindraStructuredReportMock'
import type { KindraStructuredReportJson } from '@/lib/kindraStructuredReportTypes'
import { KINDRA_LIVE_STRUCTURED_REPORT_STORAGE_KEY } from '@/lib/kindraPremiumIntakeTypes'

function StructuredReportInner() {
  const searchParams = useSearchParams()
  const live = searchParams.get('live') === '1'
  const [liveReport, setLiveReport] = useState<KindraStructuredReportJson | null>(null)
  const [liveReadDone, setLiveReadDone] = useState(false)

  useEffect(() => {
    if (!live || typeof window === 'undefined') {
      setLiveReadDone(true)
      return
    }
    const raw = sessionStorage.getItem(KINDRA_LIVE_STRUCTURED_REPORT_STORAGE_KEY)
    if (!raw) {
      setLiveReport(null)
      setLiveReadDone(true)
      return
    }
    try {
      setLiveReport(JSON.parse(raw) as KindraStructuredReportJson)
    } catch {
      setLiveReport(null)
    } finally {
      setLiveReadDone(true)
    }
  }, [live])

  const value = useMemo(() => {
    if (live && liveReport) return liveReport
    return MOCK_KINDRA_STRUCTURED_REPORT
  }, [live, liveReport])

  const subtitle = live ? '실시간 리포트' : '샘플 리포트'

  if (live && !liveReadDone) {
    return (
      <div className="min-h-dvh bg-[#fbf9f5] px-4 py-16 text-center text-sm text-[#6b6b6b]">리포트를 불러오는 중…</div>
    )
  }

  if (live && liveReadDone && liveReport === null) {
    return (
      <div className="min-h-dvh bg-[#fbf9f5] px-4 py-10">
        <p className="mx-auto max-w-lg rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          저장된 리포트 JSON이 없습니다. 결제 완료 후 다시 시도하거나{' '}
          <Link href="/preview/structured-report" className="font-semibold underline">
            샘플 보기
          </Link>
          로 이동해 주세요.
        </p>
      </div>
    )
  }

  return (
    <MockStructuredReportProvider value={value}>
      <div className="min-h-dvh bg-[#fbf9f5]">
        <header className="sticky top-0 z-40 border-b border-[#e4ddd3] bg-[#fbf9f5]/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3">
            <Link href="/" className="text-xs font-medium text-[#6b6b6b] transition hover:text-[#4d6b46]">
              ← 홈으로
            </Link>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7c9070]">{subtitle}</p>
            <span className="w-12" aria-hidden />
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pb-10 pt-4">
          <StructuredReportPremium />
        </main>
      </div>
    </MockStructuredReportProvider>
  )
}

export default function StructuredReportSamplePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-[#fbf9f5] px-4 py-10 text-center text-sm text-[#6b6b6b]">불러오는 중…</div>
      }
    >
      <StructuredReportInner />
    </Suspense>
  )
}
