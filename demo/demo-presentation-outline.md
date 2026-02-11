# ASMO Tech Team Demo — Presentation Outline

**Duration:** 45-60 minutes
**Audience:** Technical team (developers, architects, tech leads)
**Goal:** Demonstrate ASMO's multi-agent orchestration capabilities, unique features, and integration potential

---

## 1. Introduction (5 minutes)

### Slide: "The Problem"
**Current challenges with AI-assisted development:**
- 💰 High LLM API costs → limits adoption
- 🎯 Manual task routing → developer overhead
- 🔗 Context loss between agents → repeated work
- ⏳ Approval fatigue → simple tasks blocked by checkpoints

### Slide: "ASMO Solution"
**AI System for Multiagent Orchestration**

| Component | Value |
|-----------|-------|
| Agents | 25 (core + specialized + validation) |
| Workflows | 27 (from trivial to enterprise) |
| Skills | 55 (centralized skill library) |
| Roles | 25 (behavioral profiles) |

**Key differentiators:**
- 💵 **Dual LLM**: Session mode ($0) → API → Heuristics
- 🚀 **YOLO Mode**: Auto-approve trivial tasks (< 30 complexity)
- 🎭 **Party Mode**: Parallel multi-agent collaboration with consensus
- 🔄 **Adaptive Phase Detection**: Resume workflows at any phase

---

## 2. Architecture Overview (10 minutes)

### Slide: "ASMO Pipeline — 5 Stages"

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. TASK INPUT                                                   │
│    Developer: "Fix null pointer in login handler"               │
└─────────────────┬───────────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. COMPLEXITY ANALYSIS (ComplexityAnalyzer)                     │
│    Session LLM → API LLM → Heuristics                           │
│    Output: {score: 35, level: "simple", categories: ["bug_fix"]}│
└─────────────────┬───────────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. WORKFLOW SELECTION (WorkflowSelector)                        │
│    Match: bug_fix_workflow                                      │
│    Agents: debugger → developer → tester                        │
└─────────────────┬───────────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. EXECUTION (WorkflowEngine)                                   │
│    Phase 1: debugger investigates                               │
│    Phase 2: developer fixes (receives context from Phase 1)     │
│    Phase 3: tester validates (receives context from Phase 1+2)  │
│    ContextCascade: Phase N outputs → Phase N+1 inputs           │
│    CircuitBreaker: protects against agent failures              │
└─────────────────┬───────────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. RESULT                                                       │
│    Artifacts: fix applied, tests added                          │
│    Metrics: {duration: "12m", tokensUsed: 4500, success: true}  │
│    MetricsOptimizer: learns from execution for future routing   │
└─────────────────────────────────────────────────────────────────┘
```

### Slide: "Dual LLM Strategy — Cost Optimization"

| Mode | Cost | Requirements | Accuracy | Use Case |
|------|------|--------------|----------|----------|
| **Session** (default) | $0 | Claude CLI installed | High | Default for all tasks |
| **API** (fallback) | Pay-per-token | ANTHROPIC_API_KEY | High | When CLI unavailable or forced with `--use-api` |
| **Heuristics** (offline) | $0 | None | ~65% | Offline mode or forced with `--no-llm` |

**Automatic fallback chain:**
```
Session ($0) → API ($$$) → Heuristics ($0, 65% accuracy)
```

**Model selection by complexity:**
- Trivial/Simple (0-40): Haiku
- Medium (41-60): Sonnet
- Complex/Enterprise (61-100): Sonnet/Opus

---

## 3. Live Demo — 3 Practical Scenarios (25 minutes)

### Scenario 1: YOLO Mode — Zero Friction (5 min)

**Goal:** Show that ASMO doesn't add overhead for trivial tasks

**Commands:**
```bash
# Step 1: Check recommendation
asmo suggest "Fix typo in README"

