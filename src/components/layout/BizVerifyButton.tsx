'use client'

type Props = {
  href: string
}

/** 공정위 사업자 조회 — `<button>` 으로 열기(새 탭) */
export function BizVerifyButton({ href }: Props) {
  return (
    <button
      type="button"
      onClick={() => window.open(href, '_blank', 'noopener,noreferrer')}
      className="inline-flex translate-y-[0.5px] items-center rounded border border-[#D4DED0] bg-white px-1.5 py-px text-[10px] font-medium text-[#4F6048] transition hover:border-[#7C9070]/45 hover:bg-[#F4F7F2] sm:translate-y-0 sm:px-2 sm:py-0.5 sm:text-[11px]"
    >
      사업자확인
    </button>
  )
}
