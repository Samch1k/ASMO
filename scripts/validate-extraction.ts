#!/usr/bin/env tsx
/**
 * AI1st Extraction Validation Script
 *
 * Verifies that the extraction from MeatConnect was successful and complete.
 *
 * SECURITY NOTE: This script uses execSync with hardcoded commands only (no user input).
 * It's safe because all commands are developer-defined constants.
 */

import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'

interface ValidationResult {
  category: string
  passed: number
  failed: number
  warnings: number
  issues: string[]
}

const results: ValidationResult[] = []

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function printHeader(text: string) {
  console.log('')
  console.log(colors.cyan + '═'.repeat(70) + colors.reset)
  console.log(colors.cyan + text.toUpperCase() + colors.reset)
  console.log(colors.cyan + '═'.repeat(70) + colors.reset)
  console.log('')
}

function printResult(category: string, result: ValidationResult) {
  const totalChecks = result.passed + result.failed
  const successRate = totalChecks > 0 ? ((result.passed / totalChecks) * 100).toFixed(1) : '0.0'

  console.log(`${colors.blue}${category}${colors.reset}`)
  console.log(`  ${colors.green}✓ Passed: ${result.passed}${colors.reset}`)
  console.log(`  ${colors.red}✗ Failed: ${result.failed}${colors.reset}`)
  console.log(`  ${colors.yellow}⚠ Warnings: ${result.warnings}${colors.reset}`)
  console.log(`  Success Rate: ${successRate}%`)

  if (result.issues.length > 0) {
    console.log('')
    result.issues.forEach(issue => {
      const [type, ...rest] = issue.split(':')
      const message = rest.join(':').trim()
      const color = type.includes('ERROR') ? colors.red : colors.yellow
      console.log(`    ${color}${type}:${colors.reset} ${message}`)
    })
  }

  console.log('')
  results.push(result)
}

function checkMeatConnectReferences(): ValidationResult {
  const result: ValidationResult = {
    category: 'MeatConnect References',
    passed: 0,
    failed: 0,
    warnings: 0,
    issues: []
  }

  const srcDir = 'packages/core/src'
  const searchTerms = ['MeatConnect', 'meat processor', 'distributor', 'rfq', 'supplier', 'bid']

  console.log('Searching for MeatConnect-specific references...')

  for (const term of searchTerms) {
    try {
      const cmd = `grep -ri "${term}" ${srcDir} --include="*.ts" || true`
      const output = execSync(cmd, { encoding: 'utf-8' })

      if (output.trim()) {
        const matches = output.trim().split('\n')
        result.failed++
        result.issues.push(`ERROR: Found "${term}" in ${matches.length} locations`)
      } else {
        result.passed++
      }
    } catch (error) {
      result.passed++
    }
  }

  return result
}

function checkTypeScriptCompilation(): ValidationResult {
  const result: ValidationResult = {
    category: 'TypeScript Compilation',
    passed: 0,
    failed: 0,
    warnings: 0,
    issues: []
  }

  console.log('Running TypeScript compiler...')

  try {
    execSync('pnpm --filter @ai1st/core typecheck', { encoding: 'utf-8', stdio: 'pipe' })
    result.passed = 1
  } catch (error: any) {
    result.failed = 1
    result.issues.push('ERROR: TypeScript compilation has errors')
    const output = error.stdout || error.stderr || ''
    const errorMatch = output.match(/Found (\d+) error/i)

    if (errorMatch) {
      result.issues.push(`  ${errorMatch[0]}`)
      result.warnings = 1
      result.issues.push('  WARNING: These errors should be fixed before v1.0 release')
    }
  }

  return result
}

function checkPackageStructure(): ValidationResult {
  const result: ValidationResult = {
    category: 'Package Structure',
    passed: 0,
    failed: 0,
    warnings: 0,
    issues: []
  }

  console.log('Checking package structure...')

  const requiredDirs = [
    'packages/core/src/orchestration',
    'packages/core/src/agents',
    'packages/core/src/agents/roles',
    'packages/core/tests',
    'packages/core/templates',
    'packages/core/templates/roles',
    'packages/core/templates/workflows',
    'packages/core/templates/skills',
    'packages/core/templates/instructions'
  ]

  const requiredFiles = [
    'packages/core/package.json',
    'packages/core/tsconfig.json',
    'packages/core/src/index.ts',
    'packages/core/jest.config.js',
    'packages/core/templates/README.md',
    'packages/core/templates/instructions/README.md'
  ]

  for (const dir of requiredDirs) {
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
      result.passed++
    } else {
      result.failed++
      result.issues.push(`ERROR: Missing directory: ${dir}`)
    }
  }

  for (const file of requiredFiles) {
    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      result.passed++
    } else {
      result.failed++
      result.issues.push(`ERROR: Missing file: ${file}`)
    }
  }

  return result
}

