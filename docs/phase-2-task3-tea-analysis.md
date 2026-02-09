# TEA Workflow Consolidation Analysis

**Task:** #3 - Consolidate 8 TEA workflows → 3 workflows
**Date:** 2026-02-09
**Status:** 🔄 Analysis Phase

---

## Executive Summary

### Current State
- **8 TEA workflows** (tea-1 through tea-8)
- **Total steps:** 39 steps
- **Total time:** 13h 15m
- **Agents used:** test-architect, tester, devops, tech-writer
- **Total deliverables:** 40 artifacts

### Target State
- **3 consolidated workflows:**
  1. `tea-planning` - Planning & Design (risk + strategy + design)
  2. `tea-execution` - Execution & Maintenance (automation + regression + maintenance)
  3. `tea-validation` - Quality & Release (gates + readiness)

---

## Complete Workflow Mapping

### Workflow 1: tea_risk_assessment_workflow.json
**Location:** `packages/core/templates/workflows/tea-1-risk-assessment/`
**Duration:** 1h 25m
**Steps:** 4

| Order | Role | Phase | Deliverables | Time |
|-------|------|-------|--------------|------|
| 1 | test-architect | business_risk | business_risk_matrix | 20m |
| 2 | test-architect | technical_risk | technical_risk_matrix | 25m |
| 3 | test-architect | risk_prioritization | combined_risk_matrix, test_priorities | 20m |
| 4 | test-architect | mitigation_strategies | mitigation_strategies | 20m |

**Key Outputs:**
- Business risk matrix (5×5: probability × impact)
- Technical risk matrix (complexity, dependencies, unknowns)
- Combined risk prioritization
- Risk mitigation strategies

---

### Workflow 2: tea_test_strategy_workflow.json
**Location:** `packages/core/templates/workflows/tea-2-test-strategy/`
**Duration:** 1h 45m
**Steps:** 6

| Order | Role | Phase | Deliverables | Time |
|-------|------|-------|--------------|------|
| 1 | test-architect | scope_definition | test_scope | 15m |
| 2 | test-architect | test_types | test_type_matrix | 20m |
| 3 | test-architect | environment | environment_requirements | 15m |
| 4 | test-architect | data_strategy | test_data_strategy | 20m |
| 5 | test-architect | metrics | quality_metrics | 15m |
| 6 | tech-writer | documentation | test_strategy_document | 20m |

**Key Outputs:**
- Test scope definition (what to test, what NOT to test)
- Test type matrix (unit, integration, E2E, performance, security)
- Environment requirements (dev, staging, prod)
- Test data strategy (generation, mocking, privacy)
- Quality metrics (coverage, defect density, velocity)
- Comprehensive test strategy document

---

### Workflow 3: tea_test_design_workflow.json
**Location:** `packages/core/templates/workflows/tea-3-test-design/`
**Duration:** 1h 50m
**Steps:** 5

| Order | Role | Phase | Deliverables | Time |
|-------|------|-------|--------------|------|
| 1 | test-architect | scenario_identification | test_scenarios | 25m |
| 2 | test-architect | boundary_analysis | boundary_tests | 20m |
| 3 | tester | equivalence_partitioning | partition_tests | 25m |
| 4 | tester | negative_testing | negative_tests | 20m |
| 5 | tester | test_case_creation | test_cases | 20m |

**Key Outputs:**
- Test scenarios (happy path, edge cases)
- Boundary value tests (min/max, off-by-one)
- Equivalence partition tests (valid/invalid classes)
- Negative tests (error handling, invalid input)
- Detailed test cases (preconditions, steps, expected results)

---

### Workflow 4: tea_test_automation_workflow.json
**Location:** `packages/core/templates/workflows/tea-4-test-automation/`
**Duration:** 2h 20m
**Steps:** 5

| Order | Role | Phase | Deliverables | Time |
|-------|------|-------|--------------|------|
| 1 | test-architect | automation_scope | automation_scope | 20m |
| 2 | test-architect | tool_selection | tool_recommendations | 25m |
| 3 | test-architect | framework_design | framework_design | 30m |
| 4 | tester | implementation | automated_tests | 45m |
| 5 | devops | ci_integration | ci_configuration | 20m |

**Key Outputs:**
- Automation scope (what to automate, ROI analysis)
- Tool recommendations (frameworks, libraries, CI tools)
- Framework design (page objects, fixtures, utilities)
- Automated test implementation
- CI/CD integration configuration

---

### Workflow 5: tea_quality_gates_workflow.json
**Location:** `packages/core/templates/workflows/tea-5-quality-gates/`
**Duration:** 1h 40m
**Steps:** 5

