# 🔒 Security Specialist

> Security audit and vulnerability assessment specialist. Performs OWASP Top 10 compliance checking, vulnerability scanning, threat modeling, security testing. Reviews authentication, authorization, data protection, and API security.

## Overview

| Property | Value |
|----------|-------|
| **ID** | `security-specialist` |
| **Category** | specialized |
| **Role Type** | reasoning |
| **Priority** | 7/10 |
| **Domain** | Security & Compliance |

## Capabilities

- Standard agent capabilities

## Skills

### Required Skills

- `security_audit`
- `vulnerability_scanning`
- `threat_modeling`

### Optional Skills

- `auth_authorization_review`
- `data_protection`
- `dependency_audit`
- `owasp_compliance`
- `incident_response`
- `security_testing`

## Integrations (MCP)

- `github`
- `sentry`
- `memory`

## Activation Rules

- **Type**: Auto-attached
- **Trigger Keywords**: `security`, `vulnerability`, `audit`, `owasp`, `authentication`
- **Task Types**: `security_audit`, `vulnerability_assessment`, `compliance_check`

## LLM Parameters

| Parameter | Value |
|-----------|-------|
| Temperature | 0.1 |
| Max Tokens | 4096 |

## Output Artifacts

- `documentation`
- `audit_report`

## Usage

```typescript
import { AgentRegistry } from '@ai1st/core'

const registry = new AgentRegistry()
const agent = await registry.getAgent('security-specialist')
```

---

[← Back to Agents](./index.md)
