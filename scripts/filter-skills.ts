#!/usr/bin/env tsx
/**
 * Filter out domain-specific skills from skills catalog
 */

import * as fs from 'fs'
import * as path from 'path'

const SKILLS_PATH = '/Users/aliaksandrsmolka/ai1st-orchestration/packages/core/templates/skills/skills-catalog.json'

// Domain-specific skill IDs to remove
const DOMAIN_SPECIFIC_SKILLS = [
  'bid_management',
  'procurement_optimization',
  'rfq_complete_workflow',
  'rfq_validation',
  'rfq_workflow',
  'supplier_analytics',
  'supplier_matching'
]

async function main() {
  console.log('🔧 Filtering domain-specific skills from catalog...')
  console.log('')

  // Read skills catalog
  const content = await fs.promises.readFile(SKILLS_PATH, 'utf-8')
  const catalog = JSON.parse(content)

  const originalCount = catalog.skills.length
  console.log(`📋 Original skills count: ${originalCount}`)

  // Filter out domain-specific skills
  catalog.skills = catalog.skills.filter((skill: any) => {
    const isDomainSpecific = DOMAIN_SPECIFIC_SKILLS.includes(skill.id)
    if (isDomainSpecific) {
      console.log(`   ❌ Removing domain-specific skill: ${skill.id}`)
    }
    return !isDomainSpecific
  })

  const newCount = catalog.skills.length
  const removedCount = originalCount - newCount

  // Write back
  await fs.promises.writeFile(
    SKILLS_PATH,
    JSON.stringify(catalog, null, 2),
    'utf-8'
  )

  console.log('')
  console.log('─'.repeat(70))
  console.log(`✅ Filtering complete: ${removedCount} skills removed, ${newCount} skills remaining`)
}

main().catch((error) => {
  console.error('❌ Filtering failed:', error)
  process.exit(1)
})
