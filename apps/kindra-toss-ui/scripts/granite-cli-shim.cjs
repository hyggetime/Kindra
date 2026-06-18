#!/usr/bin/env node
/**
 * Apps-in-Toss `ait build` 가 `granite build --no-cache` 를 호출하지만
 * @granite-js/cli 1.0.x 는 `--no-cache` 를 지원하지 않습니다. 해당 플래그만 제거하고 실제 granite CLI 로 위임합니다.
 */
'use strict'

const { spawnSync } = require('node:child_process')
const path = require('node:path')

const STRIP = new Set(['--no-cache'])
const forwarded = []
const raw = process.argv.slice(2)
for (let i = 0; i < raw.length; i++) {
  const arg = raw[i]
  if (STRIP.has(arg)) continue
  forwarded.push(arg)
}

const graniteBin = path.join(
  path.dirname(require.resolve('@granite-js/react-native/package.json')),
  'bin',
  'cli.js',
)

const result = spawnSync(process.execPath, [graniteBin, ...forwarded], {
  stdio: 'inherit',
  env: process.env,
  cwd: process.cwd(),
})

process.exit(result.status === null ? 1 : result.status)
