#!/usr/bin/env tsx
/**
 * AI1st Extraction Script from MeatConnect BMAD
 *
 * Safety measures:
 * - Read-only operations (cp, not mv)
 * - Dry run mode by default (--execute to actually copy)
 * - Validation that we're not in MeatConnect directory
 * - Post-extraction verification
 */

import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

// SAFETY: Verify paths
const MEATCONNECT_PATH = '/Users/aliaksandrsmolka/MeatConnect'
const AI1ST_PATH = '/Users/aliaksandrsmolka/ai1st-orchestration'

interface FileCopyConfig {
  from: string // Relative to MEATCONNECT_PATH
  to: string // Relative to AI1ST_PATH
  transform?: boolean // Apply text transformations
}

// Files to extract from MeatConnect
const filesToCopy: FileCopyConfig[] = [
  // ========================================
  // ORCHESTRATION FILES (17 files)
  // ========================================
  {
    from: '.cursor/lib/orchestration/workflow-engine.ts',
    to: 'packages/core/src/orchestration/workflow-engine.ts',
    transform: true,
  },
  {
    from: '.cursor/lib/orchestration/agent-registry.ts',
    to: 'packages/core/src/orchestration/agent-registry.ts',
    transform: true,
  },
  {
    from: '.cursor/lib/orchestration/skill-matcher.ts',
    to: 'packages/core/src/orchestration/skill-matcher.ts',
    transform: true,
  },
  {
    from: '.cursor/lib/orchestration/phase-manager.ts',
    to: 'packages/core/src/orchestration/phase-manager.ts',
    transform: true,
  },
  {
    from: '.cursor/lib/orchestration/iteration-manager.ts',
    to: 'packages/core/src/orchestration/iteration-manager.ts',
    transform: true,
  },
  {
    from: '.cursor/lib/orchestration/approval-checkpoint.ts',
    to: 'packages/core/src/orchestration/approval-checkpoint.ts',
    transform: true,
  },
  {
    from: '.cursor/lib/orchestration/learning-loop.ts',
    to: 'packages/core/src/orchestration/learning-loop.ts',
    transform: true,
  },
  {
    from: '.cursor/lib/orchestration/metrics-optimizer.ts',
    to: 'packages/core/src/orchestration/metrics-optimizer.ts',
    transform: true,
  },
  {
    from: '.cursor/lib/orchestration/retrospective-agent.ts',
    to: 'packages/core/src/orchestration/retrospective-agent.ts',
    transform: true,
  },
  {
    from: '.cursor/lib/orchestration/types.ts',
    to: 'packages/core/src/orchestration/types.ts',
    transform: true,
  },
  {
    from: '.cursor/lib/orchestration/metrics-collector.ts',
    to: 'packages/core/src/orchestration/metrics-collector.ts',
    transform: true,
  },
  {
    from: '.cursor/lib/orchestration/checklist-manager.ts',
    to: 'packages/core/src/orchestration/checklist-manager.ts',
    transform: true,
  },
  {
    from: '.cursor/lib/orchestration/team-manager.ts',
    to: 'packages/core/src/orchestration/team-manager.ts',
    transform: true,
  },
  {
    from: '.cursor/lib/orchestration/metrics-persister.ts',
    to: 'packages/core/src/orchestration/metrics-persister.ts',
    transform: true,
  },
  {
    from: '.cursor/lib/orchestration/retrospective-report-generator.ts',
    to: 'packages/core/src/orchestration/retrospective-report-generator.ts',
    transform: true,
  },
  {
    from: '.cursor/lib/orchestration/config-loader.ts',
    to: 'packages/core/src/orchestration/config-loader.ts',
    transform: true,
  },
  {
    from: '.cursor/lib/orchestration/role-manager.ts',
    to: 'packages/core/src/orchestration/role-manager.ts',
    transform: true,
  },

  // ========================================
  // CONFIG FILES (3 files - Priority 2)
  // ========================================
  {
    from: '.cursor/lib/orchestration/config/types.ts',
    to: 'packages/core/src/orchestration/config/types.ts',
    transform: true,
  },
  {
    from: '.cursor/lib/orchestration/config/defaults.ts',
    to: 'packages/core/src/orchestration/config/defaults.ts',
    transform: true,
  },
  {
    from: '.cursor/lib/orchestration/config/config-manager.ts',
    to: 'packages/core/src/orchestration/config/config-manager.ts',
    transform: true,
  },

  // ========================================
  // INSTRUCTION MANAGER (Priority 2)
  // ========================================
  {
    from: '.cursor/lib/orchestration/instruction-manager.ts',
    to: 'packages/core/src/orchestration/instruction-manager.ts',
    transform: true,
  },

  // ========================================
  // AGENT BASE FILES (3 files)
  // ========================================
  {
    from: '.cursor/agents/base-agent.ts',
    to: 'packages/core/src/agents/base-agent.ts',
    transform: true,
  },
  {
    from: '.cursor/agents/orchestrator.ts',
    to: 'packages/core/src/agents/orchestrator.ts',
    transform: true,
  },
  {
    from: '.cursor/agents/types.ts',
    to: 'packages/core/src/agents/types.ts',
    transform: true,
  },

  // ========================================
  // GENERIC AGENT ROLES (9 files)
  // ========================================
  {
    from: '.cursor/agents/roles/architect.agent.ts',
    to: 'packages/core/src/agents/roles/architect.agent.ts',
    transform: true,
  },
  {
    from: '.cursor/agents/roles/developer.agent.ts',
    to: 'packages/core/src/agents/roles/developer.agent.ts',
    transform: true,
  },
  {
    from: '.cursor/agents/roles/tester.agent.ts',
    to: 'packages/core/src/agents/roles/tester.agent.ts',
    transform: true,
  },
  {
    from: '.cursor/agents/roles/ui-developer.agent.ts',
    to: 'packages/core/src/agents/roles/ui-developer.agent.ts',
    transform: true,
  },
  {
    from: '.cursor/agents/roles/ux-designer.agent.ts',
    to: 'packages/core/src/agents/roles/ux-designer.agent.ts',
    transform: true,
  },
  {
    from: '.cursor/agents/roles/debugger.agent.ts',
    to: 'packages/core/src/agents/roles/debugger.agent.ts',
    transform: true,
  },
  {
    from: '.cursor/agents/roles/devops.agent.ts',
    to: 'packages/core/src/agents/roles/devops.agent.ts',
    transform: true,
  },
  {
    from: '.cursor/agents/roles/optimizer.agent.ts',
    to: 'packages/core/src/agents/roles/optimizer.agent.ts',
    transform: true,
  },
  {
    from: '.cursor/agents/roles/code-reviewer.agent.ts',
    to: 'packages/core/src/agents/roles/code-reviewer.agent.ts',
    transform: true,
  },

  // NOTE: rfq-specialist.agent.ts and supplier-ops.agent.ts are NOT copied (domain-specific)
]

