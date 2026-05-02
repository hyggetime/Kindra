import Link from 'next/link'

import { APPLY_FORM_HREF } from '@lib/apply-href'

function ToolsIntroIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M8 7h8M8 11h8M8 15h5" />
    </svg>
  )
}

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
        <Link
          href={APPLY_FORM_HREF}
          className="inline-flex w-full max-w-md items-center justify-center rounded-full bg-[#7C9070] px-8 py-4 text-center text-sm font-bold leading-snug text-white shadow-[0_12px_32px_-12px_rgba(124,144,112,0.55)] transition hover:scale-[1.02] hover:bg-[#687D5D] sm:text-base"
        >
          아이 그림 분석 신청하기 · 약 2분
        </Link>

        <Link
          href="/tools"
          className="group inline-flex max-w-md items-center gap-2.5 rounded-full border border-[#E4E8E1] bg-white/80 px-4 py-2.5 text-left text-[13px] leading-snug text-[#5C6658] shadow-sm transition hover:border-[#7C9070]/35 hover:bg-[#FAFBF9] hover:text-[#3D4A38]"
        >
          <ToolsIntroIcon className="h-[18px] w-[18px] shrink-0 text-[#7C9070]/75 transition group-hover:text-[#7C9070]" />
          <span>
            킨드라가 마음을 읽는 법
            <span className="text-[#8A9389]">(분석 도구 소개)</span>
          </span>
        </Link>

        <div className="flex flex-col gap-2">
          <p className="text-xs text-[#8A8A8A]">신청 과정에서 이메일 확인이 필요할 수 있어요.</p>
          <p className="text-xs font-medium text-[#7C9070]/90">킨드라 신청 화면에서 안전하게 진행돼요.</p>
          <p className="text-xs text-[#8A8A8A]">업로드하신 소중한 그림은 분석 후 안전하게 관리됩니다.</p>
        </div>
      </div>
    </div>
  )
}