function checkTemplateCompleteness(): ValidationResult {
  const result: ValidationResult = {
    category: 'Template Completeness',
    passed: 0,
    failed: 0,
    warnings: 0,
    issues: []
  }

  console.log('Checking template completeness...')

  const requiredRoleFiles = [
    'packages/core/templates/roles/core-roles.json',
    'packages/core/templates/roles/specialized-roles.json',
    'packages/core/templates/roles/project-roles.json'
  ]

  for (const file of requiredRoleFiles) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf-8')
      try {
        const json = JSON.parse(content)
        if (json.roles && Array.isArray(json.roles)) {
          result.passed++
        } else {
          result.failed++
          result.issues.push(`ERROR: Invalid structure in ${file}`)
        }
      } catch (error) {
        result.failed++
        result.issues.push(`ERROR: Invalid JSON in ${file}`)
      }
    } else {
      result.failed++
      result.issues.push(`ERROR: Missing file: ${file}`)
    }
  }

  const skillsFile = 'packages/core/templates/skills/skills-catalog.json'
  if (fs.existsSync(skillsFile)) {
    const content = fs.readFileSync(skillsFile, 'utf-8')
    try {
      const json = JSON.parse(content)
      if (json.skills && Array.isArray(json.skills)) {
        result.passed++
        const skillCount = json.skills.length
        console.log(`  Found ${skillCount} skills in catalog`)

        const domainSkills = json.skills.filter((skill: any) =>
          skill.id && (
            skill.id.includes('rfq') ||
            skill.id.includes('supplier') ||
            skill.id.includes('bid')
          )
        )

        if (domainSkills.length > 0) {
          result.warnings++
          result.issues.push(`WARNING: Found ${domainSkills.length} domain-specific skills still in catalog`)
        }
      } else {
        result.failed++
        result.issues.push(`ERROR: Invalid structure in ${skillsFile}`)
      }
    } catch (error) {
      result.failed++
      result.issues.push(`ERROR: Invalid JSON in ${skillsFile}`)
    }
  } else {
    result.failed++
    result.issues.push(`ERROR: Missing file: ${skillsFile}`)
  }

  const requiredInstructionFiles = [
    'packages/core/templates/instructions/architect/system-prompt.md',
    'packages/core/templates/instructions/developer/system-prompt.md',
    'packages/core/templates/instructions/tester/system-prompt.md'
  ]

  for (const file of requiredInstructionFiles) {
    if (fs.existsSync(file)) {
      result.passed++
    } else {
      result.failed++
      result.issues.push(`ERROR: Missing file: ${file}`)
    }
  }

  return result
}

function checkGitStatus(): ValidationResult {
  const result: ValidationResult = {
    category: 'Git Status',
    passed: 0,
    failed: 0,
    warnings: 0,
    issues: []
  }

  console.log('Checking git status...')

  try {
    execSync('git rev-parse --git-dir', { stdio: 'pipe' })
    result.passed++

    const status = execSync('git status --porcelain', { encoding: 'utf-8' })
    if (status.trim()) {
      result.warnings++
      const files = status.trim().split('\n').length
      result.issues.push(`WARNING: ${files} uncommitted file(s)`)
    } else {
      result.passed++
    }

    try {
      const remote = execSync('git remote get-url origin', { encoding: 'utf-8' })
      if (remote.includes('github.com')) {
        result.passed++
      } else {
        result.warnings++
        result.issues.push('WARNING: Remote is not GitHub')
      }
    } catch (error) {
      result.failed++
      result.issues.push('ERROR: No git remote configured')
    }
  } catch (error) {
    result.failed++
    result.issues.push('ERROR: Not a git repository')
  }

  return result
}

async function main() {
  console.log('')
  console.log(colors.green + '╔════════════════════════════════════════════════════════════════╗' + colors.reset)
  console.log(colors.green + '║         AI1st Extraction Validation                            ║' + colors.reset)
  console.log(colors.green + '╚════════════════════════════════════════════════════════════════╝' + colors.reset)
  console.log('')

  printHeader('1. Checking for MeatConnect-specific references')
  const check1 = checkMeatConnectReferences()
  printResult('MeatConnect References', check1)

  printHeader('2. Checking TypeScript compilation')
  const check2 = checkTypeScriptCompilation()
  printResult('TypeScript Compilation', check2)

  printHeader('3. Checking package structure')
  const check3 = checkPackageStructure()
  printResult('Package Structure', check3)

  printHeader('4. Checking template completeness')
  const check4 = checkTemplateCompleteness()
  printResult('Template Completeness', check4)

  printHeader('5. Checking git status')
  const check5 = checkGitStatus()
  printResult('Git Status', check5)

  printHeader('Validation Summary')

  const totalPassed = results.reduce((sum, r) => sum + r.passed, 0)
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0)
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings, 0)

  console.log(`Total Checks: ${totalPassed + totalFailed}`)
  console.log(`${colors.green}✓ Passed: ${totalPassed}${colors.reset}`)
  console.log(`${colors.red}✗ Failed: ${totalFailed}${colors.reset}`)
  console.log(`${colors.yellow}⚠ Warnings: ${totalWarnings}${colors.reset}`)
  console.log('')

  if (totalFailed > 0) {
    console.log(colors.red + '❌ VALIDATION FAILED' + colors.reset)
    console.log('')
    console.log('Please address the errors above before proceeding.')
    console.log('')
    process.exit(1)
  } else if (totalWarnings > 0) {
    console.log(colors.yellow + '⚠️  VALIDATION PASSED WITH WARNINGS' + colors.reset)
    console.log('')
    console.log('Extraction is complete but there are warnings to address.')
    console.log('')
  } else {
    console.log(colors.green + '✅ VALIDATION PASSED' + colors.reset)
    console.log('')
    console.log('Extraction is complete and validated successfully!')
    console.log('')
  }

  console.log(colors.blue + 'Next steps:' + colors.reset)
  console.log('1. Verify MeatConnect still works: cd /Users/aliaksandrsmolka/MeatConnect && pnpm test')
  console.log('2. Move to Phase 2: Build demo applications')
  console.log('3. Set up documentation site')
  console.log('')
}

main().catch((error) => {
  console.error('❌ Validation script failed:', error)
  process.exit(1)
})
