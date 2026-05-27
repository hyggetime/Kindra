/**
 * 토스 미니앱 결제 성공 등 — 프리미엄 인테이크 Payload + 결제 메타 수신 후
 * 서버에서 토스 영수증을 검증한 뒤 5장 이미지를 불러 Gemini 구조화 리포트를 생성하고(파싱 실패 시 폴백),
 * 선택적으로 Supabase `kindra_miniapp_orders` 에 적재합니다.
 *
 * 인가:
 * - `KINDRA_MINIAPP_SHARED_SECRET` 이 설정되면 `Authorization: Bearer <TOKEN>` 일치 시에만 허용(playground 무관).
 * - 미설정 시 기존처럼 development 또는 `ALLOW_PROMPT_PLAYGROUND=1` 일 때만 허용.
 */
import { NextResponse } from 'next/server'

import { generateKindraStructuredChartReport } from '@lib/gemini/generate'
import type { KindraStructuredChartReportJson } from '@lib/gemini/kindra-structured-json-report'
import { buildFallbackKindraStructuredChartReport } from '@lib/gemini/kindra-structured-json-report'
import { fetchPremiumImageUrlsAsGeminiInline } from '@lib/kindra-premium-intake-fetch.server'
import { premiumPayloadToKindraUserContext } from '@lib/kindra-premium-intake-map'
import type { KindraPremiumIntakePaymentBody } from '@lib/kindra-premium-intake-types'
import {
  constantTimeEqualToken,
  verifyTossPremiumPaymentReceipt,
} from '@lib/payment/toss-verify-premium-payment.server'
import { createServiceRoleClient } from '@lib/supabase/admin'

export const dynamic = 'force-dynamic'

function playgroundAllowed(): boolean {
  return process.env.NODE_ENV === 'development' || process.env.ALLOW_PROMPT_PLAYGROUND === '1'
}

function miniappSharedSecret(): string | undefined {
  const s = process.env.KINDRA_MINIAPP_SHARED_SECRET?.trim()
  return s || undefined
}

function bearerTokenFromRequest(req: Request): string | null {
  const raw = req.headers.get('authorization')?.trim()
  if (!raw) return null
  const m = /^Bearer\s+(.+)$/i.exec(raw)
  if (!m) return null
  return m[1]!.trim() || null
}

function accessAllowed(req: Request): { ok: true } | { ok: false; status: 401 | 403; error: string } {
  const shared = miniappSharedSecret()
  if (shared) {
    const token = bearerTokenFromRequest(req)
    if (!token || !constantTimeEqualToken(token, shared)) {
      return { ok: false, status: 401, error: '인증이 필요합니다. Authorization Bearer 토큰이 올바르지 않습니다.' }
    }
    return { ok: true }
  }
  if (playgroundAllowed()) return { ok: true }
  return {
    ok: false,
    status: 403,
    error: '비활성화: KINDRA_MINIAPP_SHARED_SECRET 을 설정하거나 development / ALLOW_PROMPT_PLAYGROUND=1 일 때만 사용할 수 있습니다.',
  }
}

function corsHeaders(req: Request): HeadersInit {
  const allow =
    process.env.KINDRA_STRUCTURED_REPORT_CORS_ORIGIN?.trim() ||
    req.headers.get('origin') ||
    '*'
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
}

export async function OPTIONS(req: Request): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) })
}

function isPayload(body: unknown): body is KindraPremiumIntakePaymentBody {
  if (!body || typeof body !== 'object') return false
  const o = body as Record<string, unknown>
  const pay = o.payment
  const pl = o.payload
  if (!pay || typeof pay !== 'object' || !pl || typeof pl !== 'object') return false
  const p = pay as Record<string, unknown>
  const load = pl as Record<string, unknown>
  const urls = load.imageUrls
  if (!Array.isArray(urls) || urls.length !== 5) return false
  if (urls.some((u) => typeof u !== 'string' || !(u as string).trim())) return false
  if (typeof p.paymentKey !== 'string' || typeof p.orderId !== 'string') return false
  if (typeof p.amount !== 'number' || !Number.isFinite(p.amount)) return false
  if (typeof load.childName !== 'string' || typeof load.childAgeLabel !== 'string') return false
  return true
}

