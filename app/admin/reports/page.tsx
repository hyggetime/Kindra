import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { AdminReportsTable } from './AdminReportsTable'
import { loadAdminReportRows } from './load-rows'
import { Step2Toggle } from './Step2Toggle'

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

  const origin = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kindra.ai').replace(/\/$/, '')

  return (
    <main className="min-h-screen bg-[#FAF8F5] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-xl font-bold tracking-tight text-[#3D3D3D] sm:text-2xl">
          킨드라 관리자 - 리포트 발송 관리
        </h1>
        <Step2Toggle adminPw={pw} initialEnabled={loaded.isStep2Enabled} />
        <AdminReportsTable rows={loaded.rows} adminPw={pw} origin={origin} />
      </div>
    </main>
  )
}
