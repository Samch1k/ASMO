# 🔒 Security Audit

> Comprehensive security assessment and vulnerability mitigation

## Overview

| Property | Value |
|----------|-------|
| **ID** | `security_audit` |
| **Estimated Time** | 6h |
| **Phases** | 5 |
| **Agents Involved** | 4 |

## Trigger Conditions

### Keywords
`security`, `vulnerability`, `audit`, `penetration test`, `security review`, `OWASP`

### Task Types
- security
- audit
- compliance

### Required Skills
- `security`
- `vulnerability_assessment`
- `code_review`

### Complexity Range
- complex
- enterprise

## Execution Phases

| # | Agent | Phase | Deliverables | Timeout | Approval |
|---|-------|-------|--------------|---------|----------|
| 1 | architect | threat_modeling | threat_model, attack_surface_analysis | 45m | - |
| 2 | code-reviewer | code_audit | code_audit_report, vulnerability_findings | 60m | - |
| 3 | tester | vulnerability_testing | penetration_test_results, vulnerability_scan_results | 90m | - |
| 4 | developer | remediation | security_fixes, hardening_improvements | 120m | - |
| 5 | tester | validation | retest_results, security_compliance_report | 45m | - |

## Phase Details

### Phase 1: threat_modeling

**Agent:** `architect`

Identify potential security threats and attack vectors

**Deliverables:**
- threat_model
- attack_surface_analysis
- security_requirements

**Exit Criteria:** Threat model complete with identified vulnerabilities

**Timeout:** 45m


### Phase 2: code_audit

**Agent:** `code-reviewer`

Review code for security vulnerabilities and best practices

**Deliverables:**
- code_audit_report
- vulnerability_findings
- owasp_compliance_check

**Exit Criteria:** Code reviewed for OWASP Top 10 and common vulnerabilities

**Timeout:** 60m


### Phase 3: vulnerability_testing

**Agent:** `tester`

Perform security testing and penetration testing

**Deliverables:**
- penetration_test_results
- vulnerability_scan_results
- security_test_report

**Exit Criteria:** Security testing complete with documented findings

**Timeout:** 90m


### Phase 4: remediation

**Agent:** `developer`

Implement fixes for identified security vulnerabilities

**Deliverables:**
- security_fixes
- hardening_improvements
- security_tests

**Exit Criteria:** Critical and high-severity vulnerabilities fixed

**Timeout:** 120m


### Phase 5: validation

**Agent:** `tester`

Verify vulnerabilities are fixed and no new issues introduced

**Deliverables:**
- retest_results
- security_compliance_report
- final_audit_report

**Exit Criteria:** All critical vulnerabilities fixed and verified

**Timeout:** 45m


## Success Criteria

All critical and high-severity vulnerabilities fixed, security best practices implemented, compliance verified

## Usage

```typescript
import { WorkflowEngine, AgentRegistry } from '@ai1st/core'

const registry = new AgentRegistry()
const engine = new WorkflowEngine(registry)
await engine.initialize()

// Execute by ID
const result = await engine.execute('security_audit')

// Or adaptive selection by task description
const result = await engine.execute('security...')
```

---

[← Back to Workflows](./index.md)
