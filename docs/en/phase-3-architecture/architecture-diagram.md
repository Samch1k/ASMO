# Architecture Diagram

## Diagram 1: Logical Blocks

```
┌─────────────────────────────────────────────────┐
│               CLI Layer (packages/cli)            │
│   asmo run ─ suggest ─ analyze ─ workflow         │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│         Orchestration Layer (packages/core)        │
│                                                    │
│  A. Task Analysis & Routing                        │
│     ComplexityAnalyzer → WorkflowSelector          │
│     → TaskRouter → SkillMatcher                    │
│     → AgentRegistry (25 agents)                    │
│                                                    │
│  B. Workflow Execution Engine                      │
│     WorkflowEngine ← DynamicOrchestrator           │
│     PhaseManager (6 phases, configurable)                       │
│     IterationManager (retry + backoff)             │
│     ApprovalCheckpoint (YOLO mode)                 │
│     AgentExecutor + CircuitBreaker                 │
│     PrincipleValidators (Bob/Winston/John)         │
│     ContextCascade (phase→phase data flow)         │
│                                                    │
│  C. Multi-Agent Collaboration                      │
│     Sequential · PartySession · Brainstorm         │
│     AdversarialReview                              │
│                                                    │
│  D. Adaptive Phase Detection                       │
│     ContextAnalyzer → PhaseDetector (LLM)          │
│                                                    │
│  E. Metrics & Learning Loop                        │
│     MetricsCollector → MetricsPersister             │
│     → MetricsOptimizer → LearningLoop              │
│                                                    │
│  F. Configuration & Templates                      │
│     ConfigManager (3-tier) → ConfigLoader          │
│     RoleManager · SkillMDLoader · PromptLoader     │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│             Agent Layer (25 agents)                │
│   BaseAgent: callLLM(), callLLMForJSON(),          │
│              createResult(), createArtifact(),      │
│              requestMCP(), setRole()                │
└──────────┬───────────────────────┬──────────────┘
           │                       │
┌──────────▼──────────┐  ┌────────▼──────────────────┐
│   LLM Provider       │  │       MCP Bridge            │
│   Session ($0)       │  │  memory · supabase · fs     │
│   API ($$)           │  │  context7 · github          │
│   Heuristics         │  │  playwright · render · vercel│
└─────────────────────┘  └──────────────────────────────┘
```

## Diagram 2: Data Flow (Sequence)

```
User Task
   │
   ▼
┌──────┐    ┌───────────────────┐    ┌──────────────────┐
│ CLI  │───▶│ ComplexityAnalyzer │───▶│ WorkflowSelector │
└──────┘    └───────────────────┘    └────────┬─────────┘
                                              │
                                              ▼
                                    ┌──────────────────┐
                                    │  PhaseDetector    │
                                    │  (adaptive entry) │
                                    └────────┬─────────┘
                                              │
                                              ▼
                                    ┌──────────────────┐
                                    │  WorkflowEngine   │
                                    └────────┬─────────┘
                                              │
                              ┌───────────────┼───────────────┐
                              │               │               │
                              ▼               ▼               ▼
                     ┌────────────┐  ┌────────────┐  ┌────────────┐
                     │ Phase 1    │  │ Phase 2    │  │ Phase N    │
                     └──────┬─────┘  └──────┬─────┘  └──────┬─────┘
                            │               │               │
                            ▼               ▼               ▼
                  ┌──────────────────────────────────────────────────┐
                  │  Per-Phase Loop:                                  │
                  │  ApprovalCheckpoint → AgentExecutor → Agent       │
                  │  → LLM / MCP → ContextCascade (pass to next)     │
                  └──────────────────────┬───────────────────────────┘
                                         │
                                         ▼
                               ┌──────────────────┐
                               │ MetricsCollector  │
                               └────────┬─────────┘
                                         │
                                         ▼
                                    ┌─────────┐
                                    │ Result  │
                                    └─────────┘
```

## Block Summary

