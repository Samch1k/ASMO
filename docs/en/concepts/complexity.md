# Complexity Analysis

AI1st uses complexity analysis to automatically select appropriate workflows and agents.

## Overview

Every task is analyzed and scored on a 0-100 scale:

| Level | Score | Process | Example Tasks |
|-------|-------|---------|---------------|
| **Trivial** | 0-20 | YOLO Mode | Fix typo, update text |
| **Simple** | 21-40 | Quick workflow | Simple bug fix, small feature |
| **Medium** | 41-60 | Standard process | New component, refactoring |
| **Complex** | 61-80 | Full planning | Security features, API design |
| **Enterprise** | 81-100 | Brainstorming + review | Architecture, migrations |

## Complexity Factors

The `ComplexityAnalyzer` evaluates eight factors:

### 1. Files Affected

How many files will be modified?

| Files | Impact |
|-------|--------|
| 1-3 | Low (+5) |
| 4-10 | Medium (+15) |
| 11-20 | High (+25) |
| 20+ | Very High (+35) |

### 2. Dependencies

External integrations and libraries involved:

| Dependencies | Impact |
|--------------|--------|
| 0 | None (+0) |
| 1-2 | Low (+10) |
| 3-5 | Medium (+20) |
| 6+ | High (+30) |

### 3. Risk Level

Potential for breaking changes:

| Risk | Impact |
|------|--------|
| Low | +5 |
| Medium | +15 |
| High | +25 |

### 4. Domain Expertise

Specialized knowledge required:

| Required | Impact |
|----------|--------|
| No | +0 |
| Yes | +15 |

### 5. Estimated LOC

Lines of code to be modified:

| LOC | Impact |
|-----|--------|
| <50 | Low (+5) |
| 50-200 | Medium (+10) |
| 200-500 | High (+20) |
| 500+ | Very High (+30) |

### 6. Data Changes

Database schema modifications:

| Changes | Impact |
|---------|--------|
| No | +0 |
| Yes | +20 |

### 7. Security Impact

Security implications:

| Impact | Score |
|--------|-------|
| No | +0 |
| Yes | +15 |

### 8. Performance Impact

Performance considerations:

| Impact | Score |
|--------|-------|
| No | +0 |
| Yes | +10 |

## Using Complexity Analysis

### Automatic (Recommended)

```typescript
// AI1st analyzes and selects automatically
const result = await engine.execute(
  'Add two-factor authentication',
  undefined,
  { projectSize: 'large' }
)
```

### Manual Analysis

```typescript
const selection = await engine.selectWorkflowAdaptively(
  'Refactor the authentication module',
  { projectSize: 'medium' }
)

console.log('Score:', selection.complexity.score)
console.log('Level:', selection.complexity.level)
console.log('Confidence:', selection.confidence)
console.log('Reasoning:', selection.reasoning)
console.log('Factors:', selection.complexity.factors)
```

### Direct Analyzer Access

```typescript
import { ComplexityAnalyzer } from '@ai1st/core'

const analyzer = new ComplexityAnalyzer()
const score = await analyzer.analyzeTask(
  'Add OAuth2 authentication',
  {
    projectSize: 'large',
    techStack: ['Node.js', 'PostgreSQL']
  }
)

console.log(score)
// {
//   score: 68,
//   level: 'complex',
//   confidence: 0.85,
//   reasoning: 'Authentication with OAuth2 requires...',
//   factors: { ... },
//   recommendedAgents: ['architect', 'security-specialist', 'developer'],
//   recommendedWorkflow: 'security_audit'
// }
```

## Complexity to Workflow Mapping

| Level | Score | Default Workflows |
|-------|-------|-------------------|
| Trivial | 0-20 | Bug Fix (YOLO) |
| Simple | 21-40 | Bug Fix, Quick Flow |
| Medium | 41-60 | Feature Development, Refactoring |
| Complex | 61-80 | Security Audit, API Design |
| Enterprise | 81-100 | Architecture Design, Database Migration |

## YOLO Mode

For trivial tasks (score < 30), YOLO mode enables:

- **Automatic approval bypass** - No confirmation needed
- **Faster execution** - Skip non-essential steps
- **Audit trail** - All actions are logged

```typescript
// Configure YOLO threshold
config.set('yoloMode.complexityThreshold', 25)
config.set('yoloMode.excludedWorkflows', ['security_audit'])
```

## Project Context

Provide context for better analysis:

```typescript
const context = {
  projectSize: 'large',      // small, medium, large
  techStack: ['React', 'Node.js', 'PostgreSQL'],
  teamSize: 5,
  hasTests: true,
  hasCICD: true
}

const selection = await engine.selectWorkflowAdaptively(task, context)
```

## Confidence Scoring

The analyzer provides confidence (0.0 - 1.0):

| Confidence | Meaning |
|------------|---------|
| > 0.9 | Very confident |
| 0.7-0.9 | Confident |
| 0.5-0.7 | Moderate |
| < 0.5 | Low confidence |

Low confidence triggers fallback to default workflow or user confirmation.

## See Also

- [YOLO Mode](../guides/yolo-mode.md) - Automatic approval bypass
- [Adaptive Workflow](../guides/adaptive-workflow.md) - Workflow selection
- [Workflows](./workflows.md) - Available workflows
