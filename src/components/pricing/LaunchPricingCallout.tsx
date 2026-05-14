import { LIST_PRICE_MSRP_WON, LIST_PRICE_WON, formatPriceWon } from '@lib/constants'

type Props = {
  /** 결제 카드 등 좁은 폭에서 한 줄 위주 */
  compact?: boolean
  className?: string
}

/**
 * 런칭 한정 가격 안내 — 정가는 LIST_PRICE_MSRP_WON(취소선), 런칭 이벤트 할인가는 LIST_PRICE_WON.
 */
export function LaunchPricingCallout({ compact = false, className = '' }: Props) {
  return (
    <div
      className={`rounded-xl border border-amber-400/55 bg-gradient-to-br from-amber-50/95 to-orange-50/90 px-4 py-3.5 shadow-sm ${compact ? 'text-[11px] leading-relaxed sm:text-xs' : 'text-xs leading-relaxed sm:text-sm'} ${className}`}
      role="note"
    >
      <p className="font-semibold text-[#8A4B12]">런칭 이벤트 할인가</p>
      <p className={`mt-2 text-[#4A4A4A] ${compact ? '' : 'sm:mt-2.5'}`}>
        정상가{' '}
        <span className="font-medium text-[#9A9A9A] line-through decoration-[#B0B0B0]">
          {formatPriceWon(LIST_PRICE_MSRP_WON)}
        </span>
        보다, 지금은{' '}
        <span className="font-bold text-[#2F4A2A]">런칭 이벤트 할인가 {formatPriceWon(LIST_PRICE_WON)}</span>으로 이용하실 수
        있어요.
      </p>
    </div>
  )
}
