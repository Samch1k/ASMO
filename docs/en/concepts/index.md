# Core Concepts

Understanding the fundamental concepts behind AI1st will help you leverage its full potential.

## Overview

AI1st is built around four key concepts:

| Concept | Description | Learn More |
|---------|-------------|------------|
| [Architecture](./architecture.md) | System design and components | Technical deep-dive |
| [Agents](./agents.md) | Specialized AI roles | 28 available agents |
| [Workflows](./workflows.md) | Task execution pipelines | 28 production workflows |
| [Skills](./skills.md) | Agent capabilities | 85 skills catalog |
| [Complexity](./complexity.md) | Task analysis system | 5 complexity levels |
| [Adversarial Review](./adversarial-review.md) | Critical code review | MUST find issues |
| [Elicitation](./elicitation.md) | Advanced analysis techniques | 5 techniques |
| [Context Cascade](./context-cascade.md) | Cascading context flow | Document dependencies |

## The AI1st Philosophy

### From Assistant to Team

Traditional AI assistants respond to individual requests. AI1st transforms AI into an autonomous development team where:

- **Multiple specialized agents** work together
- **Workflows orchestrate** complex multi-step tasks
- **Skills are matched** automatically to task requirements
- **Quality gates** ensure consistent output

### Adaptive Intelligence

AI1st doesn't use one-size-fits-all approaches. Instead:

1. **Analyze** - Task complexity is scored (0-100)
2. **Select** - Appropriate workflow is chosen
3. **Execute** - Agents work in sequence or parallel
4. **Validate** - Quality checkpoints ensure correctness

## Key Components

```
┌─────────────────────────────────────────────────────────────────┐
│                      AI1ST Framework                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │  WorkflowEngine  │  │ ComplexityAnalyzer│  │  TaskManager   │ │
│  │  ─────────────── │  │  ──────────────── │  │  ──────────── │ │
│  │  • execute()     │  │  • analyzeTask()  │  │  • createTask()│ │
│  │  • adaptive      │  │  • score 0-100    │  │  • lifecycle   │ │
│  │    selection     │  │  • level mapping  │  │  • events      │ │
│  └──────────────────┘  └──────────────────┘  └────────────────┘ │
│           │                     │                    │           │
│           └─────────────────────┼────────────────────┘           │
│                                 ↓                                │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │  YoloModeManager │  │ BrainstormSession │  │ TemplateEngine │ │
│  │  ─────────────── │  │  ──────────────── │  │  ──────────── │ │
│  │  • threshold: 30 │  │  • 4 rounds       │  │  • XML/MD      │ │
│  │  • audit trail   │  │  • ADR generation │  │  • validation  │ │
│  │  • bypass logic  │  │  • convergence    │  │  • rendering   │ │
│  └──────────────────┘  └──────────────────┘  └────────────────┘ │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Agent Registry                         │   │
│  │  28 specialized agents: Architect, Developer, Tester...  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## How It All Fits Together

1. **Task arrives** - Natural language description
2. **ComplexityAnalyzer** evaluates task complexity
3. **WorkflowEngine** selects appropriate workflow
4. **Agents** execute workflow steps
5. **TaskManager** tracks progress and state
6. **Quality gates** validate output at each phase

## Example Flow

```typescript
// 1. Task description
const task = "Add OAuth2 authentication to the API"

// 2. Complexity analysis (automatic)
// Score: 65, Level: Complex, Agents: architect, security, developer

// 3. Workflow selection (automatic)
// Selected: security_audit + feature_implementation

// 4. Execution
const result = await engine.execute(task)

// 5. Result with all artifacts
// - ADR for auth approach
// - Security assessment
// - Implementation code
// - Tests
```

## Next Steps

Dive deeper into each concept:

1. [Architecture](./architecture.md) - Technical system design
2. [Agents](./agents.md) - The specialized AI roles
3. [Workflows](./workflows.md) - Task execution pipelines
4. [Skills](./skills.md) - Capability matching
5. [Complexity](./complexity.md) - Task analysis
