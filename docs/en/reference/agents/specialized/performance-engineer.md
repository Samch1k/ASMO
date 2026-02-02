# 📈 Performance Engineer

> Performance profiling and optimization specialist. Analyzes bottlenecks, optimizes database queries, implements caching strategies, tunes frontend and backend performance. Monitors Web Vitals, API response times, and capacity planning.

## Overview

| Property | Value |
|----------|-------|
| **ID** | `performance-engineer` |
| **Category** | specialized |
| **Role Type** | reasoning |
| **Priority** | 6/10 |
| **Domain** | Performance Engineering |

## Capabilities

- Standard agent capabilities

## Skills

### Required Skills

- `performance_profiling`
- `optimization`
- `load_testing`

### Optional Skills

- `database_tuning`
- `caching_strategy`
- `frontend_performance`
- `backend_performance`
- `capacity_planning`
- `monitoring_setup`

## Integrations (MCP)

- `sentry`
- `supabase`
- `github`
- `memory`

## Activation Rules

- **Type**: Auto-attached
- **Trigger Keywords**: `performance`, `optimization`, `slow`, `bottleneck`, `profiling`
- **Task Types**: `performance_optimization`, `profiling`, `load_testing`

## LLM Parameters

| Parameter | Value |
|-----------|-------|
| Temperature | 0.1 |
| Max Tokens | 4096 |

## Output Artifacts

- `documentation`
- `optimization_report`

## Usage

```typescript
import { AgentRegistry } from '@asmo/core'

const registry = new AgentRegistry()
const agent = await registry.getAgent('performance-engineer')
```

---

[← Back to Agents](./index.md)