// Text transformations to apply
const textTransformations = [
  { from: /BMAD/g, to: 'AI1st' },
  { from: /bmad/g, to: 'ai1st' },
  { from: /MeatConnect/g, to: 'your project' },
  { from: /B2B marketplace/g, to: 'application' },
  {
    from: /meat processors?|distributors?|buyers?/gi,
    to: 'users',
  },
]

async function main() {
  const isDryRun = !process.argv.includes('--execute')

  console.log('╔════════════════════════════════════════════════════════════════╗')
  console.log('║         AI1st Extraction Script from MeatConnect BMAD         ║')
  console.log('╚════════════════════════════════════════════════════════════════╝')
  console.log('')

  // SAFETY CHECK 1: Verify we're not in MeatConnect directory
  if (process.cwd().includes('MeatConnect')) {
    console.error('❌ ABORT: Cannot run extraction from MeatConnect directory')
    console.error('   Current directory:', process.cwd())
    console.error('   Please run this script from ai1st-orchestration directory')
    process.exit(1)
  }

  // SAFETY CHECK 2: Verify MeatConnect exists
  if (!fs.existsSync(MEATCONNECT_PATH)) {
    console.error('❌ ABORT: MeatConnect directory not found')
    console.error('   Expected path:', MEATCONNECT_PATH)
    process.exit(1)
  }

  // SAFETY CHECK 3: Verify AI1st directory
  if (!fs.existsSync(AI1ST_PATH)) {
    console.error('❌ ABORT: AI1st directory not found')
    console.error('   Expected path:', AI1ST_PATH)
    process.exit(1)
  }

  console.log('📍 Source: ', MEATCONNECT_PATH)
  console.log('📍 Target: ', AI1ST_PATH)
  console.log('')

  if (isDryRun) {
    console.log('🔍 DRY RUN MODE: No files will be copied')
    console.log('   Run with --execute to perform actual copy')
    console.log('')
  } else {
    console.log('⚠️  EXECUTE MODE: Files will be copied!')
    console.log('')
  }

  console.log(`📋 Files to copy: ${filesToCopy.length}`)
  console.log('')

  let copiedCount = 0
  let transformedCount = 0

  for (const fileConfig of filesToCopy) {
    const sourcePath = path.join(MEATCONNECT_PATH, fileConfig.from)
    const targetPath = path.join(AI1ST_PATH, fileConfig.to)

    // Check if source exists
    if (!fs.existsSync(sourcePath)) {
      console.warn(`⚠️  Source not found: ${fileConfig.from}`)
      continue
    }

    console.log(`📄 ${fileConfig.from}`)
    console.log(`   → ${fileConfig.to}`)

    if (!isDryRun) {
      // Create target directory
      const targetDir = path.dirname(targetPath)
      fs.mkdirSync(targetDir, { recursive: true })

      // Read source content
      let content = fs.readFileSync(sourcePath, 'utf-8')

      // Apply transformations if needed
      if (fileConfig.transform) {
        textTransformations.forEach((transformation) => {
          content = content.replace(transformation.from, transformation.to)
        })
        transformedCount++
      }

      // Write to target
      fs.writeFileSync(targetPath, content, 'utf-8')
      copiedCount++
    }

    console.log('')
  }

  console.log('─'.repeat(70))
  console.log('')

  if (isDryRun) {
    console.log('✅ Dry run completed successfully')
    console.log(`   Would copy ${filesToCopy.length} files`)
    console.log(`   Would transform ${filesToCopy.filter((f) => f.transform).length} files`)
    console.log('')
    console.log('To execute the extraction, run:')
    console.log('   tsx scripts/extract-from-meatconnect.ts --execute')
  } else {
    console.log('✅ Extraction completed successfully')
    console.log(`   Copied: ${copiedCount} files`)
    console.log(`   Transformed: ${transformedCount} files`)
    console.log('')
    console.log('Next steps:')
    console.log('   1. Review extracted files')
    console.log('   2. Manually generalize developer.agent.ts (remove identifyRelevantFiles)')
    console.log('   3. Copy and generalize agent instructions')
    console.log('   4. Copy and generalize configuration templates')
    console.log('   5. Run: pnpm typecheck')
    console.log('   6. Run validation: tsx scripts/validate-extraction.ts')
  }
}

main().catch((error) => {
  console.error('❌ Extraction failed:', error)
  process.exit(1)
})
