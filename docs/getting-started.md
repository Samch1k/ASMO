# Getting Started with ASMO

Welcome to **ASMO** - the AI System for Multiagent Orchestration! 🚀

ASMO automatically analyzes your tasks and routes them to specialized AI agents and workflows, making complex software development tasks easier and more efficient.

---

## What is ASMO?

ASMO is an intelligent orchestration system that:

- **Analyzes task complexity** - Understands what your task requires
- **Selects the right workflow** - Chooses from 27 specialized workflows
- **Routes to expert agents** - Uses 25 specialized AI agents
- **Adapts dynamically** - Adjusts workflows based on complexity
- **Saves you money** - Uses free Session mode by default ($0 cost)

**Think of it as your AI team manager** - you describe the task, ASMO coordinates the right experts to get it done.

---

## Installation

### Prerequisites
- Node.js 18+ or Node.js 20+
- pnpm (recommended) or npm

### Install from source

```bash
# Clone the repository
git clone https://github.com/your-org/ASMO.git
cd ASMO

# Install dependencies
pnpm install

# Build the project
pnpm build

# Link CLI globally (optional)
cd packages/cli
pnpm link --global
```

### Verify installation

```bash
asmo --version
# Should output: @asmo/cli version X.X.X
```

---

## Quick Start

### 1. Check if ASMO is needed

Before running ASMO, check if your task is complex enough:

```bash
asmo suggest "Fix authentication bug in login page"
```

**Output:**
```json
{
  "useAsmo": true,
  "reason": "Task involves bug investigation and multiple files",
  "recommendedWorkflow": "bug_fix_workflow",
  "estimatedTime": "1-3 hours"
}
```

**When to use ASMO:**
- ✅ Bug fixes requiring investigation
- ✅ New features (multiple files)
- ✅ Architecture decisions
- ✅ Security audits
- ✅ Performance optimization
- ✅ Test suite creation

**When NOT to use ASMO:**
- ❌ Simple typo fixes
- ❌ Single-line changes
- ❌ Quick questions about code
- ❌ File reading/exploration

### 2. Run your first task

```bash
asmo run "Fix authentication bug in login page"
```

**What happens:**

1. **Complexity Analysis** - ASMO analyzes your task (15-30 seconds)
   ```
   🔍 Analyzing task complexity...
   Complexity: 45/100 (Medium)
   ```

2. **Workflow Selection** - Chooses the best workflow
   ```
   ✅ Selected workflow: bug_fix_workflow (adaptive)
   Agents: debugger → developer → tester
   Estimated time: 2 hours
   ```

3. **Approval Checkpoint** - You review and approve
   ```
   📋 Workflow Plan:
   - Step 1: Investigate bug (debugger) - 30 min
   - Step 2: Implement fix (developer) - 1 hour
   - Step 3: Test fix (tester) - 30 min

   ❓ Approve workflow? (Y/n)
   ```

4. **Execution** - Agents execute the workflow
   ```
   🤖 Step 1/3: debugger investigating...
   ✅ Step 1 complete: Root cause identified in auth.ts:45

   🤖 Step 2/3: developer implementing fix...
   ✅ Step 2 complete: Fix implemented and committed

   🤖 Step 3/3: tester validating...
   ✅ Step 3 complete: Tests pass, bug fixed
   ```

5. **Results** - Summary and artifacts
   ```
   🎉 Workflow complete!

   📦 Artifacts created:
   - bug-analysis.md
   - fix-implementation.md
   - test-results.md

   ⏱️  Time: 1h 45m (actual) vs 2h (estimated)
   ```

### 3. Explore available workflows

```bash
asmo workflow
```

**Output:**
```
📚 Available Workflows (27)

Core Development (7):
  bug_fix_workflow             - Fix bugs (adaptive)
  feature_implementation_full  - Complete features
  code_refactoring            - Refactor code
  dev_story_workflow          - Implement user stories
  ...

Quality & Testing (5):
  comprehensive_testing       - Create test suites
  security_audit             - Security review
  performance_optimization   - Speed improvements
  ...

TEA (3):
  tea_planning_workflow      - Test planning
  tea_execution_workflow     - Test execution
  tea_validation_workflow    - Quality validation
  ...

Run specific workflow:
  asmo workflow <name> --task "<your task>"
```

