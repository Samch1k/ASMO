# Multi-Agent Collaboration Example

Use Party Mode to have multiple agents collaborate on complex decisions.

## Scenario

You need to design a database schema for a new user management system. This requires input from multiple perspectives: architecture, database design, and implementation.

## Basic Party Mode

```typescript
import { WorkflowEngine, AgentRegistry } from '@asmo/core'

async function main() {
  const registry = new AgentRegistry()
  const engine = new WorkflowEngine(registry)
  await engine.initialize()

  // Start a collaborative session
  const session = await engine.executePartyMode(
    'Design a database schema for user management with roles and permissions',
    ['architect', 'data-architect', 'developer'],
    undefined,
    {
      maxRounds: 3,
      convergenceThreshold: 0.8
    }
  )

  console.log('Session Status:', session.status)
  console.log('Convergence:', session.state.convergenceScore)
  console.log('Agreements:', session.state.agreements.length)
}
```

## Detailed Session Analysis

```typescript
async function collaborativeDesign() {
  const registry = new AgentRegistry()
  const engine = new WorkflowEngine(registry)
  await engine.initialize()

  console.log('🎉 Starting Party Mode Session\n')

  const session = await engine.executePartyMode(
    'Design a database schema for user management with roles and permissions',
    ['architect', 'data-architect', 'developer'],
    undefined,
    {
      maxRounds: 3,
      convergenceThreshold: 0.75
    }
  )

  // Session overview
  console.log('📊 Session Results')
  console.log('==================')
  console.log(`Status: ${session.status}`)
  console.log(`Rounds: ${session.rounds.length}`)
  console.log(`Convergence: ${(session.state.convergenceScore * 100).toFixed(0)}%`)

  // Show each round
  console.log('\n📋 Round Summaries:')
  for (const round of session.rounds) {
    console.log(`\n  Round ${round.roundNumber}: ${round.phase}`)
    console.log(`  Duration: ${round.duration}ms`)
    console.log(`  Convergence: ${(round.convergenceScore * 100).toFixed(0)}%`)
    console.log(`  Summary: ${round.summary.slice(0, 100)}...`)
  }

  // Show agreements
  console.log('\n✅ Agreements Reached:')
  for (const agreement of session.state.agreements) {
    console.log(`\n  Topic: ${agreement.topic}`)
    console.log(`  Decision: ${agreement.decision}`)
    console.log(`  Confidence: ${(agreement.confidence * 100).toFixed(0)}%`)
    console.log(`  Supported by: ${agreement.supportingAgents.join(', ')}`)
  }

  // Show any unresolved conflicts
  const unresolved = session.state.conflictLog.filter(c => !c.resolvable)
  if (unresolved.length > 0) {
    console.log('\n⚠️ Unresolved Conflicts:')
    for (const conflict of unresolved) {
      console.log(`  - ${conflict.description}`)
    }
  }
}

collaborativeDesign()
```

## Example Output

```
🎉 Starting Party Mode Session

📊 Session Results
==================
Status: converged
Rounds: 3
Convergence: 87%

📋 Round Summaries:

  Round 1: discussion
  Duration: 45000ms
  Convergence: 45%
  Summary: Initial proposals from each agent. Architect suggested normalized schema...

  Round 2: refinement
  Duration: 38000ms
  Convergence: 72%
  Summary: Cross-critique of proposals. Data architect emphasized indexing...

  Round 3: consensus
  Duration: 32000ms
  Convergence: 87%
  Summary: Final agreement on schema structure with role-based access...

✅ Agreements Reached:

  Topic: Table Structure
  Decision: Use separate tables for users, roles, and permissions with junction tables
  Confidence: 92%
  Supported by: architect, data-architect, developer

  Topic: Primary Keys
  Decision: UUID for all primary keys for distributed system compatibility
  Confidence: 88%
  Supported by: architect, data-architect

  Topic: Indexing Strategy
  Decision: Composite indexes on (user_id, role_id) and (role_id, permission_id)
  Confidence: 85%
  Supported by: data-architect, developer
```

## Brainstorming Session

For architectural decisions with ADR generation:

```typescript
import { createBrainstormingSession } from '@asmo/core'

async function architecturalDecision() {
  const session = createBrainstormingSession(
    'Choose between REST and GraphQL for the public API',
    ['architect', 'api-designer', 'developer'],
    {
      generateADR: true,
      convergenceThreshold: 0.7
    }
  )

  const result = await session.execute()

  console.log('📝 Decision Made:')
  console.log(result.finalDecision)

  console.log('\n📄 ADR Generated:')
  console.log(`Path: ${result.adrPath}`)
}
```

## Real-time Monitoring

Monitor the session as it progresses:

```typescript
async function monitorSession() {
  const registry = new AgentRegistry()
  const engine = new WorkflowEngine(registry)
  await engine.initialize()

  // Create session manually for monitoring
  const session = engine.createPartySession(
    'API authentication approach',
    ['architect', 'security-specialist', 'developer']
  )

  // Monitor rounds
  session.on('roundStart', (round) => {
    console.log(`\n🔄 Round ${round.roundNumber} starting...`)
  })

  session.on('agentOutput', (agentId, output) => {
    console.log(`  📤 ${agentId}: ${output.summary}`)
  })

  session.on('roundEnd', (round) => {
    console.log(`  ✓ Round ${round.roundNumber} complete`)
    console.log(`    Convergence: ${(round.convergenceScore * 100).toFixed(0)}%`)
  })

  session.on('agreement', (agreement) => {
    console.log(`  🤝 Agreement: ${agreement.topic}`)
  })

  // Execute
  await session.execute()
}
```

## Handling Conflicts

```typescript
async function handleConflicts() {
  const registry = new AgentRegistry()
  const engine = new WorkflowEngine(registry)
  await engine.initialize()

  const session = await engine.executePartyMode(
    'Choose frontend framework: React vs Vue vs Svelte',
    ['architect', 'ui-developer', 'developer']
  )

  // Check for critical unresolved conflicts
  const criticalConflicts = session.state.conflictLog.filter(
    c => c.severity === 'Critical' && !c.resolvable
  )

  if (criticalConflicts.length > 0) {
    console.log('⚠️ Critical conflicts need human resolution:')
    for (const conflict of criticalConflicts) {
      console.log(`\n  Conflict: ${conflict.description}`)
      console.log(`  Agents: ${conflict.agents.join(' vs ')}`)
      console.log(`  Positions:`)
      for (const [agent, position] of Object.entries(conflict.positions)) {
        console.log(`    - ${agent}: ${position}`)
      }
    }

    // Might need to run additional rounds or get human input
  }
}
```

## Configuration Options

```typescript
const session = await engine.executePartyMode(
  task,
  agents,
  initialState,
  {
    // Maximum discussion rounds (default: 3)
    maxRounds: 5,

    // Consensus threshold (default: 0.8)
    convergenceThreshold: 0.7,

    // Optional facilitator agent
    facilitator: 'merge-coordinator',

    // Per-round timeout in ms
    roundTimeout: 120000
  }
)
```

## Next Steps

- [Party Mode Guide](../guides/party-mode.md) - Deep dive
- [Custom Agents](../guides/custom-agents.md) - Add your own agents