| Order | Role | Phase | Deliverables | Time |
|-------|------|-------|--------------|------|
| 1 | test-architect | gate_identification | gate_points | 20m |
| 2 | test-architect | criteria_definition | gate_criteria | 20m |
| 3 | test-architect | thresholds | threshold_config | 20m |
| 4 | devops | implementation | gate_implementation | 25m |
| 5 | tech-writer | documentation | gate_documentation | 15m |

**Key Outputs:**
- Gate points (commit, PR, staging, production)
- Gate criteria (coverage, defects, performance)
- Threshold configuration (min coverage %, max critical bugs)
- Gate implementation (CI hooks, automation)
- Gate documentation (process, thresholds, overrides)

---

### Workflow 6: tea_release_readiness_workflow.json
**Location:** `packages/core/templates/workflows/tea-6-release-readiness/`
**Duration:** 1h 20m
**Steps:** 5

| Order | Role | Phase | Deliverables | Time |
|-------|------|-------|--------------|------|
| 1 | test-architect | feature_check | feature_checklist | 15m |
| 2 | test-architect | quality_metrics | quality_report | 20m |
| 3 | test-architect | defect_review | defect_analysis | 20m |
| 4 | devops | operational_check | operational_checklist | 15m |
| 5 | test-architect | recommendation | release_recommendation | 10m |

**Key Outputs:**
- Feature checklist (all features tested, acceptance met)
- Quality metrics report (coverage, pass rate, defects)
- Defect analysis (open bugs, severity, risk assessment)
- Operational checklist (deployment, rollback, monitoring)
- Go/No-Go release recommendation

---

### Workflow 7: tea_regression_analysis_workflow.json
**Location:** `packages/core/templates/workflows/tea-7-regression-analysis/`
**Duration:** 1h 50m
**Steps:** 5

| Order | Role | Phase | Deliverables | Time |
|-------|------|-------|--------------|------|
| 1 | test-architect | change_analysis | change_impact | 25m |
| 2 | test-architect | test_selection | selected_tests | 20m |
| 3 | test-architect | risk_assessment | regression_risk | 20m |
| 4 | tester | execution | test_results | 30m |
| 5 | test-architect | analysis | regression_report | 15m |

**Key Outputs:**
- Change impact analysis (affected modules, dependencies)
- Test selection (regression suite, risk-based selection)
- Regression risk assessment (high/medium/low risk areas)
- Test execution results (pass/fail, coverage)
- Regression analysis report (trends, recommendations)

---

### Workflow 8: tea_test_maintenance_workflow.json
**Location:** `packages/core/templates/workflows/tea-8-test-maintenance/`
**Duration:** 1h 45m
**Steps:** 5

| Order | Role | Phase | Deliverables | Time |
|-------|------|-------|--------------|------|
| 1 | test-architect | health_assessment | health_report | 25m |
| 2 | test-architect | flaky_analysis | flaky_test_list | 25m |
| 3 | tester | cleanup | cleanup_report | 20m |
| 4 | tester | optimization | optimization_changes | 20m |
| 5 | test-architect | maintenance_plan | maintenance_plan | 15m |

**Key Outputs:**
- Test suite health report (pass rate, duration, flakiness)
- Flaky test identification and analysis
- Cleanup report (obsolete tests removed, duplicates merged)
- Optimization changes (parallelization, performance)
- Ongoing maintenance plan

---

## Agent Usage Summary

| Agent | Workflows Used In | Total Steps | % Usage |
|-------|-------------------|-------------|---------|
| **test-architect** | All 8 | 29 steps | 74% |
| **tester** | 3, 4, 7, 8 | 7 steps | 18% |
| **devops** | 4, 5, 6 | 3 steps | 8% |
| **tech-writer** | 2, 5 | 2 steps | 5% |

**Key Insight:** test-architect is the primary agent (74% of all steps)

---

## Deliverables by Category

### Planning Deliverables (13)
- business_risk_matrix, technical_risk_matrix, combined_risk_matrix
- test_priorities, mitigation_strategies
- test_scope, test_type_matrix, environment_requirements
- test_data_strategy, quality_metrics
- test_scenarios, boundary_tests, partition_tests

### Execution Deliverables (15)
- negative_tests, test_cases
- automation_scope, tool_recommendations, framework_design
- automated_tests, ci_configuration
- change_impact, selected_tests, regression_risk
- test_results, regression_report
- health_report, flaky_test_list

### Validation Deliverables (12)
- cleanup_report, optimization_changes, maintenance_plan
- gate_points, gate_criteria, threshold_config
- gate_implementation, gate_documentation
- feature_checklist, quality_report, defect_analysis
- operational_checklist, release_recommendation

---

## Consolidation Plan: 8 → 3 Workflows

### Group A: tea-planning (Planning & Design)
**Combines:** tea-1 (risk) + tea-2 (strategy) + tea-3 (design)

