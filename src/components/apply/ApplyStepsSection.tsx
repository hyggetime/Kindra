/**
 * `/apply` — 신청 절차 3단계 안내.
 */
export function ApplyStepsSection() {
  return (
    <section
      id="apply-steps"
      className="mt-8 scroll-mt-24 rounded-2xl border border-[#E8E4DC] bg-[#FDFBF9] px-5 py-6 shadow-sm sm:px-7 sm:py-8"
      aria-labelledby="apply-steps-heading"
    >
      <h2 id="apply-steps-heading" className="text-lg font-bold tracking-tight text-[#3D3D3D] sm:text-xl">
        신청은 이렇게 진행돼요
      </h2>
      <ol className="mt-5 space-y-5">
        <li className="flex gap-3 sm:gap-4">
          <span className="mt-0.5 shrink-0 tabular-nums text-sm font-bold text-[#7C9070]">01</span>
          <div>
            <p className="font-semibold text-[#3D3D3D]">그림 올리기</p>
            <p className="mt-1 text-sm leading-[1.85] text-[#5A5A5A]">
              아이가 그린 그림을 최대 5장까지 올려 주세요. 최근 그림일수록 좋지만, 아이가 좋아하는 그림이라면 어떤
              것이든 괜찮아요.
            </p>
          </div>
        </li>
        <li className="flex gap-3 sm:gap-4">
          <span className="mt-0.5 shrink-0 tabular-nums text-sm font-bold text-[#7C9070]">02</span>
          <div>
            <p className="font-semibold text-[#3D3D3D]">간단한 정보 입력</p>
            <p className="mt-1 text-sm leading-[1.85] text-[#5A5A5A]">
              아이의 나이, 성별, 그리고 부모님이 느끼는 아이의 요즘 상태를 자유롭게 적어 주세요. 이 맥락이 리포트를 더
              아이답게 만들어 줘요.
            </p>
          </div>
        </li>
        <li className="flex gap-3 sm:gap-4">
          <span className="mt-0.5 shrink-0 tabular-nums text-sm font-bold text-[#7C9070]">03</span>
          <div>
            <p className="font-semibold text-[#3D3D3D]">리포트 수령</p>
            <p className="mt-1 text-sm leading-[1.85] text-[#5A5A5A]">
              전송 완료 후 24시간 이내, 이메일로 통합 마음 지도 리포트를 보내드려요.
            </p>
          </div>
        </li>
      </ol>
    </section>
  )
}
