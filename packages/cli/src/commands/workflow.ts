/**
 * Workflow Command (Library-First)
 *
 * Executes ASMO workflows using real agents from @asmo/core.
 * Workflows are loaded from WorkflowEngine with fallback chain.
 *
 * Usage:
 *   asmo workflow                    # List available workflows
 *   asmo workflow bug-fix --task "Fix login error"
 *   asmo workflow feature --task "Add user profile" --verbose
 */

import {
  WorkflowEngine,
  AgentRegistry,
  getConfigLoader,
  type Workflow
} from '@asmo/core'

interface WorkflowOptions {
  task?: string
  config?: string
  dryRun?: boolean
  verbose?: boolean
}

/**
 * List all available workflows
 */
async function listAvailableWorkflows(engine: WorkflowEngine): Promise<void> {
  const workflows = engine.getAllWorkflows()

  console.log('\n📋 Available Workflows:\n')

  if (workflows.length === 0) {
    console.log('   No workflows found.')
    console.log('\n   Ensure workflows exist in one of these locations:')
    console.log('   - .cursor/config/orchestration/workflows')
    console.log('   - ~/.asmo/config/workflows')
    console.log('   - packages/core/templates/workflows (bundled)\n')
    return
  }

  for (const workflow of workflows) {
    console.log(`   ${workflow.id}`)
    console.log(`   ${workflow.description}`)
    console.log(`   Steps: ${workflow.steps.length} steps`)
    console.log(`   Estimated time: ${workflow.estimated_time}`)
    console.log('')
  }
}

/**
 * Find workflow by ID or name pattern
 */
function findWorkflow(workflows: Workflow[], namePattern: string): Workflow | null {
  // Try exact ID match first
  const exactMatch = workflows.find(w => w.id === namePattern)
  if (exactMatch) return exactMatch

  // Try case-insensitive partial match
  const pattern = namePattern.toLowerCase()
  return workflows.find(w =>
    w.id.toLowerCase().includes(pattern) ||
    w.description.toLowerCase().includes(pattern)
  ) || null
}

/**
 * Display workflow execution start
 */
function displayWorkflowStart(workflow: Workflow, task: string): void {
  console.log('\n' + '═'.repeat(60))
  console.log(`🚀 Executing Workflow: ${workflow.id}`)
  console.log('═'.repeat(60))
  console.log(`\n📝 Task: ${task}`)
  console.log(`\n📋 Description: ${workflow.description}`)

  if (workflow.steps && workflow.steps.length > 0) {
    console.log(`\n📊 Steps (${workflow.steps.length}):`)
    const groupedByPhase = workflow.steps.reduce((acc, step) => {
      if (!acc[step.phase]) acc[step.phase] = []
      acc[step.phase].push(step)
      return acc
    }, {} as Record<string, typeof workflow.steps>)

    for (const [phase, steps] of Object.entries(groupedByPhase)) {
      console.log(`   • ${phase}: ${steps.length} step(s)`)
    }
  }

  console.log('\n' + '═'.repeat(60) + '\n')
}

/**
 * Main workflow command handler
 */
export async function workflowCommand(name: string | undefined, options: WorkflowOptions): Promise<void> {
  try {
    // Step 1: Initialize WorkflowEngine (loads workflows with fallback)
    if (options.verbose) {
      console.log('\n⚙️  Initializing WorkflowEngine...')
    }

    // Initialize ConfigLoader to load roles and skills (uses fallback chain)
    const configLoader = await getConfigLoader()
    const roles = await configLoader.loadRoles()

    // Initialize AgentRegistry with loaded roles and config
    const agentRegistry = new AgentRegistry()
    await agentRegistry.autoDiscover(roles, configLoader)

    const engine = new WorkflowEngine(agentRegistry)
    await engine.initialize()

    // Step 2: If no name provided, list available workflows
    if (!name) {
      await listAvailableWorkflows(engine)
      return
    }

    // Step 3: Find the workflow
    const workflows = engine.getAllWorkflows()
    const workflow = findWorkflow(workflows, name)

    if (!workflow) {
      console.error(`\n❌ Workflow not found: ${name}`)
      await listAvailableWorkflows(engine)
      process.exit(1)
    }

    // Step 4: Task is required for execution
    if (!options.task) {
      console.error(`\n❌ Task description is required`)
      console.error(`\nUsage: asmo workflow ${name} --task "Your task description"`)
      process.exit(1)
    }

    // Step 5: Dry run mode - just show plan
    if (options.dryRun) {
      displayWorkflowStart(workflow, options.task)
      console.log('⚠️  DRY RUN MODE - No changes will be made\n')

      if (workflow.steps && workflow.steps.length > 0) {
        console.log('📋 Execution Plan:')
        for (const step of workflow.steps) {
          console.log(`   ${step.order}. ${step.role_id} → ${step.phase}`)
          if (step.description) {
            console.log(`      ${step.description}`)
          }
          if (step.deliverables && step.deliverables.length > 0) {
            console.log(`      Deliverables: ${step.deliverables.join(', ')}`)
          }
        }
      }

      console.log('\n' + '═'.repeat(60) + '\n')
      return
    }

    // Step 6: Execute workflow using WorkflowEngine
    displayWorkflowStart(workflow, options.task)

    console.log('🚀 Starting execution...\n')

    const result = await engine.execute(workflow.id)

    console.log('\n' + '═'.repeat(60))
    console.log('✅ Workflow completed successfully')
    console.log('═'.repeat(60) + '\n')

    if (options.verbose && result.success) {
      console.log('Result: success')
      if (result.finalState && options.verbose) {
        console.log('Final state:', result.finalState)
      }
    }

  } catch (error) {
    console.error('\n❌ Workflow execution failed:', error)
    if (error instanceof Error) {
      console.error('   Error:', error.message)
    }
    process.exit(1)
  }
}
