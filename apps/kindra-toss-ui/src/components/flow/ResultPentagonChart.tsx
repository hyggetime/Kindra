'use client'

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts'

import type { AxisScores, MiniappOrderRow } from '@/lib/orderTypes'

function extractAxes(result: Record<string, unknown> | null): AxisScores | null {
  if (!result) return null
  const axes = result.axes as Record<string, unknown> | undefined
  if (!axes || typeof axes !== 'object') return null
  const n = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : Number(v))
  try {
    return {
      세밀_관찰력: n(axes['세밀_관찰력']),
      공간_구성력: n(axes['공간_구성력']),
      논리적_서사성: n(axes['논리적_서사성']),
      소근육_정교성: n(axes['소근육_정교성']),
      또래_상대_밀도: n(axes['또래_상대_밀도']),
    }
  } catch {
    return null
  }
}

const DEMO: AxisScores = {
  세밀_관찰력: 4,
  공간_구성력: 3,
  논리적_서사성: 4,
  소근육_정교성: 5,
  또래_상대_밀도: 3,
}

type Props = {
  order: MiniappOrderRow
}

export function ResultPentagonChart({ order }: Props) {
  const axes = extractAxes(order.result) ?? DEMO
  const data = [
    { axis: '세밀 관찰력', value: axes.세밀_관찰력 },
    { axis: '공간 구성', value: axes.공간_구성력 },
    { axis: '논리 서사', value: axes.논리적_서사성 },
    { axis: '소근육', value: axes.소근육_정교성 },
    { axis: '또래 상대', value: axes.또래_상대_밀도 },
  ]

  if (order.status === 'failed') {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-900">
        <p className="font-semibold">분석에 실패했어요</p>
        <p className="mt-2">{order.error ?? '알 수 없는 오류'}</p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-[#e8e4dc] bg-white/90 p-6 shadow-sm">
      <h2 className="text-base font-semibold text-[#3d3d3d]">발달·인지 오각형</h2>
      <p className="mt-2 text-sm text-[#6b6b6b]">분석이 완료되면 아이의 5가지 지표가 여기에 표시돼요.</p>
      <div className="mt-6 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#d4cdc2" />
            <PolarAngleAxis dataKey="axis" tick={{ fill: '#5c5c5c', fontSize: 11 }} />
            <PolarRadiusAxis angle={90} domain={[0, 5]} tickCount={6} tick={{ fill: '#9a9a9a', fontSize: 10 }} />
            <Radar
              name="점수"
              dataKey="value"
              stroke="#7c9070"
              fill="#7c9070"
              fillOpacity={0.35}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
