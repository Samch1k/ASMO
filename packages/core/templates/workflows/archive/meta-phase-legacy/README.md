# Meta-Phase Workflow Archive (Legacy)

**Date Archived:** 2026-02-09
**Reason:** Removed meta-orchestrator workflows in favor of individual task-specific workflows
**Phase:** Phase 2 Task #4

---

## What Happened

The meta-phase workflows (`discovery_phase_full` and `implementation_phase_full`) were removed as they added unnecessary abstraction without providing clear value.

### Old Structure (2 meta-workflows)
```
0-discovery-phase/
└── discovery_phase_full.json (5 steps, 3-5 days)

0-implementation-phase/
└── implementation_phase_full.json (4 steps, 1.5-2 weeks)
```

**Issues:**
- Meta-orchestrators that just call other workflows
- No clear benefit over running individual workflows
- Added complexity to workflow selection
- Difficult to join at specific phases
- Not used in practice (users prefer specific workflows)

### New Approach (Use Specific Workflows)

Instead of meta-phase workflows, use task-specific workflows directly:

**For Discovery:**
- `create_prd_workflow` - PRD creation
- `architecture_design` - Architecture design
- `create_ux_design_workflow` - UX design
- `api_design` - API design

**For Implementation:**
- `feature_implementation_full` - Full feature implementation
- `dev_story_workflow` - Development story
- `code_review_workflow` - Code review
- `comprehensive_testing` - Testing

---

## Migration Guide

### discovery_phase_full → Individual Workflows

| Old Step | Old Agent | New Workflow | Notes |
|----------|-----------|--------------|-------|
| Step 1: Requirements | business-analyst | `create_prd_workflow` | PRD + user stories |
| Step 2: Feasibility | architect | `architecture_design` | Tech stack validation |
| Step 3: Architecture | architect | `architecture_design` | Full architecture |
| Step 4: UX Design | ux-designer | `create_ux_design_workflow` | Wireframes |
| Step 5: Validation | requirements-validator | Built into each workflow | No separate step needed |

**Old (meta-workflow):**
```bash
asmo workflow discovery_phase_full --task "Discovery for new feature"
# 5 steps, 3-5 days, rigid sequence
```

**New (individual workflows):**
```bash
# Run only what you need
asmo workflow create_prd_workflow --task "Create PRD"
asmo workflow architecture_design --task "Design architecture"
asmo workflow create_ux_design_workflow --task "Create UX design"

# Or use feature_implementation_full which includes discovery
asmo workflow feature_implementation_full --task "Implement feature"
```

**Benefits:**
- Choose only workflows you need
- Start at any point
- More flexibility
- Clearer workflow purpose

---

### implementation_phase_full → Individual Workflows

| Old Step | Old Agent | New Workflow | Notes |
|----------|-----------|--------------|-------|
| Step 1: Code Gen | developer + ui-developer | `feature_implementation_full` | Full implementation |
| Step 2: Testing | tester | `comprehensive_testing` | Test suite |
| Step 3: Code Review | code-reviewer | `code_review_workflow` | Quality check |
| Step 4: Quality Gate | test-architect | `tea_validation_workflow` | Quality gates |

**Old (meta-workflow):**
```bash
asmo workflow implementation_phase_full --task "Implement feature"
# 4 steps, 1.5-2 weeks, requires all discovery artifacts
```

**New (individual workflows):**
```bash
# Full feature implementation (includes all steps)
asmo workflow feature_implementation_full --task "Implement feature"

# Or run specific workflows
asmo workflow dev_story_workflow --task "Implement story"
asmo workflow comprehensive_testing --task "Create tests"
asmo workflow code_review_workflow --task "Review code"
asmo workflow tea_validation_workflow --task "Quality gates"
```

**Benefits:**
- No need for separate "phase" workflow
- `feature_implementation_full` does everything
- Can run specific steps independently
- Better for incremental work

---

## Why These Workflows Were Removed

### 1. Unnecessary Abstraction
Meta-workflows just orchestrated other workflows without adding functionality. Users can orchestrate manually or use `feature_implementation_full`.

### 2. Rigid Sequencing
Forced linear execution even when steps could be skipped or reordered. Individual workflows offer more flexibility.

### 3. Poor Phase Join Support
Difficult to join at specific phases. Individual workflows have clear entry points.

