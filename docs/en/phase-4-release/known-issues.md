# Known Issues & Limitations

Current limitations and planned improvements for ASMO v1.1.0.

---

## Current Limitations

### 1. Heuristics accuracy is ~65%

The keyword-based fallback mode (`--no-llm`) achieves approximately 65% accuracy for task classification and workflow selection. It can misclassify borderline tasks, particularly when bug fix keywords ("fix", "error") appear alongside feature keywords ("add", "implement").

**Workaround:** Use Session or API mode for accurate classification. If heuristics mode is required, verify the suggested workflow with `asmo suggest` before executing.

### 2. Session mode requires Claude CLI

The default Session mode ($0 cost) requires the Claude CLI to be installed and authenticated. If Claude CLI is unavailable, ASMO falls back to API mode, which requires `ANTHROPIC_API_KEY` and incurs per-token costs.

**Workaround:** Install Claude CLI (`brew install anthropic/claude/claude` on macOS) and run `claude auth login`. Alternatively, set `ANTHROPIC_API_KEY` in `.env` for API mode.

### 3. No Web UI

ASMO is currently CLI-only. There is no web-based interface for monitoring workflow progress, reviewing agent outputs, or managing configurations.

**Workaround:** Use `--verbose` for detailed terminal output. Metrics are stored in SQLite and can be queried directly.

### 4. Single LLM vendor

ASMO currently supports Anthropic models only (Claude via CLI or API). There is no integration with OpenAI, Google Gemini, or other LLM providers.

**Workaround:** None at this time. Anthropic's Claude is the sole supported backend.

### 5. Local metrics only

Metrics and learning data are stored in local SQLite. There is no cloud synchronization, team sharing, or centralized metrics dashboard.

**Workaround:** SQLite database can be manually copied or backed up. Query with standard SQLite tools.

### 6. No custom agent DSL

Agents are defined in TypeScript code within the `@asmo/core` package. There is no declarative DSL or configuration format for defining custom agents without writing code.

**Workaround:** Extend the `BaseAgent` class in TypeScript. Follow existing agent patterns in `packages/core/src/agents/`.

### 7. Long-running workflow feedback

For complex workflows (score > 70), execution can take several hours. Progress feedback during long-running phases is limited to verbose log output.

**Workaround:** Use `--verbose` to see real-time agent activity. Use `--dry-run` to preview expected duration before committing.

---

## Roadmap

### v1.2.0 (Planned)

- Improved heuristics accuracy (target: 80%+)
- Enhanced error messages with actionable suggestions
- Code-generation-from-spec workflow
- Extended keyword analysis categories
- Workflow execution time tracking and estimation improvements

### v2.0.0 (Planned)

- Multi-LLM support (OpenAI, Google Gemini, local models)
- Web monitoring dashboard
- Cloud metrics with optional sync
- Team collaboration features
- Workflow templates marketplace (internal)
- Plugin system for custom integrations

### v3.0.0 (Planned)

- Self-improving agents (learn from execution history)
- Custom agent DSL (declarative YAML/JSON agent definitions)
- Community marketplace for agents, workflows, and skills
- Distributed execution across multiple machines
- Advanced analytics and reporting

---

## Reporting Issues

To report a bug or request a feature:

1. Run the failing command with `--verbose` to capture detailed output
2. Include the ASMO version (`asmo --version`)
3. Note the LLM mode in use (Session, API, or Heuristics)
4. Provide the full command and any error messages
