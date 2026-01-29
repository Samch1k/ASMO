# Party Mode - Collaborative Multi-Agent Sessions

**BMAD Phase 4: Real-time Agent Collaboration**

Party Mode enables multiple agents to work together simultaneously in collaborative sessions, discussing ideas, reaching consensus, and producing unified outputs.

## Overview

Unlike traditional sequential or parallel workflows where agents work independently, Party Mode allows agents to:
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

## Architecture

### Key Components

1. **PartySession** - Manages the collaborative session lifecycle
2. **PartyState** - Tracks active agents, messages, agreements, and convergence
3. **PartyRound** - Represents one iteration of discussion
4. **MergeAgent** - Consolidates outputs and resolves conflicts

### Session Lifecycle

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

## Usage

### Basic Example

```typescript
import { WorkflowEngine } from './workflow-engine'
import { AgentRegistry } from './agent-registry'

// Initialize engine
const registry = new AgentRegistry()
const engine = new WorkflowEngine(registry)
await engine.initialize()

// Execute Party Mode
const session = await engine.executePartyMode(
  'Design a user authentication system',
  ['architect', 'developer', 'tester'],
  undefined,
  {
    maxRounds: 3,
    convergenceThreshold: 0.8
  }
)

// Check results
console.log('Status:', session.status) // 'converged' or 'completed'
console.log('Rounds:', session.rounds.length)
console.log('Agreements:', session.state.agreements.length)
console.log('Convergence:', session.state.convergenceScore)
```

### With Initial State

```typescript
const session = await engine.executePartyMode(
  'Design checkout flow',
  ['architect', 'developer'],
  {
    context: { projectType: 'e-commerce' },
    taskType: 'design'
  },
  { maxRounds: 2 }
)
```

### With Facilitator

```typescript
const session = await engine.executePartyMode(
  'Team brainstorming',
  ['architect', 'developer'],
  undefined,
  {
    maxRounds: 1,
    facilitator: 'merge-coordinator'
  }
)
```

## Configuration Options

### executePartyMode() Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `task` | `string` | Task description | Required |
| `agents` | `string[]` | Array of agent role IDs | Required |
| `initialState` | `Partial<AgentState>` | Initial state | `undefined` |
| `options.maxRounds` | `number` | Maximum discussion rounds | `3` |
| `options.convergenceThreshold` | `number` | Consensus threshold (0-1) | `0.8` |
| `options.facilitator` | `string` | Optional facilitator agent | `undefined` |

### Convergence Threshold

The convergence threshold determines when consensus is reached:
- **0.5** - Low bar, quick consensus
- **0.7** - Moderate consensus
- **0.8** - High consensus (default)
- **0.9** - Very high consensus, more rounds likely

Convergence score is calculated as:
```typescript
convergenceScore = agreementScore - (criticalConflicts * 0.5)
```

## Party State

### Shared Context

Agents share a common workspace:

```typescript
interface SharedPartyContext {
  decisions: Record<string, any>    // Agreed-upon decisions
  artifacts: SharedArtifact[]       // Shared outputs
  votes: VotingRecord[]             // Voting history
  openQuestions: string[]           // Unresolved questions
  proposals: Proposal[]             // Pending proposals
}
```

### Communication

Agents can send messages:

```typescript
// Send direct message
party.sendMessage('architect', 'developer', 'What do you think?', 'question')

// Broadcast to all
party.sendMessage('architect', 'all', 'Important update', 'opinion')
```

### Proposals and Voting

Agents can propose decisions and vote:

```typescript
// Propose decision
const proposalId = party.proposeDecision(
  'architect',
  'Use REST API',
  'REST is simpler than GraphQL'
)

// Vote on proposal
party.vote('developer', proposalId, 'approve', 'Agree with REST')
party.vote('tester', proposalId, 'approve')
```

## Round Structure

Each round consists of:

1. **Start Round** - Initialize round with phase name
2. **Parallel Execution** - All agents work simultaneously
3. **Add Outputs** - Each agent contributes their findings
4. **Finalize Round** - MergeAgent consolidates and detects conflicts
5. **Calculate Convergence** - Determine consensus level

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

## Session Status

| Status | Description |
|--------|-------------|
| `initializing` | Session created, not started |
| `active` | Round in progress |
| `converged` | Consensus reached |
| `completed` | Max rounds reached without full consensus |
| `failed` | Error during execution |

## Best Practices

### 1. Choose the Right Agents

Select agents with complementary skills:
```typescript
// Good: Different perspectives
['architect', 'developer', 'tester']

// Too similar: Limited viewpoints
['developer', 'developer', 'developer']
```

### 2. Set Appropriate Rounds

- **Simple decisions**: 1-2 rounds
- **Complex discussions**: 3-4 rounds
- **Brainstorming**: 2-3 rounds

