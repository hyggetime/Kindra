'use client'

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts'

import { useMockStructuredReport } from '@/lib/MockStructuredReportContext'

const AXIS_META = [
  { key: 'fine_motor' as const, label: '소근육' },
  { key: 'observation' as const, label: '관찰' },
  { key: 'spatial_logic' as const, label: '공간' },
  { key: 'narrative' as const, label: '서사' },
  { key: 'emotional_resource' as const, label: '정서' },
]

type StructuredReportPentagonProps = {
  /** 래퍼 높이·폭. 미니 대시보드는 `h-full w-full min-w-0` 등으로 지정 */
  containerClassName?: string
  /** 좁은 높이(≈220px)용 — 축·반경 축소 */
  compact?: boolean
}

export function StructuredReportPentagon({
  containerClassName = 'h-[min(22rem,72vw)] w-full max-w-md mx-auto',
  compact = false,
}: StructuredReportPentagonProps) {
  const { chart_scores: s } = useMockStructuredReport()
  const data = AXIS_META.map(({ key, label }) => ({
    axis: label,
    value: s[key],
  }))

  const outerRadius = compact ? '58%' : '68%'
  const cy = compact ? '50%' : '52%'
  const angleTick = compact ? 9 : 11
  const radiusTick = compact ? 8 : 10

  return (
    <div className={containerClassName}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy={cy} outerRadius={outerRadius} data={data}>
          <PolarGrid stroke="#e0d8ce" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: '#4a4a4a', fontSize: angleTick, fontWeight: 600 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[50, 100]}
            tickCount={compact ? 5 : 6}
            tick={{ fill: '#8a8a8a', fontSize: radiusTick }}
            stroke="#d4cdc2"
          />
          <Radar
            name="점수"
            dataKey="value"
            stroke="#5a7a52"
            fill="#7c9070"
            fillOpacity={0.38}
            strokeWidth={compact ? 1.8 : 2.2}
            dot={{ r: compact ? 2.5 : 3, fill: '#4d6b46', strokeWidth: 0 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
