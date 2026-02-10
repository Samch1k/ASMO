# ASMO -- CLI Output Mockups

This document shows representative output for each major CLI interaction. These mockups define the target output format and serve as a reference for implementation.

---

## Mockup 1: Standard Execution (`asmo run`)

```
$ asmo run "Fix null pointer in login handler"

  Initializing ASMO...
  Analyzing task complexity...

  Analysis:
   Complexity: simple (32/100)
   Workflow:   bug_fix_workflow
   Confidence: 92.0%
   Agents:     debugger, developer, tester

  Executing workflow...
   Phase 1/3: Investigation (debugger) -- 2m 15s
   Phase 2/3: Implementation (developer) -- 5m 32s
   Phase 3/3: Testing (tester) -- 1m 48s

  Workflow completed successfully
   Duration: 9m 35s
   Files modified: 2
   Tests: 23/23 passing
```

---

## Mockup 2: Quick Suggestion (`asmo suggest`)

```
$ asmo suggest "Add OAuth authentication"
{
  "useAsmo": true,
  "confidence": 0.85,
  "workflow": "feature_implementation_full",
  "agents": ["architect", "developer", "tester"],
  "complexity": {
    "score": 65,
    "level": "complex"
  },
  "reasoning": "Multi-concern feature requiring architecture decisions, implementation across multiple files, and security testing"
}
```

For human-readable output:

```
$ asmo suggest "Add OAuth authentication" --no-json

  Recommendation: Use ASMO
   Confidence: 85%
   Workflow:   feature_implementation_full
   Agents:     architect, developer, tester
   Complexity: complex (65/100)
   Reason:     Multi-concern feature requiring architecture decisions,
               implementation across multiple files, and security testing
```

---

## Mockup 3: Verbose Execution (`asmo run --verbose`)

```
$ asmo run "Optimize database queries in user service" --verbose

  Initializing ASMO...
   Config loaded: bundled defaults (no project/user overrides)
   LLM provider: Session (Claude CLI, $0)

  Analyzing task complexity...
   Keywords detected: optimize (performance), database, queries
   Category: performance (score: 65)
   Impact modifiers: performance_impact (+5), data_impact (+5)
   Final score: 75/100 (high)

  Analysis:
   Complexity: high (75/100)
   Workflow:   performance_optimization
   Confidence: 88.5%
   Agents:     optimizer, developer
   Phase detection: no existing artifacts found, starting at phase 1

  Approval required (score >= 30)
   Proceed with performance_optimization? [Y/n] Y

  Executing workflow...
   Phase 1/2: Profiling & Analysis (optimizer)
     [LLM] Session call: "Analyze query performance..." (1,247 tokens)
     [MCP] Read file: src/services/user-service.ts
     [MCP] Read file: src/repositories/user-repository.ts
     [LLM] Session call: "Identify N+1 queries..." (892 tokens)
     Artifact: performance-report.md (3.2 KB)
     Duration: 4m 12s

   Phase 2/2: Implementation (developer)
     [LLM] Session call: "Implement query optimizations..." (2,105 tokens)
     [MCP] Write file: src/repositories/user-repository.ts
     [MCP] Write file: src/services/user-service.ts
     [LLM] Session call: "Verify optimization correctness..." (654 tokens)
     Artifact: optimized-queries.diff (1.8 KB)
     Duration: 6m 48s

  Workflow completed successfully
   Duration: 11m 00s
   Files modified: 2
   Artifacts: 2 (performance-report.md, optimized-queries.diff)
   LLM calls: 4 (4,898 tokens total)
```

---

## Mockup 4: Dry Run (`asmo run --dry-run`)

```
$ asmo run "Refactor authentication module to use strategy pattern" --dry-run

  Initializing ASMO...
  Analyzing task complexity...

  Analysis:
   Complexity: medium (52/100)
   Workflow:   code_refactoring
   Confidence: 90.2%
   Agents:     architect, developer

  Execution Plan:
   Phase 1: Architecture Review (architect)
     - Analyze current auth module structure
     - Design strategy pattern interface
     - Produce: architecture-decision-record.md
   Phase 2: Implementation (developer)
     - Refactor code to strategy pattern
     - Update imports and dependencies
     - Produce: refactored files

  [DRY RUN] No agents were executed. Use `asmo run` without --dry-run to execute.
```

