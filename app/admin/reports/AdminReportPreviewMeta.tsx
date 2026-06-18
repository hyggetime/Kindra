import Link from 'next/link'
import type { ReactNode } from 'react'

import {
  channelToneClass,
  emailDeliveryDisplayLabel,
  emailDeliveryToneClass,
  reportChannelDisplayLabel,
} from '@lib/admin/report-admin-display'
import { formatPriceWon } from '@lib/constants'

const dateFmt = new Intl.DateTimeFormat('ko-KR', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export type AdminReportPreviewMetaProps = {
  reportId: string
  adminPw: string
  channel: string | null
  status: string | null
  emailDeliveryError: string | null
  emailDeliveryUpdatedAt: string | null
  resendEmailId: string | null
  isSent: boolean
  listedPriceWon: number
  chargedAmountWon: number | null
  tossPaymentKey: string | null
  depositConfirmed: boolean
  createdAt: string | null
  parentEmail: string
}

export function AdminReportPreviewMeta({
  reportId,
  adminPw,
  channel,
  status,
  emailDeliveryError,
  emailDeliveryUpdatedAt,
  resendEmailId,
  isSent,
  listedPriceWon,
  chargedAmountWon,
  tossPaymentKey,
  depositConfirmed,
  createdAt,
  parentEmail,
}: AdminReportPreviewMetaProps) {
  const emailUi = emailDeliveryDisplayLabel(status, { emailError: emailDeliveryError, isSent })
  const listHref = `/admin/reports?pw=${encodeURIComponent(adminPw)}`

  return (
    <div className="border-b border-[#E8E4DC] bg-[#FDFBF9]">
      <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7C9070]">
              관리자 미리보기
            </p>
            <h1 className="mt-1 text-base font-bold text-[#2F3D2E] sm:text-lg">리포트 상세</h1>
          </div>
          <Link
            href={listHref}
            className="rounded-lg border border-[#D4DED0] bg-white px-3 py-1.5 text-xs font-semibold text-[#4F6048] transition hover:bg-[#F4F7F2]"
          >
            ← 목록으로
          </Link>
        </div>

        <dl className="mt-4 grid gap-3 rounded-xl border border-[#E8E4DC] bg-white p-4 text-sm sm:grid-cols-2">
          <MetaItem label="리포트 ID" value={reportId} mono />
          <MetaItem label="생성일" value={createdAt ? dateFmt.format(new Date(createdAt)) : '—'} />
          <MetaItem label="부모 이메일" value={parentEmail} />
          <MetaItem label="인입 경로">
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${channelToneClass(channel)}`}
            >
              {reportChannelDisplayLabel(channel)}
            </span>
          </MetaItem>
          <MetaItem label="이메일 상태">
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${emailDeliveryToneClass(emailUi.tone)}`}
            >
              {emailUi.text}
            </span>
            {emailUi.detail ? (
              <span className="mt-1 block text-xs text-[#8A8A8A]">{emailUi.detail}</span>
            ) : null}
            {emailUi.tone === 'error' && emailDeliveryError ? (
              <span className="mt-1 block text-xs leading-relaxed text-[#8A3030]">{emailDeliveryError}</span>
            ) : null}
          </MetaItem>
          <MetaItem
            label="시스템 status"
            value={status ?? '—'}
            mono
            hint="결제·분석·이메일 통합 상태 코드"
          />
          <MetaItem
            label="청구액"
            value={
              chargedAmountWon != null
                ? formatPriceWon(chargedAmountWon)
                : `미결제 (기준 ${formatPriceWon(listedPriceWon)})`
            }
          />
          <MetaItem
            label="결제"
            value={
              tossPaymentKey
                ? '카드·간편결제'
                : depositConfirmed
                  ? '무통장 입금 확인'
                  : '미결제'
            }
          />
          {resendEmailId ? <MetaItem label="Resend email_id" value={resendEmailId} mono /> : null}
          {emailDeliveryUpdatedAt ? (
            <MetaItem
              label="이메일 상태 갱신"
              value={dateFmt.format(new Date(emailDeliveryUpdatedAt))}
            />
          ) : null}
        </dl>
      </div>
    </div>
  )
}

function MetaItem({
  label,
  value,
  children,
  mono,
  hint,
}: {
  label: string
  value?: string
  children?: ReactNode
  mono?: boolean
  hint?: string
}) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#8A8A8A]">{label}</dt>
      <dd className={`mt-1 text-[#3D3D3D] ${mono ? 'font-mono text-xs break-all' : ''}`}>
        {children ?? value}
      </dd>
      {hint ? <p className="mt-0.5 text-[10px] text-[#B0B0B0]">{hint}</p> : null}
    </div>
  )
}
