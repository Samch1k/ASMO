# BMad Enhancement Examples

## Example 1: Performance Recommendation Enhancement

### Original Basic Recommendation

```json
{
  "priority": "high",
  "category": "performance",
  "title": "Enable parallel execution",
  "description": "Developer and UI Developer can run in parallel",
  "impact": "Faster execution",
  "effort": "medium",
  "implementation": "Update workflows.json"
}
```

### Enhanced Recommendation

```json
{
  "id": "perf-001",
  "priority": "high",
  "category": "performance",
  "title": "Enable parallel execution for developer + ui_developer (40% time reduction)",
  "description": "Developer (backend) and UI Developer (frontend) are currently sequential but have zero dependencies. Historical data shows they average 5m each = 10m total. Parallel execution = 5m total (worst case).",
  "originalRecommendation": "Developer and UI Developer can run in parallel",
  "enhancement": {
    "reasoning": "Analysis of 12 historical runs shows:\n- Developer: avg 4m 50s, never modifies UI files\n- UI Developer: avg 5m 10s, never modifies backend files\n- Zero file conflicts in history\n- Both read from same ADR/design docs (read-only, safe)\n\nParallel execution is safe and offers 45% time savings for this phase.",
    "specificSteps": [
      "1. Open .cursor/config/orchestration/workflows.json",
      "2. Find developer step (order: 8)",
      "3. Add parallel_with field",
      "4. Update ui_developer step to same order number",
      "5. Test with sample feature to verify no conflicts"
    ],
    "codeExample": "// In workflows.json\n{\n  \"order\": 8,\n  \"phase\": \"implementation\",\n  \"role_id\": \"developer\",\n  \"parallel_with\": [\"ui_developer\"],\n  \"description\": \"Implement backend logic\"\n},\n{\n  \"order\": 8,  // Same order as developer\n  \"phase\": \"implementation\",\n  \"role_id\": \"ui_developer\",\n  \"parallel_with\": [\"developer\"],\n  \"description\": \"Implement UI components\"\n}",
    "tradeoffs": {
      "pros": [
        "45% time reduction in implementation phase (10m → 5.5m)",
        "Better resource utilization (2 agents working simultaneously)",
        "Faster feedback loop for developers",
        "Scales to more parallel agents in future"
      ],
      "cons": [
        "Higher memory usage during parallel execution (~350MB vs 200MB)",
        "Slightly more complex error handling (which agent failed?)",
        "Requires merge agent to consolidate outputs",
        "Harder to debug if both agents fail"
      ]
    },
    "impactEstimate": {
      "timeReduction": "4m 30s per workflow (45% improvement in implementation phase)",
      "qualityImprovement": "0% (no change, same agents)",
      "costSavings": "Developer time: 4.5 min × $1.25/min = $5.63 per workflow"
    },
    "implementationGuidance": {
      "files": [
        ".cursor/config/orchestration/workflows.json",
        ".cursor/lib/orchestration/workflow-engine.ts (no changes needed, supports parallel)",
        ".cursor/agents/roles/merge-agent.agent.ts (already exists)"
      ],
      "changes": [
        "workflows.json line 142: Add 'parallel_with': ['ui_developer']",
        "workflows.json line 152: Set order to 8, add 'parallel_with': ['developer']",
        "workflows.json: Verify merge_agent step exists after parallel execution"
      ],
      "testingRequired": "1. Run workflow with test feature\n2. Verify both agents start simultaneously (check logs)\n3. Verify outputs merged correctly\n4. Check no file conflicts\n5. Measure actual time savings"
    },
    "risks": [
      "Low: File conflicts if agents modify same files (historical data shows 0 conflicts)",
      "Low: Merge agent complexity if outputs conflict (rare, LLM handles well)",
      "Medium: Memory usage spike if running many parallel workflows (monitor first 5 runs)"
    ],
    "alternatives": [
      "Pipeline approach: Developer finishes, then UI Developer starts immediately (25% improvement vs 45%)",
      "3-way parallel: Add database migration agent to parallel group (55% improvement)",
      "Dynamic parallel detection: Automatically detect parallelizable steps (complex, future enhancement)"
    ]
  },
  "confidence": 0.95,
  "effort": "medium",
  "roi": "high"
}
```

**Result**: Clear 45% time reduction, specific implementation steps, validated safety via historical analysis.

---

