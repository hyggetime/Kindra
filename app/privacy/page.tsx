import type { Metadata } from 'next'
import { PrivacyPolicyPage } from '@/views/PrivacyPolicy'

export const metadata: Metadata = {
  title: '개인정보처리방침 — 킨드라 Kindra',
  description:
    '킨드라(Kindra) 서비스의 개인정보처리방침입니다. 휘게타임(HYGGETIME)이 수집하는 개인정보 항목, 이용 목적, 보유 기간 및 이용자 권리를 안내합니다.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return <PrivacyPolicyPage />
}
