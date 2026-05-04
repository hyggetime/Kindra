import type { MetadataRoute } from 'next'

import { getSiteOrigin } from '@lib/site-origin'

export default function robots(): MetadataRoute.Robots {
  const origin = getSiteOrigin()
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/reports/',
          '/apply/payment',
          '/apply/report',
          '/auth/',
        ],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin.replace(/^https?:\/\//, '').replace(/\/$/, ''),
  }
}