# Expected output:
# {
#   "useAsmo": true,
#   "score": 15,
#   "level": "trivial",
#   "yolo": true,
#   "reasoning": "Text change, no logic affected"
# }

# Step 2: Execute (no approval prompt!)
time asmo run "Fix typo in README" --verbose

# Expected behavior:
# - YOLO mode activates (score < 30)
# - No ApprovalCheckpoint prompts
# - Completes in < 60 seconds
# - Single file modified
```

**Key Points to Highlight:**
- ✅ Complexity < 30 → automatic bypass
- ✅ ~20% of tasks are trivial → zero approval fatigue
- ✅ Same multi-agent system, but optimized for speed on simple tasks

---

### Scenario 2: Context Cascade — No Context Loss (10 min)

**Goal:** Show phase-to-phase context flow (architect → developer → tester)

**Commands:**
```bash
# Step 1: Preview execution plan
asmo run "Add email validation to signup form" --dry-run

# Expected output:
# Workflow: feature_implementation_full
# Phases:
#   1. Architecture → architect agent
#   2. Development → developer agent
#   3. Testing     → tester agent

# Step 2: Execute with verbose logging
asmo run "Add email validation to signup form" --verbose
```

**What to Show in Verbose Output:**

**Phase 1: Architect**
```
[Architect] Analyzing validation requirements...
[Architect] Decision: Use client-side (regex) + server-side (library) validation
[Architect] Artifact created: validation-strategy.md
[Architect] ✓ Phase 1 complete
```

**Phase 2: Developer (receives architect's context)**
```
[Developer] Received context from Phase 1:
  - Validation strategy: client + server
  - Library choice: validator.js
[Developer] Implementing according to architect's design...
[Developer] Files modified:
  - src/components/SignupForm.tsx (client validation)
  - src/api/validators/email.ts (server validation)
[Developer] Artifact created: implementation-summary.md
[Developer] ✓ Phase 2 complete
```

**Phase 3: Tester (receives architect + developer context)**
```
[Tester] Received context from Phase 1 & 2:
  - Strategy: test both client and server validation
  - Implementation: validator.js in email.ts
[Tester] Creating test cases:
  - Valid emails: standard@example.com, unicode@тест.рф
  - Invalid formats: missing @, multiple @, etc.
  - Edge cases: long domains, subaddressing (user+tag@...)
[Tester] Files created:
  - tests/unit/email-validator.test.ts
  - tests/integration/signup-validation.test.ts
[Tester] ✓ Phase 3 complete
```

**Key Points to Highlight:**
- 📦 **Automatic context flow**: Each phase receives previous outputs
- 🚫 **No duplication**: Developer doesn't re-decide strategy, tester doesn't re-discover implementation
- 📝 **Artifact accumulation**: Phase 3 sees full history (strategy + implementation)
- 🔗 **ContextCascade** makes this automatic — no manual configuration needed

---

### Scenario 3: Party Mode — Parallel Collaboration (10 min)

**Goal:** Show parallel execution with consensus mechanism

**Commands:**
```bash
# Complex task (score ≥ 60) → Party Mode activates automatically
asmo run "Implement OAuth2 authentication with security audit" --verbose
```

**What to Show in Verbose Output:**

**Complexity Analysis:**
```
[ComplexityAnalyzer] Task: "Implement OAuth2 authentication with security audit"
[ComplexityAnalyzer] Score: 75 (Complex)
[ComplexityAnalyzer] Categories: security, feature, api
[ComplexityAnalyzer] Impact modifiers: security_impact, high_risk
[ComplexityAnalyzer] Recommended mode: PARTY (score ≥ 60)
```

**Party Session Round 1:**
```
[PartySession] Starting Round 1 with 3 agents in parallel...

[Architect] Analyzing OAuth2 flow options...
  → Recommendation: Authorization Code flow with PKCE
  → Token storage: httpOnly cookies for web, secure storage for mobile

