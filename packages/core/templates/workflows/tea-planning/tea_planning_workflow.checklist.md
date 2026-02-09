# TEA Planning Workflow Checklist

**Workflow:** tea_planning_workflow
**Version:** 2.0.0
**Duration:** 3h-5h (complexity-dependent)
**Consolidated from:** tea-1-risk-assessment + tea-2-test-strategy + tea-3-test-design

---

## Phase 1: Risk Assessment (1h 25m)

### Business Risk Assessment (20m)
- [ ] Identified all business-critical features
- [ ] Identified all critical user journeys
- [ ] Assessed probability of failure (1-5 scale)
- [ ] Assessed business impact of failure (1-5 scale)
- [ ] Created 5×5 risk matrix with color coding
- [ ] Documented top 5 business risks
- [ ] Validated risk matrix with product owner
- [ ] **Deliverable:** business_risk_matrix.md created

### Technical Risk Assessment (25m)
- [ ] Analyzed technical complexity (algorithms, architecture)
- [ ] Mapped all external dependencies (APIs, databases, services)
- [ ] Identified technical unknowns (new tech, legacy code)
- [ ] Assessed integration risk with 3rd party systems
- [ ] Created technical risk matrix with severity ratings
- [ ] Documented top 5 technical risks
- [ ] Validated risk matrix with tech lead/architect
- [ ] **Deliverable:** technical_risk_matrix.md created

### Risk Prioritization (20m)
- [ ] Merged business and technical risk matrices
- [ ] Calculated combined risk score (business_impact × technical_complexity)
- [ ] Ranked all risks by combined score
- [ ] Defined test priorities (P0/P1/P2/P3)
- [ ] Allocated testing effort based on risk ranking
- [ ] Created risk-to-test-coverage mapping
- [ ] **Deliverable:** combined_risk_matrix.md created
- [ ] **Deliverable:** test_priorities.md created

### Risk Mitigation Strategies (20m)
- [ ] For each high-priority risk, defined mitigation strategy
- [ ] Specified testing techniques (unit, integration, E2E, etc.)
- [ ] Defined acceptance criteria for risk mitigation
- [ ] Estimated effort required for each mitigation
- [ ] Created action plan with owners and deadlines
- [ ] Prioritized mitigation strategies by ROI
- [ ] **Deliverable:** mitigation_strategies.md created

---

## Phase 2: Test Strategy (1h 45m)

### Test Scope Definition (15m)
- [ ] Listed all features/modules in scope for testing
- [ ] Explicitly listed out-of-scope items (3rd party libs, mocks, etc.)
- [ ] Defined test boundaries (where testing starts/stops)
- [ ] Identified assumptions and dependencies
- [ ] Documented scope limitations and constraints
- [ ] Validated scope with stakeholders
- [ ] **Deliverable:** test_scope.md created

### Test Type Selection (20m)
- [ ] Defined test pyramid (unit → integration → E2E ratios)
- [ ] Specified coverage targets for each test type
- [ ] Selected unit test approach (per function, per class, etc.)
- [ ] Selected integration test approach (API, database, service)
- [ ] Selected E2E test approach (UI, user flows, browsers)
- [ ] Selected specialized tests (performance, security, accessibility)
- [ ] Created test type matrix with rationale for each type
- [ ] Documented tool/framework recommendations per type
- [ ] **Deliverable:** test_type_matrix.md created

### Test Environment Planning (15m)
- [ ] Defined environment topology (local, CI, staging, prod-like)
- [ ] Specified infrastructure requirements (CPU, memory, storage)
- [ ] Documented environment configuration (env vars, secrets, configs)
- [ ] Defined data refresh and reset strategies
- [ ] Created environment provisioning checklist
- [ ] Documented environment access and permissions
- [ ] **Deliverable:** environment_requirements.md created

### Test Data Strategy (20m)
- [ ] Defined test data sources (production snapshots, synthetic, mocks)
- [ ] Created data generation strategy (factories, fixtures, randomization)
- [ ] Planned data privacy and anonymization (GDPR, PII handling)
- [ ] Defined data versioning and reset procedures
- [ ] Documented data dependencies and prerequisites
- [ ] Created data seeding and teardown procedures
- [ ] **Deliverable:** test_data_strategy.md created

### Quality Metrics Definition (15m)
- [ ] Defined code coverage targets (line, branch, function)
- [ ] Specified defect density targets (bugs per 1000 LOC)
- [ ] Defined velocity metrics (tests per sprint, automation rate)
- [ ] Set quality gates (min coverage, max critical bugs)
- [ ] Created metrics dashboard specification
- [ ] Defined metric collection and reporting cadence
- [ ] **Deliverable:** quality_metrics.md created

