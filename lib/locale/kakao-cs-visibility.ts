/**
 * 카카오톡 채널 CS 블록 노출 여부 (해외 진출·로케일 대비).
 *
 * - `NEXT_PUBLIC_KINDRA_SHOW_KAKAO`: `true` / `false` 가 있으면 최우선.
 * - `NEXT_PUBLIC_KINDRA_IS_GLOBAL`: `true` 이면 숨김 (한국 전용 채널).
 * - `NEXT_PUBLIC_KINDRA_LOCALE`: 기본 `ko`, `ko` 가 아니면 숨김.
 *
 * 기본값은 로케일 ko → 카카오 블록이 보이도록 함.
 */
export function shouldShowKakaoChannel(): boolean {
  const override = process.env.NEXT_PUBLIC_KINDRA_SHOW_KAKAO?.trim().toLowerCase()
  if (override === '0' || override === 'false' || override === 'no') return false
  if (override === '1' || override === 'true' || override === 'yes') return true

  const isGlobal = process.env.NEXT_PUBLIC_KINDRA_IS_GLOBAL?.trim().toLowerCase()
  if (isGlobal === '1' || isGlobal === 'true' || isGlobal === 'yes') return false

  const locale = (process.env.NEXT_PUBLIC_KINDRA_LOCALE ?? 'ko').trim().toLowerCase()
  return locale === 'ko'
}
