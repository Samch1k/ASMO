# Integration Map

## MCP Servers

ASMO integrates with 8 MCP (Model Context Protocol) servers, organized by activation priority. Agents access MCP servers through the `requestMCP()` method on `BaseAgent`.

| Priority | Server | Purpose | Primary Consumers |
|----------|--------|---------|--------------------|
| P0 | memory | Knowledge graph storage | All agents |
| P0 | supabase | Database integration | Data Architect, Developer |
| P0 | filesystem | File I/O operations | All agents |
| P1 | context7 | Library documentation lookup | Developer, Architect |
| P1 | github | Repository management | DevOps, Code Reviewer |
| P1 | playwright | Browser automation (E2E testing) | Tester, UI Developer |
| P2 | render | Backend deployment and logs | DevOps |
| P2 | vercel | Frontend deployment and logs | DevOps |

**Priority levels:**

- **P0 -- Always active.** Loaded at startup. Required for core functionality.
- **P1 -- On demand.** Activated when a workflow phase requires them.
- **P2 -- Optional.** Activated only for deployment-related workflows. Graceful degradation if unavailable.

### MCP Access Pattern

```typescript
// Inside an agent implementation
const files = await this.requestMCP('filesystem', 'readDirectory', { path: './src' })
const docs = await this.requestMCP('context7', 'getLibraryDocs', { library: 'react' })
```

Role-based restrictions ensure agents can only access MCP servers relevant to their role definition.

## LLM Providers

ASMO supports three LLM provider modes with automatic fallback.

| Mode | Provider | Cost | Activation |
|------|----------|------|------------|
| Session | Claude CLI (`claude -p`) | $0 | Default (requires authenticated CLI) |
| API | Anthropic SDK (`anthropic`) | Pay-per-token | `--use-api` flag or Session unavailable |
| Heuristics | Keyword analysis engine | $0 | `--no-llm` flag or both providers unavailable |

### Fallback Chain

```
Session ($0) ──fail──▶ API (pay-per-token) ──fail──▶ Heuristics ($0, ~65% accuracy)
```

Session mode is always attempted first unless explicitly overridden. If the Claude CLI is not installed or not authenticated, ASMO falls back to the API provider (requires `ANTHROPIC_API_KEY` in environment). If neither is available, keyword-based heuristics provide offline functionality with reduced accuracy.

### Model Routing by Complexity

The LLM provider routes requests to different Claude models based on the task complexity score.

| Complexity Score | Model | Use Case |
|------------------|-------|----------|
| 0--30 (trivial/simple) | Haiku | Fast, low-cost operations |
| 31--70 (medium/complex) | Sonnet | Balanced quality and cost |
| 71--100 (complex/enterprise) | Opus | Maximum reasoning capability |

This routing applies to both Session and API modes. The model selection is automatic and based on the `ComplexityScore` produced during task analysis.

## Claude Code Integration

ASMO integrates with Claude Code through three mechanisms:

### CLAUDE.md

The project `CLAUDE.md` file provides Claude Code with:

- System overview and resource counts
- Available commands and workflows
- When to use ASMO vs. handling directly
- Environment configuration details

### Hook Integration

ASMO registers a hook that runs `asmo suggest` when Claude Code processes a task. The hook output recommends whether to use ASMO orchestration or handle the task directly.

```bash
# Hook invocation (automatic)
asmo suggest "<detected task>"
# Returns JSON: { useAsmo: true/false, confidence, workflow, ... }
```

### Configuration Directory

ASMO reads project-level configuration from `.cursor/config` when available, enabling per-project customization of workflows, agent assignments, and skill mappings.

## Configuration Fallback Chain

Configuration values resolve through three tiers, with earlier tiers taking precedence.

```
.cursor/config (project)
    │
    ▼ fallback
~/.asmo/config (user)
    │
    ▼ fallback
bundled templates (package defaults)
```

### Configuration Sources

| Source | Path | Scope | Contents |
|--------|------|-------|----------|
| Project | `.cursor/config/` | Per-project | Workflow overrides, agent config, skill mappings |
| User | `~/.asmo/config/` | Per-user | Default preferences, API keys reference, custom roles |
| Bundled | `packages/core/templates/` | System | 27 workflow templates, 25 role definitions, 55 skill files |

## Build and Development Integration

| Tool | Purpose | Configuration |
|------|---------|---------------|
| pnpm | Workspace and dependency management | `pnpm-workspace.yaml` |
| turbo | Parallel task execution (build, test, lint) | `turbo.json` |
| tsup | TypeScript bundling | `tsup.config.ts` per package |
| Jest | Unit and integration testing | `jest.config.ts`, `tests/setup.ts` |

### Build Commands

```bash
pnpm build        # Build all packages (turbo)
pnpm test         # Run all tests (jest)
pnpm lint         # Lint all packages
pnpm typecheck    # TypeScript type checking
```

## Related Documents

- [Architecture Overview](./README.md)
- [Architecture Diagram](./architecture-diagram.md)
- [Security and Privacy](./security-privacy.md)
- [API Contract](./api-contract.md)
