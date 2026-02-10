# Use Cases

Five primary use cases illustrate ASMO's capabilities across different complexity levels and collaboration patterns.

---

## UC-1: Simple Bug Fix (YOLO Mode)

**Complexity:** Trivial (score ~15)
**Workflow:** `bug_fix_workflow`
**Agents:** Debugger, Developer
**Target Time:** < 60 seconds

### Scenario

A developer discovers that a utility function returns `null` instead of an empty array when no results are found. This causes a downstream `TypeError: Cannot read properties of null`.

### Flow

1. Developer runs: `asmo run "Fix null return in getUserRoles() — should return empty array"`
2. `ComplexityAnalyzer` scores the task at 15 (trivial: single function, clear fix).
3. `WorkflowSelector` picks `bug_fix_workflow`.
4. `ApprovalCheckpoint` activates **YOLO mode** (score < 30) -- auto-approved, no human prompt.
5. Debugger agent locates `getUserRoles()`, confirms the null return path.
6. Developer agent applies the fix: `return results ?? []`.
7. Result returned to user in under 60 seconds.

### Key Behavior

- No human approval required (YOLO bypass).
- Minimal agent involvement (2 agents, sequential).
- Circuit breaker and retries are available but unlikely to trigger.

---

## UC-2: Feature Implementation with Brainstorming

**Complexity:** High (score ~75)
**Workflow:** `feature_implementation_full`
**Agents:** Architect, Developer, Tester
**Estimated Time:** 15--30 minutes

### Scenario

A team needs to implement a notification system supporting email, SMS, and push notifications with a pluggable provider architecture.

### Flow

1. Developer runs: `asmo run "Implement multi-channel notification system with pluggable providers"`
2. `ComplexityAnalyzer` scores at 75 (high: multiple concerns, architectural decisions, new subsystem).
3. `WorkflowSelector` picks `feature_implementation_full`.
4. `ApprovalCheckpoint` prompts user for confirmation (score >= 30).
5. **Design phase:** Architect agent produces:
   - Interface definitions for `NotificationProvider`, `NotificationChannel`
   - ADR documenting the pluggable provider pattern vs. alternatives
   - Dependency graph and integration points
6. **Implementation phase:** Developer agent writes:
   - Core notification service
   - Email, SMS, push provider implementations
   - Configuration and factory pattern for provider registration
7. **Testing phase:** Tester agent generates:
   - Unit tests for each provider
   - Integration tests for the notification pipeline
   - Edge case tests (provider failure, retry, fallback)
8. `ContextCascade` ensures each phase builds on the previous output.

### Key Behavior

- ADR (Architecture Decision Record) generated automatically.
- All three agents contribute sequentially, with context flowing between phases.
- Test coverage targets >= 80% for new code.

---

## UC-3: Adversarial Code Review

**Complexity:** Medium (score ~50)
**Workflow:** `adversarial_review_workflow`
**Agents:** Code Reviewer, Developer
**Estimated Time:** 10--15 minutes

### Scenario

A critical authentication module has been updated. Before merging, the team wants an adversarial review that actively tries to find vulnerabilities.

### Flow

1. Developer runs: `asmo run "Adversarial review of auth module changes in src/auth/"`
2. `ComplexityAnalyzer` scores at 50 (medium: focused scope but security-sensitive).
3. `WorkflowSelector` picks `adversarial_review_workflow`.
4. `ApprovalCheckpoint` prompts user for confirmation.
5. **Review phase (Level 1 -- Standard):** Code Reviewer agent examines:
   - Logic correctness
   - Error handling completeness
   - Input validation coverage
6. **Review phase (Level 2 -- Adversarial):** Code Reviewer agent attempts:
   - Injection attack vectors
   - Authentication bypass scenarios
   - Race condition exploitation
   - Token manipulation
