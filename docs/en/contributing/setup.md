# Development Setup

Set up your development environment for ASMO.

## Prerequisites

- **Node.js**: 18.0 or higher
- **pnpm**: 8.0 or higher
- **Git**: Latest version
- **PostgreSQL**: 14+ (optional, for task persistence)

## Clone and Install

```bash
# Clone the repository
git clone https://github.com/Samch1k/ASMO.git
cd ASMO

# Install pnpm if needed
npm install -g pnpm

# Install dependencies
pnpm install
```

## Project Structure

```
ASMO/
├── packages/
│   ├── core/                # @asmo/core - Main library
│   │   ├── src/
│   │   │   ├── orchestration/  # Workflow engine, analyzers
│   │   │   ├── agents/         # Agent implementations
│   │   │   └── templates/      # Template engine
│   │   ├── templates/          # JSON configurations
│   │   └── tests/              # Unit tests
│   ├── cli/                 # @asmo/cli - CLI tool
│   └── docs/                # VitePress documentation
├── scripts/                 # Build and generation scripts
├── docs/                    # Documentation source
└── turbo.json              # Turbo build configuration
```

## Build Commands

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @asmo/core build

# Watch mode for development
pnpm --filter @asmo/core dev
```

## Environment Setup

Create a `.env` file:

```bash
# Database (optional)
DATABASE_URL=postgresql://localhost:5432/asmo

# LLM API key (optional for development)
ANTHROPIC_API_KEY=your-key

# Development settings
ASMO_LOG_LEVEL=debug
ASMO_YOLO_ENABLED=false
```

## Database Setup (Optional)

For testing task persistence:

```bash
# Create database
createdb asmo

# Run migrations
psql asmo < packages/core/migrations/095_add_task_master_tables.sql
```

## IDE Setup

### VS Code

Recommended extensions:

- ESLint
- Prettier
- TypeScript and JavaScript Language Features

Settings:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

### WebStorm

Enable:

- ESLint integration
- Prettier integration
- TypeScript service

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test -- --watch

# Run specific test file
pnpm --filter @asmo/core test complexity-analyzer.test.ts

# Coverage report
pnpm test -- --coverage
```

## Documentation Development

```bash
# Generate documentation from JSON
pnpm docs:generate

# Start documentation dev server
pnpm docs:dev

# Build documentation
pnpm docs:build
```

## Common Tasks

### Adding a New Agent

1. Create JSON definition in `templates/roles/`
2. Implement agent class in `src/agents/roles/`
3. Export from `src/agents/index.ts`
4. Add tests in `tests/agents/`
5. Regenerate docs: `pnpm docs:generate`

### Adding a New Workflow

1. Create JSON definition in `templates/workflows/{category}/`
2. Add to workflow loading in `src/orchestration/workflow-engine.ts`
3. Add tests in `tests/orchestration/`
4. Regenerate docs: `pnpm docs:generate`

### Adding a New Skill

1. Add to `templates/skills/skills-catalog.json`
2. Update skill matcher if needed
3. Add tests
4. Regenerate docs: `pnpm docs:generate`

## Troubleshooting

### pnpm install fails

```bash
# Clear cache and reinstall
pnpm store prune
rm -rf node_modules
pnpm install
```

### Build errors

```bash
# Clean build artifacts
pnpm clean
pnpm build
```

### Tests failing

```bash
# Run with verbose output
pnpm test -- --verbose

# Run single test
pnpm test -- --grep "specific test name"
```

## Next Steps

- [Coding Standards](./coding-standards.md)
- [Testing](./testing.md)
