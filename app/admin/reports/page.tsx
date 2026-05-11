import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getRequestSiteOrigin } from '@lib/site-origin-request.server'

import { AdminReportsTable } from './AdminReportsTable'
import { loadAdminReportRows } from './load-rows'

export const metadata: Metadata = {
  title: '리포트 발송 관리 — Kindra',
  robots: { index: false, follow: false },
}

type PageProps = {
  searchParams: Promise<{ pw?: string }>
}

export default async function AdminReportsPage({ searchParams }: PageProps) {
  const { pw = '' } = await searchParams
  const expected = process.env.ADMIN_PASSWORD
  if (typeof expected !== 'string' || expected.length === 0 || pw !== expected) {
    notFound()
  }

  const loaded = await loadAdminReportRows(pw)
  if (!loaded.ok) notFound()

  const origin = await getRequestSiteOrigin()

  return (
    <main className="min-h-screen bg-[#FAF8F5] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-xl font-bold tracking-tight text-[#3D3D3D] sm:text-2xl">
          킨드라 관리자 - 리포트 발송 관리
        </h1>
        <AdminReportsTable rows={loaded.rows} adminPw={pw} origin={origin} />
      </div>
    </main>
  )
}
