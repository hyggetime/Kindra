import Link from 'next/link'

import { APPLY_FORM_HREF, APPLY_STEPS_HREF } from '@lib/apply-href'
import { LIST_PRICE_WON } from '@lib/constants'

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
          정상가와 쿠폰을 미리 알려드려요
        </h2>
        <ul className="mt-5 space-y-2.5 text-left text-[13px] leading-[1.75] text-[#5A5A5A] sm:text-sm">
          <li className="flex gap-2.5">
            <span className="mt-0.5 shrink-0 text-[#7C9070]" aria-hidden>
              ·
            </span>
            <span>
              리포트 정상가{' '}
              <strong className="text-[#4A4A4A]">{LIST_PRICE_WON.toLocaleString('ko-KR')}원</strong> — 결제 단계에서
              프로모션 쿠폰을 입력하면 할인된 금액으로 이어가실 수 있어요.
            </span>
          </li>
        </ul>
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
