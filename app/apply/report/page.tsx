import type { Metadata } from 'next'
import { parseReportIdParam } from '@lib/payment/parse-payment-page-params'
import { createServerSupabaseClient } from '@lib/supabase/server'

import { IntakeReportView } from './IntakeReportView'

export const metadata: Metadata = {
  title: '통합 분석 리포트 — 킨드라 Kindra',
  description: '신청 직후 확인하는 아이 그림 통합 마음 지도 리포트입니다.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/apply/report' },
}

type PageProps = {
  searchParams: Promise<{ report?: string }>
}

export default async function ApplyReportPage({ searchParams }: PageProps) {
  const { report } = await searchParams
  const reportUuid = parseReportIdParam(report)
  let initialHasFeedback = false
  if (reportUuid) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('kindra_feedbacks')
      .select('id')
      .eq('report_id', reportUuid)
      .maybeSingle()
    if (!error && data?.id) initialHasFeedback = true
  }

  return (
    <IntakeReportView
      reportUuidForFeedback={reportUuid}
      initialHasFeedback={initialHasFeedback}
    />
  )
}
