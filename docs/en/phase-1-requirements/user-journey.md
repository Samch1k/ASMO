# User Journey

This document describes the end-to-end interaction flow when a user runs a task through ASMO.

## Flow Diagram

```
+------------------+
|   User has task   |
+--------+---------+
         |
         v
+--------+---------+     +-------------------+
| asmo suggest/run |---->| Input Validation  |
+--------+---------+     | (10 checks)       |
         |               +-------------------+
         v
+--------+---------+
| ComplexityAnalyzer|
| Score: 0-100      |
| Levels: 5         |
+--------+---------+
         |
         v
+--------+---------+
| WorkflowSelector  |
| 27 workflows       |
+--------+---------+
         |
         v
+--------+---------+     +-------------------+
| PhaseDetector     |---->| Scan artifacts    |
| (optional)        |     | Determine start   |
+--------+---------+     | phase             |
         |               +-------------------+
         v
+--------+---------+
| ApprovalCheckpoint|
| YOLO: auto if <30 |
| Otherwise: prompt  |
+--------+---------+
         |
         v
+--------+---------+
| WorkflowEngine    |
| Phase 1..N        |
+--------+---------+
         |
    +----+----+
    |    |    |
    v    v    v
 Agent Agent Agent    <-- AgentExecutor runs each
    |    |    |
    v    v    v
  LLM  LLM  MCP      <-- callLLM() / requestMCP()
    |    |    |
    +----+----+
         |
         v
+--------+---------+
| ContextCascade    |
| Data flows between |
| phases            |
+--------+---------+
         |
         v
+--------+---------+
| MetricsCollector  |
| Record performance|
+--------+---------+
         |
         v
+--------+---------+
|   Result Output   |
|   to user         |
+-------------------+
```

## Step-by-Step Walkthrough

### Step 1: Task Input

The user provides a task description via the CLI:

```bash
asmo run "Add rate limiting to the /api/users endpoint with Redis backing"
```

Alternatively, the user can first check whether ASMO is appropriate:

```bash
asmo suggest "Add rate limiting to the /api/users endpoint with Redis backing"
# Returns: { "useAsmo": true, "reasoning": "Multiple concerns: API, performance, caching" }
```

### Step 2: Input Validation

The task description passes through 10 validation checks:

- Empty/null check
- Length limits (3--10,000 characters)
- UTF-8 encoding validation
- Control character removal (security)
- Whitespace normalization

Invalid input returns an actionable error message. Sanitizable issues (control characters, excess whitespace) are cleaned automatically.

### Step 3: Complexity Analysis

`ComplexityAnalyzer` evaluates the task using a dual strategy:

1. **LLM analysis** (primary): Sends the task to the LLM provider with a structured prompt. Returns a score, level, and category.
2. **Keyword heuristics** (fallback): Scans for keywords across 14 categories. Applies impact modifiers for high-risk, data, security, and performance signals.

Result: Score 65, Level "high", Category "api + performance".

### Step 4: Workflow Selection

`WorkflowSelector` matches the analysis result against 27 workflow definitions. Selection considers:

- Category alignment (api -> `api_design` or `feature_implementation_full`)
- Complexity threshold (high-complexity tasks get multi-agent workflows)
- Keyword boosting (e.g., "rate limiting" + "Redis" boost `performance_optimization`)

Result: `feature_implementation_full` (architect + developer + tester).

### Step 5: Adaptive Phase Detection (Optional)

If the project already contains relevant artifacts, `PhaseDetector` scans:

- Existing architecture documents
- Test files for the target module
- Git history for recent related changes

If design artifacts exist, the workflow skips the architecture phase and starts at implementation. Detection provides a confidence score and alternative starting points.

### Step 6: Approval Checkpoint

`ApprovalCheckpoint` evaluates whether human approval is needed:

- **YOLO mode** (score < 30): Auto-approved, no prompt. Execution proceeds immediately.
- **Standard mode** (score >= 30): The user sees the selected workflow, agents, and estimated phases. They confirm or abort.

```
Workflow: feature_implementation_full
Agents:  architect, developer, tester
Phases:  design -> implement -> test -> review
Proceed? [Y/n]
```

### Step 7: Workflow Execution

`WorkflowEngine` executes each phase sequentially (or in parallel for Party Mode):

1. **Design phase**: Architect agent produces design document and interface definitions.
2. **Implementation phase**: Developer agent writes code following the design.
3. **Testing phase**: Tester agent generates and runs tests.
4. **Review phase**: Code reviewer agent validates the output.

Each agent calls `callLLM()` for reasoning and `requestMCP()` for tool access (file system, GitHub, browser).

### Step 8: Context Cascade

`ContextCascade` passes artifacts between phases:

- Design document -> Implementation (developer uses interfaces from design)
- Implementation output -> Testing (tester writes tests for the new code)
- All artifacts -> Review (reviewer sees the full picture)

### Step 9: Error Handling

If a phase fails:

- `IterationManager` retries up to 3 times.
- `CircuitBreaker` trips after 5 consecutive failures, halting the workflow.
- Errors are categorized (transient, permanent, configuration) for actionable feedback.

### Step 10: Metrics and Output

`MetricsCollector` records:

- Total execution time
- Per-phase duration
- LLM token usage and cost
- Success/failure status

The final result is presented to the user with a summary of what was created, modified, and tested.

## CLI Flags That Alter the Journey

| Flag | Effect on Flow |
|---|---|
| `--dry-run` | Stops after Step 4 (analysis only, no execution) |
| `--use-api` | Forces API mode in Step 3 and Step 7 |
| `--no-llm` | Uses heuristics only in Step 3 (~65% accuracy) |
| `--workflow <name>` | Skips Step 4, uses specified workflow directly |
| `--verbose` | Detailed logging at every step |
