import type { Metadata } from 'next'
import Link from 'next/link'

import { Footer } from '@/components/layout/Footer'
import { SITE_OG_IMAGE } from '@lib/site-og'

const TOOLS_TITLE = '킨드라가 마음을 읽는 법 — 킨드라 Kindra'
const TOOLS_DESC =
  '킨드라가 아이의 그림을 어떻게 읽는지 알려드려요. HTP·DAP·KFD·LMT·PITR 등 검증된 심리 분석 이론을 바탕으로, 임상 진단이 아닌 따뜻한 경향성 가이드를 만들어요.'

export const metadata: Metadata = {
  title: TOOLS_TITLE,
  description: TOOLS_DESC,
  alternates: { canonical: '/tools' },
  openGraph: {
    title: TOOLS_TITLE,
    description: TOOLS_DESC,
    url: '/tools',
    images: [SITE_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: TOOLS_TITLE,
    description: TOOLS_DESC,
    images: [SITE_OG_IMAGE.url],
  },
}

type Framework = {
  id: string
  number: string
  koreanName: string
  abbr: string
  fullName: string
  description: string
}

const FRAMEWORKS: Framework[] = [
  {
    id: 'htp',
    number: '01',
    koreanName: '집·나무·사람 그림',
    abbr: 'HTP',
    fullName: 'House-Tree-Person',
    description:
      '집, 나무, 사람을 그리는 방식에서 아이가 자신과 가족, 주변 환경을 어떻게 느끼는지 읽어요. 집의 크기나 창문 유무, 나무의 형태, 사람의 위치 같은 작은 선택 하나하나가 단서가 돼요.',
  },
  {
    id: 'dap',
    number: '02',
    koreanName: '사람 그리기',
    abbr: 'DAP',
    fullName: 'Draw-A-Person',
    description:
      '사람을 어떻게 그리는지를 통해 아이가 자신을 어떻게 바라보는지, 타인을 어떻게 느끼는지 살펴봐요. 인물의 표정·크기·세부 표현이 아이의 자아상을 드러내요.',
  },
  {
    id: 'kfd',
    number: '03',
    koreanName: '움직이는 가족 그림',
    abbr: 'KFD',
    fullName: 'Kinetic Family Drawing',
    description:
      '움직이는 가족의 모습을 그리게 하면, 아이가 가족 안에서 느끼는 유대와 거리감이 자연스럽게 드러나요. 누가 함께 있고 누가 떨어져 있는지, 가족 사이의 행동까지 읽어봐요.',
  },
  {
    id: 'lmt',
    number: '04',
    koreanName: '풍경 구성하기',
    abbr: 'LMT',
    fullName: 'Landscape Montage Technique',
    description:
      '강·산·길·집·사람 등 10가지 요소로 풍경을 구성해요. 아이가 어떤 세상을 만들고, 그 안에 자신을 어디에 두는지를 통해 내면의 힘과 세상을 바라보는 태도를 살펴봐요.',
  },
  {
    id: 'pitr',
    number: '05',
    koreanName: '빗속 사람 그리기',
    abbr: 'PITR',
    fullName: 'Person in the Rain',
    description:
      '비라는 어려운 상황에서 사람이 어떻게 있는지를 그리게 해요. 우산이 있는지, 혼자인지, 표정은 어떤지를 통해 아이가 스트레스를 어떻게 다루는지 읽어봐요.',
  },
]

const STEPS = [
  {
    step: '01',
    title: '먼저 보이는 것을 살펴봐요',
    body: '선의 굵기와 일관성, 색의 밀도, 공간을 나누는 방식, 반복해서 나타나는 표현들 — 판단 없이 관찰할 수 있는 것들을 먼저 정리해요.',
  },
  {
    step: '02',
    title: '여러 장 사이의 패턴을 찾아요',
    body: '그림 한 장보다 여러 장을 함께 볼 때 더 많은 것이 보여요. 달라지는 것과 이어지는 것, 에너지의 흐름을 읽어요.',
  },
  {
    step: '03',
    title: '맞는 관점만 골라 연결해요',
    body: '다섯 가지 이론을 모두 적용하지 않아요. 그 아이의 그림이 요청하는 질문에 실제로 응답하는 관점만 선택해 연결해요.',
  },
]

export default function ToolsPage() {
  return (
    <div className="min-h-svh bg-cream text-ink">
      {/* Header */}
      <header className="border-b border-sage/15 bg-cream/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="text-lg font-semibold tracking-tight text-sage">
            Kindra
          </Link>
          <Link href="/" className="text-xs text-ink/50 transition hover:text-sage">
            ← 킨드라 홈으로
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="border-b border-sage/10 bg-gradient-to-b from-cream to-sand/40 px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-sage">
              Kindra · 킨드라가 마음을 읽는 법
            </p>
            <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
              아이의 그림을 읽는
              <br />
              다섯 가지 관점
            </h1>
            <div className="mt-8 max-w-2xl space-y-4 text-pretty text-base leading-relaxed text-ink/85 sm:text-lg">
              <p>
                그림을 보면서 &ldquo;이 아이가 무슨 생각을 하는 걸까&rdquo; 느끼신 적 있으신가요? 킨드라가
                그 질문에 함께 다가가는 방법을 소개해 드려요.
              </p>
              <p>
                킨드라는 아동 심리학에서 오랫동안 검증된 다섯 가지 분석 이론을 활용해요. 어느 하나만으로
                아이를 판단하지 않고, 여러 관점을 함께 읽어 아이만의 마음 지도를 완성해요.
              </p>
            </div>
          </div>
        </section>

        {/* 신뢰의 약속 — 위로 이동 */}
        <section className="border-b border-sage/10 bg-white/40 px-5 py-14 sm:px-8 sm:py-16">
          <div className="mx-auto max-w-3xl">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-sage/80">
              킨드라의 약속
            </p>
            <blockquote className="border-l-[3px] border-sage pl-6 text-lg font-medium leading-relaxed text-ink sm:text-xl">
              킨드라는 낙인을 찍지 않아요. 아이의 지금 마음을 &lsquo;경향성&rsquo;으로 살피고, 부모님이
              아이와 더 가깝게 이야기 나눌 수 있도록 돕는 안내자가 되고 싶어요.
            </blockquote>
            <p className="mt-6 text-sm leading-relaxed text-ink/70">
              이 페이지에서 소개하는 이론들은 아이를 진단하는 도구가 아니에요. 그림에서 보이는 것들을 더
              깊이 이해하고, 부모님이 아이에게 더 가깝게 다가갈 수 있도록 돕는 해석의 언어예요.
            </p>
          </div>
        </section>

        {/* 다섯 가지 분석 관점 */}
        <section className="px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center">
              <h2 className="text-2xl font-semibold text-ink">다섯 가지 분석 관점</h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-ink/70">
                각 이론은 그림 하나로 아이를 단정하는 도구가 아니에요. 아이의 그림 전체에서 패턴을 읽을 때
                참조하는 심리학적 관점이에요.
              </p>
            </div>
            <ul className="grid list-none grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {FRAMEWORKS.map((f) => (
                <li key={f.id}>
                  <article className="flex h-full flex-col rounded-2xl border border-sage/20 bg-white/60 p-6 shadow-sm transition duration-300 ease-out hover:-translate-y-0.5 hover:border-sage/45 hover:bg-white hover:shadow-md">
                    <div className="mb-4 flex items-start gap-3">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage/10 text-[11px] font-bold tabular-nums text-sage">
                        {f.number}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold leading-snug text-ink">{f.koreanName}</p>
                        <p className="mt-0.5 text-[11px] text-ink/40">
                          {f.abbr} · {f.fullName}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-ink/80">{f.description}</p>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 이론만이 아닌, 실제 데이터와 함께 */}
        <section className="border-y border-sage/10 bg-white/40 px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-semibold text-ink">이론만이 아닌, 실제 데이터와 함께</h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-ink/70">
                다섯 가지 분석 이론 외에, 킨드라는 두 가지 실제 데이터를 리포트 작성에 함께 활용해요.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* 심허브 */}
              <div className="flex flex-col rounded-2xl border border-sage/25 bg-[#F7FAF5]/80 p-6 shadow-sm sm:p-8">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-sage/75">
                  참고 데이터 01
                </p>
                <h3 className="text-base font-semibold leading-snug text-ink">
                  한국 아동 그림 데이터
                </h3>
                <p className="mt-0.5 text-xs text-ink/45">심허브 (SeemHub)</p>
                <p className="mt-5 text-sm leading-[1.85] text-ink/80">
                  킨드라는 AI 단독 판단이 아니라, 실제 한국 아동의 그림 데이터를 배경으로 활용해요.{' '}
                  <strong className="font-semibold text-ink">7~13세 아동 7,000명</strong>에게서 수집한{' '}
                  <strong className="font-semibold text-ink">56,000장의 그림</strong>과, 각 그림 속 주요
                  요소의 위치·형태를 정밀하게 기록한 라벨링 데이터가 그 기반이에요. 집·나무·여자사람·남자사람
                  네 가지 HTP 분류로 구성되어 있어요.
                </p>
                <p className="mt-4 text-sm leading-[1.85] text-ink/80">
                  아이의 그림을 분석할 때, 같은 연령대 한국 아이들의 실제 그림과 비교하는{' '}
                  <em className="not-italic text-sage-dark">또래의 감각</em>이 자연스럽게 배경으로
                  작동해요.
                </p>
                <p className="mt-5 rounded-lg bg-sage/8 px-3.5 py-2.5 text-xs leading-relaxed text-ink/55">
                  이 데이터는 <strong className="font-medium text-ink/70">7~13세 아동</strong>의 그림에서
                  가장 풍부하게 적용돼요.
                </p>
              </div>

              {/* 성장도표 */}
              <div className="flex flex-col rounded-2xl border border-sage/25 bg-[#F7FAF5]/80 p-6 shadow-sm sm:p-8">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-sage/75">
                  참고 데이터 02
                </p>
                <h3 className="text-base font-semibold leading-snug text-ink">
                  아동 신체 발달 기준 데이터
                </h3>
                <p className="mt-0.5 text-xs text-ink/45">국민건강보험공단 영유아 성장도표</p>
                <p className="mt-5 text-sm leading-[1.85] text-ink/80">
                  그림에는 아이의 심리뿐 아니라 신체 발달 단계가 함께 담겨 있어요. 킨드라는{' '}
                  <strong className="font-semibold text-ink">국민건강보험공단 영유아 성장도표</strong>를
                  활용해, 연령별 신체 발달 기준을 리포트의 한 관점으로 더해요.
                </p>
                <p className="mt-4 text-sm leading-[1.85] text-ink/80">
                  그림에서 보이는 소근육 표현의 정교함, 공간 구성 방식이 아이의 발달 단계와 어떻게
                  맞닿아 있는지를 부드럽게 짚어드릴 수 있어요.
                </p>
                <p className="mt-5 rounded-lg bg-sage/8 px-3.5 py-2.5 text-xs leading-relaxed text-ink/55">
                  발달 지연이나 이상을 진단하는 용도가 아니에요.{' '}
                  <strong className="font-medium text-ink/70">아이의 그림을 맥락 있게 읽기 위한</strong>{' '}
                  참고 기준이에요.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 이렇게 함께 읽어요 */}
        <section className="border-b border-sage/10 bg-sand/35 px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-semibold text-ink">이렇게 함께 읽어요</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/70">
              단일 이론 하나로 아이를 판단하지 않아요. 다섯 가지 관점이 서로 보완하며 하나의 입체적인 마음
              지도를 만들어요.
            </p>
            <ol className="mt-10 space-y-8 list-none">
              {STEPS.map((item) => (
                <li key={item.step} className="flex gap-5">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sage/30 bg-white text-[11px] font-bold tabular-nums text-sage">
                    {item.step}
                  </span>
                  <div>
                    <h3 className="font-semibold text-ink">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink/75">{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 이것이 모여 리포트가 돼요 */}
        <section className="px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-sage/80">
              리포트와 연결
            </p>
            <h2 className="text-2xl font-semibold text-ink">이것이 모여 리포트가 돼요</h2>
            <div className="mt-6 space-y-4 text-pretty text-base leading-relaxed text-ink/85">
              <p>
                관찰한 것들이 쌓이면, 아이의 에너지·감정·관계 방식이 하나의 통합 마음 지도로 정리돼요.
                어떤 이론을 얼마나 반영했는지를 나열하는 것이 아니라, 아이의 이야기를 따뜻한 언어로 풀어
                드리는 리포트예요.
              </p>
              <p>
                부모님이 전해 주시는 맥락 — 요즘 아이의 상태, 그림을 그린 날의 이야기 — 이 더해질 때
                비로소 리포트는 완성돼요.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-sage/10 bg-sage/5 px-5 py-14 sm:px-8">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
            <h2 className="text-lg font-semibold text-ink">아이의 그림을 함께 읽어드릴게요</h2>
            <p className="max-w-md text-sm leading-relaxed text-ink/65">
              그림을 올려 주시면 킨드라가 다섯 가지 관점으로 살펴보고, 아이만의 마음 지도를 준비해 드려요.
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/apply"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-sage px-8 text-sm font-semibold text-cream shadow-sm transition hover:bg-sage-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
              >
                아이의 그림 분석 신청하기
              </Link>
              <Link
                href="/#report"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-sage/40 bg-white px-8 text-sm font-medium text-ink/75 transition hover:border-sage/70 hover:text-ink"
              >
                리포트 예시 먼저 보기
              </Link>
            </div>
          </div>
        </section>

        {/* 면책 고지 */}
        <section className="border-t border-sage/10 px-5 py-8 sm:px-8">
          <div className="mx-auto max-w-3xl">
            <p className="rounded-xl border border-sage/20 bg-white/40 p-5 text-sm leading-relaxed text-ink/60">
              킨드라가 제공하는 내용은{' '}
              <strong className="font-medium text-ink/75">
                임상적 진단이나 의학적 판단을 대신하지 않아요
              </strong>
              . 전문적인 정신건강 평가가 필요하다고 느껴지신다면, 반드시 전문 기관을 찾아 주세요. 이
              페이지에서 소개하는 이론은 이해를 돕기 위한 참고 관점이며, 특정 아이를 단정 짓기 위한 도구가
              아니에요.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
