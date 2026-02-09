# TEA Validation Workflow Checklist

**Workflow:** tea_validation_workflow
**Version:** 2.0.0
**Duration:** 2h - 3h (complexity-dependent)
**Consolidated from:** tea-5-quality-gates + tea-6-release-readiness

---

## Phase 1: Quality Gates Setup (1h 40m)

### Quality Gate Identification (20m)
- [ ] Mapped software development lifecycle stages
- [ ] Identified decision points requiring quality checks
- [ ] Defined gate points: commit, pre-PR, PR approval, staging, production
- [ ] Specified gate triggers (automated vs manual)
- [ ] Prioritized gates by risk and impact
- [ ] Created gate point diagram with flow
- [ ] **Deliverable:** gate_points.md created

### Gate Criteria Definition (20m)
- [ ] For each gate point, defined quality criteria
- [ ] Specified code coverage requirements (line, branch, function)
- [ ] Defined defect limits (critical, high, medium)
- [ ] Set performance benchmarks (response time, throughput)
- [ ] Included security and accessibility criteria
- [ ] Created criteria matrix (gate × criteria)
- [ ] Validated criteria with stakeholders
- [ ] **Deliverable:** gate_criteria.md created

### Threshold Configuration (20m)
- [ ] Set minimum code coverage threshold (e.g., 80%)
- [ ] Set maximum defect thresholds (0 critical, 2 high, 10 medium)
- [ ] Defined performance thresholds (p95 < 500ms, p99 < 1s)
- [ ] Configured security scan thresholds (0 critical vulnerabilities)
- [ ] Defined override conditions and approvers
- [ ] Created threshold configuration file
- [ ] Validated thresholds are achievable and meaningful
- [ ] **Deliverable:** threshold_config.json created

### Gate Implementation (25m)
- [ ] Configured CI/CD pipeline to enforce quality gates
- [ ] Added pre-commit hooks (linting, unit tests)
- [ ] Added PR status checks (coverage, tests, security)
- [ ] Configured staging deployment gates (integration tests, smoke tests)
- [ ] Added production deployment gates (manual approval, monitoring)
- [ ] Tested gate enforcement with sample PRs
- [ ] Verified gates block failing builds
- [ ] **Deliverable:** gate_implementation (code) created

### Gate Documentation (15m)
- [ ] Created quality gate handbook
- [ ] Documented each gate: purpose, criteria, thresholds
- [ ] Explained override process and approvers
- [ ] Provided troubleshooting guide for common gate failures
- [ ] Documented metrics collection and reporting
- [ ] Included examples and screenshots
- [ ] **Deliverable:** gate_documentation.md created

---

## Phase 2: Release Readiness Assessment (1h 20m)

### Feature Completeness Check (15m)
- [ ] Reviewed feature list from requirements/user stories
- [ ] Verified each feature has test coverage
- [ ] Checked acceptance criteria met for each feature
- [ ] Identified untested or partially tested features
- [ ] Verified feature parity with requirements
- [ ] Created feature completeness checklist
- [ ] Obtained sign-off from product owner
- [ ] **Deliverable:** feature_checklist.md created

### Quality Metrics Review (20m)
- [ ] Collected current quality metrics from CI/CD
- [ ] Reviewed code coverage (line, branch, function)
- [ ] Analyzed test pass rate (overall, by type)
- [ ] Reviewed defect metrics (density, severity distribution)
- [ ] Compared metrics against defined thresholds
- [ ] Created quality metrics dashboard
- [ ] Identified metrics below threshold and action plan
- [ ] **Deliverable:** quality_report.md created

### Defect Analysis (20m)
- [ ] Reviewed all open defects in issue tracker
- [ ] Categorized by severity (critical, high, medium, low)
- [ ] Assessed risk of releasing with open defects
- [ ] Identified release blockers (critical bugs, high-risk areas)
- [ ] Verified critical and high bugs have fixes or mitigations
- [ ] Created defect analysis report with recommendations
- [ ] Confirmed no P0/P1 bugs remain open
- [ ] **Deliverable:** defect_analysis.md created

### Operational Readiness Check (15m)
- [ ] Verified deployment scripts tested and ready
- [ ] Confirmed rollback procedure documented and tested
- [ ] Checked monitoring and alerting configured
- [ ] Verified logging and observability in place
- [ ] Confirmed infrastructure capacity for expected load
- [ ] Verified database migrations tested
- [ ] Checked external dependencies (APIs, services) ready
- [ ] Created operational readiness checklist
- [ ] **Deliverable:** operational_checklist.md created

### Release Recommendation (10m)
- [ ] Reviewed all quality gate results
- [ ] Assessed feature completeness (100% or acceptable gap)
- [ ] Verified quality metrics meet thresholds
- [ ] Confirmed no release-blocking defects
- [ ] Verified operational readiness
- [ ] Made Go/No-Go recommendation with rationale
- [ ] Documented risks and mitigation for Go decision
- [ ] Obtained stakeholder approval
- [ ] **Deliverable:** release_recommendation.md created