---

## Your First Task: Step-by-Step Tutorial

Let's walk through a complete example: **Adding a user profile page**.

### Step 1: Describe the task

```bash
asmo run "Add a user profile page with avatar, name, email, and bio"
```

### Step 2: Review complexity analysis

ASMO analyzes the task:

```
🔍 Analyzing task complexity...

Task Type: Feature Implementation
Complexity: 55/100 (Medium)
Technical Scope: 6/10
Business Impact: 5/10
Performance Impact: 4/10

Recommendation: feature_implementation_full
Estimated Time: 4-6 hours
```

**Why this workflow?**
- Multiple components (UI + backend)
- Data modeling needed
- Testing required
- Medium complexity

### Step 3: Approve the workflow

```
📋 Workflow: feature_implementation_full

Phases:
  1. Architecture Design (architect) - 1h
     → System design, API contracts, data models

  2. Development (developer) - 2-3h
     → Frontend components, backend endpoints

  3. Testing (tester) - 1-2h
     → Unit tests, integration tests

Total: 4-6 hours
Agents: 3 (architect, developer, tester)

❓ Approve? (Y/n) █
```

Type `Y` and press Enter.

### Step 4: Watch execution

ASMO coordinates the agents:

```
🤖 Phase 1/3: Architecture Design
   Agent: architect

   ✅ System design complete
   ✅ API contracts defined
   ✅ Data models created

   📦 Artifacts:
      - architecture-design.md
      - api-contracts.yaml
      - data-models.json

🤖 Phase 2/3: Development
   Agent: developer

   ✅ UserProfile component created
   ✅ Avatar upload implemented
   ✅ Backend endpoints created
   ✅ Database migration added

   📦 Artifacts:
      - src/components/UserProfile.tsx
      - src/api/userProfile.ts
      - migrations/add-user-profile.sql

🤖 Phase 3/3: Testing
   Agent: tester

   ✅ Unit tests created (8 tests)
   ✅ Integration tests created (4 tests)
   ✅ All tests passing

   📦 Artifacts:
      - tests/UserProfile.test.tsx
      - tests/api/userProfile.test.ts
```

### Step 5: Review results

```
🎉 Workflow Complete!

📊 Summary:
   - Time: 4h 25m (actual) vs 5h (estimated)
   - Steps completed: 3/3
   - Tests passing: 12/12
   - Files created: 8
   - Lines of code: 450

📦 Deliverables:
   ✅ System architecture document
   ✅ User profile component (React)
   ✅ Backend API endpoints
   ✅ Database migration
   ✅ Unit tests (8)
   ✅ Integration tests (4)
   ✅ API documentation

✨ Next Steps:
   - Review generated code
   - Run: npm test
   - Commit changes: git commit -m "Add user profile page"
   - Deploy to staging
```

### Step 6: Review generated code

ASMO creates all files in your project:

```bash
# Check what was created
git status

# Review the main component
cat src/components/UserProfile.tsx

# Run tests
npm test
```

Everything is ready to commit and deploy! 🚀

---

## Common Commands

### Analyze task complexity
```bash
asmo analyze "Your task here"
```
Returns complexity score and recommendations without executing.

### Get workflow suggestion
```bash
asmo suggest "Your task here"
```
Fast recommendation (used in hooks) - returns JSON with `useAsmo: true/false`.

### Run specific workflow
```bash
asmo workflow bug_fix_workflow --task "Fix login error"
```
Bypass automatic selection, use specific workflow.

### List all workflows
```bash
asmo workflow
```
Show all 27 available workflows with descriptions.

### Interactive workflow chooser
```bash
asmo choose-workflow
```
Step-by-step interactive selection (coming soon in Phase 3).

---

## Understanding the Output

### Complexity Score (0-100)

- **0-39 (Simple)**: Basic tasks, minimal coordination
  - Example: "Fix typo in README"
  - Workflow: Skips optional steps, ~1 hour

- **40-69 (Medium)**: Standard tasks, moderate complexity
  - Example: "Add user authentication"
  - Workflow: Standard steps, ~2-4 hours

- **70-100 (Complex)**: Advanced tasks, high coordination
  - Example: "Redesign database architecture"
  - Workflow: All steps included, ~6+ hours

