# Quick Start

Get your first ASMO workflow running in 5 minutes!

## Prerequisites

Make sure you have [installed ASMO](./installation.md) before continuing.

## Step 1: Initialize the Engine

```typescript
import { WorkflowEngine, AgentRegistry } from '@asmo/core'

// Create the agent registry and workflow engine
const registry = new AgentRegistry()
const engine = new WorkflowEngine(registry)

// Initialize the engine (loads workflows and agents)
await engine.initialize()

console.log(`Loaded ${engine.getWorkflows().length} workflows`)
console.log(`Registered ${registry.getAgents().length} agents`)
```

## Step 2: Run a Simple Workflow

### Option A: Execute by Workflow ID

```typescript
// Execute a specific workflow
const result = await engine.executeWorkflow('bug_fix_workflow', {
  task: 'Fix the login button not responding to clicks'
})

console.log('Result:', result)
```

### Option B: Adaptive Workflow Selection (Recommended)

Let ASMO automatically select the best workflow based on your task description:

```typescript
// Describe your task in natural language
const result = await engine.execute(
  'Add user authentication with OAuth2 and JWT tokens',
  undefined,
  {
    projectSize: 'large',
    techStack: ['Node.js', 'PostgreSQL']
  }
)

console.log('Selected workflow:', result.workflowId)
console.log('Complexity:', result.complexityScore)
```

## Step 3: Analyze Task Complexity

Before executing, you can analyze task complexity:

```typescript
const selection = await engine.selectWorkflowAdaptively(
  'Refactor the authentication module for better security',
  { projectSize: 'medium' }
)

console.log('Complexity Level:', selection.complexity.level)
console.log('Complexity Score:', selection.complexity.score)
console.log('Confidence:', selection.confidence)
console.log('Reasoning:', selection.reasoning)
console.log('Recommended Workflow:', selection.workflow.name)
console.log('Recommended Agents:', selection.complexity.recommendedAgents)
```

## Step 4: Use Party Mode (Multi-Agent Collaboration)

For complex decisions, use Party Mode to have multiple agents collaborate:

```typescript
const session = await engine.executePartyMode(
  'Design the database schema for a user management system',
  ['architect', 'data-architect', 'developer'],
  undefined,
  {
    maxRounds: 3,
    convergenceThreshold: 0.8
  }
)

console.log('Session Status:', session.status)
console.log('Agreements:', session.state.agreements)
console.log('Convergence Score:', session.state.convergenceScore)
```

## Complete Example

Here's a complete example bringing it all together:

```typescript
import { WorkflowEngine, AgentRegistry } from '@asmo/core'

async function main() {
  // Initialize
  const registry = new AgentRegistry()
  const engine = new WorkflowEngine(registry)
  await engine.initialize()

  // Analyze task
  const task = 'Add a user profile page with avatar upload'
  const selection = await engine.selectWorkflowAdaptively(task)

  console.log('\n📊 Task Analysis:')
  console.log(`  Task: ${task}`)
  console.log(`  Complexity: ${selection.complexity.level} (${selection.complexity.score}/100)`)
  console.log(`  Workflow: ${selection.workflow.name}`)
  console.log(`  Agents: ${selection.complexity.recommendedAgents.join(', ')}`)

  // Execute
  console.log('\n🚀 Executing workflow...')
  const result = await engine.execute(task)

  console.log('\n✅ Workflow complete!')
  console.log('Result:', JSON.stringify(result, null, 2))
}

main().catch(console.error)
```

## Complexity Levels

ASMO categorizes tasks into 5 complexity levels:

| Level | Score | Example Tasks | Default Workflow |
|-------|-------|---------------|------------------|
| Trivial | 0-20 | Fix typo, update text | YOLO Mode |
| Simple | 21-40 | Simple bug fix, small feature | Quick Flow |
| Medium | 41-60 | New component, refactoring | Feature Development |
| Complex | 61-80 | Security, API design | Full Planning |
| Enterprise | 81-100 | Architecture, migrations | Brainstorming + Review |

## Available Workflows

| # | Workflow | Use Case |
|---|----------|----------|
| 1 | Quick Flow | Fast bug fixes |
| 2 | Feature Development | Complete feature lifecycle |
| 3 | Quality Assurance | Comprehensive testing |
| 4 | Advanced Bug Fix | Complex bug resolution |
| 5 | Refactoring | Code quality improvement |
| 6 | Performance Optimization | Speed improvements |
| 7 | Security Audit | Security assessment |
| 8 | Architecture Design | System design |
| 9 | Database Migration | Schema changes |
| 10 | API Design | API contracts |

## Next Steps

- [Configuration](./configuration.md) - Customize ASMO for your project
- [Concepts](../concepts/index.md) - Understand how ASMO works
- [Guides](../guides/index.md) - Learn advanced features
- [Examples](../examples/index.md) - See more code examples
