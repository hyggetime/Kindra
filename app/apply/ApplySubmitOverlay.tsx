'use client'

import { useEffect, useState } from 'react'

import { KINDRA_PHILOSOPHY } from '@lib/gemini/prompts'

export type SubmitOverlayPhase = 'submitting' | 'uploading' | 'done'

const SUBMITTING_LINES = [
  '신청 내용을 정리하고 있어요.',
  '전송을 준비하고 있어요.',
  '잠시만 기다려 주세요.',
]

const UPLOADING_LINES = [
  '그림을 업로드하는 중이에요.',
  '자료를 서버로 안전하게 올리고 있어요.',
  '거의 완료되었어요.',
]

const DONE_LINES = ['그림과 정보를 모두 받았어요.', '이제 킨드라가 살펴볼게요.']

type Props = {
  phase: SubmitOverlayPhase
}

export function ApplySubmitOverlay({ phase }: Props) {
  const lines =
    phase === 'submitting' ? SUBMITTING_LINES : phase === 'uploading' ? UPLOADING_LINES : DONE_LINES
  const [lineIndex, setLineIndex] = useState(0)

  useEffect(() => {
    if (lines.length <= 1) return
    const id = window.setInterval(() => {
      setLineIndex((i) => (i + 1) % lines.length)
    }, 2600)
    return () => clearInterval(id)
  }, [lines])

  const line = lines[lineIndex] ?? lines[0]

  const eyebrow =
    phase === 'submitting' ? '전송 중' : phase === 'uploading' ? '그림 업로드 중' : '완료'

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-[#1a1f18]/75 backdrop-blur-md"
      role="alertdialog"
      aria-busy="true"
      aria-live="polite"
      aria-label={eyebrow}
    >
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-28">
        <div className="mx-auto max-w-md text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/55">{eyebrow}</p>
          <p
            key={`${phase}-${lineIndex}`}
            className="kindra-overlay-line mt-6 text-balance text-lg font-medium leading-snug text-white drop-shadow-sm sm:text-xl"
          >
            {line}
          </p>
          {phase !== 'done' ? (
            <p className="mt-8 text-sm leading-relaxed text-white/75">
              전송 완료 후 <span className="font-semibold text-white/95">24시간 이내 발송</span> 예정이에요.
            </p>
          ) : (
            <p className="mt-8 text-sm leading-relaxed text-white/80">잠시 후 안내 화면으로 이어질 거예요.</p>
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 overflow-hidden border-t border-white/10 bg-black/25 py-3">
        <div className="kindra-philosophy-ticker whitespace-nowrap text-[11px] leading-relaxed text-white/45">
          <span className="inline-block pr-20">{KINDRA_PHILOSOPHY}</span>
          <span className="inline-block pr-20" aria-hidden>
            {KINDRA_PHILOSOPHY}
          </span>
        </div>
      </div>
    </div>
  )
}
