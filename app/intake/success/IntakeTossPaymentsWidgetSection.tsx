'use client'

import { getTossPaymentsMid, isTossPaymentsWidgetConfigured } from '@lib/payment/toss-payments-config'

function KakaoPayIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-8 w-8 sm:h-9 sm:w-9" aria-hidden>
      <rect width="48" height="48" rx="11" fill="#FEE500" />
      <path
        fill="#3C1E1E"
        d="M24 15c-4.8 0-8.8 2.9-8.8 6.5 0 2 1.2 3.8 3.1 5l-1.6 4.4 5-2c.7.1 1.5.2 2.3.2 4.8 0 8.8-2.9 8.8-6.5S28.8 15 24 15z"
      />
    </svg>
  )
}

function NaverPayIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-8 w-8 sm:h-9 sm:w-9" aria-hidden>
      <rect width="48" height="48" rx="11" fill="#03C75A" />
      <path fill="#fff" d="M15 15h4v18h-4V15zm7 0h4.2l6.8 11.3V15h4v18h-4.1L22.2 21.7V33h-4V15z" />
    </svg>
  )
}

function TossPayIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-8 w-8 sm:h-9 sm:w-9" aria-hidden>
      <rect width="48" height="48" rx="11" fill="#0064FF" />
      <path fill="#fff" d="M15 31V17h4.5v9.2L26.2 17H31l-6.2 9.4L31.5 31H27l-4.8-7.2H19.5V31H15z" />
    </svg>
  )
}

function ApplePayIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-8 w-8 sm:h-9 sm:w-9" aria-hidden>
      <rect width="48" height="48" rx="11" fill="#000" />
      <path
        fill="#fff"
        d="M28.2 15.2c.9 1.1 1.4 2.5 1.2 3.9-1.1 0-2.4-.6-3.2-1.6-.8-1-1.3-2.4-1.1-3.8 1.2 0 2.4.7 3.1 1.5zm1.4 6.1c-1.8-.1-3.3 1-4.2 1-.9 0-2.5-1-3.7-.9-1.9.1-3.6 1.1-4.5 2.8-1.9 3.3-.5 8.2 1.3 10.9 1 1.4 2.1 3 3.7 2.9 1.5-.1 2.1-1 3.9-1s2.3 1 3.9.9c1.6-.1 2.6-1.5 3.6-2.9 1.1-1.6 1.6-3.2 1.6-3.3-.1 0-3-1.1-3-4.4 0-2.8 2.3-4.1 2.4-4.2-1.3-2-3.4-2.2-4.1-2.3z"
      />
    </svg>
  )
}

function GooglePayIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-8 w-8 sm:h-9 sm:w-9" aria-hidden>
      <rect width="48" height="48" rx="11" fill="#fff" />
      <path fill="#4285F4" d="M25.2 20.4v3.3h7.9c-.2 1.7-1 3.2-2.1 4.2v3.5h3.4c2-1.8 3.1-4.5 3.1-7.7 0-.7-.1-1.4-.2-2.1h-12.1z" />
      <path fill="#34A853" d="M24 35c2.8 0 5.2-.9 6.9-2.5l-3.4-3.5c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.2h-3.5v3.4c1.7 3.4 5.2 5.8 9.3 5.8z" />
      <path fill="#FBBC04" d="M18.2 26.8c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8v-3.4h-3.5c-.7 1.4-1.1 2.9-1.1 4.6s.4 3.2 1.1 4.6l3.5-3.2z" />
      <path fill="#EA4335" d="M24 17.5c1.5 0 2.9.5 4 1.5l3-3C29.2 14.1 26.8 13 24 13c-4.1 0-7.6 2.4-9.3 5.8l3.5 3.4c.8-2.4 3.1-4.2 5.8-4.2z" />
    </svg>
  )
}

const METHODS = [
  { id: 'kakao', name: '카카오페이', Icon: KakaoPayIcon },
  { id: 'naver', name: '네이버페이', Icon: NaverPayIcon },
  { id: 'toss', name: '토스페이', Icon: TossPayIcon },
  { id: 'apple', name: 'Apple Pay', Icon: ApplePayIcon },
  { id: 'google', name: 'Google Pay', Icon: GooglePayIcon },
] as const

