# ⚡ Производительность

7 навыков в этой категории.

## Обзор

| Навык | Сложность | Время | Успешность |
|-------|-----------|-------|------------|
| **Bundle Optimization** | 🟠 Продвинутый | 45m | 80% |
| **Caching Strategy** | 🟠 Продвинутый | 1h | 80% |
| **Code Optimization** | 🟠 Продвинутый | 1h | 75% |
| **Performance Analysis** | 🟠 Продвинутый | 1h | 80% |
| **Performance Optimization Workflow** | 🟠 Продвинутый | 4-16h | 80% |
| **Profiling** | 🟠 Продвинутый | 30m | 85% |
| **Query Optimization** | 🟠 Продвинутый | 45m | 80% |


## 🟠 Продвинутый навыки


### Bundle Optimization

Optimize JavaScript bundle sizes through code splitting, tree shaking, lazy loading, and removing unused dependencies. Improve initial load time.

| Параметр | Значение |
|----------|----------|
| ID | `bundle_optimization` |
| Время | 45m |
| Порог уверенности | 0.85 |
| Сложность | 7/10 |


**Комбинируется с:** `code_optimization`
**Алиасы:** bundle, bundle size, webpack optimization


### Caching Strategy

Design and implement caching strategies to improve performance. Includes cache invalidation, cache layers, and choosing appropriate caching mechanisms.

| Параметр | Значение |
|----------|----------|
| ID | `caching_strategy` |
| Время | 1h |
| Порог уверенности | 0.85 |
| Сложность | 7/10 |


**Комбинируется с:** `performance_analysis`
**Алиасы:** caching, cache, cache optimization


### Code Optimization

Optimize code for better performance, including algorithm improvements, reducing complexity, optimizing loops, and improving memory usage.

| Параметр | Значение |
|----------|----------|
| ID | `code_optimization` |
| Время | 1h |
| Порог уверенности | 0.85 |
| Сложность | 8/10 |

**Требует:** `typescript_expert`
**Комбинируется с:** `performance_analysis`, `refactoring`
**Алиасы:** optimize code, code performance, optimization


### Performance Analysis

Analyze application performance metrics, identify bottlenecks, and recommend optimizations. Includes profiling, benchmarking, and performance testing.

| Параметр | Значение |
|----------|----------|
| ID | `performance_analysis` |
| Время | 1h |
| Порог уверенности | 0.85 |
| Сложность | 7/10 |

**Требует:** `profiling`
**Комбинируется с:** `query_optimization`, `code_optimization`
**Алиасы:** performance, analyze performance, perf analysis


### Performance Optimization Workflow

Systematic performance optimization combining profiling, analysis, code optimization, and caching. Identifies bottlenecks, implements optimizations, and validates improvements. Use when: optimizing performance, reducing latency, improving throughput. Keywords: performance, optimization, profiling, caching

| Параметр | Значение |
|----------|----------|
| ID | `performance_optimization_workflow` |
| Время | 4-16h |
| Порог уверенности | 0.85 |
| Сложность | 8/10 |






### Profiling

Profile application performance to identify CPU hotspots, memory usage, and bottlenecks. Generate performance reports with actionable insights.

| Параметр | Значение |
|----------|----------|
| ID | `profiling` |
| Время | 30m |
| Порог уверенности | 0.85 |
| Сложность | 7/10 |


**Комбинируется с:** `performance_analysis`, `performance_debugging`
**Алиасы:** profile, profiler, performance profiling


### Query Optimization

Optimize database queries for better performance. Includes index optimization, query rewriting, analyzing query plans, and reducing N+1 queries.

| Параметр | Значение |
|----------|----------|
| ID | `query_optimization` |
| Время | 45m |
| Порог уверенности | 0.85 |
| Сложность | 8/10 |


**Комбинируется с:** `performance_analysis`
**Алиасы:** optimize queries, database optimization, query performance


---

[← Назад к каталогу навыков](./index.md)
