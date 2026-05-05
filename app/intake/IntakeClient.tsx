'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { ApplyIntegratedForm } from '../apply/ApplyIntegratedForm'
import {
  DISCOUNT_LIMIT,
  DISCOUNT_PRICE_WON,
  NORMAL_PRICE_WON,
  displayPriceWonForTier,
  effectivePriceTier,
  formatPriceWon,
  tossChargeAmountWonForTier,
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
  const displayWon = displayPriceWonForTier(tier)
  const chargeWon = tossChargeAmountWonForTier(tier)
  const priceDetail =
    displayWon === chargeWon ? (
      <>현재 신청 요금: {formatPriceWon(displayWon)} · 실시간 인원을 반영해요.</>
    ) : (
      <>
        표시 요금 없이 진행되며, 결제 확인용으로{' '}
        <span className="font-semibold text-[#4F6048]">{formatPriceWon(chargeWon)}</span>이 청구돼요. 실시간 인원을
        반영해요.
      </>
    )

  const body = useMemo(() => {
    if (!isStep2Enabled) {
      return <>무료 혜택 구간입니다. 신청을 완료하신 뒤 안내 화면에서 결제를 이어가 주세요.</>
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
      <p className="mt-2 text-xs text-[#8A8A8A]">{priceDetail}</p>
      <p className="mt-1 text-xs text-[#9A9A9A]">한국 아동 그림 56,000건(심허브)과 영유아 성장도표 데이터를 함께 활용해요.</p>
    </div>
  )
}

export function IntakeClient({ initial }: { initial: IntakePricingSnapshot }) {
  const router = useRouter()
  const tier = effectivePriceTier(initial.count, initial.isStep2Enabled)
  const submitHint = `신청을 마치면 결제 안내에서 ${formatPriceWon(tossChargeAmountWonForTier(tier))}으로 이어가 주세요.`

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
