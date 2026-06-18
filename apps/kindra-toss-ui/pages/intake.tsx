import { createRoute } from '@granite-js/react-native'

import { IntakeScreen } from '@/screens/IntakeScreen'

export const Route = createRoute('/intake' as never, {
  validateParams: (params) => params ?? {},
  component: IntakeScreen,
})
