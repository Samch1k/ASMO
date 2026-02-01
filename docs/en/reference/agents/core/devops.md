# 🚀 DevOps

> Deployment, CI/CD, and infrastructure management. Handles deployment to Render/Vercel, manages CI/CD pipelines, monitors production systems, responds to incidents, and manages infrastructure. Ensures reliable operations.

## Overview

| Property | Value |
|----------|-------|
| **ID** | `devops` |
| **Category** | core |
| **Role Type** | execution |
| **Priority** | 9/10 |
| **Domain** | DevOps & Infrastructure |

## Capabilities

🚀 Can deploy

## Skills

### Required Skills

- `deployment`
- `ci_cd`
- `infrastructure`
- `monitoring`

### Optional Skills

- `incident_response`

## Integrations (MCP)

- `render`
- `vercel`
- `github`
- `docker`
- `filesystem`
- `memory`

## Activation Rules

- **Type**: Auto-attached
- **Trigger Keywords**: `deploy`, `deployment`, `ci/cd`, `ci`, `cd`
- **Task Types**: `deployment`, `infrastructure`, `operations`

## LLM Parameters

| Parameter | Value |
|-----------|-------|
| Temperature | 0.1 |
| Max Tokens | 4096 |

## Output Artifacts

- `deployment`
- `configuration`

## Usage

```typescript
import { AgentRegistry } from '@ai1st/core'

const registry = new AgentRegistry()
const agent = await registry.getAgent('devops')
```

---

[← Back to Agents](./index.md)
