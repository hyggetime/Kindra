import type { TossInAppPayResult } from '@/types/toss-in-app'

/** 결제 성공 후 success 페이지·백엔드 검증용 메타 (쿼리 보조) */
export const KINDRA_PREMIUM_PAYMENT_META_STORAGE_KEY = 'kindra:premium-payment-meta:v1'

export type KindraPremiumPaymentMeta = {
  paymentKey: string
  orderId: string
  amount: number
}

export const KINDRA_PREMIUM_ORDER_NAME = '킨드라 프리미엄 5장 리포트'

export const KINDRA_PREMIUM_AMOUNT_WON = 5000

/** 앱인토스 상품 ID — 발급 전 `PENDING_PRODUCT_ID`, 빌드 시 `NEXT_PUBLIC_TOSS_INAPP_PRODUCT_ID` 로 교체 */
export function getTossInAppProductId(): string {
  return process.env.NEXT_PUBLIC_TOSS_INAPP_PRODUCT_ID?.trim() || 'PENDING_PRODUCT_ID'
}

export function isTossInAppRuntime(): boolean {
  return typeof window !== 'undefined' && typeof window.toss !== 'undefined'
}

/** 토스 네이티브와 싱크 — layout 마운트 시 1회 호출 */
export function initTossInAppIfPresent(): void {
  if (typeof window === 'undefined') return
  try {
    window.toss?.init()
  } catch (e) {
    console.warn('[kindra:toss-in-app] init failed:', e)
  }
}

export function savePremiumPaymentMeta(meta: KindraPremiumPaymentMeta): void {
  sessionStorage.setItem(KINDRA_PREMIUM_PAYMENT_META_STORAGE_KEY, JSON.stringify(meta))
}

export function readPremiumPaymentMeta(): KindraPremiumPaymentMeta | null {
  const raw = sessionStorage.getItem(KINDRA_PREMIUM_PAYMENT_META_STORAGE_KEY)
  if (!raw) return null
  try {
    const o = JSON.parse(raw) as KindraPremiumPaymentMeta
    if (typeof o.paymentKey === 'string' && typeof o.orderId === 'string' && Number.isFinite(o.amount)) {
      return o
    }
  } catch {
    /* ignore */
  }
  return null
}

export function buildPremiumPaymentMetaFromPayResult(
  orderId: string,
  result: TossInAppPayResult,
): KindraPremiumPaymentMeta {
  return {
    orderId: result.orderId?.trim() || orderId,
    paymentKey: result.paymentKey?.trim() || `INAPP_${orderId}`,
    amount:
      typeof result.amount === 'number' && Number.isFinite(result.amount)
        ? Math.floor(result.amount)
        : KINDRA_PREMIUM_AMOUNT_WON,
  }
}

import { navigateToPath } from '@/lib/graniteNavigate'

/** Granite / 정적 웹 — success 라우트로 이동 */
export function navigateToPremiumPaymentSuccess(meta: KindraPremiumPaymentMeta): void {
  const q = new URLSearchParams({
    paymentKey: meta.paymentKey,
    orderId: meta.orderId,
    amount: String(meta.amount),
  })
  const path = `/payment/toss/success?${q.toString()}`
  navigateToPath(path)
}
