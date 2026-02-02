# Party Mode

Party Mode enables multiple agents to collaborate in real-time, discussing ideas, reaching consensus, and producing unified outputs.

## Overview

Unlike sequential workflows where agents work independently, Party Mode allows agents to:

- **See each other's work** in real-time
- **Communicate bidirectionally** through messages
- **Build consensus** through voting and proposals
- **Iterate together** across multiple discussion rounds
- **Resolve conflicts** automatically using the MergeAgent

## When to Use Party Mode

Party Mode is ideal for:

- **Complex decisions** requiring multiple perspectives
- **Brainstorming sessions** for system design
- **Architecture discussions** with trade-off analysis
- **Problem-solving** that benefits from collaboration
- **Consensus building** on technical approaches

## Basic Usage

```typescript
import { WorkflowEngine, AgentRegistry } from '@asmo/core'

const registry = new AgentRegistry()
const engine = new WorkflowEngine(registry)
await engine.initialize()

// Execute Party Mode
const session = await engine.executePartyMode(
  'Design a user authentication system',
  ['architect', 'developer', 'security-specialist'],
  undefined,
  {
    maxRounds: 3,
    convergenceThreshold: 0.8
  }
)

console.log('Status:', session.status)
console.log('Agreements:', session.state.agreements)
console.log('Convergence:', session.state.convergenceScore)
```

## Session Lifecycle

```
Initialize → Round 1 → Round 2 → ... → Round N → Complete
              ↓          ↓                 ↓
           Agents     Agents           Agents
           work →     work →           work →
           parallel   parallel         parallel
              ↓          ↓                 ↓
           Finalize   Finalize         Finalize
           (merge &   (merge &         (merge &
            consensus) consensus)       consensus)
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxRounds` | number | 3 | Maximum discussion rounds |
| `convergenceThreshold` | number | 0.8 | Consensus threshold (0-1) |
| `facilitator` | string | - | Optional facilitator agent |

### Convergence Threshold

- **0.5** - Low bar, quick consensus
- **0.7** - Moderate consensus
- **0.8** - High consensus (default)
- **0.9** - Very high, more rounds likely

## Rounds and Phases

### Round Structure

Each round consists of:

1. **Start Round** - Initialize with phase name
2. **Parallel Execution** - All agents work simultaneously
3. **Add Outputs** - Each agent contributes findings
4. **Finalize Round** - Merge and detect conflicts
5. **Calculate Convergence** - Determine consensus level

### Round Data

```typescript
interface PartyRound {
  roundNumber: number
  phase: string
  agentOutputs: Map<string, any>
  messages: PartyMessage[]
  agreements: Agreement[]
  conflicts: ConflictDetection[]
  summary: string
  convergenceScore: number
  duration: number
}
```

## Brainstorming Sessions

For structured decision-making, use brainstorming mode:

```typescript
import { createBrainstormingSession } from '@asmo/core'

const session = createBrainstormingSession(
  'API Authentication Strategy',
  ['architect', 'security-specialist', 'developer'],
  { generateADR: true, convergenceThreshold: 0.7 }
)

const result = await session.execute()
console.log(result.finalDecision)
console.log(result.adrPath) // Path to generated ADR
```

### Brainstorming Rounds

| Round | Phase | Output |
|-------|-------|--------|
| 1 | Independent Proposals | Each agent proposes solutions |
| 2 | Cross-Critique | Agents evaluate each other's proposals |
| 3 | Synthesis | Combine best ideas, vote |
| 4 | Decision | Final decision + ADR generation |

## Communication

### Sending Messages

```typescript
// Direct message
party.sendMessage('architect', 'developer', 'What do you think?', 'question')

// Broadcast to all
party.sendMessage('architect', 'all', 'Important update', 'opinion')
```

### Message Types

- `question` - Asking for input
- `opinion` - Sharing viewpoint
- `proposal` - Suggesting solution
- `agreement` - Expressing consensus
- `concern` - Raising issues

## Proposals and Voting

```typescript
// Propose decision
const proposalId = party.proposeDecision(
  'architect',
  'Use REST API',
  'REST is simpler than GraphQL for our use case'
)

// Vote on proposal
party.vote('developer', proposalId, 'approve', 'Agree with REST')
party.vote('security-specialist', proposalId, 'approve')
```

### Vote Choices

- `approve` - Support the proposal
- `reject` - Oppose the proposal
- `abstain` - No preference

## Session Status

| Status | Description |
|--------|-------------|
| `initializing` | Session created, not started |
| `active` | Round in progress |
| `converged` | Consensus reached |
| `completed` | Max rounds reached |
| `failed` | Error during execution |

## Working with Results

### Checking Agreements

```typescript
for (const agreement of session.state.agreements) {
  console.log(`Topic: ${agreement.topic}`)
  console.log(`Decision: ${agreement.decision}`)
  console.log(`Confidence: ${(agreement.confidence * 100).toFixed(0)}%`)
  console.log(`Supporting: ${agreement.supportingAgents.join(', ')}`)
}
```

### Handling Conflicts

```typescript
const criticalConflicts = session.state.conflictLog.filter(
  c => c.severity === 'Critical' && !c.resolvable
)

if (criticalConflicts.length > 0) {
  console.log('Unresolved conflicts - may need human intervention')
}
```

## Best Practices

### 1. Choose Complementary Agents

```typescript
// Good: Different perspectives
['architect', 'developer', 'tester']

// Bad: Too similar
['developer', 'developer', 'developer']
```

### 2. Set Appropriate Rounds

- **Simple decisions**: 1-2 rounds
- **Complex discussions**: 3-4 rounds
- **Brainstorming**: 2-3 rounds

### 3. Monitor Convergence

```typescript
if (session.state.convergenceScore < 0.6) {
  console.log('Low consensus - consider additional discussion')
}
```

## Examples

### Architecture Decision

```typescript
const session = await engine.executePartyMode(
  'Choose database: SQL vs NoSQL',
  ['architect', 'data-architect', 'developer'],
  undefined,
  { maxRounds: 3 }
)

// Result: PostgreSQL selected
// Reasoning: Better fit for relational data
// Confidence: 85%
```

### API Design

```typescript
const session = await engine.executePartyMode(
  'Design RESTful API for products',
  ['architect', 'api-designer', 'developer'],
  undefined,
  { maxRounds: 2 }
)

// Agreements:
// - Endpoint structure: /api/v1/products
// - Pagination: cursor-based
// - Authentication: JWT
```

## Troubleshooting

### Low Convergence

- Increase max rounds
- Lower convergence threshold
- Add facilitator agent
- Review conflicting viewpoints

### Too Many Rounds

- Simplify the task
- Reduce number of agents
- Lower convergence threshold

## See Also

- [Agents](../concepts/agents.md)
- [Workflows](../concepts/workflows.md)
- [Custom Agents](./custom-agents.md)
