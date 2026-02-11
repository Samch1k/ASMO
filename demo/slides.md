# ASMO — AI System for Multiagent Orchestration
## Tech Team Demo

---

## Slide 1: Title

**ASMO**
**AI System for Multiagent Orchestration**

*Intelligent task routing, multi-agent workflows, zero-cost LLM mode*

**Demo Duration:** 45-60 minutes
**Audience:** Technical Team

---

## Slide 2: The Problem

### Current Challenges with AI-Assisted Development

| Problem | Impact |
|---------|--------|
| 💰 **High LLM API costs** | Limits adoption, $1000+/month bills |
| 🎯 **Manual task routing** | Developer decides which tool/agent to use |
| 🔗 **Context loss between agents** | Repeated work, missed decisions |
| ⏳ **Approval fatigue** | Simple tasks blocked by checkpoints |
| 🤖 **Single-agent limitations** | One perspective, potential blind spots |

**Example:**
```
Developer workflow today:
1. Choose right AI tool for task (ChatGPT? Copilot? Claude?)
2. Copy context manually between sessions
3. Approve every single change (even typos)
4. Pay $20-50/month per developer
```

---

## Slide 3: ASMO Solution

### Intelligent Multi-Agent Orchestration

```
┌───────────────────────────────────────────────────────┐
│  "Fix null pointer in login handler"                  │
│                         ↓                              │
│  [ComplexityAnalyzer] → score: 35 (simple, bug_fix)   │
│                         ↓                              │
│  [WorkflowSelector] → bug_fix_workflow                │
│                         ↓                              │
│  [WorkflowEngine] → debugger → developer → tester     │
│                         ↓                              │
│  Result: Fix applied, tests added, 12 minutes         │
└───────────────────────────────────────────────────────┘
```

**Key Numbers:**
- **25 agents** (core, specialized, validation)
- **27 workflows** (from trivial to enterprise)
- **55 skills** (centralized library)
- **$0/month** (with Session mode)

---

## Slide 4: Architecture — 5-Stage Pipeline

```
INPUT → ANALYZE → ROUTE → EXECUTE → RESULT
```

### Stage 1: Task Input
```bash
asmo run "Implement OAuth2 authentication"
```

### Stage 2: Complexity Analysis
```json
{
  "score": 75,
  "level": "complex",
  "categories": ["security", "feature", "api"],
  "impacts": ["security_impact", "high_risk"]
}
```

### Stage 3: Workflow Selection
```
Matched: feature_implementation_full
Agents: architect → security-specialist → developer → tester
Mode: party (complexity ≥ 60)
```

### Stage 4: Execution
```
Phase 1: Architect (design OAuth2 flow)
  ↓ ContextCascade
Phase 2: Security Specialist (threat model)
  ↓ ContextCascade
Phase 3: Developer (implement)
  ↓ ContextCascade
Phase 4: Tester (security tests)
```

### Stage 5: Result
```
✓ OAuth2 implemented with PKCE
✓ Security review passed
✓ Tests: 15 created, all passing
⏱  Duration: 4.5 hours
🪙 Tokens: 18,000 ($0 with Session mode)
```

---

## Slide 5: Dual LLM Strategy — Cost Optimization

### Three-Tier Fallback

```
┌─────────────────────────────────────────────────┐
│  SESSION MODE (Default)                         │
│  Claude CLI                                     │
│  Cost: $0                                       │
│  Accuracy: High                                 │
└─────────────────┬───────────────────────────────┘
                  │ unavailable
                  ↓
┌─────────────────────────────────────────────────┐
│  API MODE (Fallback)                            │
│  ANTHROPIC_API_KEY                              │
│  Cost: Pay-per-token                            │
│  Accuracy: High                                 │
└─────────────────┬───────────────────────────────┘
                  │ unavailable
                  ↓
┌─────────────────────────────────────────────────┐
│  HEURISTICS MODE (Offline)                      │
│  Keyword analysis                               │
│  Cost: $0                                       │
│  Accuracy: ~65%                                 │
└─────────────────────────────────────────────────┘
```

### Model Selection by Complexity

| Complexity | Score | Model | Rationale |
|------------|-------|-------|-----------|
| Trivial | 0-20 | Haiku | Fast, cheap, sufficient |
| Simple | 21-40 | Haiku | Straightforward fixes |
| Medium | 41-60 | Sonnet | Balanced reasoning |
| Complex | 61-80 | Sonnet/Opus | Deep analysis |
| Enterprise | 81-100 | Opus | Maximum capability |

