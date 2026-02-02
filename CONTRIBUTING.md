# Contributing to ASMO

Thank you for your interest in contributing to ASMO! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the maintainers.

## Getting Started

### Types of Contributions

We welcome the following types of contributions:

- **Bug Reports** — Found a bug? Open an issue with reproduction steps
- **Feature Requests** — Have an idea? Start a discussion first
- **Documentation** — Improve guides, fix typos, add examples
- **Tests** — Increase coverage, add edge case tests
- **Code** — Bug fixes, new features, improvements

### Before You Start

1. Check [existing issues](https://github.com/Samch1k/ASMO/issues) for similar reports
2. For features, open a [discussion](https://github.com/Samch1k/ASMO/discussions) first
3. Wait for approval before starting large changes

## Development Setup

### Prerequisites

- Node.js 18+
- pnpm 8+
- Git 2.30+
- PostgreSQL 14+ (optional, for integration tests)

### Setup Steps

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/ASMO.git
cd ASMO

# 3. Add upstream remote
git remote add upstream https://github.com/Samch1k/ASMO.git

# 4. Install dependencies
pnpm install

# 5. Set up environment
cp .env.example .env

# 6. Build the project
pnpm build

# 7. Run tests
pnpm test
```

## Making Changes

### Branch Naming

```bash
# Feature branches
git checkout -b feature/add-new-agent

# Bug fix branches
git checkout -b fix/workflow-timeout

# Documentation branches
git checkout -b docs/update-readme

# Test branches
git checkout -b test/agent-coverage
```

### Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting, no code change |
| `refactor` | Code refactoring |
| `test` | Adding tests |
| `chore` | Maintenance |

**Examples:**

```bash
feat(engine): add adaptive workflow selection
fix(agents): resolve timeout issue in party mode
docs(readme): update installation instructions
test(core): add unit tests for complexity analyzer
```

### Keeping Up to Date

```bash
# Fetch latest changes
git fetch upstream

# Rebase your branch
git checkout your-branch
git rebase upstream/main
```

## Pull Request Process

### Before Submitting

Run all checks locally:

```bash
pnpm lint        # Check linting
pnpm typecheck   # Check TypeScript
pnpm test        # Run tests
pnpm build       # Build project
```

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Tests added for new functionality
- [ ] Documentation updated if needed
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] PR title follows Conventional Commits format

### PR Template

```markdown
## Summary

Brief description of changes.

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Documentation
- [ ] Other

## Testing

Describe how to test the changes.

## Screenshots (if applicable)
```

### Review Process

1. **Automated Checks** — CI runs lint, typecheck, and tests
2. **Code Review** — Maintainer reviews the code
3. **Changes Requested** — Address feedback if any
4. **Approval & Merge** — PR is merged after approval

## Coding Standards

### TypeScript

```typescript
// Use explicit types for public APIs
export function execute(task: string): Promise<Result>

// Use interfaces for objects
interface AgentConfig {
  id: string
  name: string
}

// Handle errors properly
try {
  await execute()
} catch (error) {
  if (error instanceof WorkflowError) {
    // handle
  }
  throw error
}

// Avoid any
function process(data: any) // Bad
function process(data: unknown) // Better
```

### File Structure

```typescript
// 1. External imports
import { z } from 'zod'

// 2. Internal package imports
import { AgentRegistry } from '@asmo/core'

// 3. Relative imports
import { validateConfig } from './utils'
import type { Config } from './types'
```

### Naming Conventions

| Element | Style | Example |
|---------|-------|---------|
| Classes | PascalCase | `WorkflowEngine` |
| Functions | camelCase | `executeWorkflow` |
| Constants | UPPER_SNAKE | `DEFAULT_TIMEOUT` |
| Files | kebab-case | `workflow-engine.ts` |

## Testing

### Running Tests

```bash
# All tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage

# Specific file
pnpm test workflow-engine.test.ts
```

### Writing Tests

```typescript
describe('WorkflowEngine', () => {
  let engine: WorkflowEngine

  beforeEach(() => {
    engine = new WorkflowEngine()
  })

  describe('execute', () => {
    it('should complete simple task successfully', async () => {
      const result = await engine.execute('Fix typo')
      expect(result.status).toBe('completed')
    })

    it('should throw error for empty task', async () => {
      await expect(engine.execute('')).rejects.toThrow()
    })
  })
})
```

### Test Coverage

- Aim for 80%+ coverage on critical paths
- Write tests for edge cases
- Include both unit and integration tests

## Documentation

### When to Update Docs

- Adding new features
- Changing existing behavior
- Adding new configuration options
- Deprecating functionality

### Documentation Structure

```
docs/
├── en/                 # English documentation
│   ├── getting-started/
│   ├── concepts/
│   ├── guides/
│   ├── reference/
│   └── examples/
└── ru/                 # Russian documentation (mirror)
```

### Generating Docs

```bash
# Generate agent/workflow/skill catalogs
pnpm docs:generate

# Preview documentation
pnpm docs:dev
```

## Questions?

- Open an [issue](https://github.com/Samch1k/ASMO/issues) for bugs
- Start a [discussion](https://github.com/Samch1k/ASMO/discussions) for questions
- Read the [documentation](./docs/en/getting-started/index.md)

Thank you for contributing to ASMO!
