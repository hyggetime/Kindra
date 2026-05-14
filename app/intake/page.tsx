import type { Metadata } from 'next'

import { ApplyPageShell } from '../apply/ApplyPageShell'
import { IntakeClient } from './IntakeClient'
import { LIST_PRICE_WON, formatPriceWon } from '@lib/constants'
import { SITE_OG_IMAGE } from '@lib/site-og'

const INTAKE_TITLE = '그림 신청 — 킨드라 Kindra'
const INTAKE_DESC =
  '아이의 그림과 이야기를 보내주시면 킨드라가 따뜻한 마음 리포트를 준비해 드려요. 결제 단계에서 쿠폰을 적용할 수 있어요.'

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
  const priceLine = formatPriceWon(LIST_PRICE_WON)

  return (
    <ApplyPageShell>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7C9070]/80">신청</p>
      <h1 className="text-2xl font-bold tracking-tight text-[#3D3D3D] sm:text-3xl">아이의 그림을 보내주세요</h1>
      <p className="mt-5 text-[0.95rem] leading-[1.95] text-[#5A5A5A]">
        리포트 청구 기준가는 <strong className="font-semibold text-[#5A6F52]">{priceLine}</strong>이에요. 아래 신청서에서
        런칭 혜택 안내를 확인하실 수 있고, 프로모션 코드는 결제 직전에 입력해 주세요.
      </p>

      <section className="mt-10 rounded-2xl border border-[#E8E4DC] bg-white px-6 py-8 shadow-sm">
        <IntakeClient />
      </section>
    </ApplyPageShell>
  )
}