---

## Slide 6: Cost Comparison

### Monthly Cost Analysis (100 tasks/day)

| Task Type | Count/Day | Session Mode | API Mode (Sonnet) |
|-----------|-----------|--------------|-------------------|
| Trivial | 20 | $0 | $1.50 |
| Simple | 50 | $0 | $15.00 |
| Medium | 25 | $0 | $18.75 |
| Complex | 5 | $0 | $11.25 |
| **Monthly Total** | **~2,200** | **$0** | **~$1,023** |

### ROI
- **Savings:** $1,023/month per developer
- **Team of 10:** $10,230/month savings
- **Annual:** $122,760 savings

**Setup:**
```bash
brew install anthropic/claude/claude
claude auth login
# Done! Session mode active ($0)
```

---

## Slide 7: Unique Feature #1 — YOLO Mode

### Problem
Trivial tasks (typo fixes, text changes) shouldn't require approval

### Solution
Auto-approve tasks with complexity < 30

### How It Works
```typescript
if (complexity.score < 30) {
  // YOLO mode activated
  ApprovalCheckpoint.bypass()
  // Execute immediately, no human prompt
}
```

### Example
```bash
asmo run "Fix typo in README"

# Output:
# [ComplexityAnalyzer] Score: 15 (trivial)
# [YOLO Mode] Auto-approving (score < 30)
# [Developer] Fixing typo...
# ✓ Complete in 45 seconds
```

### Impact
- **~20% of tasks** are trivial
- **Zero approval fatigue** for simple changes
- **< 60 second** execution time

---

## Slide 8: Unique Feature #2 — Context Cascade

### Problem
Agents lose context between phases → repeated work

### Solution
Automatic phase-to-phase data flow

### How It Works
```typescript
Phase 1: Architect creates design
  artifacts = { validationStrategy: "client + server" }

Phase 2: Developer receives Phase 1 context
  input.context = Phase1.artifacts
  // Developer sees: architect decided client + server
  // No need to re-decide strategy

Phase 3: Tester receives Phase 1 + Phase 2 context
  input.context = Phase1.artifacts + Phase2.artifacts
  // Tester sees: strategy + implementation
  // Creates tests for both client and server
```

### Benefits
- 🚫 **No duplication** — decisions made once
- 📦 **Automatic** — no configuration needed
- 📝 **Accumulative** — later phases see full history
- 🔗 **Continuity** — seamless workflow

---

## Slide 9: Unique Feature #3 — Party Mode

### Problem
Complex tasks need multiple perspectives

### Solution
Parallel multi-agent collaboration with consensus

### When Activated
- Complexity ≥ 60
- Multiple patterns detected
- Cross-cutting concerns (security + performance)

### How It Works
```
Round 1: architect + security-specialist + developer (parallel)
  → 3 independent analyses

Round 2: Convergence check
  → Similarity = 65% (below threshold 80%)
  → Continue discussion

Round 3: Convergence check
  → Similarity = 87% (above threshold 80%) ✅
  → Consensus reached!
```

### Convergence Mechanism
```typescript
similarity = calculateSimilarity(
  agentOutputs[round],
  agentOutputs[round - 1]
)

if (similarity >= 0.8) {
  return consolidatedResult  // Consensus!
}
```

### Trade-offs
- ✅ Better quality (multiple viewpoints)
- ✅ Reduced blind spots
- ❌ 3x token usage (mitigated by Session mode $0)

---

## Slide 10: Unique Feature #4 — Adaptive Phase Detection

### Problem
Starting workflows from scratch when work already exists

### Solution
LLM analyzes existing context, joins workflow mid-stream

### Example
```
Scenario: You already investigated a bug manually

bug_fix_workflow phases:
  Phase 1: Investigation (debugger)
  Phase 2: Fix (developer)
  Phase 3: Testing (tester)

You have: investigation-report.md

PhaseDetector analyzes:
  → "investigation-report.md contains root cause analysis"
  → "Phase 1 (investigation) is complete"
  → "Join workflow at Phase 2 (developer)"
  → Metadata: { detectedPhase: 2, skippedPhases: [1] }

Workflow starts at Phase 2:
  ✓ Saved time (no redundant investigation)
  ✓ Saved LLM tokens (Phase 1 skipped)
  ✓ Builds on existing work
```

### Use Cases
- Resume interrupted workflows
- Join existing projects
- Work partially complete

---

## Slide 11: Live Demo — Overview

