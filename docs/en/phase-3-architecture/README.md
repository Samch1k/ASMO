# Architecture Overview

## ASMO -- AI System for Multiagent Orchestration

ASMO is a native TypeScript multi-agent orchestration system that automatically routes tasks to specialized AI agents and workflows. It operates as a monorepo with two packages and leverages LLM intelligence at every decision point.

## Monorepo Structure

| Package | Path | Purpose |
|---------|------|---------|
| `@asmo/core` | `packages/core` | Core library: agents, workflows, orchestration, LLM integration |
| `@asmo/cli` | `packages/cli` | CLI interface: `asmo run`, `suggest`, `analyze`, `workflow` |

**Build toolchain:** pnpm (workspace manager) + turbo (task runner) + tsup (TypeScript bundler)
**Test framework:** Jest with global LLM mock in `tests/setup.ts`

## System Resources

| Resource | Count |
|----------|-------|
| Agents | 25 |
| Workflows | 27 |
| Skills | 55 |
| Roles | 25 (6 core + 15 specialized + 4 validation) |

## Six Major Architectural Blocks

### A. Task Analysis and Routing

Accepts a natural-language task, scores its complexity (0--100), selects the optimal workflow, matches skills, and assigns agents.

**Key components:** ComplexityAnalyzer, WorkflowSelector, TaskRouter, SkillMatcher, AgentRegistry

### B. Workflow Execution Engine

Executes multi-phase workflows with retry logic, approval gates, circuit breakers, and inter-phase data flow.

**Key components:** WorkflowEngine, DynamicOrchestrator, PhaseManager (6 default phases, configurable), IterationManager, ApprovalCheckpoint (YOLO mode), AgentExecutor, CircuitBreaker, ContextCascade, PrincipleValidators

### C. Multi-Agent Collaboration

Four collaboration patterns for agent interaction within a workflow phase.

**Patterns:** Sequential, PartySession, Brainstorm, AdversarialReview

### D. Adaptive Phase Detection

Allows workflows to be joined at any phase by analyzing existing context and artifacts. Uses LLM-based ContextAnalyzer and PhaseDetector to determine the optimal entry point.

### E. Metrics and Learning Loop

Collects execution metrics, persists them to SQLite, and feeds them back into the optimizer to improve future workflow selection and agent assignment.

**Key components:** MetricsCollector, MetricsPersister, MetricsOptimizer, LearningLoop

### F. Configuration and Templates

Three-tier configuration cascade with role definitions (JSON), skill definitions (SKILL.md), and workflow templates (JSON).

**Key components:** ConfigManager, ConfigLoader, RoleManager, SkillMDLoader, PromptLoader

## Core Design Principles

### Singleton Factory Pattern

ASMO uses 17+ singleton factories following a consistent pattern:

```typescript
let instance = null;
export function getX() { if (!instance) instance = new X(); return instance; }
export function resetX() { instance = null; }
```

This ensures single instances for stateful services (LLM provider, metrics, config) while allowing test isolation via `resetX()`.

### LLM-First Intelligence

Complexity analysis, phase detection, workflow selection, and skill matching all use LLM inference as the primary decision mechanism, with keyword-based heuristics as the offline fallback.

### Native TypeScript Orchestration

`DynamicOrchestrator` replaces the earlier LangGraph dependency with a native TypeScript implementation, removing external orchestration framework dependencies and giving full control over execution flow.

## Key Architectural Decisions (ADRs)

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Dual LLM Strategy (Session + API) | $0 default cost with reliable fallback |
| 2 | Native TypeScript Orchestration | Replaced LangGraph for full control |
| 3 | LLM-First Intelligence | Higher accuracy (~85%) vs heuristics (~65%) |
| 4 | 3-Tier Configuration Cascade | Project, user, and bundled defaults |
| 5 | Singleton Pattern (17+ instances) | Consistent state management with test isolation |
| 6 | YOLO Mode (score < 30 auto-bypass) | Fast path for trivial tasks |
| 7 | Circuit Breaker (5 failures threshold) | Prevents runaway LLM calls |
| 8 | Context Cascade (phase-to-phase) | Structured data flow between workflow phases |
| 9 | MCP Integration (8 servers, P0/P1/P2) | Extensible tool access for agents |
| 10 | Principle Validators (Bob/Winston/John) | Quality gates enforcing coding standards |

## Related Documents

- [Architecture Diagram](./architecture-diagram.md) -- visual block and data-flow diagrams
- [Data Model](./data-model.md) -- TypeScript interfaces and database schema
- [API Contract](./api-contract.md) -- CLI commands and programmatic API
- [Integration Map](./integration-map.md) -- MCP, LLM, and external integrations
- [Security and Privacy](./security-privacy.md) -- input validation, cost control, data handling
- [Risks and Assumptions](./risks-assumptions.md) -- risk register and dependencies
