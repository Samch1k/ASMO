# User Personas

Three primary personas represent the target users of ASMO. Each persona illustrates distinct motivations, workflows, and success criteria.

---

## 1. Sarah -- Senior Backend Developer

**Role:** Senior Backend Developer at a mid-size SaaS company (50--200 engineers).

**Experience:** 7 years in software development, 2 years using AI assistants in daily work.

**Technical Profile:**
- Primary languages: TypeScript, Python
- Works across 3--5 microservices simultaneously
- Responsible for both feature implementation and bug fixes
- Runs CI/CD pipelines but does not own infrastructure

### Goals

- **Automate complex, multi-file features** without manually orchestrating each step.
- **Use a unified CLI** that handles analysis, implementation, testing, and review in one command.
- **Keep development costs at $0** by leveraging Session mode for day-to-day work.

### Pain Points

- Spends 30--40% of AI-assisted time on prompt engineering and manual coordination.
- Pays for API tokens during iterative debugging loops.
- No structured way to ensure AI-generated code meets testing and documentation standards.

### Key Scenarios

| Scenario | Workflow | Expected Outcome |
|---|---|---|
| Implement OAuth2 with PKCE | `feature_implementation_full` | Architecture, code, tests, docs -- all generated |
| Fix race condition in payment service | `bug_fix_workflow` | Root cause analysis, fix, regression tests |
| Add caching layer to user service | `performance_optimization` | Profiling, implementation, benchmarks |

### Success Criteria

- First workflow completes in < 5 minutes from install.
- 80% of daily tasks handled via Session mode ($0).
- Test coverage on generated code >= 80%.

---

## 2. Alex -- Software Architect

**Role:** Lead Architect at a startup transitioning from monolith to microservices (15--30 engineers).

**Experience:** 12 years in software development, 3 years in architecture roles.

**Technical Profile:**
- Drives system design and ADR (Architecture Decision Record) creation
- Reviews all major PRs across the team
- Evaluates technology choices and defines integration patterns
- Focuses on maintainability, scalability, and security

### Goals

- **Generate structured ADRs** through multi-agent brainstorming rather than solo drafting.
- **Run adversarial reviews** that challenge architectural decisions from multiple perspectives.
- **Standardize design processes** across the team using repeatable workflows.

### Pain Points

- ADR creation is time-consuming and often skipped under deadline pressure.
- Code reviews miss architectural issues because reviewers focus on syntax.
- No way to simulate multi-stakeholder design discussions asynchronously.

### Key Scenarios

| Scenario | Workflow | Expected Outcome |
|---|---|---|
| Design event-driven architecture | `architecture_design` (Party Mode) | ADR with trade-offs from multiple agent perspectives |
| Review microservice API contracts | `adversarial_review_workflow` | Issues found at 3 severity levels, actionable feedback |
| Define database migration strategy | `database_migration` | Migration plan, rollback strategy, data validation |

### Success Criteria

- ADR generation time reduced by 60% compared to manual drafting.
- Adversarial review catches at least 3 issues that conventional review missed.
- All design decisions are traceable through workflow execution history.

---

## 3. Mike -- DevOps Engineer

**Role:** DevOps Engineer at a regulated fintech company (100+ engineers).

**Experience:** 5 years in infrastructure and deployment, 1 year using AI tools.

**Technical Profile:**
- Manages CI/CD pipelines, Kubernetes clusters, and monitoring
- Responsible for deployment automation and incident response
- Works with compliance requirements (SOC2, PCI-DSS)
- Maintains infrastructure-as-code (Terraform, Helm)

### Goals

- **Automate deployment pipelines** with built-in quality gates and compliance checks.
- **Run retrospectives** on incidents with structured AI-assisted analysis.
- **Track metrics** across workflow executions to identify recurring issues.

### Pain Points

- Deployment scripts are fragile and poorly tested.
- Post-incident retrospectives are inconsistent and often superficial.
- No visibility into how AI-assisted changes impact system reliability.

### Key Scenarios

| Scenario | Workflow | Expected Outcome |
|---|---|---|
| Automate canary deployment pipeline | `feature_implementation_full` | Pipeline code, tests, rollback procedures |
| Post-incident retrospective | `retrospective_workflow` | Structured analysis, action items, follow-ups |
| Audit security of Helm charts | `security_audit` | Vulnerability report, remediation plan |

### Success Criteria

- Deployment automation reduces manual steps by 70%.
- Retrospective quality score >= 4/5 from team feedback.
- All workflows produce auditable execution logs for compliance.
