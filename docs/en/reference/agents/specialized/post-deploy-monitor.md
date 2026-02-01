# 👁️ Post-Deploy Monitor

> Deployment health and smoke testing specialist. Monitors application health after deployment, runs smoke tests, checks error rates and performance metrics, and triggers rollback if critical issues detected.

## Overview

| Property | Value |
|----------|-------|
| **ID** | `post-deploy-monitor` |
| **Category** | specialized |
| **Role Type** | reasoning |
| **Priority** | 9/10 |
| **Domain** | Deployment Monitoring |

## Capabilities

- Standard agent capabilities

## Skills

### Required Skills

- `health_monitoring`
- `performance_validation`

### Optional Skills

- `smoke_testing`
- `incident_response`

## Integrations (MCP)

- `memory`
- `supabase`
- `render`
- `vercel`

## Activation Rules

- **Type**: Auto-attached
- **Trigger Keywords**: `monitor deployment`, `health check`, `smoke test`, `verify deployment`
- **Task Types**: `monitoring`, `validation`

## LLM Parameters

| Parameter | Value |
|-----------|-------|
| Temperature | 0.1 |
| Max Tokens | 4096 |

## Output Artifacts

- `report`
- `alert`

## Usage

```typescript
import { AgentRegistry } from '@ai1st/core'

const registry = new AgentRegistry()
const agent = await registry.getAgent('post-deploy-monitor')
```

---

[← Back to Agents](./index.md)
