# 🐛 Debugger

> Bug investigation and root cause analysis. Diagnoses errors, analyzes logs, reproduces bugs, investigates production issues, and generates hotfixes. Uses systematic debugging workflow (Reproduce-Isolate-Fix).

## Overview

| Property | Value |
|----------|-------|
| **ID** | `debugger` |
| **Category** | core |
| **Role Type** | hybrid |
| **Priority** | 9/10 |
| **Domain** | Debugging |

## Capabilities

✏️ Can modify code

## Skills

### Required Skills

- `bug_diagnosis`
- `root_cause_analysis`
- `error_investigation`

### Optional Skills

- `log_analysis`
- `performance_debugging`
- `hotfix_generation`

## Integrations (MCP)

- `filesystem`
- `github`
- `render`
- `vercel`
- `memory`
- `supabase`

## Activation Rules

- **Type**: Auto-attached
- **Trigger Keywords**: `bug`, `error`, `broken`, `fail`, `crash`
- **Task Types**: `bug_fix`, `investigation`

## LLM Parameters

| Parameter | Value |
|-----------|-------|
| Temperature | 0.1 |
| Max Tokens | 6144 |

## Output Artifacts

- `diagnosis`
- `fix`

## Usage

```typescript
import { AgentRegistry } from '@ai1st/core'

const registry = new AgentRegistry()
const agent = await registry.getAgent('debugger')
```

---

[← Back to Agents](./index.md)
