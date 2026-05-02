/**
 * Gemini `### 그림별 시각 요약` 본문에서 장별 텍스트를 분리해
 * 썸네일과 나란히 잡지형 UI로 쓸 수 있게 합니다.
 *
 * - `- 그림 k: …` 줄 스타일
 * - 문단이 `그림 k` 로 시작하는 스타일(프롬프트 개정 후)
 * - 둘 다 없으면 전체를 remainder 로 두고 UI에서 썸만 띄운 뒤 본문 통째로 표시
 */

function splitParagraphs(body: string): string[] {
  return body
    .replace(/\r\n/g, '\n')
    .trim()
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
}

const BULLET_LINE = /^-\s*그림\s*(\d+)\s*[:：]\s*(.*)$/
/** `그림 2` / `**그림 2**` / `그림 2:` / `그림 2에서` 등 */
const PARA_LEAD = /^(\*{0,2})?그림\s*(\d+)\s*([\s*:.：—–-]|에서|은|는|을|를|의)?\s*/

function parseBulletLineStyle(body: string, imageCount: number): { captions: string[]; remainder: string } {
  const captions: string[] = Array.from({ length: imageCount }, () => '')
  const other: string[] = []
  for (const raw of body.replace(/\r\n/g, '\n').split('\n')) {
    const line = raw.trim()
    if (!line) continue
    const m = BULLET_LINE.exec(line)
    if (m) {
      const idx = Number(m[1]) - 1
      const text = (m[2] ?? '').trim()
      if (idx >= 0 && idx < imageCount) {
        captions[idx] = captions[idx] ? `${captions[idx]} ${text}`.trim() : text
        continue
      }
    }
    other.push(raw.trimEnd())
  }
  return { captions, remainder: other.join('\n').trim() }
}

export function parseDrawingSummaryCaptions(
  body: string,
  imageCount: number,
): { captions: string[]; remainder: string } {
  const n = Math.max(0, Math.floor(imageCount))
  if (n < 1) return { captions: [], remainder: body.trim() }

  const normalized = body.replace(/\r\n/g, '\n')
  const hasBulletLines = /(?:^|\n)-\s*그림\s*\d+/i.test(normalized)

  if (hasBulletLines) {
    return parseBulletLineStyle(normalized, n)
  }

  const captions: string[] = Array.from({ length: n }, () => '')
  const remainder: string[] = []
  for (const p of splitParagraphs(normalized)) {
    const m = PARA_LEAD.exec(p)
    if (m) {
      const idx = Number(m[2]) - 1
      const rest = p.slice(m[0].length).trim()
      if (idx >= 0 && idx < n) {
        captions[idx] = captions[idx] ? `${captions[idx]}\n\n${rest}`.trim() : rest
        continue
      }
    }
    remainder.push(p)
  }
  return { captions, remainder: remainder.join('\n\n').trim() }
}
