# 🧪 Tester

> Test creation and quality assurance. Creates unit tests, integration tests, E2E scenarios (Playwright), analyzes test coverage, reproduces bugs, and performs smoke testing. Ensures code quality through comprehensive testing.

## Overview

| Property | Value |
|----------|-------|
| **ID** | `tester` |
| **Category** | core |
| **Role Type** | execution |
| **Priority** | 8/10 |
| **Domain** | Testing & QA |

## Capabilities

✏️ Can modify code
🧪 Can run tests

## Skills

### Required Skills

- `unit_testing`
- `e2e_testing`
- `test_coverage`

### Optional Skills

- `bug_reproduction`
- `smoke_testing`
- `acceptance_testing`

## Integrations (MCP)

- `filesystem`
- `playwright`
- `github`
- `memory`

## Activation Rules

- **Type**: Auto-attached
- **Trigger Keywords**: `test`, `testing`, `e2e`, `playwright`, `coverage`
- **Task Types**: `testing`, `quality_assurance`

## LLM Parameters

| Parameter | Value |
|-----------|-------|
| Temperature | 0.2 |
| Max Tokens | 6144 |

## Output Artifacts

- `test`
- `report`

## Usage

```typescript
import { AgentRegistry } from '@ai1st/core'

const registry = new AgentRegistry()
const agent = await registry.getAgent('tester')
```

---

[← Back to Agents](./index.md)
