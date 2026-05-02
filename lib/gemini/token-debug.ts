import 'server-only'

const ENV_FLAG = 'KINDRA_GEMINI_TOKEN_DEBUG'

/** `KINDRA_GEMINI_TOKEN_DEBUG=true` (또는 `1`) 일 때만 추가 API(countTokens) 호출 등을 켭니다. */
export function isKindraGeminiTokenDebug(): boolean {
  const v = process.env[ENV_FLAG]
  return v === 'true' || v === '1'
}

/**
 * 터미널에 토큰 요약을 찍을지 — 개발 모드에서는 기본 ON (`false`/`0`으로만 끔).
 * `console.error` 로 stderr 에 한 줄 출력해 `next dev` 터미널에서 보이기 쉽게 합니다.
 */
export function shouldLogGeminiUsageToTerminal(): boolean {
  const v = process.env[ENV_FLAG]
  if (v === 'false' || v === '0') return false
  if (v === 'true' || v === '1') return true
  return process.env.NODE_ENV === 'development'
}

export type KindraGeminiUsageLog = {
  tag: 'kindra:gemini:usage'
  model: string
  imageCount: number
  /** `countTokens` API 선행 호출 시(옵션) */
  countTokensTotal?: number
  /** `generateContent` 응답의 `usageMetadata` (없으면 undefined) */
  usage?: Record<string, unknown>
  outputTextChars?: number
  note?: string
}

/** 서버 로그 한 줄 JSON — `next dev` 터미널·Vercel 로그에서 `[kindra:gemini:usage]` grep */
export function logKindraGeminiUsage(entry: Omit<KindraGeminiUsageLog, 'tag'>): void {
  if (!shouldLogGeminiUsageToTerminal()) return
  const payload: KindraGeminiUsageLog = { tag: 'kindra:gemini:usage', ...entry }
  const line = JSON.stringify(payload)
  console.error(`[kindra:gemini:usage] ${line}`)
}

/** 런타임에만 붙는 필드까지 JSON 직렬화용 */
export function serializeUsageMetadata(raw: unknown): Record<string, unknown> | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  try {
    return JSON.parse(JSON.stringify(raw)) as Record<string, unknown>
  } catch {
    return { _error: 'serializeUsageMetadata failed' }
  }
}
