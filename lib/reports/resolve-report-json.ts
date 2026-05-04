import type { IntakeReportSessionPayload } from '@lib/intake/intake-report-session'
import type { KindraReportPageData } from '@/types/kindraReportPage'

/** `kindra_reports.report_json` — 인테이크 통합 리포트(마크다운 세션) */
export const STORED_KINDRA_INTAKE_SCHEMA = 'kindra_intake_session' as const

export type StoredIntakeReportJson = {
  schema: typeof STORED_KINDRA_INTAKE_SCHEMA
  childName?: string
  parentEmail?: string
  session: IntakeReportSessionPayload
}

function isKindraReportPageData(v: unknown): v is KindraReportPageData {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  if (typeof o.reportId !== 'string' || o.hero === undefined || typeof o.hero !== 'object') return false
  const hero = o.hero as Record<string, unknown>
  return typeof hero.imageSrc === 'string'
}

function isIntakeSessionPayload(s: unknown): s is IntakeReportSessionPayload {
  if (!s || typeof s !== 'object') return false
  const o = s as Record<string, unknown>
  if (o.v !== 2) return false
  if (typeof o.markdown !== 'string') return false
  if (typeof o.reportId !== 'string') return false
  if (typeof o.intakeId !== 'string') return false
  if (typeof o.childShortName !== 'string') return false
  const sub = o.subject
  if (!sub || typeof sub !== 'object') return false
  const su = sub as Record<string, unknown>
  if (typeof su.applicantLabel !== 'string' || typeof su.childLabel !== 'string' || typeof su.birthAndMaterials !== 'string') {
    return false
  }
  const hero = o.heroTitleLines
  if (!Array.isArray(hero) || hero.length < 2) return false
  if (typeof hero[0] !== 'string' || typeof hero[1] !== 'string') return false
  return true
}

export type ResolvedReportJson =
  | { variant: 'kindra_page'; data: KindraReportPageData }
  | { variant: 'intake_session'; session: IntakeReportSessionPayload }

/** DB `report_json` → 렌더러별 페이로드 */
export function resolveReportJson(reportJson: unknown): ResolvedReportJson | null {
  if (isKindraReportPageData(reportJson)) {
    return { variant: 'kindra_page', data: reportJson }
  }
  if (!reportJson || typeof reportJson !== 'object') return null
  const root = reportJson as Record<string, unknown>
  if (root.schema === STORED_KINDRA_INTAKE_SCHEMA && isIntakeSessionPayload(root.session)) {
    return { variant: 'intake_session', session: root.session as IntakeReportSessionPayload }
  }
  return null
}