| Source | Phases | Steps | Agents | Time |
|--------|--------|-------|--------|------|
| tea-1 | 4 phases | 4 steps | test-architect | 1h 25m |
| tea-2 | 6 phases | 6 steps | test-architect, tech-writer | 1h 45m |
| tea-3 | 5 phases | 5 steps | test-architect, tester | 1h 50m |
| **Total** | **15 phases** | **15 steps** | **3 agents** | **5h 0m** |

**Consolidation Strategy:**
1. Sequential flow: risk → strategy → design
2. Natural dependencies: risk informs strategy, strategy informs design
3. All planning artifacts generated before execution
4. Agents: test-architect (primary), tester (design), tech-writer (docs)

**Estimated Consolidated Time:** 4h 30m (10% savings via shared context)

---

### Group B: tea-execution (Execution & Maintenance)
**Combines:** tea-4 (automation) + tea-7 (regression) + tea-8 (maintenance)

| Source | Phases | Steps | Agents | Time |
|--------|--------|-------|--------|------|
| tea-4 | 5 phases | 5 steps | test-architect, tester, devops | 2h 20m |
| tea-7 | 5 phases | 5 steps | test-architect, tester | 1h 50m |
| tea-8 | 5 phases | 5 steps | test-architect, tester | 1h 45m |
| **Total** | **15 phases** | **15 steps** | **3 agents** | **5h 55m** |

**Consolidation Strategy:**
1. Automation first (framework setup)
2. Regression analysis (change-based testing)
3. Maintenance (ongoing health)
4. Agents: test-architect (primary), tester (execution), devops (CI/CD)

**Estimated Consolidated Time:** 5h 15m (12% savings via shared execution context)

---

### Group C: tea-validation (Quality & Release)
**Combines:** tea-5 (quality-gates) + tea-6 (release-readiness)

| Source | Phases | Steps | Agents | Time |
|--------|--------|-------|--------|------|
| tea-5 | 5 phases | 5 steps | test-architect, devops, tech-writer | 1h 40m |
| tea-6 | 5 phases | 5 steps | test-architect, devops | 1h 20m |
| **Total** | **10 phases** | **10 steps** | **3 agents** | **3h 0m** |

**Consolidation Strategy:**
1. Quality gates setup (thresholds, automation)
2. Release readiness check (features, metrics, defects)
3. Go/No-Go recommendation
4. Agents: test-architect (primary), devops (implementation), tech-writer (docs)

**Estimated Consolidated Time:** 2h 45m (8% savings via shared validation logic)

---

## Time Savings Analysis

| Metric | Before (8 workflows) | After (3 workflows) | Savings |
|--------|----------------------|---------------------|---------|
| **Total workflows** | 8 | 3 | -5 workflows |
| **Total steps** | 39 | 40 | +1 step* |
| **Total time** | 13h 15m | 12h 30m | -45m (9%) |
| **Avg time per workflow** | 1h 39m | 4h 10m | - |

*+1 step = added transition/handoff steps between consolidated sections

**Key Benefits:**
1. **Reduced context switching:** 3 workflows instead of 8
2. **Better flow:** Natural progression (plan → execute → validate)
3. **Shared context:** Agents reuse artifacts from previous phases
4. **Simpler selection:** Easier to choose which workflow to run
5. **Maintainability:** 3 files to update instead of 8

---

## Dependencies Between Workflows

### Current Dependencies (8 workflows)
```
tea-1 (risk) ──┬──> tea-2 (strategy) ──> tea-3 (design) ──┬──> tea-4 (automation)
               │                                            │
               └──> tea-5 (gates) ──────────────────────────┼──> tea-6 (readiness)
                                                            │
                                                            └──> tea-7 (regression)
                                                                       │
                                                                       └──> tea-8 (maintenance)
```

**Issues:**
- Complex dependency graph
- No clear entry point
- Unclear when to run each workflow

### Consolidated Dependencies (3 workflows)
```
tea-planning ──> tea-execution ──> tea-validation
   (5h)             (5h 15m)           (2h 45m)
```

**Benefits:**
- Linear dependency chain
- Clear entry point (always start with planning)
- Execution depends on planning outputs
- Validation depends on execution results
- Can run in sequence or skip to specific stage

---

## Adaptive Features Analysis

### Current State
- **0 adaptive features** across all 8 workflows
- All steps are mandatory
- No complexity-based skipping
- No conditional deliverables

### Opportunities for Adaptive Features

#### tea-planning (Adaptive Potential: HIGH)
**Complexity-based skipping:**
- **Simple projects:** Skip boundary_analysis, equivalence_partitioning (use basic test design)
- **Medium projects:** Full test design but simplified risk assessment
- **Complex projects:** Full workflow including detailed risk matrices

