# Basic Workflow Example

A step-by-step example of running a simple bug fix workflow.

## Scenario

You have a bug: the login button doesn't respond to clicks. Let's use ASMO to fix it.

## Setup

```typescript
import { WorkflowEngine, AgentRegistry } from '@asmo/core'

async function main() {
  // 1. Create the registry and engine
  const registry = new AgentRegistry()
  const engine = new WorkflowEngine(registry)

  // 2. Initialize (loads workflows and agents)
  await engine.initialize()

  console.log(`Loaded ${engine.getWorkflows().length} workflows`)
  console.log(`Registered ${registry.getAgents().length} agents`)
}

main()
```

## Execute the Bug Fix

```typescript
async function fixBug() {
  const registry = new AgentRegistry()
  const engine = new WorkflowEngine(registry)
  await engine.initialize()

  // Describe the bug
  const result = await engine.execute(
    'Fix the login button - it does not respond to clicks on the login page'
  )

  // Check the result
  console.log('Status:', result.status)
  console.log('Workflow:', result.workflowId)
  console.log('Steps completed:', result.steps.length)

  // Review artifacts produced
  for (const artifact of result.artifacts) {
    console.log(`Artifact: ${artifact.type} at ${artifact.path}`)
  }
}
```

## Understanding the Output

The bug fix workflow executes three steps:

### Step 1: Investigation (Debugger)

```
Phase: investigation
Agent: debugger
Duration: 15 minutes

Output:
- Bug report identifying the issue
- Root cause: onClick handler not attached
- Reproduction steps documented
```

### Step 2: Fix Implementation (Developer)

```
Phase: fix_implementation
Agent: developer
Duration: 30 minutes

Output:
- Code fix in src/components/LoginButton.tsx
- Unit tests in tests/LoginButton.test.tsx
```

### Step 3: Verification (Tester)

```
Phase: verification
Agent: tester
Duration: 20 minutes

Output:
- E2E test results: PASS
- Bug no longer reproduces
```

## Complete Example

```typescript
import { WorkflowEngine, AgentRegistry } from '@asmo/core'

async function main() {
  // Initialize
  const registry = new AgentRegistry()
  const engine = new WorkflowEngine(registry)
  await engine.initialize()

  console.log('🐛 Starting bug fix workflow...\n')

  // Execute
  const result = await engine.execute(
    'Fix the login button - it does not respond to clicks on the login page'
  )

  // Report results
  console.log('📊 Results:')
  console.log(`  Status: ${result.status}`)
  console.log(`  Workflow: ${result.workflowId}`)
  console.log(`  Total time: ${result.metrics.totalTime}ms`)
  console.log(`  Agents used: ${result.metrics.agentsUsed.join(', ')}`)

  console.log('\n📦 Artifacts:')
  for (const artifact of result.artifacts) {
    console.log(`  - [${artifact.type}] ${artifact.path}`)
  }

  console.log('\n✅ Bug fix complete!')
}

main().catch(console.error)
```

## Expected Output

```
🐛 Starting bug fix workflow...

📊 Results:
  Status: completed
  Workflow: bug_fix_workflow
  Total time: 3900000ms
  Agents used: debugger, developer, tester

📦 Artifacts:
  - [diagnosis] docs/bugs/login-button-fix.md
  - [code] src/components/LoginButton.tsx
  - [test] tests/LoginButton.test.tsx
  - [report] docs/test-results/login-button.json

✅ Bug fix complete!
```

## Next Steps

- [Adaptive Selection](./adaptive-selection.md) - Let ASMO choose the workflow
- [Multi-Agent](./multi-agent.md) - Collaborate with multiple agents
