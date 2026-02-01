# Agents

Agents are specialized AI roles that perform specific tasks within AI1st workflows.

## What is an Agent?

An agent is an AI entity with:
- **Specialized role** - Focused expertise (e.g., Architect, Developer, Tester)
- **Defined skills** - Capabilities it can perform
- **Access permissions** - MCP servers it can use
- **Activation rules** - When it gets triggered

## Agent Categories

AI1st includes **24 agents** organized into three categories:

### Core Agents (6)

Essential agents for standard development tasks:

| Agent | Role | Can Modify Code |
|-------|------|-----------------|
| 🏗️ Architect | System design, ADRs | No |
| 👨‍💻 Developer | Feature implementation | Yes |
| 🐛 Debugger | Bug investigation | Yes |
| ⚡ Optimizer | Performance tuning | Yes |
| 🧪 Tester | Quality assurance | Yes |
| 🚀 DevOps | Deployment, CI/CD | No |

### Specialized Agents (10)

Domain-specific expertise:

| Agent | Domain | Role Type |
|-------|--------|-----------|
| 🎨 UI Developer | Frontend | Execution |
| 🎭 UX Designer | User Experience | Reasoning |
| 📊 Business Analyst | Requirements | Reasoning |
| 📋 Project Manager | Coordination | Hybrid |
| 🎯 Product Owner | Strategy | Reasoning |
| 🔄 Scrum Master | Agile | Hybrid |
| 🔒 Security Specialist | Security | Reasoning |
| 📈 Performance Engineer | Performance | Reasoning |
| 💾 Data Architect | Database | Reasoning |
| 🔌 API Designer | API Contracts | Reasoning |

### Validation Agents (4+)

Quality control and coordination:

| Agent | Purpose |
|-------|---------|
| ✅ Design Validator | Architecture review |
| 🔀 Merge Coordinator | Parallel output consolidation |
| 👁️ Post-Deploy Monitor | Deployment health |
| 📝 Requirements Validator | INVEST criteria checking |

## Agent Anatomy

Each agent is defined by a JSON configuration:

```json
{
  "id": "developer",
  "name": "Developer",
  "description": "Feature implementation and code generation...",
  "category": "core",
  "role_type": "execution",
  "can_modify_code": true,
  "requires_plan": true,
  "required_skills": [
    "code_writing",
    "typescript_expert",
    "feature_implementation"
  ],
  "optional_skills": [
    "refactoring",
    "integration"
  ],
  "priority": 8,
  "allowed_mcps": [
    "filesystem",
    "context7",
    "github"
  ],
  "activation_rules": {
    "type": "auto_attached",
    "trigger_keywords": ["implement", "code", "develop"],
    "task_types": ["feature", "refactor"]
  },
  "metadata": {
    "llm_temperature": 0.2,
    "max_tokens": 8192,
    "domain": "Software Development"
  }
}
```

## Role Types

Agents have three role types:

| Type | Description | Example |
|------|-------------|---------|
| **Reasoning** | Analyze and make decisions | Architect |
| **Execution** | Perform concrete actions | Developer |
| **Hybrid** | Both reasoning and execution | Debugger |

## Activation Rules

Agents can be activated in two ways:

### Auto-Attached

Automatically included based on task keywords:

```typescript
// Task: "Fix the login bug"
// Auto-attaches: Debugger (keyword: "bug", "fix")
```

### Manual

Explicitly specified in workflow or by user:

```typescript
const result = await engine.execute('Design API', {
  agents: ['architect', 'api-designer']
})
```

## Agent Lifecycle

```
┌──────────┐    ┌──────────┐    ┌─────────────┐    ┌───────────┐
│  Idle    │ →  │ Assigned │ →  │  Executing  │ →  │ Complete  │
└──────────┘    └──────────┘    └─────────────┘    └───────────┘
                                       ↓
                                ┌─────────────┐
                                │   Failed    │
                                └─────────────┘
```

## Using Agents

### In Workflows

Workflows specify which agents to use at each step:

```json
{
  "steps": [
    {
      "order": 1,
      "role_id": "architect",
      "phase": "design",
      "description": "Design the solution"
    },
    {
      "order": 2,
      "role_id": "developer",
      "phase": "implementation",
      "description": "Implement the solution"
    }
  ]
}
```

### In Party Mode

Multiple agents collaborate simultaneously:

```typescript
const session = await engine.executePartyMode(
  'Design authentication system',
  ['architect', 'security-specialist', 'developer'],
  undefined,
  { maxRounds: 3 }
)
```

### Direct Access

Access agents programmatically:

```typescript
import { AgentRegistry } from '@ai1st/core'

const registry = new AgentRegistry()
const architect = await registry.getAgent('architect')
const result = await architect.execute({
  task: 'Design database schema',
  context: { tables: ['users', 'orders'] }
})
```

## Agent Output

Agents produce structured output based on their role:

| Agent | Output Types |
|-------|--------------|
| Architect | ADRs, diagrams, specifications |
| Developer | Code, tests, documentation |
| Tester | Test results, coverage reports |
| DevOps | Deployment logs, configurations |

## See Also

- [Agent Catalog](../reference/agents/index.md) - Full agent documentation
- [Custom Agents](../guides/custom-agents.md) - Create your own agents
- [Workflows](./workflows.md) - How agents work in workflows
