import type { MetadataRoute } from 'next'

import { getSiteOrigin } from '@lib/site-origin'

/** 검색·공유용 공개 URL 목록 (민감 경로는 `robots.ts` disallow 와 정합). */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteOrigin()
  const now = new Date()

  const paths = ['/', '/apply', '/tools', '/intake', '/privacy', '/terms'] as const

  return paths.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === '/' ? ('weekly' as const) : ('monthly' as const),
    priority: path === '/' ? 1 : path === '/apply' ? 0.95 : 0.85,
  }))
}
