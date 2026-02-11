# ASMO Tech Demo — Preparation Checklist

Complete this checklist before presenting the ASMO demo to ensure smooth execution.

---

## Pre-Demo Setup (Day Before)

### Environment Setup
- [ ] **Install ASMO dependencies**
  ```bash
  cd /path/to/ASMO
  pnpm install
  pnpm build
  ```

- [ ] **Install and authenticate Claude CLI** (for Session mode)
  ```bash
  brew install anthropic/claude/claude
  claude auth login
  # Verify: claude --version
  ```

- [ ] **Verify Session mode works**
  ```bash
  asmo suggest "test task"
  # Should return JSON without API key requirement
  ```

- [ ] **Optional: Setup API fallback** (if demoing failover)
  ```bash
  echo 'ANTHROPIC_API_KEY=sk-ant-...' > .env
  ```

### Demo Materials
- [ ] **Clone/prepare demo project**
  ```bash
  cd demo/sample-project
  # Verify files exist:
  # - README.md (with intentional typo)
  # - src/components/SignupForm.tsx
  ```

- [ ] **Test all demo scenarios** (run at least once)
  ```bash
  cd demo/
  chmod +x demo-scenarios.sh
  ./demo-scenarios.sh
  # Run scenarios 1, 2, 3, and bonus
  ```

- [ ] **Verify demo output**
  - Scenario 1 completes in < 60s
  - Scenario 2 shows context cascade in verbose
  - Scenario 3 triggers party mode (score ≥ 60)
  - Bonus shows phase detection

- [ ] **Review slides**
  ```bash
  # Read through demo/slides.md
  # Ensure all examples match current ASMO behavior
  ```

### Technical Preparation
- [ ] **Terminal setup**
  - [ ] Large font size (visible from back of room)
  - [ ] Syntax highlighting enabled
  - [ ] Terminal theme: high contrast (dark background preferred)
  - [ ] Window size: full screen or split view ready

- [ ] **Screen recording backup**
  ```bash
  # Record all 3 scenarios as backup
  # In case live demo fails, play recordings
  ```

- [ ] **tmux/terminal multiplexer** (optional)
  ```bash
  # Setup split panes for:
  # - Command execution (left)
  # - Log output (right)
  # - Slides/notes (bottom)
  ```

### Documentation
- [ ] **Print or have available:**
  - [ ] demo/demo-presentation-outline.md
  - [ ] demo/DEMO-CHECKLIST.md (this file)
  - [ ] docs/en/phase-4-release/demo-script.md
  - [ ] Key architecture diagrams (if separate slides)

---

## Day of Demo

### 30 Minutes Before

- [ ] **Open all necessary terminals/tabs**
  - Tab 1: Demo execution (`cd demo/`)
  - Tab 2: Monitoring/logs
  - Tab 3: Backup (sample project directory)

- [ ] **Verify internet connection**
  ```bash
  ping anthropic.com
  # If using Session mode, ensure connection to Claude CLI
  ```

- [ ] **Clean demo environment**
  ```bash
  cd demo/sample-project
  git status
  # Ensure no uncommitted changes
  # Reset if needed: git reset --hard HEAD
  ```

- [ ] **Test ASMO one more time**
  ```bash
  asmo suggest "quick test"
  # Verify: returns JSON in < 5 seconds
  ```

- [ ] **Prepare presentation screen**
  - [ ] Slides open (demo/slides.md or exported PDF)
  - [ ] Browser tabs ready:
    - ASMO GitHub repo
    - System overview docs
    - Feature matrix
  - [ ] Close unnecessary apps (reduce distractions)

### Equipment Check

- [ ] **Projector/Screen**
  - [ ] Test resolution (ensure terminal text is readable)
  - [ ] Adjust font size if needed
  - [ ] Verify colors (syntax highlighting visible)

- [ ] **Audio** (if recording or live streaming)
  - [ ] Microphone working
  - [ ] Audio levels tested

- [ ] **Backup Plan**
  - [ ] Pre-recorded videos available
  - [ ] Sample output files ready
  - [ ] Screenshots of key outputs

---

## During Demo

### Introduction (5 min)
- [ ] Start with problem statement slide
- [ ] Show ASMO architecture diagram
- [ ] Highlight key numbers: 25 agents, 27 workflows, $0 cost

### Scenario 1: YOLO Mode (5 min)
- [ ] Command: `asmo suggest "Fix typo in README"`
- [ ] Show JSON output (useAsmo: true, score: 15)
- [ ] Command: `time asmo run "Fix typo in README" --verbose`
- [ ] Highlight: YOLO activation, < 60s completion
- [ ] **Talking points:**
  - Score < 30 → auto-approve
  - Eliminates approval fatigue
  - ~20% of tasks are trivial

