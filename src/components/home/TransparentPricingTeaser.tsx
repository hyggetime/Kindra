import Link from 'next/link'

import { APPLY_FORM_HREF, APPLY_STEPS_HREF } from '@lib/apply-href'
import { LaunchPricingCallout } from '@/components/pricing/LaunchPricingCallout'

/**
 * 랜딩 하단 — 짧은 요금 안내(사전 인지).
 */
export function TransparentPricingTeaser() {
  return (
    <section
      id="pricing-preview"
      className="scroll-mt-20 border-t border-[#E8E4DC] bg-gradient-to-b from-[#FDFBF9] to-[#F7F5F2]/80 px-5 py-10 sm:py-12"
      aria-labelledby="pricing-preview-title"
    >
      <div className="mx-auto max-w-2xl">
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7C9070]/85">
          투명한 가격 정책
        </p>
        <h2
          id="pricing-preview-title"
          className="mt-2.5 text-center text-base font-semibold text-[#3D3D3D] sm:text-lg"
        >
          런칭 이벤트 할인가 안내
        </h2>
        <div className="mt-5">
          <LaunchPricingCallout />
        </div>
        <p className="mt-5 text-center text-[11px] leading-relaxed text-[#8A8A8A] sm:text-xs">
          한국 아동 그림 56,000건(심허브)과 영유아 성장도표 데이터를 함께 활용해요.
        </p>
        <p className="mt-3 text-center text-[11px] leading-relaxed text-[#8A8A8A] sm:text-xs">
          정확한 청구 금액은{' '}
          <Link href={APPLY_FORM_HREF} className="font-medium text-[#5A6F52] underline-offset-2 hover:underline">
            신청
          </Link>
          후 결제 안내 화면에서 확인하실 수 있어요. 또는{' '}
          <Link href={APPLY_STEPS_HREF} className="font-medium text-[#5A6F52] underline-offset-2 hover:underline">
            3단계 진행 순서
          </Link>
          를 먼저 보실 수도 있어요.
        </p>
      </div>
    </section>
  )
}
