'use client'

import { ANONYMOUS, loadTossPayments } from '@tosspayments/tosspayments-sdk'
import { useCallback, useMemo } from 'react'

import type { KindraPremiumIntakePayload } from '@/lib/kindraPremiumIntakeTypes'
import { KINDRA_PREMIUM_INTAKE_STORAGE_KEY } from '@/lib/kindraPremiumIntakeTypes'

/** 토스 결제 금액(원) — 프리미엄 5장 프로모션 스펙 */
const PREMIUM_AMOUNT_WON = 5000 as const

const ORDER_NAME = '킨드라 프리미엄 5장 리포트'

function readTossClientKey(): string {
  const k = process.env.NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY?.trim()
  if (!k) {
    throw new Error(
      'NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY 가 없습니다. Toss 결제를 켜려면 apps/kindra-toss-ui/.env.local 을 설정하세요.',
    )
  }
  return k
}

/**
 * 주문 ID: 대문자·하이픈·영숫자 위주로 Toss·로그에 안전하게 남깁니다.
 * (메인 웹 이식 시 서버 발급으로 바꿀 수 있도록 훅 밖에서도 재사용 가능)
 */
export function createKindraPremiumOrderId(): string {
  const rand = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`.toUpperCase().replace(/[^A-Z0-9]/g, '')
  return `KINDRA-PREM-${Date.now()}-${rand}`
}

export type RequestPremiumPaymentOptions = {
  /** 기본 `window.location.origin` — 미니앱·스테이징에서 명시 */
  redirectOrigin?: string
}

export type UseKindraPaymentResult = {
  /** Toss `requestPayment` 호출 전에 Payload를 sessionStorage에 저장합니다. */
  requestPremiumPayment: (payload: KindraPremiumIntakePayload, options?: RequestPremiumPaymentOptions) => Promise<void>
}

/**
 * 토스 결제만 담당합니다. UI 컴포넌트는 이 훅만 import 하세요.
 * 성공 후 리다이렉트는 Toss가 `/payment/toss/success` 로 처리하며, 그 페이지에서 파이프라인을 태웁니다.
 */
export function useKindraPayment(): UseKindraPaymentResult {
  const requestPremiumPayment = useCallback(
    async (payload: KindraPremiumIntakePayload, options?: RequestPremiumPaymentOptions) => {
      if (typeof window === 'undefined') return
      sessionStorage.setItem(KINDRA_PREMIUM_INTAKE_STORAGE_KEY, JSON.stringify(payload))

      const orderId = createKindraPremiumOrderId()
      const origin = (options?.redirectOrigin ?? window.location.origin).replace(/\/$/, '')
      const clientKey = readTossClientKey()

      const tossPayments = await loadTossPayments(clientKey)
      const pay = tossPayments.payment({ customerKey: ANONYMOUS })

      await pay.requestPayment({
        method: 'CARD',
        amount: { currency: 'KRW', value: PREMIUM_AMOUNT_WON },
        orderId,
        orderName: ORDER_NAME,
        successUrl: `${origin}/payment/toss/success`,
        failUrl: `${origin}/payment/toss/fail`,
        card: {
          useEscrow: false,
          flowMode: 'DEFAULT',
          useCardPoint: false,
          useAppCardOnly: false,
        },
      })
    },
    [],
  )

  return useMemo(() => ({ requestPremiumPayment }), [requestPremiumPayment])
}
