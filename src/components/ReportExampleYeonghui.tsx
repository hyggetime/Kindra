export function ReportExampleYeonghui() {
  const colors = [
    { hex: '#A67B5B', label: '흙의 갈색' },
    { hex: '#87CEEB', label: '하늘빛' },
    { hex: '#FF6B35', label: '잎사귀 주황' },
    { hex: '#E8352A', label: '붉은 잎' },
    { hex: '#32CD32', label: '새싹 연두' },
    { hex: '#6B8FA3', label: '바다 청회' },
    { hex: '#C8A47E', label: '모래 살구' },
    { hex: '#4A4A4A', label: '연필 선' },
  ]

  return (
    <div className="mx-auto max-w-2xl text-[#4A4A4A]">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[28px] bg-[#F5F2ED]">
        <img
          src="/yeonghui_main.png"
          alt="영희의 그림 — 물을 주는 소녀"
          className="h-[420px] w-full object-cover object-top sm:h-[520px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2A2A2A]/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 px-8 pb-9 sm:px-10 sm:pb-11">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.22em] text-white/70">
            Kindra · 분석 리포트 예시
          </p>
          <h1 className="text-balance text-xl font-bold leading-snug tracking-tight text-white sm:text-2xl">
            영희의 63번째 달,<br />다정함이 자라나는 결
          </h1>
        </div>
      </div>

      {/* Core Nature */}
      <section className="mt-14 px-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7C9070]">
          The Core Nature
        </p>
        <h2 className="mt-3 text-lg font-bold tracking-tight text-[#3D3D3D] sm:text-xl">
          영희를 이루는 것들
        </h2>

        <div className="mt-5 flex flex-wrap gap-2">
          {['#다정한_연결', '#우수한_변별력', '#인내심이_강한_아이'].map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#EDF2EB] px-3.5 py-1.5 text-xs font-medium text-[#4F6048]"
            >
              {tag}
            </span>
          ))}
        </div>

        <p className="mt-8 text-[0.95rem] leading-[2] text-[#4A4A4A]/90">
          영희의 그림들은 도화지를 가로지르는 커다란 '맥락'을 가지고 있습니다. 해변에서 수중으로
          이어지는 공간의 분할이나, 작은 새싹에게 물을 주며 웃는 표정은 아이가 세상을 단순히
          나열하지 않고 '이야기'와 '인과 관계'로 이해하고 있음을 보여주는 우수한 인지 신호입니다.
        </p>
        <p className="mt-5 text-[0.95rem] leading-[2] text-[#4A4A4A]/90">
          특히, 눈을 감고 미소 짓는 표정의 반복은 내적인 만족감과 타인에 대한 양육적이고 다정한
          태도를 시사합니다. 전반적으로 필압이 일정하고 화면 전체를 촘촘히 채워낸 점은 과업에 대한
          인내심과 집중력이 또래 대비 뛰어나다는 강력한 근거입니다.
        </p>
      </section>

      <div className="my-14 h-px bg-[#EDE8E0]" />

      {/* Hygge Tips */}
      <section className="px-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7C9070]">
          Hygge Tips
        </p>
        <h2 className="mt-3 text-lg font-bold tracking-tight text-[#3D3D3D] sm:text-xl">
          영희의 결을 지켜주는 응원법
        </h2>

        <div className="mt-8 space-y-10">
          {[
            {
              title: '공간의 설계자',
              body: `영희는 복잡한 상황을 조화롭게 구성하는 능력이 있습니다. 단순히 '그리기'보다는 '마을 만들기', '동물원 배치하기'처럼 스토리가 있는 공간 구성 놀이를 제안해 주세요. 영희가 가진 계획성을 더 단단하게 만들어 줍니다.`,
            },
            {
              title: '과정의 칭찬',
              body: `넓은 면적을 꼼꼼하게 채워낸 인내심을 알아주세요. '결과물이 예쁘다'는 말 대신, '여기 아래쪽 흙을 칠하느라 영희 손이 아주 바빴겠어! 끝까지 해낸 모습이 멋지네'라고 과정을 묘사하여 칭찬해 주시는 것이 자존감에 더 큰 도움이 됩니다.`,
            },
            {
              title: '세밀한 관찰자의 시간',
              body: `귀걸이나 속눈썹 같은 작은 디테일을 잡아내는 관찰력을 격려해 주세요. 숨은그림찾기나 다른 그림 찾기 같은 놀이는 영희의 예민한 시각적 탐색 능력을 즐거운 놀이로 확장할 수 있습니다.`,
            },
          ].map((tip, i) => (
            <div key={tip.title} className="flex gap-5">
              <span className="mt-0.5 shrink-0 text-xs font-semibold tabular-nums text-[#7C9070]/60">
                0{i + 1}
              </span>
              <div>
                <h3 className="text-sm font-bold text-[#3D3D3D]">{tip.title}</h3>
                <p className="mt-2.5 text-sm leading-[1.95] text-[#5A5A5A]">{tip.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="my-14 h-px bg-[#EDE8E0]" />

      {/* Color Spectrum */}
      <section className="px-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7C9070]">
          Color Spectrum
        </p>
        <h2 className="mt-3 text-lg font-bold tracking-tight text-[#3D3D3D] sm:text-xl">
          영희의 마음 무드
        </h2>
        <p className="mt-4 text-sm leading-[1.9] text-[#6B6B6B]">
          영희가 이번 시기에 가장 많이 선택하고 반응한 색들의 스펙트럼입니다. 이 색깔 조각들이
          모여 영희만의 고유한 마음 무드를 이룹니다.
        </p>

        <div className="mt-7 flex overflow-hidden rounded-2xl">
          {colors.map((c) => (
            <div
              key={c.hex}
              className="h-14 flex-1"
              style={{ backgroundColor: c.hex }}
              title={c.label}
            />
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2.5">
          {colors.map((c) => (
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

      <div className="my-14 h-px bg-[#EDE8E0]" />

      {/* Footer CTA */}
      <section className="px-1 pb-2 text-center">
        <p className="text-xs leading-[1.8] text-[#8A8A8A]">
          이 리포트는 예시 데이터로 구성된 샘플입니다.
        </p>
        <a
          href="#request"
          className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#7C9070] px-8 text-sm font-medium text-white shadow-[0_8px_24px_-8px_rgba(124,144,112,0.5)] transition hover:bg-[#687D5D]"
        >
          영희의 마음 기록 저장소 (K-202010-YG)
        </a>
        <p className="mt-3 text-[11px] leading-[1.7] text-[#AAAAAA]">
          이 고유 주소를 즐겨찾기 하시면 로그인 없이 기록이 누적됩니다.
        </p>
      </section>
    </div>
  )
}