## Example 2: Quality Recommendation Enhancement

### Original Basic Recommendation

```json
{
  "priority": "medium",
  "category": "quality",
  "title": "Improve agent confidence",
  "description": "Architect agent confidence is low (0.72)",
  "impact": "Better output quality",
  "effort": "high",
  "implementation": "Improve prompts or skills"
}
```

### Enhanced Recommendation

```json
{
  "id": "qual-002",
  "priority": "high",
  "category": "quality",
  "title": "Improve architect confidence from 0.72 to 0.85+ via skill refinement",
  "description": "Architect agent confidence declined from 0.88 (3 weeks ago) to 0.72 (current). Analysis of low-confidence outputs reveals missing context about project constraints and incomplete ADR templates.",
  "originalRecommendation": "Architect agent confidence is low (0.72)",
  "enhancement": {
    "reasoning": "Deep dive into 8 recent architect executions with confidence <0.75 reveals:\n\n1. Missing Context (60% of low scores):\n   - Agent doesn't know MeatConnect-specific constraints\n   - Unaware of existing architecture patterns\n   - No access to previous ADRs for consistency\n\n2. Incomplete Skill Definitions (30%):\n   - 'architecture_design' skill lacks examples\n   - No guidance on ADR format\n   - Missing database schema conventions\n\n3. Unclear Requirements (10%):\n   - Requirements from Business Analyst sometimes vague\n   - Missing non-functional requirements\n\nFixing #1 and #2 should restore confidence to 0.85+",
    "specificSteps": [
      "1. Enhance 'architecture_design' skill:",
      "   - Add MeatConnect-specific examples (RFQ, Supplier domains)",
      "   - Include ADR template and previous ADRs for reference",
      "   - Add database naming conventions (snake_case, singular table names)",
      "2. Update architect agent prompt:",
      "   - Add context injection: read docs/architecture/SYSTEM_OVERVIEW.md",
      "   - Reference relevant previous ADRs",
      "   - Include non-functional requirements checklist",
      "3. Add validation step:",
      "   - Check ADR completeness before returning",
      "   - Validate schema against conventions",
      "   - Self-review and adjust if confidence <0.80"
    ],
    "codeExample": "// In .cursor/config/skills/architecture_design/SKILL.md\n\n## Context Requirements\n\nBefore designing architecture:\n1. Read docs/architecture/SYSTEM_OVERVIEW.md\n2. Review relevant ADRs in docs/architecture/decisions/\n3. Check database schema conventions in docs/database/CONVENTIONS.md\n\n## MeatConnect-Specific Patterns\n\n### RFQ Domain\n- Tables: rfqs, rfq_items, rfq_responses\n- Foreign keys: rfq_id, supplier_id, buyer_id\n- Soft deletes: deleted_at timestamp\n\n### API Patterns\n- RESTful: /api/{domain}/{action}\n- Validation: Zod schemas in server/schemas/\n- Error handling: Custom error classes\n\n## ADR Template\n\n# ADR-XXX: [Title]\n\n**Date**: YYYY-MM-DD\n**Status**: Proposed | Accepted | Deprecated\n**Context**: What problem are we solving?\n**Decision**: What did we decide?\n**Consequences**: What are the trade-offs?\n**Alternatives**: What else did we consider?",
    "tradeoffs": {
      "pros": [
        "Higher quality architecture (fewer revisions needed)",
        "Consistent with existing patterns (easier maintenance)",
        "Self-documenting decisions (ADR completeness)",
        "Reduced design validator rejections"
      ],
      "cons": [
        "Architect execution time may increase 30-60s (more context to read)",
        "Initial effort to document conventions (one-time cost)",
        "Skills need maintenance as patterns evolve"
      ]
    },
    "impactEstimate": {
      "timeReduction": "2-3 min saved per workflow (fewer design iterations)",
      "qualityImprovement": "25-30% (confidence 0.72 → 0.90, fewer mistakes)",
      "costSavings": "Reduces design rework: 3 min × 30% workflows = 0.9 min/workflow average"
    },
    "implementationGuidance": {
      "files": [
        ".cursor/config/skills/architecture_design/SKILL.md (enhance)",
        ".cursor/config/skills/architecture_design/references/EXAMPLES.md (add MeatConnect examples)",
        "docs/architecture/CONVENTIONS.md (create if missing)",
        "docs/database/CONVENTIONS.md (create if missing)",
        ".cursor/agents/roles/architect.agent.ts (update prompt)"
      ],
      "changes": [
        "1. Document conventions (1-2 hours one-time)",
        "2. Update skill with examples and context (30 min)",
        "3. Update agent prompt to reference conventions (15 min)",
        "4. Add self-validation logic (30 min)",
        "5. Test with 3 sample tasks (30 min)"
      ],
      "testingRequired": "Test Cases:\n1. Simple CRUD feature (expect confidence >0.85)\n2. Complex integration (expect confidence >0.80)\n3. Performance-critical feature (expect confidence >0.85)\n\nValidation:\n- Check ADR completeness\n- Verify schema follows conventions\n- Confirm API patterns consistent"
    },
    "risks": [
      "Medium: Documentation becomes stale (mitigate with quarterly review)",
      "Low: Increased architect time (trade-off for quality worth it)",
      "Low: Over-constraining creativity (conventions should guide, not restrict)"
    ],
    "alternatives": [
      "Human review: Require human approval for low-confidence designs (slower but safer)",
      "Training data: Fine-tune model with MeatConnect examples (expensive, complex)",
      "Hybrid: Basic agent + human refinement for complex features (manual overhead)"
    ]
  },
  "confidence": 0.88,
  "effort": "high",
  "roi": "high"
}
```