[Security Specialist] Analyzing threat model...
  → Concerns: CSRF attacks, token leakage, redirect URI validation
  → Requirements: state parameter, strict redirect matching, token rotation

[Developer] Evaluating implementation approach...
  → Library options: passport.js vs simple-oauth2 vs custom
  → Recommendation: passport.js for established patterns

[PartySession] Round 1 complete. Checking convergence...
[PartySession] Convergence: 65% (below threshold 80%)
[PartySession] → Continuing to Round 2 for refinement
```

**Party Session Round 2:**
```
[PartySession] Round 2: Agents discuss and refine proposals...

[Architect] Reviewing security specialist feedback...
  → Incorporating CSRF protection into design

[Security Specialist] Reviewing architect's flow design...
  → Approves PKCE, suggests additional token expiry validation

[Developer] Reviewing feasibility with security requirements...
  → Passport.js supports PKCE, CSRF middleware available

[PartySession] Round 2 complete. Checking convergence...
[PartySession] Convergence: 87% (above threshold 80%) ✅
[PartySession] → Consensus reached!
```

**Convergence & Final Output:**
```
[PartySession] Consolidating results...

Final Consensus:
  - OAuth2 Flow: Authorization Code + PKCE ✅
  - Token Storage: httpOnly cookies ✅
  - Security: CSRF protection, strict redirect validation ✅
  - Implementation: Passport.js with custom PKCE middleware ✅

Artifacts created:
  - oauth2-architecture.md (architect)
  - security-requirements.md (security specialist)
  - implementation-plan.md (developer)
  - Consolidated: oauth2-final-design.md
```

**Key Points to Highlight:**
- 🎭 **Parallel execution**: 3 agents work simultaneously (not sequential)
- 📊 **Convergence tracking**: Measures agreement after each round
- 🔄 **Iterative refinement**: Multiple rounds until consensus (threshold: 80%)
- 🎯 **Quality through diversity**: Multiple perspectives reduce blind spots
- ⚡ **Automatic activation**: Complexity ≥ 60 triggers party mode, no manual config

---

## 4. Unique Features Deep Dive (10 minutes)

### Feature 1: Adaptive Phase Detection

**Problem:** Starting workflows from scratch when some work already exists

**Solution:** LLM analyzes existing context and joins workflow at appropriate phase

**Example:**
```bash
# Scenario: You already did investigation, now need fix + tests

# 1. Create investigation report manually
cat > investigation-report.md << EOF
# Bug Investigation: Null Pointer in login.ts

Root cause: Missing null check on user object at line 42
Trigger: User object undefined when session expired
Fix: Add null check before accessing user.email
EOF

# 2. Run bug_fix_workflow
asmo run "Fix null pointer in login handler" --verbose

# Expected output:
# [PhaseDetector] Analyzing existing context...
# [PhaseDetector] Found: investigation-report.md
# [PhaseDetector] Decision: Join workflow at Phase 2 (developer)
# [PhaseDetector] Skipping Phase 1 (debugger) - already complete
# [PhaseDetector] Metadata: {detectedPhase: 2, skippedPhases: [1]}
#
# [WorkflowEngine] Starting at Phase 2...
# [Developer] Reading investigation report...
# [Developer] Implementing fix based on findings...
```

**Benefits:**
- ⏭️ Skip unnecessary phases
- 💰 Save LLM calls
- ⏱️ Reduce execution time
- 🔄 Resume interrupted work

**Use cases:**
- Resume after interruption
- Join existing project mid-stream
- Work already partially done

---

### Feature 2: Adversarial Review

**Problem:** Standard code reviews can miss critical issues (confirmation bias)

**Solution:** Force agent to find problems with 3-level escalation

**Configuration:**
```typescript
adversarial_review_workflow:
  agent: adversarial-reviewer
  mode: MUST_FIND_ISSUES
  escalation_levels: 3

  Level 1: Standard critical review
    - Code smells
    - Potential bugs
    - Design issues

  Level 2: Deep analysis (if L1 finds < 3 issues)
    - Security vulnerabilities
    - Performance bottlenecks
    - Scalability concerns

  Level 3: Architectural review (if L2 finds < 3 issues)
    - System design flaws
    - Technical debt assessment
    - Long-term maintainability
