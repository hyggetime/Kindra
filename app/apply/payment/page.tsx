import type { Metadata } from 'next'
import { Suspense } from 'react'

import { ApplyPageShell } from '../ApplyPageShell'
import { ApplyPaymentView } from './ApplyPaymentView'
import { readBankTransferFromEnv } from '@lib/payment/bank-transfer-env.server'
import { parseReportIdParam, parseTierParam } from '@lib/payment/parse-payment-page-params'

export const metadata: Metadata = {
  title: '결제 안내 — 킨드라 Kindra',
  description: '아이 그림 신청 후 요금 안내 및 결제를 진행하는 페이지예요.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/apply/payment' },
}

type PageProps = {
  searchParams: Promise<{ tier?: string; report?: string }>
}

export default async function ApplyPaymentPage({ searchParams }: PageProps) {
  const { tier: tierRaw, report: reportRaw } = await searchParams
  const tier = parseTierParam(tierRaw)
  const reportId = parseReportIdParam(reportRaw)
  const bankTransfer = readBankTransferFromEnv()

  return (
    <ApplyPageShell>
      <Suspense
        fallback={
          <p className="text-center text-sm text-[#8A8A8A]" role="status">
            결제 안내를 불러오는 중…
          </p>
        }
      >
        <ApplyPaymentView tier={tier} reportId={reportId} bankTransfer={bankTransfer} />
      </Suspense>
    </ApplyPageShell>
  )
}
