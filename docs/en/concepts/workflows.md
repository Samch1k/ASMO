# Workflows

Workflows are structured sequences of agent tasks that accomplish complex goals.

## What is a Workflow?

A workflow defines:
- **Steps** - Ordered sequence of agent tasks
- **Phases** - Logical groupings of steps
- **Deliverables** - Expected outputs at each step
- **Exit criteria** - Conditions for moving forward
- **Timeouts** - Maximum time for each step

## Available Workflows

ASMO includes **10 production-ready workflows**:

| # | Workflow | Complexity | Time | Use Case |
|---|----------|------------|------|----------|
| 1 | Bug Fix | Simple | 1h | Fast bug fixes |
| 2 | Feature Development | Medium | 2.5h | Full feature lifecycle |
| 3 | Quality Assurance | Medium | 35m | Comprehensive testing |
| 4 | Advanced Bug Fix | Complex | 3.5h | Complex bug resolution |
| 5 | Code Refactoring | Medium | 3.5h | Code quality improvement |
| 6 | Performance Optimization | Complex | 4h | Speed improvements |
| 7 | Security Audit | Complex | 6h | Security assessment |
| 8 | Architecture Design | Enterprise | 6h | System design |
| 9 | Database Migration | Enterprise | 6h+ | Schema changes |
| 10 | API Design | Complex | 6.5h | API contracts |

## Workflow Anatomy

```json
{
  "id": "feature_implementation_full",
  "name": "Full Feature Implementation",
  "description": "Complete feature lifecycle: Design → Implement → Test → Deploy",
  "trigger_condition": {
    "keywords": ["implement feature", "new feature"],
    "task_types": ["feature"],
    "required_skills": ["architecture_decisions", "code_writing"]
  },
  "steps": [
    {
      "order": 1,
      "role_id": "architect",
      "phase": "design",
      "parallel_with": ["ux-designer"],
      "deliverables": ["adr", "component_structure"],
      "exit_criteria": "Architecture documented and approved",
      "timeout": "20m"
    },
    {
      "order": 2,
      "role_id": "developer",
      "phase": "implementation",
      "deliverables": ["code", "unit_tests"],
      "exit_criteria": "Implementation complete and tests pass",
      "timeout": "60m"
    }
  ],
  "estimated_time": "2h 25m",
  "success_criteria": "Feature deployed and working"
}
```

## Workflow Execution

### By ID

```typescript
const result = await engine.executeWorkflow('feature_implementation_full', {
  task: 'Add user profile page'
})
```

### By Description (Adaptive)

```typescript
// ASMO automatically selects the best workflow
const result = await engine.execute(
  'Add user authentication with OAuth2',
  undefined,
  { projectSize: 'large' }
)
```

## Parallel Execution

Workflows support parallel agent execution:

```
Phase 1: Design
  ┌─────────────┐
  │  Architect  │ ─────┐
  └─────────────┘      │
                       ├──→ [Merge] ──→ Phase 2
  ┌─────────────┐      │
  │ UX Designer │ ─────┘
  └─────────────┘
```

```json
{
  "order": 1,
  "role_id": "architect",
  "parallel_with": ["ux-designer"],
  "phase": "design"
}
```

## Approval Checkpoints

Steps can require approval before continuing:

```json
{
  "order": 4,
  "role_id": "devops",
  "phase": "deployment",
  "requires_approval": true
}
```

## YOLO Mode

For simple tasks (complexity < 30), approval checkpoints can be automatically bypassed:

```typescript
// Complexity: 25 → YOLO Mode enabled
const result = await engine.execute('Fix typo in README')
// No approval needed, executes directly
```

## Workflow Selection

ASMO uses complexity analysis to select workflows:

| Complexity | Score | Typical Workflow |
|------------|-------|------------------|
| Trivial | 0-20 | Bug Fix (YOLO) |
| Simple | 21-40 | Bug Fix |
| Medium | 41-60 | Feature Development |
| Complex | 61-80 | Security Audit |
| Enterprise | 81-100 | Architecture Design |

```typescript
const selection = await engine.selectWorkflowAdaptively(
  'Add two-factor authentication',
  { projectSize: 'large' }
)

console.log(selection.workflow.name)  // "Security Audit"
console.log(selection.complexity.level)  // "complex"
console.log(selection.reasoning)  // "Security features require..."
```

## Workflow Lifecycle

```
┌────────────┐
│  Pending   │
└─────┬──────┘
      ↓
┌────────────┐    ┌────────────┐
│  Running   │ →  │  Waiting   │ (for approval)
└─────┬──────┘    └─────┬──────┘
      │                 │
      ↓                 ↓
┌────────────┐    ┌────────────┐
│ Completed  │    │   Failed   │
└────────────┘    └────────────┘
```

## Workflow Results

```typescript
interface WorkflowResult {
  workflowId: string
  status: 'completed' | 'failed'
  steps: StepResult[]
  artifacts: Artifact[]
  metrics: {
    totalTime: number
    agentsUsed: string[]
    complexityScore: number
  }
}
```

## See Also

- [Workflow Catalog](../reference/workflows/index.md) - Full workflow documentation
- [Custom Workflows](../guides/custom-workflows.md) - Create your own workflows
- [Adaptive Selection](../guides/adaptive-workflow.md) - Workflow selection details
