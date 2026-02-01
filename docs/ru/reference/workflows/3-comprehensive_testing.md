# 🧪 Multi-Layer Testing

> Parallel unit + E2E + performance tests before deployment

## Обзор

| Параметр | Значение |
|----------|----------|
| **ID** | `comprehensive_testing` |
| **Время выполнения** | 35m |
| **Количество фаз** | 2 |
| **Агентов задействовано** | 3 |

## Условия запуска

### Ключевые слова
`test everything`, `full test`, `comprehensive test`, `тест все`, `полный тест`, `run all tests`

### Типы задач
- testing

### Необходимые навыки
- `unit_testing`
- `e2e_testing`
- `performance_analysis`



## Фазы выполнения

| # | Агент | Фаза | Артефакты | Timeout | Approve |
|---|-------|------|-----------|---------|---------|
| 1 | tester | unit_testing | unit_test_results | 15m | ⚡ Parallel |
|  | tester | e2e_testing | e2e_test_results | 25m |  |
|  | optimizer | performance_testing | performance_test_results | 20m |  |
| 2 | devops | deployment | deployment_logs | 10m | ✅ Required |

## Детальное описание фаз

### Фаза 1: Параллельное выполнение


#### tester - unit_testing

Run unit tests

**Артефакты:**
- unit_test_results

**Критерий завершения:** All unit tests pass


#### tester - e2e_testing

Run E2E tests with Playwright

**Артефакты:**
- e2e_test_results

**Критерий завершения:** All E2E tests pass


#### optimizer - performance_testing

Run performance benchmarks

**Артефакты:**
- performance_test_results

**Критерий завершения:** Performance benchmarks meet thresholds


### Фаза 2: deployment

**Агент:** `devops`

Deploy if all tests pass

**Артефакты:**
- deployment_logs

**Критерий завершения:** Deployed successfully

**Timeout:** 10m

**⚠️ Требуется подтверждение перед продолжением**

## Критерий успеха

All test layers pass and deployed

## Использование

```typescript
import { WorkflowEngine, AgentRegistry } from '@ai1st/core'

const registry = new AgentRegistry()
const engine = new WorkflowEngine(registry)
await engine.initialize()

// Запуск по ID
const result = await engine.execute('comprehensive_testing')

// Или адаптивный выбор по описанию задачи
const result = await engine.execute('test everything...')
```

---

[← Назад к списку workflows](./index.md)