| Block | Key Files | Responsibility |
|-------|-----------|----------------|
| **A. Task Analysis** | `ComplexityAnalyzer.ts`, `WorkflowSelector.ts`, `TaskRouter.ts`, `SkillMatcher.ts`, `AgentRegistry.ts` | Score task complexity (0--100), select workflow, match skills, assign agents |
| **B. Workflow Engine** | `WorkflowEngine.ts`, `DynamicOrchestrator.ts`, `PhaseManager.ts`, `IterationManager.ts`, `ApprovalCheckpoint.ts`, `AgentExecutor.ts`, `CircuitBreaker.ts`, `ContextCascade.ts` | Execute multi-phase workflows with retry, approval gates, circuit breaking, and inter-phase data flow |
| **C. Collaboration** | `SequentialCollaboration.ts`, `PartySession.ts`, `BrainstormCollaboration.ts`, `AdversarialReview.ts` | Multi-agent interaction patterns within a single phase |
| **D. Phase Detection** | `ContextAnalyzer.ts`, `PhaseDetector.ts` | Determine the optimal entry point when joining a workflow mid-flight |
| **E. Metrics** | `MetricsCollector.ts`, `MetricsPersister.ts`, `MetricsOptimizer.ts`, `LearningLoop.ts` | Collect execution data, persist to SQLite, feed back to optimizer |
| **F. Configuration** | `ConfigManager.ts`, `ConfigLoader.ts`, `RoleManager.ts`, `SkillMDLoader.ts`, `PromptLoader.ts` | Load and merge 3-tier configuration: project, user, bundled |

## 10 Key Architectural Decisions

### ADR-1: Dual LLM Strategy

**Decision:** Use Session mode (Claude CLI, `claude -p`) as the primary LLM provider at $0 cost, with Anthropic API as a pay-per-token fallback.

**Rationale:** Developers using Claude Code already have an authenticated CLI session. Leveraging it eliminates API costs for the majority of operations. The API fallback ensures availability when CLI is not present.

**Fallback chain:** Session ($0) -> API (pay-per-token) -> Heuristics ($0, ~65% accuracy)

### ADR-2: Native TypeScript Orchestration

**Decision:** Replace LangGraph with a custom `DynamicOrchestrator` written in TypeScript.

**Rationale:** LangGraph introduced a heavyweight dependency with its own execution model. A native orchestrator gives full control over phase management, retry logic, and context flow without framework lock-in.

### ADR-3: LLM-First Intelligence

**Decision:** Use LLM inference as the primary mechanism for complexity analysis, phase detection, workflow selection, and skill matching.

**Rationale:** LLM-based analysis achieves approximately 85% accuracy compared to approximately 65% for keyword heuristics. The heuristic path remains as an offline fallback.

### ADR-4: 3-Tier Configuration Cascade

**Decision:** Configuration resolves through three layers: project (`.cursor/config`), user (`~/.asmo/config`), bundled templates.

**Rationale:** Allows per-project customization while maintaining sensible defaults. Teams can override workflow templates, role definitions, and agent configurations at any level.

### ADR-5: Singleton Pattern

**Decision:** Use singleton factories (`getX()` / `resetX()`) for 17+ stateful services.

**Rationale:** Services like LLM provider, metrics collector, and config manager need single instances. The `resetX()` function enables test isolation without complex dependency injection.

### ADR-6: YOLO Mode

**Decision:** Auto-bypass approval checkpoints when task complexity score is below 30.

**Rationale:** Trivial tasks (typo fixes, simple renames) do not need human confirmation. The threshold is configurable and can be disabled entirely.

### ADR-7: Circuit Breaker

**Decision:** After 5 consecutive agent failures, the circuit breaker trips and stops further LLM calls for that execution path.

**Rationale:** Prevents runaway API costs and infinite retry loops when an agent or LLM provider is consistently failing.

### ADR-8: Context Cascade

**Decision:** Phase results are passed forward through a structured `ContextCascade` object so each phase can access outputs from all previous phases.

**Rationale:** Multi-phase workflows require shared context. Explicit data flow avoids hidden state and makes debugging straightforward.

### ADR-9: MCP Integration

**Decision:** Integrate 8 MCP servers organized by priority: P0 (always active), P1 (on demand), P2 (optional).

**Rationale:** MCP provides a standardized protocol for tool access. Priority-based activation avoids loading unnecessary servers and enables graceful degradation.

### ADR-10: Principle Validators

**Decision:** Three named validators (Bob, Winston, John) act as quality gates during workflow execution.

**Rationale:** Automated principle-based validation catches common issues (code style, security patterns, performance anti-patterns) before a phase completes, reducing rework.

## Related Documents

- [Architecture Overview](./README.md)
- [Data Model](./data-model.md)
- [API Contract](./api-contract.md)
- [Integration Map](./integration-map.md)
- [Security and Privacy](./security-privacy.md)
- [Risks and Assumptions](./risks-assumptions.md)
