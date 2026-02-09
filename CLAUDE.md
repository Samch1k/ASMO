# ASMO - AI System for Multiagent Orchestration

This project uses ASMO multi-agent orchestration system. ASMO automatically routes tasks to specialized AI agents and workflows.

## System Overview

| Resource | Count |
|----------|-------|
| Agents | 25 |
| Workflows | 27 |
| Skills | 92 |
| Roles | 21 (6 core + 15 specialized) |

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

```bash
# Analyze and execute (main command)
asmo run "<task>"

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

| Workflow | Use Case | Agents |
|----------|----------|--------|
| `bug_fix_workflow` | Bug fixes, error investigation (adaptive) | debugger, developer, tester |
| `feature_implementation_full` | New features | architect, developer, tester |
| `code_refactoring` | Code restructuring | architect, developer |
| `code_review_workflow` | Code review | code-reviewer, developer |
| `dev_story_workflow` | Story implementation | developer, tester |
| `create_story_workflow` | Story creation | product-owner, developer |

### Architecture & Design

| Workflow | Use Case |
|----------|----------|
| `architecture_design` | System architecture |
| `api_design` | API design/implementation |
| `ui_component_library` | UI component system |

### Quality & Testing

| Workflow | Use Case |
|----------|----------|
| `comprehensive_testing` | Test suite creation |
| `security_audit` | Security review |
| `performance_optimization` | Speed/memory improvements |
| `performance_investigation` | Performance profiling |
| `adversarial_review_workflow` | Adversarial code review |

### TEA (Test Engineering & Automation)

**Consolidated workflows (8 → 3):**

| Workflow | Use Case | Time |
|----------|----------|------|
| `tea_planning_workflow` | Test planning: risk + strategy + design | 3h-5h |
| `tea_execution_workflow` | Test execution: automation + regression + maintenance | 3.5h-6h |
| `tea_validation_workflow` | Quality validation: gates + release readiness | 2h-3h |
| `automate_tests_workflow` | Quick test automation | 2h |

### Product & Planning

| Workflow | Use Case |
|----------|----------|
| `create_product_brief_workflow` | Product brief |
| `create_prd_workflow` | PRD creation |
| `create_ux_design_workflow` | UX design |
| `create_epics_and_stories_workflow` | Epics & stories |
| `sprint_planning_workflow` | Sprint planning |
| `check_implementation_readiness_workflow` | Implementation readiness |
| `correct_course_workflow` | Course correction |
| `retrospective_workflow` | Retrospective |

### Database

| Workflow | Use Case |
|----------|----------|
| `database_migration` | Database migration |

## Integration

ASMO integrates with Claude Code via:
1. **CLAUDE.md** (this file) - instructions
2. **Hook** - automatic suggestion on complex tasks

When you see a suggestion to use ASMO, consider running:
```bash
asmo run "<the task>"
```

## Project Structure

```
packages/
  core/           # ASMO core library
  cli/            # CLI interface (asmo command)
    bin/asmo.js   # Entry point
```

## Environment

Ensure `.env` exists with:
```
ANTHROPIC_API_KEY=sk-ant-...  # Required for API mode only
```

Session mode (default) uses Claude CLI ($0 cost). API mode is used as fallback or when explicitly selected. See `packages/core/docs/llm-provider-factory.md` for details.
