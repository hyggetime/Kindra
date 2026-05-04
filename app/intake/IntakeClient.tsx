'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { ApplyIntegratedForm } from '../apply/ApplyIntegratedForm'
import {
  DISCOUNT_LIMIT,
  DISCOUNT_PRICE_WON,
  FREE_LIMIT,
  NORMAL_PRICE_WON,
  displayPriceWonForTier,
  effectivePriceTier,
  formatPriceWon,
} from '@lib/constants'
import { buildApplyPaymentPath } from '@lib/payment/parse-payment-page-params'

export type IntakePricingSnapshot = {
  count: number
  isStep2Enabled: boolean
}

function IntakeStatusBanner({ initial }: { initial: IntakePricingSnapshot }) {
  const router = useRouter()
  const [snap, setSnap] = useState(initial)

  useEffect(() => {
    setSnap(initial)
  }, [initial])

  useEffect(() => {
    const id = window.setInterval(() => {
      router.refresh()
    }, 45_000)
    return () => clearInterval(id)
  }, [router])

  const { count, isStep2Enabled } = snap
  const tier = effectivePriceTier(count, isStep2Enabled)
  const priceLabel = formatPriceWon(displayPriceWonForTier(tier))

  const body = useMemo(() => {
    if (!isStep2Enabled) {
      return <>지금은 선착순 무료로 분석을 받으실 수 있어요.</>
    }
    if (count < FREE_LIMIT) {
      const left = FREE_LIMIT - count
      return (
        <>
          <span aria-hidden>🎁</span> 선착순 무료 이벤트 중!{' '}
          <span className="font-semibold text-[#3D4A38]">(남은 인원: {left}명)</span>
        </>
      )
    }
    if (count < DISCOUNT_LIMIT) {
      return (
        <>
          베타 테스터 특별 할인가{' '}
          <span className="font-semibold text-[#3D4A38]">{DISCOUNT_PRICE_WON.toLocaleString('ko-KR')}원</span> 적용 중
        </>
      )
    }
    return (
      <>
        <span className="font-semibold text-[#3D4A38]">{NORMAL_PRICE_WON.toLocaleString('ko-KR')}원</span>으로 분석을
        신청하실 수 있어요.
      </>
    )
  }, [count, isStep2Enabled])

  return (
    <div
      role="status"
      className="mb-8 rounded-2xl border border-[#D4E0D0] bg-gradient-to-r from-[#F0F6ED] to-[#FDFBF9] px-4 py-4 text-center text-sm leading-relaxed text-[#5A5A5A] shadow-sm sm:px-6"
    >
      {body}
      <p className="mt-2 text-xs text-[#8A8A8A]">현재 신청 요금: {priceLabel} · 실시간 인원을 반영해요.</p>
      <p className="mt-1 text-xs text-[#9A9A9A]">한국 아동 그림 56,000건(심허브)과 영유아 성장도표 데이터를 함께 활용해요.</p>
    </div>
  )
}

export function IntakeClient({ initial }: { initial: IntakePricingSnapshot }) {
  const router = useRouter()
  const tier = effectivePriceTier(initial.count, initial.isStep2Enabled)
  const submitHint = `이번 신청 요금: ${formatPriceWon(displayPriceWonForTier(tier))}`

  return (
    <>
      <IntakeStatusBanner initial={initial} />
      <ApplyIntegratedForm
        variant="intake"
        submitPriceHint={submitHint}
        onIntakeSuccess={(t, reportRowId) => {
          router.push(buildApplyPaymentPath(t, reportRowId ?? null))
        }}
      />
    </>
  )
}
