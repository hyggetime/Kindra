import type { PriceTier } from '@lib/constants'

export type AdminReportRowVm = {
  id: string
  createdAt: string
  childName: string
  parentEmail: string
  isSent: boolean
  priceTier: PriceTier | null
  reviewText: string | null
  bankDepositorName: string | null
  depositConfirmed: boolean
}
