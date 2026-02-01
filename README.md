# AI1st - Autonomous Development Teams

[![npm version](https://img.shields.io/npm/v/@ai1st/core.svg)](https://www.npmjs.com/package/@ai1st/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

> Transform AI from "helpful assistant" to "autonomous team"

AI1st is an autonomous AI development orchestration system that coordinates multiple AI agents to work together as a cohesive team, handling complex software development tasks from design to deployment.

**Origin**: Based on BMAD (Breakthrough Method of Agile AI Driven Development) principles, refactored as a standalone, generalizable library for any project.

## ✨ Key Features

- 🤖 **28 Specialized Agents** — Architect, Developer, Tester, Security, UX, DevOps, Analyst, Tech Writer, and more
- 🔄 **28 Production Workflows** — From quick fixes to enterprise architecture + TEA testing workflows
- 🎯 **85 Skills Catalog** — Automatic skill matching across 12 categories
- 📊 **Complexity Analysis** — 5-level task analysis with intelligent workflow selection
- ⚡ **YOLO Mode** — Automatic approval bypass for trivial tasks
- 🎉 **Party Mode** — Multi-agent collaboration with consensus building
- ⚙️ **3-Tier Configuration** — Defaults → File → Environment
- 🔴 **Adversarial Review** — Critical code review that MUST find issues
- 🧠 **Advanced Elicitation** — 5 techniques: First Principles, Red Team/Blue Team, Pre-mortem, Socratic, Devil's Advocate
- 📄 **Context Cascade** — Automatic context flow between workflow phases
- 📚 **Document Sharding** — Split large documents into manageable sections
- 🧪 **TEA Module** — 8 specialized testing workflows (Test Architect)

## 📦 Quick Install

```bash
# Using pnpm (recommended)
pnpm add @ai1st/core

# Using npm
npm install @ai1st/core

# Using yarn
yarn add @ai1st/core
```

## 🚀 Quick Start

```typescript
import { WorkflowEngine, AgentRegistry } from '@ai1st/core'

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
const selection = await engine.selectWorkflowAdaptively(
  'Implement payment processing with Stripe'
)

console.log('Complexity:', selection.complexity.level)  // 'complex'
console.log('Workflow:', selection.workflow.name)        // 'Full Development'
console.log('Agents:', selection.selectedAgents)         // ['architect', 'developer', ...]
```

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

## 📚 Documentation

| Language | Link |
|----------|------|
| 🇬🇧 English | [docs/en/](./docs/en/getting-started/index.md) |
| 🇷🇺 Русский | [docs/ru/](./docs/ru/getting-started/index.md) |

### Quick Links

- [Installation](./docs/en/getting-started/installation.md)
- [Quick Start Guide](./docs/en/getting-started/quick-start.md)
- [Configuration](./docs/en/getting-started/configuration.md)
- [Agent Catalog](./docs/en/reference/agents/index.md)
- [Workflow Catalog](./docs/en/reference/workflows/index.md)
- [Skills Catalog](./docs/en/reference/skills/index.md)

## 🏗️ Project Structure

```
ai1st-orchestration/
├── packages/
│   ├── core/           # @ai1st/core - Main library
│   ├── cli/            # CLI tool (coming soon)
│   └── docs/           # VitePress site (coming soon)
├── docs/               # Markdown documentation
│   ├── en/             # English
│   └── ru/             # Russian
├── scripts/            # Doc generation scripts
└── turbo.json          # Turbo build config
```

## 🎯 Agents (28)

| Category | Agents | Description |
|----------|--------|-------------|
| **Core** | 6 | Architect, Developer, Tester, UI Developer, UX Designer, DevOps |
| **Specialized** | 14 | Security, Performance, Database, API, Analyst, Tech Writer, Test Architect, Adversarial Reviewer, etc. |
| **Validation** | 5 | Code Reviewer, Design Validator, etc. |
| **Business** | 3 | Product Owner, Business Analyst, Scrum Master |

[View full catalog →](./docs/en/reference/agents/index.md)

## 📋 Workflows (28)

| Level | Workflows | Complexity Score |
|-------|-----------|------------------|
| Simple | Quick Flow, Bug Fix | 0-40 |
| Standard | Feature Dev, Refactoring, Performance | 41-60 |
| Complex | Security Audit, API Design, Database Migration | 61-80 |
| Enterprise | Architecture Design | 81-100 |
| **BMAD Planning** | Product Brief, PRD, UX Design, Epics & Stories, Sprint Planning | N/A |
| **BMAD Implementation** | Correct Course, Retrospective, Automate Tests | N/A |
| **TEA Testing** | 8 workflows: Risk Assessment, Test Strategy, Quality Gates, Release Readiness, etc. | N/A |

[View full catalog →](./docs/en/reference/workflows/index.md)

## 🛠️ Development

```bash
# Clone repository
git clone https://github.com/Samch1k/ai1st-orchestration.git
cd ai1st-orchestration

# Install dependencies
pnpm install

# Build
pnpm build

# Test
pnpm test

# Lint
pnpm lint
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details.

## 📝 License

MIT © 2026 AI1st Contributors

## 📮 Links

- [GitHub Repository](https://github.com/Samch1k/ai1st-orchestration)
- [Issues](https://github.com/Samch1k/ai1st-orchestration/issues)
- [Discussions](https://github.com/Samch1k/ai1st-orchestration/discussions)
- [Changelog](./CHANGELOG.md)
