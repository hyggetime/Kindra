/**
 * Windows: Granite 가 생성한 import 경로의 `\` 가 esbuild 에서 이스케이프로 깨질 때
 * `.granite/micro-frontend-runtime.js` 의 절대 경로를 `.granite` 기준 상대 POSIX 로 고칩니다.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const graniteDir = path.join(root, '.granite')
const target = path.join(graniteDir, 'micro-frontend-runtime.js')

if (!fs.existsSync(target)) {
  console.warn('[fix-granite-windows-path] skip: file not found', target)
  process.exit(0)
}

const before = fs.readFileSync(target, 'utf8')
const after = before.replace(/from '([^']+)'/g, (_match, importPath) => {
  const normalized = importPath.replace(/\\/g, '/')
  const isAbsolute =
    path.isAbsolute(importPath) || /^[A-Za-z]:\//.test(normalized) || /^[A-Za-z]:[^/]/.test(normalized)

  if (!isAbsolute && !importPath.includes('\\')) {
    return `from '${importPath}'`
  }

  const absPath = path.isAbsolute(importPath)
    ? importPath
    : path.resolve(root, importPath.replace(/\\/g, path.sep))

  let rel = path.relative(graniteDir, absPath).split(path.sep).join('/')
  if (!rel.startsWith('.')) {
    rel = `./${rel}`
  }

  return `from '${rel}'`
})

if (after !== before) {
  fs.writeFileSync(target, after)
  console.log('[fix-granite-windows-path] patched', target)
}
