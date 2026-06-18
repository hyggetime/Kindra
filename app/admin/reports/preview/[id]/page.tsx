import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { adminParentEmailFromReportJson } from '@lib/admin/report-json-admin-fields'
import { isReportsUuidSegment } from '@lib/auth/internal-next'
import { resolveReportJson } from '@lib/reports/resolve-report-json'
import { createServiceRoleClient } from '@lib/supabase/admin'
import { ReportFeedbackSection } from '@app/reports/ReportFeedbackSection'
import { IntakeReportDocument } from '@/components/intake/IntakeReportDocument'
import { ReportDocument } from '@/views/reports/ReportDocument'

import { AdminReportPreviewMeta } from '../../AdminReportPreviewMeta'

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
  const { data, error } = await supabase
    .from('kindra_reports')
    .select(
      `
      report_json,
      intake_id,
      owner_email,
      created_at,
      is_sent,
      listed_price_won,
      charged_amount_won,
      toss_payment_key,
      deposit_confirmed,
      channel,
      status,
      email_delivery_error,
      email_delivery_updated_at,
      resend_email_id
    `,
    )
    .eq('id', id)
    .maybeSingle()

  if (error || !data?.report_json) notFound()

  const ownerEmail = typeof data.owner_email === 'string' ? data.owner_email : ''
  const listedRaw = (data as { listed_price_won?: unknown }).listed_price_won
  const listedPriceWon =
    typeof listedRaw === 'number' && Number.isFinite(listedRaw) ? Math.round(listedRaw) : 0
  const chargedRaw = (data as { charged_amount_won?: unknown }).charged_amount_won
  const chargedAmountWon =
    typeof chargedRaw === 'number' && Number.isFinite(chargedRaw) ? Math.round(chargedRaw) : null
  const channelRaw = (data as { channel?: unknown }).channel
  const channel = typeof channelRaw === 'string' && channelRaw.trim() ? channelRaw.trim().toLowerCase() : null
  const statusRaw = (data as { status?: unknown }).status
  const status = typeof statusRaw === 'string' && statusRaw.trim() ? statusRaw.trim().toLowerCase() : null
  const edeRaw = (data as { email_delivery_error?: unknown }).email_delivery_error
  const emailDeliveryError = typeof edeRaw === 'string' && edeRaw.trim() ? edeRaw.trim() : null
  const eduRaw = (data as { email_delivery_updated_at?: unknown }).email_delivery_updated_at
  const emailDeliveryUpdatedAt = typeof eduRaw === 'string' ? eduRaw : null
  const reiRaw = (data as { resend_email_id?: unknown }).resend_email_id
  const resendEmailId = typeof reiRaw === 'string' && reiRaw.trim() ? reiRaw.trim() : null
  const parentEmail = adminParentEmailFromReportJson(data.report_json, ownerEmail)

  const previewMeta = (
    <AdminReportPreviewMeta
      reportId={id}
      adminPw={pw}
      channel={channel}
      status={status}
      emailDeliveryError={emailDeliveryError}
      emailDeliveryUpdatedAt={emailDeliveryUpdatedAt}
      resendEmailId={resendEmailId}
      isSent={Boolean(data.is_sent)}
      listedPriceWon={listedPriceWon}
      chargedAmountWon={chargedAmountWon}
      tossPaymentKey={
        typeof (data as { toss_payment_key?: unknown }).toss_payment_key === 'string'
          ? ((data as { toss_payment_key: string }).toss_payment_key).trim() || null
          : null
      }
      depositConfirmed={Boolean((data as { deposit_confirmed?: unknown }).deposit_confirmed)}
      createdAt={typeof data.created_at === 'string' ? data.created_at : null}
      parentEmail={parentEmail}
    />
  )

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
        {previewMeta}
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
      {previewMeta}
      <ReportDocument data={resolved.data} canonicalReportUuid={id} />
      <ReportFeedbackSection reportId={id} initialHasFeedback={initialHasFeedback} />
    </>
  )
}
