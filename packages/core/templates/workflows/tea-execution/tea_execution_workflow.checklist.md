# TEA Execution Workflow Checklist

**Workflow:** tea_execution_workflow
**Version:** 2.0.0
**Duration:** 3h 30m - 6h (complexity-dependent)
**Consolidated from:** tea-4-test-automation + tea-7-regression-analysis + tea-8-test-maintenance

---

## Phase 1: Test Automation (2h 20m)

### Automation Scope Definition (20m)
- [ ] Reviewed test cases from tea-planning workflow
- [ ] Identified candidates for automation (repetitive, stable, high-value)
- [ ] Excluded tests unsuitable for automation (visual, exploratory, one-off)
- [ ] Calculated automation ROI (cost vs manual execution savings)
- [ ] Prioritized automation by ROI and risk
- [ ] Created automation backlog with effort estimates
- [ ] **Deliverable:** automation_scope.md created

### Test Tool Selection (25m)
- [ ] Evaluated test frameworks (Jest, Playwright, Cypress, etc.)
- [ ] Selected assertion libraries and test runners
- [ ] Chose reporting tools (HTML reports, dashboards)
- [ ] Selected CI/CD tools (GitHub Actions, Jenkins, CircleCI)
- [ ] Documented tool selection rationale (pros/cons, licensing)
- [ ] Created tool setup and installation guide
- [ ] Verified tool compatibility with tech stack
- [ ] **Deliverable:** tool_recommendations.md created

### Test Framework Design (30m) - **Skip if complexity: simple**
- [ ] Designed framework structure (folders, namespaces, modules)
- [ ] Defined design patterns (page objects, page components, helpers)
- [ ] Created fixture and factory patterns for test data
- [ ] Designed utility modules (assertions, waits, retries)
- [ ] Planned configuration management (env vars, profiles)
- [ ] Documented framework architecture and conventions
- [ ] Created framework setup guide
- [ ] **Deliverable:** framework_design.md created

### Test Implementation (45m)
- [ ] Set up test framework and dependencies
- [ ] Implemented test utilities and helpers
- [ ] Created test data fixtures and factories
- [ ] Implemented automated tests from test_cases artifact
- [ ] Added assertions for expected results
- [ ] Tagged tests (smoke, regression, sanity, etc.)
- [ ] Ran tests locally and verified pass rate
- [ ] Committed tests to version control
- [ ] **Deliverable:** automated_tests (code) created

### CI/CD Integration (20m)
- [ ] Created CI/CD configuration file (e.g., .github/workflows/tests.yml)
- [ ] Configured test triggers (PR, commit, scheduled)
- [ ] Set up test parallelization and sharding
- [ ] Configured test reporting and artifacts
- [ ] Added status checks and quality gates
- [ ] Documented CI/CD setup and troubleshooting
- [ ] Verified tests run successfully in CI
- [ ] **Deliverable:** ci_configuration (code) created

---

## Phase 2: Regression Analysis (1h 50m)

### Change Impact Analysis (25m)
- [ ] Reviewed recent commits and PRs
- [ ] Identified changed files and modules
- [ ] Mapped changes to affected features/components
- [ ] Analyzed dependency graph for cascading impacts
- [ ] Identified high-risk changes (architecture, API, database)
- [ ] Created change impact report with risk ratings
- [ ] Validated change impact with dev team
- [ ] **Deliverable:** change_impact.md created

### Regression Test Selection (20m)
- [ ] Mapped changed modules to affected tests
- [ ] Selected tests covering high-risk changes
- [ ] Included smoke tests and critical path tests
- [ ] Added tests for previously failed areas
- [ ] Excluded low-risk, unaffected tests
- [ ] Created regression test suite configuration
- [ ] Estimated regression suite duration
- [ ] **Deliverable:** selected_tests.md created

### Regression Risk Assessment (20m)
- [ ] Rated risk for each changed module (high/medium/low)
- [ ] Considered historical defect data
- [ ] Assessed test coverage in changed areas
- [ ] Identified untested or under-tested areas
- [ ] Created risk heat map by module
- [ ] Recommended additional testing for high-risk areas
- [ ] **Deliverable:** regression_risk.md created

### Test Execution (30m)
- [ ] Ran regression test suite (automated + manual if needed)
- [ ] Monitored test execution and captured failures
- [ ] Investigated and triaged test failures
- [ ] Distinguished between product bugs and test issues
- [ ] Re-ran flaky tests to confirm failures
- [ ] Collected test results and logs
- [ ] Filed bug reports for confirmed defects
- [ ] **Deliverable:** test_results.md created

### Regression Analysis (15m)
- [ ] Analyzed test pass/fail rates
- [ ] Identified regression trends (improving/degrading)
- [ ] Compared with baseline metrics
- [ ] Identified newly introduced defects
- [ ] Assessed overall regression risk
- [ ] Created regression analysis report with recommendations
- [ ] Shared results with stakeholders
- [ ] **Deliverable:** regression_report.md created

