# Non-Functional Requirements

Non-functional requirements (NFRs) define the quality attributes that ASMO must satisfy across all functional requirements.

## NFR-1: Performance

| ID | Requirement | Target | Notes |
|---|---|---|---|
| NFR-1.1 | Task analysis latency | < 5 seconds | ComplexityAnalyzer end-to-end, including LLM call |
| NFR-1.2 | Workflow selection latency | < 2 seconds | WorkflowSelector matching and configuration |
| NFR-1.3 | Phase execution timeout | 30 seconds (configurable) | Default; adjustable via configuration tier |
| NFR-1.4 | Maximum concurrent agents | 10 | Per workflow execution; Party Mode uses this limit |
| NFR-1.5 | CLI startup time | < 1 second | From command invocation to first meaningful output |

**Rationale:** Performance targets ensure ASMO remains responsive during interactive CLI use. The 5-second analysis window prevents user frustration during the initial task evaluation.

## NFR-2: Reliability

| ID | Requirement | Target | Notes |
|---|---|---|---|
| NFR-2.1 | Circuit breaker threshold | 5 consecutive failures | Trips and halts workflow; prevents infinite retry loops |
| NFR-2.2 | Maximum retry count | 3 per phase | IterationManager enforces; configurable per workflow |
| NFR-2.3 | Error categorization | 100% of errors categorized | Transient, permanent, configuration -- all errors classified |
| NFR-2.4 | System uptime | >= 99% | Measured as CLI availability (no crashes on valid input) |
| NFR-2.5 | Graceful degradation | Required | LLM unavailable -> heuristics; MCP unavailable -> skip |

**Rationale:** Reliability targets ensure that ASMO fails predictably. The circuit breaker prevents runaway costs from repeated LLM calls. Error categorization enables actionable feedback to users.

## NFR-3: Scalability

| ID | Requirement | Target | Notes |
|---|---|---|---|
| NFR-3.1 | Supported workflows | 100+ | System must load and index without performance degradation |
| NFR-3.2 | Supported agents | 100+ | Agent registry must handle at scale |
| NFR-3.3 | Supported skills | 500+ | SkillMatcher must resolve dependencies efficiently |
| NFR-3.4 | Concurrent workflow executions | 50 | Across multiple CLI invocations or programmatic use |
| NFR-3.5 | Configuration file size | No hard limit | ConfigLoader must handle large project configurations |

**Rationale:** Scalability targets future-proof ASMO for enterprise adoption. Current counts (25 agents, 27 workflows, 55 skills) are well within these limits, leaving room for community-contributed extensions.

## NFR-4: Maintainability

| ID | Requirement | Target | Notes |
|---|---|---|---|
| NFR-4.1 | TypeScript strict mode | 100% compliance | `strict: true` in tsconfig, zero type errors |
| NFR-4.2 | Test coverage | >= 80% | Measured by Jest; applies to `packages/core` and `packages/cli` |
| NFR-4.3 | JSDoc coverage | >= 90% | All public APIs and exported functions documented |
| NFR-4.4 | TypeScript errors | Zero | CI must pass with zero TS compilation errors |
| NFR-4.5 | Dependency count | Minimized | Prefer native solutions over external packages |
| NFR-4.6 | Monorepo structure | Enforced | `packages/core` + `packages/cli` separation maintained |

**Rationale:** Maintainability targets ensure the codebase remains approachable for contributors. Strict TypeScript and high test coverage reduce the cost of changes.

## NFR-5: Security

| ID | Requirement | Target | Notes |
|---|---|---|---|
| NFR-5.1 | API key storage | Environment variables only | No hardcoded keys; `.env` file excluded from git |
| NFR-5.2 | Sensitive data in logs | Zero | API keys, tokens, and credentials must never appear in logs |
| NFR-5.3 | MCP access control | Role-based | Each agent role has a defined set of permitted MCP servers |
| NFR-5.4 | Input validation | Zod schemas | All external input validated before processing |
| NFR-5.5 | Control character handling | Sanitized | Null bytes and control characters removed from user input |
| NFR-5.6 | Dependency auditing | Required | `pnpm audit` must pass with zero critical vulnerabilities |

**Rationale:** Security targets protect both the user's environment and the integrity of ASMO's operations. Role-based MCP access prevents agents from performing actions outside their designated scope.

## Summary

| Category | NFR Count | Critical (Must-Have) | Important (Should-Have) |
|---|---|---|---|
| Performance | 5 | 3 (latency targets) | 2 (concurrency, startup) |
| Reliability | 5 | 3 (circuit breaker, retries, categorization) | 2 (uptime, degradation) |
| Scalability | 5 | 2 (workflows, agents) | 3 (skills, concurrency, config) |
| Maintainability | 6 | 3 (strict mode, coverage, zero errors) | 3 (JSDoc, deps, monorepo) |
| Security | 6 | 4 (keys, logs, RBAC, validation) | 2 (sanitization, auditing) |
| **Total** | **27** | **15** | **12** |
