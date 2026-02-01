# 🏗️ Architect

> System architecture and design decisions. Creates architectural decision records (ADRs), designs system components, evaluates technologies, and models data structures. Focuses on long-term technical vision and scalability.

## Overview

| Property | Value |
|----------|-------|
| **ID** | `architect` |
| **Category** | core |
| **Role Type** | reasoning |
| **Priority** | 10/10 |
| **Domain** | System Architecture |

## Capabilities

- Standard agent capabilities

## Skills

### Required Skills

- `system_design`
- `architecture_decisions`
- `adr_creation`
- `data_modeling`

### Optional Skills

- `technology_evaluation`
- `scalability_planning`

## Integrations (MCP)

- `filesystem`
- `context7`
- `memory`
- `github`

## Activation Rules

- **Type**: Auto-attached
- **Trigger Keywords**: `design`, `architecture`, `architect`, `adr`, `system design`
- **Task Types**: `architecture`, `planning`

## LLM Parameters

| Parameter | Value |
|-----------|-------|
| Temperature | 0.3 |
| Max Tokens | 8192 |

## Output Artifacts

- `architecture`
- `documentation`

## Usage

```typescript
import { AgentRegistry } from '@ai1st/core'

const registry = new AgentRegistry()
const agent = await registry.getAgent('architect')
```

---

[← Back to Agents](./index.md)
