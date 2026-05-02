/** Gemini 마크다운을 Jio 리포트형 섹션으로 나눕니다. `### 제목` 줄은 소제목으로 쓰입니다. */

export type IntakeMarkdownSection = {
  /** `###` 줄에서 온 제목(빈 문자열이면 도입부만) */
  title: string
  body: string
}

export function splitIntakeMarkdownByH3(markdown: string): IntakeMarkdownSection[] {
  const normalized = markdown.replace(/\r\n/g, '\n').trim()
  if (!normalized) return []

  const chunks = normalized.split(/\n(?=### )/)
  const out: IntakeMarkdownSection[] = []

  for (const raw of chunks) {
    const t = raw.trim()
    if (!t) continue
    if (t.startsWith('###')) {
      const lines = t.split('\n')
      const title = (lines[0] ?? '').replace(/^###\s+/, '').trim()
      const body = lines.slice(1).join('\n').trim()
      out.push({ title: stripHeadingMarkers(title), body: normalizeBodyWhitespace(body) })
    } else {
      out.push({ title: '', body: normalizeBodyWhitespace(t) })
    }
  }
  return out
}

/** 소제목에 남은 `**`·`#` 등 표식 제거(가독용) */
export function stripHeadingMarkers(s: string): string {
  return s.replace(/\*{1,3}/g, '').replace(/^#+\s*/, '').trim()
}

export function normalizeBodyWhitespace(body: string): string {
  return body.replace(/\n{3,}/g, '\n\n').trim()
}

/** 본문에서 해시태그 후보 추출 (#한글_스네이크 등) */
export function extractHashtagTokens(markdown: string): string[] {
  const m = markdown.match(/#[가-힣A-Za-z0-9_]+/g)
  if (!m) return []
  return [...new Set(m)].slice(0, 12)
}
