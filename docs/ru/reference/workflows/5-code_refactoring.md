# ♻️ Code Refactoring

> Systematic code quality improvement while maintaining functionality

## Обзор

| Параметр | Значение |
|----------|----------|
| **ID** | `code_refactoring` |
| **Время выполнения** | 3h 30m |
| **Количество фаз** | 5 |
| **Агентов задействовано** | 4 |

## Условия запуска

### Ключевые слова
`refactor`, `cleanup`, `improve code`, `technical debt`, `code quality`, `рефакторинг`

### Типы задач
- refactoring
- code_quality
- maintenance

### Необходимые навыки
- `code_writing`
- `architecture_review`
- `code_optimization`

### Уровень сложности
- simple
- medium
- complex

## Фазы выполнения

| # | Агент | Фаза | Артефакты | Timeout | Approve |
|---|-------|------|-----------|---------|---------|
| 1 | architect | analysis | code_analysis_report, improvement_recommendations | 30m | - |
| 2 | code-reviewer | assessment | quality_assessment, prioritized_issues | 20m | - |
| 3 | tester | test_preparation | baseline_tests, test_coverage_report | 40m | - |
| 4 | developer | refactoring | refactored_code, updated_tests | 90m | - |
| 5 | code-reviewer | validation | quality_comparison, review_report | 30m | - |

## Детальное описание фаз

### Фаза 1: analysis

**Агент:** `architect`

Analyze current code structure and identify improvement opportunities

**Артефакты:**
- code_analysis_report
- improvement_recommendations
- refactoring_plan

**Критерий завершения:** Refactoring scope and approach clearly defined

**Timeout:** 30m


### Фаза 2: assessment

**Агент:** `code-reviewer`

Review code quality issues and prioritize refactoring targets

**Артефакты:**
- quality_assessment
- prioritized_issues
- risk_analysis

**Критерий завершения:** Refactoring priorities established with risk assessment

**Timeout:** 20m


### Фаза 3: test_preparation

**Агент:** `tester`

Establish baseline tests to ensure no functionality regression

**Артефакты:**
- baseline_tests
- test_coverage_report
- regression_test_suite

**Критерий завершения:** Comprehensive test suite in place before refactoring

**Timeout:** 40m


### Фаза 4: refactoring

**Агент:** `developer`

Implement refactoring changes incrementally with continuous testing

**Артефакты:**
- refactored_code
- updated_tests
- migration_guide

**Критерий завершения:** Code refactored, all tests passing, functionality preserved

**Timeout:** 90m


### Фаза 5: validation

**Агент:** `code-reviewer`

Verify refactoring improved code quality without breaking functionality

**Артефакты:**
- quality_comparison
- review_report
- approval

**Критерий завершения:** Code quality improved and functionality verified

**Timeout:** 30m


## Критерий успеха

Code quality improved, all tests passing, no functionality regression, documentation updated

## Использование

```typescript
import { WorkflowEngine, AgentRegistry } from '@asmo/core'

const registry = new AgentRegistry()
const engine = new WorkflowEngine(registry)
await engine.initialize()

// Запуск по ID
const result = await engine.execute('code_refactoring')

// Или адаптивный выбор по описанию задачи
const result = await engine.execute('refactor...')
```

---

[← Назад к списку workflows](./index.md)
