'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { REPORT_EMAIL_DELIVERY_POLICY_CASUAL } from '@lib/copy/report-email-sla'
import { KINDRA_PHILOSOPHY } from '@lib/gemini/prompts'
import { stripIntakeMachineArtifacts } from '@lib/intake/normalize-intake-report-markdown'
import {
  extractHashtagTokens,
  splitIntakeMarkdownByH3,
} from '@lib/intake/parse-intake-gemini-markdown'
import { parseDrawingSummaryCaptions } from '@lib/intake/parse-drawing-summary'
import type { IntakeReportSessionPayload } from '@lib/intake/intake-report-session'
import { RichParagraph } from '@/components/RichParagraph'
import { recordReportVisit } from '@/lib/reportVisitStorage'
import { trackEvent } from '@/lib/analytics'
import { useScrollDepth } from '@/hooks/useScrollDepth'
import { useSectionEngagement } from '@/hooks/useSectionEngagement'

const PHILOSOPHY_TITLE = '킨드라의 약속'

const FOOTER = {
  securityNote: '이 페이지는 고유 링크를 가진 분들만 확인하실 수 있는 프라이빗 리포트입니다.',
} as const

type Props = {
  payload: IntakeReportSessionPayload
  /** `/reports/{uuid}` 에서만 설정 — 최근 리포트 띠·방문 기록용 */
  reportUuid?: string
  /** `kindra_intakes.gemini_status` (서버에서 전달, 없으면 session 기반으로 대기 판정) */
  intakeGeminiStatus?: string | null
  intakeGeminiError?: string | null
}

function bodyToParagraphs(body: string): string[] {
  if (!body.trim()) return []
  return body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
}

function isIntegratedMindMapTitle(title: string): boolean {
  return /통합\s*마음/.test(title.trim())
}

/** 본문에 태그만 있는 문단(마크다운에서 이미 칩으로 올릴 부분)은 화면에서 생략 */
function isHashtagOnlyParagraph(p: string): boolean {
  const lines = p
    .trim()
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean)
  if (lines.length === 0) return true
  return lines.every((line) => {
    const tokens = line.split(/\s+/).filter(Boolean)
    return tokens.length > 0 && tokens.every((tok) => /^#[가-힣A-Za-z0-9_]+$/.test(tok))
  })
}

