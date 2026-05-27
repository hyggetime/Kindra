'use client'

import type { ReactNode } from 'react'

import { StructuredReportPentagon } from '@/components/preview/StructuredReportPentagon'
import { VisualSummaryDrawingThumb } from '@/components/preview/VisualSummaryDrawingThumb'
import { useMockStructuredReport } from '@/lib/MockStructuredReportContext'

function SectionCard({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string
  title: string
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-[#e8e4dc] bg-white/95 p-5 shadow-[0_8px_28px_-14px_rgba(55,48,35,0.2)]">
      {eyebrow ? (
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7c9070]">{eyebrow}</p>
      ) : null}
      <h3 className="mt-1 text-base font-bold tracking-tight text-[#2f3d2e]">{title}</h3>
      <div className="mt-3 text-sm leading-relaxed text-[#4a4a4a]">{children}</div>
    </section>
  )
}

function Prose({ children }: { children: ReactNode }) {
  return <div className="whitespace-pre-wrap text-sm leading-[1.75] text-[#3d3d3d]">{children}</div>
}

export function StructuredReportPremium() {
  const { report_sections: rs } = useMockStructuredReport()

  return (
    <div className="flex flex-col gap-5 pb-28">
      <header className="rounded-2xl border border-[#dfe6d8] bg-gradient-to-br from-[#f7faf4] via-white to-[#faf6ef] p-6 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#6b8562]">Kindra premium</p>
        <h1 className="mt-2 text-[1.35rem] font-bold leading-snug tracking-tight text-[#2a3428]">{rs.title}</h1>
        <p className="mt-3 text-xs text-[#6b6b6b]">제출 그림 {rs.visual_summary.length}장을 바탕으로 한 통합 분석이에요</p>
      </header>

      <section className="rounded-2xl border border-[#e4ddd3] bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-[#3d5236]">발달·표현 오각형</h2>
        <p className="mt-1 text-xs text-[#7a7a7a]">발달·표현 5축 (50–100)</p>
        <StructuredReportPentagon />
      </section>

      <SectionCard eyebrow="Visual" title="장별 시각 해설">
        <ul className="flex flex-col gap-4">
          {rs.visual_summary.map((item, index) => (
            <li
              key={item.target_image}
              className="flow-root rounded-xl border border-[#ebe6df] bg-[#fdfcfa] p-4 ring-1 ring-black/5"
            >
              <VisualSummaryDrawingThumb
                index={index}
                alt={item.target_image}
                className="float-left mr-3 mb-2 h-[9rem] w-[9rem] [shape-outside:margin-box]"
              />
              <span className="mb-2 inline-flex rounded-full bg-[#7c9070]/15 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-[#4d6b46]">
                {item.target_image}
              </span>
              <Prose>{item.description}</Prose>
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard eyebrow="Summary" title="전체 요약">
        <Prose>{rs.overall_summary}</Prose>
      </SectionCard>

      <SectionCard eyebrow="발달 렌즈" title="인지·표현 관점">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold text-[#5a6f52]">Goodenough–Harris (관찰)</p>
            <Prose>{rs.developmental_lenses.goodenough_analysis}</Prose>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#5a6f52]">Luquet (공간·서사)</p>
            <Prose>{rs.developmental_lenses.luquet_analysis}</Prose>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#5a6f52]">Lowenfeld (소근육)</p>
            <Prose>{rs.developmental_lenses.lowenfeld_analysis}</Prose>
          </div>
        </div>
      </SectionCard>

      <SectionCard eyebrow="심리 렌즈" title="정서·형식 관점">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold text-[#5a6f52]">DAP / KFD</p>
            <Prose>{rs.psychological_lenses.dap_kfd_analysis}</Prose>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#5a6f52]">선·필압</p>
            <Prose>{rs.psychological_lenses.line_pressure_analysis}</Prose>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#5a6f52]">공간·구도</p>
            <Prose>{rs.psychological_lenses.space_layout_analysis}</Prose>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#5a6f52]">색·밀도</p>
            <Prose>{rs.psychological_lenses.color_density_analysis}</Prose>
          </div>
        </div>
      </SectionCard>

      <SectionCard eyebrow="Narrative" title="통합 이야기">
        <Prose>{rs.integrated_narrative}</Prose>
      </SectionCard>

      <SectionCard eyebrow="Growth" title="신체 스펙 참고치">
        <Prose>{rs.growth_stats_guide}</Prose>
      </SectionCard>

      <SectionCard eyebrow="Hygge" title="함께 이어가기">
        <ol className="list-decimal space-y-3 pl-4 marker:font-semibold marker:text-[#7c9070]">
          {rs.hygge_tips.map((tip, i) => (
            <li key={i} className="pl-1 text-sm leading-relaxed text-[#3d3d3d]">
              {tip}
            </li>
          ))}
        </ol>
      </SectionCard>
    </div>
  )
}