---

## Phase 3: Test Maintenance (1h 45m)

### Test Suite Health Assessment (25m)
- [ ] Calculated test suite pass rate (last 7 days, 30 days)
- [ ] Measured average test suite duration
- [ ] Identified slow tests (>5s, >30s, >1min)
- [ ] Calculated flakiness rate (% of flaky tests)
- [ ] Assessed test coverage trends
- [ ] Created test suite health dashboard
- [ ] Documented health metrics and thresholds
- [ ] **Deliverable:** health_report.md created

### Flaky Test Analysis (25m)
- [ ] Identified tests with intermittent failures
- [ ] Analyzed flaky test patterns (timing, race conditions, dependencies)
- [ ] Categorized flaky tests by root cause
- [ ] Estimated impact of flakiness on CI/CD
- [ ] Prioritized flaky tests for fixing
- [ ] Created flaky test remediation plan
- [ ] Assigned owners for flaky test fixes
- [ ] **Deliverable:** flaky_test_list.md created

### Test Suite Cleanup (20m)
- [ ] Identified obsolete tests (testing removed features)
- [ ] Found duplicate tests (same coverage, different implementation)
- [ ] Removed tests with no assertions
- [ ] Consolidated similar tests
- [ ] Updated test names for clarity
- [ ] Documented cleanup actions and rationale
- [ ] Verified no critical coverage lost
- [ ] **Deliverable:** cleanup_report.md created

### Test Suite Optimization (20m)
- [ ] Enabled test parallelization (workers, sharding)
- [ ] Optimized slow tests (reduce waits, mock expensive operations)
- [ ] Cached test data and fixtures
- [ ] Reduced test setup/teardown time
- [ ] Optimized CI/CD pipeline (caching, incremental builds)
- [ ] Measured optimization impact (before/after duration)
- [ ] Documented optimization techniques
- [ ] **Deliverable:** optimization_changes.md created

### Test Maintenance Plan (15m)
- [ ] Defined maintenance cadence (weekly, bi-weekly, monthly)
- [ ] Assigned maintenance owners and responsibilities
- [ ] Created maintenance checklist (health check, flaky fix, cleanup)
- [ ] Set up automated maintenance alerts
- [ ] Planned test suite refactoring (if needed)
- [ ] Documented maintenance procedures and escalation
- [ ] **Deliverable:** maintenance_plan.md created

---

## Adaptive Complexity Adjustments

### Simple Projects (0-39 complexity) - 3h 30m total
**Skip:**
- [ ] Test Framework Design (step 3)

**Streamlined:**
- [ ] Use standard test templates (no custom framework)
- [ ] Basic regression suite (smoke + critical path only)
- [ ] Simplified health metrics (pass rate + duration only)

### Medium Projects (40-69 complexity) - 4h 45m total
**Include:**
- [ ] All steps except framework design
- [ ] Standard automation patterns
- [ ] Comprehensive regression analysis

### Complex Projects (70-100 complexity) - 6h total
**Include:**
- [ ] All 15 steps (full workflow)
- [ ] Custom test framework design
- [ ] Comprehensive regression suite with risk-based selection
- [ ] Full health analysis and optimization

---

## Success Criteria

### Test Automation
- [ ] Automated test suite implemented and passing
- [ ] Test coverage ≥ targets from tea-planning (e.g., 80%)
- [ ] Tests integrated with CI/CD pipeline
- [ ] CI build time ≤ 15 minutes (or project-specific target)
- [ ] Test framework documented and maintainable

### Regression Analysis
- [ ] Regression risk assessed for all changes
- [ ] Regression test suite pass rate ≥ 95%
- [ ] All high-risk areas covered by tests
- [ ] Zero critical bugs in regression suite
- [ ] Regression report shared with stakeholders

### Test Maintenance
- [ ] Test suite health ≥ 90% pass rate
- [ ] Flaky test rate ≤ 5%
- [ ] Test suite duration optimized (≥20% reduction)
- [ ] Obsolete tests removed
- [ ] Ongoing maintenance plan in place

---

## Quality Gates

### Phase 1: Test Automation
- [ ] **Gate:** Automated tests pass locally at ≥95% rate
- [ ] **Gate:** CI/CD pipeline runs tests successfully
- [ ] **Gate:** Test coverage meets targets from tea-planning

### Phase 2: Regression Analysis
- [ ] **Gate:** Regression suite pass rate ≥95%
- [ ] **Gate:** All P0/P1 defects triaged and addressed
- [ ] **Gate:** Regression risk documented and approved

### Phase 3: Test Maintenance
- [ ] **Gate:** Test suite health ≥90% pass rate
- [ ] **Gate:** Flaky test rate ≤5%
- [ ] **Gate:** Maintenance plan approved by team

---

## Roles & Responsibilities

