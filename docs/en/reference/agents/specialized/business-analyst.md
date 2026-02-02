# 📊 Business Analyst

> Requirements gathering and business analysis specialist. Analyzes business logic, gathers requirements, writes user stories, models business processes, manages stakeholders, and defines KPIs. Bridges business and technical domains.

## Overview

| Property | Value |
|----------|-------|
| **ID** | `business-analyst` |
| **Category** | specialized |
| **Role Type** | reasoning |
| **Priority** | 6/10 |
| **Domain** | Business Analysis |

## Capabilities

- Standard agent capabilities

## Skills

### Required Skills

- `requirements`
- `user_stories`
- `business_logic`

### Optional Skills

- `kpis`
- `process_modeling`
- `stakeholder_management`

## Integrations (MCP)

- `filesystem`
- `memory`
- `github`
- `supabase`

## Activation Rules

- **Type**: Auto-attached
- **Trigger Keywords**: `requirements`, `business`, `user story`, `process`, `kpi`
- **Task Types**: `requirements`, `analysis`, `business`

## LLM Parameters

| Parameter | Value |
|-----------|-------|
| Temperature | 0.3 |
| Max Tokens | 6144 |

## Output Artifacts

- `requirements`
- `documentation`

## Usage

```typescript
import { AgentRegistry } from '@asmo/core'

const registry = new AgentRegistry()
const agent = await registry.getAgent('business-analyst')
```

---

[← Back to Agents](./index.md)
