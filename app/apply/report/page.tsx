import type { Metadata } from 'next'
import { IntakeReportView } from './IntakeReportView'

export const metadata: Metadata = {
  title: '통합 분석 리포트 — 킨드라 Kindra',
  description: '신청 직후 확인하는 아이 그림 통합 마음 지도 리포트입니다.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/apply/report' },
}

export default function ApplyReportPage() {
  return <IntakeReportView />
}
