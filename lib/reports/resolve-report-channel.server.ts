import 'server-only'

import { headers } from 'next/headers'

import {
  isDesktopClientAuthorized,
  isMiniappClientAuthorized,
} from '@lib/auth/kindra-client-auth.server'

import { REPORT_CHANNEL, type ReportChannel } from '@lib/reports/report-lifecycle'

export { REPORT_CHANNEL, type ReportChannel }

/** 웹 결제 준비(`kr_` 접두) — 콜백·웹훅 시에도 창구는 web 유지 */
export const WEB_TOSS_CHECKOUT_ORDER_PREFIX = 'kr_'

/** 토스 미니앱 프리미엄 결제 주문 접두 */
export const TOSS_MINIAPP_ORDER_PREFIX = 'KINDRA-PREM-'

/**
 * HTTP 헤더만으로 창구 식별 (클라이언트 body·쿼리의 channel 값은 사용하지 않음).
 * 우선순위: desktop(비밀 토큰) → toss(미니앱 Bearer) → web
 */
export function resolveReportChannelFromHeaders(h: Headers): ReportChannel {
  if (isDesktopClientAuthorized(h)) return REPORT_CHANNEL.DESKTOP
  if (isMiniappClientAuthorized(h)) return REPORT_CHANNEL.TOSS
  return REPORT_CHANNEL.WEB
}

export function resolveReportChannelFromRequest(req: Request): ReportChannel {
  return resolveReportChannelFromHeaders(req.headers)
}

/** Server Action (`headers()` 기반) */
export async function resolveReportChannelFromServerAction(): Promise<ReportChannel> {
  const h = await headers()
  return resolveReportChannelFromHeaders(h)
}

/**
 * 검증된 토스 웹훅 요청인지 (전송 ID + 선택 URL 토큰).
 * `app/api/webhook/toss/route.ts` 와 동일 규칙.
 */
export function isVerifiedTossWebhookRequest(req: Request): boolean {
  const tokenEnv = process.env.TOSS_WEBHOOK_URL_TOKEN?.trim()
  if (tokenEnv) {
    const url = new URL(req.url)
    if (url.searchParams.get('token') !== tokenEnv) return false
  }
  const transmissionId = req.headers.get('tosspayments-webhook-transmission-id')?.trim()
  return Boolean(transmissionId)
}

/** 미니앱 프리미엄 주문 ID 패턴 */
export function isTossMiniappOrderId(orderId: string | null | undefined): boolean {
  const id = orderId?.trim() ?? ''
  return id.startsWith(TOSS_MINIAPP_ORDER_PREFIX)
}

/** 메인 웹 토스 결제창 주문 ID 패턴 */
export function isWebTossCheckoutOrderId(orderId: string | null | undefined): boolean {
  const id = orderId?.trim() ?? ''
  return id.startsWith(WEB_TOSS_CHECKOUT_ORDER_PREFIX)
}

/**
 * 검증된 토스 결제 확정 시 `kindra_reports.channel` 갱신 여부.
 * - 기존 web/desktop 창구는 유지 (웹에서 토스 결제만 한 경우).
 * - 미니앱 주문·레거시(null)는 toss 로 기록.
 */
export function reportChannelPatchOnVerifiedTossPayment(opts: {
  orderId?: string | null
  existingChannel?: string | null
}): { channel: ReportChannel } | Record<string, never> {
  const existing = opts.existingChannel?.trim().toLowerCase() ?? ''

  if (existing === REPORT_CHANNEL.WEB || existing === REPORT_CHANNEL.DESKTOP) {
    return {}
  }

  if (isWebTossCheckoutOrderId(opts.orderId)) {
    return {}
  }

  if (isTossMiniappOrderId(opts.orderId) || existing === '' || existing === REPORT_CHANNEL.TOSS) {
    return { channel: REPORT_CHANNEL.TOSS }
  }

  return { channel: REPORT_CHANNEL.TOSS }
}

/** 클라이언트가 보낸 channel 필드는 무시 (로그만). */
export function warnIfClientSentChannel(body: unknown, routeLabel: string): void {
  if (!body || typeof body !== 'object') return
  const o = body as Record<string, unknown>
  if ('channel' in o || 'platform' in o) {
    console.warn(`[${routeLabel}] 클라이언트 channel/platform 필드는 무시됩니다. 서버가 헤더로 식별합니다.`)
  }
}
