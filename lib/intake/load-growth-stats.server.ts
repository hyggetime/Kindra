import 'server-only'

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import growthStatsBundled from '../../public/growth_stats.json'

const CANDIDATES = ['public/growth_stats.json', 'growth_stats.json'] as const

/**
 * 리포트용 성장 기준 JSON.
 * 로컬에서는 `public/growth_stats.json` 을 우선 읽고, 서버리스 번들에서 디스크 경로가 없을 때는
 * 빌드에 포함된 동일 JSON 으로 폴백합니다(몸과 마음 절 누락 방지).
 */
export function loadGrowthStatsJsonRaw(): string | null {
  const cwd = process.cwd()
  for (const rel of CANDIDATES) {
    const abs = join(cwd, rel)
    try {
      if (existsSync(abs)) {
        return readFileSync(abs, 'utf-8')
      }
    } catch {
      /* ignore */
    }
  }
  try {
    return JSON.stringify(growthStatsBundled)
  } catch {
    return null
  }
}
