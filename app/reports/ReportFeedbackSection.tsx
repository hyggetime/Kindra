'use client'

import { useCallback, useState, useTransition } from 'react'

import { submitKindraReportFeedback } from './feedback-actions'

const RATING_SCALE = [1, 2, 3, 4, 5] as const

function StarGlyph({ filled, className }: { filled: boolean; className?: string }) {
  if (filled) {
    return (
      <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path
          fill="currentColor"
          d="M10.788 3.21c.448-1.078 1.999-1.078 2.447 0l2.276 5.455 5.893.43c1.102.08 1.549 1.421.762 2.126l-4.53 3.922 1.395 5.756c.253 1.047-1.014 1.857-2.014 1.314L12 18.25l-5.018 2.995c-1 .543-2.267-.267-2.014-1.314l1.395-5.756-4.53-3.922c-.787-.705-.34-2.046.762-2.126l5.893-.43 2.276-5.455z"
        />
      </svg>
    )
  }
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
      />
    </svg>
  )
}

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
  const [hoverRating, setHoverRating] = useState<number | null>(null)
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
            <p className="text-xs font-medium text-[#6B6B6B]">만족도</p>
            <div
              className="mt-3 flex flex-wrap items-center gap-3"
              role="group"
              aria-label="만족도 별점"
              onMouseLeave={() => setHoverRating(null)}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) setHoverRating(null)
              }}
            >
              <div className="flex items-center gap-0.5 sm:gap-1">
                {RATING_SCALE.map((n) => {
                  const display = hoverRating ?? rating ?? 0
                  const active = display >= n
                  return (
                    <button
                      key={n}
                      type="button"
                      aria-label={`${n}점`}
                      aria-pressed={rating != null && rating === n}
                      disabled={pending}
                      onMouseEnter={() => setHoverRating(n)}
                      onFocus={() => setHoverRating(n)}
                      onClick={() => setRating((prev) => (prev === n ? null : n))}
                      className={`-m-1 flex h-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-1.5 transition disabled:opacity-60 ${
                        active
                          ? 'text-[#E49B0A] drop-shadow-[0_1px_2px_rgba(228,155,10,0.35)]'
                          : 'text-[#C9C4BC] hover:text-[#A8A29E]'
                      }`}
                    >
                      <StarGlyph filled={active} className="h-8 w-8 sm:h-9 sm:w-9" />
                    </button>
                  )
                })}
              </div>
              {rating != null ? (
                <span className="text-sm tabular-nums font-medium text-[#5A5A5A]">{rating}.0</span>
              ) : (
                <span className="text-xs text-[#9A9A9A]">별을 눌러 평가해 주세요</span>
              )}
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
