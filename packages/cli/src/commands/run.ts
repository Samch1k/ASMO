/**
 * Run Command (Library-First)
 *
 * Uses @asmo/core hybrid analysis (BMAD + ClaudeCodeAdapter + SkillMatcher)
 * to automatically analyze, select workflow, and execute.
 *
 * This is the main entry point for ASMO CLI.
 *
 * Usage:
 *   asmo run "Fix the login bug"
 *   asmo run "Add user profile page" --verbose
 *   asmo run "Refactor auth module" --dry-run
 */

import {
  WorkflowEngine,
  AgentRegistry,
  getConfigLoader
} from '@asmo/core'

interface RunOptions {
  verbose?: boolean
  dryRun?: boolean
  workflow?: string  // Override automatic workflow selection
}

export async function runCommand(task: string, options: RunOptions): Promise<void> {
  try {
    // Step 1: Initialize WorkflowEngine (loads workflows with fallback)
    console.log('\n⚙️  Initializing ASMO...')

    // Initialize ConfigLoader to load roles and skills (uses fallback chain)
    const configLoader = await getConfigLoader()
    const roles = await configLoader.loadRoles()

    // Initialize AgentRegistry with loaded roles and config
    const agentRegistry = new AgentRegistry()
    await agentRegistry.autoDiscover(roles, configLoader)

    const engine = new WorkflowEngine(agentRegistry)
    await engine.initialize()

    // Step 2: Adaptive Workflow Selection (uses BMAD + complexity analysis)
    // Note: If task contains menu command ([IR], [DS], etc.), it will be detected
    // and executed directly in engine.execute() below, bypassing this selection
    console.log('🔍 Analyzing task complexity...')

    const selection = await engine.selectWorkflowAdaptively(task)

    if (options.verbose) {
      console.log('\n📊 Analysis Results:')
      console.log(`   Workflow: ${selection.workflow.id}`)
      console.log(`   Complexity: ${selection.complexity.level} (${selection.complexity.score}/100)`)
      console.log(`   Confidence: ${(selection.confidence * 100).toFixed(1)}%`)
      console.log(`   Reasoning: ${selection.reasoning}`)
    } else {
      console.log(`   Selected: ${selection.workflow.id} (confidence: ${(selection.confidence * 100).toFixed(1)}%)`)
    }

    // Step 3: Check if dry-run
    if (options.dryRun) {
      console.log('\n✅ Dry run complete (no execution)')
      console.log(`\nTo execute: asmo run "${task}"`)
      return
    }

    // Step 4: Execute workflow
    // ✨ BMAD Phase 1.1: Menu commands ([IR], [DS], [ГР], etc.) detected here
    console.log('\n🚀 Executing workflow...\n')

    const result = await engine.execute(task)

    console.log('\n✅ Execution complete')
    if (options.verbose && result.success) {
      console.log('   Result: success')
    }

  } catch (error) {
    console.error('\n❌ Execution failed:', error)
    if (error instanceof Error) {
      console.error('   Error:', error.message)
    }
    process.exit(1)
  }
}
