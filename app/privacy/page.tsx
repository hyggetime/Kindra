import type { Metadata } from 'next'

import { SITE_OG_IMAGE } from '@lib/site-og'

import { PrivacyPolicyPage } from '@/views/PrivacyPolicy'

const TITLE = '개인정보처리방침 — 킨드라 Kindra'
const DESC =
  '킨드라(Kindra) 아이 그림 분석 서비스 개인정보처리방침. 휘게타임(HYGGETIME)의 개인정보 수집·이용 목적, 보관 기간, 제3자 제공, 이용자 권리(열람·정정·삭제), 문의처를 안내합니다.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  robots: { index: true, follow: true },
  alternates: { canonical: '/privacy' },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: '/privacy',
    images: [SITE_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESC,
    images: [SITE_OG_IMAGE.url],
  },
}

export default function PrivacyPage() {
  return <PrivacyPolicyPage />
}
