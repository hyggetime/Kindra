'use client'

import { useRouter } from 'next/navigation'

import { ApplyIntegratedForm } from '../apply/ApplyIntegratedForm'
import { LIST_PRICE_WON, PUBLIC_PROMO_COUPON_CODE, PUBLIC_PROMO_COUPON_CODE_ALT, formatPriceWon } from '@lib/constants'
import { buildApplyPaymentPath } from '@lib/payment/parse-payment-page-params'

export function IntakeClient() {
  const router = useRouter()
  const submitHint = `신청을 마치면 결제 안내에서 런칭 할인가 ${formatPriceWon(LIST_PRICE_WON)} 기준으로 쿠폰(${PUBLIC_PROMO_COUPON_CODE} 또는 ${PUBLIC_PROMO_COUPON_CODE_ALT})을 적용하고 결제를 이어가 주세요.`

  return (
    <ApplyIntegratedForm
      variant="intake"
      submitPriceHint={submitHint}
      onIntakeSuccess={(reportRowId) => {
        router.push(buildApplyPaymentPath(reportRowId ?? null))
      }}
    />
  )
}