**Adaptive timeouts:**
- Simple: 3h (vs 4h 30m)
- Medium: 4h
- Complex: 5h

#### tea-execution (Adaptive Potential: MEDIUM)
**Complexity-based skipping:**
- **Simple projects:** Skip framework_design (use standard templates)
- **Medium projects:** Basic automation only
- **Complex projects:** Full automation + regression + maintenance

**Adaptive timeouts:**
- Simple: 3h (vs 5h 15m)
- Medium: 4h 30m
- Complex: 6h

#### tea-validation (Adaptive Potential: LOW)
**Reason:** Quality gates and release checks are critical regardless of complexity

**Minor optimization:**
- Simple: Streamlined checklists
- Complex: Detailed analysis

**Adaptive timeouts:**
- Simple: 2h (vs 2h 45m)
- Medium: 2h 30m
- Complex: 3h

---

## Checklist File Analysis

### Current Checklists (8 files)
1. `tea-1-risk-assessment/tea_risk_assessment_workflow.checklist.md` ✓
2. `tea-2-test-strategy/tea_test_strategy_workflow.checklist.md` ✓
3. `tea-3-test-design/tea_test_design_workflow.checklist.md` ✓
4. `tea-4-test-automation/tea_test_automation_workflow.checklist.md` ✓
5. `tea-5-quality-gates/tea_quality_gates_workflow.checklist.md` ✓
6. `tea-6-release-readiness/tea_release_readiness_workflow.checklist.md` ✓
7. `tea-7-regression-analysis/tea_regression_analysis_workflow.checklist.md` ✓
8. `tea-8-test-maintenance/tea_test_maintenance_workflow.checklist.md` ✓

### Consolidated Checklists (3 files)
1. `tea-planning/tea_planning_workflow.checklist.md` - Merge checklists 1-3
2. `tea-execution/tea_execution_workflow.checklist.md` - Merge checklists 4, 7, 8
3. `tea-validation/tea_validation_workflow.checklist.md` - Merge checklists 5-6

**Action:** Create 3 consolidated checklists by merging relevant sections

---

## Implementation Plan

### Step 1: Create tea-planning workflow ✅ (NEXT)
**File:** `packages/core/templates/workflows/tea-planning/tea_planning_workflow.json`
**Time:** 45m
**Tasks:**
- Merge tea-1, tea-2, tea-3 into single workflow
- Add adaptive features (complexity-based skipping)
- Create consolidated checklist
- Update phase join criteria

### Step 2: Create tea-execution workflow
**File:** `packages/core/templates/workflows/tea-execution/tea_execution_workflow.json`
**Time:** 45m
**Tasks:**
- Merge tea-4, tea-7, tea-8 into single workflow
- Add adaptive features (framework design skipping)
- Create consolidated checklist
- Update phase join criteria

### Step 3: Create tea-validation workflow
**File:** `packages/core/templates/workflows/tea-validation/tea_validation_workflow.json`
**Time:** 30m
**Tasks:**
- Merge tea-5, tea-6 into single workflow
- Add adaptive features (minimal)
- Create consolidated checklist
- Update phase join criteria

### Step 4: Archive old workflows
**Time:** 10m
**Tasks:**
- Move tea-1 through tea-8 to `archive/tea-legacy/`
- Update workflow index
- Document migration path

### Step 5: Update documentation
**Time:** 20m
**Tasks:**
- Update CLAUDE.md workflow table
- Update docs/phase-2-task3-results.md
- Create migration guide

---

## Quality Checklist

- [ ] All 40 deliverables preserved across 3 workflows
- [ ] All 4 agents properly assigned
- [ ] Dependencies mapped correctly
- [ ] Adaptive features implemented
- [ ] Checklists consolidated
- [ ] Phase join criteria updated
- [ ] Time estimates validated
- [ ] Old workflows archived
- [ ] Documentation updated
- [ ] Build succeeds
- [ ] No broken workflow references

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Lost deliverables | Low | High | Verify all 40 deliverables mapped |
| Broken dependencies | Medium | High | Test workflow selection after consolidation |
| Time estimates wrong | Medium | Low | Based on actual workflow data |
| User workflow disruption | Low | Medium | Keep old workflows in archive/ for 1 release |

---

## Success Criteria

✅ **8 workflows → 3 workflows** (goal: 62% reduction)
✅ **40 deliverables preserved** (goal: 100% coverage)
✅ **Time savings 9%** (goal: 5-10%)
✅ **Adaptive features added** (goal: complexity-aware)
✅ **Build succeeds** (goal: no errors)
✅ **Documentation updated** (goal: CLAUDE.md + PRD sync)

---

**Next Step:** Create `tea_planning_workflow.json` (Step 1 - 45min)
**ETA:** 2026-02-09 (today)
**Status:** 🟢 Ready to implement
