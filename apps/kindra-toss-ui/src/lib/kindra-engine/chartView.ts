import type { KindraChartScoresJson } from './types'

export const CHART_AXIS_META = [
  { key: 'fine_motor' as const, label: '소근육', lens: 'Lowenfeld' },
  { key: 'observation' as const, label: '관찰', lens: 'Goodenough–Harris' },
  { key: 'spatial_logic' as const, label: '공간', lens: 'Luquet' },
  { key: 'narrative' as const, label: '서사', lens: 'Luquet' },
  { key: 'emotional_resource' as const, label: '정서', lens: 'HTP/DAP' },
] as const

export type ChartAxisRow = {
  key: keyof KindraChartScoresJson
  label: string
  lens: string
  value: number
  bandLabel: string
}

export type ScoreBand = 'rich' | 'typical' | 'observe'

/** 프롬프트·웹 뱃지와 동일 구간 */
export function getScoreBand(score: number): ScoreBand {
  if (score >= 85) return 'rich'
  if (score >= 70) return 'typical'
  return 'observe'
}

export function getScoreBandLabel(score: number): string {
  const band = getScoreBand(score)
  if (band === 'rich') return '풍부·안정'
  if (band === 'typical') return '또래 범주 안'
  return '보완·관찰'
}

export function chartScoresToAxisRows(scores: KindraChartScoresJson): ChartAxisRow[] {
  return CHART_AXIS_META.map(({ key, label, lens }) => ({
    key,
    label,
    lens,
    value: scores[key],
    bandLabel: getScoreBandLabel(scores[key]),
  }))
}