### Workflow Types

1. **Adaptive Workflows** - Adjust based on complexity
   - `bug_fix_workflow` - Skips architect for simple bugs
   - `tea_planning_workflow` - Skips advanced techniques for simple projects

2. **Full Workflows** - Complete end-to-end processes
   - `feature_implementation_full` - Architecture → Development → Testing
   - `tea_execution_workflow` - Automation → Regression → Maintenance

3. **Specialized Workflows** - Focused on specific domains
   - `security_audit` - Security review
   - `performance_optimization` - Speed improvements
   - `architecture_design` - System design

### Artifacts

Each workflow generates artifacts:

- **Documentation**: `.md` files with analysis, decisions, summaries
- **Code**: Source files, tests, configurations
- **Data**: JSON/YAML files with structured output
- **Reports**: Test results, metrics, recommendations

Artifacts are saved in:
- `./asmo-output/` - Default output directory
- Or in your project directory (configurable)

---

## Configuration

### Environment Variables

Create a `.env` file in your project root:

```bash
# LLM Provider (optional)
ANTHROPIC_API_KEY=sk-ant-...  # Only needed for API mode

# ASMO Configuration
ASMO_MODE=session             # session (free) or api (paid)
ASMO_OUTPUT_DIR=./asmo-output # Where to save artifacts
ASMO_YOLO_MODE=false          # Auto-approve simple tasks
ASMO_LOG_LEVEL=info           # debug, info, warn, error
```

### Dual LLM Strategy

ASMO uses two LLM providers:

1. **Session Provider** ($0 cost) - Default
   - Uses Claude CLI: `claude -p "<prompt>"`
   - Free unlimited usage
   - Recommended for most tasks

2. **API Provider** (pay-per-use)
   - Uses Anthropic API directly
   - Requires `ANTHROPIC_API_KEY`
   - Automatic fallback if Session fails

**Configuration:**
```bash
# Force API mode
ASMO_MODE=api asmo run "Your task"

# Use Session mode (default)
asmo run "Your task"
```

### YOLO Mode (Auto-Approve)

Skip approval checkpoint for simple tasks:

```bash
# Enable YOLO mode
ASMO_YOLO_MODE=true asmo run "Fix typo in README"

# Or use flag
asmo run "Fix typo" --yolo
```

**When YOLO activates:**
- Complexity < 40 (simple tasks)
- Low risk workflows
- No architectural changes

**When YOLO is disabled:**
- Complex tasks (complexity ≥ 40)
- Workflows modifying architecture
- Security-critical changes

---

## Integration with Claude Code

ASMO works seamlessly with Claude Code CLI.

### Using the suggestion hook

When you ask Claude Code to do complex work, ASMO automatically suggests whether to use orchestration:

```bash
$ claude "Fix the authentication bug and add tests"

[ASMO Suggestion]
This task is complex enough for ASMO orchestration.

Recommendation:
  asmo run "Fix the authentication bug and add tests"

Reason: Bug investigation + test creation (2 concerns, 3+ files)
Estimated time: 2-3 hours
Workflow: bug_fix_workflow (adaptive)

Proceed with ASMO? (Y/n)
```

### Manual invocation

You can always invoke ASMO manually:

```bash
# Instead of:
claude "Add user authentication"

# Use:
asmo run "Add user authentication"
```

---

## Tips for Success

### 1. Be specific in task descriptions

**Good:**
```bash
asmo run "Add JWT authentication to the API with refresh tokens and logout endpoint"
```

**Too vague:**
```bash
asmo run "Add auth"
```

### 2. Let ASMO choose the workflow

Trust the complexity analysis - it's trained to select the right workflow.

**Good:**
```bash
asmo run "Your task"  # Let ASMO choose
```

**Less optimal:**
```bash
asmo workflow bug_fix_workflow --task "..."  # Manual selection
```

Exception: Use manual selection when you know exactly what you need.

### 3. Review artifacts

ASMO generates documentation and code - always review before committing:

```bash
# Check what was generated
ls -la asmo-output/

# Review documentation
cat asmo-output/architecture-design.md

# Review code
git diff
```

### 4. Start with simple tasks

