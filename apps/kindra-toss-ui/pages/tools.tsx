import { createRoute } from '@granite-js/react-native'

import { ScreenShell } from '@/components/rn/ScreenShell'

export const Route = createRoute('/tools' as never, {
  validateParams: (params) => params ?? {},
  component: ToolsScreen,
})

function ToolsScreen() {
  return <ScreenShell title="마음을 읽는 도구들" subtitle="Granite 라우트 `/tools`" />
}
