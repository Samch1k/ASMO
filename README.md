# AI1st - Autonomous Development Teams

> Transform AI from "helpful assistant" to "autonomous team"

**Status**: 🚧 BMAD Phase 1.5 Complete - Adaptive workflow selection implemented
**Repository**: [github.com/Samch1k/ai1st-orchestration](https://github.com/Samch1k/ai1st-orchestration) (Private)

## What is AI1st?

AI1st is an autonomous AI development orchestration system that coordinates multiple AI agents to work together as a cohesive team, handling complex software development tasks from design to deployment.

**Origin**: Based on BMAD (Breakthrough Method of Agile AI Driven Development) principles, refactored as a standalone, generalizable library for any project.

## ✨ Key Features

- 🤖 **Multi-Agent Orchestration**: Coordinate architect, developer, tester, UI/UX, and DevOps agents
- 🔄 **Parallel Execution**: Run multiple agents simultaneously for faster delivery
- 🎯 **Adaptive Workflow Selection**: Automatically choose workflows based on task complexity (NEW!)
- 📊 **Complexity Analysis**: Intelligent task analysis with confidence scoring (NEW!)
- ✅ **Quality Gates**: Automatic approval checkpoints and validation at each phase
- 📝 **Instruction-Based**: Markdown-based agent guidance with project customization
- ⚙️ **Configurable**: 3-tier configuration system (defaults → file → environment)
- 🎯 **Skill-Based Matching**: 85 generic skills across 12 categories
- 📈 **Metrics & Learning**: Track performance and optimize workflows over time
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
└── turbo.json                   # Turbo build configuration
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

### ✅ BMAD Phase 1: Complexity Analysis (Complete - Commit: 31c3be8)

**What's Done:**
- ✅ ComplexityAnalyzer class with heuristic-based analysis
- ✅ WorkflowSelector for automatic workflow recommendation
- ✅ New types: ComplexityLevel, ComplexityFactors, ComplexityScore, WorkflowSelection
- ✅ 30 comprehensive tests (77% accuracy)
- ✅ Support for 5 complexity levels: trivial, simple, medium, complex, enterprise

### ✅ BMAD Phase 1.5: WorkflowEngine Integration (Complete - Commit: 48afaf7)

**What's Done:**
- ✅ Adaptive workflow selection integrated into WorkflowEngine
- ✅ New method: `selectWorkflowAdaptively()` - natural language task → workflow selection
- ✅ New method: `execute()` - unified entry point supporting both ID and description
- ✅ Configuration support via ConfigManager
- ✅ Comprehensive test suite (277 lines)
- ✅ Fixed 20+ pre-existing TypeScript errors

**Features:**
- 🎯 Natural language task description → automatic workflow selection
- 📊 Detailed complexity analysis with confidence scoring
- 💡 Intelligent reasoning and alternative suggestions
- ⚙️ Configurable thresholds and behavior
- 🔄 Backward compatible with existing workflow execution

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

### Traditional Workflow Execution

```typescript
import {
  WorkflowEngine,
  AgentRegistry
} from '@ai1st/core'

// Initialize the orchestration system
const agentRegistry = new AgentRegistry()
const workflowEngine = new WorkflowEngine(agentRegistry)
await workflowEngine.initialize()

// Execute a workflow by ID (traditional)
const result = await workflowEngine.execute('feature-implementation')
```

### Adaptive Workflow Selection (NEW!)

```typescript
// Execute with natural language description - workflow selected automatically!
const result = await workflowEngine.execute(
  'Add user authentication with OAuth2 and JWT tokens',
  undefined,
  {
    projectSize: 'large',
    techStack: ['Node.js', 'PostgreSQL']
  }
)

// Get detailed workflow selection with reasoning
const selection = await workflowEngine.selectWorkflowAdaptively(
  'Fix memory leak in authentication service',
  { projectSize: 'medium' }
)

console.log('Selected workflow:', selection.workflow.name)
console.log('Complexity:', selection.complexity.level)
console.log('Confidence:', selection.confidence)
console.log('Reasoning:', selection.reasoning)
console.log('Recommended agents:', selection.complexity.recommendedAgents)

// Execute the selected workflow
const result = await workflowEngine.executeWorkflow(
  selection.workflow,
  { task: 'Fix memory leak' }
)
```

### Complexity Analysis

The system automatically analyzes task complexity based on:
- 📁 **Files Affected**: Number of files that need changes
- 🔗 **Dependencies**: External integrations and libraries
- ⚠️ **Risk Level**: Potential for breaking changes
- 🎓 **Domain Expertise**: Specialized knowledge required
- 📏 **Estimated LOC**: Lines of code to be modified
- 💾 **Data Changes**: Database schema modifications
- 🔒 **Security Impact**: Security implications
- ⚡ **Performance Impact**: Performance considerations

Complexity levels mapped to workflows:
- **Trivial** (0-20): Quick fixes, typos → `1-quick-flow`
- **Simple** (21-40): Bug fixes, small features → `1-quick-flow` or `2-feature-development`
- **Medium** (41-60): Standard features → `2-feature-development`
- **Complex** (61-80): Refactoring, security → `3-quality-assurance`
- **Enterprise** (81-100): Architecture, migrations → `3-quality-assurance`

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
- ✅ BMAD Phase 1: Complexity Analysis & Workflow Selection (Complete)
- ✅ BMAD Phase 1.5: WorkflowEngine Integration (Complete)
- 📋 BMAD Phase 2: Add 7 New Workflows (10 total) (Next)
- ⏳ BMAD Phase 3: Intelligent Help System
- ⏳ BMAD Phase 4: Party Mode (Multi-Agent Collaboration)
- ⏳ BMAD Phase 5: Add 5 New Agents (21 total)
- ⏳ BMAD Phase 6: Documentation & Examples
- ⏳ Phase 2: Demo Applications
- ⏳ Phase 3: Documentation Site
- ⏳ Phase 4: Visual Materials & Videos
- ⏳ Phase 5: Final Polish & Release
