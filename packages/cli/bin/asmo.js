#!/usr/bin/env node
// ASMO Framework CLI
// https://github.com/Samch1k/ASMO

import('../dist/index.js').catch((err) => {
  console.error('Failed to load ASMO CLI:', err.message)
  console.error('Make sure to run `pnpm build` first.')
  process.exit(1)
})
