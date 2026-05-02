'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCallback, useMemo, useRef, useState, useTransition } from 'react'

import { saveBankDepositorName } from '@app/actions/save-bank-depositor'
import type { PriceTier } from '@lib/constants'
import { DISCOUNT_PRICE_WON, NORMAL_PRICE_WON } from '@lib/constants'
import type { BankTransferDisplay } from '@lib/payment/bank-transfer'
import { isTossPaymentsWidgetConfigured } from '@lib/payment/toss-payments-config'

import { IntakeTossPaymentsWidgetSection } from '@app/intake/success/IntakeTossPaymentsWidgetSection'

type Props = {
  tier: PriceTier
  reportId: string | null
  bankTransfer: BankTransferDisplay
  /** `/apply/payment` 등에서 결제 UI를 시각적으로 더 강조 */
  emphasis?: boolean
}

/**
 * 토스 위젯 안내 + 무통장 입금 + 입금자명 저장.
 * `kindra_reports` 와 `tier`·`report` 쿼리는 신청 직후 결제 안내에 사용합니다.
 */
export function PaymentSection({ tier, reportId, bankTransfer, emphasis = false }: Props) {
  const searchParams = useSearchParams()
  const [depositor, setDepositor] = useState('')
  const [formMsg, setFormMsg] = useState<string | null>(null)
  const [formOk, setFormOk] = useState(false)
  const [showLoginCta, setShowLoginCta] = useState(false)
  const [accountCopied, setAccountCopied] = useState(false)
  const [accountCopyBusy, setAccountCopyBusy] = useState(false)
  const [pending, startTransition] = useTransition()
  const saveLockRef = useRef(false)

  const tossConfigured = useMemo(() => isTossPaymentsWidgetConfigured(), [])

  const loginNext = useMemo(() => {
    const q = new URLSearchParams()
    const t = searchParams.get('tier')
    const r = searchParams.get('report')
    if (t === 'discount' || t === 'normal' || t === 'free') q.set('tier', t)
    else q.set('tier', tier)
    if (r && /^[0-9a-f-]{36}$/i.test(r)) q.set('report', r)
    else if (reportId) q.set('report', reportId)
    return `/apply/payment?${q.toString()}`
  }, [searchParams, tier, reportId])

  const loginHref = `/auth/login?reason=login_required&next=${encodeURIComponent(loginNext)}`

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

  const isFree = tier === 'free'
  const isPaid = tier === 'discount' || tier === 'normal'
  const hasReport = Boolean(reportId)

  const onSaveDepositor = useCallback(() => {
    if (!reportId || saveLockRef.current) return
    setFormMsg(null)
    setFormOk(false)
    setShowLoginCta(false)
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
          setShowLoginCta(Boolean(r.needAuth))
        })
        .finally(() => {
          saveLockRef.current = false
        })
    })
  }, [reportId, depositor])

  const idSuffix = emphasis ? 'pay' : 'ok'

  if (isFree) {
    return (
      <div
        className={
          emphasis
            ? 'rounded-2xl border border-[#C8D6C4] bg-gradient-to-b from-white to-[#F7FAF5]/90 px-5 py-6 text-center shadow-[0_12px_40px_-20px_rgba(60,80,55,0.2)] sm:px-8 sm:py-8'
            : 'text-center'
        }
      >
        {emphasis ? (
          <p className="text-xs font-semibold uppercase tracking-wide text-[#5A6F52]">요금 안내</p>
        ) : null}
        <p className="mx-auto max-w-lg text-sm leading-[1.95] text-[#5A5A5A]">
          선착순 무료 분석 대상이에요. 24시간 내로 이메일로 리포트를 보내드릴게요. 솔직한 의견도 함께 나눠 주시면
          감사하겠습니다.
        </p>
      </div>
    )
  }

  const bankCard = (
    <div className="rounded-2xl border border-[#E8E4DC] bg-white/90 px-5 py-6 shadow-inner">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#7C9070]">무통장 입금 안내</p>
      <p className="mt-3 text-lg font-bold tabular-nums text-[#4F6048]">
        {tier === 'discount'
          ? `${DISCOUNT_PRICE_WON.toLocaleString('ko-KR')}원`
          : `${NORMAL_PRICE_WON.toLocaleString('ko-KR')}원`}
      </p>

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
        입금 시 <span className="font-semibold text-[#5A5A5A]">입금자명</span>을 아래에 적어 주시면 확인이 빨라져요. (신청
        시 이메일로 로그인한 뒤 저장할 수 있어요.)
      </p>
    </div>
  )

  const depositorOrWarn =
    isPaid && hasReport ? (
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
            setShowLoginCta(false)
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
            {formMsg}{' '}
            {showLoginCta ? (
              <Link href={loginHref} className="font-semibold underline underline-offset-2">
                로그인하기
              </Link>
            ) : null}
          </p>
        ) : null}
      </div>
    ) : isPaid && !hasReport ? (
      <p className="rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-center text-xs leading-relaxed text-amber-950">
        이 화면 주소에 리포트 식별자가 없어 입금자명을 여기서 저장할 수 없어요. 신청을 마친 직후 열린 페이지이거나, 주소
        끝이 잘렸을 수 있어요. 같은 이메일로 다시 신청하거나 문의해 주세요.
      </p>
    ) : null

  const bankFirstBanner = !tossConfigured ? (
    <div
      className="rounded-xl border border-[#D4E0D0] bg-[#F4F7F2]/90 px-4 py-3 text-sm leading-relaxed text-[#3D4A38]"
      role="status"
    >
      카드·간편결제는 곧 오픈할 예정이에요. 지금은 아래 무통장 입금으로 결제를 진행해 주시면 바로 확인해 드릴게요.
    </div>
  ) : null

  const tossBlock = <IntakeTossPaymentsWidgetSection secondaryPlacement={!tossConfigured} />

  const body = (
    <>
      {emphasis ? null : (
        <p className="mx-auto mt-6 max-w-lg text-sm leading-[1.95] text-[#5A5A5A]">
          유료 구간으로 접수됐어요. 카드·간편결제 위젯을 연결할 예정이에요. 지금은 무통장 입금으로 결제해 주시면, 확인 후
          리포트를 보내드릴게요.
        </p>
      )}

      <div className={`mx-auto text-left ${emphasis ? 'max-w-lg' : 'mt-8 max-w-md'} space-y-6`}>
        {emphasis && tossConfigured ? (
          <p className="text-sm leading-[1.85] text-[#5A5A5A]">
            유료 구간으로 접수됐어요. 아래에서 결제를 이어가 주시면 확인 후 리포트를 보내드릴게요. (카드·간편결제는 연동
            준비 중이에요.)
          </p>
        ) : null}
        {emphasis && !tossConfigured ? (
          <p className="text-sm leading-[1.85] text-[#5A5A5A]">
            감사해요. 아래 무통장 입금으로 결제를 이어가 주시면, 확인 후 리포트를 보내드릴게요. 화면이 비어 보인다면 잠시
            후 새로고침해 주세요.
          </p>
        ) : null}

        {tossConfigured ? (
          <>
            {tossBlock}
            {bankCard}
            {depositorOrWarn}
          </>
        ) : (
          <>
            {bankFirstBanner}
            {bankCard}
            {depositorOrWarn}
            {tossBlock}
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
            카드·간편결제(준비 중) · 무통장 입금
          </p>
        </div>
        <div className="mt-6 sm:mt-7">{body}</div>
      </section>
    )
  }

  return <div className="text-center">{body}</div>
}
