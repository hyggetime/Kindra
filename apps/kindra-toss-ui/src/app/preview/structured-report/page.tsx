'use client'

import { useCallback, useState } from 'react'

import { StructuredReportLoading } from '@/components/preview/StructuredReportLoading'
import { StructuredReportPremium } from '@/components/preview/StructuredReportPremium'
import { MockStructuredReportProvider } from '@/lib/MockStructuredReportContext'
import { MOCK_KINDRA_STRUCTURED_REPORT } from '@/lib/kindraStructuredReportMock'

type View = 'loading' | 'result'

/**
 * 고정 Mock JSON으로 프리미엄 리포트·대기 UI를 즉시 전환해 볼 수 있는 개발 전용 화면.
 * @see docs/architecture/TOSS_MINIAPP_BRANCH_PLAN.md
 */
export default function StructuredReportPreviewPage() {
  const [view, setView] = useState<View>('result')

  const showLoadingBriefly = useCallback(() => {
    setView('loading')
    window.setTimeout(() => setView('result'), 100)
  }, [])

  return (
    <MockStructuredReportProvider value={MOCK_KINDRA_STRUCTURED_REPORT}>
      <div className="min-h-dvh bg-[#fbf9f5] pb-8">
        <nav className="sticky top-0 z-40 border-b border-[#e4ddd3] bg-[#fbf9f5]/95 px-4 py-3 backdrop-blur-sm">
          <div className="mx-auto flex max-w-lg flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7c9070]">mock preview</p>
            <div className="flex gap-2">
              <button
                type="button"
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  view === 'loading'
                    ? 'bg-[#2f3d2e] text-white shadow'
                    : 'bg-white text-[#3d3d3d] ring-1 ring-[#dcd5cc]'
                }`}
                onClick={() => setView('loading')}
              >
                대기 UI
              </button>
              <button
                type="button"
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  view === 'result'
                    ? 'bg-[#2f3d2e] text-white shadow'
                    : 'bg-white text-[#3d3d3d] ring-1 ring-[#dcd5cc]'
                }`}
                onClick={() => setView('result')}
              >
                결과
              </button>
              <button
                type="button"
                className="rounded-full bg-[#7c9070] px-3 py-1.5 text-xs font-semibold text-white shadow-sm"
                onClick={showLoadingBriefly}
                title="로딩만 0.1초 보였다가 결과로"
              >
                0.1s 플래시
              </button>
            </div>
          </div>
        </nav>

        <main className="mx-auto max-w-lg px-4 pt-5">
          {view === 'loading' ? <StructuredReportLoading /> : <StructuredReportPremium />}
        </main>
      </div>
    </MockStructuredReportProvider>
  )
}
