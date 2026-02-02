# 🏗️ Architecture Design

> Comprehensive system architecture design and documentation

## Обзор

| Параметр | Значение |
|----------|----------|
| **ID** | `architecture_design` |
| **Время выполнения** | 6h |
| **Количество фаз** | 5 |
| **Агентов задействовано** | 3 |

## Условия запуска

### Ключевые слова
`architecture`, `system design`, `design system`, `architectural`, `redesign`, `microservices`

### Типы задач
- architecture
- system_design
- planning

### Необходимые навыки
- `system_design`
- `architecture_decisions`
- `documentation`

### Уровень сложности
- complex
- enterprise

## Фазы выполнения

| # | Агент | Фаза | Артефакты | Timeout | Approve |
|---|-------|------|-----------|---------|---------|
| 1 | architect | requirements_analysis | requirements_document, constraints_analysis | 45m | - |
| 2 | architect | high_level_design | system_architecture_diagram, component_diagram | 90m | - |
| 3 | architect | detailed_design | api_contracts, data_models | 120m | - |
| 4 | code-reviewer | review | architecture_review_report, risk_assessment | 60m | - |
| 5 | devops | infrastructure_planning | infrastructure_plan, deployment_strategy | 45m | - |

## Детальное описание фаз

### Фаза 1: requirements_analysis

**Агент:** `architect`

Analyze requirements and constraints for architecture

**Артефакты:**
- requirements_document
- constraints_analysis
- quality_attributes

**Критерий завершения:** Requirements and constraints clearly documented

**Timeout:** 45m


### Фаза 2: high_level_design

**Агент:** `architect`

Design high-level system architecture and components

**Артефакты:**
- system_architecture_diagram
- component_diagram
- technology_stack
- architectural_patterns

**Критерий завершения:** High-level architecture designed and documented

**Timeout:** 90m


### Фаза 3: detailed_design

**Агент:** `architect`

Create detailed architecture specifications

**Артефакты:**
- api_contracts
- data_models
- sequence_diagrams
- deployment_architecture
- adr_documents

**Критерий завершения:** Detailed specifications complete with ADRs

**Timeout:** 120m


### Фаза 4: review

**Агент:** `code-reviewer`

Review architecture for quality, scalability, and maintainability

**Артефакты:**
- architecture_review_report
- risk_assessment
- improvement_recommendations

**Критерий завершения:** Architecture reviewed and approved with documented decisions

**Timeout:** 60m


### Фаза 5: infrastructure_planning

**Агент:** `devops`

Plan infrastructure and deployment strategy

**Артефакты:**
- infrastructure_plan
- deployment_strategy
- monitoring_plan
- disaster_recovery_plan

**Критерий завершения:** Infrastructure and deployment plans complete

**Timeout:** 45m


## Критерий успеха

Complete architecture documentation, ADRs, approved design, infrastructure plan

## Использование

```typescript
import { WorkflowEngine, AgentRegistry } from '@asmo/core'

const registry = new AgentRegistry()
const engine = new WorkflowEngine(registry)
await engine.initialize()

// Запуск по ID
const result = await engine.execute('architecture_design')

// Или адаптивный выбор по описанию задачи
const result = await engine.execute('architecture...')
```

---

[← Назад к списку workflows](./index.md)
