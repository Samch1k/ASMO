# AI1st - Autonomous Development Teams

> Transform AI from "helpful assistant" to "autonomous team"

**Status**: 🚧 Phase 1 Complete - Core library implemented
**Repository**: [github.com/Samch1k/ai1st-orchestration](https://github.com/Samch1k/ai1st-orchestration) (Private)

## What is AI1st?

AI1st is an autonomous AI development orchestration system that coordinates multiple AI agents to work together as a cohesive team, handling complex software development tasks from design to deployment.

**Origin**: Based on BMAD (Breakthrough Method of Agile AI Driven Development) principles, refactored as a standalone, generalizable library for any project.

## ✨ Key Features

- 🤖 **Multi-Agent Orchestration**: Coordinate architect, developer, tester, UI/UX, and DevOps agents
- 🔄 **Parallel Execution**: Run multiple agents simultaneously for faster delivery
- ✅ **Quality Gates**: Automatic approval checkpoints and validation at each phase
- 📝 **Instruction-Based**: Markdown-based agent guidance with project customization
- ⚙️ **Configurable**: 3-tier configuration system (defaults → file → environment)
- 🎯 **Skill-Based Matching**: 85 generic skills across 12 categories
- 📊 **Metrics & Learning**: Track performance and optimize workflows over time
- ♿ **UX-First**: Built-in accessibility (WCAG 2.1 AA) and responsive design patterns

## 📦 Project Structure

This is a monorepo managed with pnpm workspaces and Turbo:

```
ai1st-orchestration/
├── packages/
│   ├── core/                    # @ai1st/core - Main orchestration library
│   │   ├── src/
│   │   │   ├── orchestration/   # Workflow engine, agent registry, skill matching
│   │   │   ├── agents/          # Base agent + 16 role implementations
│   │   │   └── index.ts         # Public API
│   │   ├── templates/           # Configuration templates
│   │   │   ├── roles/           # 16 agent roles (core + specialized + business)
│   │   │   ├── workflows/       # 5 generic workflows
│   │   │   ├── skills/          # 85 skills catalog + dependencies
│   │   │   └── instructions/    # Agent instruction files (6 agents)
│   │   └── tests/               # Jest tests (smoke tests implemented)
│   ├── examples/                # Demo applications (Phase 2 - Coming soon)
│   └── docs/                    # VitePress documentation (Phase 3 - Coming soon)
└── scripts/                     # Build and utility scripts
```

## 🚀 Current Status

### ✅ Phase 1: Core Library Implementation (Complete)

**What's Done:**
- ✅ GitHub repository created and initialized
- ✅ Monorepo structure with pnpm + Turbo
- ✅ Core library implemented: 37 TypeScript files (~23,000 LOC)
  - 17 orchestration files
  - 11 agent files (9 generic roles)
  - 3 configuration files
  - Supporting utilities
- ✅ Configuration templates: 20 files
  - 85 generic skills (domain-specific removed)
  - 5 generic workflows
  - 11 agent roles
  - 6 agent instruction sets
- ✅ Test infrastructure: Jest + ts-jest
- ✅ Package exports: Comprehensive public API

**Validation Results:**
- ✅ Package Structure: 100% complete
- ✅ Template Completeness: 100% complete
- ✅ Git Configuration: Properly set up
- ✅ Codebase: Clean, generic, domain-agnostic
- ⚠️ TypeScript Strict Mode: Has errors (to be fixed)

### 🔜 Phase 2: Demo Applications (Next)

**Planned:**
1. **Todo App** (Simple) - Demonstrate basic workflow
2. **Blog Platform** (Medium) - Show parallel execution + UX workflow
3. **E-commerce Catalog** (Complex) - Full feature showcase

### 🔜 Phase 3: Documentation

**Planned:**
- VitePress documentation site
- Getting started guide
- API reference
- Configuration guide
- Examples and tutorials

## 🛠️ Development

### Prerequisites

- Node.js 18+
- pnpm 8+

### Setup

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run type checking
pnpm typecheck

# Run tests (currently smoke tests only)
pnpm test
```

### Working with Core Library

```bash
# Build core library
pnpm --filter @ai1st/core build

# Run core tests
pnpm --filter @ai1st/core test

# Type check core
pnpm --filter @ai1st/core typecheck
```

## 📚 Core Library Usage

```typescript
import {
  WorkflowEngine,
  AgentRegistry,
  SkillMatcher,
  ConfigLoader
} from '@ai1st/core'

// Initialize the orchestration system
const configLoader = new ConfigLoader('.ai1st/config')
await configLoader.initialize()

const agentRegistry = new AgentRegistry()
await agentRegistry.autoDiscover()

const skillMatcher = new SkillMatcher(configLoader, agentRegistry)
const workflowEngine = new WorkflowEngine(agentRegistry, skillMatcher)

// Execute a workflow
const result = await workflowEngine.executeWorkflow({
  id: 'feature-implementation',
  name: 'Implement New Feature',
  description: 'Add shopping cart functionality',
  steps: [
    {
      id: 'design',
      role: 'architect',
      phase: 'design',
      description: 'Design the shopping cart architecture',
      requiredSkills: ['system_design', 'api_design']
    },
    {
      id: 'implement',
      role: 'developer',
      phase: 'implementation',
      description: 'Implement shopping cart backend',
      requiredSkills: ['backend_development', 'database_design']
    },
    {
      id: 'test',
      role: 'tester',
      phase: 'testing',
      description: 'Test shopping cart functionality',
      requiredSkills: ['unit_testing', 'integration_testing']
    }
  ]
})
```

## 🎯 Agent Roles

**Core Roles:**
- 🏗️ **Architect** - System design, API contracts, data models
- 👨‍💻 **Developer** - Backend implementation, business logic
- 🧪 **Tester** - Quality assurance, test automation
- 🎨 **UI Developer** - Frontend components, responsive design
- 🎭 **UX Designer** - User flows, wireframes, accessibility
- 🐛 **Debugger** - Issue investigation, root cause analysis
- 🚀 **DevOps** - Infrastructure, CI/CD, monitoring
- ⚡ **Optimizer** - Performance tuning, caching strategies
- 👀 **Code Reviewer** - Code quality, best practices

## 🔧 Configuration

AI1st uses a 3-tier configuration system:

1. **Defaults** - Built-in sensible defaults
2. **Configuration Files** - Project-specific `.ai1st/config/`
3. **Environment Variables** - Runtime overrides

### Example Configuration

```typescript
// .ai1st/config/orchestration.config.ts
export default {
  timeouts: {
    architect: 300000,    // 5 minutes
    developer: 900000,    // 15 minutes
    tester: 480000        // 8 minutes
  },
  parallel: {
    maxAgents: 3,
    enabled: true
  },
  approvalRequired: true,
  learningEnabled: true
}
```

## 📊 Workflow Templates

**Quick Flow:**
- `bug_fix_workflow` - Fast bug fix with testing

**Feature Development:**
- `feature_implementation_full` - Complete feature with approval gates
- `ui_component_library` - UI component development

**Quality Assurance:**
- `comprehensive_testing` - Full testing suite (unit, integration, E2E)
- `performance_investigation` - Performance profiling and optimization

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test --coverage

# Run specific test file
pnpm --filter @ai1st/core test workflow-engine.test.ts
```

**Current Test Coverage:** ~15% (smoke tests only)

**Testing Goals:**
- Phase 1: ✅ Smoke tests for all core classes
- Phase 2: ⏳ 80%+ coverage for critical paths
- Phase 3: ⏳ Integration tests with real agent execution

## 📝 License

MIT © 2026 AI1st Contributors

## 🤝 Contributing

This project is currently in active development. Contribution guidelines will be available after Phase 3 completion.

## 📮 Contact

- **Repository**: [github.com/Samch1k/ai1st-orchestration](https://github.com/Samch1k/ai1st-orchestration)
- **Issues**: [GitHub Issues](https://github.com/Samch1k/ai1st-orchestration/issues)

---

**Roadmap:**
- ✅ Phase 1: Core Library Implementation (Complete)
- 🔄 Phase 2: Demo Applications (In Progress)
- ⏳ Phase 3: Documentation Site
- ⏳ Phase 4: Visual Materials & Videos
- ⏳ Phase 5: Final Polish & Release