```

**Example:**
```bash
asmo workflow adversarial_review_workflow \
  --task "Review authentication module for production deployment"

# Expected output:
# [AdversarialReviewer] Level 1: Standard Review
# ✗ Found 2 issues (below threshold 3) → Escalating to Level 2
#
# [AdversarialReviewer] Level 2: Security Deep Dive
# ✓ Found 5 issues:
#   1. [CRITICAL] Password hashing uses deprecated bcrypt rounds (10 → should be 12+)
#   2. [HIGH] Session tokens not rotated on privilege escalation
#   3. [HIGH] Missing rate limiting on login endpoint (brute force risk)
#   4. [MEDIUM] Error messages leak user existence information
#   5. [LOW] Timing attack possible on password comparison
```

**Use cases:**
- Pre-production security review
- Critical infrastructure changes
- Compliance requirements (PCI-DSS, SOC2)

---

### Feature 3: Metrics & Learning Loop

**How it works:**
```typescript
// After each execution:
1. MetricsCollector records:
   - Workflow used
   - Complexity score
   - Duration
   - Token usage
   - Success/failure
   - Agent performance

2. MetricsPersister saves to SQLite:
   - Historical data
   - Trend analysis

3. MetricsOptimizer learns:
   - Which workflows perform best for which complexity ranges
   - Average durations for estimation
   - Agent success rates
   - Token efficiency

4. Future routing uses learned data:
   - "bug_fix_workflow works well for score 30-40"
   - "feature_implementation_full: avg 4.5h for score 50-60"
```

**Example Query:**
```bash
# View metrics for specific workflow
asmo metrics --workflow bug_fix_workflow

# Output:
# Workflow: bug_fix_workflow
# Executions: 47
# Success rate: 95.7%
# Avg complexity: 32 (simple)
# Avg duration: 11m 34s
# Avg tokens: 4,200
#
# Complexity distribution:
#   0-20:  8 executions (YOLO mode)
#   21-40: 35 executions
#   41-60: 4 executions
#
# Recommendation: Optimal for simple bug fixes (score 21-40)
```

**Benefits:**
- 📈 Continuous improvement
- 🎯 Better workflow selection over time
- ⏱️ Accurate time estimates
- 💰 Token usage optimization

---

### Feature 4: Party Mode Deep Dive

**Convergence Algorithm:**
```typescript
interface PartyModeConfig {
  maxRounds: 5              // Maximum discussion rounds
  convergenceThreshold: 0.8  // 80% agreement required
  minAgents: 2              // Minimum agents for party mode
}

// After each round:
function checkConvergence(round: number) {
  const similarity = calculateSimilarity(
    outputs[round],
    outputs[round - 1]
  )

  if (similarity >= threshold) {
    // Consensus reached
    return consolidateResults(outputs[round])
  }

  if (round >= maxRounds) {
    // Max rounds reached, use best result
    return selectBestResult(outputs)
  }

  // Continue to next round with refined prompts
  return continueDiscussion(round + 1)
}
```

**Similarity Calculation:**
```typescript
// Compares agent outputs using:
1. Semantic similarity (embedding distance)
2. Structural similarity (JSON schema overlap)
3. Decision similarity (key decisions match)

// Example:
Agent A: "Use OAuth2 with PKCE"
Agent B: "Implement OAuth2 Authorization Code flow with PKCE extension"
Agent C: "Use OAuth2 authorization code + PKCE for mobile security"

→ Semantic similarity: 0.92 (very high)
→ Convergence: ✅ (above 0.8 threshold)
```

**Token cost analysis:**
```
Sequential mode (3 agents):
  1 round × 3 agents × 1.5K tokens = 4.5K tokens

