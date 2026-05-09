'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState, useTransition } from 'react'

import { formatPriceWon } from '@lib/constants'

import { updateKindraReportDepositConfirmed, updateKindraReportIsSent } from './actions'
import type { AdminReportRowVm } from './types'

type Props = {
  rows: AdminReportRowVm[]
  adminPw: string
  origin: string
}

const dateFmt = new Intl.DateTimeFormat('ko-KR', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function reportUrl(origin: string, id: string) {
  return `${origin.replace(/\/$/, '')}/reports/${id}`
}

function adminPreviewUrl(origin: string, id: string, adminPw: string) {
  const o = origin.replace(/\/$/, '')
  return `${o}/admin/reports/preview/${id}?pw=${encodeURIComponent(adminPw)}`
}

export function AdminReportsTable({ rows, adminPw, origin }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyLink = useCallback(
    async (id: string) => {
      const url = reportUrl(origin, id)
      try {
        await navigator.clipboard.writeText(url)
        setCopiedId(id)
        window.setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 2000)
      } catch {
        setCopiedId(null)
      }
    },
    [origin],
  )

  const [blockHint, setBlockHint] = useState<string | null>(null)

  const onSentChange = useCallback(
    (id: string, checked: boolean) => {
      setBlockHint(null)
      startTransition(() => {
        void updateKindraReportIsSent(adminPw, id, checked).then((r) => {
          if (r.ok) {
            router.refresh()
            return
          }
          if (r.reason === 'deposit_required') {
            setBlockHint('카드 결제 완료 또는 무통장 입금 확인을 먼저 처리한 뒤 발송 완료를 표시할 수 있어요.')
          }
        })
      })
    },
    [adminPw, router],
  )

  const onDepositChange = useCallback(
    (id: string, checked: boolean) => {
      setBlockHint(null)
      startTransition(() => {
        void updateKindraReportDepositConfirmed(adminPw, id, checked).then((r) => {
          if (r.ok) router.refresh()
        })
      })
    },
    [adminPw, router],
  )

  const fulfillmentLabel = (row: AdminReportRowVm) => {
    if (row.isSent) return { text: '발송 완료', className: 'bg-[#EDF2EB] text-[#3D5A38]' }
    if (row.tossPaymentKey || row.depositConfirmed) return { text: '발송 대기', className: 'bg-[#E8F0FF] text-[#2E4A7A]' }
    return { text: '결제·입금 대기', className: 'bg-[#FFF4E5] text-[#8A5C2A]' }
  }

  const showDepositCheckbox = (row: AdminReportRowVm) => !row.tossPaymentKey

  return (
    <div className="space-y-3">
      {blockHint ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-2 text-sm text-amber-950">{blockHint}</p>
      ) : null}
      <div className="overflow-x-auto rounded-xl border border-[#E8E4DC] bg-[#FDFBF9] shadow-sm">
        <table className="min-w-[1180px] w-full border-collapse text-left text-sm text-[#3D3D3D]">
          <thead>
            <tr className="border-b border-[#EDE8E0] bg-[#F4F7F2] text-xs font-semibold uppercase tracking-wide text-[#5A6F52]">
              <th className="px-4 py-3">생성일</th>
              <th className="px-4 py-3">아이 이름</th>
              <th className="px-4 py-3">부모 이메일</th>
              <th className="px-4 py-3">리포트 링크</th>
              <th className="px-4 py-3">확인</th>
              <th className="px-4 py-3">쿠폰</th>
              <th className="px-4 py-3">청구액</th>
              <th className="px-4 py-3">그림 시점</th>
              <th className="px-4 py-3">입금자명</th>
              <th className="px-4 py-3 max-w-[200px]">후기</th>
              <th className="px-4 py-3">입금 확인</th>
              <th className="px-4 py-3">발송</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-4 py-10 text-center text-[#7A7A7A]">
                  등록된 리포트가 없습니다.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-[#F0EBE3] last:border-0 hover:bg-white/70">
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums text-[#5A5A5A]">
                    {row.createdAt ? dateFmt.format(new Date(row.createdAt)) : '—'}
                  </td>
                  <td className="px-4 py-3 font-medium">{row.childName}</td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-[#5A5A5A]" title={row.parentEmail}>
                    {row.parentEmail}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <button
                      type="button"
                      onClick={() => void copyLink(row.id)}
                      className="rounded-lg border border-[#D4DED0] bg-white px-3 py-1.5 text-xs font-medium text-[#4F6048] transition hover:bg-[#F4F7F2]"
                    >
                      {copiedId === row.id ? '복사됨' : '링크 복사'}
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <a
                      href={adminPreviewUrl(origin, row.id, adminPw)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex rounded-lg border border-[#7C9070]/40 bg-[#7C9070]/10 px-3 py-1.5 text-xs font-semibold text-[#4F6048] transition hover:bg-[#7C9070]/20"
                    >
                      미리보기
                    </a>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-[#5A5A5A]">
                    {row.couponCodeApplied ? (
                      row.couponCodeApplied
                    ) : (
                      <span className="text-[#B0B0B0]">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs tabular-nums text-[#5A5A5A]">
                    {row.chargedAmountWon != null ? (
                      formatPriceWon(row.chargedAmountWon)
                    ) : (
                      <span title={`정상가 ${formatPriceWon(row.listedPriceWon)}`}>
                        미결제 <span className="text-[#B0B0B0]">({formatPriceWon(row.listedPriceWon)})</span>
                      </span>
                    )}
                  </td>
                  <td className="max-w-[140px] px-4 py-3 text-xs leading-snug text-[#5A5A5A]">
                    {row.drawnAt ? (
                      <>
                        <span className="tabular-nums">{row.drawnAt}</span>
                        {row.childAgeMonthsAtDrawing != null ? (
                          <span className="mt-0.5 block text-[#8A8A8A]">
                            생후 {row.childAgeMonthsAtDrawing}개월
                          </span>
                        ) : null}
                      </>
                    ) : (
                      <span className="text-[#B0B0B0]">—</span>
                    )}
                  </td>
                  <td className="max-w-[120px] px-4 py-3 align-top text-xs text-[#5A5A5A]">
                    {row.bankDepositorName ? (
                      <span className="line-clamp-3 font-medium" title={row.bankDepositorName}>
                        {row.bankDepositorName}
                      </span>
                    ) : (
                      <span className="text-[#B0B0B0]">—</span>
                    )}
                  </td>
                  <td className="max-w-[220px] px-4 py-3 align-top text-xs leading-snug text-[#5A5A5A]">
                    {row.reviewText ? (
                      <span className="line-clamp-4 whitespace-pre-wrap" title={row.reviewText}>
                        {row.reviewText}
                      </span>
                    ) : (
                      <span className="text-[#B0B0B0]">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 align-top">
                    {showDepositCheckbox(row) ? (
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-[#3D3D3D]">
                        <input
                          type="checkbox"
                          checked={row.depositConfirmed}
                          disabled={isPending}
                          onChange={(e) => onDepositChange(row.id, e.target.checked)}
                          className="h-4 w-4 rounded border-[#D4DED0] accent-[#7C9070]"
                        />
                        <span>입금 확인</span>
                      </label>
                    ) : (
                      <span className="text-xs text-[#B0B0B0]">카드결제</span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-col gap-2">
                      <span
                        className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold ${fulfillmentLabel(row).className}`}
                      >
                        {fulfillmentLabel(row).text}
                      </span>
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-[#3D3D3D]">
                        <input
                          type="checkbox"
                          checked={row.isSent}
                          disabled={
                            isPending ||
                            (!row.isSent && !row.tossPaymentKey && !row.depositConfirmed)
                          }
                          onChange={(e) => onSentChange(row.id, e.target.checked)}
                          className="h-4 w-4 rounded border-[#D4DED0] accent-[#7C9070]"
                        />
                        <span>발송 완료</span>
                      </label>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
