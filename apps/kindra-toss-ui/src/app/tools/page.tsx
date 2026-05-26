import type { Metadata } from 'next'
import Link from 'next/link'

const TOOLS_TITLE = '킨드라가 마음을 읽는 법 — Kindra'
const TOOLS_DESC =
  '킨드라가 아이의 그림을 어떻게 읽는지 알려드려요. HTP·DAP·KFD·LMT·PITR 등 검증된 심리 분석 이론과, 5장 프리미엄 구조화 렌즈를 바탕으로 임상 진단이 아닌 따뜻한 경향성 가이드를 만들어요.'

export const metadata: Metadata = {
  title: TOOLS_TITLE,
  description: TOOLS_DESC,
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

/** 5장 프리미엄 구조화 리포트 — 학술 렌즈 (스캔용 라벨 + 한 줄) */
const PREMIUM_ACADEMIC_LENSES: { tag: string; title: string; detail: string }[] = [
  {
    tag: 'Goodenough–Harris',
    title: '관찰·형태 렌즈',
    detail: '형태적 디테일과 사물 묘사의 정교함을 추적하는 세밀 관찰력 인지 지표',
  },
  {
    tag: 'Luquet',
    title: '공간·서사 렌즈',
    detail: '기저선 활용, 공간 구조화 및 도화지 속 서사(이야기) 구성 능력',
  },
  {
    tag: 'Lowenfeld',
    title: '운동·표현 렌즈',
    detail: '선의 연결성과 일관된 필압을 통한 소근육 협응 및 신체 표현 단계',
  },
  {
    tag: 'DAP / KFD',
    title: '정서·형식 심리 렌즈',
    detail: '인물의 역동성, 필압의 밀도, 여백의 균형을 통해 읽어내는 내면 정서 안정감',
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
    <div className="min-h-dvh bg-[#fdfbf9] text-[#2f2f2f]">
      <header className="border-b border-[#7c9070]/15 bg-[#fdfbf9]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="text-lg font-semibold tracking-tight text-[#4d6b46]">
            Kindra
          </Link>
          <Link href="/" className="text-xs text-[#2f2f2f]/50 transition hover:text-[#4d6b46]">
            ← 미니앱 홈으로
          </Link>
        </div>
      </header>

      <main>
        <section className="border-b border-[#7c9070]/10 bg-gradient-to-b from-[#fdfbf9] to-[#f5efe6]/80 px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#7c9070]">
              Kindra · 킨드라가 마음을 읽는 법
            </p>
            <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-[#2f2f2f] sm:text-4xl">
              아이의 그림을 읽는
              <br />
              다섯 가지 관점
            </h1>
            <div className="mt-8 max-w-2xl space-y-4 text-pretty text-base leading-relaxed text-[#2f2f2f]/85 sm:text-lg">
              <p>
                그림을 보면서 &ldquo;이 아이가 무슨 생각을 하는 걸까&rdquo; 느끼신 적 있으신가요? 킨드라가 그
                질문에 함께 다가가는 방법을 소개해 드려요.
              </p>
              <p>
                킨드라는 아동 심리학에서 오랫동안 검증된 다섯 가지 분석 이론을 활용해요. 어느 하나만으로 아이를
                판단하지 않고, 여러 관점을 함께 읽어 아이만의 마음 지도를 완성해요. 최근에는{' '}
                <strong className="font-semibold text-[#2f2f2f]">5장을 한 묶음으로 읽는 프리미엄 구조화 렌즈</strong>
                도 같은 철학 안에 얹어 두었어요.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-[#7c9070]/10 bg-white/40 px-5 py-14 sm:px-8 sm:py-16">
          <div className="mx-auto max-w-3xl">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7c9070]/80">
              킨드라의 약속
            </p>
            <blockquote className="border-l-[3px] border-[#7c9070] pl-6 text-lg font-medium leading-relaxed text-[#2f2f2f] sm:text-xl">
              킨드라는 낙인을 찍지 않아요. 아이의 지금 마음을 &lsquo;경향성&rsquo;으로 살피고, 부모님이 아이와 더
              가깝게 이야기 나눌 수 있도록 돕는 안내자가 되고 싶어요.
            </blockquote>
            <p className="mt-6 text-sm leading-relaxed text-[#2f2f2f]/70">
              이 페이지에서 소개하는 이론들은 아이를 진단하는 도구가 아니에요. 그림에서 보이는 것들을 더 깊이
              이해하고, 부모님이 아이에게 더 가깝게 다가갈 수 있도록 돕는 해석의 언어예요.
            </p>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center">
              <h2 className="text-2xl font-semibold text-[#2f2f2f]">다섯 가지 분석 관점</h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#2f2f2f]/70">
                각 이론은 그림 하나로 아이를 단정하는 도구가 아니에요. 아이의 그림 전체에서 패턴을 읽을 때 참조하는
                심리학적 관점이에요.
              </p>
            </div>

            {/* 프리미엄 5장 — 기존 카드 규격 */}
            <div className="mb-8">
              <article className="flex flex-col rounded-2xl border border-[#7c9070]/25 bg-white/70 p-6 shadow-sm transition duration-300 ease-out hover:-translate-y-0.5 hover:border-[#7c9070]/45 hover:bg-white hover:shadow-md sm:p-8">
                <p className="mb-3 inline-flex w-fit rounded-full border border-[#7c9070]/35 bg-[#f7faf5]/90 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-[#4d6b46]">
                  [인지·표현 발달 통합 검사]
                </p>
                <div className="mb-4 flex flex-wrap items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#7c9070]/12 text-[11px] font-bold tabular-nums text-[#4d6b46]">
                    ★
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold leading-snug text-[#2f2f2f]">5장 통합 프리미엄 렌즈</p>
                    <p className="mt-0.5 text-[11px] text-[#2f2f2f]/45">구조화 JSON · chart_scores + report_sections</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-[#2f2f2f]/82">
                  아이의 그림 5장을 유기적으로 연결하여 인지 발달과 정서 밀도를 입체적으로 읽어내는 프리미엄 다차원
                  분석 도구입니다.
                </p>

                <ul className="mt-6 grid list-none gap-3 sm:grid-cols-2">
                  {PREMIUM_ACADEMIC_LENSES.map((l) => (
                    <li
                      key={l.tag}
                      className="rounded-xl border border-[#e4ddd3] bg-[#fdfbf9]/80 px-3.5 py-3 text-left"
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7c9070]">{l.tag}</p>
                      <p className="mt-1 text-xs font-semibold text-[#2f2f2f]">{l.title}</p>
                      <p className="mt-1.5 text-[13px] leading-snug text-[#2f2f2f]/75">{l.detail}</p>
                    </li>
                  ))}
                </ul>
              </article>
            </div>

            <ul className="grid list-none grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {FRAMEWORKS.map((f) => (
                <li key={f.id}>
                  <article className="flex h-full flex-col rounded-2xl border border-[#7c9070]/20 bg-white/60 p-6 shadow-sm transition duration-300 ease-out hover:-translate-y-0.5 hover:border-[#7c9070]/45 hover:bg-white hover:shadow-md">
                    <div className="mb-4 flex items-start gap-3">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#7c9070]/10 text-[11px] font-bold tabular-nums text-[#4d6b46]">
                        {f.number}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold leading-snug text-[#2f2f2f]">{f.koreanName}</p>
                        <p className="mt-0.5 text-[11px] text-[#2f2f2f]/40">
                          {f.abbr} · {f.fullName}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-[#2f2f2f]/80">{f.description}</p>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-y border-[#7c9070]/10 bg-white/40 px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-semibold text-[#2f2f2f]">이론만이 아닌, 실제 데이터와 함께</h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#2f2f2f]/70">
                다섯 가지 분석 이론 외에, 킨드라는 두 가지 실제 데이터를 리포트 작성에 함께 활용해요.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="flex flex-col rounded-2xl border border-[#7c9070]/25 bg-[#F7FAF5]/80 p-6 shadow-sm sm:p-8">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7c9070]/75">
                  참고 데이터 01
                </p>
                <h3 className="text-base font-semibold leading-snug text-[#2f2f2f]">한국 아동 그림 데이터</h3>
                <p className="mt-0.5 text-xs text-[#2f2f2f]/45">심허브 (SeemHub)</p>
                <p className="mt-5 text-sm leading-[1.85] text-[#2f2f2f]/80">
                  킨드라는 AI 단독 판단이 아니라, 실제 한국 아동의 그림 데이터를 배경으로 활용해요.{' '}
                  <strong className="font-semibold text-[#2f2f2f]">7~13세 아동 7,000명</strong>에게서 수집한{' '}
                  <strong className="font-semibold text-[#2f2f2f]">56,000장의 그림</strong>과, 각 그림 속 주요 요소의
                  위치·형태를 정밀하게 기록한 라벨링 데이터가 그 기반이에요. 집·나무·여자사람·남자사람 네 가지 HTP
                  분류로 구성되어 있어요.
                </p>
                <p className="mt-4 text-sm leading-[1.85] text-[#2f2f2f]/80">
                  아이의 그림을 분석할 때, 같은 연령대 한국 아이들의 실제 그림과 비교하는{' '}
                  <em className="not-italic text-[#3d5a38]">또래의 감각</em>이 자연스럽게 배경으로 작동해요.
                </p>
                <p className="mt-5 rounded-lg bg-[#7c9070]/8 px-3.5 py-2.5 text-xs leading-relaxed text-[#2f2f2f]/55">
                  이 데이터는 <strong className="font-medium text-[#2f2f2f]/70">7~13세 아동</strong>의 그림에서 가장
                  풍부하게 적용돼요.
                </p>
              </div>

              <div className="flex flex-col rounded-2xl border border-[#7c9070]/25 bg-[#F7FAF5]/80 p-6 shadow-sm sm:p-8">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7c9070]/75">
                  참고 데이터 02
                </p>
                <h3 className="text-base font-semibold leading-snug text-[#2f2f2f]">아동 신체 발달 기준 데이터</h3>
                <p className="mt-0.5 text-xs text-[#2f2f2f]/45">국민건강보험공단 영유아 성장도표</p>
                <p className="mt-5 text-sm leading-[1.85] text-[#2f2f2f]/80">
                  그림에는 아이의 심리뿐 아니라 신체 발달 단계가 함께 담겨 있어요. 킨드라는{' '}
                  <strong className="font-semibold text-[#2f2f2f]">국민건강보험공단 영유아 성장도표</strong>를 활용해,
                  연령별 신체 발달 기준을 리포트의 한 관점으로 더해요.
                </p>
                <p className="mt-4 text-sm leading-[1.85] text-[#2f2f2f]/80">
                  그림에서 보이는 소근육 표현의 정교함, 공간 구성 방식이 아이의 발달 단계와 어떻게 맞닿아 있는지를
                  부드럽게 짚어드릴 수 있어요.
                </p>
                <p className="mt-5 rounded-lg bg-[#7c9070]/8 px-3.5 py-2.5 text-xs leading-relaxed text-[#2f2f2f]/55">
                  발달 지연이나 이상을 진단하는 용도가 아니에요.{' '}
                  <strong className="font-medium text-[#2f2f2f]/70">아이의 그림을 맥락 있게 읽기 위한</strong> 참고
                  기준이에요.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#7c9070]/10 bg-[#f5efe6]/50 px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-semibold text-[#2f2f2f]">이렇게 함께 읽어요</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#2f2f2f]/70">
              단일 이론 하나로 아이를 판단하지 않아요. 다섯 가지 관점이 서로 보완하며 하나의 입체적인 마음 지도를
              만들어요.
            </p>
            <ol className="mt-10 list-none space-y-8">
              {STEPS.map((item) => (
                <li key={item.step} className="flex gap-5">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#7c9070]/30 bg-white text-[11px] font-bold tabular-nums text-[#4d6b46]">
                    {item.step}
                  </span>
                  <div>
                    <h3 className="font-semibold text-[#2f2f2f]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#2f2f2f]/75">{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7c9070]/80">
              리포트와 연결
            </p>
            <h2 className="text-2xl font-semibold text-[#2f2f2f]">이것이 모여 리포트가 돼요</h2>
            <div className="mt-6 space-y-4 text-pretty text-base leading-relaxed text-[#2f2f2f]/85">
              <p>
                관찰한 것들이 쌓이면, 아이의 에너지·감정·관계 방식이 하나의 통합 마음 지도로 정리돼요. 어떤 이론을
                얼마나 반영했는지를 나열하는 것이 아니라, 아이의 이야기를 따뜻한 언어로 풀어 드리는 리포트예요.
              </p>
              <p>
                부모님이 전해 주시는 맥락 — 요즘 아이의 상태, 그림을 그린 날의 이야기 — 이 더해질 때 비로소 리포트는
                완성돼요.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-[#7c9070]/10 bg-[#f2efe9] px-5 py-14 sm:px-8">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
            <h2 className="text-lg font-semibold text-[#2f2f2f]">아이의 그림을 함께 읽어드릴게요</h2>
            <p className="max-w-md text-sm leading-relaxed text-[#2f2f2f]/65">
              그림을 올려 주시면 킨드라가 다섯 가지 관점으로 살펴보고, 아이만의 마음 지도를 준비해 드려요. 개발
              프리뷰에서는 5장 구조화 리포트 화면도 바로 열어볼 수 있어요.
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/preview/structured-report/"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#4d6b46] px-8 text-sm font-semibold text-[#fdfbf9] shadow-sm transition hover:bg-[#3d5538] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7c9070]"
              >
                프리미엄 5장 리포트 프리뷰
              </Link>
              <Link
                href="/"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#7c9070]/40 bg-white px-8 text-sm font-medium text-[#2f2f2f]/75 transition hover:border-[#7c9070]/70 hover:text-[#2f2f2f]"
              >
                미니앱 홈
              </Link>
            </div>
            <p className="mt-1 max-w-lg text-xs leading-relaxed text-[#2f2f2f]/50">
              실시간 엔진·대기 UI·오각형 차트까지 한 번에 보시려면{' '}
              <Link
                href="/preview/structured-report/"
                className="font-medium text-[#4d6b46] underline decoration-[#7c9070]/45 underline-offset-[3px] transition hover:decoration-[#7c9070]"
              >
                구조화 리포트 프리뷰로 이동
              </Link>
              하세요.
            </p>
          </div>
        </section>

        <section className="border-t border-[#7c9070]/10 px-5 py-8 sm:px-8">
          <div className="mx-auto max-w-3xl">
            <p className="rounded-xl border border-[#7c9070]/20 bg-white/40 p-5 text-sm leading-relaxed text-[#2f2f2f]/60">
              킨드라가 제공하는 내용은{' '}
              <strong className="font-medium text-[#2f2f2f]/75">임상적 진단이나 의학적 판단을 대신하지 않아요</strong>
              . 전문적인 정신건강 평가가 필요하다고 느껴지신다면, 반드시 전문 기관을 찾아 주세요. 이 페이지에서 소개하는
              이론은 이해를 돕기 위한 참고 관점이며, 특정 아이를 단정 짓기 위한 도구가 아니에요.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#e4ddd3] px-5 py-8 text-center text-[11px] text-[#2f2f2f]/45 sm:px-8">
        <p>© Kindra — 토스 미니앱 도구 안내</p>
      </footer>
    </div>
  )
}