### Scenario 2: Context Cascade (10 min)
- [ ] Command: `asmo run "Add email validation to signup form" --dry-run`
- [ ] Show execution plan (3 phases)
- [ ] Command: `asmo run "Add email validation to signup form" --verbose`
- [ ] **Point out in verbose output:**
  - Phase 1: Architect creates strategy
  - Phase 2: Developer receives strategy, implements
  - Phase 3: Tester receives strategy + implementation
- [ ] **Talking points:**
  - Automatic context flow
  - No duplication of work
  - Each agent builds on previous

### Scenario 3: Party Mode (10 min)
- [ ] Command: `asmo analyze "Implement OAuth2 authentication with security audit"`
- [ ] Show complexity: 75, complex level
- [ ] Command: `asmo run "Implement OAuth2 authentication with security audit" --verbose`
- [ ] **Point out in verbose output:**
  - Party mode activation (score ≥ 60)
  - Multiple agents in parallel
  - Convergence checks (Round 1: 65%, Round 3: 87%)
  - Consensus reached
- [ ] **Talking points:**
  - Parallel vs sequential
  - Convergence mechanism
  - Multiple perspectives reduce blind spots

### Bonus: Adaptive Phase Detection (5 min, optional)
- [ ] Create investigation-report.md manually
- [ ] Command: `asmo run "Fix null pointer in login handler" --verbose`
- [ ] Show: PhaseDetector skips Phase 1, joins at Phase 2
- [ ] **Talking points:**
  - Resumes from existing work
  - Saves time and tokens
  - Smart, not rigid

### Unique Features (10 min)
- [ ] Review slides for:
  - Dual LLM Strategy
  - Metrics & Learning Loop
  - Adversarial Review concept
  - Cost comparison ($0 vs $1,023/month)

### Q&A (10 min)
- [ ] Be ready for common questions:
  - "How does it compare to LangGraph/CrewAI?"
  - "Can we customize workflows?"
  - "What about non-Claude models?"
  - "How do we integrate with our CI/CD?"

---

## Post-Demo

### Immediate Follow-Up
- [ ] Share demo materials with team
  ```
  Email/Slack:
  - Link to ASMO repo
  - demo/ folder contents
  - System overview docs
  - Getting started guide
  ```

- [ ] Gather feedback
  - [ ] Create feedback form or survey
  - [ ] Ask specific questions:
    - "Which feature was most interesting?"
    - "What use cases do you see for your work?"
    - "Any concerns about integration?"

### Documentation
- [ ] Record any issues encountered during demo
- [ ] Update demo scripts if scenarios have changed
- [ ] Note questions that were asked (add to FAQ)

### Next Steps Planning
- [ ] Schedule follow-up session (if needed)
- [ ] Identify pilot use case for team
- [ ] Plan integration workshop (git hooks, CI/CD)

---

## Backup Plan (If Live Demo Fails)

### Option 1: Pre-recorded Videos
- [ ] Play scenario recordings
- [ ] Narrate what's happening
- [ ] Show final outputs

### Option 2: Sample Output Files
- [ ] Show pre-generated output files
- [ ] Walk through what ASMO would have done
- [ ] Explain each phase using sample artifacts

### Option 3: Architecture Focus
- [ ] Skip live demo
- [ ] Deep dive into architecture diagrams
- [ ] Code walkthrough (show agent implementations)
- [ ] Focus on Q&A

---

## Emergency Contacts

**If technical issues arise:**
- ASMO maintainer: [contact info]
- Claude CLI support: https://docs.anthropic.com/claude/docs/cli
- Anthropic API status: https://status.anthropic.com

---

## Presentation Tips

### Do's
✅ Speak slowly and clearly (technical audience, terms matter)
✅ Explain what you're typing before executing
✅ Pause after each command to let output display
✅ Highlight key lines in verbose output (point with cursor)
✅ Relate features to real-world developer pain points
✅ Use concrete numbers ($0 cost, < 60s, 20% of tasks)

### Don'ts
❌ Rush through commands
❌ Assume everyone knows terminology (explain LLM, agents, etc.)
❌ Skip explaining what happened (even if obvious to you)
❌ Ignore questions to stay on schedule (questions = engagement)
❌ Over-apologize if something breaks (use backup plan)

---

## Success Metrics

After demo, aim for:
- [ ] At least 3 clarifying questions (shows interest)
- [ ] 1-2 team members want to try ASMO on their tasks
- [ ] Positive feedback on at least 2 unique features
- [ ] No major technical failures (or smooth recovery if they occur)

---

## Post-Demo Checklist

- [ ] Thank attendees for their time
- [ ] Share resources (repo, docs, examples)
- [ ] Set up follow-up meeting (if requested)
- [ ] Send summary email within 24 hours
- [ ] Update demo materials based on feedback

---

**Good luck with the demo! 🚀**

*Remember: The goal is to show ASMO's value, not to have a perfect demo. Be authentic, highlight real benefits, and engage with questions.*
