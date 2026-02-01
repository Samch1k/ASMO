# 🔌 API Design

> Design REST/GraphQL API contracts with best practices

## Обзор

| Параметр | Значение |
|----------|----------|
| **ID** | `api_design` |
| **Время выполнения** | 6h 30m |
| **Количество фаз** | 6 |
| **Агентов задействовано** | 4 |

## Условия запуска

### Ключевые слова
`api`, `endpoint`, `rest`, `graphql`, `api design`, `contract`

### Типы задач
- api_design
- interface_design
- integration

### Необходимые навыки
- `api_design`
- `system_design`
- `documentation`

### Уровень сложности
- simple
- medium
- complex

## Фазы выполнения

| # | Агент | Фаза | Артефакты | Timeout | Approve |
|---|-------|------|-----------|---------|---------|
| 1 | architect | requirements | api_requirements, use_cases | 30m | - |
| 2 | architect | contract_design | api_specification, resource_models | 90m | - |
| 3 | code-reviewer | review | design_review_report, recommendations | 30m | - |
| 4 | developer | documentation | openapi_spec, usage_examples | 60m | - |
| 5 | developer | implementation | api_implementation, request_validation | 120m | - |
| 6 | tester | testing | api_test_results, performance_benchmarks | 60m | - |

## Детальное описание фаз

### Фаза 1: requirements

**Агент:** `architect`

Define API requirements and design principles

**Артефакты:**
- api_requirements
- use_cases
- design_principles
- technology_selection

**Критерий завершения:** API requirements and approach clearly defined

**Timeout:** 30m


### Фаза 2: contract_design

**Агент:** `architect`

Design API contracts following REST/GraphQL best practices

**Артефакты:**
- api_specification
- resource_models
- endpoint_definitions
- authentication_design
- versioning_strategy

**Критерий завершения:** Complete API contract with endpoints and models

**Timeout:** 90m


### Фаза 3: review

**Агент:** `code-reviewer`

Review API design for consistency and best practices

**Артефакты:**
- design_review_report
- recommendations
- security_assessment

**Критерий завершения:** API design reviewed and approved

**Timeout:** 30m


### Фаза 4: documentation

**Агент:** `developer`

Create comprehensive API documentation

**Артефакты:**
- openapi_spec
- usage_examples
- sdk_stubs
- integration_guide
- error_handling_guide

**Критерий завершения:** Complete API documentation with examples

**Timeout:** 60m


### Фаза 5: implementation

**Агент:** `developer`

Implement API endpoints with proper validation and error handling

**Артефакты:**
- api_implementation
- request_validation
- error_responses
- api_tests

**Критерий завершения:** API implemented and tested

**Timeout:** 120m


### Фаза 6: testing

**Агент:** `tester`

Test API functionality, performance, and security

**Артефакты:**
- api_test_results
- performance_benchmarks
- security_test_results
- integration_test_results

**Критерий завершения:** API tested and meets all requirements

**Timeout:** 60m


## Критерий успеха

Complete API design, documentation, implementation tested and approved

## Использование

```typescript
import { WorkflowEngine, AgentRegistry } from '@ai1st/core'

const registry = new AgentRegistry()
const engine = new WorkflowEngine(registry)
await engine.initialize()

// Запуск по ID
const result = await engine.execute('api_design')

// Или адаптивный выбор по описанию задачи
const result = await engine.execute('api...')
```

---

[← Назад к списку workflows](./index.md)
