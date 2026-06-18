/**
 * 프리미엄 인테이크 → Kindra 백엔드 / 구조화 리포트 API.
 * Toss SDK를 import하지 않습니다.
 */

import type {
  KindraPremiumIntakePayload,
  KindraPremiumIntakePaymentBody,
} from '@/lib/kindraPremiumIntakeTypes'
import { getKindraApiBaseUrl, getKindraMiniappApiAuthHeaders } from '@/lib/kindraApiEndpoints'
import { normalizeStructuredReportInput, premiumPayloadToStructuredApiContext } from '@/lib/kindra-engine'
import {
  KINDRA_LIVE_STRUCTURED_REPORT_STORAGE_KEY,
  KINDRA_PREMIUM_INTAKE_STORAGE_KEY,
} from '@/lib/kindraPremiumIntakeTypes'
import { setPremiumSessionItem } from '@/lib/premiumIntakeStorage'
import { fetchUrlAsInlineImage, postStructuredReportAnalysis } from '@/lib/structuredReportLive'

import type { KindraStructuredReportJson } from './kindraStructuredReportTypes'

export { getKindraApiBaseUrl } from '@/lib/kindraApiEndpoints'
const PREMIUM_INTAKE_PATH = '/api/kindra-premium-intake'

/** 브라우저: 미니앱 서버 프록시(시크릿 주입). 서버 번들: 메인 API 직접. */
function getPremiumIntakePostUrl(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin.replace(/\/$/, '')}${PREMIUM_INTAKE_PATH}`
  }
  return `${getKindraApiBaseUrl()}${PREMIUM_INTAKE_PATH}`
}

/**
 * 결제 승인 후 메인 Kindra API로 Payload + 결제 메타를 POST합니다.
 * 성공 시 응답의 `report`(구조화 JSON)를 반환합니다.
 * 엔드포인트가 없거나 비활성화된 경우 `softFail` 로 **null** 을 돌려 클라이언트 분석으로 폴백할 수 있습니다.
 */
export async function postPremiumIntakeAfterPayment(
  body: KindraPremiumIntakePaymentBody,
  options?: { softFail?: boolean; signal?: AbortSignal },
): Promise<KindraStructuredReportJson | null> {
  const url = getPremiumIntakePostUrl()
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: options?.signal,
  })
  if (res.ok) {
    try {
      const data = (await res.json()) as { ok?: unknown; report?: KindraStructuredReportJson }
      if (data?.ok === true && data.report && typeof data.report === 'object') {
        return normalizeStructuredReportInput(data.report, body.payload.imageUrls.length)
      }
    } catch {
      /* malformed body */
    }
    return null
  }
  if (
    options?.softFail &&
    (res.status === 401 ||
      res.status === 404 ||
      res.status === 405 ||
      res.status === 403 ||
      res.status === 502 ||
      res.status === 500)
  ) {
    return null
  }
  const text = await res.text().catch(() => '')
  throw new Error(`프리미엄 인테이크 API 실패 (${res.status}) ${text.slice(0, 200)}`)
}

function assertHttpsOrRelative(u: string): void {
  if (u.startsWith('/')) return
  try {
    const parsed = new URL(u)
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') return
  } catch {
    /* fallthrough */
  }
  throw new Error(`허용되지 않은 이미지 URL: ${u}`)
}

/**
 * Payload의 5 URL을 인라인 이미지로 읽어 `postStructuredReportAnalysis`를 호출합니다.
 * 메인 웹의 `/api/kindra-structured-report`와 동일 계약을 사용합니다.
 */
export async function runStructuredReportFromPremiumPayload(
  payload: KindraPremiumIntakePayload,
  signal?: AbortSignal,
): Promise<KindraStructuredReportJson> {
  const images = await Promise.all(
    payload.imageUrls.map(async (url) => {
      assertHttpsOrRelative(url)
      return fetchUrlAsInlineImage(url, signal)
    }),
  )

  return postStructuredReportAnalysis(images, premiumPayloadToStructuredApiContext(payload), signal)
}

/**
 * 인테이크 제출 → 구조화 리포트 API → payload·report 를 세션(또는 인메모리)에 저장.
 */
export async function submitPremiumIntakeForReport(
  payload: KindraPremiumIntakePayload,
  signal?: AbortSignal,
): Promise<KindraStructuredReportJson> {
  setPremiumSessionItem(KINDRA_PREMIUM_INTAKE_STORAGE_KEY, JSON.stringify(payload))
  const report = await runStructuredReportFromPremiumPayload(payload, signal)
  setPremiumSessionItem(KINDRA_LIVE_STRUCTURED_REPORT_STORAGE_KEY, JSON.stringify(report))
  return report
}
