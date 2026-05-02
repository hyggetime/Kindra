'use client'

import { useCallback, useMemo, useState } from 'react'

import { PaymentSection } from '@/components/payment/PaymentSection'
import { APPLY_FORM_HREF } from '@lib/apply-href'
import type { PriceTier } from '@lib/constants'
import { getKakaoChannelChatPageUrl, resolveKakaoChannelPublicId } from '@lib/kakao/kakao-channel-constants'
import type { BankTransferDisplay } from '@lib/payment/bank-transfer'

/** 복사·표시·홈 링크에 공통 사용 (Vercel 배포 URL) */
const LANDING = 'https://kindra.vercel.app/'

type Props = {
  tier: PriceTier
  reportId: string | null
  bankTransfer: BankTransferDisplay
}

/**
 * 그림·신청서 전송 직후: 짧은 완료 뒤, **결제 안내**를 강조.
 */
export function ApplyPaymentView({ tier, reportId, bankTransfer }: Props) {
  const [copied, setCopied] = useState(false)
  const [copyLinkBusy, setCopyLinkBusy] = useState(false)

  const isPaidTier = tier === 'discount' || tier === 'normal'
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
        {isPaidTier ? (
          <h1 className="mx-auto mt-3 max-w-md text-base font-bold leading-[1.65] tracking-tight text-[#2F3D2E] sm:text-lg">
            아이의 마음을 살펴볼 준비가 끝났어요. 리포트를 받으시려면 아래에서 결제를 이어가 주세요.
          </h1>
        ) : (
          <h1 className="mx-auto mt-3 max-w-md text-base font-bold leading-[1.65] tracking-tight text-[#2F3D2E] sm:text-lg">
            아이의 마음을 살펴볼 준비가 끝났어요. 별도 결제 없이 곧 이메일로 리포트 안내를 보내드릴게요.
          </h1>
        )}
        <p className="mx-auto mt-4 max-w-md text-sm leading-[1.85] text-[#6B6B6B]">
          신청서와 그림이 안전하게 전달됐어요. 요금 구간에 맞는 안내를 아래에서 확인해 주세요.
        </p>
      </header>

      <PaymentSection emphasis tier={tier} reportId={reportId} bankTransfer={bankTransfer} />

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
