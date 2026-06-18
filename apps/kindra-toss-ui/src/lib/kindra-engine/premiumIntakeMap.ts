import type { KindraPremiumIntakePayload } from '@/lib/kindraPremiumIntakeTypes'

import { inferSexCodeFromGenderLabel, type KindraUserContext } from './prompts'

/** 프리미엄 인테이크 → Gemini 유저 컨텍스트 (루트 `lib/kindra-premium-intake-map.ts` 와 동형) */
export function premiumPayloadToKindraUserContext(payload: KindraPremiumIntakePayload): KindraUserContext {
  const label =
    payload.childGender === 'female'
      ? '여아'
      : payload.childGender === 'male'
        ? '남아'
        : undefined
  return {
    childDisplayName: payload.childName.trim(),
    childAgeHint: payload.childAgeLabel.trim(),
    parentNote: payload.parentMemo.trim(),
    childGenderLabel: label,
    childGenderCode: inferSexCodeFromGenderLabel(label),
  }
}

export function premiumPayloadToStructuredApiContext(
  payload: KindraPremiumIntakePayload,
): Record<string, unknown> {
  const user = premiumPayloadToKindraUserContext(payload)
  return {
    kind: 'KindraPremiumIntake',
    childName: payload.childName,
    childAgeLabel: payload.childAgeLabel,
    childGender: payload.childGender,
    parentMemo: payload.parentMemo,
    imageUrls: [...payload.imageUrls],
    guardianEmail: payload.guardianEmail ?? null,
    marketingOptIn: payload.marketingOptIn ?? false,
    kindraUserContext: user,
    imageCount: payload.imageUrls.length,
  }
}
