'use client'

import Link from 'next/link'
import { startTransition, useEffect, useState } from 'react'
import { isReportsUuidSegment } from '@lib/auth/internal-next'
import { getReportVisits, type ReportVisitRecord } from '@/lib/reportVisitStorage'

/**
 * 홈(`/`) 상단 “○○의 마음 지도 다시 보기” 띠.
 *
 * `localStorage` 최근 방문 기록 중 유효한 `/reports/{uuid}` 만 연결합니다.
 */
export function RecentReportBanner() {
  const [visits, setVisits] = useState<ReportVisitRecord[]>([])

  useEffect(() => {
    const next = getReportVisits().filter((v) => isReportsUuidSegment(v.reportUuid))
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
            key={v.reportUuid}
            href={`/reports/${v.reportUuid}`}
            className="font-medium text-[#7C9070] underline-offset-4 transition hover:text-[#4F6048] hover:underline"
          >
            {v.childShortName}의 마음 지도 다시 보기
          </Link>
        ))}
      </div>
    </div>
  )
}