### 4. Low Usage
Analysis showed users preferred specific workflows over meta-orchestrators.

### 5. Complexity Without Value
Added 2 more workflows to choose from without clear differentiation from `feature_implementation_full`.

---

## What Replaced Them

### For Discovery Phase Work

**Primary workflow:**
- `feature_implementation_full` - Includes discovery + implementation

**Specialized workflows:**
- `create_prd_workflow` - PRD only
- `architecture_design` - Architecture only
- `create_ux_design_workflow` - UX only
- `api_design` - API design only

### For Implementation Phase Work

**Primary workflow:**
- `feature_implementation_full` - Full feature implementation (architect → developer → tester)

**Specialized workflows:**
- `dev_story_workflow` - Developer + tester
- `code_review_workflow` - Code review only
- `comprehensive_testing` - Testing only
- `tea_validation_workflow` - Quality gates

---

## Deliverables Mapping

### discovery_phase_full Deliverables → New Workflows

| Deliverable | Old Workflow | New Workflow |
|-------------|-------------|--------------|
| prd_document | discovery_phase_full | `create_prd_workflow` |
| technical_specification_document | discovery_phase_full | `architecture_design` |
| architecture_document | discovery_phase_full | `architecture_design` |
| database_schema | discovery_phase_full | `architecture_design` |
| api_contracts | discovery_phase_full | `api_design` |
| wireframes | discovery_phase_full | `create_ux_design_workflow` |
| validation_report | discovery_phase_full | Built into each workflow |

### implementation_phase_full Deliverables → New Workflows

| Deliverable | Old Workflow | New Workflow |
|-------------|-------------|--------------|
| implementation_code | implementation_phase_full | `feature_implementation_full` |
| api_endpoints | implementation_phase_full | `feature_implementation_full` |
| database_migrations | implementation_phase_full | `feature_implementation_full` |
| react_components | implementation_phase_full | `feature_implementation_full` |
| unit_tests | implementation_phase_full | `comprehensive_testing` |
| integration_tests | implementation_phase_full | `comprehensive_testing` |
| coverage_report | implementation_phase_full | `comprehensive_testing` |
| code_review_report | implementation_phase_full | `code_review_workflow` |
| quality_gate_report | implementation_phase_full | `tea_validation_workflow` |

**All deliverables preserved** in individual workflows.

---

## Restoration Instructions

If you need to restore the old workflows (not recommended):

```bash
cd packages/core/templates/workflows
cp -r archive/meta-phase-legacy/0-discovery-phase .
cp -r archive/meta-phase-legacy/0-implementation-phase .
```

However, **we recommend using the individual workflows** as they:
- Provide better flexibility
- Have clearer purposes
- Support phase joining
- Are actively maintained

---

## Archive Contents

```
0-discovery-phase/
└── discovery_phase_full.json (195 lines)

0-implementation-phase/
└── implementation_phase_full.json (217 lines)
```

**Total:** 2 workflows, 2 JSON files, 412 lines

---

## Related Documentation

- **Task Report:** `/docs/phase-2-task4-results.md`
- **Replacement Workflows:**
  - `packages/core/templates/workflows/3-feature/feature_implementation_full.json`
  - `packages/core/templates/workflows/3-feature/dev_story_workflow.json`
  - `packages/core/templates/workflows/2-code-quality/code_review_workflow.json`
  - `packages/core/templates/workflows/tea-validation/tea_validation_workflow.json`
- **Phase 2 Plan:** `/docs/phase-2-completion-plan.md`

---

## Workflow Comparison

| Feature | Meta-Phase (Old) | Individual Workflows (New) |
|---------|------------------|---------------------------|
| **Flexibility** | Low (rigid sequence) | High (choose what you need) |
| **Phase Join** | Difficult | Easy (clear entry points) |
| **Purpose** | Orchestration | Actual work |
| **Discovery** | 1 meta-workflow | 4 specialized workflows |
| **Implementation** | 1 meta-workflow | 4 specialized workflows |
| **Usage** | Low (users avoided) | High (users prefer) |
| **Maintenance** | 2 files | Multiple well-tested workflows |

---

**Archived by:** ASMO Phase 2 Simplification
**Effective Date:** 2026-02-09
**Status:** ✅ Complete
