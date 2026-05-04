import type { MetadataRoute } from 'next'

import { SITE_OG_IMAGE } from '@lib/site-og'

const DESCRIPTION =
  '아이 그림을 통해 마음의 패턴을 읽는 킨드라(Kindra). 다정한 마음 지도 리포트와 관찰 도구 안내.'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: '킨드라 Kindra — 아이 그림 마음 분석',
    short_name: 'Kindra',
    description: DESCRIPTION,
    start_url: '/',
    scope: '/',
    display: 'browser',
    orientation: 'portrait-primary',
    background_color: '#FDFBF9',
    theme_color: '#7C9070',
    lang: 'ko',
    categories: ['education', 'lifestyle', 'kids'],
    icons: [
      {
        src: '/favicon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/favicon-180.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/favicon-32.png',
        sizes: '32x32',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    /** 브라우저 탭·설치형 미리보기 보조 — OG 생성 에셋과 동일 계열 */
    screenshots: [
      {
        src: SITE_OG_IMAGE.url.split('?')[0],
        sizes: `${SITE_OG_IMAGE.width}x${SITE_OG_IMAGE.height}`,
        type: 'image/png',
        form_factor: 'wide',
        label: '킨드라 서비스 미리보기',
      },
    ],
  }
}
