# Examples

Practical examples of using ASMO in real-world scenarios.

## Available Examples

| Example | Description | Complexity |
|---------|-------------|------------|
| [Basic Workflow](./basic-workflow.md) | Run a simple bug fix workflow | Beginner |
| [Adaptive Selection](./adaptive-selection.md) | Let ASMO choose the workflow | Intermediate |
| [Multi-Agent Collaboration](./multi-agent.md) | Use Party Mode for complex decisions | Advanced |

## Quick Examples

### Execute a Workflow

```typescript
import { WorkflowEngine, AgentRegistry } from '@asmo/core'

const registry = new AgentRegistry()
const engine = new WorkflowEngine(registry)
await engine.initialize()

const result = await engine.execute('Fix the login button not working')
console.log(result)
```

### Analyze Complexity

```typescript
const selection = await engine.selectWorkflowAdaptively(
  'Add OAuth2 authentication',
  { projectSize: 'large' }
)

console.log('Complexity:', selection.complexity.level)
console.log('Workflow:', selection.workflow.name)
```

### Party Mode

```typescript
const session = await engine.executePartyMode(
  'Design database schema for users',
  ['architect', 'data-architect', 'developer'],
  undefined,
  { maxRounds: 3 }
)

console.log('Agreements:', session.state.agreements)
```

## Running Examples

Clone the repository and run examples:

```bash
git clone https://github.com/Samch1k/ASMO.git
cd ASMO

# Install dependencies
pnpm install

# Run an example
npx tsx examples/basic-workflow.ts
```

## See Also

- [Getting Started](../getting-started/index.md)
- [Guides](../guides/index.md)
- [API Reference](../reference/index.md)
