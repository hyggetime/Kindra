'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'

import { saveBankDepositorName } from '@app/actions/save-bank-depositor'
import { IntakeTossPaymentsWidgetSection } from '@app/intake/success/IntakeTossPaymentsWidgetSection'
import { CheckoutAnimatedPrice } from '@/components/payment/CheckoutAnimatedPrice'
import { LaunchPricingCallout } from '@/components/pricing/LaunchPricingCallout'
import { PaymentCouponPanel } from '@/components/payment/PaymentCouponPanel'
import { isPaymentHideBankTransferEnabled } from '@lib/payment/hide-bank-transfer-env'
import { isPaymentShowTossWidgetEnabled } from '@lib/payment/show-toss-widget-env'
import type { BankTransferDisplay } from '@lib/payment/bank-transfer'
import { isTossPaymentsConfigured } from '@lib/payment/toss-payments-config'

type Props = {
  listedPriceWon: number
  reportId: string | null
  bankTransfer: BankTransferDisplay
  /** `/apply/payment` 등에서 결제 UI를 시각적으로 더 강조 */
  emphasis?: boolean
  /** 서버가 읽은 무통장 블록 숨김 플래그 */
  hideBankTransferUi?: boolean
}

function PaymentMandatoryConsents({
  idSuffix,
  agreeDigitalNoRefund,
  agreeGuardianCollect,
  onDigital,
  onGuardian,
}: {
  idSuffix: string
  agreeDigitalNoRefund: boolean
  agreeGuardianCollect: boolean
  onDigital: (v: boolean) => void
  onGuardian: (v: boolean) => void
}) {
  return (
    <div
      className="rounded-xl border border-[#D4E0D0] bg-[#FAFAF8]/95 px-4 py-4 text-left text-[11px] leading-relaxed text-[#4A4A4A] sm:text-xs"
      role="group"
      aria-labelledby={`payment-consents-heading-${idSuffix}`}
    >
      <p id={`payment-consents-heading-${idSuffix}`} className="font-semibold text-[#3D3D3D]">
        결제 전 필수 동의
      </p>
      <ul className="mt-3 list-none space-y-3.5 p-0">
        <li className="flex gap-3">
          <input
            id={`consent-digital-refund-${idSuffix}`}
            type="checkbox"
            checked={agreeDigitalNoRefund}
            onChange={(e) => onDigital(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#C8C4BC] text-[#7C9070] focus:ring-[#7C9070]/30"
          />
          <label htmlFor={`consent-digital-refund-${idSuffix}`} className="cursor-pointer select-none">
            (필수) 결제 완료와 동시에 맞춤형 AI 분석이 즉시 시작되므로, 디지털 콘텐츠 특성상 환불이 불가능함에 동의합니다.
          </label>
        </li>
        <li className="flex gap-3">
          <input
            id={`consent-guardian-${idSuffix}`}
            type="checkbox"
            checked={agreeGuardianCollect}
            onChange={(e) => onGuardian(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#C8C4BC] text-[#7C9070] focus:ring-[#7C9070]/30"
          />
          <label htmlFor={`consent-guardian-${idSuffix}`} className="cursor-pointer select-none">
            (필수) 나는 만 14세 미만 아동의 법정대리인이며, 서비스 이용을 위한 정보 수집에 동의합니다.
          </label>
        </li>
      </ul>
    </div>
  )
}

/** 결제 안내 상단 부제(무통장 입금 문구 제외) */
function paymentSubtitle(showTossUi: boolean): string {
  if (showTossUi) return '카드·간편결제'
  return '입금 안내'
}

/**
 * 토스 결제창 + (선택) 무통장 입금 + 입금자명 저장.
 */
export function PaymentSection({
  listedPriceWon,
  reportId,
  bankTransfer,
  emphasis = false,
  hideBankTransferUi: hideBankTransferUiProp,
}: Props) {
  const [depositor, setDepositor] = useState('')
  const [formMsg, setFormMsg] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [accountCopied, setAccountCopied] = useState(false)
  const [accountCopyBusy, setAccountCopyBusy] = useState(false)
  const [pending, startTransition] = useTransition()
  const saveLockRef = useRef(false)
  const [checkoutWon, setCheckoutWon] = useState(listedPriceWon)
  const [agreeDigitalNoRefund, setAgreeDigitalNoRefund] = useState(false)
  const [agreeGuardianCollect, setAgreeGuardianCollect] = useState(false)
  const [couponInput, setCouponInput] = useState('')
  const paymentConsentsOk = agreeDigitalNoRefund && agreeGuardianCollect

  useEffect(() => {
    setCheckoutWon(listedPriceWon)
  }, [listedPriceWon])

  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => setToast(null), 2800)
    return () => window.clearTimeout(id)
  }, [toast])

  const tossKeysConfigured = useMemo(() => isTossPaymentsConfigured(), [])
  const showTossUi = tossKeysConfigured && isPaymentShowTossWidgetEnabled()

  const copyAccountNumber = useCallback(async () => {
    if (accountCopyBusy) return
    setAccountCopyBusy(true)
    try {
      await navigator.clipboard.writeText(bankTransfer.accountNo)
      setAccountCopied(true)
      window.setTimeout(() => setAccountCopied(false), 2200)
    } catch {
      setAccountCopied(false)
    } finally {
      window.setTimeout(() => setAccountCopyBusy(false), 500)
    }
  }, [bankTransfer.accountNo, accountCopyBusy])

  const hasReport = Boolean(reportId)

  const hideBankForTossFocus =
    showTossUi && (hideBankTransferUiProp === true || isPaymentHideBankTransferEnabled())

  const onSaveDepositor = useCallback(() => {
    if (!reportId || saveLockRef.current) return
    if (!paymentConsentsOk) {
      setFormMsg('무통장 입금을 이어가시려면 아래 필수 동의에 체크해 주세요.')
      return
    }
    setFormMsg(null)
    saveLockRef.current = true
    startTransition(() => {
      void saveBankDepositorName(reportId, depositor, couponInput.trim())
        .then((r) => {
          if (r.ok) {
            setToast('입금자명이 저장되었습니다.')
            return
          }
          setFormMsg(r.message)
        })
        .finally(() => {
          saveLockRef.current = false
        })
    })
  }, [couponInput, depositor, paymentConsentsOk, reportId])

  const idSuffix = emphasis ? 'pay' : 'ok'

  const bankCard = (
    <div className="rounded-2xl border border-[#E8E4DC] bg-white/90 px-5 py-6 shadow-inner">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#7C9070]">무통장 입금 안내</p>
      <CheckoutAnimatedPrice listedPriceWon={listedPriceWon} amountWon={checkoutWon} variant="bank" />

      <dl className="mt-4 space-y-3 text-sm text-[#4A4A4A]">
        <div className="flex justify-between gap-3 border-t border-[#F0EBE3] pt-3">
          <dt className="shrink-0 text-[#8A8A8A]">은행</dt>
          <dd className="text-right font-medium">{bankTransfer.bankName}</dd>
        </div>
        <div className="flex flex-col gap-2 border-t border-[#F0EBE3] pt-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <dt className="shrink-0 text-[#8A8A8A]">계좌번호</dt>
          <dd className="flex flex-wrap items-center justify-end gap-2 sm:min-w-0">
            <span className="font-mono text-[0.95rem] font-semibold tabular-nums">{bankTransfer.accountNo}</span>
            <button
              type="button"
              onClick={() => void copyAccountNumber()}
              disabled={accountCopyBusy}
              className="shrink-0 rounded-lg border border-[#D4DED0] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#4F6048] transition hover:bg-[#F4F7F2] disabled:opacity-50"
            >
              {accountCopied ? '복사됨' : accountCopyBusy ? '…' : '복사하기'}
            </button>
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-[#8A8A8A]">예금주</dt>
          <dd className="font-medium">{bankTransfer.holder}</dd>
        </div>
      </dl>

      <p className="mt-4 text-xs leading-relaxed text-[#9A9A9A]">
        입금 시 <span className="font-semibold text-[#5A5A5A]">입금자명</span>을 아래에 적어 주시면 확인이 빨라져요.
      </p>
    </div>
  )

  const depositorOrWarn =
    hasReport ? (
      <div className="rounded-2xl border border-[#D4E0D0] bg-[#FDFBF9] px-5 py-5">
        <label htmlFor={`bank-depositor-${idSuffix}`} className="block text-xs font-semibold text-[#5A6F52]">
          입금자명 (송금인 표기와 동일하게)
        </label>
        <input
          id={`bank-depositor-${idSuffix}`}
          type="text"
          value={depositor}
          onChange={(e) => {
            setDepositor(e.target.value)
            setFormMsg(null)
          }}
          maxLength={80}
          autoComplete="name"
          placeholder="예: 홍길동"
          disabled={pending}
          className="mt-2 w-full rounded-xl border border-[#E8E4DC] bg-white px-4 py-3 text-sm text-[#3D3D3D] outline-none ring-[#7C9070]/20 focus:border-[#7C9070]/40 focus:ring-2 disabled:opacity-60"
        />
        <button
          type="button"
          disabled={pending || !depositor.trim() || !paymentConsentsOk}
          onClick={() => onSaveDepositor()}
          className="mt-3 w-full rounded-full bg-[#7C9070] py-3 text-sm font-semibold text-white shadow-[0_6px_20px_-6px_rgba(124,144,112,0.5)] transition hover:bg-[#687D5D] disabled:opacity-50"
        >
          {pending ? '저장 중…' : '입금자명 저장'}
        </button>
        {formMsg ? (
          <p className="mt-3 text-center text-xs leading-relaxed text-[#B85C5C]" role="alert">
            {formMsg}
          </p>
        ) : null}
      </div>
    ) : (
      <p className="rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-center text-xs leading-relaxed text-amber-950">
        이 화면 주소에 리포트 식별자가 없어 입금자명을 여기서 저장할 수 없어요. 신청을 마친 직후 열린 페이지이거나, 주소
        끝이 잘렸을 수 있어요. 같은 이메일로 다시 신청하거나 문의해 주세요.
      </p>
    )

  const bankFirstBanner = !showTossUi ? (
    tossKeysConfigured ? (
      <div
        className="rounded-xl border border-[#D4E0D0] bg-[#F4F7F2]/90 px-4 py-3 text-sm leading-relaxed text-[#3D4A38]"
        role="status"
      >
        심사·테스트 준비 기간에는 카드·간편결제 창을 잠시 숨겨두었어요. 아래 무통장 입금으로 결제를 이어가 주시면 확인 후
        리포트를 보내드릴게요.
      </div>
    ) : (
      <div
        className="rounded-xl border border-[#D4E0D0] bg-[#F4F7F2]/90 px-4 py-3 text-sm leading-relaxed text-[#3D4A38]"
        role="status"
      >
        카드·간편결제는 곧 오픈할 예정이에요. 지금은 아래 무통장 입금으로 결제를 진행해 주시면 바로 확인해 드릴게요.
      </div>
    )
  ) : null

  const bankFoldedHint = (
    <div className="rounded-xl border border-dashed border-[#D4DED0] bg-[#FAFAF8]/80 px-4 py-3 text-left text-sm leading-relaxed text-[#8A8A8A]">
      무통장 입금 안내와 입금자명 입력은 위 <span className="font-semibold text-[#5A5A5A]">필수 동의</span>를 모두
      완료하신 뒤 이용하실 수 있어요.
    </div>
  )

  const bankFoldable = (
    <div className="space-y-4">
      {bankCard}
      {toast ? (
        <div className="flex justify-center sm:justify-start" role="status" aria-live="polite">
          <p className="max-w-[min(100%,22rem)] rounded-full border border-[#D4E0D0] bg-[#2F3D2E] px-5 py-2.5 text-center text-sm font-medium text-white shadow-[0_8px_24px_-8px_rgba(0,0,0,0.28)]">
            {toast}
          </p>
        </div>
      ) : null}
      {depositorOrWarn}
    </div>
  )

  const tossBlock = (
    <IntakeTossPaymentsWidgetSection
      secondaryPlacement={!tossKeysConfigured}
      listedPriceWon={listedPriceWon}
      reportId={reportId}
      couponInput={couponInput}
      onResolvedAmount={setCheckoutWon}
      agreeDigitalNoRefund={agreeDigitalNoRefund}
      agreeGuardianCollect={agreeGuardianCollect}
    />
  )

  const sharedAfterLaunch = (
    <>
      <div
        className="rounded-xl border border-[#E8DFD0] bg-[#FDF9F3] px-4 py-3 text-[11px] leading-relaxed text-[#5A4A3A] sm:text-xs"
        role="note"
      >
        <p className="font-semibold text-[#3D3D3D]">디지털 콘텐츠(맞춤 리포트) · 환불 안내</p>
        <p className="mt-1.5">
          본 서비스의 리포트는 이용자의 신청에 따라 <strong>개별 제작되는 디지털 콘텐츠</strong>에 해당할 수
          있습니다. 「전자상거래 등에서의 소비자보호에 관한 법률」 제17조 제2항에 의거,{' '}
          <strong>분석이 시작되거나 리포트가 발송된 이후에는 청약철회 및 환불이 불가능합니다.</strong> 카드·간편결제
          등 전자결제는 <strong>결제 완료와 동시에 맞춤형 AI 분석이 즉시 시작</strong>될 수 있어, 그 이후 단계에서의
          청약철회가 제한됩니다. 무통장 입금은 입금 확인 후 분석이 개시될 수 있습니다. 진행 전에{' '}
          <Link href="/terms" className="font-semibold text-[#5A6F52] underline underline-offset-2">
            이용약관
          </Link>
          의 요금·환불 조항을 함께 확인해 주세요.
        </p>
      </div>

      <LaunchPricingCallout compact className="scroll-mt-4" />

      <PaymentMandatoryConsents
        idSuffix={idSuffix}
        agreeDigitalNoRefund={agreeDigitalNoRefund}
        agreeGuardianCollect={agreeGuardianCollect}
        onDigital={setAgreeDigitalNoRefund}
        onGuardian={setAgreeGuardianCollect}
      />

      <PaymentCouponPanel
        listedPriceWon={listedPriceWon}
        reportId={reportId}
        value={couponInput}
        onChange={setCouponInput}
        onResolvedAmount={setCheckoutWon}
      />
    </>
  )

  const body = (
    <>
      {emphasis ? null : (
        <p className="mx-auto mt-6 max-w-lg text-left text-sm leading-[1.95] text-[#5A5A5A]">
          신청이 접수됐어요. 결제를 이어가 주시면 확인 후 리포트를 준비해 드려요.
        </p>
      )}

      <div className={`mx-auto text-left ${emphasis ? 'max-w-lg' : 'mt-8 max-w-md'} space-y-6`}>
        {sharedAfterLaunch}

        {showTossUi ? tossBlock : null}

        {!showTossUi ? bankFirstBanner : null}

        {showTossUi && !hideBankForTossFocus ? (
          paymentConsentsOk ? (
            bankFoldable
          ) : (
            bankFoldedHint
          )
        ) : !showTossUi ? (
          paymentConsentsOk ? (
            bankFoldable
          ) : (
            bankFoldedHint
          )
        ) : null}
      </div>
    </>
  )

  if (emphasis) {
    return (
      <section
        className="rounded-3xl border-2 border-[#7C9070]/20 bg-gradient-to-b from-white via-[#F9FBF7] to-[#F4F7F2]/80 p-5 shadow-[0_20px_56px_-24px_rgba(60,80,55,0.28)] sm:p-8"
        aria-labelledby="payment-section-heading"
      >
        <div className="text-center">
          <h2
            id="payment-section-heading"
            className="text-xl font-bold tracking-tight text-[#2F3D2E] sm:text-2xl"
          >
            결제 안내
          </h2>
          <p className="mt-1.5 text-xs font-medium uppercase tracking-[0.12em] text-[#5A6F52]/90">
            {paymentSubtitle(showTossUi)}
          </p>
        </div>
        <div className="mt-6 sm:mt-7">{body}</div>
      </section>
    )
  }

  return <div className="mx-auto max-w-md text-left">{body}</div>
}
