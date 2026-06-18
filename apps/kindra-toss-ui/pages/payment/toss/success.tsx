import { createRoute } from '@granite-js/react-native'

import { PremiumPaymentSuccessScreen } from '@/screens/PremiumPaymentSuccessScreen'

export const Route = createRoute('/payment/toss/success' as never, {
  validateParams: (params) => params ?? {},
  component: PremiumPaymentSuccessScreen,
})