---

## Adaptive Complexity Adjustments

### Simple Projects (0-39 complexity) - 2h total
**Streamlined:**
- [ ] Basic quality gates (PR checks only, no staging gates)
- [ ] Simplified feature checklist (core features only)
- [ ] Basic quality metrics (coverage + pass rate)
- [ ] Lightweight defect review (P0/P1 bugs only)

### Medium Projects (40-69 complexity) - 2h 30m total
**Include:**
- [ ] Standard quality gates (commit + PR + staging)
- [ ] Comprehensive feature checklist
- [ ] Full quality metrics review
- [ ] Detailed defect analysis

### Complex Projects (70-100 complexity) - 3h total
**Include:**
- [ ] All 10 steps (full workflow)
- [ ] Multi-stage quality gates (commit + PR + staging + prod)
- [ ] Comprehensive quality metrics with historical trends
- [ ] Extensive defect analysis with risk assessment
- [ ] Detailed operational readiness (load testing, disaster recovery)

---

## Success Criteria

### Quality Gates
- [ ] Quality gates implemented and enforced in CI/CD
- [ ] All gates properly configured with thresholds
- [ ] Gate documentation complete and accessible
- [ ] Team trained on gate process and overrides
- [ ] Gates validated with test PRs

### Release Readiness
- [ ] All features tested and acceptance criteria met
- [ ] Quality metrics meet defined thresholds
- [ ] No release-blocking defects (P0/P1)
- [ ] Operational readiness verified (deployment, rollback, monitoring)
- [ ] Go/No-Go recommendation documented with rationale
- [ ] Stakeholder approval obtained

---

## Quality Gates

### Phase 1: Quality Gates Setup
- [ ] **Gate:** All gates implemented and passing for sample PRs
- [ ] **Gate:** Gate documentation reviewed and approved
- [ ] **Gate:** Thresholds validated as achievable

### Phase 2: Release Readiness
- [ ] **Gate:** Feature completeness ≥95%
- [ ] **Gate:** Quality metrics meet all thresholds
- [ ] **Gate:** Zero P0/P1 bugs, ≤5 P2 bugs
- [ ] **Gate:** Operational checklist 100% complete
- [ ] **Gate:** Go recommendation approved by stakeholders

---

## Roles & Responsibilities

### Test Architect (Primary)
- [ ] Identifies quality gate points (step 1)
- [ ] Defines gate criteria and thresholds (steps 2-3)
- [ ] Checks feature completeness (step 6)
- [ ] Reviews quality metrics (step 7)
- [ ] Analyzes defects (step 8)
- [ ] Makes release recommendation (step 10)

### DevOps
- [ ] Implements quality gates in CI/CD (step 4)
- [ ] Checks operational readiness (step 9)
- [ ] Configures monitoring and alerting

### Tech Writer
- [ ] Documents quality gates (step 5)
- [ ] Creates user-facing documentation
- [ ] Ensures consistency across docs

---

## Common Pitfalls

### Quality Gates
- [ ] ❌ **Avoid:** Unrealistic thresholds (100% coverage, zero bugs)
- [ ] ❌ **Avoid:** Too many manual gates (slows down delivery)
- [ ] ❌ **Avoid:** No override process (blocks urgent fixes)
- [ ] ❌ **Avoid:** Undocumented gates (team confusion)

### Release Readiness
- [ ] ❌ **Avoid:** Ignoring non-functional requirements (performance, security)
- [ ] ❌ **Avoid:** Releasing with known P0/P1 bugs
- [ ] ❌ **Avoid:** No rollback plan (risky deployments)
- [ ] ❌ **Avoid:** Incomplete feature testing (acceptance criteria not met)

---

## Deliverables Summary

| Phase | Deliverable | Format | Complexity | Required |
|-------|-------------|--------|------------|----------|
| Gates | gate_points | Markdown | All | ✓ |
| Gates | gate_criteria | Markdown | All | ✓ |
| Gates | threshold_config | JSON | All | ✓ |
| Gates | gate_implementation | Code | All | ✓ |
| Gates | gate_documentation | Markdown | All | ✓ |
| Release | feature_checklist | Markdown | All | ✓ |
| Release | quality_report | Markdown | All | ✓ |
| Release | defect_analysis | Markdown | All | ✓ |
| Release | operational_checklist | Markdown | All | ✓ |
| Release | release_recommendation | Markdown | All | ✓ |

**Total:** 10 deliverables (all complexity levels)

---

## Time Tracking

| Complexity | Estimated Time | Actual Time | Variance | Notes |
|------------|----------------|-------------|----------|-------|
| Simple | 2h 0m | ___ | ___ | Streamlined checks |
| Medium | 2h 30m | ___ | ___ | Full workflow |
| Complex | 3h 0m | ___ | ___ | All 10 steps + detailed analysis |

