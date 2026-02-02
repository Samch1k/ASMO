# 🔌 API Design

> Design REST/GraphQL API contracts with best practices

## Overview

| Property | Value |
|----------|-------|
| **ID** | `api_design` |
| **Estimated Time** | 6h 30m |
| **Phases** | 6 |
| **Agents Involved** | 4 |

## Trigger Conditions

### Keywords
`api`, `endpoint`, `rest`, `graphql`, `api design`, `contract`

### Task Types
- api_design
- interface_design
- integration

### Required Skills
- `api_design`
- `system_design`
- `documentation`

### Complexity Range
- simple
- medium
- complex

## Execution Phases

| # | Agent | Phase | Deliverables | Timeout | Approval |
|---|-------|-------|--------------|---------|----------|
| 1 | architect | requirements | api_requirements, use_cases | 30m | - |
| 2 | architect | contract_design | api_specification, resource_models | 90m | - |
| 3 | code-reviewer | review | design_review_report, recommendations | 30m | - |
| 4 | developer | documentation | openapi_spec, usage_examples | 60m | - |
| 5 | developer | implementation | api_implementation, request_validation | 120m | - |
| 6 | tester | testing | api_test_results, performance_benchmarks | 60m | - |

## Phase Details

### Phase 1: requirements

**Agent:** `architect`

Define API requirements and design principles

**Deliverables:**
- api_requirements
- use_cases
- design_principles
- technology_selection

**Exit Criteria:** API requirements and approach clearly defined

**Timeout:** 30m


### Phase 2: contract_design

**Agent:** `architect`

Design API contracts following REST/GraphQL best practices

**Deliverables:**
- api_specification
- resource_models
- endpoint_definitions
- authentication_design
- versioning_strategy

**Exit Criteria:** Complete API contract with endpoints and models

**Timeout:** 90m


### Phase 3: review

**Agent:** `code-reviewer`

Review API design for consistency and best practices

**Deliverables:**
- design_review_report
- recommendations
- security_assessment

**Exit Criteria:** API design reviewed and approved

**Timeout:** 30m


### Phase 4: documentation

**Agent:** `developer`

Create comprehensive API documentation

**Deliverables:**
- openapi_spec
- usage_examples
- sdk_stubs
- integration_guide
- error_handling_guide

**Exit Criteria:** Complete API documentation with examples

**Timeout:** 60m


### Phase 5: implementation

**Agent:** `developer`

Implement API endpoints with proper validation and error handling

**Deliverables:**
- api_implementation
- request_validation
- error_responses
- api_tests

**Exit Criteria:** API implemented and tested

**Timeout:** 120m


### Phase 6: testing

**Agent:** `tester`

Test API functionality, performance, and security

**Deliverables:**
- api_test_results
- performance_benchmarks
- security_test_results
- integration_test_results

**Exit Criteria:** API tested and meets all requirements

**Timeout:** 60m


## Success Criteria

Complete API design, documentation, implementation tested and approved

## Usage

```typescript
import { WorkflowEngine, AgentRegistry } from '@asmo/core'

const registry = new AgentRegistry()
const engine = new WorkflowEngine(registry)
await engine.initialize()

// Execute by ID
const result = await engine.execute('api_design')

// Or adaptive selection by task description
const result = await engine.execute('api...')
```

---

[← Back to Workflows](./index.md)
