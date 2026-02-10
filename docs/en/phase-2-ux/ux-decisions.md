# ASMO -- UX Decisions

This document records the key UX decisions made for ASMO, the alternatives that were considered, and the rationale behind each choice.

---

## Decision Table

| # | Decision | Choice | Alternatives Considered | Rationale |
|---|----------|--------|------------------------|-----------|
| 1 | Interface type | CLI-only | CLI + Web UI; Web-only; VS Code extension | Developer workflow integration, zero overhead, scriptable, works over SSH, no browser dependency |
| 2 | Language support | Bilingual EN/RU (auto-detect) | EN-only; full i18n framework (i18next) | Core team is bilingual; Cyrillic detection is trivial (regex check); i18n framework is overkill for 2 languages |
| 3 | Output format | Emoji indicators + structured text | Plain text only; JSON-only; TUI with ncurses | Emoji provides instant visual parsing; structured text is grep-friendly; `--json` flag available for machine consumption |
| 4 | Config approach | 3-tier fallback (project > user > bundled) | Single config file; environment variables only; dotfile only | Zero-config out of the box; project-level overrides for teams; user-level for personal preferences; bundled defaults always available via npm |
| 5 | Approval UX | YOLO auto-bypass for score < 30 | Always require approval; never require approval; configurable threshold | Balanced: safety for complex tasks, speed for trivial ones; threshold is tuned to real-world complexity distribution |
| 6 | Error display | Categorized (retryable vs fatal vs validation) | Generic error messages; error codes only; stack traces | Actionable feedback -- user immediately knows whether to retry, fix input, or report a bug |
| 7 | Progress display | Phase-based indicators | Spinner only; streaming log output; silent until complete | Clear progress without overwhelming output; each phase maps to an agent, making the multi-agent process transparent |
| 8 | Agent personality | BMAD agents with names and traits | Generic agent identifiers (agent-1, agent-2); role-only labels | Memorable interactions; personalities enforce quality principles naturally (Amelia blocks on test failures, Bob on vagueness) |

---

## Detailed Rationale

### 1. CLI-Only Interface

ASMO targets professional developers who work primarily in terminals. A CLI interface:

- Integrates into existing shell workflows (`asmo run` is as natural as `git commit`)
- Is fully scriptable and composable with other tools (`asmo suggest | jq`)
- Works over SSH, in containers, and in CI/CD pipelines
- Has zero startup cost -- no browser, no Electron, no port binding
- Avoids the maintenance burden of a web frontend

A VS Code extension was considered but deferred. The CLI can be wrapped by an extension later without changing the core architecture.

### 2. Bilingual Auto-Detection

The detection algorithm is simple: if the input string contains Cyrillic characters (Unicode range `\u0400-\u04FF`), output is in Russian; otherwise English. This approach:

- Requires zero configuration from the user
- Has no false positives (Cyrillic is unambiguous)
- Avoids pulling in i18n libraries (no `i18next`, no locale files, no translation keys)
- Scales to the actual need: two languages, not twenty

If more languages are needed in the future, an i18n framework can be introduced without breaking the existing detection.

### 3. Emoji + Structured Output

Emoji indicators (checkmarks, spinners, status symbols) provide instant visual context without requiring the user to read full sentences. Combined with structured key-value output, users can quickly scan results. The `--json` flag provides a machine-readable alternative for programmatic consumers.

Plain text was rejected because it lacks visual hierarchy. JSON-only was rejected because it is not human-friendly for interactive use.

### 4. Three-Tier Configuration

The fallback chain (project > user > bundled) means:

- **New users** get a working system immediately (bundled defaults)
- **Individual users** can customize without affecting their team (user-level)
- **Teams** can standardize workflows per project (project-level)
- **npm packaging** works naturally -- bundled templates ship with `@asmo/core`

A single config file would force users to duplicate bundled defaults. Environment-only config cannot express complex workflow definitions.

### 5. YOLO Mode Threshold

The threshold of 30 (out of 100) was chosen based on the complexity distribution:

- Score 0--15: trivial (typo fixes, single-line changes) -- always safe to auto-approve
- Score 16--29: low complexity (simple renames, small bug fixes) -- safe for auto-approval
- Score 30+: medium and above -- human judgment adds value

The threshold can be tuned per project via configuration. The default is conservative: it auto-approves only tasks where human oversight adds negligible value.

### 6. Categorized Errors

Errors fall into three categories:

| Category | Example | User Action |
|---|---|---|
| **Retryable** | LLM timeout, rate limit | Wait and retry (automatic retry built in) |
| **Validation** | Task too short, invalid UTF-8 | Fix the input |
| **Fatal** | Missing config, CircuitBreaker trip | Investigate and fix root cause |

Generic error messages like "Something went wrong" give the user no path forward. Categorized errors make every failure actionable.

### 7. Phase-Based Progress

Each workflow is divided into phases, and each phase maps to one or more agents. Showing progress as `Phase 2/3: Implementation (developer) -- 5m 32s` gives the user:

- A clear sense of where the workflow is (2 of 3 done)
- Which agent is working (developer)
- How long each phase takes (for future estimation)

A raw log stream would overwhelm the user. A single spinner would hide progress entirely. Phase-based display hits the middle ground.

### 8. BMAD Agent Personalities

Named agents with personalities serve two purposes:

1. **Memorability**: "Amelia blocked the build" is more memorable than "QA agent returned failure"
2. **Quality enforcement**: Each personality embodies a principle:
   - **Amelia** (QA): Will not approve untested code
   - **Winston** (Architect): Insists on documentation and ADRs
   - **Bob** (Product Owner): Rejects vague requirements
   - **John** (Developer): Favors pragmatic, working solutions

These are not cosmetic -- the personality traits are encoded in agent prompts and directly influence decision-making during workflow execution.

---

## Future Considerations

| Item | Status | Notes |
|---|---|---|
| VS Code extension | Deferred | Wraps CLI, no core changes needed |
| Web dashboard | Not planned | Metrics can be exported to existing tools |
| Additional languages | Not planned | i18n framework can be added if needed |
| Configurable YOLO threshold | Planned | Per-project override via config |
| Interactive mode (`asmo shell`) | Under consideration | REPL for iterative task refinement |
