export const REPORT_VISITS_KEY = 'kindra_report_visits'

export type ReportVisitRecord = {
  reportId: string
  slug: string
  childShortName: string
  visitedAt: string
}

export function recordReportVisit(record: Omit<ReportVisitRecord, 'visitedAt'>): void {
  if (typeof window === 'undefined') return
  try {
    const now = new Date().toISOString()
    const raw = window.localStorage.getItem(REPORT_VISITS_KEY)
    const list: ReportVisitRecord[] = raw ? (JSON.parse(raw) as ReportVisitRecord[]) : []
    const next = list.filter((x) => x.reportId !== record.reportId)
    next.unshift({ ...record, visitedAt: now })
    window.localStorage.setItem(REPORT_VISITS_KEY, JSON.stringify(next.slice(0, 24)))
  } catch {
    /* ignore quota / private mode */
  }
}

export function getReportVisits(): ReportVisitRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(REPORT_VISITS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as ReportVisitRecord[]
  } catch {
    return []
  }
}
