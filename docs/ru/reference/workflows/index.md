# Каталог Workflows

ASMO включает **12 production-ready workflows** для типичных задач разработки.

## Обзор

| # | Workflow | Категория | Время | Агентов |
|---|----------|-----------|-------|---------|
| 1 | [🐛 Bug Fix Workflow](./1-bug_fix_workflow.md) | Быстрые исправления | 1h 5m | 3 |
| 10 | [🔌 API Design](./10-api_design.md) | API дизайн | 6h 30m | 4 |
| 2 | [✨ Full Feature Implementation](./2-feature_implementation_full.md) | Разработка функций | 2h 25m | 6 |
| 2 | [🎨 UI Component Library Development](./2-ui_component_library.md) | Разработка функций | 1h 20m | 3 |
| 3 | [🧪 Multi-Layer Testing](./3-comprehensive_testing.md) | Контроль качества | 35m | 3 |
| 3 | [📊 Performance Investigation & Optimization](./3-performance_investigation.md) | Контроль качества | 1h 35m | 4 |
| 4 | [🔧 Advanced Bug Fix](./4-advanced_bug_fix.md) | Исправление багов | 3h 20m | 5 |
| 5 | [♻️ Code Refactoring](./5-code_refactoring.md) | Рефакторинг | 3h 30m | 4 |
| 6 | [⚡ Performance Optimization](./6-performance_optimization.md) | Оптимизация | 3h 50m | 4 |
| 7 | [🔒 Security Audit](./7-security_audit.md) | Безопасность | 6h | 4 |
| 8 | [🏗️ Architecture Design](./8-architecture_design.md) | Архитектура | 6h | 3 |
| 9 | [💾 Database Migration](./9-database_migration.md) | База данных | 6h+ (depends on data size) | 4 |

## По категориям


### Быстрые исправления

- [🐛 Bug Fix Workflow](./1-bug_fix_workflow.md) - Debug → Fix → Test pipeline for bug fixes...

### API дизайн

- [🔌 API Design](./10-api_design.md) - Design REST/GraphQL API contracts with best practices...

### Разработка функций

- [✨ Full Feature Implementation](./2-feature_implementation_full.md) - Complete feature lifecycle: Design → Implement → Test → Depl...
- [🎨 UI Component Library Development](./2-ui_component_library.md) - UX-first component development: Design UX → Implement UI → T...

### Контроль качества

- [🧪 Multi-Layer Testing](./3-comprehensive_testing.md) - Parallel unit + E2E + performance tests before deployment...
- [📊 Performance Investigation & Optimization](./3-performance_investigation.md) - Parallel analysis by Debugger + Optimizer, then Developer im...

### Исправление багов

- [🔧 Advanced Bug Fix](./4-advanced_bug_fix.md) - Comprehensive bug resolution with root cause analysis and pr...

### Рефакторинг

- [♻️ Code Refactoring](./5-code_refactoring.md) - Systematic code quality improvement while maintaining functi...

### Оптимизация

- [⚡ Performance Optimization](./6-performance_optimization.md) - Systematic performance analysis and improvement workflow...

### Безопасность

- [🔒 Security Audit](./7-security_audit.md) - Comprehensive security assessment and vulnerability mitigati...

### Архитектура

- [🏗️ Architecture Design](./8-architecture_design.md) - Comprehensive system architecture design and documentation...

### База данных

- [💾 Database Migration](./9-database_migration.md) - Safe database schema changes and data migration workflow...

## Уровни сложности

Workflows автоматически выбираются на основе сложности задачи:

| Уровень | Баллы | Рекомендуемые workflows |
|---------|-------|------------------------|
| Trivial | 0-20 | Quick Flow (YOLO Mode) |
| Simple | 21-40 | Bug Fix, Quick Flow |
| Medium | 41-60 | Feature Development, Refactoring |
| Complex | 61-80 | Security Audit, API Design |
| Enterprise | 81-100 | Architecture Design, Database Migration |

## См. также

- [Концепция workflows](../../concepts/workflows.md)
- [Адаптивный выбор workflow](../../guides/adaptive-workflow.md)
- [Создание custom workflows](../../guides/custom-workflows.md)