### 3 Scenarios (25 minutes total)

1. **YOLO Mode** (5 min)
   - Task: "Fix typo in README"
   - Show: Auto-approval, < 60s completion
   - Highlight: Zero friction for trivial tasks

2. **Context Cascade** (10 min)
   - Task: "Add email validation to signup form"
   - Show: architect → developer → tester context flow
   - Highlight: No context loss, builds on previous work

3. **Party Mode** (10 min)
   - Task: "Implement OAuth2 authentication with security audit"
   - Show: Parallel execution, convergence mechanism
   - Highlight: Multiple perspectives, consensus building

---

## Slide 12: Metrics & Learning

### How It Works

**After each execution:**
```typescript
1. MetricsCollector records:
   - Workflow used
   - Complexity score
   - Duration, token usage
   - Success/failure
   - Agent performance

2. MetricsPersister saves to SQLite

3. MetricsOptimizer learns:
   - Best workflow for each complexity range
   - Average durations for estimation
   - Token efficiency patterns

4. Future routing uses learned data
```

### Example Metrics
```bash
asmo metrics --workflow bug_fix_workflow

# Output:
# Workflow: bug_fix_workflow
# Executions: 47
# Success rate: 95.7%
# Avg complexity: 32 (simple)
# Avg duration: 11m 34s
# Avg tokens: 4,200
#
# Recommendation: Optimal for simple bug fixes (score 21-40)
```

### Benefits
- 📈 Continuous improvement
- 🎯 Better routing over time
- ⏱️ Accurate estimates
- 💰 Token optimization

---

## Slide 13: Integration Examples

### CLI Integration
```bash
# Quick recommendation (< 2s)
asmo suggest "Add rate limiting to API"

# Complexity analysis only
asmo analyze "Migrate to microservices"

# Preview plan before execution
asmo run "Refactor auth module" --dry-run

# Execute with flags
asmo run "Fix login bug" --verbose --use-api
```

### Git Hook Example
```bash
# .git/hooks/pre-commit
CHANGED=$(git diff --cached --name-only)
SUGGESTION=$(asmo suggest "Review: $CHANGED")

if [ "$(echo $SUGGESTION | jq -r '.useAsmo')" = "true" ]; then
  echo "🤖 ASMO recommends review"
  asmo workflow code_review_workflow --task "Review: $CHANGED"
fi
```

### CI/CD Integration
```yaml
# .github/workflows/asmo-review.yml
- name: ASMO Code Review
  run: |
    asmo workflow adversarial_review_workflow \
      --task "Review PR #${{ github.event.pull_request.number }}"
```

---

## Slide 14: Agent Catalog

### Core Agents (6)
| Agent | Role | Key Workflows |
|-------|------|---------------|
| architect | System design | architecture_design, feature_implementation |
| developer | Implementation | All workflows |
| debugger | Investigation | bug_fix_workflow |
| optimizer | Performance | performance_optimization |
| tester | Quality | All workflows (validation phase) |
| devops | Infrastructure | database_migration, deployment |

### Specialized Agents (15)
| Agent | Domain |
|-------|--------|
| security-specialist | Security review, threat modeling |
| api-designer | REST/GraphQL design |
| ux-designer | User experience, wireframes |
| product-owner | Requirements, stories |
| data-engineer | ETL, schema design |
| ... | (10 more) |

### Validation Agents (4)
| Agent | Purpose |
|-------|---------|
| adversarial-reviewer | Must-find-issues review |
| compliance-checker | GDPR, SOC2, HIPAA |
| chaos-tester | Failure injection |
| benchmark-analyst | Performance regression |

---

## Slide 15: Workflow Catalog (27)

### By Category

**Implementation (10)**
- bug_fix_workflow, feature_implementation_full
- code_refactoring, performance_optimization
- security_audit, architecture_design
- database_migration, api_design
- code_review_workflow, dev_story_workflow

**Discovery (7)**
- adversarial_review_workflow
- create_prd_workflow, create_ux_design_workflow
- create_epics_and_stories_workflow
- check_implementation_readiness_workflow
- sprint_planning_workflow

**Post-Implementation (6)**
- retrospective_workflow, correct_course_workflow
- automate_tests_workflow, create_story_workflow

**TEA — Test Engineering (3)**
- tea_planning_workflow (risk + strategy + design)
- tea_execution_workflow (automation + regression)
- tea_validation_workflow (quality gates)

**UI (1)**
- ui_component_library

---

