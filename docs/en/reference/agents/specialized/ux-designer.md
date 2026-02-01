# 🎭 UX Designer

> User experience design and prototyping specialist. Designs user flows, creates wireframes, conducts user research and testing, ensures usability, and prototypes interfaces. Focuses on user-centered design principles.

## Overview

| Property | Value |
|----------|-------|
| **ID** | `ux-designer` |
| **Category** | specialized |
| **Role Type** | reasoning |
| **Priority** | 5/10 |
| **Domain** | UX Design |

## Capabilities

- Standard agent capabilities

## Skills

### Required Skills

- `user_flows`
- `wireframes`
- `usability`

### Optional Skills

- `user_research`
- `prototyping`
- `user_testing`

## Integrations (MCP)

- `filesystem`
- `figma`
- `memory`
- `context7`

## Activation Rules

- **Type**: Auto-attached
- **Trigger Keywords**: `ux`, `user experience`, `wireframe`, `prototype`, `user flow`
- **Task Types**: `design`, `ux`, `prototyping`

## LLM Parameters

| Parameter | Value |
|-----------|-------|
| Temperature | 0.4 |
| Max Tokens | 6144 |

## Output Artifacts

- `design`
- `wireframe`

## Usage

```typescript
import { AgentRegistry } from '@ai1st/core'

const registry = new AgentRegistry()
const agent = await registry.getAgent('ux-designer')
```

---

[← Back to Agents](./index.md)
