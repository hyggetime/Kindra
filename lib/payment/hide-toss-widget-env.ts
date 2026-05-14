import { isPaymentShowTossWidgetEnabled } from '@lib/payment/show-toss-widget-env'

/** @deprecated `!isPaymentShowTossWidgetEnabled()` 사용 권장 */
export function isPaymentHideTossWidgetEnabled(): boolean {
  return !isPaymentShowTossWidgetEnabled()
}
