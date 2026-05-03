'use client'

import Link from 'next/link'
import { startTransition, useEffect, useState } from 'react'
import { isStaticReportSlug } from '@lib/reports/static-report-slugs'
import { getReportVisits, type ReportVisitRecord } from '@/lib/reportVisitStorage'

/**
 * 홈(`/`) 상단 “○○의 마음 지도 다시 보기” 띠.
 *
 * `localStorage`의 최근 방문 기록 중, 정적 예시 리포트(`/report/{slug}`)만 노출합니다.
 * 실제 리포트 접근은 미들웨어의 리포트 게이트(`REPORT_GATE_ENABLED`) 등으로 별도 제어됩니다.
 */
export function RecentReportBanner() {
  const [visits, setVisits] = useState<ReportVisitRecord[]>([])

  useEffect(() => {
    const next = getReportVisits().filter((v) => isStaticReportSlug(v.slug))
    startTransition(() => {
      setVisits(next)
    })
  }, [])

  if (visits.length === 0) return null

  return (
    <div className="border-b border-[#E8E4DC] bg-[#F4F7F2] px-5 py-3">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-2 text-center text-sm">
        {visits.map((v) => (
          <Link
            key={v.reportId}
            href={`/report/${v.slug}`}
            className="font-medium text-[#7C9070] underline-offset-4 transition hover:text-[#4F6048] hover:underline"
          >
            {v.childShortName}의 마음 지도 다시 보기
          </Link>
        ))}
      </div>
    </div>
  )
}
