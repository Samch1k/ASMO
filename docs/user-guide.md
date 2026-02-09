# ASMO User Guide

Complete guide to using ASMO (AI System for Multiagent Orchestration) for software development automation.

---

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Using ASMO](#using-asmo)
3. [Workflows Guide](#workflows-guide)
4. [Configuration](#configuration)
5. [Best Practices](#best-practices)
6. [Advanced Usage](#advanced-usage)

---

## Core Concepts

### What are Agents?

**Agents** are specialized AI experts that perform specific roles in software development.

ASMO has **25 agents** organized in 3 categories:

#### 1. Core Agents (6)
General-purpose agents for common tasks:

| Agent | Role | Expertise |
|-------|------|-----------|
| `architect` | System Design | Architecture, patterns, best practices |
| `developer` | Implementation | Code writing, refactoring |
| `tester` | Quality Assurance | Test creation, validation |
| `debugger` | Bug Investigation | Root cause analysis, debugging |
| `devops` | Operations | CI/CD, deployment, infrastructure |
| `optimizer` | Performance | Speed, memory, efficiency |

#### 2. Specialized Agents (15)
Domain experts for specific tasks:

| Agent | Specialization |
|-------|---------------|
| `ui-developer` | Frontend UI development |
| `ux-designer` | User experience design |
| `business-analyst` | Requirements analysis |
| `project-manager` | Project coordination |
| `product-owner` | Product strategy |
| `scrum-master` | Agile processes |
| `security-specialist` | Security & vulnerabilities |
| `performance-engineer` | Performance optimization |
| `data-architect` | Database design |
| `api-designer` | API design |
| `analyst` | Data analysis |
| `tech-writer` | Documentation |
| `test-architect` | Test strategy |
| `adversarial-reviewer` | Critical code review |
| `code-reviewer` | Code quality review |

#### 3. Validation Agents (4)
Quality gates and coordination:

| Agent | Purpose |
|-------|---------|
| `design-validator` | Validate design decisions |
| `merge-coordinator` | Coordinate merge conflicts |
| `post-deploy-monitor` | Monitor deployments |
| `requirements-validator` | Validate requirements |

**How agents work:**
- Each agent has specific **skills** (92 total across all agents)
- Agents can **call LLMs** to generate responses
- Agents create **artifacts** (code, documentation, reports)
- Agents use **tools** (MCP - Model Context Protocol for external integrations)

**Example: Bug Fix Workflow**
```
Task: "Fix authentication bug"

Agents used:
1. debugger    → Investigates root cause
2. developer   → Implements fix
3. tester      → Validates fix with tests
```

---

### What are Workflows?

**Workflows** are orchestrated sequences of agent steps to accomplish complex tasks.

ASMO has **27 workflows** organized in 6 categories:

#### Workflow Categories

1. **Core Development (7 workflows)**
   - Feature implementation
   - Bug fixes
   - Code refactoring
   - Code reviews

2. **Architecture & Design (3 workflows)**
   - System architecture
   - API design
   - UI component libraries

3. **Quality & Testing (5 workflows)**
   - Test suite creation
   - Security audits
   - Performance optimization

4. **TEA - Test Engineering (3 workflows)**
   - Test planning
   - Test execution
   - Quality validation

5. **Product & Planning (8 workflows)**
   - PRD creation
   - Sprint planning
   - Retrospectives

6. **Database (1 workflow)**
   - Database migrations

#### Workflow Structure

Each workflow has:

```json
{
  "id": "bug_fix_workflow",
  "name": "Bug Fix Workflow (Adaptive)",

  "steps": [
    {
      "id": "step_1_investigation",
      "role_id": "debugger",
      "phase_id": "investigation",
      "inputs": ["task_description"],
      "deliverables": ["bug_analysis"]
    }
  ],

  "phases": [
    {
      "id": "investigation",
      "name": "Bug Investigation",
      "duration_estimate": "30 minutes"
    }
  ],

  "metadata": {
    "adaptive_phase_detection": true,
    "complexity_aware": true,
    "complexity_thresholds": {
      "simple": "0-39",
      "medium": "40-69",
      "complex": "70-100"
    }
  }
}
```

**Key components:**

- **Steps**: Individual agent actions
- **Phases**: Logical groupings of steps
- **Deliverables**: Output artifacts
- **Metadata**: Adaptive features, complexity handling

---

### How Routing Works

ASMO uses intelligent routing to select the right workflow for your task.

#### Routing Pipeline

```
Task Description
    ↓
[1] Complexity Analysis (15-30 sec)
    ↓
[2] Workflow Selection
    ↓
[3] Approval Checkpoint
    ↓
[4] Workflow Execution
    ↓
Results + Artifacts
```

#### 1. Complexity Analysis

**ComplexityAnalyzer** evaluates your task across 4 dimensions:

| Dimension | Score 0-10 | Indicators |
|-----------|------------|------------|
| **Technical Scope** | How many areas affected? | Files, modules, components |
| **Business Impact** | How critical is this? | User-facing, revenue impact |
| **Risk Level** | How risky is this change? | Breaking changes, dependencies |
| **Performance Impact** | Performance implications? | Database, algorithms, scale |

**Formula:**
```
Complexity = (Technical * 4 + Business * 3 + Risk * 2 + Performance * 1) / 10
Result: 0-100 score
```

**Example:**
```bash
Task: "Add user authentication with JWT"

Analysis:
- Technical Scope: 7/10 (multiple modules: auth, API, middleware)
- Business Impact: 8/10 (critical security feature)
- Risk Level: 6/10 (affects existing users)
- Performance Impact: 5/10 (token validation overhead)

Complexity = (7*4 + 8*3 + 6*2 + 5*1) / 10 = 65/100 (Medium-Complex)
```

#### 2. Workflow Selection

**DynamicOrchestrator** selects the best workflow using:

1. **Task Type Detection**
   - Keywords: "fix", "bug" → `bug_fix_workflow`
   - Keywords: "add", "feature", "implement" → `feature_implementation_full`
   - Keywords: "test", "qa" → TEA workflows

2. **Complexity Matching**
   - Simple (0-39): Use lightweight workflows
   - Medium (40-69): Use standard workflows
   - Complex (70-100): Use comprehensive workflows

3. **Skill Matching**
   - Required skills extracted from task
   - Workflows ranked by skill coverage

**Selection Logic:**
```typescript
if (taskType === 'bug_fix') {
  return 'bug_fix_workflow'  // Adaptive
} else if (taskType === 'feature' && complexity > 60) {
  return 'feature_implementation_full'  // Architecture + Dev + Test
} else if (taskType === 'feature' && complexity < 60) {
  return 'dev_story_workflow'  // Dev + Test only
}
```

#### 3. Approval Checkpoint

Before execution, you review and approve the workflow plan:

```
📋 Workflow Plan: bug_fix_workflow

Complexity: 45/100 (Medium)
Estimated Time: 2 hours

Steps:
  ✓ Step 1: Bug Investigation (debugger) - 30 min
    Deliverables: bug_analysis.md

  ✓ Step 2: Implement Fix (developer) - 1 hour
    Deliverables: code_changes, commit

  ✓ Step 3: Test Fix (tester) - 30 min
    Deliverables: test_results.md

❓ Approve workflow? (Y/n)
```

**Auto-approval (YOLO mode):**
- Complexity < 40 (simple tasks)
- Enabled via `ASMO_YOLO_MODE=true`
- Skips checkpoint for low-risk workflows

---

### What is Complexity Analysis?

Complexity analysis is ASMO's core intelligence for understanding your task.

#### Complexity Scores

| Score | Level | Description | Typical Tasks |
|-------|-------|-------------|---------------|
| **0-39** | Simple | Single concern, low risk | Typo fixes, config changes |
| **40-69** | Medium | Multiple files, moderate risk | Bug fixes, small features |
| **70-100** | Complex | Architecture changes, high impact | System redesign, migrations |

#### Complexity Factors

**1. Technical Scope (40% weight)**

Measures technical breadth:
- How many files will be changed?
- How many modules/components affected?
- Are there cross-cutting concerns?

```
Examples:
- Single file change: 2/10
- Multiple related files: 5/10
- Multiple modules: 7/10
- System-wide changes: 10/10
```

**2. Business Impact (30% weight)**

Measures business criticality:
- Is this user-facing?
- Does it affect revenue?
- How many users impacted?

```
Examples:
- Internal tool update: 2/10
- Bug fix in admin panel: 4/10
- User-facing feature: 7/10
- Payment system change: 10/10
```

**3. Risk Level (20% weight)**

Measures change risk:
- Are there breaking changes?
- Will this affect existing users?
- Are dependencies involved?

```
Examples:
- New feature (additive): 2/10
- Refactoring (behavior-preserving): 4/10
- Schema change: 7/10
- Breaking API change: 10/10
```

**4. Performance Impact (10% weight)**

Measures performance implications:
- Database queries involved?
- Algorithmic complexity?
- Will this affect scale?

```
Examples:
- UI text change: 1/10
- New API endpoint: 4/10
- Database migration: 7/10
- Algorithm optimization: 9/10
```

#### How Complexity Affects Workflows

**Adaptive Workflows** change behavior based on complexity:

**Example: bug_fix_workflow**

```json
{
  "steps": [
    {
      "id": "step_1_investigation",
      "role_id": "debugger"
      // Always included
    },
    {
      "id": "step_2_architecture_review",
      "role_id": "architect",
      "skip_if_complexity": "simple"
      // Only for medium/complex bugs
    },
    {
      "id": "step_3_implement_fix",
      "role_id": "developer"
      // Always included
    },
    {
      "id": "step_4_code_review",
      "role_id": "code-reviewer",
      "skip_if_complexity": "simple"
      // Only for medium/complex bugs
    },
    {
      "id": "step_5_test",
      "role_id": "tester"
      // Always included
    }
  ]
}
```

**Result:**
- Simple bug (score 25): 3 steps (debugger, developer, tester) - 1 hour
- Medium bug (score 55): 4 steps (+ code-reviewer) - 2 hours
- Complex bug (score 80): 5 steps (+ architect + code-reviewer) - 3 hours

**Time Savings:**
- Simple bugs save 40% time (skip architect, code-reviewer)
- Medium bugs save 20% time (skip architect)
- Complex bugs use full workflow

---

## Using ASMO

### CLI Commands Reference

#### `asmo run`

Execute ASMO with automatic workflow selection.

**Syntax:**
```bash
asmo run "<task description>" [options]
```

**Options:**
- `--yolo` - Auto-approve simple tasks
- `--workflow <name>` - Force specific workflow
- `--output <dir>` - Custom output directory
- `--mode <session|api>` - Force LLM mode
- `--verbose` - Detailed logging

**Examples:**
```bash
# Basic usage
asmo run "Fix login bug"

# Auto-approve simple task
asmo run "Fix typo in README" --yolo

# Force specific workflow
asmo run "Add user auth" --workflow feature_implementation_full

# Custom output
asmo run "Optimize database" --output ./reports

# Force API mode
asmo run "Security audit" --mode api

# Verbose logging
asmo run "Debug performance issue" --verbose
```

---

#### `asmo suggest`

Get quick recommendation (used in hooks).

**Syntax:**
```bash
asmo suggest "<task description>"
```

**Output (JSON):**
```json
{
  "useAsmo": true,
  "reason": "Task requires bug investigation and testing",
  "recommendedWorkflow": "bug_fix_workflow",
  "complexity": 55,
  "estimatedTime": "2 hours",
  "agents": ["debugger", "developer", "tester"]
}
```

**Examples:**
```bash
# Check if ASMO is needed
asmo suggest "Fix authentication bug"

# Simple task (should return useAsmo: false)
asmo suggest "Fix typo in line 42"

# Complex task
asmo suggest "Redesign database schema for multi-tenancy"
```

**Use in scripts:**
```bash
#!/bin/bash
SUGGESTION=$(asmo suggest "$1")
USE_ASMO=$(echo "$SUGGESTION" | jq -r '.useAsmo')

if [ "$USE_ASMO" = "true" ]; then
  echo "Recommended: Use ASMO"
  asmo run "$1"
else
  echo "Too simple for ASMO, handle manually"
fi
```

---

#### `asmo analyze`

Analyze complexity without execution.

**Syntax:**
```bash
asmo analyze "<task description>"
```

**Output:**
```
🔍 Complexity Analysis

Task: "Add user authentication with JWT"

Scores:
  Technical Scope:     7/10  (Multiple modules: auth, API, middleware)
  Business Impact:     8/10  (Critical security feature)
  Risk Level:          6/10  (Affects existing users)
  Performance Impact:  5/10  (Token validation overhead)

Overall Complexity: 65/100 (Medium-Complex)

Recommendation:
  Workflow: feature_implementation_full
  Agents: architect, developer, security-specialist, tester
  Estimated Time: 4-6 hours

Reasoning:
  - Multiple technical areas require architectural review
  - Security implications need security-specialist
  - User impact requires thorough testing
```

**Examples:**
```bash
# Analyze before running
asmo analyze "Migrate from MySQL to PostgreSQL"

# Compare complexities
asmo analyze "Fix login bug" > bug1.txt
asmo analyze "Add OAuth login" > bug2.txt
diff bug1.txt bug2.txt
```

---

#### `asmo workflow`

List or run specific workflows.

**Syntax:**
```bash
# List all workflows
asmo workflow

# Run specific workflow
asmo workflow <workflow_name> --task "<description>"
```

**Examples:**
```bash
# List all workflows
asmo workflow

# Run bug fix workflow
asmo workflow bug_fix_workflow --task "Fix authentication error"

# Run TEA planning
asmo workflow tea_planning_workflow --task "Plan tests for checkout flow"

# Run security audit
asmo workflow security_audit --task "Audit payment processing code"
```

**Output (list):**
```
📚 Available Workflows (27)

Core Development (7):
  bug_fix_workflow              - Adaptive bug fixing (1-3h)
  feature_implementation_full   - Complete feature (architecture + dev + test, 4-8h)
  dev_story_workflow            - User story implementation (2-4h)
  code_refactoring              - Code restructuring (2-5h)
  code_review_workflow          - Code quality review (1-2h)
  create_story_workflow         - Story creation (1h)

Architecture & Design (3):
  architecture_design           - System architecture design (3-6h)
  api_design                   - API design & implementation (2-4h)
  ui_component_library         - UI component system (4-8h)

Quality & Testing (5):
  comprehensive_testing         - Test suite creation (3-6h)
  security_audit               - Security review (2-4h)
  performance_optimization     - Performance improvements (3-6h)
  performance_investigation    - Performance profiling (2-3h)
  adversarial_review_workflow  - Critical code review (2-3h)

TEA (3):
  tea_planning_workflow        - Test planning (risk + strategy + design, 3-5h)
  tea_execution_workflow       - Test execution (automation + regression, 3.5-6h)
  tea_validation_workflow      - Quality validation (gates + release, 2-3h)

Product & Planning (8):
  create_product_brief_workflow              - Product brief (2h)
  create_prd_workflow                        - PRD creation (3-4h)
  create_ux_design_workflow                  - UX design (3-5h)
  create_epics_and_stories_workflow         - Epics & stories (2-3h)
  sprint_planning_workflow                   - Sprint planning (2h)
  check_implementation_readiness_workflow    - Implementation check (1h)
  correct_course_workflow                    - Course correction (1-2h)
  retrospective_workflow                     - Retrospective (1h)

Database (1):
  database_migration                         - Database schema migration (3-6h)

Usage:
  asmo workflow <name> --task "<your task>"
```

---

### Understanding Output

#### Console Output

ASMO provides real-time progress updates:

```
🔍 Analyzing task complexity...
   Task Type: Bug Fix
   Complexity: 55/100 (Medium)

✅ Workflow selected: bug_fix_workflow
   Steps: 4
   Agents: debugger, developer, code-reviewer, tester
   Estimated time: 2 hours

📋 Workflow Plan:
   Phase 1: Investigation (debugger) - 30 min
     • Analyze error logs
     • Identify root cause
     • Document findings

   Phase 2: Implementation (developer) - 1 hour
     • Implement fix
     • Update related code
     • Create commit

   Phase 3: Review (code-reviewer) - 15 min
     • Review code quality
     • Check best practices

   Phase 4: Testing (tester) - 15 min
     • Create unit tests
     • Validate fix
     • Run regression tests

❓ Approve workflow? (Y/n) █
```

**After approval:**

```
🤖 Step 1/4: Investigation (debugger)
   📍 Current: Analyzing error logs...

   ✅ Root cause identified
   📦 Artifact: bug-analysis.md
   ⏱️  Time: 25 minutes

🤖 Step 2/4: Implementation (developer)
   📍 Current: Implementing fix in auth.ts...

   ✅ Fix implemented
   📦 Artifacts:
      - src/auth.ts (modified)
      - fix-implementation.md
   ⏱️  Time: 55 minutes

🤖 Step 3/4: Code Review (code-reviewer)
   📍 Current: Reviewing changes...

   ✅ Code quality approved
   📦 Artifact: code-review.md
   ⏱️  Time: 12 minutes

🤖 Step 4/4: Testing (tester)
   📍 Current: Creating tests...

   ✅ All tests passing (8/8)
   📦 Artifacts:
      - tests/auth.test.ts (created)
      - test-results.md
   ⏱️  Time: 18 minutes

🎉 Workflow Complete!

📊 Summary:
   Status: ✅ Success
   Steps completed: 4/4
   Total time: 1h 50m (actual) vs 2h (estimated)
   Efficiency: 92%

📦 Deliverables:
   ✅ bug-analysis.md          - Root cause analysis
   ✅ fix-implementation.md    - Implementation details
   ✅ code-review.md           - Quality review
   ✅ test-results.md          - Test validation
   ✅ src/auth.ts              - Fixed code
   ✅ tests/auth.test.ts       - New tests

✨ Next Steps:
   1. Review artifacts in: ./asmo-output/
   2. Run tests: npm test
   3. Commit changes: git commit -m "Fix authentication bug"
   4. Push to remote: git push origin feature/auth-fix
```

#### Artifacts

ASMO generates structured artifacts in the output directory:

**Directory Structure:**
```
./asmo-output/
├── 2026-02-09_14-30-15_bug_fix_workflow/
│   ├── workflow-plan.md           # Initial plan
│   ├── bug-analysis.md            # Investigation results
│   ├── fix-implementation.md      # Implementation details
│   ├── code-review.md             # Review findings
│   ├── test-results.md            # Test outcomes
│   ├── execution-log.json         # Detailed execution log
│   └── summary.md                 # Overall summary
```

**Artifact Types:**

1. **Documentation (.md)**
   - Analysis reports
   - Design documents
   - Implementation guides
   - Test results
   - Summaries

2. **Code Files**
   - Source code
   - Tests
   - Configurations
   - Scripts

3. **Data Files (.json, .yaml)**
   - Execution logs
   - Metrics
   - API contracts
   - Configuration

4. **Reports**
   - Performance metrics
   - Security findings
   - Code quality scores

---

### Approval Checkpoints

Before workflow execution, ASMO asks for approval.

#### Manual Approval (Default)

```
📋 Workflow Plan: feature_implementation_full

Complexity: 65/100 (Medium-Complex)
Estimated Time: 5 hours

Phases:
  1. Architecture Design (architect) - 1.5h
     → System design, API contracts, data models

  2. Development (developer) - 2.5h
     → Implementation, code, documentation

  3. Testing (tester) - 1h
     → Unit tests, integration tests

Total Cost (API mode): ~$0.50
Total Cost (Session mode): $0.00 (free)

❓ Approve workflow? (Y/n) █
```

**Options:**
- `Y` or `yes` - Approve and execute
- `N` or `no` - Cancel execution
- `E` or `edit` - Modify workflow before execution
- `D` or `details` - Show detailed step breakdown

#### YOLO Mode (Auto-Approve)

Skip approval for simple, low-risk tasks:

```bash
# Enable YOLO mode
asmo run "Fix typo in README" --yolo

# Or via environment variable
ASMO_YOLO_MODE=true asmo run "Update config"
```

**When YOLO Activates:**
- Complexity < 40 (simple tasks)
- Workflow is read-only or low-risk
- No architectural changes
- Single-file or minimal changes

**When YOLO is Disabled:**
- Complexity ≥ 40 (medium/complex)
- Breaking changes possible
- Security-critical code
- Database migrations
- Architecture changes

**Example (YOLO enabled):**
```
🔍 Analyzing task: "Fix typo in README"
   Complexity: 15/100 (Simple)

🚀 YOLO Mode: Auto-approving simple task
   Workflow: code_refactoring (simplified)
   Steps: 1 (developer only)

🤖 Executing...
   ✅ Complete
   ⏱️  Time: 2 minutes
```

---

## Workflows Guide

### Choosing the Right Workflow

Use this decision tree to select the appropriate workflow:

#### I need to fix a bug

**→ `bug_fix_workflow` (Adaptive)**

- **Simple bug** (typo, config): 3 steps, ~1h
- **Medium bug** (logic error): 4 steps, ~2h
- **Complex bug** (race condition, architecture): 5 steps, ~3h

**When to use:**
- Error in existing code
- Unexpected behavior
- Need investigation + fix + testing

**Example:**
```bash
asmo run "Fix authentication error when user logs in with OAuth"
```

---

#### I need to add a feature

Choose based on scope:

**Small feature → `dev_story_workflow`**
- Implementation + Testing
- 2-4 hours
- No architecture changes

```bash
asmo run "Add 'remember me' checkbox to login form"
```

**Full feature → `feature_implementation_full`**
- Architecture + Development + Testing
- 4-8 hours
- Complete feature with design

```bash
asmo run "Add user profile page with avatar, bio, and settings"
```

---

#### I need to test

Choose based on test phase:

**Planning → `tea_planning_workflow`**
- Risk assessment
- Test strategy
- Test design
- 3-5 hours

```bash
asmo workflow tea_planning_workflow --task "Plan tests for checkout flow"
```

**Execution → `tea_execution_workflow`**
- Test automation
- Regression testing
- Test maintenance
- 3.5-6 hours

```bash
asmo workflow tea_execution_workflow --task "Implement automated E2E tests"
```

**Validation → `tea_validation_workflow`**
- Quality gates
- Release readiness
- 2-3 hours

```bash
asmo workflow tea_validation_workflow --task "Validate release v2.0 quality"
```

**Quick testing → `comprehensive_testing`**
- Create complete test suite
- 3-6 hours

```bash
asmo run "Create comprehensive tests for user authentication"
```

---

#### I need architecture/design

**System architecture → `architecture_design`**
- High-level system design
- Component design
- Technology decisions
- 3-6 hours

```bash
asmo workflow architecture_design --task "Design microservices architecture for e-commerce platform"
```

**API design → `api_design`**
- API contracts
- Endpoint design
- Documentation
- 2-4 hours

```bash
asmo workflow api_design --task "Design REST API for user management"
```

**UI components → `ui_component_library`**
- Component system
- Design system
- Reusable components
- 4-8 hours

```bash
asmo workflow ui_component_library --task "Create design system with buttons, inputs, cards"
```

---

#### I need code quality/review

**Code review → `code_review_workflow`**
- Quality check
- Best practices
- Security review
- 1-2 hours

```bash
asmo workflow code_review_workflow --task "Review PR #123: Add payment processing"
```

**Security audit → `security_audit`**
- Security analysis
- Vulnerability scan
- Recommendations
- 2-4 hours

```bash
asmo workflow security_audit --task "Audit authentication and authorization code"
```

**Performance optimization → `performance_optimization`**
- Performance profiling
- Optimization implementation
- Benchmarking
- 3-6 hours

```bash
asmo workflow performance_optimization --task "Optimize slow database queries in user search"
```

**Critical review → `adversarial_review_workflow`**
- Adversarial perspective
- Edge cases
- Stress testing
- 2-3 hours

```bash
asmo workflow adversarial_review_workflow --task "Critically review payment processing logic"
```

---

#### I need product/planning

**Product brief → `create_product_brief_workflow`**
- Problem statement
- Solution overview
- Success metrics
- 2 hours

**PRD → `create_prd_workflow`**
- Detailed requirements
- User stories
- Acceptance criteria
- 3-4 hours

**Sprint planning → `sprint_planning_workflow`**
- Sprint goals
- Story estimation
- Capacity planning
- 2 hours

**Retrospective → `retrospective_workflow`**
- What went well
- What to improve
- Action items
- 1 hour

---

### Workflow Comparison

| Workflow | Complexity | Time | Agents | Best For |
|----------|-----------|------|--------|----------|
| `bug_fix_workflow` | Simple-Complex | 1-3h | 3-5 | Bug fixes (adaptive) |
| `feature_implementation_full` | Medium-Complex | 4-8h | 3 | Complete features |
| `dev_story_workflow` | Simple-Medium | 2-4h | 2 | User story implementation |
| `code_refactoring` | Medium | 2-5h | 2 | Code restructuring |
| `tea_planning_workflow` | Medium | 3-5h | 3 | Test planning |
| `tea_execution_workflow` | Complex | 3.5-6h | 4 | Test execution |
| `security_audit` | Medium-Complex | 2-4h | 2 | Security review |
| `performance_optimization` | Complex | 3-6h | 2 | Performance tuning |
| `architecture_design` | Complex | 3-6h | 1 | System architecture |
| `api_design` | Medium | 2-4h | 2 | API design |

---

## Configuration

### Environment Variables

Create `.env` in your project root:

```bash
# LLM Provider Configuration
ANTHROPIC_API_KEY=sk-ant-...       # Required only for API mode
ASMO_MODE=session                   # session (default, free) or api (paid)

# ASMO Configuration
ASMO_OUTPUT_DIR=./asmo-output       # Where to save artifacts
ASMO_YOLO_MODE=false                # Auto-approve simple tasks (true/false)
ASMO_LOG_LEVEL=info                 # Logging: debug, info, warn, error
ASMO_TIMEOUT=120000                 # Analysis timeout (ms)
ASMO_APPROVAL_TIMEOUT=300000        # Approval wait time (ms, 5 min default)

# Workflow Configuration
ASMO_COMPLEXITY_THRESHOLD_SIMPLE=39     # Simple tasks: 0-39
ASMO_COMPLEXITY_THRESHOLD_MEDIUM=69     # Medium tasks: 40-69
# Complex tasks: 70-100

# Cost Control (API mode only)
ASMO_MAX_COST_PER_TASK=5.00         # Max $ per task (API mode)
ASMO_WARN_COST_THRESHOLD=1.00       # Warn if cost exceeds $ (API mode)
```

---

### Dual LLM Strategy

ASMO supports two LLM providers with automatic fallback.

#### 1. Session Provider (Default, Free)

Uses Claude CLI in session mode:

**Advantages:**
- ✅ **$0 cost** - unlimited free usage
- ✅ **Fast** - no API overhead
- ✅ **Private** - stays on your machine

**How it works:**
```typescript
// Internally runs:
claude -p "<prompt>" --session-id <session>
```

**Requirements:**
- Claude CLI installed (`claude` command available)
- No API key needed

**Configuration:**
```bash
# Session mode is default
asmo run "Your task"

# Or explicitly
ASMO_MODE=session asmo run "Your task"
```

#### 2. API Provider (Pay-per-use)

Uses Anthropic API directly:

**Advantages:**
- ✅ **Reliable** - Always available
- ✅ **Scalable** - No session limits
- ✅ **Enterprise-ready** - SLA guarantees

**Costs (approximate):**
- Simple task: $0.10 - $0.30
- Medium task: $0.30 - $1.00
- Complex task: $1.00 - $5.00

**Configuration:**
```bash
# Set API key
export ANTHROPIC_API_KEY=sk-ant-...

# Use API mode
ASMO_MODE=api asmo run "Your task"

# Or in .env
echo "ASMO_MODE=api" >> .env
echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env
```

#### Auto-Fallback

ASMO automatically falls back to API if Session fails:

```
🔍 Attempting Session Provider...
❌ Session Provider failed (Claude CLI not available)

🔄 Falling back to API Provider...
✅ API Provider connected

💰 Cost estimate: $0.50 (API mode)
❓ Continue? (Y/n)
```

**Fallback Triggers:**
- Session Provider unavailable
- Session Provider timeout
- Session Provider error

**Configuration:**
```bash
# Disable auto-fallback
ASMO_DISABLE_FALLBACK=true

# Force specific provider
ASMO_MODE=session  # No fallback, fail if session unavailable
ASMO_MODE=api      # Always use API
```

---

### YOLO Mode

Auto-approve simple, low-risk tasks.

#### Enable YOLO Mode

```bash
# Via environment variable
export ASMO_YOLO_MODE=true
asmo run "Fix typo in README"

# Via flag
asmo run "Update config.json" --yolo

# In .env
echo "ASMO_YOLO_MODE=true" >> .env
```

#### YOLO Activation Criteria

YOLO mode activates when **ALL** criteria are met:

1. **Complexity < 40** (simple task)
2. **Low risk workflow**
   - No breaking changes
   - Single file or minimal changes
   - Reversible actions
3. **No security implications**
4. **No architecture changes**

#### Examples

**YOLO Activates** ✅
```bash
asmo run "Fix typo in line 42" --yolo
# → Complexity: 10, Single file, No risk

asmo run "Update README with new badges" --yolo
# → Complexity: 15, Documentation, No risk

asmo run "Add logging to UserService" --yolo
# → Complexity: 25, Additive change, Low risk
```

**YOLO Disabled** ❌
```bash
asmo run "Migrate database to PostgreSQL" --yolo
# → Complexity: 85, High risk, Breaking change
# → Manual approval required

asmo run "Add user authentication" --yolo
# → Complexity: 65, Security implications
# → Manual approval required
```

---

## Best Practices

### 1. Write Clear Task Descriptions

**Good:**
```bash
asmo run "Fix authentication bug where users can't log in with OAuth on Safari browser"
```

**Too vague:**
```bash
asmo run "Fix auth"
```

**Tips:**
- Include **what** needs to be done
- Include **where** (which component/file)
- Include **context** (error messages, symptoms)

---

### 2. Trust Automatic Workflow Selection

Let ASMO choose the workflow based on complexity analysis.

**Recommended:**
```bash
asmo run "Add user profile feature"
# Let ASMO decide: feature_implementation_full or dev_story_workflow
```

**Manual selection (only when you know exactly what you need):**
```bash
asmo workflow bug_fix_workflow --task "Fix login error"
```

---

### 3. Review Artifacts Before Committing

Always review generated code and documentation:

```bash
# Run ASMO
asmo run "Add user authentication"

# Review artifacts
ls -la asmo-output/
cat asmo-output/*/architecture-design.md
git diff

# Review code quality
npm run lint
npm test

# Commit when satisfied
git commit -m "Add user authentication"
```

---

### 4. Use Appropriate Complexity

Don't force ASMO for trivial tasks:

**Use ASMO:** ✅
```bash
asmo run "Optimize database queries for user search"
```

**Don't use ASMO:** ❌
```bash
asmo run "Fix typo on line 42"
# Just fix it manually
```

**When in doubt:**
```bash
asmo suggest "Your task"
# Check if useAsmo: true
```

---

### 5. Leverage Session Mode for Cost Savings

Default to Session mode (free) unless you need API reliability:

```bash
# Session mode (default, free)
asmo run "Your task"

# API mode (only when needed)
ASMO_MODE=api asmo run "Critical production task"
```

---

### 6. Use YOLO Mode for Simple Repetitive Tasks

Enable YOLO for quick iterations:

```bash
# Enable YOLO
export ASMO_YOLO_MODE=true

# Quick tasks execute automatically
asmo run "Add logging to UserService"
asmo run "Update documentation for API endpoint"
asmo run "Add unit test for validateEmail"
```

---

### 7. Organize Artifacts

Keep artifacts organized per task:

```bash
# Custom output directory per task
asmo run "Feature A" --output ./features/feature-a
asmo run "Feature B" --output ./features/feature-b

# Or use date-based directories (default)
./asmo-output/2026-02-09_14-30-15_bug_fix_workflow/
./asmo-output/2026-02-09_15-45-30_feature_implementation/
```

---

## Advanced Usage

### Chaining Workflows

Execute multiple workflows in sequence:

```bash
#!/bin/bash

# Step 1: Create architecture
asmo workflow architecture_design --task "Design user authentication system"

# Step 2: Implement feature
asmo workflow feature_implementation_full --task "Implement user authentication based on architecture design"

# Step 3: Security audit
asmo workflow security_audit --task "Audit implemented authentication system"

# Step 4: Performance test
asmo workflow performance_optimization --task "Optimize authentication performance"
```

---

### Custom Workflow Variables

Pass variables to workflows (future feature):

```bash
# Set complexity override
asmo run "Add feature" --complexity 75

# Set time budget
asmo run "Fix bug" --max-time 1h

# Set output format
asmo run "Generate docs" --format markdown
```

---

### Integration with CI/CD

Use ASMO in automated pipelines:

```yaml
# .github/workflows/asmo-review.yml
name: ASMO Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  asmo-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup ASMO
        run: |
          npm install -g @asmo/cli
          echo "ANTHROPIC_API_KEY=${{ secrets.ANTHROPIC_API_KEY }}" >> .env

      - name: Run code review
        run: |
          asmo workflow code_review_workflow \
            --task "Review PR #${{ github.event.pull_request.number }}" \
            --output ./review-output \
            --yolo

      - name: Comment on PR
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const review = fs.readFileSync('./review-output/code-review.md', 'utf8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## ASMO Code Review\n\n${review}`
            });
```

---

### Programmatic Usage

Use ASMO from Node.js:

```typescript
import { DynamicOrchestrator } from '@asmo/core'

async function runAsmo() {
  const orchestrator = new DynamicOrchestrator()

  const result = await orchestrator.orchestrate({
    task: 'Fix authentication bug',
    options: {
      yoloMode: false,
      outputDir: './output',
      llmMode: 'session'
    }
  })

  console.log('Result:', result.summary)
  console.log('Artifacts:', result.artifacts)
}

runAsmo()
```

---

## Next Steps

- **[Workflow Guide](./workflow-guide.md)** - Detailed workflow reference
- **[Examples](./examples/)** - Real-world examples
- **[FAQ](./faq.md)** - Common questions
- **[Architecture](./architecture.md)** - How ASMO works
- **[API Reference](./api-reference.md)** - Programmatic usage

---

**Ready to orchestrate your AI agents?**

```bash
asmo run "Your task here"
```
