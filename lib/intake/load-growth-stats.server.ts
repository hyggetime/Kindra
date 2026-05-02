import 'server-only'

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const CANDIDATES = ['public/growth_stats.json', 'growth_stats.json'] as const

/** 리포트용 성장 기준 JSON. 없으면 null (섹션 생략). */
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
  return null
}
