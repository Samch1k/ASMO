# Scope

This document defines the boundary of what ASMO handles and what should be handled directly without orchestration.

## In Scope -- Use ASMO When

### Complexity Indicators

The following characteristics signal that a task benefits from multi-agent orchestration:

- **Multiple files** need to be changed across the codebase.
- **Multiple concerns** are involved (e.g., code + tests + documentation).
- **Architectural decisions** are required before implementation can begin.
- **Cross-cutting concerns** such as security, performance, or observability are affected.

### Specialized Work

ASMO provides dedicated agents and workflows for domain-specific tasks:

| Domain | Examples | Relevant Workflows |
|---|---|---|
| **Security** | Authentication, authorization, vulnerability fixes | `security_audit` |
| **Performance** | Optimization, profiling, caching strategies | `performance_optimization`, `performance_investigation` |
| **Architecture** | System design, refactoring, API design | `architecture_design`, `api_design`, `code_refactoring` |
| **Database** | Migrations, schema changes, query optimization | `database_migration` |
| **Testing** | Test suites, E2E tests, coverage improvements | `comprehensive_testing`, `tea_*` workflows |
| **DevOps** | CI/CD, deployment, infrastructure | Deployment-related workflows |

### Multi-Agent Tasks

Tasks that require coordination between multiple specialized roles:

| Task Pattern | Agents Involved | Workflow |
|---|---|---|
| Feature implementation | Architect + Developer + Tester | `feature_implementation_full` |
| Bug investigation and fix | Debugger + Developer + Tester | `bug_fix_workflow` |
| Security audit | Security Specialist + Tester | `security_audit` |
| Performance optimization | Optimizer + Developer | `performance_optimization` |
| Adversarial code review | Code Reviewer + Developer | `adversarial_review_workflow` |

### Quick Check

Run the following to get an automated recommendation:

```bash
asmo suggest "<your task>"
```

Returns JSON with `useAsmo: true/false` and reasoning based on keyword and complexity analysis.

## Out of Scope -- Handle Directly

The following tasks should be handled without ASMO orchestration. Using ASMO for these adds unnecessary overhead:

| Task Type | Examples | Why Direct Is Better |
|---|---|---|
| **Simple typo fixes** | Fix a misspelled variable name | Single change, no coordination needed |
| **Single-line changes** | Update a version number, toggle a flag | Overhead exceeds value |
| **Documentation updates** | Fix a broken link, update a paragraph | Unless comprehensive rewrite |
| **Quick questions** | "What does this function do?" | No workflow needed, just read the code |
| **File exploration** | "Show me the project structure" | Standard CLI / editor task |

### Rule of Thumb

If a task can be completed in a single prompt with a single file change, handle it directly. If it requires planning, multiple files, or domain expertise, use ASMO.

## Scope Evolution

As ASMO matures, scope may expand to include:

- **IDE integration** -- VS Code extension for in-editor orchestration.
- **CI/CD pipeline integration** -- Automated quality gates in pull request workflows.
- **Team-level orchestration** -- Coordinating across multiple developers' ASMO instances.

These are not committed deliverables. They represent potential future directions tracked in the project roadmap.
