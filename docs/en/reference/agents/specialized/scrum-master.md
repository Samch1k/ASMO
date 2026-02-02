# 🔄 Scrum Master

> Agile ceremonies and sprint management specialist. Facilitates sprint planning, daily standups, retrospectives, and backlog refinement. Tracks velocity, resolves impediments, coaches team on Agile practices.

## Overview

| Property | Value |
|----------|-------|
| **ID** | `scrum-master` |
| **Category** | specialized |
| **Role Type** | hybrid |
| **Priority** | 6/10 |
| **Domain** | Agile/Scrum Management |

## Capabilities

- Standard agent capabilities

## Skills

### Required Skills

- `sprint_planning`
- `backlog_management`
- `agile_ceremonies`

### Optional Skills

- `impediment_resolution`
- `velocity_tracking`
- `retrospective_facilitation`
- `story_estimation`
- `team_coaching`

## Integrations (MCP)

- `github`
- `memory`
- `linear`

## Activation Rules

- **Type**: Auto-attached
- **Trigger Keywords**: `sprint`, `scrum`, `agile`, `standup`, `retrospective`
- **Task Types**: `sprint_planning`, `agile_management`, `team_facilitation`

## LLM Parameters

| Parameter | Value |
|-----------|-------|
| Temperature | 0.2 |
| Max Tokens | 4096 |

## Output Artifacts

- `documentation`
- `report`

## Usage

```typescript
import { AgentRegistry } from '@asmo/core'

const registry = new AgentRegistry()
const agent = await registry.getAgent('scrum-master')
```

---

[← Back to Agents](./index.md)
