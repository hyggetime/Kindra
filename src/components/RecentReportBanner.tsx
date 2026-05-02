import Link from 'next/link'
import { isStaticReportSlug } from '@lib/reports/static-report-slugs'
import { getReportVisits, type ReportVisitRecord } from '../lib/reportVisitStorage'

/** 홈(`/`) 전용 — 마운트 시마다 localStorage 에서 최근 리포트 링크를 읽습니다. */
export function RecentReportBanner() {
  const visits: ReportVisitRecord[] = getReportVisits().filter((v) => isStaticReportSlug(v.slug))

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
