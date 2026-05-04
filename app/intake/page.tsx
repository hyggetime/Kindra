import type { Metadata } from 'next'

import { ApplyPageShell } from '../apply/ApplyPageShell'
import { IntakeClient, type IntakePricingSnapshot } from './IntakeClient'
import { DISCOUNT_LIMIT, FREE_LIMIT, effectivePriceTier, formatPriceWon, displayPriceWonForTier } from '@lib/constants'
import { getIntakePricingContext } from '@lib/intake-pricing.server'
import { SITE_OG_IMAGE } from '@lib/site-og'

const INTAKE_TITLE = '그림 신청 — 킨드라 Kindra'
const INTAKE_DESC =
  '아이의 그림과 이야기를 보내주시면 킨드라가 따뜻한 마음 리포트를 준비해 드려요. 선착순 무료·할인 구간 안내와 함께 신청할 수 있습니다.'

export const metadata: Metadata = {
  title: INTAKE_TITLE,
  description: INTAKE_DESC,
  alternates: { canonical: '/intake' },
  openGraph: {
    title: INTAKE_TITLE,
    description: INTAKE_DESC,
    url: '/intake',
    images: [SITE_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: INTAKE_TITLE,
    description: INTAKE_DESC,
    images: [SITE_OG_IMAGE.url],
  },
}

export default async function IntakePage() {
  const ctx = await getIntakePricingContext()
  const snap: IntakePricingSnapshot = { count: ctx.count, isStep2Enabled: ctx.isStep2Enabled }
  const tier = effectivePriceTier(ctx.count, ctx.isStep2Enabled)
  const priceLine = formatPriceWon(displayPriceWonForTier(tier))

  return (
    <ApplyPageShell>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7C9070]/80">신청</p>
      <h1 className="text-2xl font-bold tracking-tight text-[#3D3D3D] sm:text-3xl">아이의 그림을 보내주세요</h1>
      <p className="mt-5 text-[0.95rem] leading-[1.95] text-[#5A5A5A]">
        선착순 <strong className="font-semibold text-[#4A4A4A]">{FREE_LIMIT}명</strong>까지 무료, 이후{' '}
        <strong className="font-semibold text-[#4A4A4A]">{DISCOUNT_LIMIT}명</strong> 미만은 할인가가 적용돼요. 지금 구간
        요금은 <strong className="font-semibold text-[#5A6F52]">{priceLine}</strong> 입니다.
      </p>

      <section className="mt-10 rounded-2xl border border-[#E8E4DC] bg-white px-6 py-8 shadow-sm">
        <IntakeClient initial={snap} />
      </section>
    </ApplyPageShell>
  )
}
