/** UUID v4 (경로 세그먼트 검증용) */
const UUID_V4_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const PRICE_TIERS = new Set(['free', 'discount', 'normal'])

const ALLOWED_APPLY_HASHES = new Set(['', '#apply-form', '#apply-steps', '#apply-analysis'])

/**
 * 이메일 매직링크 `emailRedirectTo` 등에 넣을 `next` — 오픈 리다이렉트 방지.
 * 허용: `/`, `/apply`(및 동일 경로의 허용된 `#` 앵커), `/apply/payment`·레거시 `/intake/success`(tier·report 쿼리만), `/reports/{uuid v4}` (리포트 PK), 레거시 `/report/{slug}`
 */
export function sanitizeInternalNextPath(raw: string | null | undefined): string {
  if (!raw || typeof raw !== 'string') return '/'
  const s = raw.trim()
  if (!s.startsWith('/') || s.startsWith('//')) return '/'

  if (s === '/') return '/'

  try {
    const uApply = new URL(s, 'https://kindra.invalid')
    const pathApply = uApply.pathname.replace(/\/$/, '') || '/'
    if (pathApply === '/apply') {
      const h = uApply.hash || ''
      if (!ALLOWED_APPLY_HASHES.has(h)) return '/apply'
      return h === '' ? '/apply' : `/apply${h}`
    }
  } catch {
    /* fall through */
  }

  try {
    const u = new URL(s, 'https://kindra.invalid')
    const path = u.pathname.replace(/\/$/, '') || '/'
    if (path === '/intake/success' || path === '/apply/payment') {
      const tierRaw = u.searchParams.get('tier')
      const reportRaw = u.searchParams.get('report')
      const tier = tierRaw && PRICE_TIERS.has(tierRaw) ? tierRaw : 'free'
      const out = new URLSearchParams()
      out.set('tier', tier)
      if (reportRaw) {
        const rid = reportRaw.trim().toLowerCase()
        if (UUID_V4_RE.test(rid)) out.set('report', rid)
      }
      return `/apply/payment?${out.toString()}`
    }
  } catch {
    /* ignore */
  }

  const reports = /^\/reports\/([0-9a-fA-F-]{36})\/?$/.exec(s)
  if (reports) {
    const id = reports[1].toLowerCase()
    return UUID_V4_RE.test(id) ? `/reports/${id}` : '/'
  }

  const legacy = /^\/report\/([a-zA-Z0-9_-]+)\/?$/.exec(s)
  if (legacy) return `/report/${legacy[1]}`

  return '/'
}

/** `/reports/[id]` 의 id 가 UUID v4 인지 */
export function isReportsUuidSegment(id: string): boolean {
  return UUID_V4_RE.test(id.trim())
}
