# Adaptive Phase Detection Migration Guide

## Overview

Adaptive Phase Detection allows ASMO to intelligently skip redundant workflow phases based on:

- **Project context** (existing code, tests, documentation)
- **User intent** (review, implement, refactor, test, debug)
- **LLM analysis** (via ClaudeCodeAdapter, within subscription)

## Quick Start

### Enable Phase Detection

```typescript
import { WorkflowSelector, ClaudeCodeAdapter } from '@asmo/core'

const selector = new WorkflowSelector({
  claudeCodeAdapter: new ClaudeCodeAdapter(),
  enablePhaseDetection: true, // ← Enable adaptive phases
})

// Use the new method
const selection = await selector.selectWorkflowWithPhase('Review the authentication code', {
  projectPath: '/path/to/project',
})

console.log(selection.phase) // 'review'
console.log(selection.skipPhases) // ['test_first', 'implementation']
```

### Execute from Detected Phase

```typescript
import { WorkflowEngine } from '@asmo/core'

const engine = new WorkflowEngine(registry)

// Execute workflow starting from detected phase
await engine.executeFromPhase(selection.workflow, selection.phase, initialState)
```

## Configuration Options

```typescript
interface PhaseDetectorConfig {
  minConfidence?: number // Default: 0.5 (50%)
  fallbackStrategy?:
    | 'first_phase' // Safe: always start from beginning
    | 'keyword' // Use keyword matching as backup
    | 'error' // Throw error, require explicit phase
}
```

## Workflow Updates Required

Add `phase_join_criteria` to workflow steps:

```json
{
  "steps": [
    {
      "order": 3,
      "phase": "review",
      "role_id": "code-reviewer",
      "phase_join_criteria": {
        "requires": ["code exists", "tests passing"],
        "optional": ["documentation updated"]
      }
    }
  ]
}
```

## Bilingual Support

PhaseDetector recognizes keywords in both English and Russian:

| Intent    | English Keywords          | Russian Keywords            |
| --------- | ------------------------- | --------------------------- |
| Review    | review, check, audit      | ревью, проверь, аудит       |
| Implement | implement, create, build  | реализ, создай, напиши      |
| Refactor  | refactor, optimize, clean | рефактор, оптимиз, очистить |
| Test      | test, coverage, e2e       | тест, покрытие              |
| Debug     | fix, bug, debug, error    | исправ, баг, отлад, ошибк   |

## New Exports

```typescript
// From @asmo/core
export { ContextAnalyzer } from './orchestration/context-analyzer'
export { PhaseDetector } from './orchestration/phase-detector'

// Types
export type {
  PhaseDetectionResult,
  ArtifactAnalysis,
  PhaseInfo,
  WorkflowSelectionWithPhase,
} from './orchestration/types'
```

## Breaking Changes

**None** — This is an additive feature. Existing code continues to work unchanged.

---

_Updated: 2026-02-02_
