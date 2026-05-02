import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isReportsUuidSegment } from '@lib/auth/internal-next'
import { resolveReportJson } from '@lib/reports/resolve-report-json'
import { createServerSupabaseClient } from '@lib/supabase/server'
import { IntakeReportDocument } from '@/components/intake/IntakeReportDocument'
import { ReportDocument } from '@/views/reports/ReportDocument'

import { ReportReviewSection } from '../ReportReviewSection'

type PageProps = { params: Promise<{ id: string }> }

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  if (!isReportsUuidSegment(id)) return { title: '리포트 — Kindra' }
  return { title: `리포트 ${id.slice(0, 8)}… — Kindra`, robots: { index: false, follow: false } }
}

/**
 * Supabase `kindra_reports.report_json` (RLS: JWT 이메일 = 행의 email) 를 표시합니다.
 * 로컬·DB 없음 시에는 행이 없어 404 가 납니다.
 */
export default async function ReportByIdPage({ params }: PageProps) {
  const { id } = await params
  if (!isReportsUuidSegment(id)) notFound()

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('kindra_reports')
    .select('report_json, review_text')
    .eq('id', id)
    .maybeSingle()

  if (error || !data?.report_json) notFound()

  const reviewText = typeof (data as { review_text?: unknown }).review_text === 'string'
    ? (data as { review_text: string }).review_text
    : null

  const resolved = resolveReportJson(data.report_json as unknown)
  if (!resolved) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-sm text-[#5A5A5A]">
        <p className="font-medium text-[#3D3D3D]">리포트 데이터 형식을 표시할 수 없습니다.</p>
        <p className="mt-2">관리자에게 `report_json` 형식을 확인해 달라고 요청해 주세요.</p>
      </div>
    )
  }

  if (resolved.variant === 'intake_session') {
    return (
      <>
        <IntakeReportDocument payload={resolved.session} />
        <ReportReviewSection reportId={id} initialReviewText={reviewText} />
      </>
    )
  }
  return (
    <>
      <ReportDocument data={resolved.data} />
      <ReportReviewSection reportId={id} initialReviewText={reviewText} />
    </>
  )
}
