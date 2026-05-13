'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'

import { saveBankDepositorName } from '@app/actions/save-bank-depositor'
import { REPORT_EMAIL_SLA_MAX_PHRASE } from '@lib/copy/report-email-sla'
import { formatPriceWon } from '@lib/constants'
import { isPaymentHideBankTransferEnabled } from '@lib/payment/hide-bank-transfer-env'
import type { BankTransferDisplay } from '@lib/payment/bank-transfer'
import { isTossPaymentsConfigured } from '@lib/payment/toss-payments-config'

import { IntakeTossPaymentsWidgetSection } from '@app/intake/success/IntakeTossPaymentsWidgetSection'

type Props = {
  listedPriceWon: number
  reportId: string | null
  bankTransfer: BankTransferDisplay
  /** `/apply/payment` 등에서 결제 UI를 시각적으로 더 강조 */
  emphasis?: boolean
  /** 서버가 읽은 무통장 블록 숨김 플래그 */
  hideBankTransferUi?: boolean
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
  const [formOk, setFormOk] = useState(false)
  const [accountCopied, setAccountCopied] = useState(false)
  const [accountCopyBusy, setAccountCopyBusy] = useState(false)
  const [pending, startTransition] = useTransition()
  const saveLockRef = useRef(false)
  const [checkoutWon, setCheckoutWon] = useState(listedPriceWon)

  useEffect(() => {
    setCheckoutWon(listedPriceWon)
  }, [listedPriceWon])

  const tossConfigured = useMemo(() => isTossPaymentsConfigured(), [])

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

  /**
   * 토스 클라이언트 키가 있을 때만 무통장을 숨길 수 있음(토스 없으면 무통장만 안내).
   * prop 또는 env 중 하나라도 켜면 숨김 — 느슨한 파싱은 `isPaymentHideBankTransferEnabled`.
   */
  const hideBankForTossFocus =
    tossConfigured &&
    (hideBankTransferUiProp === true || isPaymentHideBankTransferEnabled())

  const onSaveDepositor = useCallback(() => {
    if (!reportId || saveLockRef.current) return
    setFormMsg(null)
    setFormOk(false)
    saveLockRef.current = true
    startTransition(() => {
      void saveBankDepositorName(reportId, depositor)
        .then((r) => {
          if (r.ok) {
            setFormOk(true)
            setFormMsg('입금자명이 저장되었어요.')
            return
          }
          setFormMsg(r.message)
        })
        .finally(() => {
          saveLockRef.current = false
        })
    })
  }, [reportId, depositor])

  const idSuffix = emphasis ? 'pay' : 'ok'

  const bankCard = (
    <div className="rounded-2xl border border-[#E8E4DC] bg-white/90 px-5 py-6 shadow-inner">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#7C9070]">무통장 입금 안내</p>
      <p className="mt-3 text-lg font-bold tabular-nums text-[#4F6048]">{formatPriceWon(checkoutWon)}</p>
      {listedPriceWon !== checkoutWon ? (
        <p className="mt-1 text-xs leading-relaxed text-[#8A8A8A]">
          정상가 {formatPriceWon(listedPriceWon)}에서 쿠폰 할인을 반영한 금액이에요.
        </p>
      ) : null}

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
            setFormOk(false)
          }}
          maxLength={80}
          autoComplete="name"
          placeholder="예: 홍길동"
          disabled={pending}
          className="mt-2 w-full rounded-xl border border-[#E8E4DC] bg-white px-4 py-3 text-sm text-[#3D3D3D] outline-none ring-[#7C9070]/20 focus:border-[#7C9070]/40 focus:ring-2 disabled:opacity-60"
        />
        <button
          type="button"
          disabled={pending || !depositor.trim()}
          onClick={() => onSaveDepositor()}
          className="mt-3 w-full rounded-full bg-[#7C9070] py-3 text-sm font-semibold text-white shadow-[0_6px_20px_-6px_rgba(124,144,112,0.5)] transition hover:bg-[#687D5D] disabled:opacity-50"
        >
          {pending ? '저장 중…' : '입금자명 저장'}
        </button>
        {formMsg ? (
          <p
            className={`mt-3 text-center text-xs leading-relaxed ${formOk ? 'text-[#4F6048]' : 'text-[#B85C5C]'}`}
          >
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

  const bankFirstBanner = !tossConfigured ? (
    <div
      className="rounded-xl border border-[#D4E0D0] bg-[#F4F7F2]/90 px-4 py-3 text-sm leading-relaxed text-[#3D4A38]"
      role="status"
    >
      카드·간편결제는 곧 오픈할 예정이에요. 지금은 아래 무통장 입금으로 결제를 진행해 주시면 바로 확인해 드릴게요.
    </div>
  ) : null

  const tossBlock = (
    <IntakeTossPaymentsWidgetSection
      secondaryPlacement={!tossConfigured}
      listedPriceWon={listedPriceWon}
      reportId={reportId}
      onResolvedAmount={setCheckoutWon}
    />
  )

  const body = (
    <>
      {emphasis ? null : (
        <p className="mx-auto mt-6 max-w-lg text-sm leading-[1.95] text-[#5A5A5A]">
          신청이 접수됐어요. 아래에서 카드·간편결제 또는 무통장 입금으로 결제를 이어가 주시면, 확인 후 리포트를
          보내드릴게요. (이메일 발송은 {REPORT_EMAIL_SLA_MAX_PHRASE}를 목표로 해요.)
        </p>
      )}

      <div className={`mx-auto text-left ${emphasis ? 'max-w-lg' : 'mt-8 max-w-md'} space-y-6`}>
        {emphasis && tossConfigured && !hideBankForTossFocus ? (
          <p className="text-sm leading-[1.85] text-[#5A5A5A]">
            신청이 접수됐어요. 아래에서 카드·간편결제 또는 무통장으로 결제를 이어가 주시면 확인 후 리포트를 보내드릴게요.
            (이메일 발송은 {REPORT_EMAIL_SLA_MAX_PHRASE}를 목표로 해요.)
          </p>
        ) : null}
        {emphasis && tossConfigured && hideBankForTossFocus ? (
          <p className="text-sm leading-[1.85] text-[#5A5A5A]">
            신청이 접수됐어요. 아래에서 카드·간편결제로 결제를 이어가 주시면 확인 후 리포트를 보내드릴게요. (이메일 발송은{' '}
            {REPORT_EMAIL_SLA_MAX_PHRASE}를 목표로 해요.)
          </p>
        ) : null}
        {emphasis && !tossConfigured ? (
          <p className="text-sm leading-[1.85] text-[#5A5A5A]">
            감사해요. 아래 무통장 입금으로 결제를 이어가 주시면, 확인 후 리포트를 보내드릴게요. (이메일 발송은{' '}
            {REPORT_EMAIL_SLA_MAX_PHRASE}를 목표로 해요.) 화면이 비어 보인다면 잠시 후 새로고침해 주세요.
          </p>
        ) : null}

        <div
          className="rounded-xl border border-[#E8DFD0] bg-[#FDF9F3] px-4 py-3 text-[11px] leading-relaxed text-[#5A4A3A] sm:text-xs"
          role="note"
        >
          <p className="font-semibold text-[#3D3D3D]">디지털 콘텐츠(맞춤 리포트) · 환불 안내</p>
          <p className="mt-1.5">
            본 서비스는 이용자 맞춤형 <strong>디지털 콘텐츠</strong>에 해당할 수 있습니다.{' '}
            <strong>분석이 시작된 이후</strong> 또는 <strong>리포트가 제공된 이후</strong>에는 관련 법령에 따라{' '}
            <strong>청약철회가 제한</strong>될 수 있고, <strong>환불이 어려울 수 있어요.</strong> 결제를 진행하기 전에{' '}
            <Link href="/terms" className="font-semibold text-[#5A6F52] underline underline-offset-2">
              이용약관
            </Link>
            의 요금·환불 조항을 확인해 주세요.
          </p>
        </div>

        {tossConfigured ? (
          <>
            {tossBlock}
            {!hideBankForTossFocus && bankCard}
            {!hideBankForTossFocus && depositorOrWarn}
          </>
        ) : (
          <>
            {bankFirstBanner}
            {tossBlock}
            {bankCard}
            {depositorOrWarn}
          </>
        )}
      </div>
    </>
  )

  if (emphasis) {
    return (
      <section
        className="rounded-3xl border-2 border-[#7C9070]/20 bg-gradient-to-b from-white via-[#F9FBF7] to-[#F4F7F2]/80 p-5 shadow-[0_20px_56px_-24px_rgba(60,80,55,0.28)] sm:p-8"
        aria-labelledby="payment-section-heading"
      >
        <div className="text-center sm:text-left">
          <h2
            id="payment-section-heading"
            className="text-xl font-bold tracking-tight text-[#2F3D2E] sm:text-2xl"
          >
            결제 안내
          </h2>
          <p className="mt-1.5 text-xs font-medium uppercase tracking-[0.12em] text-[#5A6F52]/90">
            {hideBankForTossFocus ? '카드·간편결제' : '카드·간편결제 · 무통장 입금'}
          </p>
        </div>
        <div className="mt-6 sm:mt-7">{body}</div>
      </section>
    )
  }

  return <div className="text-center">{body}</div>
}
