'use client'

import { ANONYMOUS, loadTossPayments } from '@tosspayments/tosspayments-sdk'
import { useCallback, useState } from 'react'

import { type PriceTier, formatPriceWon } from '@lib/constants'
import { effectiveTossChargeWonForTier } from '@lib/payment/payment-charge-override'
import { getTossClientKey, isTossPaymentsConfigured } from '@lib/payment/toss-payments-config'

type SectionProps = {
  tier: PriceTier
  reportId: string | null
  /** `bankFirst` 일 때는 시각적 강조를 약하게(무통장이 위에 있을 때) */
  secondaryPlacement?: boolean
}

/**
 * 토스페이먼츠 API 개별 연동 키 — 통합결제창 (`payment().requestPayment`, method CARD).
 * @see https://docs.tosspayments.com/guides/v2/payment-window/integration
 */
export function IntakeTossPaymentsWidgetSection({ tier, reportId, secondaryPlacement = false }: SectionProps) {
  const clientKey = getTossClientKey()
  const sdkReady = isTossPaymentsConfigured()
  const chargeWon = effectiveTossChargeWonForTier(tier)
  const priceLabel = formatPriceWon(chargeWon)

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const openPaymentWindow = useCallback(async () => {
    if (!sdkReady) return
    setError(null)
    setBusy(true)
    try {
      const res = await fetch('/api/payments/toss/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, reportId }),
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
      const origin = window.location.origin

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
  }, [clientKey, reportId, sdkReady, tier])

  return (
    <section
      className={`rounded-2xl border border-[#E8E4DC] bg-white/90 shadow-inner ${
        secondaryPlacement ? 'px-4 py-4 sm:px-5' : 'px-5 py-6'
      }`}
      aria-labelledby="toss-payment-heading"
    >
      <div className="text-center">
        <p id="toss-payment-heading" className="text-xs font-semibold uppercase tracking-wide text-[#7C9070]">
          카드 · 간편결제
        </p>
        <p className="mt-3 text-lg font-semibold tabular-nums text-[#3D3D3D]">{priceLabel}</p>

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
