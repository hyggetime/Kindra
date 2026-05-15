'use client'

import { useCallback, useEffect, useState } from 'react'

import { previewCheckoutCoupon } from '@app/actions/payment-coupon-preview'
import { formatPriceWon, PUBLIC_PROMO_COUPON_CODES_PLACEHOLDER } from '@lib/constants'

type Props = {
  listedPriceWon: number
  reportId: string | null
  value: string
  onChange: (value: string) => void
  onResolvedAmount?: (amountWon: number) => void
}

/**
 * 결제 전 쿠폰 입력·미리보기(토스 블록과 분리해 배치할 때 사용).
 */
export function PaymentCouponPanel({ listedPriceWon, reportId, value, onChange, onResolvedAmount }: Props) {
  const [note, setNote] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    setNote(null)
    setError(null)
  }, [value, listedPriceWon])

  const apply = useCallback(async () => {
    setError(null)
    setNote(null)
    setPending(true)
    try {
      const r = await previewCheckoutCoupon(listedPriceWon, value.trim(), reportId)
      if (!r.ok) {
        setError(r.message)
        onResolvedAmount?.(listedPriceWon)
        return
      }
      onResolvedAmount?.(r.amountWon)
      const label = r.displayName ? `「${r.displayName}」 ` : ''
      setNote(
        r.discountWon > 0
          ? `${label}최종 결제 금액 ${formatPriceWon(r.amountWon)}으로 적용돼요.`
          : '쿠폰 없이 기준 금액으로 진행해요.',
      )
    } finally {
      setPending(false)
    }
  }, [listedPriceWon, onResolvedAmount, reportId, value])

  return (
    <div className="rounded-xl border border-[#E8E4DC] bg-[#FAFAF8]/90 px-4 py-3 text-left">
      <p className="text-[11px] font-medium text-[#5A5A5A]">쿠폰 코드</p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`예: ${PUBLIC_PROMO_COUPON_CODES_PLACEHOLDER}`}
          disabled={pending}
          autoComplete="off"
          className="min-h-[44px] w-full flex-1 rounded-lg border border-[#E8E4DC] bg-white px-3 py-2 text-sm text-[#3D3D3D] outline-none ring-[#7C9070]/15 focus:border-[#7C9070]/40 focus:ring-2 disabled:opacity-60"
        />
        <button
          type="button"
          onClick={() => void apply()}
          disabled={pending}
          className="shrink-0 rounded-lg border border-[#7C9070]/40 bg-[#F4F7F2] px-4 py-2 text-xs font-semibold text-[#4F6048] transition hover:bg-[#E8F0E4] disabled:opacity-50"
        >
          적용
        </button>
      </div>
      {note ? <p className="mt-2 text-[11px] text-[#5A6F52]">{note}</p> : null}
      {error ? (
        <p className="mt-2 text-[11px] text-[#B85C5C]" role="alert">
          {error}
        </p>
      ) : null}
      <p className="mt-2 text-[10px] leading-relaxed text-[#9A9A9A]">
        프로모션 코드는 한 칸에 하나만 입력해 주세요. HELLOKINDRA와 HIKINDRA는 동시에 적용되지 않아요.
      </p>
    </div>
  )
}
