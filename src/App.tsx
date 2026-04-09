import { useState } from 'react'
import { ReportDashboard } from './components/ReportDashboard'
import { ReportExampleThree } from './components/ReportExampleThree'
import { ReportRequestForm } from './components/ReportRequestForm'
import { UploadZone } from './components/UploadZone'

function App() {
  const [analyzing, setAnalyzing] = useState(false)

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
            <a href="#upload" className="text-[#6B6B6B] transition hover:text-[#7C9070]">
              업로드
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
            <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-[#6B6B6B] sm:text-lg">
              따뜻한 톤과 차분한 리포트로, 창작 활동 속에서 드러나는 성장과 감정의 흐름을
              부담 없이 만나보세요.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#upload"
                className="inline-flex min-h-[44px] min-w-[140px] items-center justify-center rounded-full bg-[#7C9070] px-7 text-sm font-medium text-white shadow-[0_8px_24px_-8px_rgba(124,144,112,0.55)] transition hover:bg-[#687D5D]"
              >
                그림 올리기
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
          <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-3 md:gap-8">
            {[
              {
                title: '부드러운 분석',
                body: '따뜻한 문장과 여백 위주의 리포트로, 아이를 바라보는 시간을 조금 더 편안하게.',
                accent: 'from-[#E8F0E4] to-transparent',
              },
              {
                title: '성장의 흐름',
                body: '선과 색, 구도의 변화를 한눈에. 지표는 부담 없이 참고용으로만 제시해요.',
                accent: 'from-[#F3EFE0] to-transparent',
              },
              {
                title: '우리 집 리듬',
                body: '여러 장의 그림을 모아 관찰 기간별로 정리. 일상 속 작은 변화를 발견해 보세요.',
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
                <h2 className="relative text-lg font-semibold text-[#4A4A4A]">{item.title}</h2>
                <p className="relative mt-3 text-sm leading-relaxed text-[#6B6B6B]">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="upload" className="border-t border-[#EDE8E0] px-5 py-16 sm:py-20">
          <UploadZone />
          <div className="mx-auto mt-12 max-w-4xl text-center">
            <button
              type="button"
              onClick={goReport}
              disabled={analyzing}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#A45C40] px-8 text-sm font-medium text-white shadow-[0_10px_28px_-10px_rgba(164,92,64,0.45)] transition hover:bg-[#8F4E36] disabled:opacity-60"
            >
              {analyzing ? '리포트 준비 중…' : '분석 결과 예시 보기'}
            </button>
            <p className="mt-3 text-xs text-[#8A8A8A]">
              데모에서는 업로드와 관계없이 <code className="rounded bg-[#F3EFE0] px-1.5 py-0.5 text-[11px]">report_sample.json</code>{' '}
              기반 샘플이 표시됩니다.
            </p>
          </div>
        </section>

        <section id="report" className="border-t border-[#EDE8E0] bg-[#FAF8F5] px-5 py-16 sm:py-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-2xl font-semibold text-[#4A4A4A]">분석 리포트 미리보기</h2>
            <p className="mt-2 text-sm text-[#6B6B6B]">
              두 가지 예시를 비교해 보세요. 데이터는{' '}
              <code className="rounded bg-[#F3EFE0] px-1.5 py-0.5 text-[11px]">report_sample.json</code> 과{' '}
              <code className="rounded bg-[#F3EFE0] px-1.5 py-0.5 text-[11px]">report_example3.json</code> 에서
              불러옵니다.
            </p>
          </div>

          <div className="mx-auto mb-14 max-w-4xl">
            <p className="mb-4 text-center text-sm font-semibold text-[#7C9070]">예시 결과 1</p>
            <p className="mb-6 text-center text-xs text-[#8A8A8A]">
              상세 지표·근거·팁이 담긴 확장형 리포트
            </p>
            <ReportDashboard />
          </div>

          <div id="report-example-2" className="mx-auto max-w-4xl scroll-mt-24">
            <p className="mb-4 text-center text-sm font-semibold text-[#7C9070]">예시 결과 2</p>
            <p className="mb-6 text-center text-xs text-[#8A8A8A]">
              4개 관점 · 분석 항목 · 관찰 근거 · 도우미 코멘트 · 기술 신뢰도 · 종합 인사이트
            </p>
            <ReportExampleThree />
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