## Slide 16: Execution Time by Complexity

| Level | Score | Workflow | Avg Time | Agents |
|-------|-------|----------|----------|--------|
| Trivial | 0-20 | quick_flow | < 1m | 1 |
| Simple | 21-40 | bug_fix_workflow | 10-15m | 2-3 |
| Medium | 41-60 | feature_implementation_full | 1-2h | 3 |
| Complex | 61-80 | feature_implementation_full + party | 4-6h | 4+ |
| Enterprise | 81-100 | architecture_design | 8-12h | 4+ |

### Time Savings Examples

**Manual vs ASMO:**

| Task | Manual | ASMO | Savings |
|------|--------|------|---------|
| Bug fix | 1-2h | 10-15m | 75% |
| Feature (medium) | 8-12h | 1-2h | 83% |
| Architecture design | 2-3 days | 8-12h | 67% |

---

## Slide 17: Q&A — Common Questions

### Technical
**Q:** What if an agent fails?
**A:** CircuitBreaker isolates failure, graceful degradation

**Q:** Can we add custom agents?
**A:** Yes, extend BaseAgent, define role JSON + skills

**Q:** How accurate is heuristics mode?
**A:** ~65%, good for offline/quick checks

**Q:** Token usage for average task?
**A:** Simple: 2-4K, Medium: 5-10K, Complex: 15-20K

### Integration
**Q:** Works with our CI/CD?
**A:** Yes, CLI + exit codes

**Q:** Support for Java/Go/Rust?
**A:** Yes, language-agnostic

**Q:** Customize workflows?
**A:** Yes, JSON templates in `~/.asmo/config/`

### Cost
**Q:** Claude CLI unavailable?
**A:** Auto-fallback to API mode

**Q:** Limit token usage?
**A:** Yes, configure max rounds for party mode

**Q:** Preview cost before execution?
**A:** Yes, `--dry-run` shows plan + estimated tokens

---

## Slide 18: Roadmap & Future

### Current (v1.1.0)
✅ 25 agents, 27 workflows, 55 skills
✅ Dual LLM (Session/API/Heuristics)
✅ YOLO, Party, Adversarial modes
✅ Adaptive Phase Detection
✅ Metrics & Learning Loop

### Near Term (Q1 2026)
🔜 VSCode extension (inline suggestions)
🔜 More MCP server integrations
🔜 Custom workflow builder (UI)
🔜 Team collaboration features

### Long Term
💡 Multi-model support (OpenAI, Gemini)
💡 Fine-tuned models for routing
💡 Distributed execution (team mode)
💡 Enterprise SSO integration

---

## Slide 19: Getting Started

### 1. Install
```bash
npm install -g @asmo/cli
```

### 2. Setup LLM Provider
**Option A: Session mode (recommended, $0)**
```bash
brew install anthropic/claude/claude
claude auth login
```

**Option B: API mode (pay-per-token)**
```bash
echo 'ANTHROPIC_API_KEY=sk-ant-...' > .env
```

### 3. Run First Task
```bash
# Get recommendation
asmo suggest "Add input validation to login form"

# Execute
asmo run "Add input validation to login form"
```

### 4. Explore
```bash
# List workflows
asmo workflow

# Analyze complexity
asmo analyze "Migrate database to PostgreSQL"

# Dry run
asmo run "Refactor payment module" --dry-run
```

---

## Slide 20: Resources & Next Steps

### Documentation
📖 System Overview: `docs/en/system-overview.md`
📖 Architecture Deep Dive: `packages/core/docs/`
📖 Demo Scripts: `docs/en/phase-4-release/demo-script.md`
📖 Examples: `packages/core/docs/examples/`

### Code
🔗 GitHub: [github.com/Samch1k/ASMO](https://github.com/Samch1k/ASMO)
🔗 CLI: `packages/cli/`
🔗 Core: `packages/core/`

### Next Steps
1. ✅ Try demo scenarios (30 min)
2. 📚 Read system overview
3. 🔧 Create custom workflow for your team
4. 🤝 Integrate into CI/CD or git hooks
5. 💬 Share feedback, report issues

### Contact
📧 GitHub Issues: [github.com/Samch1k/ASMO/issues](https://github.com/Samch1k/ASMO/issues)
💬 Discussions: [github.com/Samch1k/ASMO/discussions](https://github.com/Samch1k/ASMO/discussions)

---

## Slide 21: Thank You!

**Questions?**

**Let's see ASMO in action! 🚀**

*Demo time...*
