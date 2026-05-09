'use client'

import { ANONYMOUS, loadTossPayments } from '@tosspayments/tosspayments-sdk'
import { useCallback, useEffect, useState } from 'react'

import { previewCheckoutCoupon } from '@app/actions/payment-coupon-preview'
import { formatPriceWon } from '@lib/constants'
import { getPaymentRedirectOrigin } from '@lib/payment/payment-redirect-origin'
import { getTossClientKey, isTossPaymentsConfigured } from '@lib/payment/toss-payments-config'

type SectionProps = {
  reportId: string | null
  listedPriceWon: number
  /** 무통장 블록 등과 금액 맞추기 — 쿠폰 적용·결제 직전 미리보기 후 호출 */
  onResolvedAmount?: (amountWon: number) => void
  /** `bankFirst` 일 때는 시각적 강조를 약하게(무통장이 위에 있을 때) */
  secondaryPlacement?: boolean
}

/**
 * 쿠폰 입력 → 토스페이먼츠 통합결제창 (`payment().requestPayment`, method CARD).
 */
export function IntakeTossPaymentsWidgetSection({
  reportId,
  listedPriceWon,
  onResolvedAmount,
  secondaryPlacement = false,
}: SectionProps) {
  const clientKey = getTossClientKey()
  const sdkReady = isTossPaymentsConfigured()
  const [couponInput, setCouponInput] = useState('')
  const [displayAmount, setDisplayAmount] = useState(listedPriceWon)
  const [couponNote, setCouponNote] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setDisplayAmount(listedPriceWon)
  }, [listedPriceWon])

  const pushResolved = useCallback(
    (n: number) => {
      setDisplayAmount(n)
      onResolvedAmount?.(n)
    },
    [onResolvedAmount],
  )

  const runPreview = useCallback(
    async (code: string) => {
      const r = await previewCheckoutCoupon(listedPriceWon, code)
      if (!r.ok) return r
      pushResolved(r.amountWon)
      setCouponNote(
        r.discountWon > 0
          ? `할인 ${formatPriceWon(r.discountWon)} 반영 · 최종 ${formatPriceWon(r.amountWon)}`
          : '정상가로 진행해요.',
      )
      return r
    },
    [listedPriceWon, pushResolved],
  )

  const onApplyCoupon = useCallback(async () => {
    setError(null)
    setCouponNote(null)
    const r = await runPreview(couponInput.trim())
    if (!r.ok) {
      setError(r.message)
      pushResolved(listedPriceWon)
    }
  }, [couponInput, listedPriceWon, pushResolved, runPreview])

  const openPaymentWindow = useCallback(async () => {
    if (!sdkReady) return
    setError(null)
    setBusy(true)
    try {
      const prev = await runPreview(couponInput.trim())
      if (!prev.ok) {
        setError(prev.message)
        return
      }

      const res = await fetch('/api/payments/toss/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, couponCode: couponInput.trim() }),
      })
      const data = (await res.json()) as {
        error?: string
        orderId?: string
        amount?: number
        orderName?: string
      }
      if (!res.ok) {
        setError(data.error ?? '결제 준비에 실패했어요.')
        return
      }

      const tossPayments = await loadTossPayments(clientKey)
      const pay = tossPayments.payment({ customerKey: ANONYMOUS })
      const origin = getPaymentRedirectOrigin()
      if (!origin) {
        setError('결제 리다이렉트 주소를 확인할 수 없어요.')
        return
      }

      await pay.requestPayment({
        method: 'CARD',
        amount: {
          currency: 'KRW',
          value: data.amount!,
        },
        orderId: data.orderId!,
        orderName: data.orderName ?? '킨드라 아이 그림 리포트',
        successUrl: `${origin}/apply/payment/toss/callback`,
        failUrl: `${origin}/apply/payment/toss/fail`,
        card: {
          useEscrow: false,
          flowMode: 'DEFAULT',
          useCardPoint: false,
          useAppCardOnly: false,
        },
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : '결제창을 열 수 없어요.')
    } finally {
      setBusy(false)
    }
  }, [clientKey, couponInput, reportId, runPreview, sdkReady])

  const priceLabel = formatPriceWon(displayAmount)

  return (
    <section
      className={`rounded-2xl border border-[#E8E4DC] bg-white/90 shadow-inner ${
        secondaryPlacement ? 'px-4 py-4 sm:px-5' : 'px-5 py-6'
      }`}
      aria-labelledby="toss-payment-heading"
    >
      <div className="text-center">
        <p id="toss-payment-heading" className="text-xs font-semibold uppercase tracking-wide text-[#7C9070]">
          {sdkReady ? '카드 · 간편결제' : '할인 코드 (선택)'}
        </p>

        <div className="mt-4 rounded-xl border border-[#E8E4DC] bg-[#FAFAF8]/90 px-4 py-3 text-left">
          <p className="text-[11px] font-medium text-[#5A5A5A]">쿠폰 코드</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => {
                setCouponInput(e.target.value)
                setCouponNote(null)
              }}
              placeholder="코드가 있으면 입력 후 적용"
              disabled={busy}
              autoComplete="off"
              className="min-h-[44px] w-full flex-1 rounded-lg border border-[#E8E4DC] bg-white px-3 py-2 text-sm text-[#3D3D3D] outline-none ring-[#7C9070]/15 focus:border-[#7C9070]/40 focus:ring-2 disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => void onApplyCoupon()}
              disabled={busy}
              className="shrink-0 rounded-lg border border-[#7C9070]/40 bg-[#F4F7F2] px-4 py-2 text-xs font-semibold text-[#4F6048] transition hover:bg-[#E8F0E4] disabled:opacity-50"
            >
              적용
            </button>
          </div>
          {couponNote ? <p className="mt-2 text-[11px] text-[#5A6F52]">{couponNote}</p> : null}
          <p className="mt-2 text-[10px] leading-relaxed text-[#9A9A9A]">
            정상가 {formatPriceWon(listedPriceWon)} · 결제 전 쿠폰을 적용하거나, 바로 결제하기를 눌러도 현재 입력값으로
            다시 계산돼요.
          </p>
        </div>

        <p className="mt-4 text-lg font-semibold tabular-nums text-[#3D3D3D]">{priceLabel}</p>

        <div className="mt-6">
          {sdkReady ? (
            <button
              type="button"
              onClick={() => void openPaymentWindow()}
              disabled={busy}
              className="w-full rounded-xl bg-[#0064FF] py-3.5 text-sm font-bold text-white shadow-[0_10px_28px_-12px_rgba(0,100,255,0.55)] transition hover:bg-[#0056E0] disabled:opacity-60"
            >
              {busy ? '결제창 여는 중…' : '결제하기'}
            </button>
          ) : (
            <p className="rounded-xl border border-[#E8E4DC] bg-[#FAFAF8]/90 px-4 py-4 text-sm text-[#6B6B6B]" role="status">
              전자결제를 이용할 수 없습니다. 아래 무통장 입금으로 진행해 주세요.
            </p>
          )}

          {error ? (
            <p className="mt-3 rounded-lg border border-[#F0D9D9] bg-[#FFF8F8] px-3 py-2 text-center text-xs text-[#A34D4D]" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
