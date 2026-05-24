/**
 * 통합 인테이크 리포트 마크다운을 화면에 보이기 전에 정리합니다.
 * (모델이 넣은 차트용 JSON 펜스 등 — 부모에게는 그대로 두지 않음)
 */
export function stripIntakeMachineArtifacts(markdown: string): string {
  let s = markdown.replace(/\r\n/g, '\n')
  // ```json { ... } ``` 또는 ``` { ... } ``` (단일 객체, 한 줄·여러 줄)
  s = s.replace(/```(?:json)?\s*\n?\s*\{[\s\S]*?\}\s*```/g, '')
  s = s.replace(/\n{3,}/g, '\n\n')
  return s.trim()
}
