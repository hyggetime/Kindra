import Link from 'next/link'

import { APPLY_FORM_HREF, APPLY_STEPS_HREF } from '@lib/apply-href'
import { DISCOUNT_LIMIT, DISCOUNT_PRICE_WON, FREE_LIMIT, NORMAL_PRICE_WON } from '@lib/constants'

/**
 * 랜딩 하단 — 짧은 요금 구간 안내(사전 인지).
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
          선착순·단계별 요금을 미리 알려드려요
        </h2>
        <ul className="mt-5 space-y-2.5 text-left text-[13px] leading-[1.75] text-[#5A5A5A] sm:text-sm">
          <li className="flex gap-2.5">
            <span className="mt-0.5 shrink-0 text-[#7C9070]" aria-hidden>
              ·
            </span>
            <span>
              처음 <strong className="font-semibold text-[#4A4A4A]">{FREE_LIMIT}명</strong> — 통합 리포트{' '}
              <strong className="text-[#5A6F52]">무료</strong>
            </span>
          </li>
          <li className="flex gap-2.5">
            <span className="mt-0.5 shrink-0 text-[#7C9070]" aria-hidden>
              ·
            </span>
            <span>
              그 다음 <strong className="font-semibold text-[#4A4A4A]">{DISCOUNT_LIMIT}명</strong>까지 —{' '}
              <strong className="text-[#4A4A4A]">{DISCOUNT_PRICE_WON.toLocaleString('ko-KR')}원</strong> (얼리버드 할인)
            </span>
          </li>
          <li className="flex gap-2.5">
            <span className="mt-0.5 shrink-0 text-[#7C9070]" aria-hidden>
              ·
            </span>
            <span>
              이후 — <strong className="text-[#4A4A4A]">{NORMAL_PRICE_WON.toLocaleString('ko-KR')}원</strong> (정상가, 2차
              오픈 이후)
            </span>
          </li>
        </ul>
        <p className="mt-5 text-center text-[11px] leading-relaxed text-[#8A8A8A] sm:text-xs">
          지금 신청하시면 현재 구간 요금을 그대로 적용받으세요. 정확한 금액은{' '}
          <Link href={APPLY_FORM_HREF} className="font-medium text-[#5A6F52] underline-offset-2 hover:underline">
            신청
          </Link>
          단계에서 확인하실 수 있어요. 또는{' '}
          <Link href={APPLY_STEPS_HREF} className="font-medium text-[#5A6F52] underline-offset-2 hover:underline">
            3단계 진행 순서
          </Link>
          를 먼저 보실 수도 있어요.
        </p>
      </div>
    </section>
  )
}
