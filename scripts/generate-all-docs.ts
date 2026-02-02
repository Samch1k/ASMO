#!/usr/bin/env tsx
/**
 * Main documentation generation script
 * Generates documentation from JSON configuration files
 */

import { generateAgentDocs } from './generate-agent-docs'
import { generateWorkflowDocs } from './generate-workflow-docs'
import { generateSkillDocs } from './generate-skill-docs'

async function main() {
  console.log('📚 Generating ASMO Documentation...\n')

  try {
    // Generate in parallel
    await Promise.all([
      generateAgentDocs(),
      generateWorkflowDocs(),
      generateSkillDocs(),
    ])

    console.log('\n✅ Documentation generation complete!')
  } catch (error) {
    console.error('❌ Documentation generation failed:', error)
    process.exit(1)
  }
}

main()
