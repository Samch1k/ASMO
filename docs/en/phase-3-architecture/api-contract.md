# API Contract

## CLI Commands

ASMO exposes its functionality through the `asmo` CLI (package: `@asmo/cli`, entry point: `packages/cli/bin/asmo.js`).

### asmo run

Execute a task with automatic workflow selection.

```bash
asmo run "<task>"                    # Default: Session mode
asmo run "<task>" --use-api          # Force API mode
asmo run "<task>" --no-llm           # Heuristics only (offline)
asmo run "<task>" --verbose          # Detailed logging
asmo run "<task>" --dry-run          # Analysis only, no execution
asmo run "<task>" --workflow <name>  # Override workflow selection
```

**Output:** Progress indicators during execution, followed by a final result summary including status, agents used, duration, and artifacts produced.

### asmo suggest

Get a workflow recommendation without executing.

```bash
asmo suggest "<task>"
```

**Output (JSON):**

```json
{
  "useAsmo": true,
  "confidence": 0.85,
  "workflow": "bug_fix_workflow",
  "agents": ["debugger", "developer", "tester"],
  "complexity": {
    "score": 42,
    "level": "medium"
  },
  "reasoning": "Task involves debugging and fixing across multiple files"
}
```

### asmo analyze

Perform complexity analysis only.

```bash
asmo analyze "<task>"
asmo analyze "<task>" --json         # Machine-readable output
```

**Output:** Complexity score (0--100), level, factors breakdown, recommended workflow, and recommended agents.

### asmo workflow

List or execute a specific workflow.

```bash
asmo workflow                        # List all 27 workflows
asmo workflow <name>                 # Show workflow details
asmo workflow <name> --task "<task>" # Execute specific workflow
```

### asmo task

Task management commands.

```bash
asmo task list                       # List tracked tasks
asmo task status <id>                # Check task status
```

## Programmatic API (@asmo/core)

### WorkflowEngine

The primary orchestration entry point. Use `WorkflowEngine.create()` as the recommended factory method.

```typescript
import { WorkflowEngine } from '@asmo/core'

// Create and initialize
const engine = WorkflowEngine.create(registry)
await engine.initialize()

// Execute a task with automatic workflow selection
const result = await engine.execute(task, initialState?, context?)

// Select workflow adaptively (without executing)
const workflow = await engine.selectWorkflowAdaptively(task, context?, preference?)

// Execute in party mode (multi-agent collaboration)
const partyResult = await engine.executePartyMode(
  topic,
  agents,
  moderator?,
  options?
)
```

### ComplexityAnalyzer

Scores task complexity on a 0--100 scale.

```typescript
import { ComplexityAnalyzer } from '@asmo/core'

const analyzer = new ComplexityAnalyzer()
const score = await analyzer.analyzeTask(task, context?)

// score: { score: 42, level: 'medium', confidence: 0.85, ... }
```

### DynamicOrchestrator

Low-level orchestration with routing preview.

```typescript
import { getDynamicOrchestrator } from '@asmo/core'

const orchestrator = getDynamicOrchestrator(options?)

// Preview routing without execution
const preview = orchestrator.previewRouting(task)

// Execute with full orchestration
const result = await orchestrator.executeTask(task)
```

### ExecutorFactory

Direct agent execution without workflow overhead.

```typescript
import { getExecutorFactory } from '@asmo/core'

const factory = getExecutorFactory(options?)
const result = await factory.execute({
  taskId: 'task-123',
  prompt: 'Fix the null pointer in UserService',
  state: {},
  model: 'sonnet'
})
```

### LLM Provider

Access the LLM abstraction layer directly.

```typescript
import { getLLMProvider } from '@asmo/core'

const provider = getLLMProvider()

// Simple completion
const response = await provider.complete(prompt, options?)

// JSON-structured response
const json = await provider.completeJSON(prompt, schema, options?)
```

## CLI Flags Reference

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--use-api` | boolean | `false` | Force Anthropic API mode (requires `ANTHROPIC_API_KEY`) |
| `--no-llm` | boolean | `false` | Disable LLM, use keyword heuristics only |
| `--verbose` | boolean | `false` | Enable detailed logging output |
| `--dry-run` | boolean | `false` | Analyze and plan without executing |
| `--workflow` | string | auto | Override automatic workflow selection |
| `--json` | boolean | `false` | Output in JSON format (where supported) |

## Error Handling

All CLI commands return structured errors:

| Exit Code | Meaning |
|-----------|---------|
| 0 | Success |
| 1 | Execution failure (agent or workflow error) |
| 2 | Invalid input (validation failure) |
| 3 | Configuration error (missing config, bad template) |
| 4 | LLM provider unavailable (all modes failed) |

## Related Documents

- [Architecture Overview](./README.md)
- [Data Model](./data-model.md)
- [Integration Map](./integration-map.md)
