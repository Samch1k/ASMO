# ASMO - AI System for Multiagent Orchestration

This project uses ASMO multi-agent orchestration system. ASMO automatically routes tasks to specialized AI agents and workflows.

## System Overview

| Resource  | Count                                       |
| --------- | ------------------------------------------- |
| Agents    | 25                                          |
| Workflows | 27                                          |
| Skills    | 55                                          |
| Roles     | 25 (6 core + 15 specialized + 4 validation) |

**Key architecture features:**

- Dual LLM provider: Session ($0 via Claude CLI) / API (pay-per-use) -- see `packages/core/docs/llm-provider-factory.md`
- Adaptive Phase Detection: workflows can be joined at any phase -- see `packages/core/docs/adaptive-phase-detection.md`
- YOLO mode: auto-approve low-complexity tasks via ApprovalCheckpoint

## When to Use ASMO

Use `asmo run "<task>"` when the task involves:

### Complexity Indicators

- **Multiple files** need to be changed
- **Multiple concerns** (e.g., code + tests + docs)
- **Architectural decisions** required
- **Cross-cutting concerns** (security, performance, etc.)

### Specialized Work

- **Security**: authentication, authorization, vulnerability fixes
- **Performance**: optimization, profiling, caching
- **Architecture**: system design, refactoring, API design
- **Database**: migrations, schema changes, query optimization
- **Testing**: test suites, E2E tests, coverage improvements
- **DevOps**: CI/CD, deployment, infrastructure

### Multi-Agent Tasks

- Feature implementation (architect + developer + tester)
- Bug fixes requiring investigation (debugger + developer)
- Security audits (security-specialist + tester)
- Performance optimization (optimizer + developer)

## When NOT to Use ASMO

Handle directly without ASMO:

- Simple typo fixes
- Single-line changes
- Documentation updates (unless comprehensive)
- Quick questions about codebase
- File reading/exploration

## Quick Check

Run this to get a recommendation:

```bash
node packages/cli/bin/asmo.js suggest "<your task>"
```

Returns JSON with `useAsmo: true/false` and reasoning.

## Available Commands

### Main Command

```bash
# Default: uses Session mode ($0) → API → Heuristics
asmo run "<task>"

# Force API mode (requires ANTHROPIC_API_KEY)
asmo run "<task>" --use-api

# Disable LLM, use heuristics only (fast, offline)
asmo run "<task>" --no-llm

# Verbose output
asmo run "<task>" --verbose

# Dry run (analysis only, no execution)
asmo run "<task>" --dry-run

# Override workflow selection
asmo run "<task>" --workflow bug_fix_workflow
```

**CLI Flags**:

- `--use-api` - Force API mode (pay-per-token, requires `ANTHROPIC_API_KEY`)
- `--no-llm` - Disable LLM analysis, use keyword-based heuristics (~65% accuracy)
- `--verbose` - Detailed logging
- `--dry-run` - Analyze only, don't execute
- `--workflow <name>` - Override automatic workflow selection

### Other Commands

```bash
# Get ASMO recommendation (fast, for hooks)
asmo suggest "<task>"

# Analyze complexity only
asmo analyze "<task>"

# List available workflows
asmo workflow

# Run specific workflow
asmo workflow <name> --task "<task>"
```

## Available Workflows

### Core Development

| Workflow                      | Use Case                                  | Agents                       |
| ----------------------------- | ----------------------------------------- | ---------------------------- |
| `bug_fix_workflow`            | Bug fixes, error investigation (adaptive) | debugger, developer, tester  |
| `feature_implementation_full` | New features                              | architect, developer, tester |
| `code_refactoring`            | Code restructuring                        | architect, developer         |
| `code_review_workflow`        | Code review                               | code-reviewer, developer     |
| `dev_story_workflow`          | Story implementation                      | developer, tester            |
| `create_story_workflow`       | Story creation                            | product-owner, developer     |

### Architecture & Design

| Workflow               | Use Case                  |
| ---------------------- | ------------------------- |
| `architecture_design`  | System architecture       |
| `api_design`           | API design/implementation |
| `ui_component_library` | UI component system       |

### Quality & Testing

| Workflow                      | Use Case                  |
| ----------------------------- | ------------------------- |
| `comprehensive_testing`       | Test suite creation       |
| `security_audit`              | Security review           |
| `performance_optimization`    | Speed/memory improvements |
| `performance_investigation`   | Performance profiling     |
| `adversarial_review_workflow` | Adversarial code review   |

### TEA (Test Engineering & Automation)

**Consolidated workflows (8 → 3):**

| Workflow                  | Use Case                                              | Time    |
| ------------------------- | ----------------------------------------------------- | ------- |
| `tea_planning_workflow`   | Test planning: risk + strategy + design               | 3h-5h   |
| `tea_execution_workflow`  | Test execution: automation + regression + maintenance | 3.5h-6h |
| `tea_validation_workflow` | Quality validation: gates + release readiness         | 2h-3h   |
| `automate_tests_workflow` | Quick test automation                                 | 2h      |

### Product & Planning

