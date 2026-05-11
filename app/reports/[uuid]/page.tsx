import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import jioJson from '@/data/reports/jio.json'
import type { KindraReportPageData } from '@/types/kindraReportPage'
import { isReportsUuidSegment } from '@lib/auth/internal-next'
import { KINDRA_JIO_REPORT_UUID } from '@lib/reports/kindra-static-demo-report'
import {
  fallbackReportListMetadata,
  metadataForResolvedReport,
  reportShareTitle,
} from '@lib/reports/report-share-metadata'
import { resolveReportJson } from '@lib/reports/resolve-report-json'
import { createServerSupabaseClient } from '@lib/supabase/server'
import { getSiteOrigin } from '@lib/site-origin'
import { IntakeReportDocument } from '@/components/intake/IntakeReportDocument'
import { ReportDocument } from '@/views/reports/ReportDocument'

import { ReportFeedbackSection } from '../ReportFeedbackSection'

type PageProps = { params: Promise<{ uuid: string }> }

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { uuid: raw } = await params
  const uuid = raw.trim().toLowerCase()
  const origin = getSiteOrigin()

  if (!isReportsUuidSegment(uuid)) {
    return fallbackReportListMetadata()
  }

  if (uuid === KINDRA_JIO_REPORT_UUID) {
    const data = jioJson as KindraReportPageData
    const resolved = { variant: 'kindra_page' as const, data }
    return metadataForResolvedReport(resolved, origin, data.childShortName)
  }

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('kindra_reports')
    .select('report_json')
    .eq('id', uuid)
    .maybeSingle()

  if (error || !data?.report_json) {
    return {
      ...fallbackReportListMetadata(),
      title: reportShareTitle(undefined),
    }
  }

  const resolved = resolveReportJson(data.report_json as unknown)
  if (!resolved) {
    return fallbackReportListMetadata()
  }

  const child =
    resolved.variant === 'kindra_page'
      ? resolved.data.childShortName
      : resolved.session.childShortName

  return metadataForResolvedReport(resolved, origin, child)
}

/**
 * Supabase `kindra_reports.report_json` (RLS: JWT 이메일 = 행의 email) 또는
 * 고정 UUID 예시 리포트(`data/reports/jio.json`).
 */
export default async function ReportByUuidPage({ params }: PageProps) {
  const { uuid: raw } = await params
  const uuid = raw.trim().toLowerCase()

  if (!isReportsUuidSegment(uuid)) notFound()

  if (uuid === KINDRA_JIO_REPORT_UUID) {
    const data = jioJson as KindraReportPageData
    return <ReportDocument data={data} canonicalReportUuid={uuid} />
  }

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('kindra_reports')
    .select('report_json, intake_id')
    .eq('id', uuid)
    .maybeSingle()

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
    .eq('report_id', uuid)
    .maybeSingle()
  if (feedbackError && !/relation|does not exist/i.test(feedbackError.message)) {
    console.warn('[reports] kindra_feedbacks probe:', feedbackError.message)
  }
  const initialHasFeedback = Boolean(!feedbackError && feedbackRow?.id)

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
    const analysisWaiting =
      intakeGeminiStatus === 'pending' ||
      intakeGeminiStatus === 'running' ||
      (Boolean(resolved.session.analysisPending) && !String(resolved.session.markdown ?? '').trim())

    return (
      <>
        <IntakeReportDocument
          payload={resolved.session}
          reportUuid={uuid}
          intakeGeminiStatus={intakeGeminiStatus}
          intakeGeminiError={intakeGeminiError}
        />
        {!analysisWaiting && intakeGeminiStatus !== 'failed' ? (
          <ReportFeedbackSection
            reportId={uuid}
            initialHasFeedback={initialHasFeedback}
            applicantSalutation={resolved.session.subject.applicantLabel}
          />
        ) : null}
      </>
    )
  }
  return (
    <>
      <ReportDocument data={resolved.data} canonicalReportUuid={uuid} />
      <ReportFeedbackSection reportId={uuid} initialHasFeedback={initialHasFeedback} />
    </>
  )
}
