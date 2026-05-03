import type { Metadata } from 'next'
import { TermsOfServicePage } from '@/views/TermsOfService'

export const metadata: Metadata = {
  title: '이용약관 — 킨드라 Kindra',
  description:
    '킨드라(Kindra) 서비스 이용약관입니다. 휘게타임(HYGGETIME)이 제공하는 아이 그림 심리분석 서비스의 이용 조건, 저작권, 면책 사항을 안내합니다.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  return <TermsOfServicePage />
}
