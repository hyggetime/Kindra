import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import type { ReportSample } from '../types/report'
import { GrowthChart } from './GrowthChart'

function chartLabel(category: string): string {
  const base = category.split('(')[0].trim()
  return base.length > 10 ? `${base.slice(0, 9)}…` : base
}

function formatBirthMonth(ym: string): string {
  const m = /^(\d{4})-(\d{2})$/.exec(ym)
  if (!m) return ym
  return `${m[1]}년 ${Number(m[2])}월생`
}

export function ReportDashboard() {
  const [data, setData] = useState<ReportSample | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/report_sample.json')
      .then((r) => {
        if (!r.ok) throw new Error('리포트를 불러올 수 없습니다.')
        return r.json()
      })
      .then((json: ReportSample) => {
        if (!cancelled) setData(json)
      })
      .catch(() => {
        if (!cancelled) setError('샘플 데이터를 불러오지 못했습니다.')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const chartSeries = useMemo(() => {
    if (!data?.sections?.length) return []
    return data.sections.map((s) => ({
      label: chartLabel(s.category),
      value: s.score,
    }))
  }, [data])

  if (error) {
    return (
      <p className="rounded-2xl border border-red-100 bg-red-50/80 px-4 py-3 text-center text-sm text-red-800">
        {error}
      </p>
    )
  }

  if (!data) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-[#E8E4DC] bg-white/60">
        <p className="text-sm text-[#6B6B6B]">리포트를 불러오는 중…</p>
      </div>
    )
  }

  const { child_info, sections, mina_insight, report_id } = data

  return (
    <div className="mx-auto max-w-4xl space-y-12">
      <div className="overflow-hidden rounded-[28px] border border-[#E8E4DC] bg-[#FDFBF9] p-6 text-[#4A4A4A] shadow-[0_20px_50px_-24px_rgba(74,74,74,0.2)] sm:p-8 md:p-10">
        <header className="border-b border-[#EDE8E0] pb-8 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-[#7C9070]/85">
            Kindra · 분석 리포트
          </p>
          <h2 className="text-balance text-2xl font-bold tracking-tight text-[#7C9070] sm:text-3xl">
            우리 아이 마음 지도
          </h2>
          <p className="mt-3 font-mono text-xs text-[#8A8A8A]">{report_id}</p>

          <dl className="mx-auto mt-8 grid max-w-lg gap-4 rounded-2xl bg-white/80 px-5 py-5 text-left text-sm shadow-sm ring-1 ring-[#EDE8E0] sm:grid-cols-2 sm:text-center">
            <div>
              <dt className="text-xs font-medium text-[#8A8A8A]">아이</dt>
              <dd className="mt-1 font-medium text-[#4A4A4A]">{child_info.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-[#8A8A8A]">생년월</dt>
              <dd className="mt-1 font-medium text-[#4A4A4A]">{formatBirthMonth(child_info.birth_month)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-[#8A8A8A]">관찰 · 분석 기간</dt>
              <dd className="mt-1 font-medium text-[#4A4A4A]">{child_info.analysis_period}</dd>
            </div>
          </dl>

          <div className="mx-auto mt-8 max-w-xl overflow-hidden rounded-2xl border border-[#EDE8E0] bg-[#F7F5F2]">
            <Image
              src="/sample_child_art.svg"
              alt="리포트 예시 그림"
              width={400}
              height={280}
              unoptimized
              className="mx-auto max-h-52 w-full object-contain p-4"
            />
          </div>

          {chartSeries.length > 0 ? (
            <div className="mx-auto mt-8 max-w-md">
              <GrowthChart label="섹션별 종합 점수 추이" series={chartSeries} />
            </div>
          ) : null}

        </header>

        <div className="space-y-12 pt-10">
          {sections.map((sec, idx) => {
            const accent = idx % 2 === 0 ? 'border-[#A45C40]/35' : 'border-[#C8A47E]/40'
            const chip = idx % 2 === 0 ? 'bg-[#A45C40]/12 text-[#8B4A32]' : 'bg-[#C8A47E]/20 text-[#7A5E3E]'
            return (
              <article
                key={`${sec.category}-${idx}`}
                className={`rounded-2xl border-l-4 ${accent} border border-[#EDE8E0] bg-white p-6 shadow-sm sm:p-8`}
              >
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${chip}`}
                    >
                      {sec.category}
                    </span>
                    <h3 className="mt-4 text-balance text-xl font-semibold leading-snug text-[#3D3D3D] sm:text-2xl">
                      {sec.title}
                    </h3>
                  </div>
                  <div className="shrink-0 text-left sm:text-right">
                    <div className="inline-flex flex-col items-start rounded-2xl bg-[#F3EFE0] px-5 py-3 sm:items-end">
                      <span className="text-3xl font-bold tabular-nums text-[#7C9070]">{sec.score}</span>
                      <span className="text-xs font-medium text-[#6B6B6B]">종합 점수 · 100점 만점</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#EDE8E0]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#7C9070] to-[#9AAF8E] transition-[width] duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, sec.score))}%` }}
                  />
                </div>

                <div className="mt-8 space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold text-[#4A4A4A]">해석</h4>
                    <p className="mt-3 text-base leading-[1.9] text-[#4A4A4A]/95">{sec.content}</p>
                  </div>

                  <div className="rounded-2xl bg-[#F7F5F2] p-5 sm:p-6">
                    <h4 className="text-sm font-semibold text-[#687D5D]">관찰 근거</h4>
                    <p className="mt-3 text-sm leading-[1.85] text-[#4A4A4A]/95">{sec.evidence}</p>
                  </div>

                  <div className="rounded-2xl border border-[#E8E4DC] bg-[#FFFBF7] p-5 sm:p-6">
                    <h4 className="text-sm font-semibold text-[#A45C40]">육아 · 놀이 팁</h4>
                    <p className="mt-3 text-sm leading-[1.85] text-[#4A4A4A]/95">{sec.tip}</p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        <footer className="mt-12 border-t border-[#EDE8E0] pt-10">
          <h4 className="text-center text-sm font-semibold text-[#7C9070]">미나 인사이트</h4>
          <blockquote className="mx-auto mt-4 max-w-3xl text-pretty text-center text-base leading-[1.9] italic text-[#4A4A4A]">
            &ldquo;{mina_insight}&rdquo;
          </blockquote>
        </footer>
      </div>
    </div>
  )
}
