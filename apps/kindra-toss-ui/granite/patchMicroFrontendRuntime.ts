import fs from 'node:fs'
import path from 'node:path'

/**
 * Granite micro-frontend prelude uses `path.resolve()` for expose paths, which on Windows
 * embeds `\` in import strings and breaks esbuild (`C:DATADev...`).
 * Rewrite exposes to POSIX paths relative to `.granite/`.
 */
export function patchMicroFrontendRuntime(cwd: string): boolean {
  const graniteDir = path.join(cwd, '.granite')
  const target = path.join(graniteDir, 'micro-frontend-runtime.js')
  if (!fs.existsSync(target)) {
    return false
  }

  const before = fs.readFileSync(target, 'utf8')
  const after = before.replace(/from '([^']+)'/g, (_match, importPath: string) => {
    const normalized = importPath.replace(/\\/g, '/')
    const isAbsolute =
      path.isAbsolute(importPath) || /^[A-Za-z]:\//.test(normalized) || /^[A-Za-z]:[^/]/.test(normalized)

    if (!isAbsolute && !importPath.includes('\\')) {
      return `from '${importPath}'`
    }

    const absPath = path.isAbsolute(importPath)
      ? importPath
      : path.resolve(cwd, importPath.replace(/\\/g, path.sep))

    let rel = path.relative(graniteDir, absPath).split(path.sep).join('/')
    if (!rel.startsWith('.')) {
      rel = `./${rel}`
    }

    return `from '${rel}'`
  })

  if (after !== before) {
    fs.writeFileSync(target, after)
  }

  return after !== before
}
