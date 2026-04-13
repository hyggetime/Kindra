import { GOOGLE_FORM_URL } from '../constants/form'

export function ReportRequestForm() {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <h2 className="text-xl font-bold tracking-tight text-[#3D3D3D] sm:text-2xl">
        지금, 아이의 마음결을 만나보세요
      </h2>
      <p className="mx-auto mt-5 max-w-lg text-[0.925rem] leading-[2] text-[#5A5A5A]">
        그림을 올려 주시면 킨드라가 차분히 살펴보고, 아이만의 이야기와 감정의 결이 담긴 리포트로
        돌려드립니다. 서두르지 않아도 괜찮아요. 준비되셨다면 아래에서 신청을 이어가 주세요.
      </p>

      <div className="mt-10 flex flex-col items-center gap-5">
        <a
          href={GOOGLE_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full max-w-md items-center justify-center rounded-full bg-[#7C9070] px-8 py-4 text-center text-sm font-bold leading-snug text-white shadow-[0_12px_32px_-12px_rgba(124,144,112,0.55)] transition hover:scale-[1.02] hover:bg-[#687D5D] sm:text-base"
        >
          킨드라 아이 그림 분석 신청&nbsp;&nbsp;|&nbsp;&nbsp;소요시간 약 2분
        </a>

        <div className="flex flex-col gap-2">
          <p className="text-xs text-[#8A8A8A]">전문 분석을 위해 구글 로그인이 필요할 수 있습니다.</p>
          <p className="text-xs font-medium text-[#7C9070]/90">구글 폼을 통해 안전하게 신청됩니다</p>
          <p className="text-xs text-[#8A8A8A]">업로드하신 소중한 그림은 분석 후 안전하게 관리됩니다.</p>
        </div>
      </div>
    </div>
  )
}
