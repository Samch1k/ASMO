# Adaptive Phase Detection

ASMO workflows follow a phase-based lifecycle. The Adaptive Phase Detection system allows workflows to be **joined at any intermediate phase**, intelligently skipping earlier phases when context indicates they are already complete.

## Default Phase Lifecycle

```
requirements --> design --> planning --> implementation --> testing --> deployment
```

Each phase has configurable exit criteria that must be satisfied before advancing.

## Core Components

### PhaseManager (`phase-manager.ts`)

Central orchestrator for phase transitions.

**Responsibilities:**
- Enforces sequential phase transitions for standard phases
- Tracks phase history with timestamps (audit trail)
- Supports phase rollback on validation failure
- Provides dual mode: strict (standard phases) and adaptive (custom phases)

**Key Methods:**
- `transitionPhase(from, to)` -- Move to next phase with validation
- `rollbackPhase()` -- Revert to previous phase on failure
- `canExitPhase(state, phase)` -- Validate exit criteria before advancing
- `getPhaseProgress()` -- Calculate completion percentage

### PhaseDetector (`phase-detector.ts`)

LLM-based phase detection for workflow joining.

**How it works:**
1. Scans project for existing artifacts (code, tests, docs)
2. Analyzes task intent via LLM (implement, refactor, test, etc.)
3. Evaluates confidence of recommendation
4. Falls back to configured strategy if confidence is low

**Configuration:**
```typescript
{
  minConfidence: 0.5,           // Minimum confidence to accept LLM recommendation
  fallbackStrategy: 'first_phase' | 'keyword' | 'error'
}
```

**Output:**
```typescript
{
  phase: string,                // Detected phase to join at
  confidence: number,           // 0.0 - 1.0
  reasoning: string,            // Why this phase was chosen
  skipPhases: string[],         // Phases that will be skipped
  missingPrerequisites: string[] // What may need to be done first
}
```

## How Workflow Joining Works

```
User: "Review and fix the authentication module"
                    |
                    v
    PhaseDetector.detectPhase()
        Context: existing code + tests found
        LLM: intent = "code review" + "refactoring"
        Result: { phase: "implementation", confidence: 0.85 }
                    |
                    v
    WorkflowEngine.executeFromPhase("implementation")
        Skips: requirements, design, planning
        Executes: implementation --> testing --> deployment
```

## Phase Validation Modes

### Standard Phases
- Sequential transitions only (no skipping)
- Exit criteria enforced before advancing
- Phase rollback on validation failure

### Custom (Adaptive) Phases
- Flexible transitions allowed
- Simplified validation (no exit criteria blocking)
- Enables rapid iteration for non-standard workflows

## Exit Criteria

| Phase | Criteria |
|-------|----------|
| requirements | Requirements validated and approved |
| design | Design validated and approved |
| planning | Project plan created with estimates |
| implementation | Code implemented and reviewed |
| testing | Tests passing with acceptable coverage |
| deployment | Deployed and health verified |

Custom phases bypass exit criteria validation.

## Integration Points

| Component | How It Integrates |
|-----------|-------------------|
| **ApprovalCheckpoint** | Requires approval at phase boundaries |
| **MetricsCollector** | Records phase completion times |
| **IterationManager** | Retries within phases on failure |
| **WorkflowSelector** | Uses phase detection for adaptive workflow selection |

## State Tracking

Phase state is stored in `AgentState.metadata`:

```typescript
metadata: {
  currentPhase: "implementation",
  phaseHistory: [
    { from: null, to: "implementation", timestamp: "...", success: true }
  ],
  phaseStartTime: "2026-02-05T...",
  adaptiveMode: false,
  phaseJoining: {
    enabled: true,
    startPhase: "implementation",
    skippedPhases: ["requirements", "design", "planning"]
  }
}
```