**Result**: Root cause identified (missing context + incomplete skills), specific fixes, measurable improvement target (0.72 → 0.85+).

---

## Example 3: Multiple Recommendations Prioritized by ROI

### Input: 5 Basic Recommendations

```json
[
  {"title": "Reduce timeout", "effort": "low", "impact": "medium"},
  {"title": "Enable parallel execution", "effort": "medium", "impact": "high"},
  {"title": "Add caching", "effort": "high", "impact": "high"},
  {"title": "Improve logging", "effort": "low", "impact": "low"},
  {"title": "Consolidate validators", "effort": "medium", "impact": "medium"}
]
```

### Enhanced Output: ROI-Ranked with Quick Wins Identified

```json
{
  "recommendations": [
    {
      "id": "rec-1",
      "title": "Enable parallel execution",
      "roi": "high",
      "effort": "medium",
      "impact": "high",
      "impactEstimate": {
        "timeReduction": "45% (4.5 min per workflow)",
        "costSavings": "$5.63 per workflow"
      },
      "priority": "high",
      "reasoning": "Highest ROI: Major impact (45% faster) with medium effort (1 hour implementation)"
    },
    {
      "id": "rec-2",
      "title": "Reduce architect timeout",
      "roi": "high",
      "effort": "low",
      "impact": "medium",
      "impactEstimate": {
        "timeReduction": "25 min per timeout (2% workflows)",
        "costSavings": "$31.25 per timeout"
      },
      "priority": "high",
      "reasoning": "Quick win: 5-minute change, rare but valuable (saves 25 min when hit)"
    },
    {
      "id": "rec-3",
      "title": "Consolidate validators",
      "roi": "medium",
      "effort": "medium",
      "impact": "medium",
      "impactEstimate": {
        "timeReduction": "15% (2 min per workflow)",
        "costSavings": "$2.50 per workflow"
      },
      "priority": "medium",
      "reasoning": "Moderate ROI: Medium impact and effort, implement after quick wins"
    },
    {
      "id": "rec-4",
      "title": "Add caching layer",
      "roi": "medium",
      "effort": "high",
      "impact": "high",
      "impactEstimate": {
        "timeReduction": "20% (long-term, after cache warm)",
        "costSavings": "$3.75 per workflow (amortized)"
      },
      "priority": "low",
      "reasoning": "High impact but expensive (2-3 days implementation), defer to Phase 2"
    },
    {
      "id": "rec-5",
      "title": "Enhance logging",
      "roi": "low",
      "effort": "low",
      "impact": "low",
      "impactEstimate": {
        "timeReduction": "0% (monitoring, not performance)",
        "costSavings": "Intangible (faster debugging)"
      },
      "priority": "low",
      "reasoning": "Low ROI: Nice to have, implement if time allows"
    }
  ],
  "quickWins": ["rec-2"],
  "longTermImprovements": ["rec-4"],
  "dependencies": {
    "rec-4": ["rec-1"]
  },
  "implementationPlan": {
    "week1": ["rec-2", "rec-1"],
    "week2": ["rec-3"],
    "phase2": ["rec-4", "rec-5"]
  }
}
```

