'use client'

import { formatPriceWon } from '@lib/constants'
import {
  ADMIN_CHANNEL_FILTER_OPTIONS,
  type AdminChannelFilter,
  computeAdminChannelStats,
} from '@lib/admin/report-admin-display'

import type { AdminReportRowVm } from './types'

type Props = {
  rows: AdminReportRowVm[]
  channelFilter: AdminChannelFilter
}

export function AdminReportsChannelStats({ rows, channelFilter }: Props) {
  const stats = computeAdminChannelStats(rows)
  const filterLabel =
    ADMIN_CHANNEL_FILTER_OPTIONS.find((o) => o.value === channelFilter)?.label ?? '전체'

  return (
    <section
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      aria-label={`${filterLabel} 창구 통계`}
    >
      <StatCard label="건수" value={`${stats.totalRows}건`} hint="선택 창구 내 리포트" />
      <StatCard
        label="결제 매출"
        value={formatPriceWon(stats.paidRevenueWon)}
        hint={`결제 완료 ${stats.paidCount}건 합산`}
      />
      <StatCard label="발송 건수" value={`${stats.sendCount}건`} hint="발송 요청·완료 포함" />
      <StatCard label="배송 완료" value={`${stats.deliveredCount}건`} hint="Resend delivered" />
    </section>
  )
}

function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border border-[#E8E4DC] bg-white px-4 py-3 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8A8A8A]">{label}</p>
      <p className="mt-1 text-lg font-bold tabular-nums text-[#2F3D2E]">{value}</p>
      <p className="mt-0.5 text-[11px] text-[#9A9A9A]">{hint}</p>
    </div>
  )
}
