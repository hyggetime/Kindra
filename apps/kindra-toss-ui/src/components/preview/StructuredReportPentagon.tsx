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

export function StructuredReportPentagon() {
  const { chart_scores: s } = useMockStructuredReport()
  const data = AXIS_META.map(({ key, label }) => ({
    axis: label,
    value: s[key],
  }))

  return (
    <div className="h-[min(22rem,72vw)] w-full max-w-md mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="52%" outerRadius="68%" data={data}>
          <PolarGrid stroke="#e0d8ce" />
          <PolarAngleAxis dataKey="axis" tick={{ fill: '#4a4a4a', fontSize: 11, fontWeight: 600 }} />
          <PolarRadiusAxis
            angle={90}
            domain={[50, 100]}
            tickCount={6}
            tick={{ fill: '#8a8a8a', fontSize: 10 }}
            stroke="#d4cdc2"
          />
          <Radar
            name="점수"
            dataKey="value"
            stroke="#5a7a52"
            fill="#7c9070"
            fillOpacity={0.38}
            strokeWidth={2.2}
            dot={{ r: 3, fill: '#4d6b46', strokeWidth: 0 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
