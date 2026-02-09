# Skills Consolidation Recommendations

**Date:** 2026-02-09
**Current:** 138 skills (roles JSON) | 92 skill directories
**Target:** 60-65 core skills

## Execution Priority

### 🔴 Priority 1: Remove MeetConnect Skills (Task #1)
**Before consolidation, execute Task #1 to remove:**
- `rfq-specialist.agent.ts`
- `supplier-ops.agent.ts`
- Associated ~13 skill directories

**Result:** Clean baseline for consolidation

---

### 🟡 Priority 2: Skills Consolidation Matrix

#### Merge Group 1: Performance (4 → 2 skills)
| Keep | Remove | Merge Into |
|------|--------|------------|
| ✅ performance_analysis | performance_debugging | performance_analysis |
| ✅ profiling | performance_review | performance_analysis |

**Update Agents:**
- debugger: remove `performance_debugging`, add `performance_analysis`
- adversarial-reviewer: remove `performance_review`

---

#### Merge Group 2: Testing Coverage (3 → 1 skill)
| Keep | Remove | Merge Into |
|------|--------|------------|
| ✅ test_coverage | test_coverage_analysis | test_coverage |
| | smoke_testing | acceptance_testing |

**Update Agents:**
- code-reviewer: remove `test_coverage_analysis`, add `test_coverage`
- tester: remove `smoke_testing`

---

#### Merge Group 3: Security Analysis (3 → 1 skill)
| Keep | Remove | Merge Into |
|------|--------|------------|
| ✅ security_analysis | security_review | security_analysis |
| | api_security | security_analysis |

**Update Agents:**
- adversarial-reviewer: remove `security_review`, add `security_analysis`
- api-designer: remove `api_security`, keep for API context

**Note:** Keep `api_security` if API-specific security patterns needed, otherwise merge.

---

#### Merge Group 4: Code Review (4 → 3 skills)
| Keep | Remove | Merge Into |
|------|--------|------------|
| ✅ code_review | - | - |
| ✅ adversarial_review | design_review | architecture_review |
| ✅ architecture_review | - | - |

**Update Agents:**
- adversarial-reviewer: remove `design_review`, add `architecture_review`

---

#### Merge Group 5: Optimization (4 → 2 skills)
| Keep | Remove | Merge Into |
|------|--------|------------|
| ✅ code_optimization | bundle_optimization | code_optimization |
| ✅ query_optimization | - | - |

**Keep separate:**
- css_optimization (UI-specific)
- index_optimization (DB-specific)

**Update Agents:**
- optimizer: remove `bundle_optimization`

---

#### Merge Group 6: Documentation (4 → 1 skill)
| Keep | Remove | Merge Into |
|------|--------|------------|
| ✅ technical_writing | documentation | technical_writing |
| | architecture_docs | technical_writing |

**Keep separate:**
- api_documentation (API-specific)
- user_guides (end-user docs)
- readme_creation (project docs)
- release_notes (versioning docs)
- tutorial_creation (educational)

**Update Agents:**
- tech-writer: remove `documentation`, `architecture_docs`

---

#### Merge Group 7: Analysis (Generic removal)
| Keep | Remove | Merge Into |
|------|--------|------------|
| ✅ market_analysis | analysis | market_analysis |
| ✅ competitive_analysis | trend_analysis | market_analysis |

**Update Agents:**
- analyst: remove `analysis`, `trend_analysis`

---

#### Merge Group 8: Data Modeling (3 → 1 skill)
| Keep | Remove | Merge Into |
|------|--------|------------|
| ✅ data_modeling | schema_modeling | data_modeling |
| | relationship_design | data_modeling |

**Update Agents:**
- data-architect: remove `schema_modeling`, `relationship_design`

---

### 🟢 Priority 3: Remove Generic/Meta Skills

| Skill | Reason | Agents Affected |
|-------|--------|-----------------|
| `analysis` | Too generic, covered by specific analysis | analyst |
| `research` | Role activity, not technical skill | analyst |
| `documentation` | Covered by technical_writing | tech-writer |
| `integration` | Part of feature_implementation | developer |
| `brainstorming` | Process, not technical skill | analyst |
| `strategic_planning` | Role skill, not technical | analyst |
| `issue_detection` | Covered by code_review | adversarial-reviewer |
| `critical_analysis` | Covered by adversarial_review | adversarial-reviewer |
| `best_practices` | Meta-skill, enforced via reviews | code-reviewer |

---

## Consolidation Impact Summary

### Before:
```
Total skills in roles JSON: 138
- Used by 2+ agents: 8
- Used by 1 agent: 130
- Skill directories: 92
```

### After Consolidation:
```
Removals:
- Generic/meta skills: -9
- Merged skills: -24
Total removed: -33 skills

Result: 138 - 33 = 105 skills

After MeetConnect removal: -13 directories
Skill directories: 92 - 13 = 79

Target refinement: 105 → 65 skills (-40 more)
```

---

## Implementation Steps

### Step 1: Update Roles JSON
For each merge group, update affected role files:

**Example (Performance):**
```json
// packages/core/templates/roles/core-roles.json
{
  "id": "debugger",
  "required_skills": [
    "bug_diagnosis",
    "root_cause_analysis",
    "error_investigation",
    "log_analysis",
    "performance_analysis",  // Changed from performance_debugging
    "hotfix_generation"
  ]
}
```

### Step 2: Remove Skill Directories
```bash
# Example for removed skills
rm -rf packages/core/templates/skills/performance_debugging
rm -rf packages/core/templates/skills/performance_review
rm -rf packages/core/templates/skills/bundle_optimization
# ... etc
```

### Step 3: Create Aliases (Optional)
For backward compatibility, create ALIASES.json:
```json
{
  "performance_debugging": "performance_analysis",
  "performance_review": "performance_analysis",
  "bundle_optimization": "code_optimization"
}
```

### Step 4: Validation
```bash
# After changes, verify:
asmo stats --type skills

# Expected:
# - Total skills: ~105
# - No broken references
# - All skills have directories
```

---

## Further Reduction Plan (105 → 65)

### Candidates for Removal (-40 skills)

#### Over-specific framework skills:
- `tailwind_css` → generic `component_styling`
- `typescript_expert` → part of `code_writing`

#### Redundant domain skills:
- `data_lifecycle` → covered by `data_integrity` + `backup_recovery`
- `response_design` → part of `api_design`
- `request_validation` → part of `api_design`

#### Skills that could be combined:
- `user_flows` + `wireframes` → `ux_design`
- `user_research` + `user_testing` → `user_research`
- `deployment` + `ci_cd` → `devops_pipeline`

**Detailed breakdown in next audit cycle after initial consolidation.**

---

## Validation Checklist

After consolidation:
- [ ] All 21 agents have valid skill references
- [ ] No orphaned skill directories
- [ ] No broken skill references in workflows
- [ ] SkillMatcher still works correctly
- [ ] Documentation updated
- [ ] Tests pass

---

## Roll-back Plan

If issues arise:
1. Git revert to pre-consolidation state
2. Restore from backup: `packages/core/templates/roles/*.json.backup`
3. Re-run validation

---

**Next Action:** Execute Task #1 first (remove MeetConnect), then apply these consolidations.
