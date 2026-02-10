# ASMO - AI System for Multiagent Orchestration

[![npm version](https://img.shields.io/npm/v/@asmo/core.svg)](https://www.npmjs.com/package/@asmo/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)

> Transform AI from "helpful assistant" to "autonomous team"

ASMO is an autonomous AI development orchestration system that coordinates multiple AI agents to work together as a cohesive team, handling complex software development tasks from design to deployment.

**Origin**: Based on BMAD (Breakthrough Method of Agile AI Driven Development) principles, refactored as a standalone, generalizable library for any project.

## Key Features

### Core Orchestration

- **25 Specialized Agents** — Architect, Developer, Tester, Security, UX, DevOps, Analyst, Tech Writer, and more
- **27 Production Workflows** — From quick fixes to enterprise architecture + TEA testing workflows
- **55 Skills Catalog** — Automatic skill matching across 12 categories
- **Complexity Analysis** — 5-level task analysis with intelligent workflow selection
- **Adaptive Phase Detection** — Smart phase joining based on project context and user intent (LLM-powered)

### Dynamic Orchestrator

- **Intelligent Model Routing** — Automatic selection of Opus/Sonnet/Haiku based on task complexity
- **Dual Execution Modes** — Session ($0 with Claude subscription) or API (pay-per-use)
- **Circuit Breaker** — Fault tolerance with automatic recovery
- **Zod Validation** — Type-safe input/output validation
- **YAML Config** — Declarative agent and model configuration

### Collaboration & Quality

- **YOLO Mode** — Automatic approval bypass for trivial tasks
- **Party Mode** — Multi-agent collaboration with consensus building
- **Adversarial Review** — Critical code review that MUST find issues
- **Advanced Elicitation** — 5 techniques: First Principles, Red Team/Blue Team, Pre-mortem, Socratic, Devil's Advocate

### BMAD Personalities & Principles

- **Agent Personalities** — Amelia (TDD), Winston (Boring Tech), Bob (Zero Ambiguity), John (WHY-First)
- **Menu Commands** — Bilingual shortcuts: `[DS]`/`[ИС]`, `[CR]`/`[КО]`, `[CS]`/`[СИ]`
- **Strict Enforcement** — Blocks completion on principle violations (test failures, ambiguity, missing business value)
- **Personality Prompts** — Dynamic enrichment with traits, catchphrases, and bilingual signatures

### Architecture

- **3-Tier Configuration** — Defaults → File → Environment
- **Context Cascade** — Automatic context flow between workflow phases
- **Document Sharding** — Split large documents into manageable sections
- **TEA Module** — 3 consolidated testing workflows (Test Architect)

## Quick Install

### Library (Programmatic Use)

```bash
# Using pnpm (recommended)
pnpm add @asmo/core

# Using npm
npm install @asmo/core

# Using yarn
yarn add @asmo/core
```

**✅ Library-First Architecture** - @asmo/core works standalone without configuration. Bundled templates with workflows, agents, and skills are included and automatically used as fallback.

**Config Fallback Chain:**

1. `.cursor/config` - Claude Code environment (if present)
2. `~/.asmo/config` - User home directory
3. `node_modules/@asmo/core/templates` - Bundled templates (always available)

### CLI Tool (Command Line)

```bash
# Global installation
npm install -g @asmo/cli

# Or use with npx
npx @asmo/cli run "Fix the login bug"
```

**Note**: CLI requires @asmo/core to be installed. CLI commands use the same fallback chain for configuration.

## Quick Start

```typescript
import { WorkflowEngine, AgentRegistry } from '@asmo/core'

// Initialize
const registry = new AgentRegistry()
const engine = new WorkflowEngine(registry)
await engine.initialize()

// Execute task - workflow selected automatically!
const result = await engine.execute('Add user authentication with OAuth2')

console.log('Workflow:', result.workflowId)
console.log('Status:', result.status)
```

### Adaptive Workflow Selection

```typescript
// Get detailed analysis before execution
const selection = await engine.selectWorkflowAdaptively('Implement payment processing with Stripe')

console.log('Complexity:', selection.complexity.level) // 'complex'
console.log('Workflow:', selection.workflow.name) // 'Full Development'
console.log('Agents:', selection.selectedAgents) // ['architect', 'developer', ...]
```

### Adaptive Phase Detection (NEW!)

Skip redundant phases based on project context and user intent:

```typescript
import { WorkflowSelector, ClaudeCodeAdapter } from '@asmo/core'

const selector = new WorkflowSelector({
  claudeCodeAdapter: new ClaudeCodeAdapter(),
  enablePhaseDetection: true,
  phaseDetectorConfig: {
    minConfidence: 0.5,
    fallbackStrategy: 'first_phase', // 'keyword' | 'error'
  },
})

// Detects optimal phase based on task + existing artifacts
const selection = await selector.selectWorkflowWithPhase(
  'Проверь код на security issues', // Bilingual support (EN/RU)
  { projectPath: '/my/project' }
)

console.log('Phase:', selection.phase) // 'review' (skips test_first, implementation)
console.log('Skipped:', selection.skipPhases) // ['test_first', 'implementation', 'refactoring']
console.log('Intent:', selection.llmIntent) // 'review'
console.log('Confidence:', selection.confidence) // 0.92
```

**How it works:**

1. **ContextAnalyzer** scans project for existing artifacts (code, tests, docs)
2. **PhaseDetector** uses LLM (ClaudeCodeAdapter in-subscription) to analyze intent
3. Validates phase prerequisites and skips completed phases
4. Falls back to keywords or first phase if LLM confidence is low

### Party Mode (Multi-Agent Collaboration)

```typescript
// Brainstorm with multiple agents
const session = await engine.executePartyMode(
  'Design notification system architecture',
  ['architect', 'developer', 'devops'],
  undefined,
  { maxRounds: 3, convergenceThreshold: 0.8 }
)

console.log('Agreements:', session.state.agreements)
console.log('Convergence:', session.state.convergenceScore)
```

### Dynamic Orchestrator & Model Routing

```typescript
import { getDynamicOrchestrator, type OrchestrationTask } from '@asmo/core'

const orchestrator = getDynamicOrchestrator({ verbose: true })

const task: OrchestrationTask = {
  id: 'task-001',
  description: 'Implement user authentication',
  complexity: { score: 55, level: 'medium' }, // → Routes to Sonnet
}

// Preview routing without executing
const routing = orchestrator.previewRouting(task)
console.log('Model:', routing.model) // 'sonnet'
console.log('Rationale:', routing.rationale)

// Execute task
const result = await orchestrator.executeTask(task)
console.log('Success:', result.success)
console.log('Duration:', result.metrics.totalDuration)
```

### Dual Execution Modes

```typescript
import { getExecutorFactory } from '@asmo/core'

const factory = getExecutorFactory({
  preferredMode: 'auto', // 'session' ($0) | 'api' (pay-per-use) | 'auto'
})

const result = await factory.execute({
  taskId: 'task-001',
  prompt: 'Generate authentication code',
  state: agentState,
  model: 'sonnet',
})

console.log('Mode used:', result.metrics.mode) // 'session' or 'api'
if (result.metrics.mode === 'api') {
  console.log('Cost:', result.metrics.estimatedCost)
}
```

## BMAD Personalities & Principles

**ASMO** integrates **BMAD** (Breakthrough Method of Agile AI Driven Development) methodology with agent personalities, strict principles enforcement, and menu-driven commands.

### Meet the BMAD Agents

#### **Amelia** 👩‍💻 - Developer (TDD Evangelist)

```typescript
{
  motto: "I will not mark this complete until 100% of tests pass",
  traits: ["perfectionist", "test-driven", "quality-focused"],
  principle: {
    name: "test_enforcement",
    strict: true,  // BLOCKS completion if tests fail
    message: "🚫 Amelia says: 2 test(s) failing - Fix tests first!"
  }
}
```

**What Amelia does:**

- Enforces TDD workflow: Red → Green → Refactor
- Blocks completion if ANY tests fail
- Requires 100% test coverage on new code
- Validates `test_results` in step output

#### **Winston** 🏗️ - Architect (Boring Tech Advocate)

```typescript
{
  motto: "Let's choose boring technology that works",
  traits: ["pragmatic", "risk-averse", "experienced"],
  principle: {
    name: "boring_technology",
    strict: true,
    warnings: [
      "MongoDB → Consider PostgreSQL with JSONB",
      "GraphQL → REST is simpler for most cases",
      "Microservices → Start with modular monolith"
    ]
  }
}
```

**What Winston does:**

- Flags risky tech: MongoDB, GraphQL, Microservices, Bun, Deno
- Suggests battle-tested alternatives
- Warns about premature optimization
- Prefers proven solutions over shiny new tools

#### **Bob** 📋 - Scrum Master (Zero Ambiguity Guardian)

```typescript
{
  motto: "If it's ambiguous, it's not ready",
  traits: ["detail-oriented", "process-driven", "uncompromising"],
  principle: {
    name: "zero_ambiguity",
    strict: true,
    blocks: ["fast", "many", "user-friendly", "etc", "some", "often"],
    requires: "Given-When-Then format with specific numbers"
  }
}
```

**What Bob does:**

- Detects vague terms: "fast", "many", "user-friendly", "etc"
- Requires measurable criteria with numbers
- Enforces Given-When-Then format
- Blocks stories with ambiguous requirements

#### **John** 🎯 - Product Owner (WHY-First Leader)

```typescript
{
  motto: "Let's understand WHY before deciding HOW",
  traits: ["strategic", "business-focused", "why-driven"],
  principle: {
    name: "why_first",
    strict: true,
    requires: "Every requirement must explain business value",
    format: "As a [user], I want [feature], So that [benefit]"
  }
}
```

**What John does:**

- Blocks requirements without "why" or business value
- Enforces user story format: "So that [benefit]" is mandatory
- Connects features to business outcomes
- Validates measurable success criteria

### Menu Commands (Bilingual)

Execute workflows with short commands in English or Russian:

```bash
# Dev Story - TDD implementation with Amelia
asmo run "[DS] implement user login"        # English
asmo run "[ИС] реализовать вход пользователя"  # Russian

# Create Story - Zero ambiguity with Bob
asmo run "[CS] add notifications"           # English
asmo run "[СИ] добавить уведомления"        # Russian

# Code Review - Comprehensive review
asmo run "[CR] review payment integration"  # English
asmo run "[КО] проверить интеграцию оплаты"  # Russian

# Implementation Readiness - Check requirements
asmo run "[IR]"                             # English
asmo run "[ГР]"                             # Russian
```

**Available Commands:**

| EN     | RU     | Workflow                 | BMAD Agent | Principle                  |
| ------ | ------ | ------------------------ | ---------- | -------------------------- |
| `[IR]` | `[ГР]` | Implementation Readiness | Bob        | Zero Ambiguity             |
| `[DS]` | `[ИС]` | Dev Story (TDD)          | Amelia     | Test Enforcement           |
| `[CR]` | `[КО]` | Code Review              | Multiple   | Quality Gates              |
| `[CS]` | `[СИ]` | Create Story             | Bob + John | Zero Ambiguity + WHY First |
| `[CC]` | `[КК]` | Course Correction        | Winston    | Risk Management            |
| `[CP]` | `[СБ]` | Create Product Brief     | John       | WHY First                  |
| `[VP]` | `[ВТ]` | Validate PRD             | Bob + John | Zero Ambiguity + WHY First |
| `[CE]` | `[СЭ]` | Create Epics             | John       | WHY First                  |

### Principles Enforcement in Action

#### Example 1: Amelia Blocks Failing Tests

```typescript
// Developer completes implementation
const result = await engine.execute('[DS] implement registration')

// Step output includes test results
context: {
  test_results: {
    passed: 8,
    failed: 2,     // ❌ Tests failed
    total: 10,
    coverage: 85
  }
}

// Amelia blocks completion:
// 🚫 Amelia says: 2 test(s) failing - I will not mark this complete until 100% of tests pass
// Fix failing tests before proceeding
//
// Workflow BLOCKED ❌
```

#### Example 2: Bob Detects Ambiguity

```typescript
// User creates story with vague terms
const result = await engine.execute('[CS] improve performance')

// Bob scans for ambiguous terms:
// 🚫 Bob says: Ambiguous term "improve" - be specific with numbers, metrics, or examples
// 🚫 Bob says: Ambiguous term "performance" - what metric? Response time? Throughput?
//
// Suggested fix: "Reduce API response time from 500ms to <200ms (p95)"
//
// Workflow BLOCKED ❌
```

#### Example 3: John Requires Business Value

```typescript
// User defines requirement without "why"
const result = await engine.execute('[CS] add dark mode')

// John validates business value:
// 🚫 John says: Missing "WHY" - explain business value or user impact
//
// Example: "So that users can..."
// Example: "To enable..."
// Example: "Business impact: ..."
//
// Workflow BLOCKED ❌

// Fixed version:
const result = await engine.execute(
  '[CS] add dark mode toggle ' +
    'So that night-shift users can use app without eye strain, ' +
    'increasing session duration by 25% and improving retention'
)
// ✅ John approves - clear business value
```

#### Example 4: Winston Warns About Risky Tech

```typescript
const result = await engine.execute('design notification system with MongoDB and Microservices')

// Winston flags risky choices:
// ⚠️  Winston says: "MongoDB" is medium risk - Consider PostgreSQL with JSONB
// ⚠️  Winston says: "Microservices" is high risk - Start with modular monolith
//
// Recommended: PostgreSQL + REST API + Modular Monolith
// Reasoning: Battle-tested, mature ecosystem, team familiarity
//
// Workflow continues with warnings (non-blocking)
```

### Personality-Based Prompts

Agents now use dynamic personality-enriched prompts:

```typescript
import { PersonalityPromptLoader } from '@asmo/core'

const loader = new PersonalityPromptLoader()

// Automatic language detection (Cyrillic → Russian)
const prompt = await loader.loadPromptWithPersonality(
  agentConfig,
  'реализовать аутентификацию', // Russian task
  { language: 'ru' }
)

// Prompt includes:
// - Personality traits and communication style
// - Bilingual catchphrase
// - Strict principles with enforcement rules
// - Agent signature (EN + RU)
```

**Prompt Structure:**

```markdown
# About Me / Обо мне

I'm **Amelia**, your TDD evangelist and quality guardian.

**My motto / Мой девиз**: "I will not mark this complete until 100% of tests pass"

## My Principles (Non-Negotiable)

1. 🔒 STRICT: Test Enforcement - 100% passage before completion
2. 💡 GUIDELINE: TDD Workflow - Red-Green-Refactor cycle

[... base prompt content ...]

---

_- Amelia, Developer (Tests Must Pass ✅)_
_- Амелия, Разработчик (Тесты Обязательны ✅)_
```

## Documentation

| Language | Link                                                   |
| -------- | ------------------------------------------------------ |
| English  | [docs/en/system-overview.md](./docs/en/system-overview.md) |
| Russian  | [docs/ru/system-overview.md](./docs/ru/system-overview.md) |

### Quick Links

- [Documentation Index](./docs/README.md) — Phase-based product documentation
- [System Overview (EN)](./docs/en/system-overview.md) — Complete system guide
- [System Overview (RU)](./docs/ru/system-overview.md) — Полное руководство

## Project Structure

```
asmo/
├── packages/
│   ├── core/           # @asmo/core - Main library (library-first architecture)
│   ├── cli/            # @asmo/cli - Command-line interface
│   └── docs/           # VitePress site (coming soon)
├── docs/               # Product documentation (Phase 0–4)
│   ├── en/             # English (phase-based + system overview)
│   └── ru/             # Russian (phase-based + system overview)
├── scripts/            # Doc generation scripts
└── turbo.json          # Turbo build config
```

## Agents (25)

| Category        | Agents | Description                                                                        |
| --------------- | ------ | ---------------------------------------------------------------------------------- |
| **Core**        | 6      | Architect, Developer, Tester, Debugger, Optimizer, DevOps                          |
| **Specialized** | 15     | Security, Performance, Database, API, UI, UX, Analyst, Tech Writer, TEA, and more  |
| **Validation**  | 4      | Design Validator, Merge Coordinator, Post-Deploy Monitor, Requirements Validator   |

[View full catalog →](./docs/en/system-overview.md)

## Workflows (27)

| Level                   | Workflows                                                             | Complexity Score |
| ----------------------- | --------------------------------------------------------------------- | ---------------- |
| Simple                  | Quick Flow, Bug Fix                                                   | 0-40             |
| Standard                | Feature Dev, Refactoring, Performance                                 | 41-60            |
| Complex                 | Security Audit, API Design, Database Migration                        | 61-80            |
| Enterprise              | Architecture Design                                                   | 81-100           |
| **BMAD Planning**       | Product Brief, PRD, UX Design, Epics & Stories, Sprint Planning       | N/A              |
| **BMAD Implementation** | Correct Course, Retrospective, Automate Tests, Dev Story, Code Review | N/A              |
| **TEA Testing**         | 3 consolidated: Planning, Execution, Validation                       | N/A              |

[View full catalog →](./docs/en/system-overview.md)

## Development

```bash
# Clone repository
git clone https://github.com/Samch1k/ASMO.git
cd ASMO

# Install dependencies
pnpm install

# Build
pnpm build

# Test
pnpm test

# Lint
pnpm lint
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details.

## License

MIT © 2026 ASMO Contributors

## Links

- [GitHub Repository](https://github.com/Samch1k/ASMO)
- [Issues](https://github.com/Samch1k/ASMO/issues)
- [Discussions](https://github.com/Samch1k/ASMO/discussions)
- [Changelog](./CHANGELOG.md)
