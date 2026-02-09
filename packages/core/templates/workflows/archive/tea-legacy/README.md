# TEA Workflow Archive (Legacy)

**Date Archived:** 2026-02-09
**Reason:** Consolidated 8 workflows → 3 adaptive workflows
**Phase:** Phase 2 Task #3

---

## What Happened

The original 8 TEA (Test Engineering & Automation) workflows were consolidated into 3 adaptive workflows to reduce complexity and improve usability.

### Old Structure (8 workflows)
```
tea/
├── tea-1-risk-assessment/
├── tea-2-test-strategy/
├── tea-3-test-design/
├── tea-4-test-automation/
├── tea-5-quality-gates/
├── tea-6-release-readiness/
├── tea-7-regression-analysis/
└── tea-8-test-maintenance/
```

**Issues:**
- 8 separate workflows difficult to navigate
- Complex dependency graph
- No clear entry point
- No adaptive features
- Total time: 13h 15m

### New Structure (3 workflows)
```
tea-planning/         (5h) - Risk + Strategy + Design
tea-execution/        (5h 15m) - Automation + Regression + Maintenance
tea-validation/       (2h 45m) - Quality Gates + Release Readiness
```

**Benefits:**
- Clear linear flow: planning → execution → validation
- Adaptive complexity-based skipping
- Consolidated checklists
- Time savings: 45 minutes (9%)
- Easier to select and run

---

## Migration Guide

### If You Were Using Old Workflows

**tea-1-risk-assessment** → Use `tea-planning` (phases 1-4)
**tea-2-test-strategy** → Use `tea-planning` (phases 5-9)
**tea-3-test-design** → Use `tea-planning` (phases 10-15)
**tea-4-test-automation** → Use `tea-execution` (phases 1-5)
**tea-5-quality-gates** → Use `tea-validation` (phases 1-5)
**tea-6-release-readiness** → Use `tea-validation` (phases 6-10)
**tea-7-regression-analysis** → Use `tea-execution` (phases 6-10)
**tea-8-test-maintenance** → Use `tea-execution` (phases 11-15)

### Deliverable Mapping

All 40 deliverables from the old workflows are preserved in the new workflows:

| Old Workflow | Deliverables | New Workflow | Phases |
|--------------|--------------|--------------|--------|
| tea-1 | 5 | tea-planning | 1-4 |
| tea-2 | 6 | tea-planning | 5-9, 15 |
| tea-3 | 5 | tea-planning | 10-14 |
| tea-4 | 5 | tea-execution | 1-5 |
| tea-5 | 5 | tea-validation | 1-5 |
| tea-6 | 5 | tea-validation | 6-10 |
| tea-7 | 5 | tea-execution | 6-10 |
| tea-8 | 5 | tea-execution | 11-15 |

### CLI Migration

**Old:**
```bash
asmo workflow tea-1-risk-assessment --task "Assess project risks"
asmo workflow tea-2-test-strategy --task "Create test strategy"
# ... run 8 separate workflows
```

**New:**
```bash
# Run all planning in one workflow
asmo workflow tea-planning --task "Create comprehensive test plan"

# Or run all 3 in sequence
asmo workflow tea-planning --task "Test planning"
asmo workflow tea-execution --task "Test execution"
asmo workflow tea-validation --task "Quality validation"
```

### Phase Join Criteria

The new workflows support **adaptive phase detection**, allowing you to join at any phase:

**tea-planning:**
- Join at phase 5 (scope_definition) if you already have risk assessment
- Join at phase 10 (scenario_identification) if you have test strategy

**tea-execution:**
- Join at phase 6 (change_analysis) if you already have automation
- Join at phase 11 (health_assessment) if you only need maintenance

**tea-validation:**
- Join at phase 6 (feature_check) if quality gates already set up

---

## Why These Workflows Were Archived

1. **Duplication:** Similar concepts repeated across workflows
2. **Complexity:** 8 workflows harder to understand than 3
3. **No Adaptivity:** Fixed steps regardless of project complexity
4. **Time:** 13h 15m → 12h 30m (9% savings via consolidation)
5. **Usability:** Linear flow easier to follow

---

## Restoration Instructions

If you need to restore the old workflows (not recommended):

```bash
cd packages/core/templates/workflows
cp -r archive/tea-legacy/tea/* .
```

However, **we recommend using the new consolidated workflows** as they:
- Preserve all functionality
- Add adaptive features
- Reduce complexity
- Save time

---

## Related Documentation

- **Analysis Document:** `/docs/phase-2-task3-tea-analysis.md`
- **New Workflows:**
  - `packages/core/templates/workflows/tea-planning/`
  - `packages/core/templates/workflows/tea-execution/`
  - `packages/core/templates/workflows/tea-validation/`
- **Phase 2 Completion Plan:** `/docs/phase-2-completion-plan.md`

---

## Archive Contents

```
tea/
├── tea-1-risk-assessment/
│   ├── tea_risk_assessment_workflow.json
│   └── tea_risk_assessment_workflow.checklist.md
├── tea-2-test-strategy/
│   ├── tea_test_strategy_workflow.json
│   └── tea_test_strategy_workflow.checklist.md
├── tea-3-test-design/
│   ├── tea_test_design_workflow.json
│   └── tea_test_design_workflow.checklist.md
├── tea-4-test-automation/
│   ├── tea_test_automation_workflow.json
│   └── tea_test_automation_workflow.checklist.md
├── tea-5-quality-gates/
│   ├── tea_quality_gates_workflow.json
│   └── tea_quality_gates_workflow.checklist.md
├── tea-6-release-readiness/
│   ├── tea_release_readiness_workflow.json
│   └── tea_release_readiness_workflow.checklist.md
├── tea-7-regression-analysis/
│   ├── tea_regression_analysis_workflow.json
│   └── tea_regression_analysis_workflow.checklist.md
└── tea-8-test-maintenance/
    ├── tea_test_maintenance_workflow.json
    └── tea_test_maintenance_workflow.checklist.md
```

**Total:** 8 workflows, 16 files (JSON + checklist)

---

**Archived by:** ASMO Phase 2 Simplification
**Effective Date:** 2026-02-09
**Status:** ✅ Complete
