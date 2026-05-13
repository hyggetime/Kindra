import { REPORT_EMAIL_SLA_DELAY_NOTE, REPORT_EMAIL_SLA_MAX_PHRASE } from '@lib/copy/report-email-sla'

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * `/apply` — 신청 절차 3단계 안내 (기본 접힘).
 * 앵커 id는 `<details>` 밖 래퍼에 둡니다(해시 타깃이 접힌 본문 안에 있으면 브라우저가 details를 열어 하이드레이션 경고가 날 수 있음).
 */
export function ApplyStepsSection() {
  return (
    <section id="apply-steps" className="mt-8 scroll-mt-24">
      <details className="group rounded-2xl border border-[#E8E4DC] bg-white shadow-sm open:shadow-md">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-5 py-4 outline-none ring-[#7C9070]/30 marker:content-none focus-visible:ring-2 sm:px-7 sm:py-5 [&::-webkit-details-marker]:hidden">
        <span className="text-base font-semibold text-[#3D3D3D]">신청은 이렇게 진행돼요</span>
        <ChevronIcon className="h-5 w-5 shrink-0 text-[#7C9070] transition group-open:rotate-180" />
      </summary>

      <div className="border-t border-[#F0EBE3] px-5 pb-7 pt-2 sm:px-7 sm:pb-8">
        <ol className="mt-4 space-y-5">
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
                전송이 완료되면 필요한 확인이 끝난 뒤, {REPORT_EMAIL_SLA_MAX_PHRASE}에 이메일로 통합 마음 지도 리포트를
                보내드리는 것을 목표로 해요. {REPORT_EMAIL_SLA_DELAY_NOTE}
              </p>
            </div>
          </li>
        </ol>
      </div>
    </details>
    </section>
  )
}
