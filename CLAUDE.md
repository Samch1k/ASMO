# ASMO - AI System for Multiagent Orchestration

This project uses ASMO multi-agent orchestration system. ASMO automatically routes tasks to specialized AI agents and workflows.

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

# BMAD menu commands (bilingual shortcuts) - NEW in v3.0
asmo run "[DS] implement feature"   # Dev Story (TDD with Amelia)
asmo run "[CR] review code"         # Code Review
asmo run "[CS] create story"        # Create Story (Bob's zero ambiguity)
asmo run "[IR]"                     # Implementation Readiness

# Russian menu commands also supported
asmo run "[ИС] реализовать функцию"  # Dev Story
asmo run "[КО] проверить код"        # Code Review
asmo run "[СИ] создать историю"      # Create Story
asmo run "[ГР]"                      # Implementation Readiness

# Get ASMO recommendation (fast, for hooks)
asmo suggest "<task>"

# Analyze complexity only
asmo analyze "<task>"

# List available workflows
asmo workflow

# Run specific workflow
asmo workflow <name> --task "<task>"
```

## BMAD Menu Commands (v3.0)

ASMO now supports bilingual menu commands for rapid workflow execution:

| EN | RU | Workflow | BMAD Agent | Principle Enforced |
|----|----|----------|------------|--------------------|
| `[DS]` | `[ИС]` | Dev Story (TDD) | Amelia | Test Enforcement - blocks if tests fail |
| `[CS]` | `[СИ]` | Create Story | Bob + John | Zero Ambiguity + WHY First |
| `[CR]` | `[КО]` | Code Review | Multiple | Comprehensive quality gates |
| `[IR]` | `[ГР]` | Implementation Readiness | Bob | Requirement clarity check |
| `[CC]` | `[КК]` | Course Correction | Winston | Risk assessment |

**Example usage:**
```bash
# English: TDD implementation with strict test enforcement
asmo run "[DS] implement OAuth2 authentication"

# Russian: Story creation with zero ambiguity enforcement
asmo run "[СИ] добавить систему уведомлений"
```

### BMAD Agent Personalities

- **Amelia** (Developer): TDD evangelist - "I will not mark this complete until 100% of tests pass"
- **Winston** (Architect): Boring tech advocate - Prefers PostgreSQL over MongoDB, REST over GraphQL
- **Bob** (Scrum Master): Zero ambiguity guardian - Blocks vague terms like "fast", "many", "user-friendly"
- **John** (Product Owner): WHY-first leader - Requires business value explanation in all stories

## Available Workflows

| Workflow | Use Case | Agents |
|----------|----------|--------|
| `bug_fix_workflow` | Bug fixes, error investigation | debugger, developer |
| `feature_implementation_full` | New features | architect, developer, tester |
| `code_refactoring` | Code restructuring | architect, developer |
| `performance_optimization` | Speed/memory improvements | optimizer, developer |
| `security_audit` | Security review | security-specialist, tester |
| `comprehensive_testing` | Test suite creation | tester, developer |
| `api_design` | API design/implementation | architect, developer |
| `architecture_design` | System architecture | architect |

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
ANTHROPIC_API_KEY=sk-ant-...  # Required for API mode
```

Session mode (default) uses Claude subscription ($0 cost).
