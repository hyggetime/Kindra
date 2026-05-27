/**
 * 프리미엄 인테이크 — 토스 미니앱·메인 웹 공통 계약 (DB/API 경계).
 */

export type ChildAgeLabel = string

export type KindraChildGender = 'female' | 'male' | 'unspecified'

export type KindraPremiumPaymentSpec = {
  amountWon: 5000
  orderName: string
  orderId: string
}

export type KindraPremiumIntakePayload = {
  childName: string
  childAgeLabel: ChildAgeLabel
  childGender: KindraChildGender
  imageUrls: readonly [string, string, string, string, string]
  parentMemo: string
  guardianEmail?: string
  marketingOptIn?: boolean
}

export type KindraPremiumPaymentSuccessParams = {
  paymentKey: string
  orderId: string
  amount: number
}

export type KindraPremiumIntakePaymentBody = {
  payload: KindraPremiumIntakePayload
  payment: KindraPremiumPaymentSuccessParams
}

export const KINDRA_PREMIUM_INTAKE_STORAGE_KEY = 'kindra:premium-intake-payload:v1'

export const KINDRA_LIVE_STRUCTURED_REPORT_STORAGE_KEY = 'kindra:live-structured-report-json:v1'

export function createDefaultPremiumGalleryUrls(origin: string): KindraPremiumIntakePayload['imageUrls'] {
  const base = origin.replace(/\/$/, '')
  const paths = [
    '/gallery/birthday-cake.png',
    '/gallery/beach-scene.png',
    '/gallery/paper-dolls-a.png',
    '/gallery/paper-dolls-b.png',
    '/gallery/sketches-card.png',
  ] as const
  return paths.map((p) => `${base}${p}`) as unknown as KindraPremiumIntakePayload['imageUrls']
}

export function bindKindraPremiumIntakePayload(input: {
  childName: string
  childAgeLabel: ChildAgeLabel
  childGender: KindraChildGender
  imageUrls: readonly string[]
  parentMemo: string
  guardianEmail?: string
  marketingOptIn?: boolean
}): KindraPremiumIntakePayload {
  if (input.imageUrls.length !== 5) {
    throw new Error('KindraPremiumIntakePayload.imageUrls 는 정확히 5개여야 합니다.')
  }
  const tuple = input.imageUrls as unknown as KindraPremiumIntakePayload['imageUrls']
  return {
    childName: input.childName.trim(),
    childAgeLabel: input.childAgeLabel.trim(),
    childGender: input.childGender,
    imageUrls: tuple,
    parentMemo: input.parentMemo.trim(),
    guardianEmail: input.guardianEmail?.trim() || undefined,
    marketingOptIn: input.marketingOptIn,
  }
}
