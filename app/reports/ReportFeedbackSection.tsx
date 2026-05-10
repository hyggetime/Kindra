'use client'

import { useCallback, useState, useTransition } from 'react'

import { submitKindraReportFeedback } from './feedback-actions'

type Props = {
  reportId: string
  /** 서버에서 이미 피드백 행 존재 여부 */
  initialHasFeedback: boolean
  /** 예: "홍길동 님" — 안내 문구 호칭용 */
  applicantSalutation?: string
}

export function ReportFeedbackSection({
  reportId,
  initialHasFeedback,
  applicantSalutation,
}: Props) {
  const [content, setContent] = useState('')
  const [rating, setRating] = useState<number | null>(null)
  const [done, setDone] = useState(() => initialHasFeedback)
  const [thanks, setThanks] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const honorific =
    applicantSalutation?.trim() ||
    '보호자님'

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      setErr(null)
      startTransition(() => {
        void submitKindraReportFeedback(reportId, content, rating).then((r) => {
          if (!r.ok) {
            if (r.duplicate) {
              setDone(true)
              setThanks(false)
              return
            }
            setErr(r.message ?? '전송에 실패했습니다.')
            return
          }
          setThanks(true)
          setDone(true)
        })
      })
    },
    [reportId, content, rating],
  )

  if (done && thanks) {
    return (
      <section className="border-t border-[#EDE8E0] bg-gradient-to-b from-[#FAF9F7] to-[#F5F2EC] px-5 py-12 sm:px-8 sm:py-14">
        <div className="mx-auto max-w-2xl rounded-2xl border border-[#D4E0D0]/90 bg-[#F8FAF6] px-6 py-8 sm:px-10">
          <p className="text-center text-[0.95rem] font-medium leading-relaxed text-[#4F6048]" role="status">
            소중한 의견 감사합니다! 킨드라가 더 성장하는 밑거름으로 삼을게요.
          </p>
        </div>
      </section>
    )
  }

  if (done && !thanks) {
    return (
      <section className="border-t border-[#EDE8E0] bg-gradient-to-b from-[#FAF9F7] to-[#F5F2EC] px-5 py-12 sm:px-8 sm:py-14">
        <div className="mx-auto max-w-2xl rounded-2xl border border-[#E4DDD3]/90 bg-white/85 px-6 py-8 shadow-[0_12px_40px_-28px_rgba(60,55,45,0.35)] sm:px-10">
          <p className="text-center text-[0.95rem] font-medium leading-relaxed text-[#4F6048]">
            이미 소중한 의견을 남겨주셨습니다. 감사합니다!
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="border-t border-[#EDE8E0] bg-gradient-to-b from-[#FAF9F7] to-[#F5F2EC] px-5 py-12 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7C9070]/90">피드백</p>
        <h2 className="mt-2 text-base font-semibold tracking-tight text-[#2F3D2E]">오늘의 리포트가 어떠셨나요?</h2>
        <p className="mt-3 text-sm leading-[1.85] text-[#5C5C5C]">
          <span className="font-medium text-[#4A4A4A]">{honorific}</span>께 전달되는 소중한 한 줄 평은 킨드라가 아이들의
          마음을 더 깊이 읽는 데 큰 힘이 됩니다.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          <div>
            <p className="text-xs font-medium text-[#6B6B6B]">만족도 (선택)</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`${n}점`}
                  aria-pressed={rating === n}
                  disabled={pending}
                  onClick={() => setRating((prev) => (prev === n ? null : n))}
                  className={`flex h-11 min-w-[2.75rem] items-center justify-center rounded-xl border text-sm font-semibold transition disabled:opacity-60 ${
                    rating === n
                      ? 'border-[#7C9070] bg-[#E8F0E4] text-[#3D4A38]'
                      : 'border-[#E0D9CF] bg-white text-[#8A8A8A] hover:border-[#C5D4BE]'
                  }`}
                >
                  {n}
                </button>
              ))}
              <span className="text-xs text-[#9A9A9A]">1 · · · 5</span>
            </div>
          </div>

          <div>
            <label htmlFor="kindra-feedback-text" className="text-xs font-medium text-[#6B6B6B]">
              의견
            </label>
            <textarea
              id="kindra-feedback-text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={4000}
              rows={5}
              disabled={pending}
              placeholder="솔직한 소감을 남겨 주세요. 짧은 한 줄도 큰 힘이 됩니다."
              className="mt-2 w-full resize-y rounded-2xl border border-[#E8E4DC] bg-[#FDFBF9] px-4 py-3.5 text-sm leading-relaxed text-[#3D3D3D] outline-none ring-[#7C9070]/15 focus:border-[#7C9070]/40 focus:ring-2 disabled:opacity-60"
            />
            <p className="mt-1.5 text-right text-[11px] tabular-nums text-[#9A9A9A]">{content.length} / 4,000</p>
          </div>

          <button
            type="submit"
            disabled={pending || !content.trim()}
            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-[#7C9070] px-8 text-sm font-semibold text-white shadow-[0_8px_28px_-12px_rgba(124,144,112,0.55)] transition hover:bg-[#687D5D] disabled:opacity-50 sm:w-auto"
          >
            {pending ? '보내는 중…' : '보내기'}
          </button>

          {err ? (
            <p className="text-sm text-[#B85C5C]" role="alert">
              {err}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  )
}
