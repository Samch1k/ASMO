# Release Notes

---

## v1.1.0 (Current) -- February 2026

### Highlights

This release focuses on observability, reliability, and system consolidation. Key improvements include phase detection metadata for debugging workflow behavior, resolution of PRD audit gaps, and significant reduction in system complexity through skill and workflow consolidation.

### Changes

**Observability & Phase Detection**
- Phase detection metadata is now recorded in workflow state, enabling full observability of how ASMO decides which phase to enter
- `phaseDetection` metadata captured in state for every workflow execution

**PRD Audit Gap Resolution (4 fixes)**
- Phase detection: adaptive phase joining now correctly handles all edge cases
- `--workflow` flag: manual workflow override works end-to-end from CLI to WorkflowEngine
- Race condition: concurrent workflow initialization no longer produces undefined state
- YOLO bypass: ApprovalCheckpoint correctly skips approval for low-complexity tasks (score < 30)

**WorkflowEngine Integration**
- IterationManager wired into WorkflowEngine for iterative refinement loops
- CircuitBreaker integrated with 5-failure threshold to prevent cascading agent failures
- ContextCascade ensures phase-to-phase data flow with no context loss
- YOLO score passed through to ApprovalCheckpoint for automatic bypass decisions
- MetricsOptimizer learning loop wired into `WorkflowEngine.initialize()`

**System Consolidation**
- Skills system consolidated from 85 to 55 skills (-35%), removing redundancies and merging overlapping capabilities
- TEA testing workflows consolidated from 8 to 3 workflows (-62%), with no loss of coverage
- Project artifacts and backup files cleaned up
- YAML dependency unified to `yaml` package only (removed duplicate `js-yaml`)

### Statistics

| Resource | Count |
|----------|-------|
| Agents | 25 (6 core + 15 specialized + 4 validation) |
| Workflows | 27 |
| Skills | 55 (across 12 categories) |
| Roles | 25 |

### Packages

- `@asmo/core` -- Core orchestration library
- `@asmo/cli` -- CLI interface (`asmo` command)

For the full changelog, see [CHANGELOG.md](../../../CHANGELOG.md).

---

## v1.0.0 -- January 2026

### Highlights

Initial release of ASMO with core orchestration capabilities.

**Core Features**
- Multi-agent task orchestration with automatic workflow selection
- 14-category keyword analysis for task classification
- Dual LLM provider: Session ($0 via Claude CLI) and API (pay-per-token)
- Heuristics fallback for offline operation
- YOLO mode for automatic approval of trivial tasks
- BMAD personality system with 4 modes
- Bilingual support (English and Russian) with Cyrillic auto-detection
- MCP integration with 8 servers
- Zod-based input validation with 10 security checks
- SQLite metrics persistence

**Architecture**
- Monorepo structure with `@asmo/core` and `@asmo/cli`
- BaseAgent class with `callLLM()`, `callLLMForJSON()`, `createResult()`, `createArtifact()`, `requestMCP()`
- Singleton factory pattern for service instances
- ConfigLoader for roles (JSON), skills (SKILL.md), workflows (JSON templates)
- `WorkflowEngine.create()` factory method
