# Risks and Assumptions

## Risk Register

| # | Risk | Probability | Impact | Mitigation |
|---|------|-------------|--------|------------|
| R1 | LLM API unavailability | Medium | High | Dual LLM strategy with three-mode fallback: Session -> API -> Heuristics. System remains functional (at reduced accuracy) even when all LLM providers are down. |
| R2 | Session CLI deprecation | Low | Medium | `AnthropicProvider` (API mode) is fully implemented and tested as a standalone fallback. Migration requires only a configuration change, no code changes. |
| R3 | MCP server failures | Medium | Medium | Priority-based activation (P0/P1/P2) with graceful degradation. Non-critical MCP failures do not abort workflows. P0 failures are isolated per-agent. |
| R4 | Workflow complexity explosion | High | High | `LearningLoop` and `MetricsOptimizer` continuously tune workflow selection. Metrics-driven feedback prevents selection of consistently underperforming workflows. |
| R5 | Test coverage degradation | Medium | High | CI/CD pipeline enforces minimum 80% code coverage. Jest runs on every commit. Coverage reports are tracked per package. |
| R6 | Configuration drift between tiers | Medium | Low | 3-tier cascade with explicit precedence (project > user > bundled). `ConfigLoader` validates merged configuration against Zod schemas before use. |
| R7 | Agent infinite loops | Low | High | `CircuitBreaker` trips after 5 consecutive failures. `IterationManager` enforces maximum retry counts with exponential backoff. Per-phase timeouts provide a hard stop. |
| R8 | Token budget exhaustion | Medium | Medium | Model routing by complexity (Haiku for trivial, Sonnet for medium, Opus for complex). Session mode ($0) as default. Configurable per-request and per-workflow token limits. |
| R9 | MCP protocol breaking changes | Low | Medium | MCP access is abstracted through the `requestMCP()` interface on `BaseAgent`. Protocol changes require updates only in the MCP bridge layer, not in individual agents. |
| R10 | Singleton state leaks in tests | Medium | Low | Every singleton factory exposes a `resetX()` function. `tests/setup.ts` resets all singletons before each test suite. Jest runs with `--detectOpenHandles`. |

## Assumptions

| # | Assumption | Rationale | Fallback if Invalid |
|---|-----------|-----------|---------------------|
| A1 | Users have Node.js >= 18 installed | Required for ESM support and modern APIs used by tsup and turbo. | Documented in prerequisites; CLI exits with a clear error on older versions. |
| A2 | Claude CLI is available for Session mode | Primary $0 LLM provider. Most Claude Code users already have it. | Automatic fallback to API mode (requires `ANTHROPIC_API_KEY`). |
| A3 | TypeScript ecosystem remains stable | Build toolchain (tsup, turbo) and runtime depend on TypeScript stability. | Package versions are pinned in `pnpm-lock.yaml`. |
| A4 | MCP protocol maintains backward compatibility | 8 MCP server integrations depend on stable protocol. | MCP bridge layer abstracts protocol details; only bridge needs updating. |
| A5 | Anthropic API maintains current pricing model | Model routing strategy assumes Haiku < Sonnet < Opus pricing tiers. | Routing thresholds are configurable and can be adjusted. |
| A6 | Users are comfortable with CLI interfaces | ASMO is CLI-first by design. | `asmo suggest` provides JSON output for potential GUI integration. |
| A7 | English and Russian cover the target user base | Documentation is provided in both languages. | Internationalization structure supports adding new language directories. |
| A8 | SQLite is sufficient for local metrics storage | Metrics volume is bounded by workflow execution frequency. | `MetricsPersister` interface can be reimplemented for other backends. |
| A9 | Single-machine execution is the primary use case | No distributed orchestration or multi-machine coordination. | Architecture supports future extraction of workflow engine as a service. |

## External Dependencies

### Runtime Dependencies

| Package | Purpose | Risk Level |
|---------|---------|------------|
| `anthropic` | Anthropic SDK for API mode | Low -- maintained by Anthropic |
| `zod` | Schema validation for all inputs and configurations | Low -- widely adopted, stable API |
| `commander` | CLI framework for argument parsing | Low -- mature, minimal API surface |
| `lru-cache` | In-memory caching for config and LLM responses | Low -- single-purpose, stable |
| `yaml` | YAML parsing for workflow templates | Low -- unified from previous `js-yaml` duplicate |

### Build Dependencies

| Package | Purpose | Risk Level |
|---------|---------|------------|
| `pnpm` | Workspace and dependency management | Low -- industry standard |
| `turbo` | Parallel build task execution | Low -- maintained by Vercel |
| `tsup` | TypeScript bundling to ESM/CJS | Low -- built on esbuild |
| `jest` | Test framework with coverage reporting | Low -- widely adopted |
| `typescript` | Type checking and compilation | Low -- Microsoft-maintained |

## Monitoring and Mitigation Status

| Risk | Current Status | Next Action |
|------|---------------|-------------|
| R1 (LLM unavailability) | Mitigated | Three-mode fallback implemented and tested |
| R4 (Complexity explosion) | Mitigated | LearningLoop wired into WorkflowEngine.initialize() |
| R5 (Test coverage) | Active | Coverage at target; CI enforcement in place |
| R7 (Infinite loops) | Mitigated | CircuitBreaker + IterationManager operational |
| R8 (Token budget) | Partially mitigated | Model routing active; per-workflow limits pending |

## Related Documents

- [Architecture Overview](./README.md)
- [Security and Privacy](./security-privacy.md)
- [Integration Map](./integration-map.md)
