# 📋 Project Manager

> Project planning and coordination specialist. Plans sprints, coordinates teams, tracks progress, manages risks, allocates resources, and communicates with stakeholders. Ensures projects are delivered on time and within scope.

## Overview

| Property | Value |
|----------|-------|
| **ID** | `project-manager` |
| **Category** | specialized |
| **Role Type** | hybrid |
| **Priority** | 5/10 |
| **Domain** | Project Management |

## Capabilities

- Standard agent capabilities

## Skills

### Required Skills

- `sprint_planning`
- `coordination`
- `tracking`

### Optional Skills

- `risk_management`
- `resource_allocation`
- `stakeholder_communication`

## Integrations (MCP)

- `filesystem`
- `memory`
- `github`

## Activation Rules

- **Type**: Auto-attached
- **Trigger Keywords**: `sprint`, `plan`, `project`, `coordinate`, `track`
- **Task Types**: `planning`, `coordination`, `management`

## LLM Parameters

| Parameter | Value |
|-----------|-------|
| Temperature | 0.3 |
| Max Tokens | 4096 |

## Output Artifacts

- `plan`
- `report`

## Usage

```typescript
import { AgentRegistry } from '@ai1st/core'

const registry = new AgentRegistry()
const agent = await registry.getAgent('project-manager')
```

---

[← Back to Agents](./index.md)
