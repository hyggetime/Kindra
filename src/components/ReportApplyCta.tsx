import { useGoogleFormUrl } from '../hooks/useGoogleFormUrl'

type Props = {
  id?: string
  className?: string
}

export function ReportApplyCta({ id, className = '' }: Props) {
  const formUrl = useGoogleFormUrl()

  return (
    <div id={id} className={`flex flex-col items-center gap-4 ${className}`}>
      <a
        href={formUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-[52px] w-full max-w-md items-center justify-center rounded-full bg-[#7C9070] px-8 py-3.5 text-center text-base font-bold text-white shadow-[0_12px_32px_-12px_rgba(124,144,112,0.55)] transition hover:scale-[1.02] hover:bg-[#687D5D] sm:text-lg"
      >
        리포트 신청하기
      </a>
    </div>
  )
}
