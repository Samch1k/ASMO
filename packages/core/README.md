# @ai1st/core

The core orchestration engine for AI1st autonomous development teams.

## Features

- 🤖 **Multi-Agent System**: Coordinate multiple AI agents working together
- 🔄 **Workflow Engine**: Define and execute complex development workflows
- ⚙️ **Configuration System**: 3-tier configuration (defaults → file → environment)
- 📝 **Instruction Manager**: Markdown-based agent guidance with priority system
- ✅ **Quality Gates**: Automatic approval checkpoints and validation
- 📊 **Metrics & Learning**: Built-in performance tracking and optimization

## Installation

```bash
npm install @ai1st/core
# or
pnpm add @ai1st/core
# or
yarn add @ai1st/core
```

## Quick Start

```typescript
import { WorkflowEngine } from '@ai1st/core'

// Initialize the orchestration engine
const engine = new WorkflowEngine()
await engine.initialize()

// Run a workflow
const result = await engine.execute({
  workflowId: 'feature_implementation',
  task: 'Add user authentication',
})

console.log('Workflow completed:', result)
```

## Documentation

Full documentation coming soon!

## License

MIT © 2026 AI1st Contributors