function mergePaymentFromQuery(
  typed: KindraPremiumIntakePaymentBody,
  req: Request,
): KindraPremiumIntakePaymentBody {
  const u = new URL(req.url)
  const qKey = u.searchParams.get('paymentKey')?.trim()
  const qOid = u.searchParams.get('orderId')?.trim()
  const qAmt = u.searchParams.get('amount')
  const amountFromQuery = qAmt != null && qAmt !== '' ? Number(qAmt) : undefined

  return {
    ...typed,
    payment: {
      paymentKey: (typed.payment.paymentKey.trim() || qKey || '').trim(),
      orderId: (typed.payment.orderId.trim() || qOid || '').trim(),
      amount:
        Number.isFinite(typed.payment.amount) && typed.payment.amount > 0
          ? typed.payment.amount
          : Number.isFinite(amountFromQuery) && (amountFromQuery as number) > 0
            ? (amountFromQuery as number)
            : typed.payment.amount,
    },
  }
}

async function persistPremiumOrder(report: KindraStructuredChartReportJson, body: KindraPremiumIntakePaymentBody) {
  try {
    const sb = createServiceRoleClient()
    const { error } = await sb.from('kindra_miniapp_orders').insert({
      status: 'completed',
      email: body.payload.guardianEmail?.trim() ?? null,
      marketing_opt_in: body.payload.marketingOptIn ?? false,
      terms_agreed_at: new Date().toISOString(),
      result: {
        kind: 'premium_structured_v1',
        report,
        payment: body.payment,
        childName: body.payload.childName,
      },
    })
    if (error) console.error('[kindra-premium-intake] supabase insert:', error.message)
  } catch (e) {
    console.error('[kindra-premium-intake] persist skipped:', e instanceof Error ? e.message : e)
  }
}

export async function POST(req: Request): Promise<NextResponse> {
  const gate = accessAllowed(req)
  if (!gate.ok) {
    return NextResponse.json({ ok: false, error: gate.error }, { status: gate.status, headers: corsHeaders(req) })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400, headers: corsHeaders(req) })
  }

  if (!isPayload(body)) {
    return NextResponse.json(
      { ok: false, error: 'payload.payment 구조가 올바르지 않습니다. (paymentKey, orderId, amount 필수)' },
      { status: 400, headers: corsHeaders(req) },
    )
  }

  const typed = mergePaymentFromQuery(body as KindraPremiumIntakePaymentBody, req)
  if (!typed.payment.paymentKey || !typed.payment.orderId || !Number.isFinite(typed.payment.amount)) {
    return NextResponse.json(
      { ok: false, error: 'paymentKey, orderId, amount 를 바디 또는 쿼리로 제공해야 합니다.' },
      { status: 400, headers: corsHeaders(req) },
    )
  }

  const tossCheck = await verifyTossPremiumPaymentReceipt({
    paymentKey: typed.payment.paymentKey,
    orderId: typed.payment.orderId,
    amount: typed.payment.amount,
  })
  if (!tossCheck.ok) {
    const status = tossCheck.status === 500 ? 500 : tossCheck.status === 403 ? 403 : 400
    return NextResponse.json({ ok: false, error: tossCheck.message }, { status, headers: corsHeaders(req) })
  }

  if (!process.env.GEMINI_API_KEY?.trim()) {
    return NextResponse.json(
      { ok: false, error: 'GEMINI_API_KEY 가 설정되어 있지 않습니다.' },
      { status: 500, headers: corsHeaders(req) },
    )
  }

  const urls = typed.payload.imageUrls as [string, string, string, string, string]

  let report: KindraStructuredChartReportJson
  try {
    const images = await fetchPremiumImageUrlsAsGeminiInline(urls)
    const ctx = premiumPayloadToKindraUserContext(typed.payload)
    report = await generateKindraStructuredChartReport(images, ctx)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[kindra-premium-intake] analysis failed, using fallback:', msg)
    report = buildFallbackKindraStructuredChartReport(5)
  }

  await persistPremiumOrder(report, typed)

  return NextResponse.json({ ok: true, report }, { headers: corsHeaders(req) })
}
