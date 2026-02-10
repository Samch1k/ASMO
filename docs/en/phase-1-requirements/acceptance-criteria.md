# Acceptance Criteria

All acceptance criteria are derived from the PRD functional requirements. Each criterion is testable and tied to a specific FR.

## AC-1.x: Task Analysis and Routing (FR-1)

| ID | Description | Priority |
|---|---|---|
| AC-1.1 | ComplexityAnalyzer classifies tasks into exactly 5 levels: trivial, low, medium, high, critical | P0 |
| AC-1.2 | Classification accuracy >= 77% when using LLM-based analysis (measured against human-labeled dataset) | P0 |
| AC-1.3 | Classification accuracy >= 65% when using heuristics-only mode (`--no-llm`) | P0 |
| AC-1.4 | Complexity score is an integer in the range 0--100 | P0 |
| AC-1.5 | WorkflowSelector routes tasks to the correct workflow for all 14 keyword categories | P0 |
| AC-1.6 | Model routing selects Session provider by default, API on fallback, heuristics as last resort | P0 |
| AC-1.7 | Confidence threshold is reported alongside every classification result | P1 |
| AC-1.8 | SkillMatcher resolves skill dependencies from `skill-dependencies.json` without circular references | P1 |
| AC-1.9 | Analysis completes within 5 seconds (NFR-1 alignment) | P0 |
| AC-1.10 | Input validation rejects prompts outside 3--10,000 character range with actionable error | P0 |

## AC-2.x: Workflow Execution (FR-2)

| ID | Description | Priority |
|---|---|---|
| AC-2.1 | WorkflowEngine executes all phases defined in a workflow template in the correct order | P0 |
| AC-2.2 | IterationManager retries failed phases up to 3 times before marking as failed | P0 |
| AC-2.3 | YOLO mode auto-approves tasks with complexity score < 30 without user prompt | P0 |
| AC-2.4 | CircuitBreaker trips after 5 consecutive failures and halts workflow execution | P0 |
| AC-2.5 | ContextCascade propagates all artifacts from phase N to phase N+1 | P0 |
| AC-2.6 | Workflow selection completes within 2 seconds (NFR-1 alignment) | P0 |
| AC-2.7 | `--dry-run` flag stops execution after analysis, producing no side effects | P1 |
| AC-2.8 | `--workflow <name>` flag overrides automatic selection and uses the specified workflow | P1 |
| AC-2.9 | Phase timeout is configurable with a default of 30 seconds | P1 |
| AC-2.10 | WorkflowEngine.create() factory is the sole entry point for engine instantiation | P1 |

## AC-3.x: Multi-Agent Collaboration (FR-3)

| ID | Description | Priority |
|---|---|---|
| AC-3.1 | Sequential pattern: agents execute in defined order, each receiving prior agent's output | P0 |
| AC-3.2 | PartySession (parallel): all agents execute simultaneously and results are merged | P0 |
| AC-3.3 | BrainstormingSession produces at least one ADR artifact per session | P1 |
| AC-3.4 | AdversarialReview finds a minimum of N issues (configurable, default 3) | P0 |
| AC-3.5 | Adversarial review implements 3-level severity escalation (standard, adversarial, escalated) | P0 |
| AC-3.6 | All 25 agents can be instantiated and execute their assigned role | P0 |
| AC-3.7 | Agent output conforms to the BaseAgent result schema (`createResult()`) | P1 |
| AC-3.8 | MCP requests via `requestMCP()` are role-scoped (agents only access permitted MCP servers) | P1 |

## AC-4.x: Adaptive Phase Detection (FR-4)

| ID | Description | Priority |
|---|---|---|
| AC-4.1 | PhaseDetector correctly identifies the appropriate start phase based on existing artifacts | P1 |
| AC-4.2 | Detection produces a confidence score (0.0--1.0) for the selected start phase | P1 |
| AC-4.3 | PhaseDetector provides at least one alternative start phase when confidence < 0.8 | P1 |
| AC-4.4 | ContextAnalyzer scans the project directory and git history for relevant artifacts | P1 |
| AC-4.5 | Phase detection metadata is recorded in workflow state for observability | P1 |

## AC-5.x: LLM Provider Layer (FR-5)

| ID | Description | Priority |
|---|---|---|
| AC-5.1 | Session provider is used as the primary LLM mode when Claude CLI is available | P0 |
| AC-5.2 | API provider is used as fallback when Session provider is unavailable | P0 |
| AC-5.3 | Heuristics mode activates when both Session and API providers are unavailable | P0 |
| AC-5.4 | `--use-api` flag forces API mode regardless of Session availability | P0 |
| AC-5.5 | `--no-llm` flag forces heuristics mode regardless of provider availability | P0 |
| AC-5.6 | LLMProviderFactory follows singleton pattern with `resetX()` for testing | P1 |
| AC-5.7 | Provider switch emits a warning log when falling back from Session to API or Heuristics | P1 |

## AC-6.x: MCP Integration (FR-6)

| ID | Description | Priority |
|---|---|---|
| AC-6.1 | Agents can invoke MCP servers via `requestMCP()` | P1 |
| AC-6.2 | MCP access is restricted by agent role (role-based permissions) | P1 |
| AC-6.3 | MCP request failures are handled gracefully without crashing the workflow | P1 |

## AC-7.x: Configuration Management (FR-7)

| ID | Description | Priority |
|---|---|---|
| AC-7.1 | 3-tier config hierarchy: defaults < project < runtime (CLI flags) | P1 |
| AC-7.2 | ConfigLoader merges all three tiers correctly with proper override semantics | P1 |
| AC-7.3 | Missing configuration files produce warnings, not errors | P2 |

## AC-8.x: Persistence Layer (FR-8)

| ID | Description | Priority |
|---|---|---|
| AC-8.1 | MetricsCollector records execution time, token usage, and success/failure per workflow | P2 |
| AC-8.2 | MetricsOptimizer uses historical data to influence future workflow selection | P2 |
| AC-8.3 | Workflow execution history is queryable for debugging and auditing | P2 |

## Summary

| FR | Criteria Count | P0 | P1 | P2 |
|---|---|---|---|---|
| FR-1 (Analysis) | 10 | 7 | 3 | 0 |
| FR-2 (Execution) | 10 | 6 | 4 | 0 |
| FR-3 (Collaboration) | 8 | 5 | 3 | 0 |
| FR-4 (Phase Detection) | 5 | 0 | 5 | 0 |
| FR-5 (LLM Provider) | 7 | 5 | 2 | 0 |
| FR-6 (MCP) | 3 | 0 | 3 | 0 |
| FR-7 (Config) | 3 | 0 | 2 | 1 |
| FR-8 (Persistence) | 3 | 0 | 0 | 3 |
| **Total** | **49** | **23** | **22** | **4** |
