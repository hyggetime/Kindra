'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { KindraPublicImage } from '@/components/KindraPublicImage'
import type { KindraReportPageData } from '../../types/kindraReportPage'
import { RichParagraph } from '../../components/RichParagraph'
import { recordReportVisit } from '../../lib/reportVisitStorage'
import { trackEvent } from '../../lib/analytics'
import { useScrollDepth } from '../../hooks/useScrollDepth'
import { useSectionEngagement } from '../../hooks/useSectionEngagement'

type Props = {
  data: KindraReportPageData
  /** 브라우저 주소 `/reports/{uuid}` — localStorage·OG 정합 */
  canonicalReportUuid: string
}

export function ReportDocument({ data, canonicalReportUuid }: Props) {
  const [copyDone, setCopyDone] = useState(false)

  useScrollDepth(data.reportId)
  useSectionEngagement(data.reportId)

  useEffect(() => {
    recordReportVisit({
      reportUuid: canonicalReportUuid,
      childShortName: data.childShortName,
    })
    trackEvent('report_view', { report_id: data.reportId, report_uuid: canonicalReportUuid })
  }, [canonicalReportUuid, data.childShortName, data.reportId])

  const handleCopyUrl = async (): Promise<void> => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setCopyDone(true)
      trackEvent('report_share_click', { report_id: data.reportId })
      window.setTimeout(() => setCopyDone(false), 2400)
    } catch {
      setCopyDone(false)
    }
  }

  return (
    <div className="report-print-root min-h-svh bg-[#FDFBF9] text-[#4A4A4A]">
      <header className="report-screen-header sticky top-0 z-40 border-b border-[#EDE8E0] bg-[#FDFBF9]/95 backdrop-blur-md print:hidden">
        <div className="mx-auto flex max-w-3xl items-start justify-between gap-4 px-5 py-3.5 sm:items-center">
          <Link href="/" className="text-sm font-medium text-[#7C9070] transition hover:text-[#687D5D]">
            ← Kindra 홈
          </Link>
          <div className="rounded-xl border border-[#D4DED0] bg-white px-3 py-2 shadow-[0_1px_0_rgba(74,74,74,0.04)] ring-1 ring-[#E8F0E4]/80">
            <span className="block font-mono text-[11px] font-semibold leading-none tracking-[0.12em] text-[#2F3D2E] sm:text-xs">
              {data.reportId}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 pb-24 pt-8 sm:pt-10">
        {/* 인쇄용 머리글 — 화면에서는 숨김 */}
        <div className="mb-8 hidden border-b border-[#E5E5E5] pb-6 text-center print:block">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#888888]">Kindra · 분석 리포트</p>
          <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[#A0A8A0]">공식 일련번호</p>
          <p className="mt-1 font-mono text-lg font-semibold tracking-wide text-[#2A2A2A]">{data.reportId}</p>
        </div>

        <div className="relative overflow-hidden rounded-[28px] bg-[#F5F2ED] print:rounded-none print:shadow-none">
          <KindraPublicImage
            variant="fill"
            src={data.hero.imageSrc}
            alt={data.hero.imageAlt}
            frameClassName="h-[380px] w-full sm:h-[460px]"
            imgClassName="object-cover object-top print:max-h-[220mm] print:object-contain"
            sizes="(max-width: 640px) 100vw, 42rem"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2A2A2A]/65 via-transparent to-transparent print:hidden" />
          <div className="absolute bottom-0 left-0 px-8 pb-9 sm:px-10 sm:pb-11 print:relative print:inset-auto print:bg-[#3D3D3D] print:px-6 print:py-5 print:text-left">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.22em] text-white/75 print:text-white/90">
              {data.hero.kicker}
            </p>
            <h1 className="text-balance text-xl font-bold leading-snug tracking-tight text-white sm:text-2xl print:text-white">
              {data.hero.titleLines[0]}
              <br />
              {data.hero.titleLines[1]}
            </h1>
          </div>
        </div>

        <dl className="mx-auto mt-8 grid grid-cols-2 gap-x-3 gap-y-3 rounded-2xl border border-[#EDE8E0] bg-white/90 px-5 py-5 text-sm shadow-sm print:shadow-none">
          <div className="min-w-0">
            <dt className="text-xs font-medium text-[#8A8A8A]">신청자</dt>
            <dd className="mt-1 break-words font-medium text-[#4A4A4A]">{data.subject.applicantLabel}</dd>
          </div>
          <div className="min-w-0 text-right">
            <dt className="text-xs font-medium text-[#8A8A8A]">아이</dt>
            <dd className="mt-1 break-words font-medium text-[#4A4A4A]">{data.subject.childLabel}</dd>
          </div>
          <div className="col-span-2 min-w-0">
            <dt className="text-xs font-medium text-[#8A8A8A]">생년월 · 관찰 자료</dt>
            <dd className="mt-1 break-words font-medium text-[#4A4A4A]">{data.subject.birthAndMaterials}</dd>
          </div>
        </dl>

        <div className="mt-8 rounded-2xl border border-[#E8E4DC] bg-[#F7F5F2] px-6 py-5 sm:px-7 sm:py-6 print:border-[#DDDDDD] print:bg-white">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7C9070]/85">
            {data.philosophyTitle}
          </p>
          <p className="text-[0.9rem] leading-[2] text-[#5A5A5A]">{data.philosophyBody}</p>
        </div>

        <div className="mt-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7C9070]">The Core Nature</p>
          <h2 className="mt-3 text-lg font-bold tracking-tight text-[#3D3D3D] sm:text-xl">{data.coreNatureHeading}</h2>
          <div className="mt-4 flex flex-wrap gap-2 print:hidden">
            {data.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[#EDF2EB] px-3.5 py-1.5 text-xs font-medium text-[#4F6048]"
              >
                {tag}
              </span>
            ))}
          </div>
          <ul className="mt-3 hidden list-disc pl-5 text-sm leading-relaxed text-[#4A4A4A] print:block">
            {data.tags.map((tag) => (
              <li key={tag}>{tag.replace(/^#/, '')}</li>
            ))}
          </ul>
        </div>

        <div className="my-12 h-px bg-[#EDE8E0] print:bg-[#DDDDDD]" />

        <div className="space-y-12">
          {data.analysisSections.map((sec) => (
            <section
              key={sec.title}
              className="break-inside-avoid"
              data-track-section={sec.title}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#A67B5B]">{sec.label}</p>
              <h3 className="mt-2 text-base font-bold text-[#3D3D3D]">{sec.title}</h3>
              <RichParagraph
                text={sec.body}
                className="mt-4 text-[0.92rem] leading-[2.05] text-[#4A4A4A]/90"
              />
            </section>
          ))}
        </div>

        <div className="my-12 rounded-2xl border border-[#E8E4DC] bg-white/90 px-6 py-6 shadow-sm sm:px-8 print:shadow-none">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7C9070]">Summary Insight</p>
          <h2 className="mt-3 text-lg font-bold text-[#3D3D3D]">{data.summary.title}</h2>
          <RichParagraph
            text={data.summary.body}
            className="mt-4 text-[0.92rem] leading-[2.05] text-[#4A4A4A]/90"
          />
        </div>

        <section>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7C9070]">Hygge Tips</p>
          <h2 className="mt-3 text-lg font-bold tracking-tight text-[#3D3D3D] sm:text-xl">{data.hyggeSectionTitle}</h2>
          <div className="mt-8 space-y-10">
            {data.hyggeTips.map((tip, i) => (
              <div key={tip.title} className="flex gap-5 break-inside-avoid">
                <span className="mt-0.5 shrink-0 text-xs font-semibold tabular-nums text-[#7C9070]/60">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#3D3D3D]">{tip.title}</h3>
                  <p className="mt-2.5 text-sm leading-[1.95] text-[#5A5A5A]">{tip.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="my-14 h-px bg-[#EDE8E0] print:bg-[#DDDDDD]" />

        <section className="break-inside-avoid">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7C9070]">Color Spectrum</p>
          <h2 className="mt-3 text-lg font-bold tracking-tight text-[#3D3D3D] sm:text-xl">{data.colorSpectrumTitle}</h2>
          <p className="mt-4 text-sm leading-[1.9] text-[#6B6B6B]">{data.colorSpectrumIntro}</p>
          <div className="mt-7 flex overflow-hidden rounded-2xl print:rounded-lg">
            {data.colors.map((c) => (
              <div
                key={c.hex}
                className="h-14 min-w-0 flex-1"
                style={{ backgroundColor: c.hex }}
                title={c.label}
              />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2.5 print:text-[9px]">
            {data.colors.map((c) => (
              <div key={c.hex} className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="font-mono text-[10px] text-[#8A8A8A]">{c.hex}</span>
                <span className="text-[10px] text-[#AAAAAA]">{c.label}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="my-12 h-px bg-[#EDE8E0] print:hidden" />

        <section className="mx-auto max-w-md print:hidden">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#E8E4DC] bg-[#F7F5F2] px-5 py-6 text-center">
            <button
              type="button"
              onClick={handleCopyUrl}
              className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full border border-[#D4CFC4] bg-white px-6 text-sm font-medium text-[#4A4A4A] shadow-sm transition hover:border-[#7C9070]/50 hover:bg-[#F0F5EF] hover:text-[#7C9070]"
            >
              {copyDone ? data.share.copiedFeedback : '리포트 공유하기'}
            </button>
            <p className="text-[11px] leading-relaxed text-[#9A9A9A]">
              {data.childShortName}의 성장 기록을 가족에게 공유해보세요.
            </p>
          </div>
        </section>

        <footer className="mt-14 border-t border-[#EDE8E0] px-1 pb-8 pt-10 text-center print:mt-10 print:border-[#DDDDDD] print:pt-8">
          <p className="text-xs leading-[1.85] text-[#8A8A8A]">{data.footer.disclaimer}</p>
          <p className="mx-auto mt-4 max-w-lg text-[11px] leading-[1.75] text-[#B0B0B0]">{data.footer.securityNote}</p>
          <Link
            href="/#request"
            className="mt-8 inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#7C9070] px-8 text-sm font-medium text-white shadow-[0_8px_24px_-8px_rgba(124,144,112,0.5)] transition hover:bg-[#687D5D] print:hidden"
          >
            {data.footer.ctaLabel}
          </Link>
        </footer>
      </main>
    </div>
  )
}
