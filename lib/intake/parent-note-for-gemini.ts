/**
 * Gemini `parentNote` — 구조화된 보호자 메모(전체 + 그림별).
 * 분석 기준일은 항상 **요청 시점(서버의 오늘)** 입니다.
 */

export type StructuredParentNoteInput = {
  /** ISO 날짜 문자열 (YYYY-MM-DD) */
  analysisDateIso: string
  /** formatBirthAgeHintFromDate 등 한 줄 */
  ageHintLine: string
  /** 부모의 한마디(전체) */
  childNote: string
  /** 인덱스 0 = 그림 1 … 길이는 실제 제출 장수와 맞출 것 */
  drawingMemos: string[]
}

export function buildStructuredParentNoteForGemini(input: StructuredParentNoteInput): string {
  const { analysisDateIso, ageHintLine, childNote, drawingMemos } = input
  const lines: string[] = [
    `분석 기준일(현재 시점): ${analysisDateIso}`,
    `연령·월령(위 기준일로 계산): ${ageHintLine}`,
    '',
    '## 보호자 제공 메모(참고)',
    '### 전체(부모의 한마디)',
    childNote.trim() || '(없음)',
    '',
    '### 그림별 개별 메모(상황적 맥락용)',
  ]
  for (let i = 0; i < drawingMemos.length; i++) {
    const t = drawingMemos[i]?.trim() ?? ''
    lines.push(`${i + 1}번 그림: ${t || '(없음)'}`)
  }
  return lines.join('\n')
}
