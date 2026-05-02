import 'server-only'

/** 관리자 테이블용 — report_json 에 없으면 KindraReportPageData 필드·행 이메일로 보완 */
export function adminChildNameFromReportJson(reportJson: unknown): string {
  if (!reportJson || typeof reportJson !== 'object') return '—'
  const o = reportJson as Record<string, unknown>
  const n = o.childName
  if (typeof n === 'string' && n.trim()) return n.trim()
  const short = o.childShortName
  if (typeof short === 'string' && short.trim()) return short.trim()
  return '—'
}

export function adminParentEmailFromReportJson(reportJson: unknown, ownerEmail: string): string {
  if (!reportJson || typeof reportJson !== 'object') return ownerEmail.trim() || '—'
  const o = reportJson as Record<string, unknown>
  const pe = o.parentEmail
  if (typeof pe === 'string' && pe.trim()) return pe.trim()
  return ownerEmail.trim() || '—'
}
