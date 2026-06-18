/**
 * 앱인토스(토스 미니앱) — 토스 네이티브가 주입하는 전역 `window.toss`.
 * npm SDK 가 아닌 런타임 주입 API 타입입니다.
 */
export {}

declare const __DEV__: boolean

declare global {
  interface Window {
    toss?: {
      init: () => void
      pay: (param: {
        productId: string
        orderId: string
        orderName: string
      }) => Promise<TossInAppPayResult>
    }
  }
}

/** 인앱 결제 응답 — 토스 스펙 확장 시 필드 추가 예정 */
export type TossInAppPayResult = {
  success: boolean
  paymentKey?: string
  orderId?: string
  amount?: number
}
