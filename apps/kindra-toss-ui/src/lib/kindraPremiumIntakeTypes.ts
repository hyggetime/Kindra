/**
 * 프리미엄 인테이크 타입 — 단일 소스: 루트 `lib/kindra-premium-intake-types.ts`.
 * (메인 웹·미니앱·API가 동일 계약을 씁니다.)
 */
export type {
  ChildAgeLabel,
  KindraChildGender,
  KindraPremiumIntakePayload,
  KindraPremiumIntakePaymentBody,
  KindraPremiumPaymentSpec,
  KindraPremiumPaymentSuccessParams,
} from '../../../../lib/kindra-premium-intake-types'
export {
  bindKindraPremiumIntakePayload,
  createDefaultPremiumGalleryUrls,
  KINDRA_LIVE_STRUCTURED_REPORT_STORAGE_KEY,
  KINDRA_PREMIUM_INTAKE_STORAGE_KEY,
} from '../../../../lib/kindra-premium-intake-types'
