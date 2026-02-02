# ⚡ Performance Optimization

> Systematic performance analysis and improvement workflow

## Обзор

| Параметр | Значение |
|----------|----------|
| **ID** | `performance_optimization` |
| **Время выполнения** | 3h 50m |
| **Количество фаз** | 5 |
| **Агентов задействовано** | 4 |

## Условия запуска

### Ключевые слова
`slow`, `performance`, `optimize`, `speed up`, `latency`, `bottleneck`

### Типы задач
- performance
- optimization

### Необходимые навыки
- `performance_analysis`
- `profiling`
- `code_optimization`

### Уровень сложности
- medium
- complex

## Фазы выполнения

| # | Агент | Фаза | Артефакты | Timeout | Approve |
|---|-------|------|-----------|---------|---------|
| 1 | optimizer | profiling | performance_baseline, profiling_results | 45m | - |
| 2 | architect | strategy | optimization_plan, architecture_improvements | 30m | - |
| 3 | developer | implementation | optimized_code, performance_tests | 90m | - |
| 4 | tester | validation | performance_comparison, regression_test_results | 40m | - |
| 5 | optimizer | monitoring | monitoring_dashboard, performance_alerts | 25m | - |

## Детальное описание фаз

### Фаза 1: profiling

**Агент:** `optimizer`

Profile system to identify performance bottlenecks

**Артефакты:**
- performance_baseline
- profiling_results
- bottleneck_analysis
- metrics_report

**Критерий завершения:** Performance bottlenecks identified with metrics

**Timeout:** 45m


### Фаза 2: strategy

**Агент:** `architect`

Design optimization strategy addressing identified bottlenecks

**Артефакты:**
- optimization_plan
- architecture_improvements
- risk_assessment

**Критерий завершения:** Optimization strategy defined with expected improvements

**Timeout:** 30m


### Фаза 3: implementation

**Агент:** `developer`

Implement optimizations with performance monitoring

**Артефакты:**
- optimized_code
- performance_tests
- benchmarks

**Критерий завершения:** Optimizations implemented with measurable improvements

**Timeout:** 90m


### Фаза 4: validation

**Агент:** `tester`

Validate performance improvements and ensure no regressions

**Артефакты:**
- performance_comparison
- regression_test_results
- load_test_results

**Критерий завершения:** Performance improvements validated, no functional regressions

**Timeout:** 40m


### Фаза 5: monitoring

**Агент:** `optimizer`

Set up monitoring and establish performance baselines

**Артефакты:**
- monitoring_dashboard
- performance_alerts
- optimization_report

**Критерий завершения:** Monitoring in place, improvements documented

**Timeout:** 25m


## Критерий успеха

Measurable performance improvements achieved, no regressions, monitoring established

## Использование

```typescript
import { WorkflowEngine, AgentRegistry } from '@asmo/core'

const registry = new AgentRegistry()
const engine = new WorkflowEngine(registry)
await engine.initialize()

// Запуск по ID
const result = await engine.execute('performance_optimization')

// Или адаптивный выбор по описанию задачи
const result = await engine.execute('slow...')
```

---

[← Назад к списку workflows](./index.md)
