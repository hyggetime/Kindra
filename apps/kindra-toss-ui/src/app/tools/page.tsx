import type { Metadata } from 'next'
import Link from 'next/link'

const TOOLS_TITLE = '킨드라가 마음을 읽는 법 — Kindra'
const TOOLS_DESC =
  '킨드라가 아이의 그림을 어떻게 읽는지 알려드려요. HTP·DAP·KFD·LMT·PITR 등 수십 년간 검증된 심리 분석 이론과 인지·발달 렌즈를 바탕으로, 임상 진단이 아닌 따뜻한 경향성 가이드를 만들어요.'

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
      '1948년 존 버크(J.N. Buck)가 개발한, 그림 심리 평가 중 가장 널리 쓰이는 투사 검사 중 하나예요. 집·나무·사람 세 요소는 각각 아이의 가정 환경 인식, 성장 욕구, 자아상을 반영한다고 봐요. 집에 창문이 있는지, 문이 열려 있는지, 나무의 뿌리가 어떤지, 사람이 얼마나 크고 어디에 서 있는지 — 아이가 무의식적으로 선택한 디테일 하나하나가 그 시점 마음의 풍경을 담고 있어요.',
  },
  {
    id: 'dap',
    number: '02',
    koreanName: '사람 그리기',
    abbr: 'DAP',
    fullName: 'Draw-A-Person',
    description:
      '카렌 마코버(1949)가 임상 심리에 적용한 이론으로, 그림 속 인물이 곧 아이의 심리적 자화상이 된다고 봐요. 인물을 얼마나 크게, 어디에 그리는지, 표정이 있는지, 이목구비와 손발이 얼마나 완성되어 있는지가 자아상의 단서예요. 특히 손은 \'관계 맺는 능력\'과 연결되는 요소여서, 손이 있는지·어떻게 그려지는지를 주의 깊게 읽어요.',
  },
  {
    id: 'kfd',
    number: '03',
    koreanName: '움직이는 가족 그림',
    abbr: 'KFD',
    fullName: 'Kinetic Family Drawing',
    description:
      '번즈와 카우프만(1970)이 개발한 동적 가족화는 \'가족이 함께 무언가를 하는 장면\'을 그리게 해요. 정적인 가족화와 달리, 각 가족이 무엇을 하는지·서로를 향하는지·등을 돌리는지의 움직임 속에서 관계의 온도가 드러나요. 아이 자신은 어디에 그려지는지, 부모와 얼마나 가까이 있는지, 가족이 같은 공간을 함께 나누는지 — 배치와 동작 하나하나가 아이가 느끼는 가족 안의 자기 위치를 말해줘요.',
  },
  {
    id: 'lmt',
    number: '04',
    koreanName: '풍경 구성하기',
    abbr: 'LMT',
    fullName: 'Landscape Montage Technique',
    description:
      '일본의 정신과 의사 나카이 히사오가 개발한 투사 검사로, 강·산·들판·길·집·나무·사람·꽃·돌·동물 열 가지 요소를 하나씩 이어 그리며 하나의 풍경을 완성해요. 각 요소의 크기·위치·순서에서 아이가 세상을 어떻게 구성하는지가 보여요. 사람(자신)을 어디에 두는지, 자연 요소들과 얼마나 조화롭게 어우러지는지에서 내면의 균형감과 세계 인식이 드러나요.',
  },
  {
    id: 'pitr',
    number: '05',
    koreanName: '빗속 사람 그리기',
    abbr: 'PITR',
    fullName: 'Person in the Rain',
    description:
      '아브라함 레비(1999)가 개발한 이 검사는 \'빗속의 사람을 그려보세요\'라는 단순한 지시 하나로 아이의 스트레스 대처 방식을 읽어요. 우산이 있는지(보호 자원), 비가 얼마나 세게 쏟아지는지(인식하는 스트레스 강도), 사람이 혼자인지 누군가와 함께인지(사회적 지지 감각), 표정이 어떤지 — 어려운 상황에서 아이가 스스로를 어떻게 보호하고 회복하는지가 그림 속에 담겨 있어요.',
  },
]

