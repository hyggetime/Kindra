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
  /** 그림이 그려진 날(YYYY-MM-DD) — 시계열·개월 수와 함께 보관 */
  drawnAtIso?: string
  /** drawnAtIso 시점 생후 개월 수(코드 계산) */
  childAgeInMonthsAtDrawing?: number
  /** 작은 JPEG data URL — 그림별 요약 UI (없으면 그라데이션만) */
  drawingThumbDataUrls?: string[]
  /** 결제·분석 대기 중이면 true — 본문 마크다운이 아직 없을 수 있음 */
  analysisPending?: boolean
  /** 신청 시 그림별 메모(재분석 시 Gemini 입력으로 사용) */
  drawingMemos?: string[]
}