# 💾 Database Migration

> Safe database schema changes and data migration workflow

## Overview

| Property | Value |
|----------|-------|
| **ID** | `database_migration` |
| **Estimated Time** | 6h+ (depends on data size) |
| **Phases** | 6 |
| **Agents Involved** | 4 |

## Trigger Conditions

### Keywords
`database`, `schema`, `migration`, `migrate data`, `alter table`, `db change`

### Task Types
- database
- migration
- data_change

### Required Skills
- `database_design`
- `data_migration`
- `sql`

### Complexity Range
- medium
- complex
- enterprise

## Execution Phases

| # | Agent | Phase | Deliverables | Timeout | Approval |
|---|-------|-------|--------------|---------|----------|
| 1 | architect | planning | migration_plan, schema_design | 60m | - |
| 2 | developer | script_development | migration_scripts, rollback_scripts | 90m | - |
| 3 | tester | testing | migration_test_results, data_integrity_report | 120m | - |
| 4 | devops | execution_planning | execution_plan, downtime_schedule | 30m | - |
| 5 | developer | execution | migration_execution_log, validation_results | Variable (depends on data size) | - |
| 6 | tester | validation | data_validation_report, application_test_results | 45m | - |

## Phase Details

### Phase 1: planning

**Agent:** `architect`

Plan database schema changes and migration strategy

**Deliverables:**
- migration_plan
- schema_design
- data_mapping
- rollback_strategy

**Exit Criteria:** Migration plan complete with rollback strategy

**Timeout:** 60m


### Phase 2: script_development

**Agent:** `developer`

Develop migration scripts with proper error handling

**Deliverables:**
- migration_scripts
- rollback_scripts
- data_validation_scripts
- backup_scripts

**Exit Criteria:** Migration and rollback scripts ready and tested

**Timeout:** 90m


### Phase 3: testing

**Agent:** `tester`

Test migration on staging environment with production data

**Deliverables:**
- migration_test_results
- data_integrity_report
- performance_impact_assessment
- rollback_test_results

**Exit Criteria:** Migration tested successfully with no data loss

**Timeout:** 120m


### Phase 4: execution_planning

**Agent:** `devops`

Plan production migration with minimal downtime

**Deliverables:**
- execution_plan
- downtime_schedule
- monitoring_checklist
- communication_plan

**Exit Criteria:** Production migration plan approved with downtime scheduled

**Timeout:** 30m


### Phase 5: execution

**Agent:** `developer`

Execute migration with monitoring and validation

**Deliverables:**
- migration_execution_log
- validation_results
- performance_metrics

**Exit Criteria:** Migration completed successfully with data validated

**Timeout:** Variable (depends on data size)


### Phase 6: validation

**Agent:** `tester`

Validate data integrity and application functionality

**Deliverables:**
- data_validation_report
- application_test_results
- post_migration_report

**Exit Criteria:** Data integrity verified, application functioning correctly

**Timeout:** 45m


## Success Criteria

Schema migrated, data integrity preserved, application functional, rollback tested

## Usage

```typescript
import { WorkflowEngine, AgentRegistry } from '@ai1st/core'

const registry = new AgentRegistry()
const engine = new WorkflowEngine(registry)
await engine.initialize()

// Execute by ID
const result = await engine.execute('database_migration')

// Or adaptive selection by task description
const result = await engine.execute('database...')
```

---

[← Back to Workflows](./index.md)
