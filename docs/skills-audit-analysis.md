# Skills Usage Audit - Detailed Analysis

**Date:** 2026-02-09
**Total Skills:** 138 (from roles JSON references)
**Goal:** Reduce to ~60 core skills

## Statistics

- **Core** (3+ references): 0 skills
- **Moderate** (2 references): 8 skills
- **Rare** (1 reference): 130 skills

### Most Used Skills (2 references)

1. `unit_testing` - developer, tester
2. `performance_analysis` - optimizer, code-reviewer
3. `caching_strategy` - optimizer, performance-engineer
4. `incident_response` - devops, security-specialist
5. `sprint_planning` - project-manager, scrum-master
6. `market_analysis` - product-owner, analyst
7. `competitive_analysis` - product-owner, analyst
8. `code_review` - adversarial-reviewer, code-reviewer

## Identified Issues

### 1. MeetConnect-Specific Skills

**Status:** ❌ NOT FOUND in roles JSON

The following skills are NOT in the audit because rfq-specialist and supplier-ops agents are not in roles JSON:
- RFQ/procurement related skills exist only in skill directories
- These agents (.ts files) exist but are not documented in JSON
- Will be removed in Task #1

### 2. Duplicate/Overlapping Skills

#### Performance-related (potential merge):
```
performance_analysis (optimizer, code-reviewer)
performance_debugging (debugger)
performance_review (adversarial-reviewer)
profiling (optimizer)
```
**Recommendation:** Consolidate to `performance_analysis` + `profiling`

#### Testing-related (potential merge):
```
unit_testing (developer, tester)
e2e_testing (tester)
acceptance_testing (tester)
smoke_testing (tester)
test_coverage (tester)
test_coverage_analysis (code-reviewer)
test_automation (test-architect)
test_maintenance (test-architect)
test_strategy (test-architect)
```
**Recommendation:** Keep `unit_testing`, `e2e_testing`, `test_strategy`, `test_automation`. Merge coverage skills.

#### Code review/analysis (potential merge):
```
code_review (adversarial-reviewer, code-reviewer)
adversarial_review (adversarial-reviewer)
security_review (adversarial-reviewer)
design_review (adversarial-reviewer)
architecture_review (code-reviewer)
critical_analysis (adversarial-reviewer)
security_analysis (code-reviewer)
```
**Recommendation:** Keep `code_review`, `adversarial_review`, `architecture_review`. Merge security reviews.

#### Optimization (potential merge):
```
code_optimization (optimizer)
query_optimization (optimizer)
bundle_optimization (optimizer)
css_optimization (ui-developer)
index_optimization (data-architect)
```
**Recommendation:** Consolidate to `code_optimization`, `query_optimization`. CSS and index are specific.

#### Documentation (potential merge):
```
documentation (tech-writer)
technical_writing (tech-writer)
api_documentation (tech-writer)
architecture_docs (tech-writer)
```
**Recommendation:** Keep `technical_writing` as umbrella, remove `documentation`.

#### Analysis skills (potential merge):
```
analysis (analyst)
market_analysis (product-owner, analyst)
competitive_analysis (product-owner, analyst)
performance_analysis (optimizer, code-reviewer)
trend_analysis (analyst)
regression_analysis (test-architect)
coverage_analysis (test-architect)
security_analysis (code-reviewer)
critical_analysis (adversarial-reviewer)
```
**Recommendation:** Keep domain-specific analysis skills, remove generic `analysis`.

### 3. Generic/Vague Skills (consider removing)

These skills are too generic or better represented by more specific skills:
- `analysis` (too generic, covered by specific analysis skills)
- `research` (too generic)
- `documentation` (covered by `technical_writing`)
- `integration` (too generic, part of development)
- `brainstorming` (process, not a skill)
- `strategic_planning` (covered by role, not technical skill)

### 4. Skills that Could Be Combined

#### Data-related:
```
data_modeling (architect)
schema_modeling (data-architect)
relationship_design (data-architect)
```
→ Consolidate to `data_modeling`

#### API-related:
```
rest_api (api-designer)
openapi_spec (api-designer)
graphql_design (api-designer)
```
→ Keep all (different paradigms)

#### Security:
```
security_review (adversarial-reviewer)
security_analysis (code-reviewer)
api_security (api-designer)
```
→ Consolidate to `security_analysis`

## Consolidation Plan

### Phase 1: Remove Generic Skills (-10)
- `analysis` → covered by specific skills
- `research` → part of roles, not technical
- `documentation` → use `technical_writing`
- `integration` → part of `feature_implementation`
- `brainstorming` → process skill
- `strategic_planning` → role skill
- `relationship_design` → merge into `data_modeling`
- `issue_detection` → covered by code_review
- `critical_analysis` → covered by adversarial_review
- `best_practices` → meta-skill

