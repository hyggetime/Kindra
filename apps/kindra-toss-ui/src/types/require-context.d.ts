/** Metro `require.context` (Granite 파일 라우팅) */
interface RequireContext {
  keys(): string[]
  (id: string): { Route?: unknown; default?: unknown }
  resolve(id: string): string
  id: string
}

interface NodeRequire {
  context(
    directory: string,
    useSubdirectories?: boolean,
    regExp?: RegExp,
    mode?: 'sync' | 'eager' | 'lazy' | 'lazy-once',
  ): RequireContext
}

declare const require: NodeRequire
