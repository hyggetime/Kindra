'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { StructuredReportLoading } from '@/components/preview/StructuredReportLoading'
import { StructuredReportPremium } from '@/components/preview/StructuredReportPremium'
import { MockStructuredReportProvider } from '@/lib/MockStructuredReportContext'
import { MOCK_KINDRA_STRUCTURED_REPORT } from '@/lib/kindraStructuredReportMock'
import type { KindraStructuredReportJson } from '@/lib/kindraStructuredReportTypes'
import {
  getKindraWebApiOrigin,
  getStructuredReportApiUrl,
  loadGalleryImagesAsInlineData,
  postStructuredReportAnalysis,
  readFileAsInlineImage,
} from '@/lib/structuredReportLive'

type View = 'loading' | 'result'
type LivePhase = 'idle' | 'loading' | 'success' | 'error'

/** 루트 `generateKindraStructuredChartReport`에 넘길 컨텍스트(테스트용) */
const DEFAULT_LIVE_CONTEXT: Record<string, unknown> = {
  childDisplayName: 'testkid1',
  childGenderLabel: '여아',
  childGenderCode: 'female',
  completedMonths: 66,
  childAgeHint: '2020.10.22 생, 생후 약 66개월',
  parentNote: '키 110.8cm, 몸무게 19.5kg (참고)',
  heightCm: 110.8,
  weightKg: 19.5,
}

const LIVE_GUIDE_MAX_SEC = 90

/**
 * Mock → 루트 API(`generateKindraStructuredChartReport`) 실시간 연동 프리뷰.
 * 개발: 루트 `npm run dev`(:3000) + 미니앱 `npm run dev`(:3010), `NEXT_PUBLIC_KINDRA_WEB_API_ORIGIN` 확인.
 */
