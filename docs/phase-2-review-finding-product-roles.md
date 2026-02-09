# Review Finding: product-manager vs product-owner Duplication

**Status:** ⚠️ **POTENTIAL DUPLICATION**
**Severity:** Medium
**Date:** 2026-02-09

---

## Summary

Found significant overlap between `product-manager` (added in Task #9) and existing `product-owner` agent.

---

## Comparison Table

| Aspect | product-owner | product-manager |
|--------|---------------|-----------------|
| **File** | product-owner.agent.ts | product-manager.agent.ts |
| **In roles JSON** | ✅ Yes (specialized-roles.json) | ✅ Yes (added Task #9) |
| **Used in workflows** | ✅ 4 workflows | ❌ 0 workflows |
| **Focus** | Strategy, prioritization, roadmap | Vision, PRD creation, product briefs |
| **Methodology** | MoSCoW method | WSJF framework |

---

## Skills Comparison

### product-owner Skills (5 total)
**Required (3):**
- strategy
- roadmap
- prioritization

**Optional (2):**
- market_analysis
- competitive_analysis

---

### product-manager Skills (10 total)
**Required (5):**
- product_vision
- strategic_planning
- market_analysis ⚠️ OVERLAP
- product_brief_creation
- prd_authoring

**Optional (5):**
- one_page_prd
- feature_prioritization
- success_metrics_definition
- competitive_analysis ⚠️ OVERLAP
- stakeholder_management

---

## Trigger Keywords Comparison

### product-owner Triggers
```
product, strategy, roadmap, prioritize, feature
```

### product-manager Triggers
```
product, prd, product brief, vision, strategy, prioritization, roadmap, backlog
```

**Overlap:** `product`, `strategy`, `roadmap`, `prioritization` ⚠️

---

## Workflow Usage Analysis

### product-owner Used In (4 workflows)
1. **create-product-brief** - Validation step (line 65)
2. **sprint-planning** - Planning step
3. **correct-course** - Course correction
4. **create-story** - Story creation

### product-manager Used In (0 workflows)
**None** - Agent exists but not yet integrated into workflows

---

## Agent Capabilities Comparison

### product-owner Capabilities
From code analysis (product-owner.agent.ts):
- MoSCoW prioritization (Must have, Should have, Could have, Won't have)
- Business value scoring (0-100)
- Roadmap positioning (Q1-Q4)
- Stakeholder impact analysis
- Strategic alignment validation

### product-manager Capabilities
From code analysis (product-manager.agent.ts):
- Product brief creation (vision + goals + metrics)
- One-page PRD (ASMO format)
- Feature prioritization (WSJF framework)
- Market fit analysis
- Success metrics definition (SMART)
- Quick spec creation

---

## Overlap Analysis

### What They Share
1. ✅ Both do **market analysis**
2. ✅ Both do **competitive analysis**
3. ✅ Both do **feature prioritization** (different methods)
4. ✅ Both trigger on **"product"**, **"strategy"**
5. ✅ Both are "reasoning" role_type
6. ✅ Both can't modify code

### What's Different
1. **product-owner**: EXECUTION focus (what to build NEXT, roadmap)
2. **product-manager**: VISION focus (WHY we're building it, PRD, brief)

3. **product-owner**: MoSCoW method (simpler)
4. **product-manager**: WSJF method (more sophisticated)

5. **product-owner**: Used in 4 workflows
6. **product-manager**: Not yet used

---

## Root Cause Analysis

### Why This Happened

**product-manager** was added in Task #9 as part of documenting the orphaned agent file that existed but wasn't in roles JSON.

**However:**
- We didn't check if similar functionality already exists (product-owner)
- We didn't check if workflows need product-manager
- We didn't consider consolidation vs documentation

### Historical Context

From Phase 1 discovery:
- 28 agent .ts files
- 21 roles in JSON
- Gap of 7 agents

**Assumption made:** All orphaned agents should be documented in JSON.

**Better approach:** Should have checked if orphaned agents are:
1. Truly needed
2. Duplicating existing functionality
3. Should be consolidated instead

---

## Impact Assessment

### Current Impact: Low
- Both agents coexist peacefully
- product-manager not breaking anything (not used)
- product-owner continues working in 4 workflows

### Future Impact: Medium
- Confusion: Which agent to use for product work?
- Maintenance: Two agents doing similar things
- Trigger conflicts: Both respond to "product", "strategy"
- Inconsistency: Different prioritization methods (MoSCoW vs WSJF)

---

## Options for Resolution

### Option 1: Keep Both (Separate Concerns)
**Rationale:** Different focus areas

**Division:**
- **product-owner**: Strategy, roadmap, prioritization (EXECUTION)
- **product-manager**: Vision, PRD, product briefs (VISION)

**Actions:**
1. Update descriptions to clarify distinction
2. Split trigger keywords (no overlap)
3. Document when to use which

**Pros:**
- Clear separation of concerns
- Different methodologies preserved
- Flexibility for users

**Cons:**
- Still 2 similar agents
- Risk of confusion
- Overlap in skills

---

### Option 2: Consolidate into product-manager
**Rationale:** product-manager has more capabilities

**Actions:**
1. Merge product-owner skills into product-manager
2. Add MoSCoW method to product-manager
3. Update 4 workflows to use product-manager
4. Delete product-owner agent + JSON entry

**Pros:**
- Single product agent
- All features in one place
- Simpler for users

**Cons:**
- Breaking change for workflows
- Larger, more complex agent
- Loses MoSCoW vs WSJF clarity

---

### Option 3: Keep product-owner, Remove product-manager
**Rationale:** product-owner is already integrated

**Actions:**
1. Remove product-manager from specialized-roles.json
2. Move product-manager.agent.ts to backup
3. Keep product-owner as-is
4. Gap: 26 .ts - 21 roles = 5 (was 4)

**Pros:**
- Minimal disruption
- No workflow changes
- product-owner proven in use

**Cons:**
- Loses WSJF method
- Loses one-page PRD capability
- Wastes product-manager development

---

### Option 4: Hybrid - Merge Skills, Keep Workflows
**Rationale:** Best of both worlds

**Actions:**
1. Add product-manager skills to product-owner JSON
2. Add WSJF method to product-owner agent code
3. Add one-page PRD method to product-owner agent code
4. Delete product-manager from JSON
5. Rename product-manager.agent.ts to .backup

**Pros:**
- No workflow changes
- Gets all capabilities
- Single agent

**Cons:**
- Code changes needed
- Product-owner becomes larger
- Merging complexity

---

## Recommendation

**Recommended:** Option 4 (Hybrid)

**Rationale:**
1. product-owner already integrated (4 workflows)
2. product-manager has valuable capabilities (WSJF, one-page PRD)
3. Merging is better than keeping duplicates
4. Minimizes disruption

**Implementation:**
1. Backup product-manager.agent.ts
2. Merge product-manager methods into product-owner.agent.ts:
   - Add createOnePagerPRD() method
   - Add prioritizeWithWSJF() method (in addition to MoSCoW)
   - Add createProductBrief() method (in addition to current brief logic)
3. Update product-owner JSON skills:
   - Add: product_brief_creation, prd_authoring, one_page_prd, feature_prioritization
4. Remove product-manager from specialized-roles.json
5. Test workflows still work

**Estimated effort:** 1-2 hours

---

## Questions for User

1. **Were product-manager and product-owner intentionally separate?**
   - If yes: What's the intended distinction?
   - If no: OK to consolidate?

2. **Is WSJF vs MoSCoW important?**
   - Should we keep both methods?
   - Or standardize on one?

3. **Which name is better?**
   - product-owner (current, in use)
   - product-manager (more common industry term)

4. **Timeline for resolution?**
   - Fix now in Phase 2?
   - Or defer to Phase 3?

---

## Mitigation (If Keeping Both)

If user decides to keep both agents, document clearly:

**product-owner:** Use for:
- Sprint planning
- Feature prioritization in roadmap
- Story creation
- Course corrections

**product-manager:** Use for:
- Product brief creation
- PRD authoring
- Vision definition
- Market fit analysis

---

## Related Issues

This finding suggests:
1. **Task #9 should have included consolidation analysis**
2. **Phase 1 assumption** (all orphaned agents should be documented) was too simplistic
3. **Need review process** before documenting orphaned agents

---

**Status:** ⚠️ **AWAITING USER DECISION**

**Next Action:** User to decide on Option 1, 2, 3, or 4
