import type { NextConfig } from 'next'

import { KINDRA_JIO_REPORT_UUID } from './lib/reports/kindra-static-demo-report'

/**
 * 모바일 등에서 `http://<LAN-IP>:3000` 으로 `next dev` 에 접속할 때 허용할 호스트(쉼표 구분, 포트 제외).
 * 추가로 `.env.local` → `ALLOWED_DEV_ORIGINS`(예: `192.168.219.103` 또는 `*.myhost.test`).
 *
 * IP 와일드카드는 Next 가 호스트를 `.` 단위로 맞추므로 `192.168.*` 가 아니라 `192.168.*.*` 형이어야 합니다.
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins
 */
const DEV_LAN_ALLOWED_ORIGIN_PATTERNS = ['192.168.*.*', '10.*.*.*', '172.*.*.*'] as const

function parseAllowedDevOrigins(): string[] {
  const raw = process.env.ALLOWED_DEV_ORIGINS
  const fromEnv = raw?.trim()
    ? raw.split(',').map((s) => s.trim()).filter(Boolean)
    : []
  /** `allowedDevOrigins` 가 비어 있으면 교차 출처는 경고만, 있으면 미허용 출처는 403·HMR 실패. 개발 시 사설망 패턴을 기본 병합합니다. */
  if (process.env.NODE_ENV !== 'development') {
    return fromEnv
  }
  return [...new Set([...DEV_LAN_ALLOWED_ORIGIN_PATTERNS, ...fromEnv])]
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /** LAN 등 교차 출처에서 오는 `/_next/*` 요청 허용 — 없으면 모바일에서 청크·Server Action 이 불안정할 수 있음 */
  allowedDevOrigins: parseAllowedDevOrigins(),
  /** 5장 × 최대 4MB 업로드(Server Action) — 기본 1MB 한도를 넘기지 않으면 Gemini 폼이 413 으로 실패합니다 */
  experimental: {
    serverActions: {
      bodySizeLimit: '22mb',
    },
  },
  images: {
    /** `public/` 정적 파일 — 외부 URL 은 `remotePatterns` 로 별도 추가 */
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  async redirects() {
    return [
      {
        source: '/report/jio',
        destination: `/reports/${KINDRA_JIO_REPORT_UUID}`,
        permanent: true,
      },
    ]
  },
}

export default nextConfig
