'use client'

import Link from 'next/link'

import { StructuredReportPentagon } from '@/components/preview/StructuredReportPentagon'
import { MockStructuredReportProvider, useMockStructuredReport } from '@/lib/MockStructuredReportContext'
import { MOCK_KINDRA_STRUCTURED_REPORT } from '@/lib/kindraStructuredReportMock'
import type { KindraChartScoresJson } from '@/lib/kindraStructuredReportTypes'

function scoreGrade(n: number): { label: string; className: string } {
  if (n >= 90) return { label: '풍부', className: 'bg-[#7c9070]/20 text-[#3d5538]' }
  if (n >= 80) return { label: '안정', className: 'bg-[#f0ebe2] text-[#5a4f3f]' }
  if (n >= 70) return { label: '성장', className: 'bg-amber-100/70 text-amber-800' }
  return { label: '탐색', className: 'bg-[#f4f4f4] text-[#7a7a7a]' }
}

function averageScore(s: KindraChartScoresJson): number {
  const vals = Object.values(s) as number[]
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
}

function ShowcaseInner() {
  const { chart_scores, report_sections } = useMockStructuredReport()
  const avg = averageScore(chart_scores)
  const grade = scoreGrade(avg)

  return (
    <section
      aria-label="프리미엄 리포트 예시"
      className="min-w-0 overflow-hidden rounded-xl border border-[#7c9070]/18 bg-white/85 px-3 pb-3 pt-3 shadow-sm"
    >
      <div className="mb-3 min-w-0 px-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7c9070]">5장 통합 분석</p>
        <h2 className="mt-1 line-clamp-2 text-[15px] font-bold leading-snug tracking-tight text-[#2a3428]">
          {report_sections.title}
        </h2>
      </div>

      <div className="mt-3 h-[200px] w-full min-w-0 rounded-lg border border-[#e8e4dc]/80 bg-[#fdfbf9] px-1 pt-1">
        <StructuredReportPentagon containerClassName="h-full w-full min-w-0" compact />
      </div>

      <div className="mt-2.5 flex flex-col items-center gap-1.5">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold tabular-nums ${grade.className}`}
        >
          종합 · {grade.label} ({avg})
        </span>
        <Link
          href="/preview/structured-report/"
          className="text-[12px] font-medium text-[#4d6b46] underline decoration-[#7c9070]/40 decoration-1 underline-offset-[3px] transition hover:decoration-[#7c9070]"
        >
          샘플 리포트 전체 보기 →
        </Link>
      </div>
    </section>
  )
}

export function ReportShowcaseSection() {
  return (
    <MockStructuredReportProvider value={MOCK_KINDRA_STRUCTURED_REPORT}>
      <ShowcaseInner />
    </MockStructuredReportProvider>
  )
}
