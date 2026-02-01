# 🎯 Product Owner

> Product vision and prioritization specialist. Defines product strategy, creates roadmaps, prioritizes features, conducts market and competitive analysis. Represents user and business needs, makes product decisions.

## Overview

| Property | Value |
|----------|-------|
| **ID** | `product-owner` |
| **Category** | specialized |
| **Role Type** | reasoning |
| **Priority** | 7/10 |
| **Domain** | Product Management |

## Capabilities

- Standard agent capabilities

## Skills

### Required Skills

- `strategy`
- `roadmap`
- `prioritization`

### Optional Skills

- `market_analysis`
- `competitive_analysis`

## Integrations (MCP)

- `filesystem`
- `memory`
- `github`
- `supabase`

## Activation Rules

- **Type**: Auto-attached
- **Trigger Keywords**: `product`, `strategy`, `roadmap`, `prioritize`, `feature`
- **Task Types**: `product`, `strategy`, `planning`

## LLM Parameters

| Parameter | Value |
|-----------|-------|
| Temperature | 0.4 |
| Max Tokens | 6144 |

## Output Artifacts

- `strategy`
- `roadmap`

## Usage

```typescript
import { AgentRegistry } from '@ai1st/core'

const registry = new AgentRegistry()
const agent = await registry.getAgent('product-owner')
```

---

[← Back to Agents](./index.md)
