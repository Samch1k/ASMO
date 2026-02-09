# Task #15 Results: CLI tool `asmo stats`

**Status:** ✅ Completed
**Date:** 2026-02-09

## Implementation Summary

Created new CLI command `asmo stats` that analyzes usage statistics for agents, workflows, and skills.

### Files Created/Modified:
- ✅ `packages/cli/src/commands/stats.ts` - Main stats command implementation
- ✅ `packages/cli/src/index.ts` - Added stats command registration
- ✅ `docs/skills-usage-audit.csv` - Exported skills usage data

### Features Implemented:
1. **Skills Analysis:**
   - Count agent references for each skill
   - Categorize as core (3+ refs), moderate (1-2 refs), rare (0 refs)
   - Export to CSV format

2. **Workflows Analysis:**
   - List all workflows with formatted names
   - Detect TEA sub-workflows
   - Total count

3. **Agents Analysis:**
   - Group by category (core/specialized/validation)
   - Show role type and skills count
   - Highlight agents that can modify code

4. **Output Formats:**
   - Table (default) - human-readable with formatting
   - JSON - for automation
   - CSV - for Excel/analysis

## Key Findings

### 📊 Current State:
```
Agents (in roles JSON): 21
  - Core: 6
  - Specialized: 15
  - Validation: 0 (in JSON, but 4 .ts files exist)

Agent files (.ts): 28
  - Discrepancy: 7 undocumented agents

Workflows: 34
  - Main workflows: 26
  - TEA sub-workflows: 8
  - Note: "tea" parent dir counted separately

Skills (unique in roles): 138
Skills (directories): 92
```

### 🎯 Skills Usage Analysis:

**Core Skills (3+ references):** 0 skills ❌
- NO skills are used by 3 or more agents!
- This indicates highly specialized skills distribution

**Moderate Skills (1-2 references):** 138 skills
- Most popular (2 refs):
  - unit_testing (developer, tester)
  - performance_analysis (optimizer, code-reviewer)
  - caching_strategy (optimizer, performance-engineer)
  - incident_response (devops, security-specialist)
  - sprint_planning (project-manager, scrum-master)
  - market_analysis (product-owner, analyst)
  - competitive_analysis (product-owner, analyst)
  - code_review (adversarial-reviewer, code-reviewer)

**Rare Skills (0 references):** 0 skills

### 🔍 Insights:

1. **No Core Skills:**
   - Every agent has unique, specialized skills
   - Low skill reusability across agents
   - Potential for consolidation

2. **Skill Count Discrepancy:**
   - Roles JSON references: 138 unique skills
   - Skill directories: 92
   - Gap: 46 skills referenced but not in directories (or vice versa)

3. **Agent Count Discrepancy:**
   - Roles JSON: 21 agents
   - Agent .ts files: 28 agents
   - Missing from JSON: 7 agents (including rfq-specialist, supplier-ops, product-manager)

4. **Workflow Count:**
   - 34 total (matches CLAUDE.md claim)
   - TEA workflows add 8 to the base 26

## Usage Examples

```bash
# Show all stats (default)
asmo stats

# Show only skills
asmo stats --type skills

# Show agents
asmo stats --type agents

# Show workflows
asmo stats --type workflows

# Export skills to CSV
asmo stats --type skills --format csv > skills-audit.csv

# JSON output for automation
asmo stats --type all --format json
```

## Next Steps (Task #5)

Use this data to perform detailed skills audit:
1. Analyze CSV for merge candidates (similar names/functions)
2. Identify MeetConnect-specific skills for removal
3. Recommend consolidation strategy
4. Target: 138 → 60 core skills

## Blockers Resolved

- ✅ ConfigLoader API (used `loadRoles()` not `loadAllRoles()`)
- ✅ ESM `__dirname` issue (used `fileURLToPath(import.meta.url)`)
- ✅ Templates path resolution (explicit path to templates)

## Acceptance Criteria: ✅ All Met

- [x] `asmo stats --type skills` shows usage matrix
- [x] `asmo stats --type workflows` shows list with metadata
- [x] `asmo stats --type agents` shows categorization
- [x] `asmo stats --format json` works for automation
- [x] `asmo stats --format csv` exports data
- [x] Command builds successfully
- [x] Zero TypeScript errors
