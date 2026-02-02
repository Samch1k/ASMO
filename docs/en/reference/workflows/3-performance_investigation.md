# 📊 Performance Investigation & Optimization

> Parallel analysis by Debugger + Optimizer, then Developer implements fixes

## Overview

| Property | Value |
|----------|-------|
| **ID** | `performance_investigation` |
| **Estimated Time** | 1h 35m |
| **Phases** | 3 |
| **Agents Involved** | 4 |

## Trigger Conditions

### Keywords
`slow`, `performance`, `optimize`, `speed`, `latency`, `медленн`

### Task Types
- optimization

### Required Skills
- `performance_optimization`
- `debugging`
- `performance_analysis`



## Execution Phases

| # | Agent | Phase | Deliverables | Timeout | Approval |
|---|-------|-------|--------------|---------|----------|
| 1 | debugger | error_analysis | error_report, stack_traces | 20m | ⚡ Parallel |
|  | optimizer | performance_profiling | performance_metrics, bottleneck_analysis | 20m |  |
| 2 | developer | optimization_implementation | code, performance_improvements | 40m | - |
| 3 | tester | performance_verification | benchmark_results | 15m | - |

## Phase Details

### Phase 1: Parallel Execution


#### debugger - error_analysis

Analyze error patterns and stack traces

**Deliverables:**
- error_report
- stack_traces

**Exit Criteria:** Error patterns identified


#### optimizer - performance_profiling

Profile performance and identify bottlenecks

**Deliverables:**
- performance_metrics
- bottleneck_analysis

**Exit Criteria:** Bottlenecks identified


### Phase 2: optimization_implementation

**Agent:** `developer`

Implement optimizations based on analysis

**Deliverables:**
- code
- performance_improvements

**Exit Criteria:** Optimizations implemented

**Timeout:** 40m


### Phase 3: performance_verification

**Agent:** `tester`

Run benchmarks to verify improvements

**Deliverables:**
- benchmark_results

**Exit Criteria:** Performance meets targets

**Timeout:** 15m


## Success Criteria

Performance improved and verified with benchmarks

## Usage

```typescript
import { WorkflowEngine, AgentRegistry } from '@asmo/core'

const registry = new AgentRegistry()
const engine = new WorkflowEngine(registry)
await engine.initialize()

// Execute by ID
const result = await engine.execute('performance_investigation')

// Or adaptive selection by task description
const result = await engine.execute('slow...')
```

---

[← Back to Workflows](./index.md)
