# 👨‍💻 Developer

> Feature implementation and code generation. Writes production-quality TypeScript/React code, implements features following TDD methodology, creates unit tests, and performs refactoring. Primary code execution role.

## Overview

| Property | Value |
|----------|-------|
| **ID** | `developer` |
| **Category** | core |
| **Role Type** | execution |
| **Priority** | 8/10 |
| **Domain** | Software Development |

## Capabilities

✏️ Can modify code
📋 Requires plan

## Skills

### Required Skills

- `code_writing`
- `typescript_expert`
- `feature_implementation`
- `unit_testing`

### Optional Skills

- `refactoring`
- `integration`

## Integrations (MCP)

- `filesystem`
- `context7`
- `github`
- `memory`
- `supabase`

## Activation Rules

- **Type**: Auto-attached
- **Trigger Keywords**: `implement`, `code`, `develop`, `feature`, `create function`
- **Task Types**: `feature`, `refactor`, `enhancement`

## LLM Parameters

| Parameter | Value |
|-----------|-------|
| Temperature | 0.2 |
| Max Tokens | 8192 |

## Output Artifacts

- `code`
- `test`

## Usage

```typescript
import { AgentRegistry } from '@asmo/core'

const registry = new AgentRegistry()
const agent = await registry.getAgent('developer')
```

---

[← Back to Agents](./index.md)
