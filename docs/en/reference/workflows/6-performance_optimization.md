# ⚡ Performance Optimization

> Systematic performance analysis and improvement workflow

## Overview

| Property | Value |
|----------|-------|
| **ID** | `performance_optimization` |
| **Estimated Time** | 3h 50m |
| **Phases** | 5 |
| **Agents Involved** | 4 |

## Trigger Conditions

### Keywords
`slow`, `performance`, `optimize`, `speed up`, `latency`, `bottleneck`

### Task Types
- performance
- optimization

### Required Skills
- `performance_analysis`
- `profiling`
- `code_optimization`

### Complexity Range
- medium
- complex

## Execution Phases

| # | Agent | Phase | Deliverables | Timeout | Approval |
|---|-------|-------|--------------|---------|----------|
| 1 | optimizer | profiling | performance_baseline, profiling_results | 45m | - |
| 2 | architect | strategy | optimization_plan, architecture_improvements | 30m | - |
| 3 | developer | implementation | optimized_code, performance_tests | 90m | - |
| 4 | tester | validation | performance_comparison, regression_test_results | 40m | - |
| 5 | optimizer | monitoring | monitoring_dashboard, performance_alerts | 25m | - |

## Phase Details

### Phase 1: profiling

**Agent:** `optimizer`

Profile system to identify performance bottlenecks

**Deliverables:**
- performance_baseline
- profiling_results
- bottleneck_analysis
- metrics_report

**Exit Criteria:** Performance bottlenecks identified with metrics

**Timeout:** 45m


### Phase 2: strategy

**Agent:** `architect`

Design optimization strategy addressing identified bottlenecks

**Deliverables:**
- optimization_plan
- architecture_improvements
- risk_assessment

**Exit Criteria:** Optimization strategy defined with expected improvements

**Timeout:** 30m


### Phase 3: implementation

**Agent:** `developer`

Implement optimizations with performance monitoring

**Deliverables:**
- optimized_code
- performance_tests
- benchmarks

**Exit Criteria:** Optimizations implemented with measurable improvements

**Timeout:** 90m


### Phase 4: validation

**Agent:** `tester`

Validate performance improvements and ensure no regressions

**Deliverables:**
- performance_comparison
- regression_test_results
- load_test_results

**Exit Criteria:** Performance improvements validated, no functional regressions

**Timeout:** 40m


### Phase 5: monitoring

**Agent:** `optimizer`

Set up monitoring and establish performance baselines

**Deliverables:**
- monitoring_dashboard
- performance_alerts
- optimization_report

**Exit Criteria:** Monitoring in place, improvements documented

**Timeout:** 25m


## Success Criteria

Measurable performance improvements achieved, no regressions, monitoring established

## Usage

```typescript
import { WorkflowEngine, AgentRegistry } from '@ai1st/core'

const registry = new AgentRegistry()
const engine = new WorkflowEngine(registry)
await engine.initialize()

// Execute by ID
const result = await engine.execute('performance_optimization')

// Or adaptive selection by task description
const result = await engine.execute('slow...')
```

---

[← Back to Workflows](./index.md)