Learn ASMO with simple tasks first:

```bash
# Good starter tasks
asmo run "Fix the typo in login.ts line 42"
asmo run "Add unit tests for the UserService class"
asmo run "Create a new API endpoint for user search"
```

### 5. Use `suggest` for learning

See how ASMO thinks about your task:

```bash
asmo suggest "Your complex task here"
```

Returns detailed reasoning - great for understanding when to use ASMO.

---

## Troubleshooting

### "Workflow not found"

**Problem:** ASMO can't find the workflow.

**Solution:**
```bash
# List all workflows
asmo workflow

# Use exact workflow name
asmo workflow bug_fix_workflow --task "..."
```

### "LLM provider error"

**Problem:** Session provider failed, no API key configured.

**Solution:**
```bash
# Set API key in .env
echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env

# Or use environment variable
ANTHROPIC_API_KEY=sk-ant-... asmo run "..."
```

### "Complexity analysis timeout"

**Problem:** Task description is too complex or ambiguous.

**Solution:**
1. Simplify task description
2. Break into smaller tasks
3. Increase timeout:
```bash
ASMO_TIMEOUT=120000 asmo run "..."  # 2 minutes
```

### "Approval checkpoint timeout"

**Problem:** You didn't respond to the approval prompt.

**Solution:**
- Use YOLO mode for simple tasks: `--yolo`
- Increase timeout: `ASMO_APPROVAL_TIMEOUT=300000` (5 min)

### "Build failed" or "Tests failed"

**Problem:** ASMO is working, but project build/tests fail.

**Solution:**
1. Check error messages in artifacts
2. Review generated code
3. Fix issues manually
4. Re-run specific workflow step if needed

---

## What's Next?

### Learn More

- **[User Guide](./user-guide.md)** - Comprehensive guide to all features
- **[Workflow Guide](./workflow-guide.md)** - When to use each workflow
- **[Examples](./examples/)** - Real-world scenarios
- **[FAQ](./faq.md)** - Common questions

### Advanced Topics

- **[Architecture](./architecture.md)** - How ASMO works internally
- **[Developing Agents](./developing-agents.md)** - Create custom agents
- **[Developing Workflows](./developing-workflows.md)** - Create custom workflows
- **[API Reference](./api-reference.md)** - Programmatic usage

### Get Help

- **GitHub Issues**: https://github.com/your-org/ASMO/issues
- **Discussions**: https://github.com/your-org/ASMO/discussions
- **Documentation**: https://asmo.dev/docs

---

## Quick Reference

### Commands Cheat Sheet

```bash
# Check if ASMO is needed
asmo suggest "<task>"

# Analyze complexity
asmo analyze "<task>"

# Run with automatic selection
asmo run "<task>"

# Run specific workflow
asmo workflow <name> --task "<task>"

# List all workflows
asmo workflow

# Auto-approve simple tasks
asmo run "<task>" --yolo

# Force API mode
ASMO_MODE=api asmo run "<task>"

# Check version
asmo --version

# Get help
asmo --help
```

### When to Use ASMO

| Task | Use ASMO? | Why |
|------|-----------|-----|
| Fix typo | ❌ No | Too simple, just fix it |
| Fix complex bug | ✅ Yes | Needs investigation + testing |
| Add new feature | ✅ Yes | Multiple files, coordination needed |
| Refactor code | ✅ Yes | Architecture review + testing |
| Create test suite | ✅ Yes | Specialized testing workflows |
| Security audit | ✅ Yes | Specialized security agent |
| Read file | ❌ No | No coordination needed |
| Ask question | ❌ No | No code changes |
| Performance optimization | ✅ Yes | Profiling + implementation |

### Complexity Indicators

Use ASMO when task has:

- ✅ Multiple files to change
- ✅ Multiple concerns (code + tests + docs)
- ✅ Architectural decisions
- ✅ Security/performance requirements
- ✅ Cross-cutting changes
- ✅ Unclear scope (needs analysis)

Skip ASMO when:

- ❌ Single line change
- ❌ Simple typo fix
- ❌ Just reading/exploring code
- ❌ Quick question

---

**Ready to orchestrate your AI agents? Start with:**

```bash
asmo run "Your first task here"
```

Happy orchestrating! 🚀
