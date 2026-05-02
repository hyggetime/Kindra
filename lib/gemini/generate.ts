import 'server-only'

import { GoogleGenerativeAI } from '@google/generative-ai'
import { buildKindraSystemInstruction, buildKindraUserPrompt, type KindraUserContext } from './prompts'
import {
  isKindraGeminiTokenDebug,
  logKindraGeminiUsage,
  serializeUsageMetadata,
  shouldLogGeminiUsageToTerminal,
} from './token-debug'

export type GeminiInlineImage = {
  mimeType: string
  /** raw base64, no data: URL prefix */
  base64: string
}

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp'])

export function assertAllowedImageMime(mime: string): void {
  const m = mime.toLowerCase().split(';')[0].trim()
  if (!ALLOWED_MIME.has(m)) {
    throw new Error(`Unsupported image type: ${mime}. Use JPEG, PNG, or WebP.`)
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isLikely429(e: unknown): boolean {
  const raw = e instanceof Error ? e.message : String(e)
  return (
    raw.includes('429') ||
    raw.includes('RESOURCE_EXHAUSTED') ||
    raw.toLowerCase().includes('quota') ||
    raw.includes('Too Many Requests')
  )
}

/**
 * 1~5장 멀티모달 리포트 생성. **서버 전용** — Server Action 에서만 호출.
 * 429 는 일시적 할당량·버스트일 수 있어 한 번만 잠시 대기 후 재시도합니다.
 */
export async function generateKindraMultimodalReport(
  images: GeminiInlineImage[],
  ctx: KindraUserContext,
): Promise<string> {
  const n = images.length
  if (n < 1 || n > 5) {
    throw new Error('Kindra multimodal analysis requires 1 to 5 images.')
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set.')
  }

  /** Google AI Studio 신규 키에서 `gemini-2.0-flash` 가 404 인 경우가 많아 2.5 Flash 를 기본값으로 둡니다. */
  const modelName = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash'
  const genAI = new GoogleGenerativeAI(apiKey)

  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: buildKindraSystemInstruction(n),
  })

  const userParts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    { text: buildKindraUserPrompt(ctx, n) },
    ...images.map((im) => {
      assertAllowedImageMime(im.mimeType)
      return {
        inlineData: {
          mimeType: im.mimeType.toLowerCase().split(';')[0].trim(),
          data: im.base64,
        },
      }
    }),
  ]

  let lastRaw = ''
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) await sleep(6000)
    try {
      let countTokensTotal: number | undefined
      if (isKindraGeminiTokenDebug()) {
        try {
          const ct = await model.countTokens(userParts)
          countTokensTotal = ct.totalTokens
        } catch {
          countTokensTotal = undefined
        }
      }

      const result = await model.generateContent(userParts)
      const text = result.response.text()
      if (!text?.trim()) {
        throw new Error('Empty response from Gemini.')
      }

      if (shouldLogGeminiUsageToTerminal()) {
        const usage = serializeUsageMetadata(
          (result.response as { usageMetadata?: unknown }).usageMetadata,
        )
        logKindraGeminiUsage({
          model: modelName,
          imageCount: n,
          countTokensTotal,
          usage,
          outputTextChars: text.length,
          note: usage
            ? 'promptTokenCount≈입력(텍스트+이미지 등), candidatesTokenCount=출력. totalTokenCount는 합계.'
            : 'usageMetadata 가 비어 있습니다. 모델/엔드포인트에 따라 생략될 수 있습니다.',
        })
      }

      return text
    } catch (e) {
      lastRaw = e instanceof Error ? e.message : String(e)
      if (isLikely429(e) && attempt === 0) continue
      if (lastRaw.includes('API_KEY_INVALID') || lastRaw.includes('401')) {
        throw new Error('Gemini API 키가 유효하지 않습니다. Google AI Studio 에서 키를 다시 발급해 주세요.')
      }
      if (lastRaw.includes('404') || lastRaw.includes('not found')) {
        throw new Error(
          [
            `모델을 찾을 수 없습니다(404). 현재 GEMINI_MODEL=${modelName} 입니다.`,
            '유료·신규 키에서도 `gemini-2.0-flash` 는 프로젝트에 따라 비활성일 수 있습니다.',
            '.env.local 의 GEMINI_MODEL 을 예: gemini-2.5-flash, gemini-2.5-flash-lite, gemini-1.5-flash 로 바꾼 뒤 다시 시도해 주세요.',
            '지원 모델: https://ai.google.dev/gemini-api/docs/models',
          ].join(' '),
        )
      }
      if (isLikely429(e)) {
        throw new Error(
          [
            'Gemini API 가 할당량·속도 제한(429)을 반환했습니다. 이 신청 흐름에서는 모델을 한 번만 호출합니다.',
            '• Google AI Studio / Google Cloud 에서 해당 키·프로젝트의 분당/일일 한도와 무료 등급 제한을 확인해 주세요.',
            '• GEMINI_MODEL 을 gemini-2.5-flash-lite 또는 gemini-1.5-flash 처럼 한도·단가가 다른 모델로 바꿔 보세요.',
            '• 첨부 이미지가 많거나 크면 입력 토큰이 많아져 같은 증상이 날 수 있습니다.',
            '잠시 후 다시 시도해 주세요.',
          ].join(' '),
        )
      }
      throw new Error(`Gemini 호출 실패: ${lastRaw}`)
    }
  }
  throw new Error(`Gemini 호출 실패: ${lastRaw || '알 수 없음'}`)
}

/** @deprecated `generateKindraMultimodalReport` 사용 */
export const generateKindraFiveImageReport = generateKindraMultimodalReport
