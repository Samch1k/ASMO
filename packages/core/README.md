# @ai1st/core

The core orchestration engine for AI1st autonomous development teams.

## Features

- 🤖 **Multi-Agent System**: Coordinate multiple AI agents working together
- 🔄 **Workflow Engine**: Define and execute complex development workflows
- 🎯 **Adaptive Workflow Selection**: Automatically choose workflows based on task complexity
- 📊 **Complexity Analysis**: Intelligent task analysis with 5 complexity levels
- 📋 **10 Production-Ready Workflows**: From bug fixes to architecture design (NEW!)
- ⚙️ **Configuration System**: 3-tier configuration (defaults → file → environment)
- 📝 **Instruction Manager**: Markdown-based agent guidance with priority system
- ✅ **Quality Gates**: Automatic approval checkpoints and validation
- 📈 **Metrics & Learning**: Built-in performance tracking and optimization
- 🔄 **Parallel Execution**: Run multiple agents simultaneously
- 🎓 **Skill-Based Matching**: 85 skills with dependency resolution

## Installation

```bash
npm install @ai1st/core
# or
pnpm add @ai1st/core
# or
yarn add @ai1st/core
```

## Quick Start

### Traditional Workflow Execution

```typescript
import { WorkflowEngine, AgentRegistry } from '@ai1st/core'

// Initialize the orchestration engine
const registry = new AgentRegistry()
const engine = new WorkflowEngine(registry)
await engine.initialize()

// Execute workflow by ID
const result = await engine.execute('bug_fix_workflow')
console.log('Workflow completed:', result.success)
```

### Adaptive Workflow Selection (BMAD Phase 1.5)

```typescript
// Let the system choose the right workflow for you!
const result = await engine.execute(
  'Add user authentication with OAuth2',
  undefined,
  { projectSize: 'medium', techStack: ['Node.js'] }
)

// See detailed workflow selection reasoning
const selection = await engine.selectWorkflowAdaptively(
  'Fix memory leak in user session management'
)

console.log('Selected:', selection.workflow.name)
console.log('Complexity:', selection.complexity.level) // e.g., "simple"
console.log('Confidence:', selection.confidence)        // e.g., 0.85
console.log('Reasoning:', selection.reasoning)
console.log('Agents:', selection.complexity.recommendedAgents)
```

### Complexity Levels

The system analyzes tasks and assigns complexity levels:

- **Trivial** (0-20): Typos, text changes → Quick fixes
- **Simple** (21-40): Bug fixes, small features → Fast workflows
- **Medium** (41-60): Standard features → Feature development workflow
- **Complex** (61-80): Refactoring, security → Quality assurance workflow
- **Enterprise** (81-100): Architecture, migrations → Full QA with extensive testing

## API Reference

### WorkflowEngine

#### `selectWorkflowAdaptively(taskDescription, context?, userPreference?)`

Analyzes task complexity and recommends appropriate workflow.

**Parameters:**
- `taskDescription` (string): Natural language task description
- `context` (ProjectContext, optional): Project information for better analysis
  - `projectSize`: 'small' | 'medium' | 'large' | 'enterprise'
  - `techStack`: string[] - Technologies used
  - `projectPath`: string - Project directory
  - `files`: string[] - Relevant files
- `userPreference` (string, optional): Override workflow ID

**Returns:** `Promise<WorkflowSelection>`
- `workflow`: Selected workflow object
- `complexity`: Detailed complexity analysis
  - `score`: 0-100 complexity score
  - `level`: 'trivial' | 'simple' | 'medium' | 'complex' | 'enterprise'
  - `confidence`: 0.0-1.0 confidence score
  - `reasoning`: Explanation of complexity assessment
  - `factors`: Detailed complexity factors
  - `recommendedAgents`: Suggested agents for the task
- `confidence`: Selection confidence (0.0-1.0)
- `reasoning`: Why this workflow was chosen
- `alternatives`: Alternative workflows if confidence is low

**Example:**
```typescript
const selection = await engine.selectWorkflowAdaptively(
  'Add shopping cart with payment integration',
  {
    projectSize: 'large',
    techStack: ['React', 'Node.js', 'PostgreSQL']
  }
)
```

#### `execute(workflowIdOrDescription, initialState?, context?)`

Unified method for workflow execution. Supports both workflow ID and natural language description.

**Parameters:**
- `workflowIdOrDescription` (string): Workflow ID OR task description
- `initialState` (Partial<AgentState>, optional): Initial execution state
- `context` (ProjectContext, optional): Project context for adaptive selection

**Returns:** `Promise<WorkflowExecutionResult>`

**Examples:**
```typescript
// By ID (traditional)
await engine.execute('bug_fix_workflow')

// By description (adaptive)
await engine.execute('Fix authentication bug in login')

// With context
await engine.execute(
  'Implement real-time notifications',
  undefined,
  { projectSize: 'medium' }
)
```

### ComplexityAnalyzer

Analyzes task complexity using heuristic-based rules (placeholder for LLM integration).

**Factors Analyzed:**
- Files Affected (1-10+)
- Dependencies (0-6+)
- Risk Level (low/medium/high)
- Domain Expertise Required (boolean)
- Estimated LOC (5-1000+)
- Data Changes (boolean)
- Security Impact (boolean)
- Performance Impact (boolean)

### WorkflowSelector

Selects appropriate workflow based on complexity analysis.

**Configuration:**
- `autoSelect`: Enable automatic selection (default: true)
- `confidenceThreshold`: Minimum confidence for auto-selection (default: 0.7)
- `maxAlternatives`: Maximum alternative suggestions (default: 2)

## Configuration

Configure adaptive selection in your orchestration config:

```typescript
// orchestration.config.ts
export default {
  complexityAnalyzer: {
    model: 'claude-sonnet-3-5',
    temperature: 0.2,
    maxTokens: 2000,
    thresholds: {
      trivial: 20,
      simple: 40,
      medium: 60,
      complex: 80,
      enterprise: 100
    }
  },
  workflowSelector: {
    autoSelect: true,
    confidenceThreshold: 0.7,
    maxAlternatives: 2
  }
}
```

## Available Workflows

AI1st includes **10 production-ready workflows**:

1. **Quick Flow** - Fast bug fixes and simple tasks
2. **Feature Development** - Complete feature implementation with gates
3. **Quality Assurance** - Comprehensive testing workflows
4. **Advanced Bug Fix** - Deep bug resolution with root cause analysis
5. **Code Refactoring** - Systematic code quality improvement
6. **Performance Optimization** - Performance analysis and tuning
7. **Security Audit** - Security assessment and vulnerability mitigation
8. **Architecture Design** - System architecture design and documentation
9. **Database Migration** - Safe database schema changes and data migration
10. **API Design** - REST/GraphQL API contract design with best practices

Each workflow includes:
- JSON definition with steps, agents, and deliverables
- Comprehensive checklist for execution
- Clear exit criteria and timeouts
- Complexity range mapping

## Documentation

Full documentation site coming in Phase 3!

## License

MIT © 2026 AI1st Contributors
