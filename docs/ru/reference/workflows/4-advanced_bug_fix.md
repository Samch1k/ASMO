# 🔧 Advanced Bug Fix

> Comprehensive bug resolution with root cause analysis and prevention

## Обзор

| Параметр | Значение |
|----------|----------|
| **ID** | `advanced_bug_fix` |
| **Время выполнения** | 3h 20m |
| **Количество фаз** | 5 |
| **Агентов задействовано** | 5 |

## Условия запуска

### Ключевые слова
`complex bug`, `system bug`, `critical bug`, `production issue`, `outage`, `crash`

### Типы задач
- bug_fix
- incident_response

### Необходимые навыки
- `debugging`
- `root_cause_analysis`
- `system_design`

### Уровень сложности
- medium
- complex

## Фазы выполнения

| # | Агент | Фаза | Артефакты | Timeout | Approve |
|---|-------|------|-----------|---------|---------|
| 1 | debugger | investigation | detailed_bug_report, root_cause_analysis | 45m | - |
| 2 | architect | solution_design | fix_design, prevention_strategy | 30m | - |
| 3 | developer | implementation | code, unit_tests | 60m | - |
| 4 | tester | verification | test_results, regression_test_results | 45m | - |
| 5 | code-reviewer | review | code_review_report, improvement_suggestions | 20m | - |

## Детальное описание фаз

### Фаза 1: investigation

**Агент:** `debugger`

Deep investigation of the bug including system analysis

**Артефакты:**
- detailed_bug_report
- root_cause_analysis
- impact_assessment
- reproduction_steps

**Критерий завершения:** Root cause identified with full understanding of system impact

**Timeout:** 45m


### Фаза 2: solution_design

**Агент:** `architect`

Design comprehensive fix that addresses root cause and prevents recurrence

**Артефакты:**
- fix_design
- prevention_strategy
- testing_strategy

**Критерий завершения:** Fix approach approved with prevention measures defined

**Timeout:** 30m


### Фаза 3: implementation

**Агент:** `developer`

Implement fix with proper error handling and logging

**Артефакты:**
- code
- unit_tests
- integration_tests
- updated_documentation

**Критерий завершения:** Fix implemented with comprehensive tests

**Timeout:** 60m


### Фаза 4: verification

**Агент:** `tester`

Thorough testing including edge cases and regression testing

**Артефакты:**
- test_results
- regression_test_results
- performance_impact_analysis

**Критерий завершения:** Bug verified as fixed with no regressions

**Timeout:** 45m


### Фаза 5: review

**Агент:** `code-reviewer`

Review fix for quality and prevention measures

**Артефакты:**
- code_review_report
- improvement_suggestions

**Критерий завершения:** Code reviewed and approved

**Timeout:** 20m


## Критерий успеха

Bug resolved, prevention measures in place, all tests passing, no regressions

## Использование

```typescript
import { WorkflowEngine, AgentRegistry } from '@ai1st/core'

const registry = new AgentRegistry()
const engine = new WorkflowEngine(registry)
await engine.initialize()

// Запуск по ID
const result = await engine.execute('advanced_bug_fix')

// Или адаптивный выбор по описанию задачи
const result = await engine.execute('complex bug...')
```

---

[← Назад к списку workflows](./index.md)