**Result**: Clear prioritization, quick wins identified, implementation plan generated, ROI justification for each.

---

## Example 4: CLI Usage Walkthrough

### Step 1: Run Workflow with BMad

```bash
$ pnpm workflow:run --workflow complete_feature_lifecycle

🚀 Starting workflow: Complete Feature Lifecycle
...
✅ Workflow complete in 18m 30s
📊 BMad Analysis:
   Overall Score: 7.5/10
   Basic Recommendations: 4

💡 For enhanced AI insights: /bmad-enhance latest
```

### Step 2: Enhance Recommendations

```bash
$ /bmad-enhance latest

🔍 Enhancing recommendations for workflow: complete_feature_lifecycle
📊 Reading basic recommendations (4)...
🤖 Analyzing with AI...

[Claude performs deep analysis...]

✅ Enhancement complete!

Enhanced Recommendations:
  1. 🔴 HIGH: Enable parallel execution (ROI: high, 45% faster)
  2. 🔴 HIGH: Reduce architect timeout (ROI: high, quick win)
  3. 🟠 MEDIUM: Consolidate validators (ROI: medium)
  4. 🟢 LOW: Add caching layer (ROI: medium, defer to Phase 2)

Quick Wins: 1 recommendation (5-minute implementation)
Long-term: 1 recommendation (Phase 2)

📝 Enhanced report saved to:
   docs/retrospectives/2026-01-26-complete-feature-lifecycle.md

Next Steps:
  1. Review enhanced report
  2. Implement quick wins first (rec #2)
  3. Plan Phase 1 improvements (rec #1, #3)
  4. Defer Phase 2 improvements (rec #4)
```

### Step 3: Review Enhanced Report

```bash
$ cat docs/retrospectives/2026-01-26-complete-feature-lifecycle.md

# Workflow Retrospective: Complete Feature Lifecycle

**Date**: 2026-01-26
**Duration**: 18m 30s
**Status**: ✅ Success
**Overall Score**: 7.5/10

## Executive Summary

Workflow executed successfully but 35% slower than optimized baseline (12 min).
4 recommendations identified, 2 high-priority quick wins available.

---

## Recommendations

### 🔴 High Priority - Quick Win

**#2: Reduce architect timeout from 30m to 5m**

**Impact**: 25 min saved per timeout event (2% of workflows)
**Effort**: Low (5-minute config change)
**ROI**: High

**Reasoning**:
Analysis of 15 historical architect executions shows:
- Average: 2m 10s
- P95: 3m 20s
- Current timeout: 30m (900% longer than p95)

Recommended: 5m (150% of p95 for safety)

**Implementation**:
```json
// .cursor/config/orchestration/workflows.json
{
  "role_id": "architect",
  "timeout": "5m"  // Changed from 30m
}
```

**Trade-offs**:
✅ 6x faster failure detection
✅ 25 min saved per timeout
⚠️ May timeout if architect needs deep analysis (monitor first 10 runs)

**Next Steps**:
1. Update workflows.json (5 min)
2. Test with sample feature (10 min)
3. Monitor first 10 runs for legitimate timeouts
...
```

---

## Common Enhancement Patterns

### Pattern 1: Vague → Specific

**Before**: "Improve performance"
**After**: "Enable parallel execution for developer + ui_developer (45% time reduction in implementation phase)"

### Pattern 2: Generic → Context-Aware

**Before**: "Add caching"
**After**: "Add Redis caching for workflow history queries (70% hit rate expected based on access patterns)"

### Pattern 3: No Numbers → Data-Driven

**Before**: "Reduce timeout"
**After**: "Reduce timeout from 30m to 5m (based on p95 of 3m 20s from 15 historical runs)"

### Pattern 4: Implementation Missing → Step-by-Step

**Before**: "Update config"
**After**: "1. Open workflows.json\n2. Find architect step\n3. Change timeout: '30m' → '5m'\n4. Test with sample\n5. Monitor first 10 runs"

### Pattern 5: No Trade-offs → Balanced Analysis

**Before**: "This will help"
**After**: "Pros: 45% faster, better utilization\nCons: Higher memory (350MB vs 200MB), harder to debug\nRisks: File conflicts (low, 0 historical conflicts)"
