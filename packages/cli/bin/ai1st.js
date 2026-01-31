#!/usr/bin/env node
// AI1ST Framework CLI
// https://github.com/Samch1k/ai1st-orchestration

import('../dist/cli.js').catch((err) => {
  console.error('Failed to load AI1ST CLI:', err.message)
  console.error('Make sure to run `pnpm build` first.')
  process.exit(1)
})
