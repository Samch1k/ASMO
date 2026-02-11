# Execution Modes

**Phase 3 Feature** — Dynamic execution modes for multi-agent collaboration.

---

## Table of Contents

1. [Overview](#overview)
2. [Sequential Mode](#sequential-mode)
3. [Party Mode](#party-mode)
4. [Brainstorming Mode](#brainstorming-mode)
5. [Mode Selection](#mode-selection)
6. [Integration with Teams](#integration-with-teams)
7. [Configuration](#configuration)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Overview

ASMO supports three execution modes that determine how agents collaborate during workflow execution:

| Mode | When | Agents | Use Case |
|------|------|--------|----------|
| **Sequential** | Simple tasks (< 60) | One at a time | Bug fixes, simple features |
| **Party** | Complex tasks (≥ 60) | Parallel + consensus | Architecture, complex features |
| **Brainstorming** | Design tasks | 4-round process | Design decisions, ADR generation |

**Key Characteristics:**

- **Automatic Selection** — Mode chosen based on task complexity and patterns
- **Dynamic Adaptation** — System adapts to task requirements
- **Token Optimization** — Sequential for simple, party for complex
- **Consensus Building** — Party mode includes convergence mechanism

---

## Sequential Mode

**Default mode** for simple to medium complexity tasks.

### When Activated

- Complexity score < 60
- Single pattern detected
- Straightforward implementation tasks

### How It Works

Agents execute workflow steps one by one in sequence:

```
Step 1: Architect (design phase)
  ↓
Step 2: Developer (implementation phase)
  ↓
Step 3: Tester (validation phase)
  ↓
Done
```

### Characteristics

✅ **Predictable** — Clear execution order
✅ **Efficient** — Lower token usage
✅ **Fast** — Minimal coordination overhead
✅ **Simple** — Easy to understand and debug

### Example

```typescript
import { WorkflowEngine } from '@asmo/core'

const engine = WorkflowEngine.create(registry)
await engine.initialize()

// Simple task → Sequential mode
const result = await engine.execute('Fix typo in README')

// Result:
// {
//   sessionType: 'sequential',
//   agentsExecuted: ['developer'],
//   totalRounds: 1
// }
```

### Use Cases

- Bug fixes
- Simple feature additions
- Documentation updates
- Refactoring small modules
- Quick patches

---

## Party Mode

**Parallel collaboration mode** for complex, multi-faceted tasks.

### When Activated

- Complexity score ≥ 60
- Multiple patterns detected
- Cross-cutting concerns (security + performance)

### How It Works

Multiple agents work in parallel through consensus rounds:

```
Round 1: Architect + Developer + Tester (parallel)
  ↓ (discuss & refine)
Round 2: Convergence check → 60% agreement
  ↓ (continue refining)
Round 3: Convergence check → 85% agreement ✅
  ↓
Consensus reached → Done
```

### Characteristics

🎭 **Parallel Execution** — Agents work simultaneously
🗣️ **Consensus Building** — Multiple rounds of discussion
📊 **Convergence Tracking** — Measures agreement between agents
🔄 **Iterative Refinement** — Solutions improve over rounds
🎯 **Quality Focus** — Multiple perspectives reduce blind spots

### Configuration

```typescript
interface PartyModeConfig {
  type: 'party'
  maxRounds: number              // Default: 5
  convergenceThreshold: number   // Default: 0.8 (80%)
  generateADR: boolean           // Default: false
}
```

### Activation Logic

```typescript
// Automatic activation by SkillMatcher
if (complexity >= 60 && multiplePatterns) {
  return {
    type: 'party',
    maxRounds: 5,
    convergenceThreshold: 0.8,
    reasoning: 'High complexity with multiple patterns detected'
  }
}
```

### Convergence Mechanism

Party mode measures agreement between agent outputs:

```typescript
// Convergence calculated after each round
const similarity = calculateSimilarity(
  agentOutputs[round],
  agentOutputs[round - 1]
)

if (similarity >= convergenceThreshold) {
  // Consensus reached
  return consolidatedResult
}

if (round >= maxRounds) {
  // Max rounds reached, use best result
  return bestResult
}

// Continue to next round
```

### Example

```typescript
// Complex task → Party mode
const result = await engine.execute(
  'Design and implement OAuth2 authentication with refresh tokens and security audit'
)

// Result:
// {
//   sessionType: 'party',
//   agentsExecuted: ['security-specialist', 'developer', 'tester'],
//   totalRounds: 3,
//   convergenceReached: true,
//   convergenceScore: 0.85
// }
```

### Use Cases

- Architecture decisions
- Security implementations
- Performance optimizations
- Complex feature implementations
- API design
- Database schema design

---

## Brainstorming Mode

**Structured exploration mode** for design and architecture tasks.

### When Activated

- Design and architecture tasks
- Workflow pattern: `design_brainstorming_workflow`
- Explicit brainstorming request

### How It Works

Four-round structured process:

#### Round 1: Independent Proposals

Each agent proposes their solution independently:

```
Architect → Proposal A
Developer → Proposal B
Designer → Proposal C
```

#### Round 2: Cross Critique

Agents review and critique each other's proposals:

```
Architect reviews B, C
Developer reviews A, C
Designer reviews A, B
```

#### Round 3: Synthesis & Voting

Combine best ideas and vote:

```
Combined Proposal:
- API design from A
- Data model from B
- Security approach from C

Voting: A=2, B=3, C=1 → Proposal B wins
```

#### Round 4: Final Decision + ADR

Document the chosen approach with ADR:

```markdown
# ADR: OAuth2 Implementation Strategy

## Status
Accepted

## Context
Need secure authentication for API...

## Decision
Use OAuth2 with JWT tokens...

## Consequences
+ Improved security
+ Industry standard
- Additional complexity
```

### Characteristics

📋 **Structured Process** — Fixed 4-round format
📝 **ADR Generation** — Architecture Decision Record created
🗳️ **Voting Mechanism** — Democratic decision making
🔍 **Explicit Pros/Cons** — Trade-offs documented
📖 **Knowledge Capture** — Decision rationale preserved

### Configuration

```typescript
interface BrainstormingConfig {
  type: 'brainstorming'
  maxRounds: 4                // Always 4 rounds
  generateADR: true           // Always true
}
```

### Example

```typescript
// Design task → Brainstorming mode
const result = await engine.execute(
  'Design the authentication system architecture'
)

// Result:
// {
//   sessionType: 'brainstorming',
//   agentsExecuted: ['architect', 'security-specialist', 'developer'],
//   totalRounds: 4,
//   adrGenerated: true,
//   chosenProposal: 'B',
//   votingResults: { A: 2, B: 3, C: 1 }
// }
```

### Use Cases

- System architecture design
- Technology stack selection
- API design patterns
- Data model design
- Integration strategy
- Performance architecture

---

## Mode Selection

### Automatic Selection

Modes are selected automatically by `SkillMatcher.detectSessionType()`:

```typescript
import { SkillMatcher } from '@asmo/core'

const skillMatcher = new SkillMatcher(registry)

// Analyze task
const sessionType = await skillMatcher.detectSessionType(
  'Implement OAuth2 authentication',
  65  // complexity score
)

console.log(sessionType)
// {
//   type: 'party',
//   maxRounds: 5,
//   convergenceThreshold: 0.8,
//   generateADR: false,
//   reasoning: 'High complexity (65) with security and architecture patterns'
// }
```

### Selection Criteria

```typescript
// Simplified selection logic
function selectExecutionMode(task: string, complexity: number) {
  // Check for explicit brainstorming request
  if (task.includes('design') || task.includes('architecture')) {
    return { type: 'brainstorming' }
  }

  // Check complexity threshold
  if (complexity >= 60) {
    return {
      type: 'party',
      maxRounds: 5,
      convergenceThreshold: 0.8
    }
  }

  // Default to sequential
  return { type: 'sequential' }
}
```

### Manual Override

Force a specific mode:

```typescript
// Force party mode
const result = await engine.executeWorkflow(workflow, {
  sessionType: 'party',
  maxRounds: 3,
  convergenceThreshold: 0.75
})

// Force sequential mode
const result = await engine.executeWorkflow(workflow, {
  sessionType: 'sequential'
})
```

---

## Integration with Teams

Teams (Phase 2) and Execution Modes (Phase 3) work **together**.

### How It Works

```typescript
// 1. Create workflow from team (Phase 2)
const workflow = engine.createWorkflowFromTeam(
  'feature-team',           // team ID
  'task-789',
  'Implement user authentication with OAuth2 and security audit'
)

// 2. Execute workflow (Phase 3)
const result = await engine.executeWorkflow(workflow)

// → Complexity analyzed: 70
// → Party mode activated automatically
// → Agents from team (architect, developer, security-specialist)
//   work in parallel with consensus building
```

### Example Scenario

**Team Configuration:**

```json
{
  "id": "feature-team",
  "agents": [
    {"role_id": "architect", "phase": "design"},
    {"role_id": "developer", "phase": "implementation"},
    {"role_id": "tester", "phase": "implementation"}
  ],
  "default_parallel": ["developer", "tester"]
}
```

**Task Execution:**

```typescript
const workflow = engine.createWorkflowFromTeam('feature-team', 'task', 'Complex feature')

// Complexity = 75 → Party mode activated
// Execution:
//   Round 1: Architect (design phase) - sequential
//   Round 2-4: Developer + Tester (implementation) - PARTY MODE
//   Round 5: Convergence reached → Done
```

### Benefits

✅ **Flexible** — Same team works differently based on task
✅ **Optimal** — Simple tasks fast, complex tasks thorough
✅ **Automatic** — No manual mode selection needed
✅ **Reusable** — Team config reused across modes

---

## Configuration

### Global Settings

Configure default mode settings in `asmo.config.yaml`:

```yaml
execution:
  default_mode: sequential
  party:
    max_rounds: 5
    convergence_threshold: 0.8
    enable_auto_activation: true
  brainstorming:
    max_rounds: 4
    generate_adr: true
```

### Runtime Configuration

Override settings per execution:

```typescript
const result = await engine.executeWorkflow(workflow, {
  // Mode configuration
  sessionType: 'party',
  maxRounds: 3,
  convergenceThreshold: 0.75,

  // Other options
  verbose: true,
  approvalRequired: false
})
```

### Environment Variables

```bash
# Disable auto party mode activation
ASMO_DISABLE_PARTY_MODE=true

# Set default convergence threshold
ASMO_PARTY_CONVERGENCE=0.85

# Set max rounds
ASMO_PARTY_MAX_ROUNDS=7
```

---

## Best Practices

### 1. Let Auto-Selection Work

✅ **Do**: Trust automatic mode selection for most tasks
❌ **Don't**: Force modes unless you have a specific reason

### 2. Adjust Convergence for Task Type

- **High-risk tasks** (security, database): `0.9` (stricter)
- **Standard features**: `0.8` (default)
- **Quick prototypes**: `0.7` (faster)

### 3. Monitor Party Mode Rounds

```typescript
const result = await engine.executeWorkflow(workflow, { verbose: true })

if (result.totalRounds >= 5) {
  console.warn('Party mode reached max rounds without full convergence')
  console.log('Convergence score:', result.convergenceScore)
}
```

### 4. Use Brainstorming for Design

Force brainstorming mode for design tasks:

```typescript
if (isDesignTask(task)) {
  options.sessionType = 'brainstorming'
  options.generateADR = true
}
```

### 5. Consider Token Costs

- **Sequential**: ~1-2K tokens per agent
- **Party (3 rounds)**: ~4-6K tokens per agent
- **Brainstorming (4 rounds)**: ~6-8K tokens per agent

Use sequential when possible to minimize costs.

---

## Troubleshooting

### Party Mode Not Activating

**Symptom**: Task runs in sequential mode despite high complexity

**Causes:**

1. Complexity score < 60
2. Party mode disabled via config
3. Single pattern detected

**Solution:**

```typescript
// Check complexity
const complexity = await analyzer.analyze(task)
console.log('Complexity:', complexity.score)

// Force party mode
const result = await engine.executeWorkflow(workflow, {
  sessionType: 'party'
})
```

### Convergence Never Reached

**Symptom**: Party mode hits max rounds without consensus

**Causes:**

1. Threshold too high (> 0.9)
2. Agents producing very different outputs
3. Ambiguous task description

**Solution:**

```typescript
// Lower threshold
const result = await engine.executeWorkflow(workflow, {
  convergenceThreshold: 0.75
})

// Or increase max rounds
const result = await engine.executeWorkflow(workflow, {
  maxRounds: 7
})

// Or clarify task description
const clarifiedTask = await clarifyTask(originalTask)
```

### Brainstorming Mode Stuck

**Symptom**: Brainstorming hangs or produces poor ADR

**Causes:**

1. Too few agents (need 3+)
2. Agents lack design skills
3. Task not suitable for brainstorming

**Solution:**

```typescript
// Ensure enough agents with design skills
const team = teamManager.getTeamById('architecture-team')
if (team.agents.length < 3) {
  throw new Error('Brainstorming requires at least 3 agents')
}

// Use agents with 'design' or 'architecture' skills
const designAgents = registry.getAgentsBySkills(['design', 'architecture'])
```

### High Token Usage

**Symptom**: Party mode costs too many tokens

**Solutions:**

1. **Lower max rounds**: `maxRounds: 3` instead of 5
2. **Use sequential for simple tasks**: Check complexity first
3. **Optimize agent prompts**: Reduce prompt length
4. **Use smaller model for rounds**: Sonnet instead of Opus

```typescript
// Token optimization
const result = await engine.executeWorkflow(workflow, {
  sessionType: complexity >= 70 ? 'party' : 'sequential',
  maxRounds: 3,  // Reduce rounds
  convergenceThreshold: 0.75  // Easier to reach
})
```

---

## Related Documentation

- [Teams Configuration](./teams-configuration.md) — Define reusable agent teams
- [System Overview](./en/system-overview.md) — Complete ASMO guide
- [Adaptive Phase Detection](./adaptive-phase-detection.md) — Smart phase joining
- [Context Cascade](./context-cascade.md) — Context management

---

## Examples

### Example 1: Simple Task (Sequential)

```typescript
const result = await engine.execute('Fix typo in login button')

// Result:
// {
//   sessionType: 'sequential',
//   agentsExecuted: ['developer'],
//   totalRounds: 1,
//   duration: '15s'
// }
```

### Example 2: Complex Task (Party)

```typescript
const result = await engine.execute(
  'Implement OAuth2 authentication with refresh tokens, security audit, and performance optimization'
)

// Result:
// {
//   sessionType: 'party',
//   agentsExecuted: ['architect', 'security-specialist', 'developer', 'optimizer'],
//   totalRounds: 4,
//   convergenceReached: true,
//   convergenceScore: 0.87,
//   duration: '12m'
// }
```

### Example 3: Design Task (Brainstorming)

```typescript
const result = await engine.execute(
  'Design the microservices architecture for the payment system'
)

// Result:
// {
//   sessionType: 'brainstorming',
//   agentsExecuted: ['architect', 'developer', 'data-architect'],
//   totalRounds: 4,
//   adrGenerated: true,
//   chosenProposal: 'B',
//   votingResults: { A: 1, B: 2, C: 0 },
//   duration: '18m'
// }
```

---

**Need Help?**

- 📖 See [System Overview](./en/system-overview.md) for complete reference
- 🐛 Report issues at [GitHub Issues](https://github.com/Samch1k/ASMO/issues)
- 💬 Ask questions at [GitHub Discussions](https://github.com/Samch1k/ASMO/discussions)
