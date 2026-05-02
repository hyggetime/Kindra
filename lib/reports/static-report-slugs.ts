/**
 * `app/report/[slug]` 에 정적 데이터가 있는 슬러그만.
 * (세션 전용 `/apply/report` 등은 여기 없음 — localStorage 바로가기는 이 목록으로 필터)
 */
export const STATIC_REPORT_SLUGS = ['jio'] as const

export type StaticReportSlug = (typeof STATIC_REPORT_SLUGS)[number]

export function isStaticReportSlug(slug: string): slug is StaticReportSlug {
  return (STATIC_REPORT_SLUGS as readonly string[]).includes(slug)
}
