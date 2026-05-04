import type { Metadata } from 'next'

import { SITE_OG_IMAGE } from '@lib/site-og'

import { TermsOfServicePage } from '@/views/TermsOfService'

const TITLE = '이용약관 — 킨드라 Kindra'
const DESC =
  '킨드라(Kindra) 아이 그림 마음 분석 서비스 이용약관. 운영사 휘게타임(HYGGETIME)의 서비스 이용 조건, 결제·환불, 저작권, 면책, 분쟁 해결 및 전자상거래법상 사업자 고지를 확인하세요.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  robots: { index: true, follow: true },
  alternates: { canonical: '/terms' },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: '/terms',
    images: [SITE_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESC,
    images: [SITE_OG_IMAGE.url],
  },
}

export default function TermsPage() {
  return <TermsOfServicePage />
}
