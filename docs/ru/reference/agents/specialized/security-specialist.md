# 🔒 Security Specialist

> Security audit and vulnerability assessment specialist. Performs OWASP Top 10 compliance checking, vulnerability scanning, threat modeling, security testing. Reviews authentication, authorization, data protection, and API security.

## Обзор

| Параметр | Значение |
|----------|----------|
| **ID** | `security-specialist` |
| **Категория** | Специализированный |
| **Тип роли** | Аналитический |
| **Приоритет** | 7/10 |
| **Домен** | Security & Compliance |

## Возможности

- Стандартные возможности агента

## Навыки

### Обязательные навыки

- `security_audit`
- `vulnerability_scanning`
- `threat_modeling`

### Дополнительные навыки

- `auth_authorization_review`
- `data_protection`
- `dependency_audit`
- `owasp_compliance`
- `incident_response`
- `security_testing`

## Интеграции (MCP)

- `github`
- `sentry`
- `memory`

## Правила активации

- **Тип**: Авто-подключение
- **Ключевые слова**: `security`, `vulnerability`, `audit`, `owasp`, `authentication`
- **Типы задач**: `security_audit`, `vulnerability_assessment`, `compliance_check`

## Параметры LLM

| Параметр | Значение |
|----------|----------|
| Temperature | 0.1 |
| Max Tokens | 4096 |

## Артефакты

- `documentation`
- `audit_report`

## Использование

```typescript
import { AgentRegistry } from '@asmo/core'

const registry = new AgentRegistry()
const agent = await registry.getAgent('security-specialist')
```

---

[← Назад к списку агентов](./index.md)
