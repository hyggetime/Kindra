'use client'

import { formatPriceWon } from '@lib/constants'

type Variant = 'bank' | 'toss'

type Props = {
  listedPriceWon: number
  amountWon: number
  variant?: Variant
  className?: string
}

const variantClass: Record<Variant, { row: string; old: string; neu: string }> = {
  bank: {
    row: 'mt-3 flex flex-wrap items-baseline justify-center gap-x-2.5 gap-y-0.5 sm:justify-start',
    old: 'text-base font-semibold tabular-nums text-[#9A9A9A] line-through decoration-[#B8B8B8] kindra-checkout-price-old',
    neu: 'text-lg font-bold tabular-nums text-[#4F6048] kindra-checkout-price-new',
  },
  toss: {
    row: 'mt-4 flex flex-wrap items-baseline justify-center gap-x-2.5 gap-y-0.5',
    old: 'text-base font-medium tabular-nums text-[#9A9A9A] line-through decoration-[#B8B8B8] kindra-checkout-price-old',
    neu: 'text-lg font-semibold tabular-nums text-[#3D3D3D] kindra-checkout-price-new',
  },
}

/**
 * 쿠폰 적용 시 최종 금액이 기존 가격 자리(왼쪽)에 나타나고, 기준가(취소선)는 우측으로 밀려남.
 */
export function CheckoutAnimatedPrice({ listedPriceWon, amountWon, variant = 'bank', className }: Props) {
  const v = variantClass[variant]
  const discounted = amountWon < listedPriceWon

  if (!discounted) {
    const single =
      variant === 'bank'
        ? 'mt-3 text-lg font-bold tabular-nums text-[#4F6048]'
        : 'mt-4 text-lg font-semibold tabular-nums text-[#3D3D3D]'
    return <p className={`${single} ${className ?? ''}`.trim()}>{formatPriceWon(amountWon)}</p>
  }

  return (
    <div className={`${v.row} ${className ?? ''}`.trim()} role="status" aria-live="polite">
      <span key={amountWon} className={v.neu}>
        {formatPriceWon(amountWon)}
      </span>
      <span className={v.old}>{formatPriceWon(listedPriceWon)}</span>
    </div>
  )
}
