import fs from 'node:fs'
import path from 'node:path'

/**
 * `@apps-in-toss/plugin-compat` embeds `require.resolve()` paths in single-quoted strings.
 * On Windows, backslashes become invalid escape sequences for esbuild (`\D`, `\n`, …).
 */
export function patchReact19Compat(cwd: string): boolean {
  const target = path.join(cwd, '.granite', 'react-19-compat.js')
  if (!fs.existsSync(target)) {
    return false
  }

  const before = fs.readFileSync(target, 'utf8')
  const after = before.replace(/require\('([^']+)'\)/g, (_match, importPath: string) => {
    if (!importPath.includes('\\')) {
      return `require('${importPath}')`
    }
    return `require('${importPath.replace(/\\/g, '/')}')`
  })

  if (after !== before) {
    fs.writeFileSync(target, after)
  }

  return after !== before
}