Party mode (3 agents, 3 rounds):
  3 rounds × 3 agents × 1.5K tokens = 13.5K tokens

Trade-off:
  + Better quality (multiple perspectives)
  + Reduced blind spots
  - 3x token cost

→ Use for complex tasks (≥60) where quality matters
```

---

## 5. Integration & Developer Experience (5 minutes)

### CLI Integration

**Quick commands:**
```bash
# Instant recommendation (for hooks, automation)
asmo suggest "<task>"  # Returns JSON in < 2s

# Complexity analysis only
asmo analyze "<task>"

# Preview execution plan
asmo run "<task>" --dry-run

# Execute with options
asmo run "<task>" --verbose --use-api --workflow custom_workflow
```

**Flags:**
- `--use-api`: Force API mode (when Session unavailable)
- `--no-llm`: Offline heuristics mode (~65% accuracy)
- `--verbose`: Detailed agent activity logs
- `--dry-run`: Preview without execution
- `--workflow <name>`: Override workflow selection

### Git Hook Integration Example

```bash
# .git/hooks/pre-commit
#!/bin/bash

# Get list of changed files
CHANGED_FILES=$(git diff --cached --name-only)

# Ask ASMO if this needs review
SUGGESTION=$(asmo suggest "Review changes: $CHANGED_FILES")
USE_ASMO=$(echo "$SUGGESTION" | jq -r '.useAsmo')

if [ "$USE_ASMO" = "true" ]; then
  echo "🤖 ASMO recommends orchestrated review for these changes"
  echo "$SUGGESTION" | jq -r '.reasoning'

  read -p "Run ASMO review? (y/n) " -n 1 -r
  echo

  if [[ $REPLY =~ ^[Yy]$ ]]; then
    asmo workflow code_review_workflow \
      --task "Review staged changes: $CHANGED_FILES"
  fi
fi
```

### IDE Integration (Future)

**VSCode extension concept:**
```typescript
// Right-click in editor → "ASMO: Analyze Function"
// → Runs complexity analysis
// → Suggests refactoring workflow if score > 60

