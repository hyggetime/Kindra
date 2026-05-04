import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { isReportsUuidSegment } from '@lib/auth/internal-next'
import { resolveReportJson } from '@lib/reports/resolve-report-json'
import { createServiceRoleClient } from '@lib/supabase/admin'
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
  const { data, error } = await supabase.from('kindra_reports').select('report_json').eq('id', id).maybeSingle()

  if (error || !data?.report_json) notFound()

  const resolved = resolveReportJson(data.report_json as unknown)
  if (!resolved) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-sm text-[#5A5A5A]">
        <p className="font-medium text-[#3D3D3D]">지원하지 않는 report_json 형식입니다.</p>
      </div>
    )
  }

  if (resolved.variant === 'intake_session') {
    return <IntakeReportDocument payload={resolved.session} reportUuid={id} />
  }
  return <ReportDocument data={resolved.data} canonicalReportUuid={id} />
}
