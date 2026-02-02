# 📝 Requirements Validator

> Requirements quality assurance specialist. Validates requirements using INVEST criteria (Independent, Negotiable, Valuable, Estimable, Small, Testable), checks completeness, identifies missing edge cases. Quality gate before design phase.

## Overview

| Property | Value |
|----------|-------|
| **ID** | `requirements-validator` |
| **Category** | specialized |
| **Role Type** | reasoning |
| **Priority** | 7/10 |
| **Domain** | Requirements Quality Assurance |

## Capabilities

- Standard agent capabilities

## Skills

### Required Skills

- `requirements_validation`
- `quality_assurance`

### Optional Skills

- `completeness_checking`

## Integrations (MCP)

- `memory`
- `filesystem`

## Activation Rules

- **Type**: Auto-attached
- **Trigger Keywords**: `validate requirements`, `check requirements`, `review requirements`
- **Task Types**: `validation`, `quality_assurance`

## LLM Parameters

| Parameter | Value |
|-----------|-------|
| Temperature | 0.2 |
| Max Tokens | 6144 |

## Output Artifacts

- `validation`
- `report`

## Usage

```typescript
import { AgentRegistry } from '@asmo/core'

const registry = new AgentRegistry()
const agent = await registry.getAgent('requirements-validator')
```

---

[← Back to Agents](./index.md)