---

## Mockup 5: Workflow List (`asmo workflow`)

```
$ asmo workflow

  Available Workflows (27)

  Core Development
  ──────────────────────────────────────────────────────────────────────
  bug_fix_workflow              Bug fixes, error investigation (adaptive)
  feature_implementation_full   New features (architect + developer + tester)
  code_refactoring              Code restructuring
  code_review_workflow          Code review
  dev_story_workflow            Story implementation
  create_story_workflow         Story creation

  Architecture & Design
  ──────────────────────────────────────────────────────────────────────
  architecture_design           System architecture
  api_design                    API design and implementation
  ui_component_library          UI component system

  Quality & Testing
  ──────────────────────────────────────────────────────────────────────
  comprehensive_testing         Test suite creation
  security_audit                Security review
  performance_optimization      Speed/memory improvements
  performance_investigation     Performance profiling
  adversarial_review_workflow   Adversarial code review

  TEA (Test Engineering & Automation)
  ──────────────────────────────────────────────────────────────────────
  tea_planning_workflow         Test planning: risk + strategy + design
  tea_execution_workflow        Test execution: automation + regression
  tea_validation_workflow       Quality validation: gates + release readiness
  automate_tests_workflow       Quick test automation

  Product & Planning
  ──────────────────────────────────────────────────────────────────────
  create_product_brief_workflow Product brief
  create_prd_workflow           PRD creation
  create_ux_design_workflow     UX design
  create_epics_and_stories      Epics & stories
  sprint_planning_workflow      Sprint planning
  check_implementation_readiness Implementation readiness check
  correct_course_workflow       Course correction
  retrospective_workflow        Retrospective

  Database
  ──────────────────────────────────────────────────────────────────────
  database_migration            Database migration
```

---

## Mockup 6: YOLO Mode (auto-approved trivial task)

```
$ asmo run "Fix typo in README: 'recieve' -> 'receive'"

  Initializing ASMO...
  Analyzing task complexity...

  Analysis:
   Complexity: trivial (12/100)
   Workflow:   bug_fix_workflow
   Confidence: 95.0%
   Agents:     developer

  Auto-approved (YOLO mode, score: 12)

  Executing workflow...
   Phase 1/1: Implementation (developer) -- 0m 22s

  Workflow completed successfully
   Duration: 0m 22s
   Files modified: 1
   Tests: skipped (trivial change)
```

---

## Mockup 7: BMAD Personality -- Quality Gate Blocking

When BMAD agents enforce quality principles, the output reflects their personality:

**Amelia (QA) blocks on failing tests:**

```
  Phase 3/3: Testing (tester / Amelia)

  BLOCKED by Amelia (QA):
   "2 of 15 tests are failing. I will not sign off on this change
    until all tests pass. The failing tests are:
    - test/auth.test.ts: 'should reject expired tokens'
    - test/auth.test.ts: 'should handle missing claims'
    Fix these tests and re-run the workflow."

   Status: BLOCKED
   Action required: Fix failing tests
```

**Bob (Product Owner) blocks on ambiguity:**

```
  Phase 1/4: Requirements Review (product-owner / Bob)

  BLOCKED by Bob (Product Owner):
   "The task description is too vague. 'Improve the login page' could
    mean anything from visual polish to a complete rewrite. Clarify:
    1. What specific problem are users experiencing?
    2. What does 'improved' look like? (metrics, behavior, appearance)
    3. Are there existing designs or specs to reference?"

   Status: BLOCKED
   Action required: Provide clearer requirements
```

**Winston (Architect) requests review:**

```
  Phase 1/3: Architecture Review (architect / Winston)

  WARNING from Winston (Architect):
   "This change introduces a new database dependency (Redis) without
    an architecture decision record. Before proceeding:
    1. Document the rationale for Redis over alternatives
    2. Define the caching invalidation strategy
    3. Consider failure modes when Redis is unavailable
    Producing ADR template for your review."

   Artifact: adr-redis-caching.md
   Status: NEEDS REVIEW
```
