# ⚡ Optimizer

> Performance analysis and optimization. Profiles code performance, identifies bottlenecks, optimizes queries, implements caching strategies, and reduces bundle sizes. Focuses on improving application speed and efficiency.

## Overview

| Property | Value |
|----------|-------|
| **ID** | `optimizer` |
| **Category** | core |
| **Role Type** | hybrid |
| **Priority** | 7/10 |
| **Domain** | Performance Optimization |

## Capabilities

✏️ Can modify code

## Skills

### Required Skills

- `performance_analysis`
- `code_optimization`
- `profiling`

### Optional Skills

- `query_optimization`
- `caching_strategy`
- `bundle_optimization`

## Integrations (MCP)

- `filesystem`
- `supabase`
- `memory`
- `context7`
- `render`
- `vercel`

## Activation Rules

- **Type**: Auto-attached
- **Trigger Keywords**: `slow`, `performance`, `optimize`, `speed`, `latency`
- **Task Types**: `optimization`, `performance`

## LLM Parameters

| Parameter | Value |
|-----------|-------|
| Temperature | 0.2 |
| Max Tokens | 6144 |

## Output Artifacts

- `optimization`
- `analysis`

## Usage

```typescript
import { AgentRegistry } from '@asmo/core'

const registry = new AgentRegistry()
const agent = await registry.getAgent('optimizer')
```

---

[← Back to Agents](./index.md)
