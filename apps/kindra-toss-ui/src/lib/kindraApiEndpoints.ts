/**
 * 정적 토스 미니앱 → 운영 Kindra 메인 API (SSG, 서버 라우트 없음).
 * 기본 오리진: https://api.kindra.me
 */

export const DEFAULT_KINDRA_API_ORIGIN = 'https://api.kindra.me'

/** 운영·스테이징 API 베이스 URL (`NEXT_PUBLIC_KINDRA_API_URL` 우선). */
export function getKindraApiBaseUrl(): string {
  const direct = process.env.NEXT_PUBLIC_KINDRA_API_URL?.trim()
  if (direct) return direct.replace(/\/$/, '')
  const legacy = process.env.NEXT_PUBLIC_KINDRA_WEB_API_ORIGIN?.trim()
  if (legacy) return legacy.replace(/\/$/, '')
  return DEFAULT_KINDRA_API_ORIGIN
}

export function getPremiumIntakeApiUrl(): string {
  return `${getKindraApiBaseUrl()}/api/kindra-premium-intake`
}

export function getStructuredReportApiUrl(): string {
  return `${getKindraApiBaseUrl()}/api/kindra-structured-report`
}

/** 메인 API `KINDRA_MINIAPP_SHARED_SECRET` 와 동일 값 — 빌드 시 주입(미니앱 번들에 포함됨). */
export function getKindraMiniappApiAuthHeaders(): Record<string, string> {
  const token = process.env.NEXT_PUBLIC_KINDRA_MINIAPP_API_TOKEN?.trim()
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}
