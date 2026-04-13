import { useState } from 'react'
import { KindraGallery } from './components/KindraGallery'
import { ReportApplyCta } from './components/ReportApplyCta'
import { ReportExampleYeonghui } from './components/ReportExampleYeonghui'
import { ReportRequestForm } from './components/ReportRequestForm'

const PHILOSOPHY_NOTE =
  `킨드라는 정답을 맞히는 탐정이 아닙니다. 아이가 그림에 담은 구체적인 서사는 오직 부모님만이 알 수 있습니다. 우리는 그 서사를 표현해낸 아이의 에너지, 감정의 밀도, 세상을 대하는 태도라는 '이면의 결'을 조심스럽게 읽어드립니다. 부모님의 따뜻한 맥락이 더해질 때 비로소 킨드라의 리포트는 완성됩니다.`

function App() {
  const [analyzing, setAnalyzing] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)

  const goReport = () => {
    setAnalyzing(true)
    window.setTimeout(() => {
      setAnalyzing(false)
      document.getElementById('report')?.scrollIntoView({ behavior: 'smooth' })
    }, 650)
  }

  return (
    <div className="min-h-svh bg-[#FDFBF9] text-[#4A4A4A]">
      <header className="sticky top-0 z-40 border-b border-[#EDE8E0] bg-[#FDFBF9]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
          <a href="#" className="flex items-baseline gap-2">
            <span className="text-lg font-semibold tracking-tight text-[#7C9070]">Kindra</span>
            <span className="hidden text-xs text-[#8A8A8A] sm:inline">킨드라 · 아이 그림 마음 분석</span>
          </a>
          <nav className="flex items-center gap-4 text-sm">
            <a href="#about" className="text-[#6B6B6B] transition hover:text-[#7C9070]">
              소개
            </a>
            <a href="#gallery" className="text-[#6B6B6B] transition hover:text-[#7C9070]">
              갤러리
            </a>
            <a href="#report" className="text-[#6B6B6B] transition hover:text-[#7C9070]">
              리포트
            </a>
            <a href="#request" className="text-[#6B6B6B] transition hover:text-[#7C9070]">
              신청
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-5 pb-20 pt-16 sm:pb-28 sm:pt-24">
          <div
            className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#E8F0E4]/60 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-[#F3EFE0]/90 blur-3xl"
            aria-hidden
          />

          <div className="relative mx-auto max-w-3xl text-center">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.25em] text-[#7C9070]/85">
              Kindra · Drawing · Mind
            </p>
            <h1 className="text-balance text-3xl font-semibold leading-snug tracking-tight text-[#3D3D3D] sm:text-4xl md:text-[2.75rem]">
              아이의 한 획 한 획,
              <br />
              <span className="text-[#7C9070]">킨드라</span>가 마음을 함께 읽어드려요
            </h1>
            <div className="mx-auto mt-8 max-w-2xl space-y-4 text-pretty text-base leading-[1.9] text-[#5C5C5C] sm:text-lg">
              <p>
                바쁜 하루 속에서도, 아이의 그림 한 장은 잠시 멈춰 서게 만드는 작은 초대장이에요. 색이 겹치는
                방식, 선이 머뭇거리는 속도, 비워 둔 여백까지—그 안에는 말로 다 담기 어려운 감정의 결, 마음의
                무늬가 스며 있습니다.
              </p>
              <p>
                킨드라는 그림을 ‘잘 그렸다’고 재지 않아요. 대신 아이만의 리듬과 시선, 관계를 향한 관심을
                부드럽게 풀어 드리는 마음 지도를 지향합니다. 평가가 아닌, 함께 걷는 관찰이에요.
              </p>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#gallery"
                className="inline-flex min-h-[44px] min-w-[140px] items-center justify-center rounded-full bg-[#7C9070] px-7 text-sm font-medium text-white shadow-[0_8px_24px_-8px_rgba(124,144,112,0.55)] transition hover:bg-[#687D5D]"
              >
                Kindra Gallery
              </a>
              <button
                type="button"
                onClick={goReport}
                disabled={analyzing}
                className="inline-flex min-h-[44px] min-w-[140px] items-center justify-center rounded-full border border-[#D4CFC4] bg-white/90 px-7 text-sm font-medium text-[#4A4A4A] transition hover:border-[#7C9070]/40 hover:bg-[#F7F5F2] disabled:opacity-60"
              >
                {analyzing ? '불러오는 중…' : '샘플 리포트 보기'}
              </button>
            </div>
          </div>
        </section>

        <section id="about" className="border-t border-[#EDE8E0] bg-white/50 px-5 py-16">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-xl font-semibold text-[#4A4A4A] sm:text-2xl">킨드라가 걷는 방식</h2>
            <p className="mt-3 text-sm leading-[1.9] text-[#6B6B6B] sm:text-base">
              숫자와 문장은 모두 아이를 대신 말해 주지 못해요. 그래서 우리는 차분한 여백과 따뜻한 어조를
              먼저 세우고, 그다음에 해석을 얹습니다.
            </p>
          </div>
          <div className="mx-auto mb-14 max-w-2xl rounded-2xl border border-[#E8E4DC] bg-[#F7F5F2] px-7 py-6 sm:px-8 sm:py-7">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7C9070]/80">
              킨드라의 약속
            </p>
            <p className="text-[0.9rem] leading-[2] text-[#5A5A5A]">{PHILOSOPHY_NOTE}</p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-3 md:gap-8">
            {[
              {
                title: '부드러운 분석',
                body: '따뜻한 문장과 넉넉한 여백으로 리포트를 짓습니다. 읽는 동안 숨이 조금 더 길어지도록, 부모님의 마음이 먼저 쉴 수 있게요.',
                accent: 'from-[#E8F0E4] to-transparent',
              },
              {
                title: '성장의 흐름',
                body: '선과 색, 구도의 변화를 한눈에 모읍니다. 지표는 부담 없이 참고용으로만 제시하고, 아이만의 속도를 존중해요.',
                accent: 'from-[#F3EFE0] to-transparent',
              },
              {
                title: '우리 집 리듬',
                body: '여러 장의 그림을 시간과 맥락에 묶어 봅니다. 크게 드러나는 변화와, 조용히 쌓이는 변화를 함께 짚어 드려요.',
                accent: 'from-[#EDE4D8] to-transparent',
              },
            ].map((item) => (
              <article
                key={item.title}
                className="relative overflow-hidden rounded-3xl border border-[#EDE8E0] bg-[#FDFBF9] p-7 shadow-sm"
              >
                <div
                  className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${item.accent} opacity-90`}
                  aria-hidden
                />
                <h3 className="relative text-lg font-semibold text-[#4A4A4A]">{item.title}</h3>
                <p className="relative mt-3 text-sm leading-[1.85] text-[#6B6B6B]">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="gallery" className="border-t border-[#EDE8E0] px-5 py-16 sm:py-20">
          <KindraGallery />

          {/* 접이식 전체 리포트 */}
          <div id="report" className="mx-auto mt-16 max-w-2xl scroll-mt-24 sm:mt-20">
            <div className="flex flex-col items-center gap-4">
              <p className="text-center text-xs leading-relaxed text-[#8A8A8A]">
                갤러리에 담긴 그림들을 바탕으로 킨드라가 작성한 통합 분석 리포트입니다.
              </p>
              <button
                type="button"
                onClick={() => setReportOpen((v) => !v)}
                className="group inline-flex min-h-[52px] items-center gap-2.5 rounded-full border border-[#C8C2B8] bg-white px-8 text-sm font-semibold text-[#4A4A4A] shadow-sm transition hover:border-[#7C9070]/60 hover:bg-[#F7F5F2] hover:text-[#7C9070]"
              >
                <span>영희의 전체 분석 리포트 확인하기</span>
                <span
                  className="inline-block text-base transition-transform duration-300"
                  style={{ transform: reportOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  ↓
                </span>
              </button>
            </div>

            {reportOpen && (
              <div className="mt-10 rounded-[28px] border border-[#E8E4DC] bg-[#F8F9FA] px-5 py-10 sm:px-8 sm:py-14">
                <ReportExampleYeonghui />
              </div>
            )}
          </div>
        </section>

        <section
          id="cta-mid"
          className="border-t border-[#EDE8E0] bg-gradient-to-b from-[#FAF8F5] to-[#FDFBF9] px-5 py-16 sm:py-20"
        >
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-xl font-semibold text-[#4A4A4A] sm:text-2xl">지금, 아이의 마음결을 만나보세요</h2>
            <p className="mt-4 text-pretty text-sm leading-[1.9] text-[#6B6B6B] sm:text-base">
              그림을 올려 주시면 킨드라가 차분히 살펴보고, 아이만의 이야기와 감정의 결이 담긴 리포트로
              돌려드립니다. 서두르지 않아도 괜찮아요. 준비되셨다면 아래에서 신청을 이어가 주세요.
            </p>
            <div className="mt-8">
              <ReportApplyCta />
            </div>
          </div>
        </section>

        <section id="request" className="border-t border-[#EDE8E0] bg-[#FDFBF9] px-5 py-16 sm:py-20">
          <ReportRequestForm />
        </section>
      </main>

      <footer className="border-t border-[#EDE8E0] px-5 py-10 text-center text-sm text-[#8A8A8A]">
        <p className="font-medium text-[#7C9070]/90">Kindra · 킨드라</p>
        <p className="mt-1">
          © {new Date().getFullYear()} Kindra · 아이 그림 마음 분석 서비스
        </p>
      </footer>
    </div>
  )
}

export default App
