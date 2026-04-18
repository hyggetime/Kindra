import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getReportVisits, type ReportVisitRecord } from '../lib/reportVisitStorage'

export function RecentReportBanner() {
  const location = useLocation()
  const [visits, setVisits] = useState<ReportVisitRecord[]>(() => getReportVisits())

  useEffect(() => {
    setVisits(getReportVisits())
  }, [location.pathname])

  if (visits.length === 0) return null

  return (
    <div className="border-b border-[#E8E4DC] bg-[#F4F7F2] px-5 py-3">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-2 text-center text-sm">
        {visits.map((v) => (
          <Link
            key={v.reportId}
            to={`/report/${v.slug}`}
            className="font-medium text-[#7C9070] underline-offset-4 transition hover:text-[#4F6048] hover:underline"
          >
            {v.childShortName}의 지난 기록 보기
          </Link>
        ))}
      </div>
    </div>
  )
}
