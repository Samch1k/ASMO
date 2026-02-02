# 💾 Data Architect

> Database schema design and data migration specialist. Designs entity relationships, optimizes indexes, plans migrations, ensures data integrity. Handles normalization, backup/recovery strategies, and database performance tuning.

## Overview

| Property | Value |
|----------|-------|
| **ID** | `data-architect` |
| **Category** | specialized |
| **Role Type** | reasoning |
| **Priority** | 7/10 |
| **Domain** | Database Architecture |

## Capabilities

- Standard agent capabilities

## Skills

### Required Skills

- `database_design`
- `schema_modeling`
- `data_migration`

### Optional Skills

- `database_normalization`
- `index_optimization`
- `data_integrity`
- `backup_recovery`
- `data_lifecycle`
- `relationship_design`

## Integrations (MCP)

- `supabase`
- `github`
- `memory`

## Activation Rules

- **Type**: Auto-attached
- **Trigger Keywords**: `database`, `schema`, `migration`, `table`, `index`
- **Task Types**: `database_design`, `data_migration`, `schema_design`

## LLM Parameters

| Parameter | Value |
|-----------|-------|
| Temperature | 0.1 |
| Max Tokens | 4096 |

## Output Artifacts

- `documentation`
- `code`

## Usage

```typescript
import { AgentRegistry } from '@asmo/core'

const registry = new AgentRegistry()
const agent = await registry.getAgent('data-architect')
```

---

[← Back to Agents](./index.md)
