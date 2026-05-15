'use client'

import { useCallback, useMemo, useState } from 'react'

import { ApplyPaymentThanksLinePc } from '@app/apply/payment/ApplyPaymentThanksLinePc'
import { PaymentSection } from '@/components/payment/PaymentSection'
import { REPORT_EMAIL_DELIVERY_POLICY_PAYMENT_LINE } from '@lib/copy/report-email-sla'
import { APPLY_FORM_HREF } from '@lib/apply-href'
import { getKakaoChannelChatPageUrl, resolveKakaoChannelPublicId } from '@lib/kakao/kakao-channel-constants'
import type { BankTransferDisplay } from '@lib/payment/bank-transfer'

/** 복사·표시·홈 링크에 공통 사용 (Vercel 배포 URL) */
const LANDING = 'https://kindra.vercel.app/'

type Props = {
  reportId: string | null
  bankTransfer: BankTransferDisplay
  listedPriceWon: number
  hideBankTransferUi: boolean
}

/**
 * 그림·신청서 전송 직후: 짧은 완료 뒤, **결제 안내**를 강조.
 */
export function ApplyPaymentView({ reportId, bankTransfer, listedPriceWon, hideBankTransferUi }: Props) {
  const [copied, setCopied] = useState(false)
  const [copyLinkBusy, setCopyLinkBusy] = useState(false)

  const kakaoInquiryUrl = useMemo(
    () => getKakaoChannelChatPageUrl(resolveKakaoChannelPublicId()),
    [],
  )

  const copyShare = useCallback(async () => {
    if (copyLinkBusy) return
    setCopyLinkBusy(true)
    try {
      await navigator.clipboard.writeText(LANDING)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      setCopied(false)
    } finally {
      window.setTimeout(() => setCopyLinkBusy(false), 900)
    }
  }, [copyLinkBusy])

  return (
    <div className="space-y-8 sm:space-y-10">
      <header className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7C9070]/90">전송 완료</p>
        <h1 className="mx-auto mt-3 max-w-lg text-left text-base font-bold leading-snug tracking-tight text-[#2F3D2E] sm:text-lg">
          신청서와 그림이 안전하게 전달되었어요. 이어서 결제를 완료하시면 리포트가 발송됩니다.
        </h1>
        <div className="mx-auto mt-5 max-w-lg text-left text-sm text-[#5A5A5A]">
          <div className="flex flex-col">
            <div className="flex flex-col gap-y-[0.325em] [&>p]:m-0 [&>p]:leading-[1.65]">
              <ApplyPaymentThanksLinePc className="m-0 text-sm leading-[1.65] text-[#5A5A5A]" />
              <p>{REPORT_EMAIL_DELIVERY_POLICY_PAYMENT_LINE}</p>
            </div>
            <p className="mx-0 mb-0 mt-[0.65em] text-[#8A8A8A] leading-[1.65]">
              <span aria-hidden className="mr-1.5 select-none">
                •
              </span>
              화면이 비어 보인다면 잠시 후 &apos;새로고침&apos;해 주세요.
            </p>
          </div>
        </div>
      </header>

      <PaymentSection
        emphasis
        listedPriceWon={listedPriceWon}
        reportId={reportId}
        bankTransfer={bankTransfer}
        hideBankTransferUi={hideBankTransferUi}
      />

      <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:justify-center">
        <button
          type="button"
          onClick={() => void copyShare()}
          disabled={copyLinkBusy}
          className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full border border-[#D4DED0] bg-white px-6 text-sm font-semibold text-[#4F6048] transition hover:bg-[#F4F7F2] disabled:opacity-60 sm:max-w-xs"
        >
          {copied ? '링크를 복사했어요' : copyLinkBusy ? '복사 중…' : '킨드라 링크 복사'}
        </button>
        <a
          href={LANDING}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full bg-[#7C9070] px-6 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(124,144,112,0.55)] transition hover:bg-[#687D5D] sm:max-w-xs"
        >
          킨드라 홈으로 가기
        </a>
      </div>
      <p className="text-center text-[11px] text-[#9A9A9A]">{LANDING}</p>

      <p className="text-center text-sm text-[#6B6B6B]">
        결제 중 궁금한 점이 있으신가요?{' '}
        <a
          href={kakaoInquiryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[#5A6F52] underline decoration-[#C8D4C0] underline-offset-2 transition hover:text-[#4F6048]"
        >
          카카오톡 문의하기
        </a>
      </p>

      <p className="text-center text-sm text-[#6B6B6B]">
        다시 신청하거나 수정하고 싶다면{' '}
        <a href={APPLY_FORM_HREF} className="font-medium text-[#7C9070] underline-offset-4 hover:underline">
          신청서로 돌아가기 →
        </a>
      </p>
    </div>
  )
}
