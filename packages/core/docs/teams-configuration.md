# Teams Configuration

**Phase 2 Feature** — Define reusable agent teams for workflow templates.

---

## Table of Contents

1. [Overview](#overview)
2. [Key Concepts](#key-concepts)
3. [Configuration Format](#configuration-format)
4. [Team Properties Reference](#team-properties-reference)
5. [TeamAgent Properties](#teamagent-properties)
6. [Usage Guide](#usage-guide)
7. [Example Teams](#example-teams)
8. [Location & Loading](#location--loading)
9. [Integration with WorkflowEngine](#integration-with-workflowengine)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)

---

## Overview

Teams allow you to group agents into predefined configurations that can be reused across multiple tasks. Instead of manually selecting agents for each workflow, define a team once and reference it by ID.

**Benefits:**

- ✅ **Reusability** — Define once, use many times
- ✅ **Consistency** — Same team structure for similar tasks
- ✅ **Simplicity** — Reference by ID instead of configuring agents
- ✅ **Flexibility** — Customize focus and parallel execution per team
- ✅ **Maintenance** — Update team in one place

**Use Cases:**

- Feature development teams (architect + developer + tester)
- Bug fix teams (debugger + developer)
- Security audit teams (security-specialist + tester + reviewer)
- TEA teams (test-architect + test engineers)

---

## Key Concepts

### Team

A **Team** is a named group of agents with defined phases and parallelism settings.

```typescript
interface Team {
  id: string
  name: string
  description: string
  agents: TeamAgent[]
  default_parallel?: string[]
  approval_required?: boolean
  estimated_duration?: string
  metadata?: Record<string, any>
}
```

### TeamAgent

A **TeamAgent** is an agent within a team, assigned to a specific workflow phase.

```typescript
interface TeamAgent {
  role_id: string          // Agent role (e.g., "architect")
  phase: string            // Workflow phase (e.g., "design")
  focus?: string           // Specific focus area (optional)
  parallel_with?: string[] // Agents to run in parallel with (optional)
}
```

### Phase

Workflow execution phases define when agents execute:

- `design` — Architecture and planning
- `implementation` — Code development
- `validation` — Testing and review
- `deployment` — Release preparation

### Parallel Execution

Agents can be configured to run simultaneously using:

- `parallel_with` in TeamAgent config
- `default_parallel` in Team config

---

## Configuration Format

Teams are defined in `teams.json`:

```json
{
  "teams": [
    {
      "id": "feature-team",
      "name": "Feature Implementation Team",
      "description": "Full-cycle feature development from architecture to testing",
      "agents": [
        {
          "role_id": "architect",
          "phase": "design",
          "focus": "system architecture and API design"
        },
        {
          "role_id": "developer",
          "phase": "implementation",
          "parallel_with": ["tester"],
          "focus": "core implementation"
        },
        {
          "role_id": "tester",
          "phase": "implementation",
          "focus": "unit and integration tests"
        },
        {
          "role_id": "code-reviewer",
          "phase": "validation",
          "focus": "code quality and security review"
        }
      ],
      "default_parallel": ["developer", "tester"],
      "approval_required": true,
      "estimated_duration": "3h",
      "metadata": {
        "complexity": "high",
        "team_type": "feature",
        "requires_architecture": true
      }
    }
  ]
}
```

---

## Team Properties Reference

### Required Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `id` | `string` | Unique team identifier (kebab-case) | `"feature-team"` |
| `name` | `string` | Human-readable team name | `"Feature Implementation Team"` |
| `description` | `string` | Team purpose and scope | `"Full-cycle feature development"` |
| `agents` | `TeamAgent[]` | List of team agents (min: 1) | See TeamAgent properties |

### Optional Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `default_parallel` | `string[]` | `[]` | Default agents to run in parallel |
| `approval_required` | `boolean` | `false` | Require approval checkpoints during execution |
| `estimated_duration` | `string` | - | Expected duration (e.g., `"3h"`, `"1d"`) |
| `metadata` | `object` | `{}` | Custom metadata for filtering/querying |

---

## TeamAgent Properties

### Required Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `role_id` | `string` | Agent role identifier | `"architect"`, `"developer"` |
| `phase` | `string` | Workflow execution phase | `"design"`, `"implementation"` |

### Optional Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `focus` | `string` | - | Specific focus area for this agent | `"API design"`, `"test coverage"` |
| `parallel_with` | `string[]` | `[]` | Other role_ids to run in parallel with |

### Valid Phases

- `design` — Architecture, planning, design decisions
- `implementation` — Code development, feature building
- `validation` — Testing, code review, quality checks
- `deployment` — Release preparation, documentation

---

## Usage Guide

### 1. Create Team Configuration

Create `teams.json` in one of the config locations:

```json
{
  "teams": [
    {
      "id": "bugfix-team",
      "name": "Bug Fix Team",
      "description": "Quick bug investigation and fixes",
      "agents": [
        {
          "role_id": "debugger",
          "phase": "design",
          "focus": "root cause analysis"
        },
        {
          "role_id": "developer",
          "phase": "implementation",
          "focus": "implement fix with tests"
        }
      ],
      "estimated_duration": "1h",
      "metadata": {
        "complexity": "medium",
        "team_type": "bugfix"
      }
    }
  ]
}
```

### 2. Initialize WorkflowEngine

```typescript
import { WorkflowEngine, AgentRegistry, getConfigLoader } from '@asmo/core'

// Load configuration
const configLoader = await getConfigLoader()
const roles = await configLoader.loadRoles()

// Initialize registry
const registry = new AgentRegistry()
await registry.autoDiscover(roles, configLoader)

// Create engine
const engine = WorkflowEngine.create(registry)
await engine.initialize()
```

### 3. Create Workflow from Team

```typescript
// Create workflow from team
const workflow = engine.createWorkflowFromTeam(
  'bugfix-team',           // team ID from teams.json
  'task-456',              // unique task ID
  'Fix login timeout bug'  // task description
)

console.log('Created workflow:', workflow.name)
console.log('Steps:', workflow.steps.length)
```

### 4. Execute Workflow

```typescript
// Execute workflow
const result = await engine.executeWorkflow(workflow, {
  verbose: true,
  approvalRequired: true
})

console.log('Status:', result.status)
console.log('Agents executed:', result.agentResults.length)
```

---

## Example Teams

### Feature Team

Full-cycle feature development with architecture review:

```json
{
  "id": "feature-team",
  "name": "Feature Implementation Team",
  "description": "Full-cycle feature development from architecture to testing",
  "agents": [
    {"role_id": "architect", "phase": "design"},
    {"role_id": "developer", "phase": "implementation", "parallel_with": ["tester"]},
    {"role_id": "tester", "phase": "implementation"},
    {"role_id": "code-reviewer", "phase": "validation"}
  ],
  "default_parallel": ["developer", "tester"],
  "approval_required": true,
  "estimated_duration": "3h"
}
```

### Bug Fix Team

Quick bug investigation and fixes:

```json
{
  "id": "bugfix-team",
  "name": "Bug Fix Team",
  "description": "Quick bug investigation and fixes",
  "agents": [
    {"role_id": "debugger", "phase": "design"},
    {"role_id": "developer", "phase": "implementation"},
    {"role_id": "tester", "phase": "validation"}
  ],
  "estimated_duration": "1h"
}
```

### Security Team

Security audits and vulnerability fixes:

```json
{
  "id": "security-team",
  "name": "Security Audit Team",
  "description": "Security review and vulnerability remediation",
  "agents": [
    {"role_id": "security-specialist", "phase": "design", "focus": "threat modeling"},
    {"role_id": "developer", "phase": "implementation", "focus": "security fixes"},
    {"role_id": "tester", "phase": "validation", "focus": "security testing"}
  ],
  "approval_required": true,
  "estimated_duration": "4h"
}
```

### TEA Team

Test engineering and automation:

```json
{
  "id": "tea-team",
  "name": "Test Engineering Team",
  "description": "Test automation and quality engineering",
  "agents": [
    {"role_id": "test-architect", "phase": "design", "focus": "test strategy"},
    {"role_id": "tester", "phase": "implementation", "focus": "test automation"}
  ],
  "estimated_duration": "2h"
}
```

---

## Location & Loading

### Configuration Locations

Teams are loaded from the following locations in order:

1. **Claude Code environment**: `.cursor/config/orchestration/teams.json`
2. **User home directory**: `~/.asmo/config/orchestration/teams.json`
3. **Bundled templates**: `node_modules/@asmo/core/templates/orchestration/teams.json`

First found file wins (no merging).

### Fallback Behavior

**Teams are optional** — ASMO works without `teams.json` using:

- Direct workflow selection via `WorkflowEngine.selectWorkflow()`
- Manual workflow creation with `WorkflowEngine.createCustomWorkflow()`

### Loading in Code

```typescript
import { getConfigLoader } from '@asmo/core'

const configLoader = await getConfigLoader()
const teams = await configLoader.loadTeams()

console.log(`Loaded ${teams.length} teams`)
```

---

## Integration with WorkflowEngine

### TeamManager

The `TeamManager` class handles team operations:

```typescript
import { TeamManager } from '@asmo/core'

// Initialize
const teamManager = new TeamManager(configLoader)
await teamManager.initialize()

// Get team by ID
const team = teamManager.getTeamById('feature-team')

// List all teams
const allTeams = teamManager.getAllTeams()

// Filter teams by metadata
const featureTeams = allTeams.filter(t => t.metadata?.team_type === 'feature')
```

### Workflow Creation

```typescript
// Method 1: Use WorkflowEngine (recommended)
const workflow = engine.createWorkflowFromTeam(teamId, taskId, taskDescription)

// Method 2: Use TeamManager directly
const team = teamManager.getTeamById(teamId)
const workflow = teamManager.convertTeamToWorkflow(team, taskId, taskDescription)
```

### Parallel Execution

Agents marked with `parallel_with` execute simultaneously:

```typescript
// This team configuration:
{
  "role_id": "developer",
  "parallel_with": ["tester"]
}

// Becomes workflow step:
{
  agent: developerAgent,
  phase: "implementation",
  parallel: true  // ← Executes with tester in parallel
}
```

---

## Best Practices

### 1. Team Naming

- Use kebab-case for IDs: `feature-team`, `bugfix-team`
- Use descriptive names: "Feature Implementation Team"
- Include scope in description

### 2. Phase Assignment

- `design` phase: 1-2 agents max (architect, analyst)
- `implementation` phase: Multiple agents OK (developer, tester in parallel)
- `validation` phase: 1-2 agents (reviewer, tester)

### 3. Parallel Execution

Only parallelize agents that DON'T depend on each other:

✅ **Good**: Developer + Tester in parallel (independent work)
❌ **Bad**: Architect + Developer in parallel (developer needs architecture)

### 4. Metadata Usage

Use metadata for filtering and querying:

```json
{
  "metadata": {
    "complexity": "high",      // Complexity level
    "team_type": "feature",    // Category
    "domain": "backend",       // Domain
    "requires_architecture": true
  }
}
```

### 5. Approval Checkpoints

Set `approval_required: true` for:

- High-complexity tasks
- Security-sensitive changes
- Database migrations
- Production deployments

### 6. Duration Estimates

Provide realistic estimates:

- Simple bug fix: `"1h"`
- Feature implementation: `"3h"` to `"6h"`
- Architecture design: `"4h"` to `"8h"`

---

## Troubleshooting

### Team Not Found

**Error**: `Team with ID 'feature-team' not found`

**Solution**:

1. Verify `teams.json` exists in config location
2. Check team ID spelling (case-sensitive)
3. Run `configLoader.loadTeams()` to debug

```typescript
const teams = await configLoader.loadTeams()
console.log('Available teams:', teams.map(t => t.id))
```

### Agent Role Not Found

**Error**: `Agent with role 'architekt' not found in registry`

**Solution**:

1. Check `role_id` spelling in team config
2. Verify role exists in `roles/*.json`
3. Ensure `AgentRegistry.autoDiscover()` was called

```typescript
const agents = registry.getAllAgents()
console.log('Available roles:', agents.map(a => a.agentId))
```

### Invalid Phase

**Error**: `Invalid phase 'coding' for agent 'developer'`

**Solution**: Use valid phases only:

- `design`
- `implementation`
- `validation`
- `deployment`

### Parallel Execution Not Working

**Symptoms**: Agents run sequentially instead of in parallel

**Solution**:

1. Check `parallel_with` array in TeamAgent config
2. Verify role_ids match exactly
3. Ensure agents are in the same phase

```json
// Both must be in same phase
{
  "role_id": "developer",
  "phase": "implementation",
  "parallel_with": ["tester"]
},
{
  "role_id": "tester",
  "phase": "implementation"  // ← Must match
}
```

### JSON Validation Errors

**Error**: `Unexpected token } in JSON`

**Solution**:

1. Validate JSON syntax with linter
2. Remove trailing commas
3. Use proper string quoting

**Tip**: Use JSON schema validation:

```bash
# Validate teams.json
npx ajv validate -s templates/orchestration/teams.schema.json -d teams.json
```

---

## Related Documentation

- [System Overview](./en/system-overview.md) — Full ASMO system guide
- [Execution Modes](./execution-modes.md) — Party mode & brainstorming
- [Adaptive Phase Detection](./adaptive-phase-detection.md) — Smart phase joining
- [WorkflowEngine API](./en/system-overview.md#workflow-engine) — Workflow execution

---

## Examples

Full team configuration examples available at:

- [examples/teams/feature-team.json](./examples/teams/feature-team.json)
- [examples/teams/bugfix-team.json](./examples/teams/bugfix-team.json)
- [examples/teams/security-team.json](./examples/teams/security-team.json)
- [examples/teams/tea-team.json](./examples/teams/tea-team.json)

---

**Need Help?**

- 📖 See [System Overview](./en/system-overview.md) for complete reference
- 🐛 Report issues at [GitHub Issues](https://github.com/Samch1k/ASMO/issues)
- 💬 Ask questions at [GitHub Discussions](https://github.com/Samch1k/ASMO/discussions)
