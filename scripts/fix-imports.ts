#!/usr/bin/env tsx
/**
 * Fix import paths after extraction from MeatConnect
 *
 * Changes:
 * 1. Fix relative paths: ../lib/orchestration/ → ../orchestration/
 * 2. Remove .js extensions (TypeScript doesn't need them)
 * 3. Fix agent paths: ../../agents/ → ../agents/
 */

import * as fs from 'fs'
import * as path from 'path'
import { glob } from 'glob'

const PACKAGES_CORE = '/Users/aliaksandrsmolka/ai1st-orchestration/packages/core/src'

interface ImportFix {
  pattern: RegExp
  replacement: string
}

const importFixes: ImportFix[] = [
  // Fix paths from lib/orchestration to orchestration
  {
    pattern: /from ['"]\.\.\/lib\/orchestration\//g,
    replacement: "from '../orchestration/",
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/lib\/orchestration\//g,
    replacement: "from '../orchestration/",
  },
  // Fix paths to agents
  {
    pattern: /from ['"]\.\.\/\.\.\/agents\//g,
    replacement: "from '../agents/",
  },
  // Remove .js extensions (TypeScript style)
  {
    pattern: /\.js(['"])/g,
    replacement: "$1",
  },
]

async function fixFileImports(filePath: string): Promise<boolean> {
  let content = await fs.promises.readFile(filePath, 'utf-8')
  let modified = false

  for (const fix of importFixes) {
    const newContent = content.replace(fix.pattern, fix.replacement)
    if (newContent !== content) {
      content = newContent
      modified = true
    }
  }

  if (modified) {
    await fs.promises.writeFile(filePath, content, 'utf-8')
  }

  return modified
}

async function main() {
  console.log('🔧 Fixing import paths in extracted files...')
  console.log('')

  // Find all .ts files in packages/core/src
  const files = await glob(`${PACKAGES_CORE}/**/*.ts`)

  console.log(`📋 Found ${files.length} TypeScript files`)
  console.log('')

  let fixedCount = 0

  for (const filePath of files) {
    const relativePath = path.relative(PACKAGES_CORE, filePath)
    const wasFixed = await fixFileImports(filePath)

    if (wasFixed) {
      console.log(`✅ Fixed: ${relativePath}`)
      fixedCount++
    }
  }

  console.log('')
  console.log('─'.repeat(70))
  console.log(`✅ Import fixing complete: ${fixedCount}/${files.length} files modified`)
}

main().catch((error) => {
  console.error('❌ Import fixing failed:', error)
  process.exit(1)
})