/** DOM 에 결제 위젯이 붙을 루트(토스 SDK `renderPaymentMethods` 등 연동 시 사용). */
export const KINDRA_TOSS_PAYMENT_WIDGET_ROOT_ID = 'kindra-toss-payment-widget-root'

type SectionProps = {
  /** `bankFirst` 일 때는 시각적 강조를 약하게(무통장이 위에 있을 때) */
  secondaryPlacement?: boolean
}

/**
 * 토스페이먼츠 결제 위젯 자리 + 지원 예정 결제수단 아이콘.
 * MID(`NEXT_PUBLIC_TOSS_MID` 또는 코드 기본값)이 비어 있으면 **런타임 오류 없이** 안내만 표시하고, 무통장으로 유도하는 메시지를 씁니다.
 */
export function IntakeTossPaymentsWidgetSection({ secondaryPlacement = false }: SectionProps) {
  const mid = getTossPaymentsMid()
  const configured = isTossPaymentsWidgetConfigured()

  return (
    <section
      className={`rounded-2xl border border-[#E8E4DC] bg-white/90 shadow-inner ${
        secondaryPlacement ? 'px-4 py-4 sm:px-5' : 'px-5 py-6'
      }`}
      aria-labelledby="toss-widget-heading"
      data-toss-widget-ready={configured ? 'true' : 'false'}
      {...(mid ? { 'data-toss-mid': mid } : {})}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p id="toss-widget-heading" className="text-xs font-semibold uppercase tracking-wide text-[#7C9070]">
            카드 · 간편결제
          </p>
          <p className="mt-1 text-sm font-semibold text-[#3D3D3D]">토스페이먼츠 결제 위젯</p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-[#8A8A8A] sm:text-xs">
            카카오페이 · 네이버페이 · 토스페이 · Apple Pay · Google Pay{' '}
            <span className="font-medium text-[#6B6B6B]">지원 예정</span>
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
            configured
              ? 'border-[#E8E4DC] bg-[#F4F7F2] text-[#5A6F52]'
              : 'border-amber-200/90 bg-amber-50/90 text-amber-900'
          }`}
        >
          {configured ? '연동 준비' : '점검·연동'}
        </span>
      </div>

      <ul className="mt-5 grid grid-cols-3 gap-2.5 sm:grid-cols-5 sm:gap-3" aria-label="지원 예정 결제 수단">
        {METHODS.map(({ id, name, Icon }) => (
          <li key={id}>
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-[#EDE8E0] bg-gradient-to-b from-white to-[#FAFAF8] px-1.5 py-3.5 shadow-sm">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl shadow-[0_3px_10px_-3px_rgba(0,0,0,0.1)] ring-1 ring-black/[0.04] sm:h-14 sm:w-14">
                <Icon />
              </span>
              <span className="text-center text-[10px] font-semibold leading-tight text-[#5A5A5A] sm:text-[11px]">{name}</span>
            </div>
          </li>
        ))}
      </ul>

      {/* 토스페이먼츠 Payment Widget: SDK에서 `#${KINDRA_TOSS_PAYMENT_WIDGET_ROOT_ID}` 에 렌더 */}
      <div
        id={KINDRA_TOSS_PAYMENT_WIDGET_ROOT_ID}
        className="mt-5 min-h-[52px] rounded-xl border border-dashed border-[#D4DED0] bg-[#FAFAF8]/80 px-3 py-4 text-center text-[11px] leading-relaxed text-[#9A9A9A]"
        role="status"
        aria-live="polite"
      >
        {configured ? (
          <span>
            상점 MID가 설정되었습니다. 결제 위젯 SDK 연결 후 이 영역에 결제 UI가 표시됩니다. 로드에 실패하면 잠시 후
            이 페이지를 다시 열어 보시고, 그때도 안 되면 아래 <span className="font-medium text-[#6B6B6B]">무통장 입금</span>으로
            이어가 주세요.
          </span>
        ) : (
          <span className="text-[#7A7A7A]">
            카드·간편결제 시스템을 더 편리하게 준비하고 있어요. 지금은 아래 무통장 입금을 이용해 주시면, 확인 즉시
            리포트를 보내드릴게요. 불편하신 점은 카카오톡 문의로 알려 주세요.
          </span>
        )}
      </div>
    </section>
  )
}
