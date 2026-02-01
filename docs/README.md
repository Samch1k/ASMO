# AI1st Documentation

> Transform AI from "helpful assistant" to "autonomous team"

Welcome to the AI1st Framework documentation. AI1st is an autonomous AI development orchestration system that coordinates multiple AI agents to work together as a cohesive team.

## Quick Links

| English | Русский |
|---------|---------|
| [Getting Started](./en/getting-started/index.md) | [Начало работы](./ru/getting-started/index.md) |
| [Concepts](./en/concepts/index.md) | [Концепции](./ru/concepts/index.md) |
| [Guides](./en/guides/index.md) | [Руководства](./ru/guides/index.md) |
| [Reference](./en/reference/index.md) | [Справочник](./ru/reference/index.md) |

## What's Inside

- **24 Agents** - From Architect to Security Specialist
- **10 Workflows** - From quick bug fixes to enterprise architecture
- **85 Skills** - Comprehensive development skill coverage
- **Adaptive Selection** - Automatic workflow selection based on task complexity

## Installation

```bash
npm install @ai1st/core
# or
pnpm add @ai1st/core
```

## Quick Example

```typescript
import { WorkflowEngine, AgentRegistry } from '@ai1st/core'

const registry = new AgentRegistry()
const engine = new WorkflowEngine(registry)
await engine.initialize()

// Adaptive workflow selection based on task description
const result = await engine.execute(
  'Add user authentication with OAuth2',
  undefined,
  { projectSize: 'large' }
)
```

## Documentation Structure

```
docs/
├── en/                     # English documentation
│   ├── getting-started/    # Installation & quick start
│   ├── concepts/           # Core concepts
│   ├── guides/             # How-to guides
│   ├── reference/          # API & catalog reference
│   │   ├── agents/         # 24 agent docs
│   │   ├── workflows/      # 10 workflow docs
│   │   └── skills/         # 85 skill docs
│   └── examples/           # Code examples
├── ru/                     # Russian documentation (mirror)
├── assets/                 # Images & diagrams
└── internal/               # Internal reports
```

## Contributing

See [Contributing Guide](./en/contributing/index.md) for information on how to contribute to this documentation.

## License

MIT © 2026 AI1st Contributors
