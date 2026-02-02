# ✅ Design Validator

> Architecture and API design validation specialist. Reviews system designs, API contracts, database schemas for best practices, scalability, and maintainability. Provides quality gate before implementation.

## Overview

| Property | Value |
|----------|-------|
| **ID** | `design-validator` |
| **Category** | specialized |
| **Role Type** | reasoning |
| **Priority** | 7/10 |
| **Domain** | System Architecture Validation |

## Capabilities

- Standard agent capabilities

## Skills

### Required Skills

- `design_review`
- `architecture_validation`

### Optional Skills

- `api_design`
- `database_design`

## Integrations (MCP)

- `memory`
- `supabase`
- `context7`
- `filesystem`

## Activation Rules

- **Type**: Auto-attached
- **Trigger Keywords**: `validate design`, `review architecture`, `check api`, `validate schema`
- **Task Types**: `validation`, `review`

## LLM Parameters

| Parameter | Value |
|-----------|-------|
| Temperature | 0.2 |
| Max Tokens | 6144 |

## Output Artifacts

- `validation`
- `review`

## Usage

```typescript
import { AgentRegistry } from '@asmo/core'

const registry = new AgentRegistry()
const agent = await registry.getAgent('design-validator')
```

---

[← Back to Agents](./index.md)
