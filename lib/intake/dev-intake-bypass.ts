/**
 * 로컬 테스트용 인테이크 바이패스 — `NODE_ENV=development` 이고 플래그가 켜져 있을 때만 활성.
 * 프로덕션 빌드(`next build` / `next start` / Vercel)에서는 NODE_ENV 가 production 이라 항상 비활성.
 *
 * 플래그: `KINDRA_DEV_INTAKE_BYPASS` — `true` / `1` / `yes` / `on`(대소문자 무시).
 * `.env` 에서 `true # 주석`, 따옴표, UTF-8 BOM 등은 정규화 시 제거·무시합니다.
 */
export function normalizeKindraDevIntakeBypassValue(raw: string | undefined): string {
  if (typeof raw !== 'string') return ''
  let v = raw.replace(/^\uFEFF/, '').trim()
  const hash = v.indexOf('#')
  if (hash !== -1) v = v.slice(0, hash).trim()
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1).trim()
  }
  return v.toLowerCase()
}

function isBypassFlagEnabled(): boolean {
  const v = normalizeKindraDevIntakeBypassValue(process.env.KINDRA_DEV_INTAKE_BYPASS)
  return v === 'true' || v === '1' || v === 'yes' || v === 'on'
}

export function isDevIntakeBypassEnabled(): boolean {
  return process.env.NODE_ENV === 'development' && isBypassFlagEnabled()
}

/** 디버그용 — 서버에서만 의미 있음. 값이 비밀이 아니라 불리언 플래그 전제. */
export function devIntakeBypassEnvStatus(): {
  nodeEnv: string
  flagRawLength: number
  flagRecognized: boolean
  /** 인식 실패 시에만: 정규화 후 문자열(JSON 이스케이프로 보이지 않는 문자 확인용) */
  normalizedDebug: string | null
} {
  const raw = process.env.KINDRA_DEV_INTAKE_BYPASS
  const recognized = isBypassFlagEnabled()
  const normalized = normalizeKindraDevIntakeBypassValue(raw)
  let normalizedDebug: string | null = null
  if (!recognized) {
    if (normalized.length > 0) {
      normalizedDebug =
        normalized.length > 80 ? `${JSON.stringify(normalized.slice(0, 80))}…` : JSON.stringify(normalized)
    } else if (typeof raw === 'string' && raw.replace(/^\uFEFF/, '').trim().length > 0) {
      normalizedDebug =
        '(정규화 후 비어 있음 — 따옴표·# 주석만 있는 줄, 또는 보이지 않는 문자만 있는지 확인하세요)'
    }
  }
  return {
    nodeEnv: process.env.NODE_ENV ?? '(unset)',
    flagRawLength: typeof raw === 'string' ? raw.replace(/^\uFEFF/, '').trim().length : 0,
    flagRecognized: recognized,
    normalizedDebug,
  }
}
