/**
 * `npx granite` / `ait build` 가 로컬 shim 을 쓰도록 node_modules/.bin/granite 을 덮어씁니다.
 */
'use strict'

const fs = require('node:fs')
const path = require('node:path')

const root = path.join(__dirname, '..')
const shim = path.join(__dirname, 'granite-cli-shim.cjs')
const binDir = path.join(root, 'node_modules', '.bin')

if (!fs.existsSync(binDir)) {
  process.exit(0)
}

const graniteBin = path.join(binDir, 'granite')
const graniteCmd = path.join(binDir, 'granite.cmd')
const granitePs1 = path.join(binDir, 'granite.ps1')

const relShim = path.relative(binDir, shim).replace(/\\/g, '/')

fs.writeFileSync(
  graniteBin,
  `#!/usr/bin/env sh
basedir=$(dirname "$(echo "$0" | sed -e 's,\\\\,/,g')")
exec node "$basedir/${relShim}" "$@"
`,
  'utf8',
)

fs.writeFileSync(graniteCmd, `@ECHO off\r\nnode "%~dp0\\${relShim.replace(/\//g, '\\')}" %*\r\n`, 'utf8')

if (fs.existsSync(granitePs1)) {
  fs.writeFileSync(
    granitePs1,
    `#!/usr/bin/env pwsh
$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent
node "$basedir/${relShim.replace(/\\/g, '/')}" $args
`,
    'utf8',
  )
}

console.log('[kindra-toss-ui] linked granite CLI shim for ait build')
