import { GOOGLE_FORM_URL } from '../constants/form'

export function ReportRequestForm() {
  return (
    <div className="mx-auto max-w-2xl rounded-[28px] border border-[#E8E4DC] bg-white px-6 py-10 shadow-[0_16px_40px_-28px_rgba(74,74,74,0.2)] sm:px-10 sm:py-12">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-[#4A4A4A] sm:text-2xl">리포트 신청</h2>
        <p className="mt-3 text-sm leading-[1.85] text-[#6B6B6B]">
          준비가 되셨다면 아래에서 신청을 이어가 주세요. 구글 폼에서 그림을 올리고, 킨드라가 정리한 마음결
          리포트를 받아보실 수 있어요.
        </p>
      </div>

      <div className="my-10 flex flex-col items-center gap-4 sm:my-12">
        <a
          href={GOOGLE_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex max-w-full items-center justify-center rounded-full bg-[#7C9070] px-6 py-4 text-center text-base font-bold leading-snug text-white shadow-[0_12px_32px_-12px_rgba(124,144,112,0.55)] transition hover:scale-[1.02] hover:bg-[#687D5D] sm:px-8 sm:text-lg md:text-xl"
        >
          리포트 신청하기
        </a>

        <p className="max-w-md text-center text-sm leading-relaxed text-[#6B6B6B]">
          사진 10장으로 확인하는 아이의 마음결 리포트 | 소요시간 약 2분
        </p>

        <p className="max-w-md text-center text-xs leading-relaxed text-[#8A8A8A]">
          전문 분석을 위해 구글 로그인이 필요할 수 있습니다.
        </p>

        <p className="max-w-md text-center text-xs leading-relaxed text-[#7C9070]/95">
          구글 폼을 통해 안전하게 신청됩니다
        </p>

        <p className="max-w-md text-center text-sm leading-relaxed text-[#5A5A5A]">
          업로드하신 소중한 그림은 분석 후 안전하게 관리됩니다.
        </p>
      </div>
    </div>
  )
}
