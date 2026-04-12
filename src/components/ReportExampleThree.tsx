import { useEffect, useMemo, useState } from 'react'
import type { ReportExample3Data } from '../types/reportExample3'
import { GrowthChart } from './GrowthChart'

function shortLabel(category: string): string {
  const t = category.trim()
  return t.length > 8 ? `${t.slice(0, 7)}…` : t
}

function evidenceBlocks(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

const sectionStyles = [
  { border: 'border-[#A45C40]/40', chip: 'bg-[#A45C40]/12 text-[#8B4A32]' },
  { border: 'border-[#C8A47E]/45', chip: 'bg-[#C8A47E]/25 text-[#6B5A42]' },
  { border: 'border-[#7C9070]/40', chip: 'bg-[#7C9070]/15 text-[#4F6048]' },
  { border: 'border-[#8B7BA8]/35', chip: 'bg-[#E8E4F0] text-[#5C5470]' },
]

export function ReportExampleThree() {
  const [data, setData] = useState<ReportExample3Data | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/report_example3.json')
      .then((r) => {
        if (!r.ok) throw new Error('예시 3 데이터를 불러올 수 없습니다.')
        return r.json()
      })
      .then((json: ReportExample3Data) => {
        if (!cancelled) setData(json)
      })
      .catch(() => {
        if (!cancelled) setError('report_example3.json을 불러오지 못했습니다.')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const chartSeries = useMemo(() => {
    if (!data?.sections?.length) return []
    return data.sections.map((s) => ({
      label: shortLabel(s.category),
      value: s.score,
    }))
  }, [data])

  if (error) {
    return (
      <p className="rounded-2xl border border-red-100 bg-red-50/80 px-4 py-3 text-center text-sm text-red-800">
        {error}
      </p>
    )
  }

  if (!data) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-[#E8E4DC] bg-white/60">
        <p className="text-sm text-[#6B6B6B]">예시 3를 불러오는 중…</p>
      </div>
    )
  }

  const titleEmoji = data.report_title_emoji ?? ''

  return (
    <div className="mx-auto max-w-4xl overflow-hidden rounded-[28px] border border-[#E8E4DC] bg-[#FDFBF9] text-[#4A4A4A] shadow-[0_20px_50px_-24px_rgba(74,74,74,0.2)]">
      <header className="border-b border-[#EDE8E0] bg-white/50 px-6 py-8 text-center sm:px-10 sm:py-10">
        <p className="mb-2 font-mono text-xs text-[#8A8A8A]">{data.report_id}</p>
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#7C9070]/90">
          {data.project_name}
        </p>
        <h2 className="mt-3 text-balance text-xl font-bold leading-snug text-[#7C9070] sm:text-2xl md:text-[1.65rem]">
          {titleEmoji ? `${titleEmoji} ` : ''}
          {data.report_title}
        </h2>
        <p className="mt-4 text-sm text-[#6B6B6B]">{data.subject}</p>
        <p className="mt-1 text-sm text-[#6B6B6B]">{data.observation}</p>
        {chartSeries.length > 0 ? (
          <div className="mx-auto mt-8 max-w-md">
            <GrowthChart label="영역별 종합 점수" series={chartSeries} />
          </div>
        ) : null}
      </header>

      <div className="space-y-10 px-6 py-10 sm:px-10">
        {data.sections.map((sec, idx) => {
          const st = sectionStyles[idx % sectionStyles.length]
          return (
            <article
              key={sec.id}
              className={`rounded-2xl border border-[#EDE8E0] border-l-[5px] ${st.border} bg-white p-6 shadow-sm sm:p-8`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8A8A]">
                {sec.section_heading}
              </p>
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${st.chip}`}
                  >
                    {sec.category}
                  </span>
                  <h3 className="mt-3 text-balance text-lg font-semibold leading-snug text-[#3D3D3D] sm:text-xl">
                    {sec.title}
                  </h3>
                </div>
                <div className="shrink-0">
                  <div className="inline-flex flex-col rounded-2xl bg-[#F3EFE0] px-4 py-2.5 text-right sm:px-5 sm:py-3">
                    <span className="text-2xl font-bold tabular-nums text-[#7C9070] sm:text-3xl">
                      {sec.score}
                    </span>
                    <span className="text-[11px] font-medium text-[#6B6B6B]">/ 100</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#EDE8E0]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#7C9070] to-[#9AAF8E]"
                  style={{ width: `${Math.min(100, Math.max(0, sec.score))}%` }}
                />
              </div>

              <div className="mt-6 rounded-2xl border border-[#E8E4DC] bg-[#FAFAF8] p-5 sm:p-6">
                <h4 className="text-sm font-semibold text-[#5C6656]">이 관점에서의 접근</h4>
                <p className="mt-2 text-sm leading-[1.85] text-[#4A4A4A]/95">{sec.approach_intro}</p>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-semibold text-[#4A4A4A]">분석 내용</h4>
                <ul className="mt-3 space-y-4">
                  {sec.analysis_items.map((item) => (
                    <li key={item.focus} className="text-sm leading-[1.85] text-[#4A4A4A]/95">
                      <span className="font-semibold text-[#7C9070]">{item.focus}</span>
                      <span className="text-[#4A4A4A]"> — {item.detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 rounded-2xl bg-[#F7F5F2] p-5 sm:p-6">
                <h4 className="text-sm font-semibold text-[#687D5D]">관찰 근거</h4>
                <div className="mt-3 space-y-3 text-sm leading-[1.85] text-[#4A4A4A]/95">
                  {evidenceBlocks(sec.evidence).map((block, i) => (
                    <p key={i}>{block}</p>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-[#E8E4DC] bg-[#FFFBF7] p-5 sm:p-6">
                <h4 className="text-sm font-semibold text-[#A45C40]">도우미의 한마디</h4>
                <p className="mt-2 text-sm leading-[1.85] text-[#4A4A4A]/95">{sec.helper_comment}</p>
              </div>

              <div className="mt-4 flex flex-col gap-2 rounded-2xl bg-[#F3EFE0]/90 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-[#6B6B6B]">
                    기술적 신뢰도 평가
                  </h4>
                  <p className="mt-1 text-lg" aria-label="신뢰도 별점">
                    {sec.technical_trust.stars}
                  </p>
                </div>
                <p className="flex-1 text-xs leading-relaxed text-[#5A5A5A] sm:text-sm">
                  {sec.technical_trust.reason}
                </p>
              </div>
            </article>
          )
        })}
      </div>

      <footer className="border-t border-[#EDE8E0] bg-[#F3EFE0]/80 px-6 py-8 sm:px-10">
        <h4 className="text-center text-sm font-semibold text-[#7C9070]">종합 인사이트</h4>
        <p className="mx-auto mt-4 max-w-3xl text-pretty text-center text-sm leading-[1.9] text-[#4A4A4A] sm:text-base">
          {data.summary_insight}
        </p>
      </footer>
    </div>
  )
}
