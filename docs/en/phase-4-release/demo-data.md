# ASMO Demo Data

Five example tasks with expected behavior at each stage of the ASMO pipeline. Use these for testing, evaluation, and demonstrations.

## Summary Table

| # | Task | Score | Level | Workflow | Key Agents | YOLO |
|---|------|-------|-------|----------|------------|------|
| 1 | Fix typo in README | 15 | Trivial | bug_fix_workflow | debugger | Yes |
| 2 | Fix null pointer in login handler | 35 | Simple | bug_fix_workflow | debugger, developer, tester | No |
| 3 | Add email validation to signup form | 45 | Medium | feature_implementation_full | architect, developer, tester | No |
| 4 | Implement OAuth2 authentication | 75 | Complex | feature_implementation_full | architect, security-specialist, developer, tester | No |
| 5 | Design microservices migration strategy | 90 | Enterprise | architecture_design | architect, developer, devops, security-specialist | No |

---

## Task 1: Fix typo in README

**Input:**
```bash
asmo run "Fix typo in README"
```

**Complexity analysis:**
- Score: 15
- Level: Trivial
- Categories: `trivial`
- Impact modifiers: none

**Workflow selection:** `bug_fix_workflow`

**Agents assigned:** debugger (single agent, minimal pipeline)

**Approximate duration:** < 1 minute

**YOLO mode:** Yes -- score is below 30 threshold, auto-approved without human checkpoint. The task executes immediately with no approval prompt.

**Expected outcome:** Single file modified, no tests required.

---

## Task 2: Fix null pointer in login handler

**Input:**
```bash
asmo run "Fix null pointer in login handler"
```

**Complexity analysis:**
- Score: 35
- Level: Simple
- Categories: `bug_fix`
- Impact modifiers: `security_impact` (login handler touches authentication)

**Workflow selection:** `bug_fix_workflow`

**Agents assigned:**
1. **debugger** -- investigates the null pointer, identifies root cause (missing null check, undefined property access, etc.)
2. **developer** -- implements the fix with proper null handling
3. **tester** -- adds regression test for the null case

**Approximate duration:** 10-15 minutes

**YOLO mode:** No -- score exceeds 30 threshold, approval checkpoint is presented.

**Expected outcome:** 2-3 files modified (handler + test), null safety added, test covering the specific null scenario.

---

## Task 3: Add email validation to signup form

**Input:**
```bash
asmo run "Add email validation to signup form"
```

**Complexity analysis:**
- Score: 45
- Level: Medium
- Categories: `feature`, `api`
- Impact modifiers: none

**Workflow selection:** `feature_implementation_full`

**Agents assigned:**
1. **architect** -- defines validation strategy (client-side, server-side, or both), regex pattern or library choice
2. **developer** -- implements validation in form component and API endpoint
3. **tester** -- creates test cases for valid emails, invalid formats, edge cases (Unicode, long domains, subaddressing)

**Approximate duration:** 1-2 hours

**YOLO mode:** No -- score exceeds 30 threshold.

**Expected outcome:** 3-5 files modified (form component, API validator, tests), both client and server validation implemented, comprehensive test cases for email format edge cases.

---

## Task 4: Implement OAuth2 authentication

**Input:**
```bash
asmo run "Implement OAuth2 authentication"
```

**Complexity analysis:**
- Score: 75
- Level: Complex
- Categories: `security`, `feature`, `api`
- Impact modifiers: `security_impact`, `high_risk`

**Workflow selection:** `feature_implementation_full`

**Agents assigned:**
1. **architect** -- designs OAuth2 flow (authorization code, PKCE), token storage strategy, provider integration architecture
2. **security-specialist** -- reviews token handling, CSRF protection, redirect URI validation, scope management
3. **developer** -- implements OAuth2 endpoints, callback handlers, token refresh logic, provider SDK integration
4. **tester** -- security-focused tests (token expiry, invalid grants, CSRF scenarios), integration tests with mock provider

**Approximate duration:** 4-6 hours

**YOLO mode:** No -- complex task with security implications, requires explicit approval.

**Expected outcome:** 10+ files modified/created (auth routes, middleware, token service, provider config, tests), complete OAuth2 authorization code flow with PKCE, secure token storage, refresh mechanism, and comprehensive security tests.

---

## Task 5: Design microservices migration strategy

**Input:**
```bash
asmo run "Design microservices migration strategy"
```

**Complexity analysis:**
- Score: 90
- Level: Enterprise
- Categories: `architecture`, `refactoring`
- Impact modifiers: `high_risk`

**Workflow selection:** `architecture_design`

**Agents assigned:**
1. **architect** -- defines service boundaries, communication patterns (sync/async), data ownership, migration phases
2. **developer** -- evaluates implementation feasibility, identifies shared code and dependencies, proposes extraction order
3. **devops** -- designs deployment strategy, service mesh, monitoring, CI/CD pipeline changes
4. **security-specialist** -- reviews inter-service authentication, network policies, secrets management for distributed system

**Approximate duration:** 8-12 hours

**YOLO mode:** No -- enterprise-level task requiring thorough review and approval at each phase.

**Expected outcome:** Architecture design documents including service boundary map, communication contracts (API specs, event schemas), migration plan with phases and rollback strategies, deployment architecture, monitoring and observability setup.

---

## Using Demo Data for Testing

To verify ASMO behavior against these expected results:

```bash
# Quick check: does suggestion match expected workflow?
asmo suggest "Fix typo in README"
asmo suggest "Implement OAuth2 authentication"

# Complexity analysis: does score match expected range?
asmo analyze "Add email validation to signup form"
asmo analyze "Design microservices migration strategy"

# Dry run: do assigned agents match expectations?
asmo run "Fix null pointer in login handler" --dry-run
asmo run "Implement OAuth2 authentication" --dry-run
```

Scores may vary by a few points depending on LLM mode (Session vs API vs Heuristics). Heuristics mode (~65% accuracy) may produce different workflow selections for borderline tasks.
