/**
 * 앱인토스 Granite 런타임 메인 진입점.
 * `granite.config.ts` 의 engine.entry 와 동일하게 유지합니다.
 */
import { register } from '@granite-js/react-native'

import App from './src/_app'

register(App)
