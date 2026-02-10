# ASMO Feature Matrix

Comprehensive status of all agents, workflows, skills, and platform features in ASMO v1.1.0.

---

## Agents (25)

### Core Agents (6)

| Agent | Role | Status | Notes |
|-------|------|--------|-------|
| architect | System and solution design | Ready | Defines structure, API contracts, technology choices |
| developer | Implementation | Ready | Core coding agent, handles most implementation work |
| debugger | Investigation and diagnosis | Ready | Root cause analysis, error tracing |
| optimizer | Performance tuning | Ready | Profiling, bottleneck identification, optimization |
| tester | Quality assurance | Ready | Unit, integration, and E2E test creation |
| devops | Infrastructure and deployment | Ready | CI/CD, containerization, monitoring setup |

### Specialized Agents (15)

| Agent | Role | Status | Notes |
|-------|------|--------|-------|
| security-specialist | Security review and hardening | Ready | Auth, encryption, vulnerability analysis |
| code-reviewer | Code quality review | Ready | Style, patterns, maintainability |
| product-owner | Product direction and requirements | Ready | Story writing, acceptance criteria |
| ux-designer | User experience design | Ready | Wireframes, interaction flows |
| data-engineer | Data pipeline design | Ready | ETL, schema design, migrations |
| api-designer | API architecture | Ready | REST, GraphQL, contract design |
| doc-writer | Documentation | Ready | Technical writing, API docs |
| release-manager | Release coordination | Ready | Versioning, changelog, deployment |
| mentor | Code education and guidance | Ready | Best practices, pattern explanations |
| scrum-master | Agile process facilitation | Ready | Sprint planning, retrospectives |
| integration-specialist | System integration | Ready | Third-party APIs, middleware |
| accessibility-specialist | Accessibility compliance | Ready | WCAG, ARIA, screen reader support |
| mobile-developer | Mobile development | Ready | iOS, Android, React Native |
| ml-engineer | Machine learning | Ready | Model design, training pipelines |
| tech-lead | Technical leadership | Ready | Architecture decisions, team coordination |

### Validation Agents (4)

| Agent | Role | Status | Notes |
|-------|------|--------|-------|
| adversarial-reviewer | Must-find-issues review | Ready | Intentionally critical code review |
| compliance-checker | Regulatory compliance | Ready | GDPR, SOC2, HIPAA checks |
| chaos-tester | Resilience testing | Ready | Failure injection, edge cases |
| benchmark-analyst | Performance benchmarking | Ready | Comparative analysis, regression detection |

---

## Workflows (27)

### Implementation (10)

| Workflow | Use Case | Status | Est. Time |
|----------|----------|--------|-----------|
| bug_fix_workflow | Bug fixes, error investigation | Ready | 30m-2h |
| feature_implementation_full | New feature development | Ready | 4-8h |
| code_refactoring | Code restructuring and cleanup | Ready | 2-4h |
| code_review_workflow | Structured code review | Ready | 1-2h |
| dev_story_workflow | Story implementation | Ready | 2-4h |
| performance_optimization | Speed and memory improvements | Ready | 2-6h |
| security_audit | Security vulnerability review | Ready | 3-6h |
| architecture_design | System architecture planning | Ready | 4-8h |
| database_migration | Schema changes and migrations | Ready | 2-4h |
| api_design | API design and implementation | Ready | 3-6h |

### Discovery (7)

| Workflow | Use Case | Status | Est. Time |
|----------|----------|--------|-----------|
| adversarial_review_workflow | Adversarial code review | Ready | 1-2h |
| create_product_brief_workflow | Product brief creation | Ready | 2-3h |
| create_prd_workflow | PRD creation | Ready | 3-5h |
| create_ux_design_workflow | UX design | Ready | 3-5h |
| create_epics_and_stories_workflow | Epics and stories breakdown | Ready | 2-4h |
| check_implementation_readiness_workflow | Readiness assessment | Ready | 1-2h |
| sprint_planning_workflow | Sprint planning | Ready | 2-3h |

### Post-Implementation (6)

