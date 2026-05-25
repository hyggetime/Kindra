/**
 * 구조화 JSON 리포트 — `generateKindraStructuredChartReport` (프리미엄 5축 + report_sections).
 * 토스 미니앱(`apps/kindra-toss-ui`) 등 **별도 오리진**에서 CORS로 호출 가능(dev).
 *
 * 활성화: `NODE_ENV=development` 또는 `ALLOW_PROMPT_PLAYGROUND=1` (test-gemini 와 동일 정책).
 */
import { NextResponse } from 'next/server'

import { generateKindraStructuredChartReport, type GeminiInlineImage } from '@lib/gemini/generate'
import type { KindraUserContext } from '@lib/gemini/prompts'

export const dynamic = 'force-dynamic'

type Body = {
  images: GeminiInlineImage[]
  context?: KindraUserContext
}

function playgroundAllowed(): boolean {
  return process.env.NODE_ENV === 'development' || process.env.ALLOW_PROMPT_PLAYGROUND === '1'
}

function corsHeaders(req: Request): HeadersInit {
  const allow =
    process.env.KINDRA_STRUCTURED_REPORT_CORS_ORIGIN?.trim() ||
    req.headers.get('origin') ||
    '*'
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  }
}

export async function OPTIONS(req: Request): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) })
}

export async function POST(req: Request): Promise<NextResponse> {
  if (!playgroundAllowed()) {
    return NextResponse.json(
      { ok: false, error: '비활성화: development 이거나 ALLOW_PROMPT_PLAYGROUND=1 일 때만 사용할 수 있습니다.' },
      { status: 403, headers: corsHeaders(req) },
    )
  }

  if (!process.env.GEMINI_API_KEY?.trim()) {
    return NextResponse.json(
      { ok: false, error: 'GEMINI_API_KEY 가 설정되어 있지 않습니다.' },
      { status: 500, headers: corsHeaders(req) },
    )
  }

  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400, headers: corsHeaders(req) })
  }

  const images = body.images
  if (!Array.isArray(images) || images.length < 1 || images.length > 5) {
    return NextResponse.json(
      { ok: false, error: 'images 는 1~5개의 { mimeType, base64 } 배열이어야 합니다.' },
      { status: 400, headers: corsHeaders(req) },
    )
  }

  const ctx: KindraUserContext = body.context && typeof body.context === 'object' ? body.context : {}

  try {
    const report = await generateKindraStructuredChartReport(images, ctx)
    return NextResponse.json({ ok: true, report }, { headers: corsHeaders(req) })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ ok: false, error: msg }, { status: 502, headers: corsHeaders(req) })
  }
}
