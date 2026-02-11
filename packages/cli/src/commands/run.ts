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

import * as readline from 'readline'
import {
  WorkflowEngine,
  WorkflowSelector,
  AgentRegistry,
  getConfigLoader
} from '@asmo/core'
import { getCLIUserInputHandler } from '../utils/user-input-handler'

function promptUser(question: string, timeoutMs: number): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    const timer = setTimeout(() => { rl.close(); resolve('y') }, timeoutMs)
    rl.question(question, (answer) => {
      clearTimeout(timer)
      rl.close()
      resolve(answer.toLowerCase().trim() || 'y')
    })
  })
}

interface RunOptions {
  verbose?: boolean
  dryRun?: boolean
  workflow?: string  // Override automatic workflow selection
  useApi?: boolean   // Force API mode (requires ANTHROPIC_API_KEY)
  noLlm?: boolean    // Disable LLM, use heuristics only
  phaseDetection?: boolean  // commander --no-X pattern sets false
}

export async function runCommand(task: string, options: RunOptions): Promise<void> {
  // Setup cleanup handlers for graceful shutdown
  let userInputHandler: ReturnType<typeof getCLIUserInputHandler> | null = null

  const cleanup = () => {
    if (userInputHandler) {
      userInputHandler.shutdown()
    }
  }

  process.on('SIGINT', () => {
    console.log('\n\n⚠️  Interrupted by user')
    cleanup()
    process.exit(130) // Standard exit code for SIGINT
  })

  process.on('SIGTERM', () => {
    cleanup()
    process.exit(143) // Standard exit code for SIGTERM
  })

  try {
    // Step 1: Initialize WorkflowEngine (loads workflows with fallback)
    console.log('\n⚙️  Initializing ASMO...')

    // Initialize ConfigLoader to load roles and skills (uses fallback chain)
    const configLoader = await getConfigLoader()
    const roles = await configLoader.loadRoles()

    // Initialize AgentRegistry with loaded roles and config
    const agentRegistry = new AgentRegistry()
    await agentRegistry.autoDiscover(roles, configLoader)

    const engine = options.phaseDetection === false
      ? new WorkflowEngine({
          agentRegistry,
          verbose: options.verbose,
          workflowSelector: new WorkflowSelector({ enablePhaseDetection: false }, options.verbose)
        })
      : new WorkflowEngine({ agentRegistry, verbose: options.verbose })
    await engine.initialize()

    // Initialize CLI User Input Handler (for interactive agent questions)
    userInputHandler = getCLIUserInputHandler({ verbose: options.verbose })
    userInputHandler.initialize()

    // If --workflow specified, execute directly (bypass adaptive selection)
    if (options.workflow) {
      console.log(`🔧 Using workflow override: ${options.workflow}`)

      if (options.dryRun) {
        console.log('\n✅ Dry run complete (no execution)')
        return
      }

      console.log('\n🚀 Executing workflow...\n')
      const result = await engine.execute(options.workflow, { task })

      console.log('\n✅ Execution complete')
      if (options.verbose && result.success) {
        console.log('   Result: success')
      }
      return
    }

    // Step 2: Adaptive Workflow Selection (uses BMAD + complexity analysis)
    console.log('🔍 Analyzing task complexity...')

    // Determine LLM mode from CLI flags
    const llmMode = options.noLlm ? 'heuristics' 
                  : options.useApi ? 'api' 
                  : 'auto'

    // Pass llmMode via ProjectContext
    const selection = await engine.selectWorkflowAdaptively(task, {
      llmMode: llmMode as 'auto' | 'api' | 'heuristics'
    })

    if (options.verbose) {
      console.log('\n📊 Analysis Results:')
      console.log(`   Workflow: ${selection.workflow.id}`)
      console.log(`   Complexity: ${selection.complexity.level} (${selection.complexity.score}/100)`)
      console.log(`   Confidence: ${(selection.confidence * 100).toFixed(1)}%`)
      console.log(`   Reasoning: ${selection.reasoning}`)
    } else {
      console.log(`   Selected: ${selection.workflow.id} (confidence: ${(selection.confidence * 100).toFixed(1)}%)`)
    }

    // Step 3: Confirm with user if confidence is low
    if (selection.confidence < 0.5 && !options.dryRun) {
      console.log(`\n⚠️  Low confidence (${(selection.confidence * 100).toFixed(0)}%)`)
      console.log(`   Selected: ${selection.workflow.id}`)
      if (selection.alternatives.length > 0) {
        selection.alternatives.forEach((alt, i) => {
          console.log(`   ${i + 1}. ${alt.workflowId} (${(alt.confidence * 100).toFixed(0)}%)`)
        })
      }
      const altRange = selection.alternatives.length > 0 ? `1-${selection.alternatives.length}/` : ''
      const answer = await promptUser(
        `   Proceed with ${selection.workflow.id}? [Y/n/${altRange}]: `,
        60000
      )
      if (answer === 'n' || answer === 'no') {
        console.log('Aborted.')
        return
      }
      const altIdx = parseInt(answer) - 1
      if (!isNaN(altIdx) && altIdx >= 0 && altIdx < selection.alternatives.length) {
        console.log(`\n🚀 Executing alternative workflow: ${selection.alternatives[altIdx].workflowId}...\n`)
        const result = await engine.execute(selection.alternatives[altIdx].workflowId)
        console.log('\n✅ Execution complete')
        if (options.verbose && result.success) {
          console.log('   Result: success')
        }
        return
      }
    }

    // Step 4: Check if dry-run
    if (options.dryRun) {
      console.log('\n✅ Dry run complete (no execution)')
      console.log(`\nTo execute: asmo run "${task}"`)
      return
    }

    // Step 5: Execute workflow
    console.log('\n🚀 Executing workflow...\n')

    const result = await engine.execute(task)

    console.log('\n✅ Execution complete')
    if (options.verbose && result.success) {
      console.log('   Result: success')
    }

    // Cleanup
    cleanup()

  } catch (error) {
    console.error('\n❌ Execution failed:', error)
    if (error instanceof Error) {
      console.error('   Error:', error.message)
    }

    // Cleanup on error
    cleanup()

    process.exit(1)
  }
}
