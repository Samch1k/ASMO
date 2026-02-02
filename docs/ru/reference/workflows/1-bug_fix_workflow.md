# 🐛 Bug Fix Workflow

> Debug → Fix → Test pipeline for bug fixes

## Обзор

| Параметр | Значение |
|----------|----------|
| **ID** | `bug_fix_workflow` |
| **Время выполнения** | 1h 5m |
| **Количество фаз** | 3 |
| **Агентов задействовано** | 3 |

## Условия запуска

### Ключевые слова
`bug`, `error`, `broken`, `fail`, `crash`, `fix`

### Типы задач
- bug_fix

### Необходимые навыки
- `debugging`
- `code_writing`



## Фазы выполнения

| # | Агент | Фаза | Артефакты | Timeout | Approve |
|---|-------|------|-----------|---------|---------|
| 1 | debugger | investigation | bug_report, root_cause_analysis | 15m | - |
| 2 | developer | fix_implementation | code, unit_tests | 30m | - |
| 3 | tester | verification | test_results | 20m | - |

## Детальное описание фаз

### Фаза 1: investigation

**Агент:** `debugger`

Investigate root cause of the bug

**Артефакты:**
- bug_report
- root_cause_analysis

**Критерий завершения:** Root cause identified and documented

**Timeout:** 15m


### Фаза 2: fix_implementation

**Агент:** `developer`

Implement the fix based on investigation

**Артефакты:**
- code
- unit_tests

**Критерий завершения:** Fix implemented and unit tests pass

**Timeout:** 30m


### Фаза 3: verification

**Агент:** `tester`

Verify bug is fixed with E2E tests

**Артефакты:**
- test_results

**Критерий завершения:** Bug no longer reproduces in E2E tests

**Timeout:** 20m


## Критерий успеха

All tests pass and bug is resolved

## Использование

```typescript
import { WorkflowEngine, AgentRegistry } from '@asmo/core'

const registry = new AgentRegistry()
const engine = new WorkflowEngine(registry)
await engine.initialize()

// Запуск по ID
const result = await engine.execute('bug_fix_workflow')

// Или адаптивный выбор по описанию задачи
const result = await engine.execute('bug...')
```

---

[← Назад к списку workflows](./index.md)
