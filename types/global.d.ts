/** 카카오 JavaScript SDK 2.x (kakao.min.js) — `window.Kakao` 최소 타입 */

declare global {
  interface Window {
    Kakao?: {
      init(javascriptKey: string): void
      isInitialized(): boolean
      Channel: {
        /** 카카오톡 채널 간편 추가 @see https://developers.kakao.com/docs/ko/kakaotalk-channel/js */
        followChannel(params: { channelPublicId: string }): Promise<unknown>
        addChannel(params: { channelPublicId: string }): Promise<unknown>
        chat(params: { channelPublicId: string }): Promise<unknown>
      }
    }
  }
}

export {}
