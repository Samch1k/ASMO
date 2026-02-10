# Phase 1 -- Requirements Overview

This document summarizes the eight functional requirements (FRs) that define ASMO's capabilities. Each FR maps to specific system components and has associated acceptance criteria documented in [acceptance-criteria.md](./acceptance-criteria.md).

## FR-1: Task Analysis and Routing

**Priority: P0**

The system must analyze incoming tasks and route them to the appropriate workflow and agents.

| Component | Responsibility |
|---|---|
| `ComplexityAnalyzer` | Scores task complexity 0--100 across 5 levels (trivial, low, medium, high, critical) |
| `WorkflowSelector` | Selects the best-fit workflow from 27 available workflows |
| `TaskRouter` | Routes the task to the selected workflow with configuration |
| `SkillMatcher` | Matches required skills from the 55-skill catalog, resolves dependencies |

Analysis uses a dual strategy: LLM-based classification (>=77% accuracy) with keyword-based heuristic fallback (~65% accuracy). The 14-category keyword system covers trivial, bug_fix, architecture, security, performance, database, refactoring, api, feature, and more.

## FR-2: Workflow Execution Engine

**Priority: P0**

The system must execute multi-phase workflows with error handling, retries, and context propagation.

| Component | Responsibility |
|---|---|
| `WorkflowEngine` | Core orchestrator; factory pattern via `WorkflowEngine.create()` |
| `DynamicOrchestrator` | Adapts execution based on runtime conditions |
| `PhaseManager` | Manages phase transitions and ordering |
| `ContextCascade` | Propagates data and artifacts between phases |
| `CircuitBreaker` | Trips after 5 consecutive failures, preventing cascade |
| `IterationManager` | Controls retry logic (max 3 retries per phase) |

YOLO mode auto-approves tasks with complexity score < 30 via `ApprovalCheckpoint`.

## FR-3: Multi-Agent Collaboration

**Priority: P0**

The system must support multiple collaboration patterns between the 25 agents.

| Pattern | Description | Use Case |
|---|---|---|
| **Sequential** | Agents execute one after another, output feeds next | Standard workflows |
| **PartySession** | Multiple agents brainstorm simultaneously | Architecture design |
| **BrainstormingSession** | Structured ideation with convergence | Feature planning |
| **AdversarialReview** | Reviewer challenges code with escalating severity | Code quality |

Brainstorming sessions produce ADR (Architecture Decision Record) artifacts. Adversarial review requires finding a minimum number of issues with 3-level severity escalation.

## FR-4: Adaptive Phase Detection

**Priority: P1**

The system must detect the appropriate starting phase for a workflow based on existing artifacts and context.

| Component | Responsibility |
|---|---|
| `ContextAnalyzer` | Scans existing files, git history, and project state |
| `PhaseDetector` | Determines which phases have already been completed |

This prevents redundant work. If architecture documents already exist, the system skips the design phase and begins at implementation. Detection includes a confidence score and alternative suggestions.

## FR-5: LLM Provider Layer

**Priority: P0**

The system must support three LLM modes with automatic fallback.

| Mode | Cost | Requirement | Fallback Order |
|---|---|---|---|
| **Session** | $0 | Claude CLI installed + authenticated | Primary |
| **API** | Pay-per-token | `ANTHROPIC_API_KEY` in `.env` | Secondary |
| **Heuristics** | $0 | None | Tertiary |

`LLMProviderFactory` implements the singleton pattern and manages provider selection. Session mode invokes Claude via `claude -p` subprocess. Heuristics mode uses keyword analysis only (~65% accuracy).

## FR-6: MCP Integration

**Priority: P1**

The system must integrate with MCP (Model Context Protocol) servers for extended capabilities.

Agents can call `requestMCP()` to access external tools. 8 MCP server integrations are supported, including file system operations, GitHub API, and browser automation. Access is role-based -- each agent only sees MCP servers relevant to its role.

## FR-7: Configuration Management

**Priority: P1**

The system must support a 3-tier configuration hierarchy.

| Tier | Source | Override Priority |
|---|---|---|
| **Defaults** | Built-in JSON templates | Lowest |
| **Project** | `.asmo/` directory in project root | Medium |
| **Runtime** | CLI flags and environment variables | Highest |

`ConfigLoader` handles merging. Roles are defined in JSON, skills in SKILL.md markdown files, and workflows in JSON templates.

## FR-8: Persistence Layer

**Priority: P2**

The system must persist workflow state, metrics, and execution history.

| Storage | Use Case |
|---|---|
| **SQLite** | Workflow execution history, metrics aggregation |
| **JSON files** | Configuration, skill definitions, workflow templates |

`MetricsCollector` records performance data per workflow execution. `MetricsOptimizer` uses historical data to improve future workflow selection (learning loop wired into `WorkflowEngine.initialize()`).

## Cross-Reference

| Document | Content |
|---|---|
| [User Personas](./user-personas.md) | Who uses ASMO and how |
| [User Journey](./user-journey.md) | End-to-end CLI interaction flow |
| [Use Cases](./use-cases.md) | Concrete usage scenarios |
| [Acceptance Criteria](./acceptance-criteria.md) | Testable criteria for each FR |
| [Non-Functional Requirements](./nfr.md) | Performance, reliability, scalability, security |