---

## Post-Execution

### Immediate Next Steps (if Go)
- [ ] Execute deployment plan
- [ ] Monitor deployment closely
- [ ] Verify smoke tests pass in production
- [ ] Monitor error rates and performance
- [ ] Prepare rollback if needed

### Immediate Next Steps (if No-Go)
- [ ] Communicate decision to stakeholders
- [ ] Create action plan to address blockers
- [ ] Re-schedule release date
- [ ] Track progress on blocking issues
- [ ] Re-run tea-validation when ready

### Continuous Improvement
- [ ] Capture lessons learned from release
- [ ] Update quality gate thresholds based on experience
- [ ] Refine release checklist
- [ ] Update operational procedures
- [ ] Share retrospective with team

---

## Integration with Other Workflows

### Prerequisites (from tea-execution)
- [ ] automated_tests (code) - used for gate checks
- [ ] test_results - used for quality metrics
- [ ] health_report - used for test suite assessment

### Outputs (for deployment)
- [ ] release_recommendation - Go/No-Go decision
- [ ] quality_report - metrics snapshot
- [ ] operational_checklist - deployment readiness

---

## Troubleshooting

### Common Issues

**Issue:** Quality gate fails (coverage below threshold)
- [ ] Analyze uncovered code (dead code vs missing tests)
- [ ] Add tests for critical uncovered paths
- [ ] Consider threshold adjustment if unrealistic
- [ ] Request override with documented justification

**Issue:** Release-blocking defects
- [ ] Assess risk of releasing with defects
- [ ] Verify fixes are available and tested
- [ ] Consider hotfix after release if low risk
- [ ] Document decision and risk mitigation

**Issue:** Operational checklist incomplete
- [ ] Identify missing items and assign owners
- [ ] Estimate time to complete
- [ ] Consider partial deployment (canary, feature flags)
- [ ] Delay release if critical items missing

**Issue:** Stakeholders disagree on Go/No-Go
- [ ] Present data objectively (metrics, defects, risks)
- [ ] Facilitate decision-making discussion
- [ ] Document decision rationale
- [ ] Obtain explicit approval/rejection

---

## Quality Gate Examples

### Commit Gate (Pre-commit hooks)
```yaml
checks:
  - linting: ESLint
  - formatting: Prettier
  - unit_tests: Jest (changed files only)
  - type_checking: TypeScript
thresholds:
  - All checks must pass
  - No lint errors (warnings OK)
```

### PR Gate (GitHub Actions)
```yaml
checks:
  - build: pnpm build
  - test: pnpm test (all tests)
  - coverage: ≥80% line coverage
  - security: Snyk scan (0 critical)
  - code_review: ≥1 approval
thresholds:
  - Build passes
  - All tests pass
  - Coverage ≥80%
  - 0 critical vulnerabilities
  - 1+ approval
```

### Staging Gate (Pre-deployment)
```yaml
checks:
  - integration_tests: API + E2E tests
  - smoke_tests: Critical paths
  - performance_tests: Load testing
  - security_scan: OWASP Top 10
thresholds:
  - 100% integration tests pass
  - 100% smoke tests pass
  - p95 latency < 500ms
  - 0 high-severity vulnerabilities
```

### Production Gate (Manual approval)
```yaml
checks:
  - release_recommendation: Go/No-Go
  - stakeholder_approval: PM + Eng Lead
  - rollback_plan: Documented and tested
  - monitoring: Alerts configured
thresholds:
  - Go recommendation
  - Approvals obtained
  - Rollback tested
  - Monitoring verified
```

---

## Go/No-Go Decision Matrix

| Criteria | Weight | Threshold | Score | Weighted | Pass/Fail |
|----------|--------|-----------|-------|----------|-----------|
| Feature Completeness | 20% | 95% | ___ | ___ | ___ |
| Code Coverage | 15% | 80% | ___ | ___ | ___ |
| Test Pass Rate | 15% | 95% | ___ | ___ | ___ |
| P0/P1 Defects | 25% | 0 | ___ | ___ | ___ |
| P2 Defects | 10% | ≤5 | ___ | ___ | ___ |
| Performance | 10% | p95<500ms | ___ | ___ | ___ |
| Operational Readiness | 5% | 100% | ___ | ___ | ___ |
| **Total** | **100%** | **≥80%** | ___ | ___ | ___ |

**Decision Rule:**
- **Go:** Total weighted score ≥80% AND all P0/P1 defects = 0
- **No-Go:** Total weighted score <80% OR any P0/P1 defects > 0

---

**Last Updated:** 2026-02-09
**Maintained by:** ASMO Core Team
**Feedback:** Submit issues to ASMO GitHub repository
