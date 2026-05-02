/**
 * 킨드라와 동일한 시스템·유저 프롬프트 문자열을 쓰되, 아주 작은 JPEG를
 * 1장 / 5장 붙여서 countTokens + generateContent(출력 상한) 결과를 비교합니다.
 *
 * 사전: GEMINI_API_KEY (.env.local 은 아래에서 자동 로드 시도)
 * 실행: npm run gemini:token-probe
 */

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Part } from '@google/generative-ai'
import { buildKindraSystemInstruction, buildKindraUserPrompt } from '../lib/gemini/prompts'

/** 1×1 픽셀 JPEG (base64) — 동일 바이트를 N번 첨부해 장수만 바꿉니다. */
const TINY_JPEG_B64 =
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAABAAEDAREAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8='

function loadEnvLocal(): void {
  const p = resolve(process.cwd(), '.env.local')
  if (!existsSync(p)) return
  for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i === -1) continue
    const key = t.slice(0, i).trim()
    let val = t.slice(i + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (process.env[key] === undefined) process.env[key] = val
  }
}

async function probeImageCount(imageCount: number): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY 가 없습니다. .env.local 또는 환경 변수를 설정하세요.')

  const modelName = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash'
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: buildKindraSystemInstruction(imageCount),
  })

  const textPart = buildKindraUserPrompt({}, imageCount)
  const imageParts: Part[] = Array.from({ length: imageCount }, () => ({
    inlineData: { mimeType: 'image/jpeg', data: TINY_JPEG_B64 },
  }))
  const parts: Part[] = [{ text: textPart }, ...imageParts]

  const counted = await model.countTokens(parts)
  const result = await model.generateContent({
    contents: [{ role: 'user', parts }],
    generationConfig: { maxOutputTokens: 160, temperature: 0.4 },
  })

  const text = result.response.text()
  const usage = (result.response as { usageMetadata?: Record<string, unknown> }).usageMetadata

  console.info(
    JSON.stringify({
      tag: 'kindra:gemini:token-probe',
      imageCount,
      model: modelName,
      countTokensTotal: counted.totalTokens,
      usage: usage ?? null,
      outputTextChars: text.length,
      hint: 'promptTokenCount=실제 청구에 가까운 입력, candidatesTokenCount=출력. countTokensTotal 과 promptTokenCount 를 비교해 보세요.',
    }),
  )
}

async function main(): Promise<void> {
  loadEnvLocal()
  console.info('[kindra:gemini:token-probe] N=1 …')
  await probeImageCount(1)
  console.info('[kindra:gemini:token-probe] N=5 …')
  await probeImageCount(5)
  console.info('[kindra:gemini:token-probe] 완료.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
