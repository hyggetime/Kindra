import type { NextConfig } from 'next'
import path from 'node:path'

/**
 * 토스 미니앱(AIT)용 정적 번들 — 루트 `next.config.ts`와 별도.
 * @see docs/architecture/TOSS_MINIAPP_BRANCH_PLAN.md
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  outputFileTracingRoot: path.join(process.cwd()),
  eslint: { ignoreDuringBuilds: true },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
