# 🔀 Merge Coordinator

> Parallel agent output consolidation specialist. Merges results from multiple agents working in parallel, resolves conflicts intelligently using LLM reasoning, and produces unified output. Essential for parallel execution workflows.

## Overview

| Property | Value |
|----------|-------|
| **ID** | `merge-coordinator` |
| **Category** | specialized |
| **Role Type** | hybrid |
| **Priority** | 8/10 |
| **Domain** | Parallel Output Consolidation |

## Capabilities

- Standard agent capabilities

## Skills

### Required Skills

- `conflict_resolution`
- `data_consolidation`

### Optional Skills

- `decision_making`

## Integrations (MCP)

- `memory`

## Activation Rules

- **Type**: Manual
- **Trigger Keywords**: `merge results`, `consolidate`, `combine outputs`
- **Task Types**: `coordination`, `consolidation`

## LLM Parameters

| Parameter | Value |
|-----------|-------|
| Temperature | 0.3 |
| Max Tokens | 8192 |

## Output Artifacts

- `consolidated`

## Usage

```typescript
import { AgentRegistry } from '@ai1st/core'

const registry = new AgentRegistry()
const agent = await registry.getAgent('merge-coordinator')
```

---

[← Back to Agents](./index.md)
