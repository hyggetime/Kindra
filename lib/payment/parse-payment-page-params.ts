import type { PriceTier } from '@lib/constants'

export function parseTierParam(raw: string | undefined): PriceTier {
  if (raw === 'discount' || raw === 'normal' || raw === 'free') return raw
  return 'free'
}

export function parseReportIdParam(raw: string | undefined): string | null {
  if (!raw || typeof raw !== 'string') return null
  const t = raw.trim()
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      t,
    )
  ) {
    return null
  }
  return t
}

export function buildApplyPaymentPath(tier: PriceTier, reportId: string | null): string {
  const q = new URLSearchParams()
  q.set('tier', tier)
  if (reportId) q.set('report', reportId)
  return `/apply/payment?${q.toString()}`
}
