import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { isReportsUuidSegment } from '@lib/auth/internal-next'
import { resolveReportJson } from '@lib/reports/resolve-report-json'
import { createServiceRoleClient } from '@lib/supabase/admin'
import { ReportFeedbackSection } from '@app/reports/ReportFeedbackSection'
import { IntakeReportDocument } from '@/components/intake/IntakeReportDocument'
import { ReportDocument } from '@/views/reports/ReportDocument'

export const metadata: Metadata = {
  title: '리포트 미리보기 — Kindra',
  robots: { index: false, follow: false },
}

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ pw?: string }>
}

export const dynamic = 'force-dynamic'

export default async function AdminReportPreviewPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { pw = '' } = await searchParams
  const expected = process.env.ADMIN_PASSWORD
  if (typeof expected !== 'string' || expected.length === 0 || pw !== expected) {
    notFound()
  }
  if (!isReportsUuidSegment(id)) notFound()

  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.from('kindra_reports').select('report_json, intake_id').eq('id', id).maybeSingle()

  if (error || !data?.report_json) notFound()

  let intakeGeminiStatus: string | null = null
  let intakeGeminiError: string | null = null
  const intakeFk = (data as { intake_id?: string | null }).intake_id
  if (intakeFk && typeof intakeFk === 'string') {
    const ir = await supabase
      .from('kindra_intakes')
      .select('gemini_status, gemini_error')
      .eq('id', intakeFk)
      .maybeSingle()
    if (ir.data) {
      intakeGeminiStatus =
        typeof (ir.data as { gemini_status?: string }).gemini_status === 'string'
          ? (ir.data as { gemini_status: string }).gemini_status
          : null
      const ge = (ir.data as { gemini_error?: string | null }).gemini_error
      intakeGeminiError = typeof ge === 'string' ? ge : null
    }
  }

  const { data: feedbackRow, error: feedbackError } = await supabase
    .from('kindra_feedbacks')
    .select('id')
    .eq('report_id', id)
    .maybeSingle()
  if (feedbackError && !/relation|does not exist/i.test(feedbackError.message)) {
    console.warn('[admin/preview] kindra_feedbacks probe:', feedbackError.message)
  }
  const initialHasFeedback = Boolean(!feedbackError && feedbackRow?.id)

  const resolved = resolveReportJson(data.report_json as unknown)
  if (!resolved) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-sm text-[#5A5A5A]">
        <p className="font-medium text-[#3D3D3D]">지원하지 않는 report_json 형식입니다.</p>
      </div>
    )
  }

  if (resolved.variant === 'intake_session') {
    const analysisWaiting =
      intakeGeminiStatus === 'pending' ||
      intakeGeminiStatus === 'running' ||
      (Boolean(resolved.session.analysisPending) && !String(resolved.session.markdown ?? '').trim())

    return (
      <>
        <IntakeReportDocument
          payload={resolved.session}
          reportUuid={id}
          intakeGeminiStatus={intakeGeminiStatus}
          intakeGeminiError={intakeGeminiError}
        />
        {!analysisWaiting && intakeGeminiStatus !== 'failed' ? (
          <ReportFeedbackSection
            reportId={id}
            initialHasFeedback={initialHasFeedback}
            applicantSalutation={resolved.session.subject.applicantLabel}
          />
        ) : null}
      </>
    )
  }
  return (
    <>
      <ReportDocument data={resolved.data} canonicalReportUuid={id} />
      <ReportFeedbackSection reportId={id} initialHasFeedback={initialHasFeedback} />
    </>
  )
}
