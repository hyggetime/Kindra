import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
}

export default nextConfig