| Workflow                                  | Use Case                 |
| ----------------------------------------- | ------------------------ |
| `create_product_brief_workflow`           | Product brief            |
| `create_prd_workflow`                     | PRD creation             |
| `create_ux_design_workflow`               | UX design                |
| `create_epics_and_stories_workflow`       | Epics & stories          |
| `sprint_planning_workflow`                | Sprint planning          |
| `check_implementation_readiness_workflow` | Implementation readiness |
| `correct_course_workflow`                 | Course correction        |
| `retrospective_workflow`                  | Retrospective            |

### Database

| Workflow             | Use Case           |
| -------------------- | ------------------ |
| `database_migration` | Database migration |

## Integration

ASMO integrates with Claude Code via:

1. **CLAUDE.md** (this file) - instructions
2. **Hook** - automatic suggestion on complex tasks

When you see a suggestion to use ASMO, consider running:

```bash
asmo run "<the task>"
```

## ⚠️ Critical Execution Protocol for Claude Code

**When user request STARTS WITH "asmo" (e.g., "asmo run ...", "asmo Проведи...", "asmo suggest..."):**

### MANDATORY RULES:

1. **Always use Bash tool** to execute the actual ASMO CLI command
   - Example: `asmo run "Проведи аудит"` → `Bash: asmo run "Проведи аудит"`
   - NEVER decompose via internal Task/Agent tools

2. **Parse request content, NOT syntax**
   - Russian/English multilingual requests are valid
   - "asmo Проведи..." is same as "asmo run ..." (both trigger Bash execution)
   - Language does NOT affect the execution pattern

3. **Do NOT manually orchestrate agents**
   - ASMO has its own agent routing system
   - Your job: run the CLI, not replicate its logic
   - Let WorkflowEngine select agents, not you

4. **Flags and options preservation**
   - Preserve all flags: `--use-api`, `--no-llm`, `--verbose`, `--dry-run`, `--workflow`
   - Pass them exactly as provided to the asmo CLI

5. **Error handling**
   - If asmo command fails, report the error
   - Don't retry silently or decompose the task
   - Ask user for clarification if needed

### QUICK CHECKLIST:
- [ ] Request starts with "asmo"? → Use Bash to run it
- [ ] Language is Russian/multilingual? → Still run via Bash
- [ ] Tempted to use Task tool? → DON'T. Use Bash instead.
- [ ] Want to optimize/decompose? → Let ASMO do it via CLI

### EXAMPLE:
```
User: "asmo run 'Добавь тесты для модуля auth'"
Claude Code:
❌ WRONG: Task tool with Explore agent
✅ CORRECT: Bash tool: asmo run 'Добавь тесты для модуля auth'
```

## Project Structure

```
packages/
  core/           # ASMO core library
  cli/            # CLI interface (asmo command)
    bin/asmo.js   # Entry point
```

## Environment

### LLM Provider Modes

ASMO supports three LLM modes:

| Mode                  | Cost          | Requirements                         | Use Case                                               |
| --------------------- | ------------- | ------------------------------------ | ------------------------------------------------------ |
| **Session** (default) | $0            | Claude CLI installed + authenticated | Default, cost-effective                                |
| **API**               | Pay-per-token | `ANTHROPIC_API_KEY` in `.env`        | Fallback, or forced via `--use-api`                    |
| **Heuristics**        | $0            | None                                 | Offline mode, or forced via `--no-llm` (~65% accuracy) |

### Setup

**For Session Mode** (recommended, $0 cost):

```bash
# Install Claude CLI (if not already installed)
# macOS:
brew install anthropic/claude/claude

# Linux:
curl -fsSL https://cli.anthropic.com/install.sh | sh

# Authenticate
claude auth login
```

**For API Mode** (fallback or explicit):

Create `.env` file:

```bash
ANTHROPIC_API_KEY=sk-ant-...  # Get from console.anthropic.com
```

**Automatic Fallback**:

1. Try Session mode (Claude CLI) → $0
2. If unavailable, try API mode (`ANTHROPIC_API_KEY`) → $$$
3. If unavailable, use heuristics with warning → $0 but ~65% accuracy

### Input Validation

All user prompts are validated before processing:

**Validation Checks** (10 total):

- ✅ Empty/null check
- ✅ Length limits (3-10,000 characters)
- ✅ UTF-8 encoding validation
- ✅ Control character removal (security)
- ✅ Whitespace normalization

**Security**: Null bytes, control characters, and excessive whitespace are automatically sanitized.

### Keyword Analysis

ASMO uses centralized keyword analysis for task classification:

**14 Categories**:

- `trivial` - typos, text changes (score: 15)
- `bug_fix` - bugs, errors, crashes (score: 25)
- `architecture` - system design, architecture (score: 75)
- `security` - auth, encryption, oauth (score: 70)
- `performance` - optimization, speed (score: 65)
- `database` - migrations, schema (score: 60)
- `refactoring` - cleanup, improve (score: 50)
- `api` - endpoints, REST, GraphQL (score: 50)
- `feature` - new features, implement (score: 55)

**Impact Modifiers**:

- `high_risk` - core, modify, redesign (+10 score)
- `data_impact` - database changes detected
- `security_impact` - security-sensitive tasks
- `performance_impact` - performance-critical tasks

See `packages/core/docs/llm-provider-factory.md` for LLM details.