### Test Architect (Primary)
- [ ] Leads automation scope definition (step 1)
- [ ] Selects test tools (step 2)
- [ ] Designs test framework (step 3)
- [ ] Leads change analysis and risk assessment (steps 6-8)
- [ ] Analyzes regression results (step 10)
- [ ] Assesses test suite health (step 11-12)
- [ ] Creates maintenance plan (step 15)

### Tester
- [ ] Implements automated tests (step 4)
- [ ] Executes regression tests (step 9)
- [ ] Cleans up test suite (step 13)
- [ ] Optimizes test suite (step 14)

### DevOps
- [ ] Integrates tests with CI/CD (step 5)
- [ ] Configures test parallelization
- [ ] Optimizes CI/CD pipeline

---

## Common Pitfalls

### Test Automation
- [ ] ❌ **Avoid:** Over-automating (automating visual tests, one-off tests)
- [ ] ❌ **Avoid:** Poor test isolation (shared state, dependencies between tests)
- [ ] ❌ **Avoid:** Hard-coded test data (use fixtures and factories)
- [ ] ❌ **Avoid:** No test tagging (smoke, regression, sanity)

### Regression Analysis
- [ ] ❌ **Avoid:** Running full regression suite for every change (use risk-based selection)
- [ ] ❌ **Avoid:** Ignoring flaky tests (fix or quarantine them)
- [ ] ❌ **Avoid:** No baseline metrics (can't detect regressions)

### Test Maintenance
- [ ] ❌ **Avoid:** Letting flaky tests accumulate (fix them immediately)
- [ ] ❌ **Avoid:** No cleanup plan (test suite bloat)
- [ ] ❌ **Avoid:** No optimization (slow CI builds kill productivity)

---

## Deliverables Summary

| Phase | Deliverable | Format | Complexity | Required |
|-------|-------------|--------|------------|----------|
| Automation | automation_scope | Markdown | All | ✓ |
| Automation | tool_recommendations | Markdown | All | ✓ |
| Automation | framework_design | Markdown | Medium, Complex | ✓ |
| Automation | automated_tests | Code | All | ✓ |
| Automation | ci_configuration | Code | All | ✓ |
| Regression | change_impact | Markdown | All | ✓ |
| Regression | selected_tests | Markdown | All | ✓ |
| Regression | regression_risk | Markdown | All | ✓ |
| Regression | test_results | Markdown | All | ✓ |
| Regression | regression_report | Markdown | All | ✓ |
| Maintenance | health_report | Markdown | All | ✓ |
| Maintenance | flaky_test_list | Markdown | All | ✓ |
| Maintenance | cleanup_report | Markdown | All | ✓ |
| Maintenance | optimization_changes | Markdown | All | ✓ |
| Maintenance | maintenance_plan | Markdown | All | ✓ |

**Total:** 15 deliverables (14 for simple projects)

---

## Time Tracking

| Complexity | Estimated Time | Actual Time | Variance | Notes |
|------------|----------------|-------------|----------|-------|
| Simple | 3h 30m | ___ | ___ | Skips step 3 (framework design) |
| Medium | 4h 45m | ___ | ___ | Full workflow |
| Complex | 6h 0m | ___ | ___ | All 15 steps + custom framework |

---

## Post-Execution

### Immediate Next Steps
- [ ] Share automation results with team
- [ ] Address critical regression failures
- [ ] Fix high-priority flaky tests
- [ ] Begin tea-validation workflow (quality gates + release readiness)
- [ ] Archive execution artifacts in project wiki

### Continuous Improvement
- [ ] Capture lessons learned from automation
- [ ] Update test framework based on feedback
- [ ] Refine regression test selection algorithm
- [ ] Improve CI/CD pipeline based on metrics
- [ ] Update checklist based on retrospective

---

## Integration with Other Workflows

### Prerequisites (from tea-planning)
- [ ] test_cases artifact available
- [ ] test_strategy_document reviewed
- [ ] Quality metrics defined

### Outputs (for tea-validation)
- [ ] automated_tests (code) - used for quality gate checks
- [ ] test_results - used for release readiness
- [ ] health_report - used for quality metrics

---

## Troubleshooting

### Common Issues

**Issue:** CI/CD tests fail but pass locally
- [ ] Check environment differences (env vars, dependencies)
- [ ] Verify test isolation (no shared state)
- [ ] Check for timing issues (race conditions, async)

**Issue:** High flaky test rate (>10%)
- [ ] Analyze flaky test patterns
- [ ] Add retries for network/external dependencies
- [ ] Improve test isolation and cleanup
- [ ] Use deterministic test data

**Issue:** Slow test suite (>30 minutes)
- [ ] Enable parallelization
- [ ] Optimize slow tests (mock expensive operations)
- [ ] Use test sharding
- [ ] Cache dependencies and fixtures

**Issue:** Low test coverage (<70%)
- [ ] Review automation scope (are tests implemented?)
- [ ] Add tests for uncovered areas
- [ ] Check test execution (are tests skipped?)

---

**Last Updated:** 2026-02-09
**Maintained by:** ASMO Core Team
**Feedback:** Submit issues to ASMO GitHub repository