// Status bar indicator:
"ASMO: Session mode ($0) ✓"
"ASMO: API mode (fallback) ⚠"
```

---

## 6. Performance & Cost Analysis (3 minutes)

### Cost Comparison: Session vs API Mode

**Scenario:** 100 tasks per day

| Task Type | Count/day | Tokens/task | Session Mode | API Mode (Sonnet) |
|-----------|-----------|-------------|--------------|-------------------|
| Trivial (YOLO) | 20 | 500 | $0 | $1.50 |
| Simple | 50 | 2,000 | $0 | $15.00 |
| Medium | 25 | 5,000 | $0 | $18.75 |
| Complex (Party) | 5 | 15,000 | $0 | $11.25 |
| **Total/day** | **100** | | **$0** | **$46.50** |
| **Total/month** | **~2,200** | | **$0** | **~$1,023** |

**Savings with Session mode: $1,023/month → $0/month**

### Execution Time by Complexity

| Level | Score | Workflow | Avg Time | Agents |
|-------|-------|----------|----------|--------|
| Trivial | 0-20 | quick_flow | < 1m | 1 (developer) |
| Simple | 21-40 | bug_fix_workflow | 10-15m | 2-3 (debugger, developer, tester) |
| Medium | 41-60 | feature_implementation_full | 1-2h | 3 (architect, developer, tester) |
| Complex | 61-80 | feature_implementation_full + party | 4-6h | 4+ (architect, specialist, developer, tester) |
| Enterprise | 81-100 | architecture_design | 8-12h | 4+ (architect, devops, security, developer) |

---

## 7. Q&A Topics to Prepare

**Technical Questions:**
1. How does ContextCascade handle large artifacts? (Answer: Selective propagation, only relevant data)
2. What happens if an agent fails? (Answer: CircuitBreaker isolates failure, graceful degradation)
3. Can we add custom agents? (Answer: Yes, extends BaseAgent, define role JSON + skills)
4. How accurate is heuristics mode? (Answer: ~65%, good for offline/quick checks)
5. What's the token usage for average task? (Answer: Simple: 2-4K, Medium: 5-10K, Complex: 15-20K)

**Integration Questions:**
1. Can ASMO integrate with existing CI/CD? (Answer: Yes, via CLI + exit codes)
2. Does it work with non-Claude models? (Answer: Currently Claude-focused, extensible architecture)
3. Can we customize workflows? (Answer: Yes, JSON templates in `~/.asmo/config/workflows/`)
4. Does it support our codebase language (Java/Go/Rust)? (Answer: Yes, language-agnostic)

**Cost/Performance Questions:**
1. What if Claude CLI is unavailable? (Answer: Automatic fallback to API mode)
2. Can we limit token usage? (Answer: Yes, configure max rounds for party mode)
3. Is there a way to preview cost before execution? (Answer: Yes, `--dry-run` shows agent plan)

---

## 8. Call to Action

**Next Steps:**
1. ✅ **Try ASMO**: Install and run demo scenarios
2. 📖 **Read docs**: System overview, architecture deep dives
3. 🔧 **Customize**: Create custom workflows for your team
4. 🤝 **Integrate**: Add to CI/CD, git hooks, or daily workflow
5. 💬 **Feedback**: Share use cases, report issues, suggest features

**Resources:**
- Docs: `docs/en/system-overview.md`
- Demo scripts: `docs/en/phase-4-release/demo-script.md`
- Examples: `packages/core/docs/examples/`
- GitHub: [github.com/Samch1k/ASMO](https://github.com/Samch1k/ASMO)

---

## Appendix: Demo Preparation Checklist

**Before presentation:**
- [ ] Install dependencies: `pnpm install && pnpm build`
- [ ] Install Claude CLI: `brew install anthropic/claude/claude`
- [ ] Authenticate: `claude auth login`
- [ ] Verify Session mode works: `asmo suggest "test task"`
- [ ] Prepare sample codebase with signup form (for Scenario 2)
- [ ] Prepare investigation report (for Adaptive Phase Detection demo)
- [ ] Test all 3 demo scenarios at least once
- [ ] Check verbose output formatting
- [ ] Ensure demo repo is clean (no uncommitted changes)

**Equipment:**
- [ ] Terminal with large font (for visibility)
- [ ] Syntax highlighting enabled
- [ ] Screen recording backup (in case of live demo issues)
- [ ] Slides with architecture diagrams
- [ ] Backup: Pre-recorded demo videos

**Timing:**
- [ ] Practice each scenario to confirm timing
- [ ] Have shortcuts ready for long commands
- [ ] Prepare tmux/terminal splits for parallel visibility

---

## Notes for Presenter

**Emphasis points:**
1. **$0 cost** with Session mode is a game-changer for adoption
2. **YOLO mode** eliminates approval fatigue (20% of tasks)
3. **Context Cascade** is automatic, not manual (developer experience win)
4. **Party Mode** shows intelligence, not just sequential execution
5. **Adaptive Phase Detection** shows the system is smart, not rigid

**Potential objections & responses:**
- *"Too complex for simple tasks"*: Show YOLO mode (< 1 min for trivial)
- *"What if LLM makes mistakes?"*: Show ApprovalCheckpoint for score > 30
- *"Token costs too high"*: Show Session mode ($0) vs API comparison
- *"We already have tools"*: Emphasize multi-agent orchestration, not single-agent
- *"Lock-in to Claude?"*: Mention architecture is extensible

**Demo backup plan:**
If live demo fails:
1. Use pre-recorded video clips
2. Show sample output files from previous runs
3. Walk through architecture diagrams instead