---

## Phase 3: Test Design (1h 50m)

### Test Scenario Identification (25m)
- [ ] Listed all happy path scenarios (expected user flows)
- [ ] Identified edge cases (boundary conditions, rare inputs)
- [ ] Documented error scenarios (invalid input, network failures)
- [ ] Created scenario-to-requirement traceability matrix
- [ ] Prioritized scenarios by risk and business value
- [ ] Validated scenarios with product owner
- [ ] **Deliverable:** test_scenarios.md created

### Boundary Value Analysis (20m) - **Skip if complexity: simple**
- [ ] Identified all input boundaries (min, max, empty, null)
- [ ] Designed tests for boundary-1, boundary, boundary+1
- [ ] Tested numeric ranges (0, 1, MAX_INT, negative)
- [ ] Tested string lengths (empty, 1 char, max length, overflow)
- [ ] Tested date/time boundaries (past, present, future)
- [ ] Created boundary test matrix with expected results
- [ ] **Deliverable:** boundary_tests.md created

### Equivalence Partitioning (25m) - **Skip if complexity: simple**
- [ ] Identified input domains (ranges, categories, states)
- [ ] Partitioned each domain into equivalence classes
- [ ] Selected representative value from each partition
- [ ] Designed tests for valid and invalid partitions
- [ ] Created partition-to-test-case mapping
- [ ] Validated partition logic with domain expert
- [ ] **Deliverable:** partition_tests.md created

### Negative Testing Design (20m)
- [ ] Identified all error conditions (invalid input, network failures)
- [ ] Designed tests for each error path
- [ ] Verified error messages are user-friendly and actionable
- [ ] Tested error recovery and rollback mechanisms
- [ ] Documented expected error codes and messages
- [ ] Tested error logging and monitoring
- [ ] **Deliverable:** negative_tests.md created

### Test Case Creation (20m)
- [ ] For each test scenario, created detailed test case
- [ ] Specified preconditions (setup, prerequisites)
- [ ] Documented step-by-step test procedure
- [ ] Defined expected results and acceptance criteria
- [ ] Tagged test cases (smoke, regression, sanity, etc.)
- [ ] Assigned test case IDs and priorities
- [ ] Created test case-to-requirement traceability
- [ ] **Deliverable:** test_cases.md created

---

## Phase 4: Documentation (20m)

### Test Strategy Documentation
- [ ] Consolidated all planning artifacts into single document
- [ ] Structured document: scope, approach, resources, schedule, risks
- [ ] Added executive summary and recommendations
- [ ] Included all matrices, checklists, and diagrams
- [ ] Formatted for stakeholder review and sign-off
- [ ] Added glossary and references
- [ ] Created table of contents
- [ ] **Deliverable:** test_strategy_document.md created

---

## Adaptive Complexity Adjustments

### Simple Projects (0-39 complexity) - 3h total
**Skip:**
- [ ] Boundary Value Analysis (step 11)
- [ ] Equivalence Partitioning (step 12)

**Streamlined:**
- [ ] Simplified risk matrices (3×3 instead of 5×5)
- [ ] Basic test scenarios only (no deep edge case analysis)
- [ ] Reduced documentation depth

### Medium Projects (40-69 complexity) - 4h total
**Include:**
- [ ] All steps except boundary/partition analysis
- [ ] Standard risk matrices (5×5)
- [ ] Comprehensive test scenarios

### Complex Projects (70-100 complexity) - 5h total
**Include:**
- [ ] All 15 steps (full workflow)
- [ ] Detailed risk matrices with heat maps
- [ ] Comprehensive boundary and partition analysis
- [ ] Extensive negative testing
- [ ] Full traceability matrices

---

## Success Criteria

### Risk Assessment
- [ ] All high-priority risks identified and documented
- [ ] Risk mitigation strategies defined for top 10 risks
- [ ] Risk matrix validated with stakeholders

### Test Strategy
- [ ] Test scope clearly defined with explicit exclusions
- [ ] Test pyramid ratios defined (e.g., 70% unit, 20% integration, 10% E2E)
- [ ] Quality metrics and gates defined
- [ ] Test strategy approved by stakeholders

### Test Design
- [ ] All test scenarios traceable to requirements
- [ ] Test coverage meets risk-based priorities
- [ ] Negative tests cover all error paths
- [ ] Test cases ready for automation or manual execution