/** 「통합 마음 지도」 본문 끝에 모델이 반복하는 `#키워드` — 상단 칩과 중복되므로 제거 */
function stripTrailingHashtagsFromParagraph(p: string): string {
  return p.replace(/(?:\s+#[가-힣A-Za-z0-9_]+)+$/u, '').trim()
}

function mindMapDisplayParagraphs(body: string): string[] {
  return bodyToParagraphs(body)
    .filter((p) => !isHashtagOnlyParagraph(p))
    .map((p) => stripTrailingHashtagsFromParagraph(p))
}

/** 반복되던 '통합 관찰' 대신 섹션마다 짧은 눈길 제목 */
function sectionEyebrow(title: string): string {
  const t = title.trim()
  if (!t) return ''
  if (/그림별\s*시각|시각\s*요약/.test(t)) return '제출된 그림'
  if (/횡단|여러\s*장/.test(t)) return '여러 장을 함께'
  if (/한\s*장에서/.test(t)) return '이 한 장에서'
  if (/통합\s*마음/.test(t)) return '핵심 요약'
  if (/마음의\s*결|각도/.test(t) || /심층/.test(t)) return '심층 읽기'
  if (/부모님께|Hygge/i.test(t)) return '부모님께'
  if (/한계|안내/.test(t)) return '안내'
  if (/몸과\s*마음이\s*함께|신체[-\s]*정서|신체와\s*마음/.test(t)) return '몸과 마음'
  if (/발달\s*·\s*인지|인지\s*렌즈/.test(t)) return '발달·인지'
  return '이어지는 이야기'
}

function captionToBlocks(text: string): string[] {
  const t = text.trim()
  if (!t) return []
  return t.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
}

function DrawingMagazineSection({ body, thumbs }: { body: string; thumbs: string[] }) {
  const { captions, remainder } = parseDrawingSummaryCaptions(body, thumbs.length)
  const anyCaption = captions.some((c) => c.trim())
  const restText = (!anyCaption && !remainder.trim() ? body : remainder).trim()

  const magText =
    'font-sans text-[0.915rem] leading-[1.75] tracking-tight text-[#383838] antialiased [font-feature-settings:"kern",1]'

  if (!anyCaption) {
    return (
      <div
        lang="ko"
        className="rounded-2xl bg-gradient-to-b from-[#FAF8F4] via-[#F7F4EF] to-[#F2EDE6] px-4 py-6 ring-1 ring-[#E4DDD3]/90 sm:px-7 sm:py-8"
      >
        <div className="mb-6 flex flex-wrap justify-center gap-3 sm:justify-start print:justify-start">
          {thumbs.map((src, i) => {
            const alignRight = i % 2 === 1
            return (
              <figure
                key={i}
                className={`flex w-full max-w-[10rem] flex-col sm:max-w-[9.25rem] ${alignRight ? 'ml-auto items-end text-right' : 'mr-auto items-start text-left'}`}
              >
                <figcaption className="mb-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.28em] text-[#6B7D64]">
                  {String(i + 1).padStart(2, '0')}
                </figcaption>
                <img
                  src={src}
                  alt=""
                  className="aspect-square h-[6.15rem] w-[6.15rem] rounded-sm object-cover shadow-[0_6px_24px_-6px_rgba(45,42,38,0.18)] ring-1 ring-black/[0.06]"
                />
              </figure>
            )
          })}
        </div>
        <div className="border-t border-[#D4CDC2]/70 pt-6">
          <p className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.32em] text-[#7C9070]/90">모아 보기</p>
          {bodyToParagraphs(restText).map((para, i) => (
            <RichParagraph
              key={i}
              text={para}
              className={
                i === 0
                  ? `${magText} text-[0.98rem] leading-[1.82] text-[#2F2F2F]`
                  : `mt-5 ${magText} text-[#454545]`
              }
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      lang="ko"
      className="rounded-2xl bg-gradient-to-b from-[#FAF8F4] via-[#F7F4EF] to-[#F2EDE6] px-4 py-6 ring-1 ring-[#E4DDD3]/90 sm:px-7 sm:py-8"
    >
      <div className="space-y-0">
        {thumbs.map((src, i) => {
          const cap = (captions[i] ?? '').trim()
          const blocks = captionToBlocks(cap)
          const thumbRight = i % 2 === 1

          return (
            <article
              key={i}
              className="break-inside-avoid flow-root border-b border-[#D9D1C6]/55 py-10 last:border-b-0 last:pb-4 md:py-12"
            >
              <figure
                className={
                  thumbRight
                    ? 'float-right mb-3 ml-5 mt-1 w-[min(42%,11.25rem)] sm:ml-7 sm:w-[11.75rem]'
                    : 'float-left mb-3 mr-5 mt-1 w-[min(42%,11.25rem)] sm:mr-7 sm:w-[11.75rem]'
                }
              >
                <figcaption
                  className={`mb-2 flex flex-col gap-1 ${thumbRight ? 'items-end text-right' : 'items-start text-left'}`}
                >
                  <span className="font-mono text-[9px] font-semibold tabular-nums tracking-[0.2em] text-[#7C9070]">
                    No.{String(i + 1).padStart(2, '0')}
                  </span>
                  <span className={`h-px w-10 bg-[#7C9070]/35 ${thumbRight ? 'self-end' : ''}`} aria-hidden />
                  <span className="text-[11px] font-medium tracking-tight text-[#5C5C5C]">그림 {i + 1}</span>
                </figcaption>
                <img
                  src={src}
                  alt=""
                  className="aspect-square w-full rounded-sm object-cover shadow-[0_6px_22px_-6px_rgba(45,42,38,0.2)]"
                />
              </figure>
              {blocks.length > 0 ? (
                <div className="space-y-4 text-pretty [text-align:justify]">
                  {blocks.map((block, j) => (
                    <RichParagraph
                      key={j}
                      text={block}
                      className={j === 0 ? `${magText} text-[0.97rem] leading-[1.78] text-[#2E2E2E]` : magText}
                    />
                  ))}
                </div>
              ) : null}
            </article>
          )
        })}
      </div>
      {remainder.trim() ? (
        <div className="mt-4 border-t-2 border-double border-[#D4CDC2]/80 pt-8">
          <p className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-[#7C9070]/85">이어짐</p>
          <div className="max-w-none sm:columns-2 sm:gap-x-8">
            {bodyToParagraphs(remainder).map((para, i) => (
              <RichParagraph
                key={`draw-rem-${i}`}
                text={para}
                className={`break-inside-avoid mb-4 last:mb-0 ${magText}`}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function IntakeReportDocument({
  payload,
  reportUuid,
  intakeGeminiStatus = null,
  intakeGeminiError = null,
}: Props) {
  const [copyDone, setCopyDone] = useState(false)
  const { reportId, subject, markdown, heroTitleLines, drawingThumbDataUrls, heroImageDataUrl } = payload
  const heroThumbs = drawingThumbDataUrls ?? []
  /** 히어로: 고해상도 그림 1 우선, 없으면 썸네일 */
  const heroDrawing1Src = heroImageDataUrl ?? heroThumbs[0]

  useScrollDepth(reportId)
  useSectionEngagement(reportId)

  const cleanedMarkdown = useMemo(() => stripIntakeMachineArtifacts(markdown), [markdown])
  const sections = useMemo(() => splitIntakeMarkdownByH3(cleanedMarkdown), [cleanedMarkdown])
  const tagsFromMarkdown = useMemo(() => extractHashtagTokens(cleanedMarkdown), [cleanedMarkdown])
  /** 통합 마음 지도의 첫 번째 비-해시태그 문단 = 헤드라인 인사이트 */
  const headlineSentence = useMemo(() => {
    const mindSec = sections.find((s) => Boolean(s.title) && isIntegratedMindMapTitle(s.title))
    if (!mindSec) return ''
    const paras = mindMapDisplayParagraphs(mindSec.body)
    return paras[0] ?? ''
  }, [sections])

  /** 통합 마음 지도 섹션의 키워드 태그 — 헤드라인 바로 아래 상단 표시용 */
  const mindMapTags = useMemo(() => {
    const mindSec = sections.find((s) => Boolean(s.title) && isIntegratedMindMapTitle(s.title))
    if (mindSec) {
      const fromBody = extractHashtagTokens(mindSec.body)
      if (fromBody.length > 0) return fromBody
    }
    return tagsFromMarkdown
  }, [sections, tagsFromMarkdown])

  useEffect(() => {
    if (reportUuid) {
      recordReportVisit({ reportUuid, childShortName: payload.childShortName })
    }
    /** `/apply/report` 세션 전용이면 reportUuid 없음 — 방문 기록 생략 */
    trackEvent('report_view', {
      report_id: payload.reportId,
      ...(reportUuid ? { report_uuid: reportUuid } : {}),
    })
  }, [payload.childShortName, payload.reportId, reportUuid])

  const handleCopyUrl = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopyDone(true)
      trackEvent('report_share_click', { report_id: reportId })
      window.setTimeout(() => setCopyDone(false), 2400)
    } catch {
      setCopyDone(false)
    }
  }

  const analysisFailed = intakeGeminiStatus === 'failed'

  const analysisWaiting =
    !analysisFailed &&
    (intakeGeminiStatus === 'pending' ||
      intakeGeminiStatus === 'running' ||
      (Boolean(payload.analysisPending) && !String(markdown ?? '').trim()))

  const router = useRouter()

  useEffect(() => {
    if (!analysisWaiting || !reportUuid) return
    const t = setInterval(() => {
      router.refresh()
    }, 8000)
    return () => clearInterval(t)
  }, [analysisWaiting, reportUuid, router])

  if (analysisFailed && reportUuid) {
    return (
      <div className="report-print-root min-h-svh bg-[#FDFBF9] font-sans text-[#4A4A4A] antialiased">
        <header className="report-screen-header sticky top-0 z-40 border-b border-[#EDE8E0] bg-[#FDFBF9]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-3.5">
            <Link href="/" className="text-sm font-medium text-[#7C9070] transition hover:text-[#687D5D]">
              ← Kindra 홈
            </Link>
            <div className="rounded-xl border border-[#D4DED0] bg-white px-3 py-2">
              <span className="block font-mono text-[11px] font-semibold text-[#2F3D2E]">{reportId}</span>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-2xl px-5 py-20 text-center">
          <p className="text-base font-medium text-[#B85C5C]">분석을 완료하지 못했어요.</p>
          <p className="mt-3 text-sm leading-relaxed text-[#6B6B6B]">
            {intakeGeminiError?.trim()
              ? intakeGeminiError
              : '잠시 후 새로고침해 보시거나, 카카오톡으로 문의해 주시면 도와드릴게요.'}
          </p>
        </main>
      </div>
    )
  }

  if (analysisWaiting && reportUuid) {
    return (
      <div className="report-print-root min-h-svh bg-[#FDFBF9] font-sans text-[#4A4A4A] antialiased">
        <header className="report-screen-header sticky top-0 z-40 border-b border-[#EDE8E0] bg-[#FDFBF9]/95 backdrop-blur-md print:hidden">
          <div className="mx-auto flex max-w-3xl items-start justify-between gap-4 px-5 py-3.5 sm:items-center">
            <Link href="/" className="text-sm font-medium text-[#7C9070] transition hover:text-[#687D5D]">
              ← Kindra 홈
            </Link>
            <div className="rounded-xl border border-[#D4DED0] bg-white px-3 py-2 shadow-[0_1px_0_rgba(74,74,74,0.04)] ring-1 ring-[#E8F0E4]/80">
              <span className="block font-mono text-[11px] font-semibold leading-none tracking-[0.12em] text-[#2F3D2E] sm:text-xs">
                {reportId}
              </span>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-2xl px-5 pb-24 pt-10 sm:pt-12">
          <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#E8F0E4] via-[#F0EDE6] to-[#EDE4D8] px-6 py-12 sm:px-10 sm:py-14">
            {heroDrawing1Src ? (
              <div className="pointer-events-none mx-auto mb-8 max-h-[200px] w-full max-w-md overflow-hidden rounded-2xl opacity-90 ring-1 ring-black/[0.06]">
                <img src={heroDrawing1Src} alt="" className="h-full w-full object-cover object-center" />
              </div>
            ) : null}
            <div className="flex flex-col items-center text-center">
              <div
                className="mb-6 h-10 w-10 animate-spin rounded-full border-2 border-[#7C9070]/30 border-t-[#7C9070]"
                aria-hidden
              />
              <p className="text-base font-semibold leading-snug text-[#2F3D2E] sm:text-lg">
                통합 리포트를 준비하고 있어요.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#5C5C5C]">
                제출해 주신 그림과 메모를 반영해 분석 중이에요. 완료와 이메일 안내는 준비가 되면 이 화면이 바뀌거나,
                신청 시 남겨 주신 이메일로도 보내 드려요. {REPORT_EMAIL_DELIVERY_POLICY_CASUAL}
              </p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="report-print-root min-h-svh bg-[#FDFBF9] font-sans text-[#4A4A4A] antialiased">
      <header className="report-screen-header sticky top-0 z-40 border-b border-[#EDE8E0] bg-[#FDFBF9]/95 backdrop-blur-md print:hidden">
        <div className="mx-auto flex max-w-3xl items-start justify-between gap-4 px-5 py-3.5 sm:items-center">
          <Link href="/" className="text-sm font-medium text-[#7C9070] transition hover:text-[#687D5D]">
            ← Kindra 홈
          </Link>
          <div className="rounded-xl border border-[#D4DED0] bg-white px-3 py-2 shadow-[0_1px_0_rgba(74,74,74,0.04)] ring-1 ring-[#E8F0E4]/80">
            <span className="block font-mono text-[11px] font-semibold leading-none tracking-[0.12em] text-[#2F3D2E] sm:text-xs">
              {reportId}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 pb-24 pt-8 sm:pt-10">
        <div className="mb-8 hidden border-b border-[#E5E5E5] pb-6 text-center print:block">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#888888]">Kindra · 분석 리포트</p>
          <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[#A0A8A0]">일련번호</p>
          <p className="mt-1 font-mono text-lg font-semibold tracking-wide text-[#2A2A2A]">{reportId}</p>
        </div>

        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#E8F0E4] via-[#F0EDE6] to-[#EDE4D8] print:rounded-none print:shadow-none">
          {heroDrawing1Src ? (
            <div className="relative aspect-[4/3] w-full min-h-[240px] sm:aspect-[16/10] sm:min-h-[300px]">
              <img
                src={heroDrawing1Src}
                alt="제출한 그림 1"
                className="absolute inset-0 h-full w-full object-cover print:object-contain print:object-top"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent print:from-black/30 print:via-transparent print:to-transparent"
                aria-hidden
              />
              <div className="absolute inset-x-0 bottom-0 px-6 pb-8 pt-20 sm:px-10 sm:pb-10 sm:pt-28 print:relative print:mt-4 print:bg-white print:px-0 print:pb-0 print:pt-0">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/90 print:text-[#5A6F52]">
                  Kindra · 통합 분석 리포트
                </p>
                <h1 className="text-balance text-xl font-bold leading-snug tracking-tight text-white sm:text-[1.65rem] sm:leading-snug print:text-[#2F3D2E]">
                  {heroTitleLines[0]}
                  <br />
                  {heroTitleLines[1]}
                </h1>
              </div>
            </div>
          ) : (
            <>
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.35]"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 20% 20%, rgba(124,144,112,0.25), transparent 45%), radial-gradient(circle at 80% 30%, rgba(200,164,126,0.2), transparent 40%)',
                }}
                aria-hidden
              />
              <div className="relative flex min-h-[280px] flex-col justify-end px-8 pb-10 pt-12 sm:min-h-[320px] sm:px-10 sm:pb-11 print:min-h-0 print:bg-[#3D3D3D] print:px-6 print:py-8 print:text-left">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#4F6048]/90 print:text-white/90">
                  Kindra · 통합 분석 리포트
                </p>
                <h1 className="text-balance text-xl font-bold leading-snug tracking-tight text-[#2F3D2E] sm:text-[1.65rem] print:text-white">
                  {heroTitleLines[0]}
                  <br />
                  {heroTitleLines[1]}
                </h1>
              </div>
            </>
          )}
        </div>

        {headlineSentence ? (
          <div className="mx-2 mt-6 rounded-2xl bg-[#FFF8EF] px-6 py-5 ring-1 ring-[#E9B96A]/40 sm:mx-0">
            <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.24em] text-[#C4883A]/80">
              오늘의 발견
            </p>
            <p className="font-sans text-[1.0rem] font-medium leading-[1.88] tracking-tight text-[#7A4B1A]">
              {headlineSentence}
            </p>
          </div>
        ) : null}

        {mindMapTags.length > 0 ? (
          <div className="mx-2 mt-3 sm:mx-0">
            <div className="flex flex-wrap gap-2 print:hidden">
              {mindMapTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#EDF2EB] px-3.5 py-1.5 text-xs font-medium text-[#4F6048]"
                >
                  {tag}
                </span>
              ))}
            </div>
            <ul className="mt-2 hidden list-disc pl-5 text-sm leading-relaxed text-[#4A4A4A] print:block">
              {mindMapTags.map((tag) => (
                <li key={tag}>{tag.replace(/^#/, '')}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <dl className="mx-auto mt-7 rounded-2xl border border-[#EDE8E0] bg-white/90 px-5 py-5 text-sm shadow-sm print:shadow-none">
          <div className="flex flex-row items-start justify-between gap-3 border-b border-[#F0EBE4] pb-4 sm:gap-8 sm:pb-3.5">
            <div className="min-w-0 flex-1 basis-0">
              <dt className="text-xs font-medium text-[#8A8A8A]">신청자</dt>
              <dd className="mt-1 break-words font-medium text-[#4A4A4A]">{subject.applicantLabel}</dd>
            </div>
            <div className="min-w-0 flex-1 basis-0 text-right">
              <dt className="text-xs font-medium text-[#8A8A8A]">아이</dt>
              <dd className="mt-1 break-words font-medium text-[#4A4A4A]">{subject.childLabel}</dd>
            </div>
          </div>
          <div className="pt-4 sm:pt-3.5">
            <dt className="text-xs font-medium text-[#8A8A8A]">생년월 · 관찰 자료</dt>
            <dd className="mt-1 font-medium text-[#4A4A4A]">{subject.birthAndMaterials}</dd>
          </div>
        </dl>

        <div className="my-12 h-px bg-[#EDE8E0] print:bg-[#DDDDDD]" />

        <div className="space-y-16 sm:space-y-20">
          {sections.map((sec, idx) => {
            const key = sec.title || `preamble-${idx}`

            /** 통합 마음 지도: 헤드라인+태그를 이미 상단에서 표시했으므로 본문에서 완전 제거 */
            if (sec.title && isIntegratedMindMapTitle(sec.title)) return null

            const paragraphs = bodyToParagraphs(sec.body)

            /** 해시태그만으로 이루어진 섹션(이어지는 이야기 등 오류 섹션) 방어 필터 */
            if (paragraphs.length > 0 && paragraphs.every((p) => isHashtagOnlyParagraph(p))) return null

            const isDrawingSummary =
              Boolean(sec.title) &&
              /그림별/.test(sec.title) &&
              /시각/.test(sec.title) &&
              heroThumbs.length > 0
            const eyebrow = sec.title ? sectionEyebrow(sec.title) : ''
            const isHyggeTipSection = eyebrow === '부모님께'
            const isDeepReadSection = eyebrow === '심층 읽기'
            /** 눈썹 색상을 h3 제목에 직접 적용 — 작은 글씨 레이블 없이 */
            const titleColor = isHyggeTipSection ? 'text-[#5B8DB8]' : 'text-[#7C9070]'
            return (
              <section key={key} className="break-inside-avoid scroll-mt-28" data-track-section={key}>
                {sec.title ? (
                  <h3 className={`font-bold tracking-tight text-[1.0625rem] leading-snug sm:text-[1.125rem] ${titleColor}`}>
                    {sec.title}
                  </h3>
                ) : null}
                <div className={sec.title ? 'mt-5' : ''}>
                  {isDrawingSummary ? (
                    <DrawingMagazineSection body={sec.body} thumbs={heroThumbs} />
                  ) : (
                    paragraphs.map((para, i) => {
                      /** 심층읽기 섹션에서 **볼드로 시작**하는 문단 = 소제목 → SVG 아이콘 */
                      const isBoldSubHead = isDeepReadSection && /^\*\*[^*]+\*\*/.test(para.trimStart())
                      if (isBoldSubHead) {
                        return (
                          <div key={`${key}-p-${i}`} className={`flex items-start gap-2.5 ${i > 0 ? 'mt-7' : ''}`}>
                            <span className="mt-[0.42em] shrink-0" aria-hidden>
                              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                <circle cx="4" cy="4" r="4" fill="#7C9070" fillOpacity="0.55" />
                              </svg>
                            </span>
                            <RichParagraph
                              text={para}
                              className="flex-1 font-sans text-[0.9rem] leading-[1.95] text-[#4A4A4A]"
                            />
                          </div>
                        )
                      }
                      /** Hygge Tips: 항목 사이 구분선 */
                      if (isHyggeTipSection && i > 0) {
                        return (
                          <div key={`${key}-p-${i}`} className="mt-7 border-t border-[#EDE8E0] pt-6">
                            <RichParagraph
                              text={para}
                              className="font-sans text-[0.9rem] leading-[1.95] text-[#4A4A4A]"
                            />
                          </div>
                        )
                      }
                      return (
                        <RichParagraph
                          key={`${key}-p-${i}`}
                          text={para}
                          className={
                            i > 0
                              ? 'mt-4 font-sans text-[0.9rem] leading-[1.95] text-[#4A4A4A]'
                              : 'font-sans text-[0.9rem] leading-[1.95] text-[#4A4A4A]'
                          }
                        />
                      )
                    })
                  )}
                </div>
              </section>
            )
          })}
        </div>

        <div className="my-14 h-px bg-[#EDE8E0] print:hidden" />

        <div className="rounded-2xl border border-[#E8E4DC] bg-[#F7F5F2] px-6 py-5 sm:px-7 sm:py-6 print:border-[#DDDDDD] print:bg-white">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7C9070]/85">{PHILOSOPHY_TITLE}</p>
          <p className="text-[0.9rem] leading-[2] text-[#5A5A5A]">{KINDRA_PHILOSOPHY}</p>
        </div>

        <div className="my-10 h-px bg-[#EDE8E0] print:hidden" />

        <section className="print:hidden">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCopyUrl}
              className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-full border border-[#D4CFC4] bg-white px-4 text-sm font-medium text-[#4A4A4A] shadow-sm transition hover:border-[#7C9070]/50 hover:bg-[#F0F5EF] hover:text-[#7C9070]"
            >
              {copyDone ? '링크 복사됨 ✓' : '리포트 공유하기'}
            </button>
            <Link
              href="/#request"
              className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-full bg-[#7C9070] px-4 text-sm font-medium text-white shadow-[0_6px_20px_-6px_rgba(124,144,112,0.5)] transition hover:bg-[#687D5D]"
            >
              리포트 신청하기
            </Link>
          </div>
        </section>

        <footer className="mt-10 border-t border-[#EDE8E0] px-1 pb-8 pt-8 text-center print:mt-10 print:border-[#DDDDDD] print:pt-8">
          <p className="mx-auto max-w-lg text-[11px] leading-[1.75] text-[#B0B0B0]">{FOOTER.securityNote}</p>
        </footer>
      </main>
    </div>
  )
}
