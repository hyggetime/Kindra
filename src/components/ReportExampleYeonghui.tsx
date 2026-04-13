import { useState } from 'react'

export function ReportExampleYeonghui() {
  const [detailOpen, setDetailOpen] = useState(false)

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
      {/* Hero — 항상 노출 */}
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

      {/* 핵심 키워드 — 항상 노출 */}
      <div className="mt-8 px-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7C9070]">
          The Core Nature
        </p>
        <h2 className="mt-3 text-lg font-bold tracking-tight text-[#3D3D3D] sm:text-xl">
          영희를 이루는 것들
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {['#다정한_양육의_마음', '#뛰어난_관찰·변별력', '#서사를_짜는_사고력', '#안정된_자아_기반'].map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#EDF2EB] px-3.5 py-1.5 text-xs font-medium text-[#4F6048]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* 더보기 버튼 */}
      <div className="mt-8 flex justify-center px-1">
        <button
          type="button"
          onClick={() => setDetailOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full border border-[#D4CFC4] bg-white px-7 py-3 text-sm font-medium text-[#5A5A5A] shadow-sm transition hover:border-[#7C9070]/60 hover:bg-[#F7F5F2] hover:text-[#7C9070]"
        >
          <span>{detailOpen ? '접기' : '전문 분석 더보기'}</span>
          <span
            className="inline-block text-sm transition-transform duration-300"
            style={{ transform: detailOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            ↓
          </span>
        </button>
      </div>

      {/* 이하 내용 — detailOpen 시 노출 */}
      {detailOpen && (
        <>
          <section className="mt-12 px-1">
            <div className="space-y-12">

              {/* 1 · 선과 필압 */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#A67B5B]">
                  Line · Pressure · 선과 필압
                </p>
                <h3 className="mt-2 text-base font-bold text-[#3D3D3D]">
                  선 하나하나가 말해주는 안정감
                </h3>
                <p className="mt-4 text-[0.92rem] leading-[2.05] text-[#4A4A4A]/90">
                  5장의 그림을 관통하는 가장 두드러진 특징은 필압의 균일함입니다. 연필로 그린
                  가족 인물화에서 크레파스로 하늘과 땅을 넓게 칠한 '물 주는 소녀' 장면까지,
                  선의 강도가 일관되게 유지됩니다. Hammer(1958)의 그림 심리분석에서 균일한
                  필압은 감정 상태가 안정적이며, 충동적이거나 위축된 에너지가 없음을 나타내는
                  지표로 읽힙니다.
                </p>
                <p className="mt-4 text-[0.92rem] leading-[2.05] text-[#4A4A4A]/90">
                  '물 주는 소녀' 그림에서 배경 지면 영역까지 갈색 크레파스로 꼼꼼히 채운 점,
                  해변 장면에서 화면 구석구석을 인물과 소품으로 채운 점, 감정 카드 그림에서
                  하트를 가볍게 눌러 투명하게 남기고 역삼각형은 또렷하게 그린 점 — 이 모든
                  필압의 '의도적 조절'은 도구를 이미 자신의 감정 언어로 다루고 있다는 증거입니다.
                </p>
              </div>

              {/* 2 · 공간 구성 */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7C9070]">
                  Space · Ground · 공간 구성
                </p>
                <h3 className="mt-2 text-base font-bold text-[#3D3D3D]">
                  화면을 가득 채우는 방식, 그리고 기저선
                </h3>
                <p className="mt-4 text-[0.92rem] leading-[2.05] text-[#4A4A4A]/90">
                  영희의 그림에는 두 가지 공간 처리 능력이 함께 나타납니다. 첫째, 화면 전체를
                  적극적으로 활용합니다. 해변 장면에서는 여러 역할의 인물들을 화면 각 구역에
                  배치하고 하늘에는 구름·새·소품을 흩어두어 빈 공기조차 살아있게 만들었습니다.
                  공간을 단순히 채우는 것이 아니라 구역별로 '설계'하는 방식입니다.
                </p>
                <p className="mt-4 text-[0.92rem] leading-[2.05] text-[#4A4A4A]/90">
                  둘째, '물 주는 소녀' 그림에서 소녀 발 아래 자발적으로 그어진 갈색 가로선
                  (기저선, baseline)이 주목됩니다. Hammer의 HTP 분석에서 기저선을 스스로
                  그리는 아이는 자신이 발 딛고 선 환경을 안정적이고 지지적으로 느끼고 있음을
                  의미합니다. 양옆 나무 두 그루가 인물을 감싸는 구도 역시, 현재 생활 환경을
                  보호받는 공간으로 경험하고 있다는 신호로 읽힙니다.
                </p>
              </div>

              {/* 3 · 인물 표현 */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B8FA3]">
                  DAP · Figure Drawing · 인물 표현
                </p>
                <h3 className="mt-2 text-base font-bold text-[#3D3D3D]">
                  귀걸이 하나까지 — 세밀한 변별력의 증거
                </h3>
                <p className="mt-4 text-[0.92rem] leading-[2.05] text-[#4A4A4A]/90">
                  가족화에 등장하는 인물들을 보면 머리핀, 리본, 속눈썹, 귀걸이, 셔츠의 나비
                  무늬, 바지의 주름, 신발 형태까지 또래에게서 보기 드문 수준의 디테일이
                  녹아 있습니다. Koppitz(1968)의 DAP(인물화 검사) 기준에서 이처럼 부속 요소를
                  자발적으로 추가하는 것은 높은 시각적 변별력과 더불어 사회적 맥락(외모,
                  꾸밈, 역할)에 대한 예민한 인식을 나타냅니다.
                </p>
                <p className="mt-4 text-[0.92rem] leading-[2.05] text-[#4A4A4A]/90">
                  같은 정밀도는 종이 인형에서도 이어집니다. 파란 드레스의 물방울 무늬, 격자
                  무늬 스타킹, 주황 머리 캐릭터의 검은 점 패턴 — 두 인물이 완전히 다른 성격과
                  색채 체계를 갖도록 설계되어 있습니다. 아이 캐릭터에는 전신을 상세히 그리면서
                  성인 캐릭터는 얼굴에 집중한 가족화의 구성 역시, 자신이 속한 '아이들의 세계'를
                  더 풍부하게 표현하는 관점의 주체성을 보여줍니다.
                </p>
              </div>

              {/* 4 · 반복 표정 */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C8A47E]">
                  Recurring Motif · 반복 표정
                </p>
                <h3 className="mt-2 text-base font-bold text-[#3D3D3D]">
                  눈을 감은 미소 — 5장을 가로지르는 내적 평화의 서명
                </h3>
                <p className="mt-4 text-[0.92rem] leading-[2.05] text-[#4A4A4A]/90">
                  영희의 그림에서 가장 일관되게 나타나는 표정이 있습니다. 눈을 가만히 감고
                  입꼬리를 살짝 올린 미소입니다. 가족화의 성인 인물, '물 주는 소녀'의 주인공,
                  종이 인형의 두 캐릭터, 감정 카드 속 인물 — 거의 모든 그림에서 이 표정이
                  반복적으로 등장합니다.
                </p>
                <p className="mt-4 text-[0.92rem] leading-[2.05] text-[#4A4A4A]/90">
                  그림 심리분석에서 눈을 감은 표정의 반복은 단순한 그림 습관이 아닙니다.
                  영희가 '행복하다'고 느끼는 감정 상태를 시각적으로 내면화해 하나의 고유한
                  상징으로 사용하고 있다는 신호입니다. 외부 자극에 반응하는 얼굴이 아니라,
                  내면에서 우러나오는 안정된 자아상이 형성되어 있음을 의미합니다.
                </p>
              </div>

              {/* 5 · 서사적 사고 */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7C9070]">
                  Narrative Cognition · 서사적 사고
                </p>
                <h3 className="mt-2 text-base font-bold text-[#3D3D3D]">
                  나열이 아닌 이야기 — 관계와 맥락을 그리는 아이
                </h3>
                <p className="mt-4 text-[0.92rem] leading-[2.05] text-[#4A4A4A]/90">
                  해변 그림을 보면 단순히 인물을 나열하지 않았습니다. 여유롭게 기댄 어른,
                  팔을 들어 올린 활동적인 중심 인물, 물속에서 올라오는 탐험가, 아기를 안은
                  보호자 — 각자 다른 상태와 역할을 가진 인물들이 하나의 화면 안에서 동시에
                  공존합니다. 정적인 존재와 동적인 존재를 나란히 배치하는 이 방식은 장면을
                  단순히 '채우는' 것이 아니라 관계의 긴장과 리듬을 '연출'하는 능력입니다.
                </p>
                <p className="mt-4 text-[0.92rem] leading-[2.05] text-[#4A4A4A]/90">
                  종이 인형에서는 서사의 또 다른 층위가 나타납니다. 그린 캐릭터를 가위로
                  오려 물리적 공간 안에 독립적으로 세워두는 행위는, 내면의 이야기를 실제
                  세계 안으로 '꺼내는' 적극적인 서사화입니다. 63개월령에 평면의 그림을
                  3차원 서사 공간으로 전환하는 이 능력은 또래 평균을 웃도는 이야기 사고의
                  징표입니다.
                </p>
              </div>

              {/* 6 · 양육 모티프 */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E8352A]/80">
                  Nurturing Motif · 양육 모티프
                </p>
                <h3 className="mt-2 text-base font-bold text-[#3D3D3D]">
                  돌보고 싶은 마음이 세 가지 방식으로 나타나다
                </h3>
                <p className="mt-4 text-[0.92rem] leading-[2.05] text-[#4A4A4A]/90">
                  영희의 그림 전체에는 '돌봄'의 주제가 반복됩니다. 새싹에게 물을 주는 소녀,
                  자신이 그린 캐릭터를 가위로 오려 세상 밖으로 꺼내주는 행위, 해변 장면에서
                  아기를 품에 안고 있는 보호자의 모습. 이 세 장면은 소재는 다르지만 하나의
                  공통된 정서 — 무언가를 키우고 보살피고 싶은 마음 — 로 연결되어 있습니다.
                </p>
                <p className="mt-4 text-[0.92rem] leading-[2.05] text-[#4A4A4A]/90">
                  그림에서 양육 모티프가 자발적으로 반복될 때, 이는 정서적 공감 능력과
                  타인 지향성이 또래 평균보다 풍부하게 발달하고 있다는 신호로 읽힙니다.
                  영희는 받는 사람이 아니라 주는 사람의 역할을 자신의 이야기 안에서
                  즐겁게 수행하고 있습니다.
                </p>
              </div>

              {/* 7 · 메타 표상 */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8B7BA8]">
                  Meta-Representation · 메타 표상
                </p>
                <h3 className="mt-2 text-base font-bold text-[#3D3D3D]">
                  그림 속에 그림을 담다 — 상징 사고의 싹
                </h3>
                <p className="mt-4 text-[0.92rem] leading-[2.05] text-[#4A4A4A]/90">
                  감정 카드 그림이 특히 눈에 띕니다. 영희는 세 장의 카드를 그렸고, 그 카드
                  각각의 안에 다시 서로 다른 표정의 캐릭터 얼굴을 그려 넣었습니다. '그림을
                  그린다'는 행위를 그림의 소재로 삼는 이 구성을 인지 발달 연구에서는
                  메타 표상(meta-representation)이라 부릅니다.
                </p>
                <p className="mt-4 text-[0.92rem] leading-[2.05] text-[#4A4A4A]/90">
                  종이 인형에서도 같은 층위의 사고가 이어집니다. 2차원 평면 위의 그림을
                  인지하고, 그것을 오려 3차원 공간의 독립적 존재로 전환하는 과정은
                  '표상에 대한 표상' — 즉 이중 표상 능력의 발현입니다. 이 능력은
                  마음 이론(Theory of Mind)과 깊게 연결되며, 63개월령에 자발적으로
                  나타난다는 것은 영희의 상징 사고 능력이 또래보다 풍부하게 발달하고
                  있음을 시사합니다.
                </p>
              </div>

            </div>
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
        </>
      )}
    </div>
  )
}
