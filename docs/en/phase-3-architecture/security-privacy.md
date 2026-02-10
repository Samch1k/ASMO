# Security and Privacy

## Input Validation

All user input is validated before entering the orchestration pipeline. ASMO performs 10 validation checks on every task prompt.

| # | Check | Action |
|---|-------|--------|
| 1 | Empty/null check | Reject with descriptive error |
| 2 | Length limits | Enforce 3--10,000 character range |
| 3 | UTF-8 encoding validation | Reject invalid byte sequences |
| 4 | Control character removal | Strip characters that could affect terminal rendering |
| 5 | Whitespace normalization | Collapse excessive whitespace, trim edges |
| 6 | Null byte sanitization | Remove null bytes that could truncate strings |
| 7 | Prompt injection mitigation | Detect and neutralize common injection patterns |
| 8 | Zod schema validation | Validate all structured inputs against Zod schemas |
| 9 | MCP access role-based restrictions | Ensure agents only access permitted MCP servers |
| 10 | API key isolation | Verify keys are sourced from environment variables only |

Validation is applied at the CLI entry point before any LLM calls or workflow execution begins.

## LLM Cost Control

ASMO implements multiple safeguards to prevent excessive LLM usage and cost.

### Session-First Strategy

Session mode (Claude CLI) is the default provider at $0 cost. API mode is used only as a fallback or when explicitly requested via `--use-api`.

### Model Routing by Complexity

Tasks are routed to the appropriate model tier based on complexity score, ensuring expensive models are reserved for tasks that need them.

| Complexity | Model | Rationale |
|------------|-------|-----------|
| 0--30 | Haiku | Trivial/simple tasks need fast, cheap responses |
| 31--70 | Sonnet | Balanced quality for medium/complex tasks |
| 71--100 | Opus | Full reasoning power for enterprise-grade tasks |

### Circuit Breaker

The `CircuitBreaker` component monitors consecutive agent failures. After 5 consecutive failures in an execution path, the circuit trips and halts further LLM calls for that path. This prevents:

- Runaway API costs from repeated failing requests
- Infinite retry loops on persistent errors
- Wasted compute on unrecoverable failures

The circuit resets after a configurable cool-down period.

### Configurable Limits

- **Max retries per agent step:** Configurable via `IterationManager`
- **Timeouts:** Per-request and per-phase timeouts prevent hanging operations
- **Backoff strategy:** Exponential backoff between retries reduces load on providers

## Data Handling

### No Persistent Code Storage

ASMO does not persistently store user source code. Code is processed in memory during workflow execution and discarded when the workflow completes. Only metadata (metrics, task status, complexity scores) is persisted.

### Local-Only Metrics

Execution metrics are stored in a local SQLite database managed by `MetricsPersister`. This data never leaves the user's machine.

### No Telemetry

ASMO does not collect or transmit any telemetry, usage analytics, or crash reports. All data remains local.

### API Key Management

- API keys are read exclusively from environment variables (`ANTHROPIC_API_KEY`)
- Keys are never written to configuration files, logs, or metrics databases
- The `.env` file is included in `.gitignore` by default
- No API keys are embedded in source code or bundled templates

### Log Sanitization

- Sensitive data (API keys, tokens, credentials) is never included in log output
- Verbose mode (`--verbose`) outputs operational details but not secret values
- Error messages are sanitized before display

## MCP Security

### Role-Based Access

Each agent's role definition specifies which MCP servers it can access. An agent cannot call an MCP server that is not listed in its role's allowed servers.

```
Agent (role: developer) → allowed: [filesystem, context7, github]
Agent (role: tester)    → allowed: [filesystem, playwright]
Agent (role: devops)    → allowed: [filesystem, github, render, vercel]
```

### Priority-Based Activation

MCP servers are activated based on priority level:

- **P0 servers** (memory, supabase, filesystem) are always loaded
- **P1 servers** (context7, github, playwright) are activated on demand when a workflow phase requires them
- **P2 servers** (render, vercel) are activated only for deployment workflows

### Graceful Degradation

If an MCP server is unavailable, ASMO degrades gracefully:

- The agent logs a warning and continues without the unavailable tool
- Workflow execution is not aborted for non-critical MCP failures
- P0 failures may cause workflow failure if the missing capability is essential

## Related Documents

- [Architecture Overview](./README.md)
- [Integration Map](./integration-map.md)
- [Risks and Assumptions](./risks-assumptions.md)
