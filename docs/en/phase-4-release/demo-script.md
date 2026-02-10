# ASMO Demo Script

Three guided scenarios demonstrating ASMO capabilities. Each scenario is self-contained and can be run independently.

**Prerequisites:**
- ASMO installed (`pnpm install && pnpm build`)
- Claude CLI installed and authenticated (for Session mode, $0 cost)
- Alternatively, `ANTHROPIC_API_KEY` set in `.env` (for API mode)

---

## Scenario 1: Simple Bug Fix (5 min)

**Purpose:** Demonstrate ASMO's task analysis, automatic workflow selection, and YOLO mode for trivial tasks.

### Step 1: Check what ASMO recommends

```bash
asmo suggest "Fix case-sensitive email login bug"
```

**Expected output:**
```json
{
  "useAsmo": true,
  "workflow": "bug_fix_workflow",
  "score": 35,
  "level": "simple",
  "reasoning": "Bug fix with specific scope, involves authentication logic"
}
```

**What to look for:** ASMO identifies this as a bug fix (keyword: "fix", "bug") and selects `bug_fix_workflow`. Score of ~35 indicates a simple task that benefits from multi-agent orchestration.

### Step 2: Execute with verbose output

```bash
asmo run "Fix case-sensitive email login bug" --verbose
```

**Expected behavior:**
1. Debugger agent investigates the case-sensitivity issue
2. Developer agent implements the fix (e.g., `.toLowerCase()` normalization)
3. Tester agent validates the fix with test cases

**What to look for:** In verbose mode, observe each agent's contribution. The debugger narrows down the problem, the developer produces a targeted fix, and the tester confirms correctness.

**Expected result:** ~10 min total, 2 files modified, all tests passing.

### Step 3: Try YOLO mode with a trivial task

```bash
asmo run "Fix typo in README"
```

**Expected behavior:**
- Complexity score: ~15 (trivial)
- YOLO mode activates automatically (score < 30)
- No approval checkpoint -- task executes immediately
- Completes in < 60 seconds

**What to look for:** The task bypasses the approval step entirely. YOLO mode is designed for low-risk changes where human review adds no value.

---

## Scenario 2: Feature Implementation (15 min)

**Purpose:** Demonstrate full multi-agent pipeline for a medium-complexity feature, including dry-run preview and architect-developer-tester coordination.

### Step 1: Analyze complexity

```bash
asmo analyze "Add user profile page with avatar upload"
```

**Expected output:**
```json
{
  "score": 60,
  "level": "medium",
  "categories": ["feature", "api", "ui"],
  "suggestedWorkflow": "feature_implementation_full",
  "agents": ["architect", "developer", "tester"],
  "estimatedDuration": "4-6h"
}
```

**What to look for:** The score reflects multiple concerns: UI component, file upload API, storage, and testing. ASMO correctly identifies this as a feature implementation requiring the full pipeline.

### Step 2: Dry run to preview the plan

```bash
asmo run "Add user profile page with avatar upload" --dry-run
```

**Expected output:**
```
Workflow: feature_implementation_full
Phases:
  1. Architecture  → architect agent
  2. Development   → developer agent
  3. Testing       → tester agent

Plan:
  - architect: Define component structure, API contracts, storage strategy
  - developer: Implement profile page, avatar upload endpoint, file handling
  - tester: Unit tests, integration tests, upload edge cases
```

**What to look for:** The `--dry-run` flag shows the execution plan without running anything. Useful for reviewing agent assignments and phase ordering before committing time.

### Step 3: Execute the workflow

```bash
asmo run "Add user profile page with avatar upload"
```

**Expected behavior:**
1. **Architecture phase:** Architect agent designs component structure, defines API contracts for avatar upload, selects storage strategy
2. **Development phase:** Developer agent implements the profile page, upload endpoint, and file handling logic
3. **Testing phase:** Tester agent creates unit and integration tests, covers edge cases (file size, format validation)

**What to look for:**
- Context Cascade passes architecture decisions to the developer (no repeated work)
- Tester receives both architecture and implementation context
- Each phase builds on the previous one

**Expected result:** ~5h, multiple files created (components, API routes, tests), API contracts defined, test coverage for upload scenarios.

---

## Scenario 3: Test Planning with TEA (10 min)

**Purpose:** Demonstrate the consolidated TEA (Test Engineering & Automation) workflows for structured test planning.

### Step 1: List available workflows

```bash
asmo workflow
```

**Expected output (partial):**
```
Available Workflows (27):

Core Development:
  bug_fix_workflow            Bug fixes, error investigation
  feature_implementation_full New features
  code_refactoring            Code restructuring
  ...

TEA (Test Engineering & Automation):
  tea_planning_workflow       Test planning: risk + strategy + design
  tea_execution_workflow      Test execution: automation + regression
  tea_validation_workflow     Quality validation: gates + release readiness
  ...
```

**What to look for:** The 27 workflows organized by category. TEA workflows are consolidated from the original 8 into 3 focused workflows.

### Step 2: Run TEA planning

```bash
asmo workflow tea_planning_workflow --task "Plan tests for checkout flow"
```

**Expected behavior:**
1. **Risk assessment:** Identifies high-risk areas in checkout (payment processing, cart state, concurrency)
2. **Test strategy:** Defines testing approach (unit, integration, E2E), coverage targets, tooling
3. **Test design:** Produces concrete test cases, data requirements, environment setup

**Expected output includes:**
- Risk matrix with severity and likelihood ratings
- Test strategy document with coverage targets (e.g., 90% for payment logic)
- Test case catalog organized by risk level
- Estimated execution time: 3-5 hours for the planning phase

**What to look for:**
- Risk-driven prioritization: payment and state management tests ranked highest
- Concrete, actionable test cases (not just categories)
- Clear traceability from risk to test case

### Step 3: Preview execution workflow (optional)

```bash
asmo run "Automate checkout flow tests" --dry-run
```

**Expected output:**
```
Workflow: tea_execution_workflow
Phases:
  1. Test automation  → tester agent
  2. Regression suite → tester agent
  3. Maintenance plan → tester agent
```

**What to look for:** After planning, the execution workflow picks up where planning left off. Adaptive Phase Detection can join the workflow mid-stream if some phases are already complete.

---

## Tips for Presenters

- **Use `--verbose`** to show agent-by-agent progress in real time.
- **Use `--dry-run`** before live execution to set expectations on duration.
- **Start with Scenario 1** to demonstrate the simplest path, then build complexity.
- **Highlight YOLO mode** as a key differentiator -- trivial tasks need zero human approval.
- **Highlight Context Cascade** in Scenario 2 -- each agent builds on previous work, no context is lost between phases.