export default function StructuredReportPreviewPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [view, setView] = useState<View>('result')
  const [reportData, setReportData] = useState<KindraStructuredReportJson>(MOCK_KINDRA_STRUCTURED_REPORT)
  const [livePhase, setLivePhase] = useState<LivePhase>('idle')
  const [liveError, setLiveError] = useState<string | null>(null)
  const [elapsedSec, setElapsedSec] = useState(0)
  const [usedLiveData, setUsedLiveData] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const abortRef = useRef<AbortController | null>(null)
  const tickRef = useRef<number | null>(null)

  const showLoadingBriefly = useCallback(() => {
    if (livePhase === 'loading') return
    setView('loading')
    window.setTimeout(() => setView('result'), 100)
  }, [livePhase])

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
      if (tickRef.current != null) window.clearInterval(tickRef.current)
    }
  }, [])

  const startElapsedTicker = useCallback(() => {
    setElapsedSec(0)
    if (tickRef.current != null) window.clearInterval(tickRef.current)
    tickRef.current = window.setInterval(() => setElapsedSec((s) => s + 1), 1000)
  }, [])

  const stopElapsedTicker = useCallback(() => {
    if (tickRef.current != null) {
      window.clearInterval(tickRef.current)
      tickRef.current = null
    }
  }, [])

  const runLiveAnalysis = useCallback(async () => {
    setLiveError(null)
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    const signal = abortRef.current.signal

    setLivePhase('loading')
    setView('loading')
    startElapsedTicker()

    const origin = getKindraWebApiOrigin()
    let images: { mimeType: string; base64: string }[]

    try {
      if (pendingFiles.length > 0) {
        const n = Math.min(5, pendingFiles.length)
        images = await Promise.all(pendingFiles.slice(0, n).map((f) => readFileAsInlineImage(f)))
      } else {
        images = await loadGalleryImagesAsInlineData(origin)
      }

      const report = await postStructuredReportAnalysis(images, DEFAULT_LIVE_CONTEXT, signal)
      if (signal.aborted) return

      setReportData(report)
      setUsedLiveData(true)
      setLivePhase('success')
      setView('result')
    } catch (e) {
      if (signal.aborted) return
      setLivePhase('error')
      setLiveError(e instanceof Error ? e.message : String(e))
      setView('result')
    } finally {
      stopElapsedTicker()
    }
  }, [pendingFiles, startElapsedTicker, stopElapsedTicker])

  const resetToMock = useCallback(() => {
    abortRef.current?.abort()
    stopElapsedTicker()
    setReportData(MOCK_KINDRA_STRUCTURED_REPORT)
    setUsedLiveData(false)
    setLivePhase('idle')
    setLiveError(null)
    setView('result')
  }, [stopElapsedTicker])

  const busy = livePhase === 'loading'
  const apiOrigin = getKindraWebApiOrigin()

  return (
    <MockStructuredReportProvider value={reportData}>
      <div className="min-h-dvh bg-[#fbf9f5] pb-8">
        <nav className="sticky top-0 z-40 border-b border-[#e4ddd3] bg-[#fbf9f5]/95 px-4 py-3 backdrop-blur-sm">
          <div className="mx-auto flex max-w-lg flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7c9070]">preview</p>
                {usedLiveData ? (
                  <span className="rounded-full bg-[#2f3d2e] px-2 py-0.5 text-[10px] font-bold text-white">LIVE</span>
                ) : (
                  <span className="rounded-full bg-[#dcd5cc] px-2 py-0.5 text-[10px] font-semibold text-[#5c5c5c]">MOCK</span>
                )}
              </div>
              <p className="max-w-[14rem] truncate font-mono text-[10px] text-[#8a8a8a]" title={getStructuredReportApiUrl()}>
                API: {getStructuredReportApiUrl()}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => {
                  const list = e.target.files
                  if (!list?.length) {
                    setPendingFiles([])
                    return
                  }
                  setPendingFiles(Array.from(list).slice(0, 5))
                  e.target.value = ''
                }}
              />
              <button
                type="button"
                disabled={busy}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#3d3d3d] ring-1 ring-[#dcd5cc] disabled:opacity-40"
              >
                이미지 선택 (0~5)
              </button>
              <span className="text-[11px] text-[#6b6b6b]">
                {pendingFiles.length > 0 ? `${pendingFiles.length}장 선택됨` : '미선택 시 루트 갤러리 5장'}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={runLiveAnalysis}
                className="rounded-full bg-[#2f3d2e] px-4 py-2 text-xs font-bold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-40"
              >
                실제 엔드포인트 실시간 분석 가동
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={resetToMock}
                className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#5c5c5c] ring-1 ring-[#e4c4c4]"
              >
                Mock으로 되돌리기
              </button>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-[#ebe6df] pt-2">
              <button
                type="button"
                disabled={busy}
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
                disabled={busy}
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
                disabled={busy}
                className="rounded-full bg-[#7c9070] px-3 py-1.5 text-xs font-semibold text-white shadow-sm"
                onClick={showLoadingBriefly}
                title="로딩만 0.1초 보였다가 결과로"
              >
                0.1s 플래시
              </button>
            </div>

            <p className="text-[10px] leading-relaxed text-[#7a7a7a]">
              루트 앱 <code className="rounded bg-[#eee9e2] px-1">{apiOrigin}</code> 가 떠 있어야 하며,{' '}
              <code className="rounded bg-[#eee9e2] px-1">GEMINI_API_KEY</code> ·{' '}
              <code className="rounded bg-[#eee9e2] px-1">development</code> 또는{' '}
              <code className="rounded bg-[#eee9e2] px-1">ALLOW_PROMPT_PLAYGROUND=1</code> 이 필요합니다.
            </p>
          </div>
        </nav>

        <main className="mx-auto max-w-lg px-4 pt-5">
          {liveError ? (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
              {liveError}
            </div>
          ) : null}

          {view === 'loading' ? (
            <StructuredReportLoading
              liveGuide={livePhase === 'loading'}
              elapsedSeconds={elapsedSec}
              maxGuideSeconds={LIVE_GUIDE_MAX_SEC}
            />
          ) : (
            <StructuredReportPremium />
          )}
        </main>
      </div>
    </MockStructuredReportProvider>
  )
}
