import type { Metadata } from 'next'

import { isReportsUuidSegment, sanitizeInternalNextPath } from '@lib/auth/internal-next'
import { maskEmailForDisplay } from '@lib/auth/mask-email'
import { SITE_OG_IMAGE } from '@lib/site-og'
import { createServiceRoleClient } from '@lib/supabase/admin'

import { ReportAccessExpiredClient } from './ReportAccessExpiredClient'

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const DESC = '리포트 열람 기간 안내 — 등록하신 이메일로 다시 입장하실 수 있어요.'

export const metadata: Metadata = {
  title: '열람 기간 안내 — 킨드라 Kindra',
  description: DESC,
  robots: { index: false, follow: false },
  alternates: { canonical: '/auth/report-access-expired' },
  openGraph: {
    title: '열람 기간 안내 — 킨드라 Kindra',
    description: DESC,
    url: '/auth/report-access-expired',
    images: [SITE_OG_IMAGE],
  },
}

type PageProps = {
  searchParams: Promise<{ next?: string }>
}

function parentEmailFromReportJson(reportJson: unknown): string | null {
  if (!reportJson || typeof reportJson !== 'object') return null
  const o = reportJson as Record<string, unknown>
  if (typeof o.parentEmail === 'string' && o.parentEmail.trim()) {
    return o.parentEmail.trim().toLowerCase()
  }
  return null
}

/**
 * 리포트 게이트에서 잠금 해제 쿠키가 없거나 만료된 경우 표시됩니다.
 */
export default async function ReportAccessExpiredPage({ searchParams }: PageProps) {
  const { next: nextRaw } = await searchParams
  const safeNext = sanitizeInternalNextPath(nextRaw)
  const loginHref =
    safeNext !== '/' ? `/auth/login?next=${encodeURIComponent(safeNext)}` : '/auth/login'

  const reportsPath = /^\/reports\/([0-9a-f-]{36})\/?$/i.exec(safeNext)
  const reportUuid = reportsPath?.[1]?.toLowerCase() ?? null

  let maskedEmail: string | null = null
  if (reportUuid && isReportsUuidSegment(reportUuid)) {
    try {
      const admin = createServiceRoleClient()
      const { data: row } = await admin
        .from('kindra_reports')
        .select('owner_email, report_json')
        .eq('id', reportUuid)
        .maybeSingle()

      if (row) {
        let raw =
          typeof (row as { owner_email?: string | null }).owner_email === 'string'
            ? (row as { owner_email: string }).owner_email.trim().toLowerCase()
            : ''
        if (!raw) {
          const fromJson = parentEmailFromReportJson((row as { report_json?: unknown }).report_json)
          if (fromJson) raw = fromJson
        }
        if (raw && emailRe.test(raw)) {
          maskedEmail = maskEmailForDisplay(raw)
        }
      }
    } catch {
      maskedEmail = null
    }
  }

  return (
    <ReportAccessExpiredClient
      safeNext={safeNext}
      reportUuid={reportUuid && isReportsUuidSegment(reportUuid) ? reportUuid : null}
      maskedEmail={maskedEmail}
      loginHref={loginHref}
    />
  )
}
