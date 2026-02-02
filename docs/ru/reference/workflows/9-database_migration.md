# 💾 Database Migration

> Safe database schema changes and data migration workflow

## Обзор

| Параметр | Значение |
|----------|----------|
| **ID** | `database_migration` |
| **Время выполнения** | 6h+ (depends on data size) |
| **Количество фаз** | 6 |
| **Агентов задействовано** | 4 |

## Условия запуска

### Ключевые слова
`database`, `schema`, `migration`, `migrate data`, `alter table`, `db change`

### Типы задач
- database
- migration
- data_change

### Необходимые навыки
- `database_design`
- `data_migration`
- `sql`

### Уровень сложности
- medium
- complex
- enterprise

## Фазы выполнения

| # | Агент | Фаза | Артефакты | Timeout | Approve |
|---|-------|------|-----------|---------|---------|
| 1 | architect | planning | migration_plan, schema_design | 60m | - |
| 2 | developer | script_development | migration_scripts, rollback_scripts | 90m | - |
| 3 | tester | testing | migration_test_results, data_integrity_report | 120m | - |
| 4 | devops | execution_planning | execution_plan, downtime_schedule | 30m | - |
| 5 | developer | execution | migration_execution_log, validation_results | Variable (depends on data size) | - |
| 6 | tester | validation | data_validation_report, application_test_results | 45m | - |

## Детальное описание фаз

### Фаза 1: planning

**Агент:** `architect`

Plan database schema changes and migration strategy

**Артефакты:**
- migration_plan
- schema_design
- data_mapping
- rollback_strategy

**Критерий завершения:** Migration plan complete with rollback strategy

**Timeout:** 60m


### Фаза 2: script_development

**Агент:** `developer`

Develop migration scripts with proper error handling

**Артефакты:**
- migration_scripts
- rollback_scripts
- data_validation_scripts
- backup_scripts

**Критерий завершения:** Migration and rollback scripts ready and tested

**Timeout:** 90m


### Фаза 3: testing

**Агент:** `tester`

Test migration on staging environment with production data

**Артефакты:**
- migration_test_results
- data_integrity_report
- performance_impact_assessment
- rollback_test_results

**Критерий завершения:** Migration tested successfully with no data loss

**Timeout:** 120m


### Фаза 4: execution_planning

**Агент:** `devops`

Plan production migration with minimal downtime

**Артефакты:**
- execution_plan
- downtime_schedule
- monitoring_checklist
- communication_plan

**Критерий завершения:** Production migration plan approved with downtime scheduled

**Timeout:** 30m


### Фаза 5: execution

**Агент:** `developer`

Execute migration with monitoring and validation

**Артефакты:**
- migration_execution_log
- validation_results
- performance_metrics

**Критерий завершения:** Migration completed successfully with data validated

**Timeout:** Variable (depends on data size)


### Фаза 6: validation

**Агент:** `tester`

Validate data integrity and application functionality

**Артефакты:**
- data_validation_report
- application_test_results
- post_migration_report

**Критерий завершения:** Data integrity verified, application functioning correctly

**Timeout:** 45m


## Критерий успеха

Schema migrated, data integrity preserved, application functional, rollback tested

## Использование

```typescript
import { WorkflowEngine, AgentRegistry } from '@asmo/core'

const registry = new AgentRegistry()
const engine = new WorkflowEngine(registry)
await engine.initialize()

// Запуск по ID
const result = await engine.execute('database_migration')

// Или адаптивный выбор по описанию задачи
const result = await engine.execute('database...')
```

---

[← Назад к списку workflows](./index.md)
