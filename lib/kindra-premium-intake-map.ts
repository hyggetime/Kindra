import type { KindraPremiumIntakePayload } from '@lib/kindra-premium-intake-types'
import type { KindraUserContext } from '@lib/gemini/prompts'
import { inferSexCodeFromGenderLabel } from '@lib/gemini/prompts'

export function premiumPayloadToKindraUserContext(payload: KindraPremiumIntakePayload): KindraUserContext {
  const label =
    payload.childGender === 'female'
      ? '여아'
      : payload.childGender === 'male'
        ? '남아'
        : payload.childGender === 'unspecified'
          ? undefined
          : undefined
  return {
    childDisplayName: payload.childName.trim(),
    childAgeHint: payload.childAgeLabel.trim(),
    parentNote: payload.parentMemo.trim(),
    childGenderLabel: label,
    childGenderCode: inferSexCodeFromGenderLabel(label),
  }
}
