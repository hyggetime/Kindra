import { useId } from 'react'
import type { GrowthPoint } from '../types/report'

type Props = {
  label: string
  series: GrowthPoint[]
}

export function GrowthChart({ label, series }: Props) {
  const gradId = `${useId().replace(/:/g, '')}-growth-fill`
  const w = 320
  const h = 160
  const pad = 28
  const max = Math.max(...series.map((p) => p.value), 1)
  const min = Math.min(...series.map((p) => p.value), max)
  const span = Math.max(max - min, 1)

  const points = series.map((p, i) => {
    const x = pad + (i * (w - pad * 2)) / Math.max(series.length - 1, 1)
    const t = (p.value - min) / span
    const y = pad + (1 - t) * (h - pad * 2)
    return { x, y, ...p }
  })

  const pathD = points
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
    .join(' ')

  const areaD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${h - pad} L ${points[0].x.toFixed(1)} ${h - pad} Z`
      : ''

  return (
    <div className="w-full">
      <p className="mb-3 text-center text-xs font-medium tracking-wide text-[#7C9070]/80">
        {label}
      </p>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-44 w-full overflow-visible rounded-xl bg-[#F7F5F2]"
        role="img"
        aria-label={label}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7C9070" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#7C9070" stopOpacity="0" />
          </linearGradient>
        </defs>
        {areaD ? <path d={areaD} fill={`url(#${gradId})`} /> : null}
        <path
          d={pathD}
          fill="none"
          stroke="#7C9070"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((pt, i) => (
          <g key={`${pt.label}-${i}`}>
            <circle cx={pt.x} cy={pt.y} r="5" fill="#FDFBF9" stroke="#7C9070" strokeWidth="2" />
            <text
              x={pt.x}
              y={h - 8}
              textAnchor="middle"
              className="fill-[#6B6B6B] text-[10px]"
              style={{ fontFamily: 'inherit' }}
            >
              {pt.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