const DEVELOPMENTAL_LENSES: { tag: string; researcher: string; title: string; detail: string }[] = [
  {
    tag: 'Goodenough–Harris',
    researcher: '굿이너프 · 해리스, 1926 / 1963',
    title: '관찰·형태 렌즈',
    detail:
      '아이가 그린 인물의 디테일 수준 — 머리카락·눈썹·손가락·옷의 세부 등이 얼마나 완성되어 있는지 — 을 통해 아이가 세상을 얼마나 세밀하게 관찰하고 재현하는지를 읽어요. 인지 발달 단계와 세밀 관찰력이 그림 안에 기록되어 있어요.',
  },
  {
    tag: 'Luquet',
    researcher: '뤼케, 1913',
    title: '공간·서사 렌즈',
    detail:
      '아이들은 \'보이는 것\'이 아니라 \'알고 있는 것\'을 그린다는 관찰에서 출발해요. 하늘과 땅이 분리되어 있는지, 기저선(땅줄)이 등장하는지, 여러 장면이 한 화면에 공존하는지를 통해 아이의 인지적 공간 구성 능력과 서사 사고력이 드러나요.',
  },
  {
    tag: 'Lowenfeld',
    researcher: '로웬펠드, 1947',
    title: '운동·표현 렌즈',
    detail:
      '창의적 표현 발달 이론은 긁적거림에서 시각적 사실 표현까지 아동화의 단계를 체계화했어요. 선이 얼마나 의도적으로 이어지는지, 필압이 일정하게 유지되는지, 신체 각 부위가 연결성 있게 표현되는지를 통해 소근육 운동 발달과 표현 단계를 살펴봐요.',
  },
  {
    tag: 'DAP / KFD',
    researcher: '마코버 · 번즈, 1949 / 1970',
    title: '정서·형식 심리 렌즈',
    detail:
      '인물화와 움직이는 가족화가 결합된 이 렌즈는 그림 속 인물의 배치·접촉·표정·크기에서 아이의 관계 감각과 정서 안정감을 읽어요. 손을 뻗는지 움츠리는지, 가족이 서로를 향하는지 등을 돌리는지, 인물 사이 여백이 어느 정도인지 — 필압의 강약과 여백 배분이 아이의 내면 정서를 드러내는 언어가 돼요.',
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
        {/* ── 히어로 ── */}
        <section className="border-b border-[#7c9070]/10 bg-gradient-to-b from-[#fdfbf9] to-[#f5efe6]/80 px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#7c9070]">
              Kindra · 킨드라가 마음을 읽는 법
            </p>
            <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-[#2f2f2f] sm:text-4xl">
              아이의 그림을 읽는
              <br />
              검증된 심리 분석 도구
            </h1>
            <div className="mt-8 max-w-2xl space-y-4 text-pretty text-base leading-relaxed text-[#2f2f2f]/85 sm:text-lg">
              <p>
                &ldquo;이 아이가 무슨 생각을 하는 걸까&rdquo; — 그림을 보며 한 번쯤 느껴 보셨을 거예요. 킨드라는 그
                질문에 함께 다가가기 위해, 수십 년간 아동 심리학에서 검증된 분석 이론을 활용해요.
              </p>
              <p>
                어느 하나의 관점으로 아이를 판단하지 않아요. 다섯 가지 이론 프레임과 네 가지 인지·발달 렌즈가 서로
                보완하며, 아이만의 입체적인 마음 지도를 완성해요.
              </p>
            </div>
          </div>
        </section>

        {/* ── 킨드라의 약속 ── */}
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

        {/* ── 다섯 가지 분석 관점 ── */}
        <section className="px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-[#2f2f2f]">다섯 가지 분석 관점</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#2f2f2f]/70">
                각 이론은 그림 하나로 아이를 단정하는 도구가 아니에요. 아이의 그림 전체에서 패턴을 읽을 때 함께
                참조하는, 수십 년간 검증된 심리학적 관점이에요.
              </p>
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

            {/* ── 5장 심층 발달 렌즈 ── */}
            <div className="mt-16 border-t border-[#7c9070]/15 pt-14">
              <div className="mb-8">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7c9070]/80">
                  그림 5장이 모였을 때 · 발달·정서 심층 렌즈
                </p>
                <h2 className="text-xl font-semibold text-[#2f2f2f] sm:text-2xl">
                  인지·발달 연구가 쌓아온 네 가지 관점
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#2f2f2f]/70">
                  그림 한 장은 하나의 순간이지만, 다섯 장이 모이면 아이의 마음 흐름이 됩니다. 킨드라는 표현 발달
                  연구자들이 수십 년간 다듬어 온 아래 네 가지 렌즈로 그림들을 하나의 이야기로 연결해요. 아이가 어떻게
                  선을 다루는지, 공간을 어떻게 구성하는지, 대상을 어떻게 관찰하고 재현하는지 — 그림 속에 담긴 발달과
                  정서의 밀도를 입체적으로 파악해요.
                </p>
              </div>

              <ul className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2">
                {DEVELOPMENTAL_LENSES.map((l) => (
                  <li key={l.tag}>
                    <article className="flex h-full flex-col rounded-2xl border border-[#7c9070]/25 bg-[#f7faf5]/70 p-5 shadow-sm transition duration-300 ease-out hover:border-[#7c9070]/45 hover:bg-[#f7faf5] hover:shadow-md sm:p-6">
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7c9070]">
                            {l.tag}
                          </p>
                          <p className="mt-0.5 text-xs text-[#2f2f2f]/40">{l.researcher}</p>
                        </div>
                        <span className="shrink-0 rounded-full border border-[#7c9070]/25 bg-white px-2.5 py-0.5 text-[10px] font-semibold text-[#4d6b46]">
                          {l.title}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-[#2f2f2f]/80">{l.detail}</p>
                    </article>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── 실제 데이터와 함께 ── */}
        <section className="border-y border-[#7c9070]/10 bg-white/40 px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10">
              <h2 className="text-2xl font-semibold text-[#2f2f2f]">이론만이 아닌, 실제 데이터와 함께</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#2f2f2f]/70">
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

        {/* ── 이렇게 함께 읽어요 ── */}
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

        {/* ── 이것이 모여 리포트가 돼요 ── */}
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

        {/* ── CTA ── */}
        <section className="border-t border-[#7c9070]/10 bg-[#f2efe9] px-5 py-14 sm:px-8">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
            <h2 className="text-lg font-semibold text-[#2f2f2f]">아이의 그림을 함께 읽어드릴게요</h2>
            <p className="max-w-md text-sm leading-relaxed text-[#2f2f2f]/65">
              그림을 올려 주시면 킨드라가 다섯 가지 관점과 발달 렌즈로 살펴보고, 아이만의 마음 지도를 준비해 드려요.
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
          </div>
        </section>

        {/* ── 법적 고지 ── */}
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
        <p>© Kindra — 킨드라 분석 도구 안내</p>
      </footer>
    </div>
  )
}
