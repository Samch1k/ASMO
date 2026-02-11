# ASMO Tech Demo Materials

Complete demo package for presenting ASMO to technical teams.

---

## 📁 Contents

| File | Purpose | Duration |
|------|---------|----------|
| **demo-presentation-outline.md** | Detailed presentation guide with talking points | 45-60 min |
| **slides.md** | Slide deck (21 slides) covering architecture, features, examples | Reference |
| **demo-scenarios.sh** | Interactive script to run all 3 demo scenarios | 30 min |
| **DEMO-CHECKLIST.md** | Pre-demo preparation checklist | Setup guide |
| **sample-project/** | Sample codebase for demo scenarios | Test data |

---

## 🚀 Quick Start

### 1. Prepare Demo Environment

```bash
# Install ASMO
cd /path/to/ASMO
pnpm install
pnpm build

# Install Claude CLI (for Session mode, $0 cost)
brew install anthropic/claude/claude
claude auth login

# Verify setup
asmo suggest "test task"
```

### 2. Run Demo Scenarios

**Option A: Interactive menu**
```bash
cd demo/
chmod +x demo-scenarios.sh
./demo-scenarios.sh
# Select scenarios 1-5
```

**Option B: Manual execution**
```bash
# Scenario 1: YOLO Mode (5 min)
asmo suggest "Fix typo in README"
asmo run "Fix typo in README" --verbose

# Scenario 2: Context Cascade (10 min)
asmo run "Add email validation to signup form" --dry-run
asmo run "Add email validation to signup form" --verbose

# Scenario 3: Party Mode (10 min)
asmo analyze "Implement OAuth2 authentication with security audit"
asmo run "Implement OAuth2 authentication with security audit" --verbose
```

### 3. Present

Use **demo-presentation-outline.md** as your guide:
- Follow the 5-section structure
- Use **slides.md** for visual reference
- Run scenarios live (or show recordings)

---

## 🎯 Demo Structure

### Format: 45-60 minutes

1. **Introduction (5 min)**
   - Problem statement
   - ASMO solution overview
   - Key numbers: 25 agents, 27 workflows, $0 cost

2. **Architecture (10 min)**
   - 5-stage pipeline
   - Dual LLM strategy
   - Cost comparison

3. **Live Demo (25 min)**
   - Scenario 1: YOLO Mode (5 min) — auto-approve trivial tasks
   - Scenario 2: Context Cascade (10 min) — architect → developer → tester
   - Scenario 3: Party Mode (10 min) — parallel collaboration + consensus

4. **Unique Features (10 min)**
   - Adaptive Phase Detection
   - Adversarial Review
   - Metrics & Learning Loop
   - Integration examples

5. **Q&A (10 min)**

---

## 📋 Preparation Checklist

**Before demo:**
- [ ] Complete **DEMO-CHECKLIST.md** (all items)
- [ ] Test all 3 scenarios at least once
- [ ] Verify terminal font size (readable from back of room)
- [ ] Prepare backup (pre-recorded videos or screenshots)
- [ ] Print or have digital copy of presentation outline

**Day of demo:**
- [ ] Test internet connection
- [ ] Verify `asmo suggest "test"` works
- [ ] Clean demo environment (`git status` in sample-project)
- [ ] Open terminals, slides, browser tabs
- [ ] Check projector resolution

---

## 🎬 Demo Scenarios

### Scenario 1: YOLO Mode — Zero Friction (5 min)

**Goal:** Show auto-approval for trivial tasks

**Commands:**
```bash
asmo suggest "Fix typo in README"
time asmo run "Fix typo in README" --verbose
```

**Key points:**
- Complexity < 30 → YOLO mode
- No approval checkpoint
- < 60 seconds execution
- Eliminates approval fatigue

---

### Scenario 2: Context Cascade — No Context Loss (10 min)

**Goal:** Show phase-to-phase context flow

**Commands:**
```bash
asmo run "Add email validation to signup form" --dry-run
asmo run "Add email validation to signup form" --verbose
```

**Watch for in verbose output:**
- Phase 1 (Architect): Creates validation strategy
- Phase 2 (Developer): Receives strategy, implements
- Phase 3 (Tester): Receives strategy + implementation, tests

**Key points:**
- Automatic context propagation
- No duplication of decisions
- Each agent builds on previous work

---

### Scenario 3: Party Mode — Parallel Collaboration (10 min)

**Goal:** Show parallel execution with consensus

**Commands:**
```bash
asmo analyze "Implement OAuth2 authentication with security audit"
asmo run "Implement OAuth2 authentication with security audit" --verbose
```

**Watch for in verbose output:**
- Complexity ≥ 60 → Party mode activation
- Round 1: Multiple agents work in parallel
- Round 2-3: Convergence checks
- Consensus reached (similarity > 80%)

**Key points:**
- Parallel vs sequential execution
- Convergence mechanism
- Multiple perspectives reduce blind spots
- 3x token cost, mitigated by Session mode ($0)

---

## 💡 Talking Points

### Highlight These Features

1. **$0 Cost with Session Mode**
   - Session mode (Claude CLI) is default
   - $1,023/month savings vs API mode (for 100 tasks/day)
   - Team of 10: $10,230/month savings

2. **YOLO Mode**
   - ~20% of tasks are trivial
   - Auto-approve (no human prompt)
   - Zero approval fatigue

3. **Context Cascade**
   - Automatic, not manual
   - No configuration needed
   - Each agent sees full history

4. **Party Mode**
   - Intelligence, not just sequential execution
   - Consensus mechanism
   - Quality through diversity

5. **Adaptive Phase Detection**
   - Smart, not rigid
   - Resumes from existing work
   - Saves time and tokens

---

## 🛠️ Customization

### Adapt Demo to Your Audience

**For developers:**
- Emphasize CLI integration, git hooks
- Show code examples (agent implementations)
- Deep dive into architecture

**For architects:**
- Focus on multi-agent orchestration patterns
- Party mode and consensus mechanism
- Adaptive Phase Detection intelligence

**For managers:**
- Highlight cost savings ($0 vs $1,023/month)
- Time savings (75-83% for typical tasks)
- ROI and productivity gains

**For DevOps:**
- Show CI/CD integration examples
- Deployment workflows
- Adversarial review for critical code

---

## 📚 Additional Resources

**In this repo:**
- System overview: `docs/en/system-overview.md`
- Architecture docs: `packages/core/docs/`
- Existing demo script: `docs/en/phase-4-release/demo-script.md`
- Demo data: `docs/en/phase-4-release/demo-data.md`
- Feature matrix: `docs/en/phase-4-release/feature-matrix.md`

**External:**
- CLAUDE.md: Integration with Claude Code
- GitHub: [github.com/Samch1k/ASMO](https://github.com/Samch1k/ASMO)
- Issues: [github.com/Samch1k/ASMO/issues](https://github.com/Samch1k/ASMO/issues)

---

## 🎥 Recording Recommendations

**If recording demo:**

1. **Terminal settings:**
   - Font: Monaco or Menlo, size 16-18pt
   - Theme: Dark background, high contrast
   - Window: Full screen or 1920x1080

2. **Screen recording:**
   - Use OBS Studio or QuickTime
   - Record at 1080p minimum
   - Enable audio (for narration)

3. **Editing:**
   - Speed up slow parts (LLM processing)
   - Add captions for key outputs
   - Include timestamps for each scenario

---

## ❓ Common Questions & Answers

**Q: What if Claude CLI is unavailable during demo?**
A: ASMO auto-falls back to API mode. Have `ANTHROPIC_API_KEY` in `.env` as backup.

**Q: What if a scenario fails?**
A: Use backup plan (pre-recorded video or sample outputs). Explain what should happen.

**Q: How long should the full demo take?**
A: 45-60 minutes including Q&A. Adjust based on audience engagement.

**Q: Can I skip scenarios?**
A: Yes! Minimum: Show Scenario 1 (YOLO) + 1 of (Scenario 2 or 3). Full demo: all 3.

**Q: Should I show code?**
A: Optional. For technical audience, showing agent code is valuable. For others, focus on capabilities.

---

## 📝 Feedback & Improvements

After presenting, please:
1. Note questions asked (add to FAQ)
2. Record any issues encountered
3. Update demo materials based on feedback
4. Share recordings (if any) with team

**Contribute improvements:**
- Update demo scenarios if ASMO behavior changes
- Add new scenarios for new features
- Improve talking points based on audience reactions

---

## 🙏 Credits

Demo materials created for ASMO v1.1.0.

**Contributors:**
- System architecture: Defined in `docs/en/system-overview.md`
- Demo scenarios: Based on `docs/en/phase-4-release/demo-script.md`
- Sample tasks: From `docs/en/phase-4-release/demo-data.md`

---

## 📞 Support

**Issues during demo prep:**
- Check `DEMO-CHECKLIST.md` troubleshooting section
- Review `docs/en/system-overview.md` for technical details
- Test scenarios beforehand to identify issues

**Post-demo questions:**
- GitHub Issues: [github.com/Samch1k/ASMO/issues](https://github.com/Samch1k/ASMO/issues)
- GitHub Discussions: [github.com/Samch1k/ASMO/discussions](https://github.com/Samch1k/ASMO/discussions)

---

**Good luck with your demo! 🚀**

*Show ASMO's value, engage with questions, and have fun!*
