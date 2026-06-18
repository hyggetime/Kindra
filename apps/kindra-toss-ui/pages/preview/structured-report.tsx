import { createRoute } from '@granite-js/react-native'

import { StructuredReportPreviewScreen } from '@/screens/StructuredReportPreviewScreen'

export const Route = createRoute('/preview/structured-report' as never, {
  validateParams: (params) => params ?? {},
  component: StructuredReportPreviewScreen,
})
