import type { Metadata } from 'next'
import { Suspense } from 'react'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/react'

import { KakaoSdkProvider } from '@/components/kakao/KakaoSdkProvider'
import { SITE_OG_IMAGE } from '@lib/site-og'

import './globals.css'

const SITE_TITLE = '킨드라 | 5장의 그림으로 발견하는 아이의 마음 패턴 분석'
const SITE_DESCRIPTION =
  '아이의 그림 한 장으로는 알 수 없는 마음의 결. 킨드라는 연속된 관찰을 통해 아이의 세계를 관통하는 일관된 패턴을 찾아냅니다. 디자이너의 시선으로 엮어낸 다정한 마음 지도 리포트.'

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  metadataBase: new URL('https://kindra.vercel.app'),
  alternates: { canonical: '/' },
  /** `main` 브랜치 `index.html` 과 동일 — `public/favicon*.png` */
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/favicon-180.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    siteName: '킨드라 Kindra',
    locale: 'ko_KR',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: '/',
    images: [SITE_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [SITE_OG_IMAGE.url],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-QHB2KXJ78B" strategy="afterInteractive" />
        <Script id="kindra-gtag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-QHB2KXJ78B');
          `}
        </Script>
        <KakaoSdkProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </KakaoSdkProvider>
        <Analytics />
      </body>
    </html>
  )
}
