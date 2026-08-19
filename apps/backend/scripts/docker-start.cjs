'use strict'

const { spawnSync } = require('node:child_process')
const path = require('node:path')

function run(script, args = []) {
  const result = spawnSync(process.execPath, [script, ...args], {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
    env: process.env,
  })
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

run(require.resolve('prisma/build/index.js'), ['migrate', 'deploy'])
run(path.join(__dirname, '../dist/seed.js'))
run(path.join(__dirname, '../dist/main.js'))
