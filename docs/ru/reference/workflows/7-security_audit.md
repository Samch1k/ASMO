# 🔒 Security Audit

> Comprehensive security assessment and vulnerability mitigation

## Обзор

| Параметр | Значение |
|----------|----------|
| **ID** | `security_audit` |
| **Время выполнения** | 6h |
| **Количество фаз** | 5 |
| **Агентов задействовано** | 4 |

## Условия запуска

### Ключевые слова
`security`, `vulnerability`, `audit`, `penetration test`, `security review`, `OWASP`

### Типы задач
- security
- audit
- compliance

### Необходимые навыки
- `security`
- `vulnerability_assessment`
- `code_review`

### Уровень сложности
- complex
- enterprise

## Фазы выполнения

| # | Агент | Фаза | Артефакты | Timeout | Approve |
|---|-------|------|-----------|---------|---------|
| 1 | architect | threat_modeling | threat_model, attack_surface_analysis | 45m | - |
| 2 | code-reviewer | code_audit | code_audit_report, vulnerability_findings | 60m | - |
| 3 | tester | vulnerability_testing | penetration_test_results, vulnerability_scan_results | 90m | - |
| 4 | developer | remediation | security_fixes, hardening_improvements | 120m | - |
| 5 | tester | validation | retest_results, security_compliance_report | 45m | - |

## Детальное описание фаз

### Фаза 1: threat_modeling

**Агент:** `architect`

Identify potential security threats and attack vectors

**Артефакты:**
- threat_model
- attack_surface_analysis
- security_requirements

**Критерий завершения:** Threat model complete with identified vulnerabilities

**Timeout:** 45m


### Фаза 2: code_audit

**Агент:** `code-reviewer`

Review code for security vulnerabilities and best practices

**Артефакты:**
- code_audit_report
- vulnerability_findings
- owasp_compliance_check

**Критерий завершения:** Code reviewed for OWASP Top 10 and common vulnerabilities

**Timeout:** 60m


### Фаза 3: vulnerability_testing

**Агент:** `tester`

Perform security testing and penetration testing

**Артефакты:**
- penetration_test_results
- vulnerability_scan_results
- security_test_report

**Критерий завершения:** Security testing complete with documented findings

**Timeout:** 90m


### Фаза 4: remediation

**Агент:** `developer`

Implement fixes for identified security vulnerabilities

**Артефакты:**
- security_fixes
- hardening_improvements
- security_tests

**Критерий завершения:** Critical and high-severity vulnerabilities fixed

**Timeout:** 120m


### Фаза 5: validation

**Агент:** `tester`

Verify vulnerabilities are fixed and no new issues introduced

**Артефакты:**
- retest_results
- security_compliance_report
- final_audit_report

**Критерий завершения:** All critical vulnerabilities fixed and verified

**Timeout:** 45m


## Критерий успеха

All critical and high-severity vulnerabilities fixed, security best practices implemented, compliance verified

## Использование

```typescript
import { WorkflowEngine, AgentRegistry } from '@asmo/core'

const registry = new AgentRegistry()
const engine = new WorkflowEngine(registry)
await engine.initialize()

// Запуск по ID
const result = await engine.execute('security_audit')

// Или адаптивный выбор по описанию задачи
const result = await engine.execute('security...')
```

---

[← Назад к списку workflows](./index.md)
