/**
 * 통합 리포트(마크다운) UI용 페이로드.
 * 제출 성공 시에는 `kindra_reports.report_json`(schema: kindra_intake_session)에 저장되며,
 * `/apply/report`·sessionStorage 는 예전·직접 URL 접근용으로만 남아 있습니다.
 */
export const INTAKE_REPORT_SESSION_KEY = 'kindra:intakeReportSession:v2'

export type IntakeReportSessionSubject = {
  applicantLabel: string
  childLabel: string
  birthAndMaterials: string
}

export type IntakeReportSessionPayload = {
  v: 2
  /** 예: `KINDRA-2026-JIO` — 연도·아이 식별 슬러그 */
  reportId: string
  intakeId: string
  markdown: string
  subject: IntakeReportSessionSubject
  childShortName: string
  heroTitleLines: [string, string]
  /** 그림 1 고해상도 JPEG data URL — 히어로 전용(없으면 drawingThumbDataUrls[0]) */
  heroImageDataUrl?: string
  /** 작은 JPEG data URL — 그림별 요약 UI (없으면 그라데이션만) */
  drawingThumbDataUrls?: string[]
}
