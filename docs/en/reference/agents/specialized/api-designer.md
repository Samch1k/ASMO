# 🔌 API Designer

> RESTful API and OpenAPI specification specialist. Designs API endpoints, defines request/response schemas, creates OpenAPI specs, establishes API versioning and error handling standards. Ensures API security, rate limiting, and documentation.

## Overview

| Property | Value |
|----------|-------|
| **ID** | `api-designer` |
| **Category** | specialized |
| **Role Type** | reasoning |
| **Priority** | 6/10 |
| **Domain** | API Design |

## Capabilities

- Standard agent capabilities

## Skills

### Required Skills

- `api_design`
- `rest_api`
- `openapi_spec`

### Optional Skills

- `graphql_design`
- `api_versioning`
- `request_validation`
- `response_design`
- `error_handling`
- `api_security`
- `rate_limiting`

## Integrations (MCP)

- `github`
- `context7`
- `memory`

## Activation Rules

- **Type**: Auto-attached
- **Trigger Keywords**: `api`, `endpoint`, `rest`, `graphql`, `openapi`
- **Task Types**: `api_design`, `api_documentation`, `contract_design`

## LLM Parameters

| Parameter | Value |
|-----------|-------|
| Temperature | 0.2 |
| Max Tokens | 4096 |

## Output Artifacts

- `documentation`
- `code`

## Usage

```typescript
import { AgentRegistry } from '@ai1st/core'

const registry = new AgentRegistry()
const agent = await registry.getAgent('api-designer')
```

---

[← Back to Agents](./index.md)
