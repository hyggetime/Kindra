import { isReportsUuidSegment } from '@lib/auth/internal-next'
import { KINDRA_JIO_REPORT_UUID } from '@lib/reports/kindra-static-demo-report'

export const REPORT_VISITS_KEY = 'kindra_report_visits'

export type ReportVisitRecord = {
  reportUuid: string
  childShortName: string
  visitedAt: string
}

type LegacyVisit = {
  reportId?: string
  slug?: string
  childShortName?: string
  visitedAt?: string
  reportUuid?: string
}

function normalizeVisitEntry(entry: unknown): ReportVisitRecord | null {
  if (!entry || typeof entry !== 'object') return null
  const o = entry as LegacyVisit
  if (typeof o.reportUuid === 'string' && isReportsUuidSegment(o.reportUuid) && typeof o.childShortName === 'string') {
    return {
      reportUuid: o.reportUuid.trim().toLowerCase(),
      childShortName: o.childShortName,
      visitedAt: typeof o.visitedAt === 'string' ? o.visitedAt : new Date().toISOString(),
    }
  }
  /** 레거시: `slug: jio` / KINDRA-* reportId */
  const slug = typeof o.slug === 'string' ? o.slug.trim().toLowerCase() : ''
  const rid = typeof o.reportId === 'string' ? o.reportId : ''
  if (slug === 'jio' || rid.includes('JIO')) {
    return {
      reportUuid: KINDRA_JIO_REPORT_UUID,
      childShortName: typeof o.childShortName === 'string' ? o.childShortName : '아이',
      visitedAt: typeof o.visitedAt === 'string' ? o.visitedAt : new Date().toISOString(),
    }
  }
  if (isReportsUuidSegment(rid) && typeof o.childShortName === 'string') {
    return {
      reportUuid: rid.trim().toLowerCase(),
      childShortName: o.childShortName,
      visitedAt: typeof o.visitedAt === 'string' ? o.visitedAt : new Date().toISOString(),
    }
  }
  return null
}

export function recordReportVisit(record: Omit<ReportVisitRecord, 'visitedAt'>): void {
  if (typeof window === 'undefined') return
  try {
    const now = new Date().toISOString()
    const raw = window.localStorage.getItem(REPORT_VISITS_KEY)
    const parsed: unknown[] = raw ? (JSON.parse(raw) as unknown[]) : []
    const list: ReportVisitRecord[] = []
    for (const e of parsed) {
      const n = normalizeVisitEntry(e)
      if (n) list.push(n)
    }
    const uuid = record.reportUuid.trim().toLowerCase()
    const next = list.filter((x) => x.reportUuid !== uuid)
    next.unshift({ ...record, reportUuid: uuid, visitedAt: now })
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
    const parsed = JSON.parse(raw) as unknown[]
    const out: ReportVisitRecord[] = []
    for (const e of parsed) {
      const n = normalizeVisitEntry(e)
      if (n) out.push(n)
    }
    return out
  } catch {
    return []
  }
}
