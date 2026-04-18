import { track } from '@vercel/analytics'

export type EventParams = Record<string, string | number | boolean | null | undefined>

const UTM_SESSION_KEY = 'kindra_utm'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    __KINDRA_GA4_ID?: string
  }
}

/** sessionStorage 에 저장된 UTM 정보를 읽어 반환합니다. */
function getStoredUTM(): EventParams {
  try {
    const raw = sessionStorage.getItem(UTM_SESSION_KEY)
    return raw ? (JSON.parse(raw) as EventParams) : {}
  } catch {
    return {}
  }
}

let ga4Initialized = false

/**
 * 최초 호출 시 window.__KINDRA_GA4_ID 가 유효한 GA4 ID(G-...)이면
 * gtag.js 스크립트를 동적으로 로드하고 초기화합니다.
 */
export function ensureGA4(): void {
  if (ga4Initialized) return
  const id = window.__KINDRA_GA4_ID
  if (!id?.startsWith('G-')) return

  ga4Initialized = true
  window.dataLayer = window.dataLayer ?? []

  const push = (...args: unknown[]): void => {
    window.dataLayer?.push(args)
  }
  window.gtag = push
  push('js', new Date())
  push('config', id)

  const script = document.createElement('script')
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
  script.async = true
  document.head.appendChild(script)
}

/**
 * Vercel Analytics 와 GA4 에 동시에 이벤트를 전송합니다.
 * sessionStorage 에 저장된 UTM 파라미터를 자동으로 enrichment 합니다.
 */
export function trackEvent(eventName: string, params?: EventParams): void {
  if (typeof window === 'undefined') return
  ensureGA4()

  const enriched: EventParams = { ...getStoredUTM(), ...params }

  try {
    track(eventName, enriched as Record<string, string>)
  } catch {
    /* noop — Vercel Analytics 가 없는 환경에서 무시 */
  }

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, enriched)
  }
}

/**
 * UTM 파라미터를 sessionStorage 에 저장합니다.
 * useUTMTagger 훅에서 호출합니다.
 */
export function storeUTMParams(params: EventParams): void {
  if (typeof window === 'undefined') return
  try {
    const filtered = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== null && v !== undefined && v !== ''),
    )
    if (Object.keys(filtered).length > 0) {
      sessionStorage.setItem(UTM_SESSION_KEY, JSON.stringify(filtered))
    }
  } catch {
    /* noop */
  }
}