### 3. Monitor Convergence

Check convergence score to assess consensus quality:
```typescript
if (session.state.convergenceScore < 0.6) {
  console.log('Low consensus - consider additional discussion')
}
```

### 4. Review Agreements

Always review the agreements reached:
```typescript
for (const agreement of session.state.agreements) {
  console.log(`Topic: ${agreement.topic}`)
  console.log(`Decision: ${agreement.decision}`)
  console.log(`Confidence: ${(agreement.confidence * 100).toFixed(0)}%`)
  console.log(`Supporting Agents: ${agreement.supportingAgents.join(', ')}`)
}
```

### 5. Handle Unresolved Conflicts

If critical conflicts remain:
```typescript
const criticalConflicts = session.state.conflictLog.filter(
  c => c.severity === 'Critical' && !c.resolvable
)

if (criticalConflicts.length > 0) {
  // May need additional rounds or human intervention
}
```

## Examples

### Example 1: Architecture Decision

```typescript
const session = await engine.executePartyMode(
  'Choose database: SQL vs NoSQL',
  ['architect', 'developer'],
  undefined,
  {
    maxRounds: 3,
    convergenceThreshold: 0.75
  }
)

// Session converges with decision: PostgreSQL
// Reasoning: Better fit for relational data, ACID guarantees
// Confidence: 85%
```

### Example 2: API Design

```typescript
const session = await engine.executePartyMode(
  'Design RESTful API for products',
  ['architect', 'api-designer', 'developer'],
  undefined,
  { maxRounds: 2 }
)

// Agents agree on:
// - Endpoint structure: /api/v1/products
// - Pagination: cursor-based
// - Authentication: JWT (Supabase Auth)
// - Rate limiting: 100 req/min
```

### Example 3: Problem Solving

```typescript
const session = await engine.executePartyMode(
  'Resolve performance bottleneck in RFQ search',
  ['performance-engineer', 'developer', 'data-architect'],
  undefined,
  {
    maxRounds: 3,
    convergenceThreshold: 0.85
  }
)

// Agents converge on solution:
// - Add database index on search columns
// - Implement Redis caching for frequent queries
// - Optimize React Query stale time
```

## Troubleshooting

### Low Convergence

If convergence score is low:
- Increase max rounds
- Lower convergence threshold
- Add facilitator agent
- Review conflicting viewpoints

### Too Many Rounds

If reaching max rounds:
- Simplify the task
- Reduce number of agents
- Lower convergence threshold
- Check for fundamental disagreements

### Poor Decisions

If decisions are low quality:
- Choose more experienced agents
- Provide better initial context
- Review agent prompts
- Check data quality in state

## Performance Considerations

- **Agent count**: 3-5 agents is optimal
- **Round count**: 1-3 rounds for most tasks
- **Convergence**: 0.7-0.8 is a good balance
- **Execution time**: ~30s per agent per round

## Related Features

- **Parallel Execution** - Multiple agents work simultaneously
- **MergeAgent** - Conflict resolution and consolidation
- **Adaptive Selection** - Automatically choose appropriate workflow
- **Intelligent Help** - Get recommendations for Party Mode usage

## API Reference

### PartySession Class

```typescript
class PartySession {
  constructor(
    id: string,
    name: string,
    description: string,
    agents: AgentWithRoleSkills[],
    facilitator?: string,
    mergeAgent?: MergeAgent
  )

  async startRound(phase: string): Promise<PartyRound>
  addAgentOutput(agentId: string, output: any): void
  sendMessage(from: string, to: string | 'all', content: string, type: MessageType): void
  proposeDecision(proposer: string, title: string, description: string): string
  vote(voter: string, proposalId: string, choice: VoteChoice, reasoning?: string): void
  async finalizeRound(): Promise<PartyRound>
  hasReachedConsensus(threshold?: number): boolean
  async complete(): Promise<PartySession>
  getState(): PartyState
  getSession(): PartySession
}
```

### WorkflowEngine.executePartyMode()

```typescript
async executePartyMode(
  task: string,
  agents: string[],
  initialState?: Partial<AgentState>,
  options?: {
    maxRounds?: number
    convergenceThreshold?: number
    facilitator?: string
  }
): Promise<PartySession>
```

## Next Steps

- **Integrate with workflows** - Use Party Mode in complex workflows
- **Customize agents** - Tailor agent behavior for your domain
- **Monitor metrics** - Track convergence and decision quality
- **Iterate and improve** - Refine based on results

---

**See Also**:
- [Adaptive Workflow Selection](./adaptive-workflows.md)
- [Intelligent Help System](./intelligent-help.md)
- [Parallel Execution](../orchestration/parallel-execution.md)
