import { REPORT_EMAIL_SLA_DELAY_NOTE, REPORT_EMAIL_SLA_MAX_PHRASE } from '@lib/copy/report-email-sla'

const ITEMS: { q: string; a: string }[] = [
  {
    q: '리포트는 언제 받을 수 있나요?',
    a: `그림과 신청서를 받고 필요한 확인이 끝나면, ${REPORT_EMAIL_SLA_MAX_PHRASE}에 이메일로 통합 리포트를 보내드리는 것을 목표로 해요. ${REPORT_EMAIL_SLA_DELAY_NOTE}`,
  },
  {
    q: '결제는 꼭 해야 하나요?',
    a: '신청을 완료하시면 안내 화면에서 카드·간편결제 또는 무통장 입금으로 결제를 이어가 주세요. 요금 구간에 따라 청구 금액이 달라져요.',
  },
  {
    q: '아이 그림은 몇 장까지 보내나요?',
    a: '최대 5장까지 올릴 수 있어요. 한 번에 보내주신 그림을 함께 읽고 통합 리포트로 정리해 드려요.',
  },
]

/**
 * 랜딩 하단 — 짧은 FAQ (가격 티저 아래).
 */
export function LandingFaqBlock() {
  return (
    <section
      id="faq"
      className="scroll-mt-20 border-t border-[#EDE8E0] bg-[#FDFBF9] px-5 py-10 sm:py-12"
      aria-labelledby="landing-faq-title"
    >
      <div className="mx-auto max-w-2xl">
        <h2 id="landing-faq-title" className="text-center text-base font-semibold text-[#3D3D3D] sm:text-lg">
          자주 묻는 질문
        </h2>
        <div className="mt-6 space-y-2">
          {ITEMS.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border border-[#E8E4DC] bg-white/80 px-4 py-3 shadow-sm open:bg-white"
            >
              <summary className="cursor-pointer list-none text-left text-sm font-medium text-[#4A4A4A] marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="inline-flex w-full items-start justify-between gap-2">
                  {item.q}
                  <span
                    className="mt-0.5 shrink-0 text-[#7C9070] transition group-open:rotate-180"
                    aria-hidden
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </span>
              </summary>
              <p className="mt-2 border-t border-[#F0EBE4] pt-3 text-[13px] leading-relaxed text-[#5C5C5C] sm:text-sm">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
