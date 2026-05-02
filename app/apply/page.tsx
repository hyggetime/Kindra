import type { Metadata } from 'next'

import { APPLY_FORM_HREF } from '@lib/apply-href'
import { SITE_OG_IMAGE } from '@lib/site-og'

import { ApplyAnalysisIntroSection } from '@/components/apply/ApplyAnalysisIntroSection'
import { ApplyFormTrustNote } from '@/components/apply/ApplyFormTrustNote'
import { ApplyStepsSection } from '@/components/apply/ApplyStepsSection'

import { ApplyIntegratedForm } from './ApplyIntegratedForm'
import { ApplyPageShell } from './ApplyPageShell'

const META_DESC =
  '아이의 그림을 보내주시면 킨드라가 따뜻한 시선으로 마음을 읽어드려요. 검증된 심리 분석 이론을 바탕으로 아이만의 통합 마음 지도 리포트를 준비해 드립니다.'

export const metadata: Metadata = {
  title: '분석 신청 — 킨드라 Kindra',
  description: META_DESC,
  alternates: { canonical: '/apply' },
  openGraph: {
    title: '분석 신청 — 킨드라 Kindra',
    description: META_DESC,
    url: '/apply',
    images: [SITE_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: '분석 신청 — 킨드라 Kindra',
    description: META_DESC,
    images: [SITE_OG_IMAGE.url],
  },
}

export default function ApplyPage() {
  return (
    <ApplyPageShell>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7C9070]/80">
        아이 그림 분석 신청
      </p>
      <h1 className="text-2xl font-bold tracking-tight text-[#3D3D3D] sm:text-3xl">아이의 그림을 보내주세요</h1>
      <p className="mt-5 text-[0.95rem] leading-[1.95] text-[#5A5A5A]">
        그림과 간단한 정보를 남겨 주시면, 킨드라가 차분히 살펴보고{' '}
        <strong className="font-semibold text-[#4A4A4A]">통합 마음 지도 리포트</strong>를 준비해 드려요. 전송이 완료되면
        안내 화면으로 이어지며, 리포트는 24시간 이내 이메일로 발송될 예정이에요.
      </p>
      <p className="mt-4">
        <a
          href={APPLY_FORM_HREF}
          className="inline-flex text-sm font-semibold text-[#5A6F52] underline decoration-[#C8D4C0] underline-offset-2 transition hover:text-[#4F6048]"
        >
          신청서 작성하기 →
        </a>
      </p>

      <ApplyAnalysisIntroSection />
      <ApplyStepsSection />

      <section
        id="apply-form"
        className="mt-10 scroll-mt-24 rounded-2xl border border-[#E8E4DC] bg-white px-6 py-8 shadow-sm"
      >
        <ApplyFormTrustNote />
        <ApplyIntegratedForm />
      </section>
    </ApplyPageShell>
  )
}