7. **Review phase (Level 3 -- Escalated):** If minimum issue count not met, the reviewer escalates:
   - Broader context analysis (what callers assume about this module)
   - Dependency chain vulnerabilities
   - Configuration-based attack surfaces
8. Developer agent produces fix recommendations for each found issue.

### Key Behavior

- **Minimum issue requirement:** The reviewer must find at least N issues (configurable).
- **3-level escalation:** Each level broadens the attack surface examined.
- Issues are categorized by severity: critical, major, minor.

---

## UC-4: TEA Test Planning

**Complexity:** High (score ~70)
**Workflow:** `tea_planning_workflow`
**Agents:** Test Planner, Risk Analyst, Test Designer
**Estimated Time:** 3--5 hours

### Scenario

A new payment processing module needs a comprehensive test strategy before development begins. The module handles credit cards, ACH transfers, and cryptocurrency payments.

### Flow

1. QA Lead runs: `asmo run "Create test plan for payment processing module with card, ACH, and crypto"`
2. `ComplexityAnalyzer` scores at 70 (high: multiple payment methods, compliance, security).
3. `WorkflowSelector` picks `tea_planning_workflow`.
4. **Risk Assessment phase:**
   - Identify risk areas: PCI compliance, transaction atomicity, currency conversion
   - Prioritize by impact and likelihood
   - Map risks to test coverage requirements
5. **Strategy phase:**
   - Define test levels: unit, integration, E2E, performance, security
   - Allocate effort per payment method
   - Define environment requirements (sandbox accounts, test cards)
6. **Test Design phase:**
   - Produce test case specifications for each payment method
   - Define data requirements and fixtures
   - Create traceability matrix: requirement -> test case -> risk

### Key Behavior

- Produces a complete test strategy document.
- Risk assessment drives test prioritization.
- Output is structured for direct use by QA teams.

---

## UC-5: Architecture Design with Party Mode

**Complexity:** Critical (score ~90)
**Workflow:** `architecture_design`
**Agents:** Multiple architect-role agents (Party Mode)
**Estimated Time:** 30--60 minutes

### Scenario

The engineering team is migrating from a monolithic application to microservices. They need a target architecture that addresses service boundaries, data ownership, communication patterns, and deployment strategy.

### Flow

1. Architect runs: `asmo run "Design microservice architecture for e-commerce platform migration"`
2. `ComplexityAnalyzer` scores at 90 (critical: system-wide impact, multiple domains).
3. `WorkflowSelector` picks `architecture_design`.
4. **Brainstorming phase (Party Mode):** Multiple agents contribute simultaneously:
   - **Agent A** proposes domain-driven service boundaries
   - **Agent B** advocates for event-driven communication (Kafka/NATS)
   - **Agent C** argues for synchronous APIs with circuit breakers
   - **Agent D** evaluates data ownership and consistency models
5. **Convergence phase:** Agents synthesize perspectives into:
   - Service boundary definitions with bounded contexts
   - Communication pattern selection with trade-off analysis
   - Data migration strategy (strangler fig pattern)
   - ADR for each major decision
6. **Validation phase:** Adversarial review of the proposed architecture:
   - Single point of failure analysis
   - Scalability bottleneck identification
   - Operational complexity assessment

### Key Behavior

- **Party Mode:** Agents run in parallel, producing independent perspectives before converging.
- Multiple ADRs generated, one per major architectural decision.
- Adversarial validation ensures the design is challenged before acceptance.

---

## Use Case Summary

| UC | Complexity | Score | YOLO | Agents | Key Feature |
|---|---|---|---|---|---|
| UC-1 | Trivial | ~15 | Yes | 2 | Auto-approval, < 60s |
| UC-2 | High | ~75 | No | 3 | ADR generation, context cascade |
| UC-3 | Medium | ~50 | No | 2 | 3-level escalation, minimum issues |
| UC-4 | High | ~70 | No | 3 | Risk-driven test planning |
| UC-5 | Critical | ~90 | No | 4+ | Party Mode, multi-ADR |
