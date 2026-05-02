/**
 * 카카오톡 채널 프로필 ID (pf.kakao.com 뒤 세그먼트).
 * @see https://developers.kakao.com/docs/ko/kakaotalk-channel/common#intro-profile-id
 */
export const DEFAULT_KAKAO_CHANNEL_PUBLIC_ID = '_RVxdTX'

export function resolveKakaoChannelPublicId(): string {
  const fromEnv = typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_KAKAO_CHANNEL_ID?.trim() ?? '') : ''
  return fromEnv || DEFAULT_KAKAO_CHANNEL_PUBLIC_ID
}

/**
 * 카카오톡 채널 톡상담(1:1) 웹 URL.
 * JS SDK `Kakao.Channel.chat()` 는 중간 페이지에서 사이트 도메인/앱 연동을 검사해
 * "잘못된 접근입니다" 가 나는 경우가 있어, 동일 흐름에 가깝게 공식 URL로 직접 이동합니다.
 * @see https://developers.kakao.com/docs/latest/ko/kakaotalk-channel/common#intro-profile-id
 */
export function getKakaoChannelChatPageUrl(channelPublicId: string): string {
  const id = channelPublicId.trim()
  if (!id) return 'https://pf.kakao.com'
  return `https://pf.kakao.com/${id.replace(/^\//, '')}/chat`
}
