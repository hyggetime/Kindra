import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { GranitePluginCore } from '@granite-js/plugin-core'
import { appsInToss } from '@apps-in-toss/framework/plugins'
import { router } from '@granite-js/plugin-router'
import { defineConfig } from '@granite-js/react-native/config'

const configDir = path.dirname(fileURLToPath(import.meta.url))
/** `ait build` 가 `.granite/.ait-runtime-*.config.ts` 로 복사해도 패키지 루트를 가리키도록 */
const appRoot = path.basename(configDir) === '.granite' ? path.dirname(configDir) : configDir

/** Granite / esbuild 에 절대 Windows 경로가 들어가지 않도록 POSIX 상대 경로만 사용 */
const entryFile = path.posix.join('.', 'src', '_app.tsx')

function fixWindowsGraniteBuildArtifacts(): GranitePluginCore {
  const patch = () => {
    const requireFromApp = createRequire(path.join(appRoot, 'package.json'))
    const { patchMicroFrontendRuntime } = requireFromApp(
      path.join(appRoot, 'granite', 'patchMicroFrontendRuntime.ts'),
    ) as typeof import('./granite/patchMicroFrontendRuntime')
    const { patchReact19Compat } = requireFromApp(
      path.join(appRoot, 'granite', 'patchReact19Compat.ts'),
    ) as typeof import('./granite/patchReact19Compat')

    if (patchMicroFrontendRuntime(appRoot)) {
      console.log('[kindra:granite] patched .granite/micro-frontend-runtime.js (Windows-safe imports)')
    }
    if (patchReact19Compat(appRoot)) {
      console.log('[kindra:granite] patched .granite/react-19-compat.js (Windows-safe require paths)')
    }
  }

  return {
    name: 'kindra-fix-windows-granite-build-artifacts',
    build: {
      order: 'pre',
      handler: patch,
    },
    dev: {
      order: 'pre',
      handler: patch,
    },
  }
}

export default defineConfig({
  cwd: appRoot,
  scheme: 'intoss',
  appName: 'kindra',
  entryFile,
  plugins: [
    appsInToss({
      brand: {
        displayName: 'kindra',
        primaryColor: '#7c9070',
        icon: 'https://static.toss.im/assets/homepage/safety/icn-safety-01.png',
      },
      permissions: [],
    }),
    router({ watch: false }),
    fixWindowsGraniteBuildArtifacts(),
  ],
  build: {
    esbuild: {
      external: ['fs', 'path', 'fs/promises', 'node:fs', 'node:path', 'node:fs/promises'],
    },
  },
})
