'use client'

import { ANONYMOUS, loadTossPayments } from '@tosspayments/tosspayments-sdk'
import { useCallback, useEffect, useState } from 'react'

import { previewCheckoutCoupon } from '@app/actions/payment-coupon-preview'
import { CheckoutAnimatedPrice } from '@/components/payment/CheckoutAnimatedPrice'
import { getPaymentRedirectOrigin } from '@lib/payment/payment-redirect-origin'
import { getTossClientKey, isTossPaymentsConfigured } from '@lib/payment/toss-payments-config'

type SectionProps = {
  reportId: string | null
  listedPriceWon: number
  /** 부모에서 관리하는 쿠폰 입력값(쿠폰 패널과 동기화) */
  couponInput: string
  /** 무통장 블록 등과 금액 맞추기 — 쿠폰 적용·결제 직전 미리보기 후 호출 */
  onResolvedAmount?: (amountWon: number) => void
  /** `secondaryPlacement` 일 때는 시각적 강조를 약하게 */
  secondaryPlacement?: boolean
  /** 환불 불가·법정대리인 등 결제 직전 필수 동의 — 부모에서 상태 관리(이 컴포넌트는 표시만 하지 않음) */
  agreeDigitalNoRefund: boolean
  agreeGuardianCollect: boolean
}

/**
 * 토스페이먼츠 통합결제창 (`payment().requestPayment`, method CARD).
 * 쿠폰 입력은 `PaymentCouponPanel` 등 부모에서 배치합니다.
 */
export function IntakeTossPaymentsWidgetSection({
  reportId,
  listedPriceWon,
  couponInput,
  onResolvedAmount,
  secondaryPlacement = false,
  agreeDigitalNoRefund,
  agreeGuardianCollect,
}: SectionProps) {
  const consentsOk = agreeDigitalNoRefund && agreeGuardianCollect
  const clientKey = getTossClientKey()
  const sdkReady = isTossPaymentsConfigured()
  const [displayAmount, setDisplayAmount] = useState(listedPriceWon)
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
      const r = await previewCheckoutCoupon(listedPriceWon, code, reportId)
      if (!r.ok) return r
      pushResolved(r.amountWon)
      return r
    },
    [listedPriceWon, pushResolved, reportId],
  )

  const openPaymentWindow = useCallback(async () => {
    if (!sdkReady) return
    if (!consentsOk) {
      setError('결제 전 필수 동의 항목을 확인해 주세요.')
      return
    }
    setError(null)
    setBusy(true)
    try {
      const prev = await runPreview(couponInput.trim())
      if (!prev.ok) {
        setError(prev.message)
        pushResolved(listedPriceWon)
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
        redirectOrigin?: string
      }
      if (!res.ok) {
        setError(data.error ?? '결제 준비에 실패했어요.')
        return
      }

      const tossPayments = await loadTossPayments(clientKey)
      const pay = tossPayments.payment({ customerKey: ANONYMOUS })
      const fromPrepare =
        typeof data.redirectOrigin === 'string' && data.redirectOrigin.trim().length > 0
          ? data.redirectOrigin.trim().replace(/\/$/, '')
          : ''
      const origin = fromPrepare || getPaymentRedirectOrigin()
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
  }, [clientKey, consentsOk, couponInput, listedPriceWon, pushResolved, reportId, runPreview, sdkReady])

  return (
    <section
      className={`rounded-2xl border border-[#E8E4DC] bg-white/90 shadow-inner ${
        secondaryPlacement ? 'px-4 py-4 sm:px-5' : 'px-5 py-6'
      }`}
      aria-labelledby="toss-payment-heading"
    >
      <div className="text-center">
        <p id="toss-payment-heading" className="text-xs font-semibold uppercase tracking-wide text-[#7C9070]">
          {sdkReady ? '카드 · 간편결제' : '전자결제'}
        </p>

        <CheckoutAnimatedPrice listedPriceWon={listedPriceWon} amountWon={displayAmount} variant="toss" />

        <div className="mt-6">
          {sdkReady ? (
            <button
              type="button"
              onClick={() => void openPaymentWindow()}
              disabled={busy || !consentsOk}
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
            <p
              className="mt-3 rounded-lg border border-[#F0D9D9] bg-[#FFF8F8] px-3 py-2 text-center text-xs text-[#A34D4D]"
              role="alert"
            >
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