### Documentation
- [ ] Test strategy document complete and reviewed
- [ ] All deliverables created and validated
- [ ] Stakeholder sign-off obtained

---

## Quality Gates

### Phase 1: Risk Assessment
- [ ] **Gate:** At least 80% of business-critical features covered in risk matrix
- [ ] **Gate:** Top 10 risks have mitigation strategies

### Phase 2: Test Strategy
- [ ] **Gate:** Test scope reviewed and approved by product owner
- [ ] **Gate:** Test type matrix covers all required test levels

### Phase 3: Test Design
- [ ] **Gate:** Test scenarios cover all P0/P1 requirements
- [ ] **Gate:** Test case-to-requirement traceability ≥ 90%

### Phase 4: Documentation
- [ ] **Gate:** Test strategy document approved by stakeholders
- [ ] **Gate:** All deliverables pass peer review

---

## Roles & Responsibilities

### Test Architect (Primary)
- [ ] Leads risk assessment (steps 1-4)
- [ ] Defines test strategy (steps 5-9)
- [ ] Guides test design (step 10)
- [ ] Reviews all deliverables

### Tester
- [ ] Assists with test design (steps 12-14)
- [ ] Creates detailed test cases
- [ ] Validates test scenarios

### Tech Writer
- [ ] Creates final test strategy document (step 15)
- [ ] Formats and structures all documentation
- [ ] Ensures consistency across deliverables

---

## Common Pitfalls

### Risk Assessment
- [ ] ❌ **Avoid:** Ignoring low-probability but high-impact risks
- [ ] ❌ **Avoid:** Risk matrix without stakeholder validation
- [ ] ❌ **Avoid:** Vague mitigation strategies without owners

### Test Strategy
- [ ] ❌ **Avoid:** Unrealistic coverage targets (e.g., 100% coverage)
- [ ] ❌ **Avoid:** Test scope without explicit exclusions
- [ ] ❌ **Avoid:** Test data strategy without privacy considerations

### Test Design
- [ ] ❌ **Avoid:** Test cases without clear expected results
- [ ] ❌ **Avoid:** Missing negative test scenarios
- [ ] ❌ **Avoid:** Test cases without traceability to requirements

---

## Deliverables Summary

| Phase | Deliverable | Format | Complexity | Required |
|-------|-------------|--------|------------|----------|
| Risk | business_risk_matrix | Markdown | All | ✓ |
| Risk | technical_risk_matrix | Markdown | All | ✓ |
| Risk | combined_risk_matrix | Markdown | All | ✓ |
| Risk | test_priorities | Markdown | All | ✓ |
| Risk | mitigation_strategies | Markdown | All | ✓ |
| Strategy | test_scope | Markdown | All | ✓ |
| Strategy | test_type_matrix | Markdown | All | ✓ |
| Strategy | environment_requirements | Markdown | All | ✓ |
| Strategy | test_data_strategy | Markdown | All | ✓ |
| Strategy | quality_metrics | Markdown | All | ✓ |
| Design | test_scenarios | Markdown | All | ✓ |
| Design | boundary_tests | Markdown | Medium, Complex | ✓ |
| Design | partition_tests | Markdown | Medium, Complex | ✓ |
| Design | negative_tests | Markdown | All | ✓ |
| Design | test_cases | Markdown | All | ✓ |
| Docs | test_strategy_document | Markdown | All | ✓ |

**Total:** 16 deliverables (14 for simple projects)

---

## Time Tracking

| Complexity | Estimated Time | Actual Time | Variance | Notes |
|------------|----------------|-------------|----------|-------|
| Simple | 3h 0m | ___ | ___ | Skips steps 11-12 |
| Medium | 4h 0m | ___ | ___ | Full workflow except boundary/partition |
| Complex | 5h 0m | ___ | ___ | All 15 steps |

---

## Post-Execution

### Immediate Next Steps
- [ ] Share test strategy document with stakeholders
- [ ] Schedule test strategy review meeting
- [ ] Begin tea-execution workflow (test automation)
- [ ] Archive planning artifacts in project wiki

### Continuous Improvement
- [ ] Capture lessons learned from planning process
- [ ] Update risk matrix based on actual test results
- [ ] Refine quality metrics based on team feedback
- [ ] Update checklist based on retrospective

---

**Last Updated:** 2026-02-09
**Maintained by:** ASMO Core Team
**Feedback:** Submit issues to ASMO GitHub repository
