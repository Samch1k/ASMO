# ASMO -- UX Flow

This document describes the end-to-end interaction flows for each primary use case. Each flow shows what happens internally and what the user sees at each step.

---

## Flow 1: Standard Execution (`asmo run`)

The primary flow. The user provides a task description; ASMO analyzes it, selects a workflow, and executes it through the appropriate agents.

```
User Input
    │
    v
┌─────────────────┐
│  Initialization  │  Validate input, load config (3-tier), initialize LLM provider
└────────┬────────┘
         │         User sees: "Initializing ASMO..."
         v
┌─────────────────┐
│   Complexity     │  Score task 0-100, classify level, detect keywords
│   Analysis       │  Identify domain (security, performance, bug, etc.)
└────────┬────────┘
         │         User sees: "Analyzing task complexity..."
         v
┌─────────────────┐
│    Workflow      │  Match task to best workflow from 27 available
│    Selection     │  Select agent team based on workflow definition
└────────┬────────┘
         │         User sees: Analysis summary (score, workflow, confidence, agents)
         v
┌─────────────────┐
│ Phase Detection  │  Check for existing artifacts (tests, specs, code)
│   (adaptive)     │  Determine optimal starting phase (skip completed work)
└────────┬────────┘
         │         User sees: nothing (transparent optimization) or "Joining at phase N"
         v
┌─────────────────┐
│    Approval      │  If score >= 30: prompt user for approval
│   Checkpoint     │  If score <  30: YOLO auto-bypass (no prompt)
└────────┬────────┘
         │         User sees: approval prompt OR "Auto-approved (YOLO)"
         v
┌─────────────────┐
│  Agent Execution │  Run agents sequentially/parallel per workflow
│      Loop        │  Each agent: LLM call -> process -> produce artifacts
│                  │  CircuitBreaker: retry on failure, abort on repeated failure
│                  │  ContextCascade: pass artifacts between agents
└────────┬────────┘
         │         User sees: per-phase progress with agent name and timing
         v
┌─────────────────┐
│    Metrics       │  Record duration, token usage, success/failure
│   Collection     │  Feed into MetricsOptimizer learning loop
└────────┬────────┘
         │
         v
┌─────────────────┐
│  Result Output   │  Summary: duration, files modified, test results
└─────────────────┘
         │         User sees: final summary with outcome
```

**Typical duration:** 2--15 minutes depending on task complexity and number of agents.

---

## Flow 2: Quick Suggestion (`asmo suggest`)

Designed for hooks, automation, and quick checks. Returns a JSON recommendation without executing anything.

```
User Input
    │
    v
┌─────────────────┐
│   Lightweight    │  Fast complexity scoring (LLM or heuristics)
│    Analysis      │  Keyword detection, score calculation
└────────┬────────┘
         │
         v
┌─────────────────┐
│   JSON Output    │  { useAsmo, confidence, workflow, agents, complexity, reasoning }
└─────────────────┘
```

**Typical duration:** Under 3 seconds.

This flow is intentionally minimal. It uses the same ComplexityAnalyzer but skips workflow execution entirely. The JSON output is stable and suitable for piping into other tools:

```bash
# Example: hook integration
if asmo suggest "$TASK" | jq -r '.useAsmo'; then
  asmo run "$TASK"
fi
```

---

## Flow 3: Dry Run (`asmo run --dry-run`)

Full analysis pipeline without execution. Shows the user exactly what ASMO would do.

```
User Input
    │
    v
┌─────────────────┐
│  Full Analysis   │  Same as Flow 1: complexity, workflow selection, phase detection
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Execution Plan   │  Show selected workflow, agent sequence, estimated phases
│    Display       │  Show detected artifacts, starting phase, approval status
└────────┬────────┘
         │
         v
   ┌──────────┐
   │   STOP   │  No agents are executed. No files are modified.
   └──────────┘
```

**Typical duration:** 5--15 seconds.

The user sees the same analysis output as a real run but with a clear marker:

```
[DRY RUN] No agents were executed. Use `asmo run` without --dry-run to execute.
```

---

## Flow 4: YOLO Mode (auto-triggered)

YOLO mode is not a separate command -- it is an automatic behavior triggered when the complexity score falls below the threshold (default: 30).

```
User Input
    │
    v
┌─────────────────┐
│    Analysis      │  Score task
└────────┬────────┘
         │
         v
    Score < 30?
    ┌────┴────┐
   YES       NO
    │         │
    v         v
┌────────┐  ┌──────────┐
│  Auto- │  │  Prompt   │
│ approve│  │  for      │
│ (YOLO) │  │  approval │
└───┬────┘  └────┬─────┘
    │             │
    v             v
┌─────────────────┐
│    Execute       │  Standard agent loop
└────────┬────────┘
         v
┌─────────────────┐
│    Result        │
└─────────────────┘
```

The user sees `Auto-approved (YOLO mode, score: 22)` instead of an interactive prompt. This eliminates friction for trivial tasks like typo fixes, small renames, and single-line changes.

---

## Flow 5: Workflow Override (`asmo run --workflow`)

Bypasses automatic workflow selection. The user specifies exactly which workflow to run.

```
User Input + --workflow <id>
    │
    v
┌─────────────────┐
│  Initialization  │  Validate input, load config
└────────┬────────┘
         │
         v
┌─────────────────┐
│   Complexity     │  Still runs (for metrics and YOLO decision)
│   Analysis       │  Workflow selection result is IGNORED
└────────┬────────┘
         │
         v
┌─────────────────┐
│  Use specified   │  Load workflow by ID, skip selection logic
│    workflow      │  Validate workflow exists
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Standard         │  Same as Flow 1 from here: approval -> execution -> result
│ Execution        │
└─────────────────┘
```

The user sees a note in the analysis section:

```
Workflow: security_audit (manual override, skipped auto-selection)
```

This is useful when the user knows better than the heuristic -- for example, forcing a `security_audit` on code that ASMO would classify as a simple refactor.

---

## Error Handling

All flows share a common error display pattern:

```
Retryable errors:     "LLM provider timeout. Retrying (2/3)..."
Fatal errors:         "Configuration file not found: ~/.asmo/config/workflows/custom.json"
Validation errors:    "Task too short (2 chars). Minimum: 3 characters."
CircuitBreaker trip:  "Agent 'tester' failed 3 times. Aborting workflow."
```

Errors are categorized so the user knows whether retrying will help or whether they need to fix something first.
