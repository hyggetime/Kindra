import { createRoute } from '@granite-js/react-native'

import { ScreenShell } from '@/components/rn/ScreenShell'

export const Route = createRoute('/payment/toss/fail' as never, {
  validateParams: (params) => params ?? {},
  component: PaymentFailScreen,
})

function PaymentFailScreen() {
  return (
    <ScreenShell title="결제가 완료되지 않았어요" subtitle="토스 앱에서 다시 시도해 주세요." />
  )
}
