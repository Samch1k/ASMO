# 📊 Performance Investigation & Optimization

> Parallel analysis by Debugger + Optimizer, then Developer implements fixes

## Обзор

| Параметр | Значение |
|----------|----------|
| **ID** | `performance_investigation` |
| **Время выполнения** | 1h 35m |
| **Количество фаз** | 3 |
| **Агентов задействовано** | 4 |

## Условия запуска

### Ключевые слова
`slow`, `performance`, `optimize`, `speed`, `latency`, `медленн`

### Типы задач
- optimization

### Необходимые навыки
- `performance_optimization`
- `debugging`
- `performance_analysis`



## Фазы выполнения

| # | Агент | Фаза | Артефакты | Timeout | Approve |
|---|-------|------|-----------|---------|---------|
| 1 | debugger | error_analysis | error_report, stack_traces | 20m | ⚡ Parallel |
|  | optimizer | performance_profiling | performance_metrics, bottleneck_analysis | 20m |  |
| 2 | developer | optimization_implementation | code, performance_improvements | 40m | - |
| 3 | tester | performance_verification | benchmark_results | 15m | - |

## Детальное описание фаз

### Фаза 1: Параллельное выполнение


#### debugger - error_analysis

Analyze error patterns and stack traces

**Артефакты:**
- error_report
- stack_traces

**Критерий завершения:** Error patterns identified


#### optimizer - performance_profiling

Profile performance and identify bottlenecks

**Артефакты:**
- performance_metrics
- bottleneck_analysis

**Критерий завершения:** Bottlenecks identified


### Фаза 2: optimization_implementation

**Агент:** `developer`

Implement optimizations based on analysis

**Артефакты:**
- code
- performance_improvements

**Критерий завершения:** Optimizations implemented

**Timeout:** 40m


### Фаза 3: performance_verification

**Агент:** `tester`

Run benchmarks to verify improvements

**Артефакты:**
- benchmark_results

**Критерий завершения:** Performance meets targets

**Timeout:** 15m


## Критерий успеха

Performance improved and verified with benchmarks

## Использование

```typescript
import { WorkflowEngine, AgentRegistry } from '@asmo/core'

const registry = new AgentRegistry()
const engine = new WorkflowEngine(registry)
await engine.initialize()

// Запуск по ID
const result = await engine.execute('performance_investigation')

// Или адаптивный выбор по описанию задачи
const result = await engine.execute('slow...')
```

---

[← Назад к списку workflows](./index.md)
