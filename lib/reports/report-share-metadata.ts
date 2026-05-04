import type { Metadata } from 'next'

import { SITE_OG_IMAGE } from '@lib/site-og'
import { getSiteOrigin } from '@lib/site-origin'
import type { ResolvedReportJson } from '@lib/reports/resolve-report-json'

export const REPORT_SHARE_DESCRIPTION =
  '아이의 그림 속에 숨겨진 특별한 마음의 신호를 함께 읽어봅니다.'

export function reportShareTitle(childShortName: string | undefined): string {
  const name = childShortName?.trim()
  const segment = name ? `${name}의 마음 리포트` : '아이의 마음 리포트'
  return `${segment} | 킨드라(Kindra)`
}

function openGraphImage(
  resolved: ResolvedReportJson,
  origin: string,
): NonNullable<Metadata['openGraph']>['images'] {
  if (resolved.variant === 'kindra_page') {
    const src = resolved.data.hero.imageSrc
    if (typeof src === 'string' && src.startsWith('/')) {
      return [{ url: `${origin}${src}`, alt: resolved.data.hero.imageAlt }]
    }
    if (typeof src === 'string' && (src.startsWith('http://') || src.startsWith('https://'))) {
      return [{ url: src, alt: resolved.data.hero.imageAlt }]
    }
  }
  if (resolved.variant === 'intake_session') {
    const first = resolved.session.heroImageDataUrl ?? resolved.session.drawingThumbDataUrls?.[0]
    /** data URL 은 대부분 크롤러 OG 에 부적합 — 공개 HTTP URL 일 때만 사용 */
    if (typeof first === 'string' && (first.startsWith('http://') || first.startsWith('https://'))) {
      return [{ url: first, alt: '제출 그림' }]
    }
  }
  return [
    {
      url: `${origin}${SITE_OG_IMAGE.url}`,
      width: SITE_OG_IMAGE.width,
      height: SITE_OG_IMAGE.height,
      alt: SITE_OG_IMAGE.alt,
    },
  ]
}

function ogPreviewUrls(resolved: ResolvedReportJson, origin: string): string[] {
  const imgs = openGraphImage(resolved, origin)
  const arr = imgs == null ? [] : Array.isArray(imgs) ? imgs : [imgs]
  const urls = arr
    .map((x) => {
      if (typeof x === 'string') return x
      if (x instanceof URL) return x.toString()
      if (typeof x === 'object' && x !== null && 'url' in x) {
        const u = (x as { url?: string | URL }).url
        if (typeof u === 'string') return u
        if (u instanceof URL) return u.toString()
      }
      return ''
    })
    .filter(Boolean)
  return urls.length > 0 ? urls : [`${origin}${SITE_OG_IMAGE.url}`]
}

export function metadataForResolvedReport(
  resolved: ResolvedReportJson,
  origin: string,
  childShortName: string | undefined,
): Metadata {
  const title = reportShareTitle(childShortName)
  const previewUrls = ogPreviewUrls(resolved, origin)
  return {
    title,
    description: REPORT_SHARE_DESCRIPTION,
    robots: { index: false, follow: false },
    openGraph: {
      type: 'article',
      locale: 'ko_KR',
      siteName: '킨드라 Kindra',
      title,
      description: REPORT_SHARE_DESCRIPTION,
      images: openGraphImage(resolved, origin),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: REPORT_SHARE_DESCRIPTION,
      images: previewUrls,
    },
  }
}

export function fallbackReportListMetadata(): Metadata {
  const origin = getSiteOrigin()
  return {
    title: '리포트 — Kindra',
    robots: { index: false, follow: false },
    openGraph: {
      title: '리포트 — Kindra',
      description: REPORT_SHARE_DESCRIPTION,
      images: [{ url: `${origin}${SITE_OG_IMAGE.url}`, width: SITE_OG_IMAGE.width, height: SITE_OG_IMAGE.height }],
    },
  }
}
