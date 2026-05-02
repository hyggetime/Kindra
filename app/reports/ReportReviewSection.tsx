'use client'

import { useCallback, useState, useTransition } from 'react'

import { saveKindraReportReview } from './actions'

type Props = {
  reportId: string
  initialReviewText: string | null
}

export function ReportReviewSection({ reportId, initialReviewText }: Props) {
  const [text, setText] = useState(initialReviewText ?? '')
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      setErr(null)
      startTransition(() => {
        void saveKindraReportReview(reportId, text).then((r) => {
          if (!r.ok) {
            setErr(r.message ?? '저장에 실패했습니다.')
            return
          }
          setSavedAt(new Date().toLocaleString('ko-KR', { dateStyle: 'medium', timeStyle: 'short' }))
        })
      })
    },
    [reportId, text],
  )

  return (
    <section className="border-t border-[#EDE8E0] bg-[#FAF8F5] px-5 py-10 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-base font-semibold tracking-tight text-[#2F3D2E]">짧은 후기를 남겨 주세요</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#6B6B6B]">
          리포트가 도움이 되었는지, 한두 문장만 적어 주셔도 큰 힘이 됩니다. (선택, 최대 2,000자)
        </p>
        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={2000}
            rows={4}
            disabled={pending}
            placeholder="예: 차분한 톤이 좋았어요. 아이 그림을 다시 보게 됐어요."
            className="w-full resize-y rounded-xl border border-[#E8E4DC] bg-[#FDFBF9] px-4 py-3 text-sm text-[#3D3D3D] outline-none ring-[#7C9070]/20 focus:border-[#7C9070]/45 focus:ring-2 disabled:opacity-60"
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs tabular-nums text-[#9A9A9A]">{text.length} / 2,000</p>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#7C9070] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#687D5D] disabled:opacity-60"
            >
              {pending ? '저장 중…' : '후기 저장'}
            </button>
          </div>
          {err ? <p className="text-sm text-[#B85C5C]">{err}</p> : null}
          {savedAt && !err ? (
            <p className="text-sm font-medium text-[#4F6048]" role="status">
              저장했습니다. ({savedAt})
            </p>
          ) : null}
        </form>
      </div>
    </section>
  )
}
