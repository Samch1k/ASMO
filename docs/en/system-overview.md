# ASMO System Overview

> **AI System for Multiagent Orchestration**
>
> 25 Agents | 27 Workflows | 55 Skills | 25 Roles

---

## Table of Contents

1. [What is ASMO](#what-is-asmo)
2. [Problem and Solution](#problem-and-solution)
3. [How It Works](#how-it-works)
4. [Key Concepts](#key-concepts)
5. [System Architecture](#system-architecture)
6. [Dual LLM Strategy](#dual-llm-strategy)
7. [Key Features](#key-features)
8. [CLI Reference](#cli-reference)
9. [Configuration Fallback Chain](#configuration-fallback-chain)
10. [Complexity Levels](#complexity-levels)
11. [Agent Catalog](#agent-catalog)
12. [Workflow Catalog](#workflow-catalog)
13. [Skills Catalog](#skills-catalog)
14. [Quick Start](#quick-start)
15. [Phase Documentation Links](#phase-documentation-links)

---

## What is ASMO

ASMO (AI System for Multiagent Orchestration) is an intelligent task orchestration
framework that automatically analyzes incoming development tasks, determines their
complexity, selects the most appropriate workflow, and delegates execution to
specialized AI agents. Instead of requiring a developer to manually choose the right
tool or process, ASMO acts as a smart dispatcher: it reads the task description,
evaluates what needs to happen, and assembles a pipeline of agents that collaborate
to deliver a complete result -- from architecture through implementation to testing.

ASMO is built as a monorepo with two packages: `@asmo/core` (the orchestration
library) and `@asmo/cli` (the command-line interface). The system supports a dual
LLM strategy where the default mode uses the Claude CLI at zero cost, with automatic
fallback to the Anthropic API or keyword-based heuristics when needed. Complex tasks
get full AI-powered orchestration; simple tasks can be processed offline with no API
calls at all.

---

## Problem and Solution

| Problem | ASMO Solution |
|---------|---------------|
| Developer must decide which agent fits the task | ComplexityAnalyzer + WorkflowSelector automatically route |
| Simple tasks waste expensive API tokens | Dual LLM: Session ($0), API fallback, offline heuristics |
| Multi-step tasks lose context between phases | Context Cascade propagates artifacts across phases |
| No way to skip phases when work is partially done | Adaptive Phase Detection joins mid-workflow |
| Trivial tasks blocked by approval gates | YOLO Mode auto-approves when complexity < 30 |
| Single-perspective reviews miss blind spots | Adversarial Review with 3-level escalation |
| No feedback loop to improve routing | Metrics and Learning Loop adjusts selection |
| Agent failures cascade through the pipeline | CircuitBreaker isolates failures gracefully |
| Hard to know if ASMO is even needed | `asmo suggest` returns instant JSON recommendation |

---

## How It Works

```
                         ASMO Processing Pipeline
  ========================================================================

  [1] TASK INPUT              [2] ANALYSIS               [3] ROUTING
  +-----------------+     +---------------------+    +-------------------+
  | "Fix the login  |     | ComplexityAnalyzer  |    | WorkflowSelector  |
  |  bug causing    | --> | - Keyword analysis  | -> | - Match workflow  |
  |  500 errors on  |     | - LLM evaluation    |    | - Assign agents   |
  |  /api/auth"     |     | - Score: 35 (Simple)|    | - bug_fix_workflow|
  +-----------------+     +---------------------+    +-------------------+
                                                              |
                                                              v
  [5] RESULT                 [4] EXECUTION
  +-----------------+     +--------------------------------------+
  | - Fix applied   |     | WorkflowEngine                      |
  | - Tests passing | <-- | Phase 1: debugger investigates       |
  | - Artifacts     |     | Phase 2: developer implements fix    |
  | - Metrics saved |     | Phase 3: tester validates            |
  +-----------------+     | ContextCascade + CircuitBreaker       |
                          +--------------------------------------+
```

**Stage 1 -- Task Input.** Developer provides a natural-language task via
`asmo run "<task>"`. Input is validated (length, encoding, control characters) and
sanitized.

**Stage 2 -- Complexity Analysis.** `ComplexityAnalyzer` evaluates the task via
three fallback methods: Session LLM, API LLM, keyword heuristics. Produces a
score (0-100), complexity level, and detected categories.

**Stage 3 -- Routing.** `WorkflowSelector` matches analysis to the best workflow.
`TaskRouter` validates, `SkillMatcher` resolves skills, `AgentRegistry` assembles
the team.

**Stage 4 -- Execution.** `WorkflowEngine` orchestrates multi-phase execution.
`ContextCascade` propagates outputs between phases. `CircuitBreaker` guards agents.
`ApprovalCheckpoint` gates transitions (YOLO bypasses trivial tasks).
`IterationManager` handles retries.

**Stage 5 -- Result.** Final output includes all artifacts, metrics, and summary.
`MetricsCollector` persists data; `MetricsOptimizer` feeds the learning loop.

---

## Key Concepts

### Agents (25 total)

A specialized AI persona extending `BaseAgent` with methods: `callLLM()`,
`callLLMForJSON()`, `createResult()`, `createArtifact()`, `requestMCP()`.

| Tier | Count | Purpose |
|------|-------|---------|
| Core | 6 | Essential roles: architect, developer, debugger, optimizer, tester, devops |
| Specialized | 15 | Domain experts: security, UX, API design, business analysis, etc. |
| Validation | 4 | Quality gates: design-validator, merge-coordinator, post-deploy-monitor, requirements-validator |

### Workflows (27 total)

A sequence of phases stored as JSON templates. Each workflow defines phase order,
agent assignments, skill requirements, approval gates, and expected artifacts.

### Skills (55 total)

Focused capabilities in `SKILL.md` files, loaded by `SkillMDLoader` and matched
by `SkillMatcher`. Extended deps in `templates/skills/skill-dependencies.json`.

### Roles (25 total)

Behavioral profiles in JSON. Loaded by `RoleManager`, assigned at initialization.
Same tier structure as agents: 6 core + 15 specialized + 4 validation.

---

## System Architecture

```
  +-----------------------------------------------------------------------+
  |                          CLI Layer (@asmo/cli)                         |
  |  asmo run | asmo suggest | asmo analyze | asmo workflow               |
  +------+---------------------------+-----------------------------------+
         |                           |
         v                           v
  +------+---------------------------+-----------------------------------+
  |                    Core Library (@asmo/core)                          |
  |                                                                       |
  |  +---------------------------+  +----------------------------------+  |
  |  | A. Task Analysis & Routing|  | B. Workflow Execution Engine     |  |
  |  |                           |  |                                  |  |
  |  | ComplexityAnalyzer        |  | WorkflowEngine (factory: create) |  |
  |  | WorkflowSelector          |  | DynamicOrchestrator              |  |
  |  | TaskRouter                |  | PhaseManager                     |  |
  |  | SkillMatcher              |  | IterationManager                 |  |
  |  | AgentRegistry             |  | ApprovalCheckpoint (+ YOLO)      |  |
  |  +---------------------------+  | AgentExecutor                    |  |
  |                                 | CircuitBreaker                   |  |
  |  +---------------------------+  | PrincipleValidators              |  |
  |  | C. Multi-Agent Collab     |  | ContextCascade                   |  |
  |  |                           |  +----------------------------------+  |
  |  | Sequential execution      |                                       |
  |  | PartySession (parallel)   |  +----------------------------------+  |
  |  | BrainstormingSession      |  | D. Adaptive Phase Detection      |  |
  |  | AdversarialReview         |  | ContextAnalyzer, PhaseDetector   |  |
  |  +---------------------------+  +----------------------------------+  |
  |                                                                       |
  |  +---------------------------+  +----------------------------------+  |
  |  | E. Metrics & Learning     |  | F. Configuration & Templates     |  |
  |  | MetricsCollector          |  | ConfigManager (3-tier fallback)  |  |
  |  | MetricsPersister          |  | ConfigLoader, RoleManager        |  |
  |  | MetricsOptimizer          |  | SkillMDLoader, PromptLoader      |  |
  |  | LearningLoop              |  +----------------------------------+  |
  |  +---------------------------+                                       |
  |                                 +----------------------------------+  |
  |  +---------------------------+  | G. LLM Provider Factory          |  |
  |  |     Input Validation      |  | Session ($0) -> API -> Heuristics|  |
  |  |     10 checks, sanitize   |  +----------------------------------+  |
  |  +---------------------------+                                       |
  +-----------------------------------------------------------------------+
         |                           |
         v                           v
  +------------------+    +---------------------+
  | Claude CLI ($0)  |    | Anthropic API ($$$) |
  +------------------+    +---------------------+
```

### Block Descriptions

**A. Task Analysis and Routing** -- Analyzes complexity, selects workflow, resolves
skills, assembles agent team.

**B. Workflow Execution Engine** -- `WorkflowEngine.create()` factory manages the
lifecycle. PhaseManager tracks progression. IterationManager handles retries.
CircuitBreaker isolates failures. ContextCascade flows context between phases.

**C. Multi-Agent Collaboration** -- Sequential (default), PartySession (parallel
with convergence), BrainstormingSession (ideation), AdversarialReview (critical).

**D. Adaptive Phase Detection** -- LLM-powered detection of existing artifacts to
skip completed phases. Metadata recorded in state for observability.

**E. Metrics and Learning Loop** -- Tracks time, tokens, success rate.
MetricsOptimizer wired into `WorkflowEngine.initialize()`.

**F. Configuration and Templates** -- Three-tier fallback config. Loads roles (JSON),
skills (SKILL.md), workflows (JSON templates).

---

## Dual LLM Strategy

| Mode | Cost | Requirements | Accuracy | Use Case |
|------|------|-------------|----------|----------|
| **Session** (default) | $0 | Claude CLI installed | High | Default, cost-effective |
| **API** | Pay-per-token | `ANTHROPIC_API_KEY` in `.env` | High | Fallback, or `--use-api` |
| **Heuristics** | $0 | None | ~65% | Offline, `--no-llm` |

### Fallback Chain

```
  Session (Claude CLI, $0) --> API (ANTHROPIC_API_KEY) --> Heuristics (keywords, ~65%)
```

### Model Selection by Complexity

| Complexity | Score | Model |
|-----------|-------|-------|
| Trivial | 0-20 | Haiku |
| Simple | 21-40 | Haiku |
| Medium | 41-60 | Sonnet |
| Complex | 61-80 | Sonnet/Opus |
| Enterprise | 81-100 | Opus |

See [LLM Provider Factory](../../packages/core/docs/llm-provider-factory.md)
for technical details.

---

## Key Features

### YOLO Mode

Auto-approve tasks with complexity score < 30. Bypasses `ApprovalCheckpoint` for
trivial work (typo fixes, text changes, minor patches). Disabled with `--no-yolo`.

### Party Mode

Parallel multi-agent collaboration with convergence. Multiple agents work
simultaneously; outputs merge through a convergence step. Implemented via
`PartySession` and `BrainstormingSession`.

### Adversarial Review

Critical review that MUST find issues, with 3-level escalation:

1. **Level 1:** Code smells, potential bugs, design issues
2. **Level 2:** Security vulnerabilities, performance bottlenecks, scalability
3. **Level 3:** Systemic issues, design flaws, technical debt

### Adaptive Phase Detection

LLM analyzes existing project artifacts to skip completed phases. If architecture
docs exist, the workflow joins at implementation. Components: `ContextAnalyzer`
(gathers state), `PhaseDetector` (determines entry point). Detection metadata
recorded in state for observability.

See [Adaptive Phase Detection](../../packages/core/docs/adaptive-phase-detection.md).

### Context Cascade

Outputs from earlier phases automatically flow into later phases. Cumulative: each
phase receives accumulated context from all prior phases. No configuration needed.

### BMAD Personalities

| Personality | Philosophy | Effect |
|-------------|-----------|--------|
| **Amelia** | TDD-First | Write tests before implementation |
| **Winston** | Boring Technology | Prefer proven, stable solutions |
| **Bob** | Zero Ambiguity | Demand precise specifications |
| **John** | WHY-First | Question purpose before proceeding |

### Bilingual Support

Full English and Russian support across CLI output, agent prompts, documentation
(`docs/en/`, `docs/ru/`), and error messages.

---

## CLI Reference

Entry point: `packages/cli/bin/asmo.js`

### `asmo run` -- Execute a Task

```bash
asmo run "Fix the login bug causing 500 errors"          # Default mode
asmo run "Implement OAuth2 integration" --use-api        # Force API
asmo run "Fix typo in README" --no-llm                   # Heuristics only
asmo run "Refactor the payment module" --verbose          # Detailed logs
asmo run "Design microservice architecture" --dry-run     # Analysis only
asmo run "Fix login regression" --workflow bug_fix_workflow  # Override workflow
```

| Flag | Description |
|------|-------------|
| `--use-api` | Force API mode (requires `ANTHROPIC_API_KEY`) |
| `--no-llm` | Keyword heuristics only (~65% accuracy) |
| `--verbose` | Detailed logging |
| `--dry-run` | Analyze only, do not execute |
| `--workflow <name>` | Override workflow selection |

### `asmo suggest` -- Get Recommendation

```bash
asmo suggest "Add input validation to registration form"
# Returns: { useAsmo: true, confidence: 0.85, suggestedWorkflow: "...", complexity: {...} }
```

### `asmo analyze` -- Complexity Analysis

```bash
asmo analyze "Migrate from PostgreSQL to MongoDB"
```

### `asmo workflow` -- Workflow Management

```bash
asmo workflow                                             # List all 27
asmo workflow bug_fix_workflow --task "Fix race condition" # Execute specific
```

---

## Configuration Fallback Chain

```
  Priority 1: .cursor/config          (project-level overrides)
      |
  Priority 2: ~/.asmo/config          (user home defaults)
      |
  Priority 3: node_modules/@asmo/core/templates  (bundled, always available)
```

| Tier | Location | Scope |
|------|----------|-------|
| Project | `.cursor/config` | Highest priority, project-specific |
| User | `~/.asmo/config` | Personal defaults, all projects |
| Bundled | `@asmo/core/templates` | Base defaults, ships with package |

`ConfigManager` checks each tier in order; first value found wins.

---

## Complexity Levels

| Level | Score | Model | Typical Tasks | Workflow Examples |
|-------|-------|-------|---------------|-------------------|
| **Trivial** | 0-20 | Haiku | Typos, text changes | Quick Flow, YOLO |
| **Simple** | 21-40 | Haiku | Small bugs, config changes | Bug Fix, Dev Story |
| **Medium** | 41-60 | Sonnet | Standard features, APIs | Feature Dev, Code Review |
| **Complex** | 61-80 | Sonnet/Opus | Security, refactoring | Security Audit, Perf Opt |
| **Enterprise** | 81-100 | Opus | Architecture, migrations | Arch Design, DB Migration |

### Keyword Categories

| Category | Base Score | Keywords |
|----------|-----------|---------|
| `trivial` | 15 | typo, text, comment, rename |
| `bug_fix` | 25 | bug, fix, error, crash, regression |
| `refactoring` | 50 | refactor, cleanup, restructure |
| `api` | 50 | endpoint, REST, GraphQL, route |
| `feature` | 55 | feature, implement, add, create |
| `database` | 60 | migration, schema, query, index |
| `performance` | 65 | optimize, speed, cache, profiling |
| `security` | 70 | auth, encryption, oauth, vulnerability |
| `architecture` | 75 | architecture, system design, microservice |

**Modifiers:** `high_risk` (+10 for core/modify/redesign), `data_impact`,
`security_impact`, `performance_impact`.

---

## Agent Catalog

### Core Agents (6)

| Agent | Role | Typical Workflows |
|-------|------|-------------------|
| **architect** | System design, technical decisions | Architecture Design, Feature Dev |
| **developer** | Code implementation | Feature Dev, Bug Fix, Refactoring |
| **debugger** | Bug investigation, root cause analysis | Bug Fix, Performance Investigation |
| **optimizer** | Performance improvement | Performance Optimization |
| **tester** | Quality assurance, test creation | Comprehensive Testing, Bug Fix |
| **devops** | Infrastructure, deployment | Database Migration, Deployment |

### Specialized Agents (15)

| Agent | Domain |
|-------|--------|
| **ui-developer** | UI components, accessibility, responsive design |
| **ux-designer** | Wireframes, user flows, usability |
| **business-analyst** | User stories, acceptance criteria, domain modeling |
| **project-manager** | Timelines, dependencies, risk management |
| **product-owner** | Roadmap, prioritization, stakeholder alignment |
| **scrum-master** | Sprint planning, retrospectives, ceremonies |
| **security-specialist** | Vulnerability assessment, threat modeling |
| **performance-engineer** | Load testing, profiling, optimization strategies |
| **data-architect** | Schema design, data flow, storage optimization |
| **api-designer** | REST/GraphQL design, versioning, documentation |
| **analyst** | Metrics, reporting, trend analysis |
| **tech-writer** | API docs, guides, architecture documentation |
| **test-architect** | Test framework, coverage strategy |
| **adversarial-reviewer** | Mandatory issue discovery, 3-level escalation |
| **code-reviewer** | Best practices, style, correctness |

### Validation Agents (4)

| Agent | Validation Focus |
|-------|-----------------|
| **design-validator** | Architecture docs, API contracts, schemas |
| **merge-coordinator** | Branch conflicts, CI status, approvals |
| **post-deploy-monitor** | Health checks, error rates, performance |
| **requirements-validator** | Acceptance criteria, edge cases, ambiguity |

---

## Workflow Catalog

### Implementation (10)

| Workflow | Key | Agents | Use Case |
|----------|-----|--------|----------|
| Quick Flow | `quick_flow` | developer | Trivial tasks, YOLO |
| Feature Development | `feature_implementation_full` | architect, developer, tester | New features |
| Quality Assurance | `comprehensive_testing` | tester, test-architect | Test suite creation |
| Bug Fix (adaptive) | `bug_fix_workflow` | debugger, developer, tester | Bug investigation and fix |
| Refactoring | `code_refactoring` | architect, developer | Code restructuring |
| Performance Optimization | `performance_optimization` | optimizer, perf-engineer, developer | Speed/memory improvements |
| Security Audit | `security_audit` | security-specialist, tester | Vulnerability review |
| Architecture Design | `architecture_design` | architect, developer | System design decisions |
| Database Migration | `database_migration` | data-architect, developer, devops | Schema changes |
| API Design | `api_design` | api-designer, developer | API endpoint design |

### Discovery and Planning (7)

| Workflow | Key | Use Case |
|----------|-----|----------|
| Adversarial Review | `adversarial_review_workflow` | Critical review, mandatory issue discovery |
| Product Brief | `create_product_brief_workflow` | Product vision and brief |
| Create PRD | `create_prd_workflow` | Product requirements document |
| UX Design | `create_ux_design_workflow` | User experience design |
| Epics and Stories | `create_epics_and_stories_workflow` | Backlog creation |
| Implementation Readiness | `check_implementation_readiness_workflow` | Pre-implementation validation |
| Sprint Planning | `sprint_planning_workflow` | Sprint scope and commitment |

### Post-Implementation (6)

| Workflow | Key | Use Case |
|----------|-----|----------|
| Correct Course | `correct_course_workflow` | Mid-project course correction |
| Retrospective | `retrospective_workflow` | Sprint/project retrospective |
| Automate Tests | `automate_tests_workflow` | Quick test automation |
| Dev Story | `dev_story_workflow` | Story implementation |
| Code Review | `code_review_workflow` | Standard code review |
| Create Story | `create_story_workflow` | Story creation from requirements |

### TEA Testing (3)

| Workflow | Key | Time | Scope |
|----------|-----|------|-------|
| TEA Planning | `tea_planning_workflow` | 3-5h | Risk analysis, strategy, design |
| TEA Execution | `tea_execution_workflow` | 3.5-6h | Automation, regression, maintenance |
| TEA Validation | `tea_validation_workflow` | 2-3h | Quality gates, release readiness |

### UI (1)

| Workflow | Key | Use Case |
|----------|-----|----------|
| UI Component Library | `ui_component_library` | Component system design |

---

## Skills Catalog

55 skills across 12 categories, loaded from `SKILL.md` files:

| Category | Count | Examples |
|----------|-------|---------|
| **Core Development** | 8 | code-implementation, code-review, debugging, refactoring, testing |
| **Architecture** | 5 | system-design, api-design, data-modeling, microservices |
| **Security** | 5 | vulnerability-assessment, authentication, authorization, encryption |
| **Performance** | 4 | profiling, caching, query-optimization, load-testing |
| **Testing** | 6 | unit-testing, integration-testing, e2e-testing, test-automation |
| **DevOps** | 5 | ci-cd, containerization, deployment, monitoring, infrastructure |
| **Database** | 4 | schema-design, migration, query-writing, data-modeling |
| **Frontend** | 4 | component-development, accessibility, responsive-design |
| **API** | 4 | rest-design, graphql-design, api-versioning, api-documentation |
| **Product** | 4 | requirements-analysis, user-story-writing, acceptance-criteria |
| **Process** | 3 | sprint-planning, retrospective-facilitation, risk-management |
| **Communication** | 3 | technical-writing, stakeholder-reporting, team-facilitation |

---

## Quick Start

### Installation

```bash
npm install -g @asmo/cli      # CLI (global)
npm install @asmo/core         # Library (project)
```

### Setup LLM Provider

**Session Mode (recommended, $0):**

```bash
brew install anthropic/claude/claude    # macOS
claude auth login
```

**API Mode (pay-per-token):**

```bash
echo 'ANTHROPIC_API_KEY=sk-ant-...' > .env
```

### First Run

```bash
asmo suggest "Add rate limiting to API endpoints"    # Check recommendation
asmo run "Add rate limiting to API endpoints"         # Execute full pipeline
asmo analyze "Redesign auth module"                   # Complexity only
asmo workflow                                         # List workflows
asmo run "Fix broken login test" --verbose            # Verbose execution
asmo run "Implement caching layer" --dry-run          # Preview only
```

### When to Use ASMO

**Use ASMO:** multiple files, multiple concerns (code + tests + docs), architectural
decisions, cross-cutting concerns (security, performance), multi-agent collaboration.

**Skip ASMO:** simple typos, single-line changes, quick questions, file exploration.

```bash
asmo suggest "your task"   # Get JSON: { useAsmo: true/false, reasoning: "..." }
```

### Build and Test (development)

```bash
pnpm install               # Install dependencies
pnpm build                 # Build (turbo + tsup)
pnpm test                  # Test (jest)
```

---

## Phase Documentation Links

### Phase 0 -- Vision
- [Vision and One-Pager](./phase-0-vision/README.md)
- [Problem Statement](./phase-0-vision/problem-statement.md)
- [Success Metrics](./phase-0-vision/success-metrics.md)
- [Scope](./phase-0-vision/scope.md)

### Phase 1 -- Requirements
- [PRD Summary](./phase-1-requirements/README.md)
- [User Personas](./phase-1-requirements/user-personas.md)
- [User Journey](./phase-1-requirements/user-journey.md)
- [Use Cases](./phase-1-requirements/use-cases.md)
- [Acceptance Criteria](./phase-1-requirements/acceptance-criteria.md)
- [Non-Functional Requirements](./phase-1-requirements/nfr.md)

### Phase 2 -- Concept and UX
- [UX Overview](./phase-2-ux/README.md)
- [Information Architecture](./phase-2-ux/information-architecture.md)
- [UX Flow](./phase-2-ux/ux-flow.md)
- [Wireframes](./phase-2-ux/wireframes.md)
- [UX Decisions](./phase-2-ux/ux-decisions.md)

### Phase 3 -- Architecture
- [Architecture Overview](./phase-3-architecture/README.md)
- [Architecture Diagram](./phase-3-architecture/architecture-diagram.md)
- [Data Model](./phase-3-architecture/data-model.md)
- [API Contract](./phase-3-architecture/api-contract.md)
- [Integration Map](./phase-3-architecture/integration-map.md)
- [Security and Privacy](./phase-3-architecture/security-privacy.md)
- [Risks and Assumptions](./phase-3-architecture/risks-assumptions.md)

### Phase 4 -- Release
- [Release Overview](./phase-4-release/README.md)
- [Demo Script](./phase-4-release/demo-script.md)
- [Demo Data](./phase-4-release/demo-data.md)
- [Feature Matrix](./phase-4-release/feature-matrix.md)
- [Known Issues](./phase-4-release/known-issues.md)
- [Release Notes](./phase-4-release/release-notes.md)

### Technical Documentation
- [LLM Provider Factory](../../packages/core/docs/llm-provider-factory.md)
- [Adaptive Phase Detection](../../packages/core/docs/adaptive-phase-detection.md)
- [CLAUDE.md](../../CLAUDE.md)

---

## Appendix: Input Validation

All prompts pass through 10 validation checks before processing:

| Check | Description |
|-------|-------------|
| Empty/null | Rejects empty or null input |
| Min length | Requires at least 3 characters |
| Max length | Limits to 10,000 characters |
| UTF-8 | Validates proper encoding |
| Control chars | Strips null bytes and control characters |
| Whitespace | Collapses excessive whitespace |
| Injection | Detects prompt injection attempts |
| Unicode | Normalizes to NFC form |
| Profanity | Basic content filtering |
| Format | Validates task description format |

---

## Appendix: Project Structure

```
ASMO/
  packages/
    core/                    # @asmo/core - orchestration library
      src/
        agents/              # 25 agent implementations
        workflows/           # Workflow engine and orchestration
        skills/              # Skill matching and loading
        config/              # Configuration management
        metrics/             # Metrics collection and learning
        llm/                 # LLM provider factory
      templates/
        roles/               # 25 role definitions (JSON)
        skills/              # 55 skill definitions (SKILL.md)
        workflows/           # 27 workflow templates (JSON)
      docs/                  # Technical docs
    cli/                     # @asmo/cli - CLI
      bin/asmo.js            # Entry point
      src/commands/          # Command implementations
  docs/
    en/                      # English documentation
    ru/                      # Russian documentation
  CLAUDE.md                  # Claude Code integration
  CONTRIBUTING.md            # Contribution guidelines
  CHANGELOG.md               # Version history
```

---

*For detailed technical documentation on specific subsystems, see the linked
documents in [Phase Documentation Links](#phase-documentation-links) and
[Technical Documentation](#technical-documentation).*