### Phase 2: Consolidate Performance Skills (-3)
- Merge `performance_debugging` + `performance_review` → `performance_analysis`
- Keep: `performance_analysis`, `profiling`

### Phase 3: Consolidate Testing Skills (-5)
- Merge `test_coverage` + `test_coverage_analysis` → `test_coverage`
- Merge `smoke_testing` → `acceptance_testing`
- Keep: `unit_testing`, `e2e_testing`, `acceptance_testing`, `test_coverage`, `test_strategy`, `test_automation`, `test_maintenance`

### Phase 4: Consolidate Review Skills (-4)
- Merge `security_review` + `security_analysis` → `security_analysis`
- Merge `design_review` → `architecture_review`
- Keep: `code_review`, `adversarial_review`, `architecture_review`, `security_analysis`

### Phase 5: Consolidate Optimization Skills (-2)
- Merge `bundle_optimization` → `code_optimization`
- Keep: `code_optimization`, `query_optimization`, `css_optimization`, `index_optimization`

### Phase 6: Consolidate Documentation Skills (-3)
- Merge `documentation`, `architecture_docs` → `technical_writing`
- Keep: `technical_writing`, `api_documentation`, `user_guides`, `readme_creation`, `release_notes`, `tutorial_creation`

### Phase 7: Consolidate Analysis Skills (-6)
- Remove generic `analysis`
- Merge `coverage_analysis` → `test_coverage`
- Merge `trend_analysis` → `market_analysis`
- Keep domain-specific: `market_analysis`, `competitive_analysis`, `performance_analysis`, `regression_analysis`, `security_analysis`

## MeetConnect Skills Removal (from directories)

When Task #1 is executed, these skills from directories will be removed:
- All RFQ-related skills (~13 from grep earlier)
- All procurement-related skills
- All supplier-related skills

**Estimated:** -13 skills from directories

## Final Target

```
Current: 138 skills (roles JSON)
Phase 1-7 consolidation: -33 skills
Target after consolidation: ~105 skills

After MeetConnect removal from directories: 92 - 13 = 79 skill directories

Final target: 60-65 CORE skills
Additional reduction needed: ~45 skills
```

## Skills to Keep (Core - Priority List)

### Development (12 skills):
- code_writing, typescript_expert
- feature_implementation, refactoring
- unit_testing, e2e_testing
- bug_diagnosis, error_investigation
- code_optimization, query_optimization
- integration (if kept), hotfix_generation

### Architecture & Design (8 skills):
- system_design, architecture_decisions, adr_creation
- data_modeling, scalability_planning
- api_design, technology_evaluation, architecture_review

### Testing & QA (7 skills):
- acceptance_testing, test_coverage
- test_strategy, test_automation, test_maintenance
- risk_based_testing, regression_analysis

### Performance (4 skills):
- performance_analysis, profiling
- caching_strategy, performance_debugging

### Security (3 skills):
- security_analysis, incident_response
- api_security

### DevOps (4 skills):
- deployment, ci_cd
- infrastructure, monitoring

### Code Review (3 skills):
- code_review, adversarial_review
- architecture_review

### Documentation (5 skills):
- technical_writing, api_documentation
- user_guides, readme_creation, release_notes

### UI/UX (10 skills):
- component_styling, responsive_design, accessibility
- wireframes, user_flows, usability
- user_research, prototyping, user_testing
- animation

### Product/Business (8 skills):
- requirements_analysis, stakeholder_management
- market_analysis, competitive_analysis
- product_brief_creation, sprint_planning
- prioritization, roadmap

### Database (6 skills):
- data_modeling, database_normalization
- data_migration, data_integrity
- backup_recovery, index_optimization

**TOTAL CORE:** ~70 skills

## Additional Skills to Review

These skills appear valuable but usage should be validated:
- css_optimization (ui-specific)
- bundle_optimization (frontend-specific)
- root_cause_analysis (overlap with bug_diagnosis?)
- log_analysis (part of debugging?)
- tailwind_css (too specific framework?)
- graphql_design vs rest_api (both needed?)

## Recommendations Summary

1. **Immediate actions (Task #1):**
   - Remove 7 undocumented agent files (including rfq, supplier)
   - Remove ~13 RFQ/procurement skill directories

2. **Consolidation (Phase 2-3):**
   - Apply 7-phase consolidation plan: -33 skills
   - Result: 138 → 105 skills in roles JSON

3. **Deep audit (Phase 4):**
   - Review remaining 105 against 92 skill directories
   - Resolve discrepancies (skills in JSON but no directory, or vice versa)
   - Further reduce to 60-70 core skills

4. **Final target:**
   - 60-70 well-documented, non-overlapping core skills
   - Extension packs for domain-specific needs

## Next Steps

1. ✅ Export recommendations to CSV
2. Create skill merge mapping
3. Execute Phase 1-7 consolidations
4. Update roles JSON with consolidated skills
5. Verify all kept skills have directories
6. Remove orphaned skill directories
