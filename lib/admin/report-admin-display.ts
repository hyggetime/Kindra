import { REPORT_CHANNEL, REPORT_STATUS } from '@lib/reports/report-lifecycle'

import type { AdminReportRowVm } from '@app/admin/reports/types'

export type AdminChannelFilter = 'all' | typeof REPORT_CHANNEL.WEB | typeof REPORT_CHANNEL.TOSS | typeof REPORT_CHANNEL.DESKTOP

export const ADMIN_CHANNEL_FILTER_OPTIONS: { value: AdminChannelFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: REPORT_CHANNEL.WEB, label: '웹' },
  { value: REPORT_CHANNEL.TOSS, label: '토스앱' },
  { value: REPORT_CHANNEL.DESKTOP, label: '설치형 앱' },
]

export function reportChannelDisplayLabel(channel: string | null | undefined): string {
  const v = (channel ?? '').trim().toLowerCase()
  if (v === REPORT_CHANNEL.WEB) return '웹'
  if (v === REPORT_CHANNEL.TOSS) return '토스앱'
  if (v === REPORT_CHANNEL.DESKTOP) return '설치형 앱'
  if (!v) return '웹 (미기록)'
  return v
}

export type EmailDeliveryDisplay = {
  text: string
  detail?: string | null
  tone: 'muted' | 'progress' | 'ok' | 'error'
}

/** Resend·관리자 `status` 기준 이메일 배송 UI 라벨 */
export function emailDeliveryDisplayLabel(
  status: string | null | undefined,
  opts?: { emailError?: string | null; isSent?: boolean },
): EmailDeliveryDisplay {
  const v = (status ?? '').trim().toLowerCase()
  const err = opts?.emailError?.trim() || null

  if (v === REPORT_STATUS.EMAIL_DELIVERED) {
    return { text: '배송 완료', tone: 'ok' }
  }
  if (v === REPORT_STATUS.EMAIL_DELIVERY_FAILED) {
    return { text: '실패', detail: err, tone: 'error' }
  }
  if (v === REPORT_STATUS.EMAIL_SEND_REQUESTED) {
    return { text: '발송 요청', tone: 'progress' }
  }
  if (v === REPORT_STATUS.SENT || opts?.isSent) {
    return { text: '발송 요청', detail: '관리자 발송 표시', tone: 'progress' }
  }
  return { text: '대기', tone: 'muted' }
}

export function matchesChannelFilter(rowChannel: string | null | undefined, filter: AdminChannelFilter): boolean {
  if (filter === 'all') return true
  const normalized = (rowChannel ?? REPORT_CHANNEL.WEB).trim().toLowerCase()
  return normalized === filter
}

export type AdminChannelStats = {
  totalRows: number
  paidCount: number
  paidRevenueWon: number
  sendCount: number
  deliveredCount: number
}

function rowIsPaid(row: AdminReportRowVm): boolean {
  return Boolean(row.tossPaymentKey || row.depositConfirmed || row.chargedAmountWon != null)
}

function rowRevenueWon(row: AdminReportRowVm): number {
  if (row.chargedAmountWon != null) return row.chargedAmountWon
  if (rowIsPaid(row)) return row.listedPriceWon
  return 0
}

function rowCountsAsSend(row: AdminReportRowVm): boolean {
  const s = (row.status ?? '').toLowerCase()
  return (
    row.isSent ||
    s === REPORT_STATUS.SENT ||
    s === REPORT_STATUS.EMAIL_SEND_REQUESTED ||
    s === REPORT_STATUS.EMAIL_DELIVERED
  )
}

function rowCountsAsDelivered(row: AdminReportRowVm): boolean {
  return (row.status ?? '').toLowerCase() === REPORT_STATUS.EMAIL_DELIVERED
}

export function computeAdminChannelStats(rows: AdminReportRowVm[]): AdminChannelStats {
  let paidCount = 0
  let paidRevenueWon = 0
  let sendCount = 0
  let deliveredCount = 0

  for (const row of rows) {
    if (rowIsPaid(row)) {
      paidCount += 1
      paidRevenueWon += rowRevenueWon(row)
    }
    if (rowCountsAsSend(row)) sendCount += 1
    if (rowCountsAsDelivered(row)) deliveredCount += 1
  }

  return {
    totalRows: rows.length,
    paidCount,
    paidRevenueWon,
    sendCount,
    deliveredCount,
  }
}

export function emailDeliveryToneClass(tone: EmailDeliveryDisplay['tone']): string {
  switch (tone) {
    case 'ok':
      return 'bg-[#EDF2EB] text-[#3D5A38]'
    case 'error':
      return 'bg-[#FCE8E8] text-[#8A3030]'
    case 'progress':
      return 'bg-[#E8F0FF] text-[#2E4A7A]'
    default:
      return 'bg-[#F0EBE3] text-[#7A7A7A]'
  }
}

export function channelToneClass(channel: string | null | undefined): string {
  const v = (channel ?? REPORT_CHANNEL.WEB).toLowerCase()
  if (v === REPORT_CHANNEL.TOSS) return 'bg-[#E8F0FF] text-[#2E4A7A]'
  if (v === REPORT_CHANNEL.DESKTOP) return 'bg-[#F3EDFF] text-[#5A3D8A]'
  return 'bg-[#F4F7F2] text-[#4F6048]'
}
