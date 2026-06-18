export type AdminReportRowVm = {
  id: string
  createdAt: string
  childName: string
  parentEmail: string
  isSent: boolean
  listedPriceWon: number
  couponCodeApplied: string | null
  chargedAmountWon: number | null
  tossPaymentKey: string | null
  drawnAt: string | null
  childAgeMonthsAtDrawing: number | null
  reviewText: string | null
  bankDepositorName: string | null
  depositConfirmed: boolean
  channel: string | null
  status: string | null
  emailDeliveryError: string | null
}
