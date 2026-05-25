/**
 * 로컬·프롬프트 실험 전용 — 결제·Supabase·업로드 없이 Gemini만 호출합니다.
 * 프로덕션 기본 차단: `NODE_ENV=development` 또는 `ALLOW_PROMPT_PLAYGROUND=1` 일 때만 동작.
 */
import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

import { kindraChartReportResponseSchema } from '@lib/gemini/kindra-structured-json-report'
import { loadGrowthStatsJsonRaw } from '@lib/intake/load-growth-stats.server'
import { buildGrowthChartFactsForGeminiPrompt, parseGrowthStatsJson } from '@lib/intake/physio-emotional-from-growth'

export const dynamic = 'force-dynamic'

type InlineImage = { mimeType: string; base64: string }

/** 구조화 JSON일 때 서버가 성장도표 사실 블록을 유저 텍스트 뒤에 붙입니다. */
type StructuredGrowthBody = {
  completedMonths: number
  sex: 'male' | 'female'
  heightCm?: number | null
  weightKg?: number | null
  childDisplayName?: string
}

type Body = {
  systemInstruction: string
  userText: string
  /** true면 JSON + responseSchema (킨드라 구조화 리포트 스펙) */
  useStructuredJson?: boolean
  model?: string
  images: InlineImage[]
  structuredGrowth?: StructuredGrowthBody
}

function playgroundAllowed(): boolean {
  return process.env.NODE_ENV === 'development' || process.env.ALLOW_PROMPT_PLAYGROUND === '1'
}

export async function POST(req: Request): Promise<NextResponse> {
  if (!playgroundAllowed()) {
    return NextResponse.json(
      { error: 'test-gemini 비활성화: development 이거나 ALLOW_PROMPT_PLAYGROUND=1 일 때만 사용할 수 있습니다.' },
      { status: 403 },
    )
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey?.trim()) {
    return NextResponse.json({ error: 'GEMINI_API_KEY 가 설정되어 있지 않습니다.' }, { status: 500 })
  }

  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.systemInstruction?.trim()) {
    return NextResponse.json({ error: 'systemInstruction 은 필수입니다.' }, { status: 400 })
  }
  if (!Array.isArray(body.images) || body.images.length < 1 || body.images.length > 5) {
    return NextResponse.json({ error: 'images 는 1~5개의 { mimeType, base64 } 배열이어야 합니다.' }, { status: 400 })
  }

  const modelName = (body.model ?? process.env.GEMINI_MODEL ?? 'gemini-2.5-flash').trim()
  const genAI = new GoogleGenerativeAI(apiKey)

  const useJson = Boolean(body.useStructuredJson)
  let userText = body.userText?.trim() || '(유저 텍스트 없음)'

  if (useJson && body.structuredGrowth) {
    const g = body.structuredGrowth
    const raw = loadGrowthStatsJsonRaw()
    const stats = raw ? parseGrowthStatsJson(raw) : null
    if (stats && typeof g.completedMonths === 'number' && Number.isFinite(g.completedMonths)) {
      const block = buildGrowthChartFactsForGeminiPrompt(stats, {
        childShortName: g.childDisplayName?.trim() || '아이',
        sex: g.sex,
        completedMonths: Math.max(0, Math.floor(g.completedMonths)),
        heightCm: g.heightCm,
        weightKg: g.weightKg,
      })
      if (block) userText = `${userText}\n\n${block}`
    }
  }

  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: body.systemInstruction,
    ...(useJson
      ? {
          generationConfig: {
            responseMimeType: 'application/json' as const,
            responseSchema: kindraChartReportResponseSchema(),
          },
        }
      : {}),
  })

  const userParts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    { text: userText },
    ...body.images.map((im) => ({
      inlineData: {
        mimeType: im.mimeType.toLowerCase().split(';')[0].trim(),
        data: im.base64,
      },
    })),
  ]

  try {
    const result = await model.generateContent(userParts)
    const text = result.response.text()
    if (!text?.trim()) {
      return NextResponse.json({ error: 'Empty model response' }, { status: 502 })
    }
    return NextResponse.json({
      ok: true,
      model: modelName,
      useStructuredJson: useJson,
      rawText: text,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ ok: false, error: msg, model: modelName }, { status: 502 })
  }
}
