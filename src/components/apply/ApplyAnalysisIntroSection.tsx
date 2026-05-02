import Link from 'next/link'

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * `/apply` — 킨드라 분석 관점(HTP·LMT 등) 요약. 상세는 `/tools`.
 * 기본 접힘으로 스크롤 부담을 줄입니다.
 */
export function ApplyAnalysisIntroSection() {
  return (
    <details
      id="apply-analysis"
      className="group mt-10 scroll-mt-24 rounded-2xl border border-[#E8E4DC] bg-white shadow-sm open:shadow-md"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-5 py-4 outline-none ring-[#7C9070]/30 marker:content-none focus-visible:ring-2 sm:px-7 sm:py-5 [&::-webkit-details-marker]:hidden">
        <span className="text-base font-semibold text-[#3D3D3D]">분석은 어떻게 이루어지나요?</span>
        <ChevronIcon className="h-5 w-5 shrink-0 text-[#7C9070] transition group-open:rotate-180" />
      </summary>

      <div className="border-t border-[#F0EBE3] px-5 pb-6 pt-2 sm:px-7 sm:pb-8">
      <h2 id="apply-analysis-intro-heading" className="text-lg font-bold tracking-tight text-[#3D3D3D] sm:text-xl">
        킨드라는 이렇게 살펴봐요
      </h2>
      <p className="mt-3 text-[0.95rem] leading-[1.9] text-[#5A5A5A]">
        아이의 그림 한 장을 보낼 때, 무엇을 기준으로 읽는지 궁금하실 거예요. 킨드라는 아동 심리학에서 오랫동안
        활용되어 온 그림 분석 이론들을 바탕으로, 아이의 에너지·감정·관계 방식을 입체적으로 살펴봐요.
      </p>

      <div className="mt-8 space-y-8 border-t border-[#F0EBE3] pt-8">
        <div>
          <h3 className="text-base font-semibold text-[#3D3D3D]">집·나무·사람 그림 검사 (HTP)</h3>
          <p className="mt-2 text-sm leading-[1.85] text-[#5A5A5A]">
            집, 나무, 사람을 그리는 방식에서 아이가 가족과 집에 대해 어떻게 느끼는지, 자신을 어떻게 바라보는지를
            읽어요. 크기·위치·선의 굵기처럼 사소해 보이는 선택들이 아이의 내면 상태를 드러내는 단서가 돼요. 1948년
            미국의 심리학자 존 벅(John Buck)이 개발한 이후 전 세계 임상 현장에서 널리 사용되고 있는 방법이에요.
          </p>
        </div>

        <div>
          <h3 className="text-base font-semibold text-[#3D3D3D]">풍경구성법 (LMT · Landscape Montage Technique)</h3>
          <p className="mt-2 text-sm leading-[1.85] text-[#5A5A5A]">
            강, 산, 길, 집, 사람 등 정해진 요소들로 풍경을 구성하게 하는 기법이에요. 아이가 어떤 세계를 만들고, 그 안에서
            스스로를 어디에 위치시키는지를 통해 자아감과 관계에 대한 태도를 읽어요. 일본의 나카이 히사오(中井久夫)가
            발전시킨 이 기법은 언어로 표현하기 어려운 감정을 공간 구성으로 드러내 준다는 장점이 있어요.
          </p>
        </div>

        <div>
          <p className="text-sm leading-[1.85] text-[#5A5A5A]">
            이 외에도 킨드라는 검증된 아동 그림 심리 이론들을 통합적으로 활용해요. 어떤 이론들을 활용하는지 더 자세히
            알고 싶으시다면 분석 도구 소개 페이지에서 확인하실 수 있어요.
          </p>
          <p className="mt-3">
            <Link
              href="/tools"
              className="inline-flex text-sm font-semibold text-[#5A6F52] underline decoration-[#C8D4C0] underline-offset-2 transition hover:text-[#4F6048]"
            >
              킨드라가 마음을 읽는 법 보러 가기 →
            </Link>
          </p>
        </div>

        <p className="rounded-xl border border-[#E8EDE6] bg-[#F7FAF6]/80 px-4 py-3 text-sm leading-[1.85] text-[#5A5A5A]">
          킨드라의 리포트는 단일 이론이 아닌, 여러 심리 분석 프레임을 통합하여 아이의 마음을 다각도로 읽어요. 어느 한
          기준으로 아이를 규정하지 않고, 여러 시선이 모여 하나의 입체적인 마음 지도가 완성돼요.
        </p>
      </div>
      </div>
    </details>
  )
}
