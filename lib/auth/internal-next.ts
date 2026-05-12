import { KINDRA_JIO_REPORT_UUID } from '@lib/reports/kindra-static-demo-report'

/**
 * `/reports/{uuid}` 등에 쓰이는 UUID 문자열 검증 (버전 니블 완화).
 * 예전에는 v4만 허용해 `…-7xxx-…` 등 다른 RFC 변형이면 DB에 행이 있어도 404가 났습니다.
 */
const REPORT_URL_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** 메일·클립보드에 섞인 ZWSP/BOM 등 제거 후 소문자 (경로 세그먼트용). */
export function normalizeReportUrlUuid(raw: string): string {
  return raw
    .trim()
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF\u2060\u00AD]/g, '')
    .toLowerCase()
}

const ALLOWED_APPLY_HASHES = new Set(['', '#apply-form', '#apply-steps', '#apply-analysis'])

/**
 * `next=` 등에 붙은 값이 전체 URL(`https://…/reports/…`)일 때, 허용된 origin이면 pathname+search+hash만 남깁니다.
 * 브라우저 주소창은 `https://`를 숨겨 보여도 실제 값은 포함되는 경우가 많고, 복사 시 전체 URL이 오기도 합니다.
 */
function stripToInternalPathIfAbsoluteUrl(raw: string): string | null {
  const t = raw.trim()
  if (!/^https?:\/\//i.test(t)) return null
  try {
    const u = new URL(t)
    const site = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kindra.vercel.app').replace(/\/$/, '')
    const allowedOrigins = new Set([site, 'https://kindra.vercel.app'])
    const local =
      u.hostname === 'localhost' || u.hostname === '127.0.0.1' || u.hostname === '[::1]'
    if (!local && !allowedOrigins.has(u.origin)) return null
    return `${u.pathname}${u.search}${u.hash}`
  } catch {
    return null
  }
}

/**
 * 이메일 매직링크 `emailRedirectTo` 등에 넣을 `next` — 오픈 리다이렉트 방지.
 * 허용: `/`, `/apply`(및 동일 경로의 허용된 `#` 앵커), `/apply/payment`·레거시 `/intake/success`(report 쿼리만), `/reports/{uuid}` (표준 8-4-4-4-12 형태, 리포트 PK).
 * 레거시 `/report/jio` 는 고정 UUID 경로로 치환합니다.
 * 동일 사이트의 전체 URL 문자열(`https://host/path`)도 허용 origin이면 위 경로 규칙으로 환산합니다.
 */
export function sanitizeInternalNextPath(raw: string | null | undefined): string {
  if (!raw || typeof raw !== 'string') return '/'
  const absoluteStripped = stripToInternalPathIfAbsoluteUrl(raw)
  const s = (absoluteStripped ?? raw).trim()
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
      const reportRaw = u.searchParams.get('report')
      const out = new URLSearchParams()
      if (reportRaw) {
        const rid = reportRaw.trim().toLowerCase()
        if (REPORT_URL_UUID_RE.test(rid)) out.set('report', rid)
      }
      const qs = out.toString()
      return qs ? `/apply/payment?${qs}` : '/apply/payment'
    }
  } catch {
    /* ignore */
  }

  const reports = /^\/reports\/([0-9a-fA-F-]{36})\/?$/.exec(s)
  if (reports) {
    const id = reports[1].toLowerCase()
    return REPORT_URL_UUID_RE.test(id) ? `/reports/${id}` : '/'
  }

  const legacy = /^\/report\/([^/]+)\/?$/.exec(s)
  if (legacy) {
    const seg = legacy[1].trim().toLowerCase()
    if (seg === 'jio') return `/reports/${KINDRA_JIO_REPORT_UUID}`
    return '/'
  }

  return '/'
}

/** `/reports/[uuid]` 의 uuid 가 표준 8-4-4-4-12 형태인지 */
export function isReportsUuidSegment(id: string): boolean {
  return REPORT_URL_UUID_RE.test(id.trim())
}
