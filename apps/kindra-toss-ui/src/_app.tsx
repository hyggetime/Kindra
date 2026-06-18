import { AppsInToss } from '@apps-in-toss/framework'
import { PropsWithChildren, useEffect } from 'react'
import type { InitialProps } from '@granite-js/react-native'

import { initTossInAppIfPresent } from '@/lib/tossInApp'
import { context } from '../require.context'

function AppContainer({ children, ...initialProps }: PropsWithChildren<InitialProps>) {
  useEffect(() => {
    initTossInAppIfPresent()
  }, [])

  if (__DEV__) {
    console.log('[kindra:granite] initialProps', initialProps)
  }

  return <>{children}</>
}

export default AppsInToss.registerApp(AppContainer, {
  context: context as Parameters<typeof AppsInToss.registerApp>[1]['context'],
})
