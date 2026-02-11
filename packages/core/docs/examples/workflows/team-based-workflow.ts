/**
 * Example: Team-Based Workflow Execution
 *
 * This example demonstrates how to:
 * 1. Initialize the ASMO orchestration system
 * 2. Create a workflow from a predefined team
 * 3. Execute the workflow with automatic mode selection
 * 4. Handle execution results
 */

import { WorkflowEngine, AgentRegistry, getConfigLoader } from '@asmo/core'

async function main() {
  console.log('🚀 ASMO Team-Based Workflow Example\n')

  // ============================================================================
  // Step 1: Initialize System
  // ============================================================================

  console.log('1️⃣  Initializing ASMO...')

  // Load configuration
  const configLoader = await getConfigLoader()

  // Load roles and skills
  const roles = await configLoader.loadRoles()
  console.log(`   ✓ Loaded ${roles.length} roles`)

  // Initialize agent registry
  const registry = new AgentRegistry()
  await registry.autoDiscover(roles, configLoader)
  console.log(`   ✓ Registered ${registry.getAllAgents().length} agents\n`)

  // Create workflow engine
  const engine = WorkflowEngine.create(registry)
  await engine.initialize()
  console.log('   ✓ WorkflowEngine initialized\n')

  // ============================================================================
  // Step 2: Create Workflow from Team
  // ============================================================================

  console.log('2️⃣  Creating workflow from team...')

  const teamId = 'feature-team'
  const taskId = 'task-123'
  const taskDescription = 'Implement user authentication with OAuth2 and JWT tokens'

  console.log(`   Team: ${teamId}`)
  console.log(`   Task: ${taskDescription}\n`)

  // Create workflow from team configuration
  const workflow = engine.createWorkflowFromTeam(
    teamId,
    taskId,
    taskDescription
  )

  console.log(`   ✓ Created workflow: ${workflow.name}`)
  console.log(`   ✓ Steps: ${workflow.steps.length}`)
  console.log(`   ✓ Agents: ${workflow.steps.map(s => s.agent.agentId).join(', ')}\n`)

  // ============================================================================
  // Step 3: Execute Workflow
  // ============================================================================

  console.log('3️⃣  Executing workflow...\n')

  // Execute workflow with options
  const result = await engine.executeWorkflow(workflow, {
    verbose: true,           // Detailed logging
    approvalRequired: true   // Require user approval at checkpoints
  })

  // ============================================================================
  // Step 4: Handle Results
  // ============================================================================

  console.log('\n4️⃣  Workflow Results:\n')
  console.log(`   Status: ${result.status}`)
  console.log(`   Session Type: ${result.sessionType || 'sequential'}`)
  console.log(`   Agents Executed: ${result.agentResults.length}`)

  if (result.totalRounds) {
    console.log(`   Total Rounds: ${result.totalRounds}`)
  }

  if (result.convergenceReached !== undefined) {
    console.log(`   Convergence Reached: ${result.convergenceReached}`)
    console.log(`   Convergence Score: ${result.convergenceScore?.toFixed(2)}`)
  }

  // Display agent results
  console.log('\n   Agent Results:')
  result.agentResults.forEach((agentResult, index) => {
    console.log(`   ${index + 1}. ${agentResult.agent} — ${agentResult.status}`)
    if (agentResult.artifacts && agentResult.artifacts.length > 0) {
      console.log(`      Artifacts: ${agentResult.artifacts.length}`)
    }
  })

  console.log('\n✅ Workflow completed!\n')
}

// ============================================================================
// Example 2: Multiple Teams
// ============================================================================

async function multipleTeamsExample() {
  console.log('🔄 Multiple Teams Example\n')

  const configLoader = await getConfigLoader()
  const roles = await configLoader.loadRoles()
  const registry = new AgentRegistry()
  await registry.autoDiscover(roles, configLoader)
  const engine = WorkflowEngine.create(registry)
  await engine.initialize()

  // Execute different teams for different tasks
  const tasks = [
    { team: 'bugfix-team', task: 'Fix login timeout bug' },
    { team: 'feature-team', task: 'Add two-factor authentication' },
    { team: 'security-team', task: 'Security audit of authentication flow' }
  ]

  for (const { team, task } of tasks) {
    console.log(`📋 Team: ${team}`)
    console.log(`   Task: ${task}`)

    const workflow = engine.createWorkflowFromTeam(team, `task-${Date.now()}`, task)
    const result = await engine.executeWorkflow(workflow)

    console.log(`   Result: ${result.status}`)
    console.log(`   Mode: ${result.sessionType || 'sequential'}\n`)
  }
}

// ============================================================================
// Example 3: Custom Workflow with Team Base
// ============================================================================

async function customWorkflowExample() {
  console.log('🎨 Custom Workflow Example\n')

  const configLoader = await getConfigLoader()
  const roles = await configLoader.loadRoles()
  const registry = new AgentRegistry()
  await registry.autoDiscover(roles, configLoader)
  const engine = WorkflowEngine.create(registry)
  await engine.initialize()

  // Start with team workflow
  const workflow = engine.createWorkflowFromTeam(
    'feature-team',
    'custom-task',
    'Complex feature with custom steps'
  )

  // Add custom steps to the workflow
  const customAgent = registry.getAgent('tech-writer')
  if (customAgent) {
    workflow.steps.push({
      agent: customAgent,
      phase: 'documentation',
      parallel: false,
      context: {
        focus: 'API documentation and user guides'
      }
    })
  }

  console.log('✓ Created custom workflow with additional documentation step')
  console.log(`  Total steps: ${workflow.steps.length}\n`)

  const result = await engine.executeWorkflow(workflow)
  console.log(`✓ Workflow completed: ${result.status}\n`)
}

// ============================================================================
// Run Examples
// ============================================================================

if (require.main === module) {
  main()
    .then(() => {
      console.log('All examples completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Error:', error.message)
      process.exit(1)
    })
}

// Export for use in other modules
export { main, multipleTeamsExample, customWorkflowExample }