| Workflow | Use Case | Status | Est. Time |
|----------|----------|--------|-----------|
| correct_course_workflow | Course correction | Ready | 1-2h |
| retrospective_workflow | Retrospective analysis | Ready | 1-2h |
| automate_tests_workflow | Quick test automation | Ready | 2h |
| dev_story_workflow | Development story execution | Ready | 2-4h |
| code_review_workflow | Code review | Ready | 1-2h |
| create_story_workflow | Story creation | Ready | 1-2h |

### TEA -- Test Engineering & Automation (3)

| Workflow | Use Case | Status | Est. Time |
|----------|----------|--------|-----------|
| tea_planning_workflow | Risk assessment + test strategy + test design | Ready | 3-5h |
| tea_execution_workflow | Test automation + regression + maintenance | Ready | 3.5-6h |
| tea_validation_workflow | Quality gates + release readiness | Ready | 2-3h |

TEA workflows were consolidated from the original 8 workflows into 3, a 62% reduction with no loss of coverage.

### UI (1)

| Workflow | Use Case | Status | Est. Time |
|----------|----------|--------|-----------|
| ui_component_library | UI component system design | Ready | 4-8h |

---

## Skills (55)

| Category | Count | Status | Examples |
|----------|-------|--------|----------|
| Analysis | 6 | Ready | Complexity analysis, dependency mapping, impact assessment |
| Architecture | 5 | Ready | System design, pattern selection, scalability planning |
| Coding | 8 | Ready | Implementation, refactoring, code generation |
| Testing | 7 | Ready | Unit tests, integration tests, E2E tests, mocking |
| Security | 5 | Ready | Vulnerability scanning, auth review, encryption |
| Performance | 4 | Ready | Profiling, optimization, caching strategies |
| Database | 4 | Ready | Schema design, migration, query optimization |
| API | 4 | Ready | REST design, GraphQL, contract validation |
| DevOps | 4 | Ready | CI/CD, containerization, monitoring |
| Documentation | 3 | Ready | Technical writing, API docs, architecture docs |
| Planning | 3 | Ready | Sprint planning, estimation, risk assessment |
| Review | 2 | Ready | Code review, adversarial review |

Skills were consolidated from 85 to 55 (-35%) during the v1.1.0 development cycle, removing redundancies and merging overlapping capabilities.

---

## Key Platform Features

| Feature | Status | Notes |
|---------|--------|-------|
| Dual LLM Provider (Session/API/Heuristics) | Ready | Session mode ($0) is default, API fallback, heuristics offline |
| YOLO Mode | Ready | Auto-approve tasks with complexity score < 30 |
| Party Mode | Ready | Multi-agent collaboration on a single task |
| Adversarial Review | Ready | Must-find-issues review mode for critical code |
| Adaptive Phase Detection | Ready | LLM-powered phase skip, join workflows mid-stream |
| Context Cascade | Ready | Phase-to-phase data flow, no context loss between agents |
| Circuit Breaker | Ready | 5-failure threshold, prevents cascading agent failures |
| Iteration Manager | Ready | Manages iterative refinement loops within workflows |
| BMAD Personalities | Ready | 4 personality modes for agent behavior tuning |
| Bilingual Support (EN/RU) | Ready | Cyrillic auto-detection, full Russian language support |
| Metrics & Learning | Ready | SQLite persistence, MetricsOptimizer learning loop |
| MCP Integration | Ready | 8 MCP servers for extended tool access |
| Zod Validation | Ready | All inputs validated with Zod schemas |
| Input Sanitization | Ready | 10 validation checks including UTF-8, control chars, null bytes |
| Keyword Analysis | Ready | 14 categories, centralized classification engine |
| `--dry-run` Mode | Ready | Preview execution plan without running |
| `--verbose` Mode | Ready | Detailed logging of agent activity |
| `--workflow` Override | Ready | Force a specific workflow selection |
| `--no-llm` Mode | Ready | Heuristics-only, offline, ~65% accuracy |
| `--use-api` Mode | Ready | Force API mode (pay-per-token) |
