import { track } from '@vercel/analytics'

export type EventParams = Record<string, string | number | boolean | null | undefined>

const UTM_SESSION_KEY = 'kindra_utm'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
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
 * index.html 에 삽입된 Google tag(gtag.js)가 있으면 그대로 사용합니다.
 * (gtag 이중 로드·window.gtag 덮어쓰기 방지)
 */
export function ensureGA4(): void {
  if (ga4Initialized) return
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    ga4Initialized = true
  }
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
 * UTM 파라미터를 sessionStorage 에 병합 저장합니다.
 * 기존 세션 값과 합쳐 같은 방문에서 여러 UTM 키가 누적될 수 있습니다.
 */
export function storeUTMParams(params: EventParams): void {
  if (typeof window === 'undefined') return
  try {
    const filtered = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== null && v !== undefined && v !== ''),
    )
    if (Object.keys(filtered).length === 0) return
    const existing = getStoredUTM()
    const merged = { ...existing, ...filtered }
    sessionStorage.setItem(UTM_SESSION_KEY, JSON.stringify(merged))
  } catch {
    /* noop */
  }
}

/** sessionStorage 에 저장된 UTM·ref 값을 문자열 맵으로 반환합니다. */
export function getSessionUtmParams(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const raw = getStoredUTM()
  return Object.fromEntries(
    Object.entries(raw).filter(([, v]) => typeof v === 'string' && v !== ''),
  ) as Record<string, string>
}

/**
 * 세션에 저장된 UTM 파라미터를 URL 쿼리스트링에 붙입니다.
 * 구글 폼(forms.gle) 등 외부 신청 링크로 유입 경로를 전달할 때 사용합니다.
 */
export function appendSessionUtmToUrl(url: string): string {
  if (typeof window === 'undefined') return url
  try {
    const params = getSessionUtmParams()
    if (Object.keys(params).length === 0) return url
    const u = new URL(url)
    for (const [k, v] of Object.entries(params)) {
      u.searchParams.set(k, v)
    }
    return u.toString()
  } catch {
    return url
  }
}
