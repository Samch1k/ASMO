# @asmo/cli

Command-line interface for ASMO - AI System for Multiagent Orchestration.

Execute complex development workflows with autonomous AI agent teams directly from your terminal.

## Features

- 🎯 **Adaptive Workflow Selection** - Automatic task analysis and workflow recommendation
- 🤖 **25 Specialized Agents** - Architect, Developer, Tester, Security Specialist, and more
- 📊 **27 Production Workflows** - Bug fixes, features, refactoring, security audits
- 🔄 **Config Fallback** - Works with or without `.cursor/config`
- ⚡ **Zero Configuration** - Bundled templates included out of the box

## Installation

```bash
npm install -g @asmo/cli
# or
pnpm add -g @asmo/cli
```

**Requires:** Node.js 20.0.0 or higher

## Quick Start

```bash
# Analyze and execute any task
asmo run "Fix the login bug"

# Fast analysis for hooks (returns JSON)
asmo suggest "Add user authentication"

# Get detailed complexity analysis
asmo analyze "Add user authentication"

# Execute specific workflow
asmo workflow bug-fix --task "Memory leak in session"

# List available workflows
asmo workflow

# Dry run (show plan without executing)
asmo run "Refactor auth module" --dry-run
```

## Commands

### `asmo run <task>`

Main command that automatically analyzes your task, selects the appropriate workflow, and executes it.

**Features:**
- Complexity analysis (5 levels: trivial → enterprise)
- Adaptive workflow selection based on task characteristics
- Automatic agent assignment
- Workflow execution with WorkflowEngine

**Options:**
```bash
-v, --verbose    Show detailed analysis and execution logs
-d, --dry-run    Show execution plan without making changes
```

**Examples:**
```bash
# Simple bug fix (auto-selects bug-fix workflow)
asmo run "Fix null pointer in login handler"

# Feature development (auto-selects feature workflow)
asmo run "Add email validation to signup form"

# Complex refactoring (auto-selects appropriate workflow)
asmo run "Refactor authentication system to use JWT" --verbose

# Dry run to see execution plan
asmo run "Add user profile page" --dry-run
```

### `asmo suggest <task>`

Fast analysis for Claude Code integration - returns JSON recommendation for whether to use ASMO.

Designed for use in Claude Code hooks and automation scripts. Performs lightweight complexity analysis without loading full configuration.

**Options:**
```bash
-t, --threshold <score>    Complexity threshold for ASMO recommendation (default: 40)
--no-json                  Human-readable output instead of JSON
```

**Output Format:**
```json
{
  "useAsmo": true,
  "confidence": 0.85,
  "workflow": "feature_implementation_full",
  "agents": ["architect", "developer", "tester"],
  "skills": ["feature-dev", "testing"],
  "complexity": {
    "score": 65,
    "level": "complex"
  },
  "reasoning": "Complex feature requiring multiple agents"
}
```

**Examples:**
```bash
# Quick analysis (JSON output)
asmo suggest "Add OAuth authentication"

# Human-readable output
asmo suggest "Fix typo in README" --no-json

# Custom threshold for ASMO recommendation
asmo suggest "Refactor user service" --threshold 50
```

### `asmo analyze <task>`

Analyze task complexity and get workflow recommendation without executing.

**Options:**
```bash
-c, --context <path>    Path to project context file
-j, --json             Output results as JSON
```

**Examples:**
```bash
# Get complexity analysis
asmo analyze "Implement OAuth2 authentication"

# JSON output for scripting
asmo analyze "Migrate to microservices" --json
```

### `asmo workflow [name]`

Execute a specific workflow by name, or list available workflows.

**Options:**
```bash
-t, --task <task>      Task description (required for execution)
-d, --dry-run         Show execution plan without making changes
-v, --verbose         Show detailed execution logs
```

**Examples:**
```bash
# List all available workflows
asmo workflow

# Execute specific workflow
asmo workflow bug-fix --task "Fix memory leak"
asmo workflow feature --task "Add dark mode" --verbose

# Dry run to see workflow steps
asmo workflow security-audit --task "Check auth system" --dry-run
```

### `asmo task <command>`

Manage tasks with create, list, start, complete, and fail commands.

**Commands:**
```bash
asmo task create <title>         Create new task
asmo task list                   List all tasks
asmo task show <id>              Show task details
asmo task start <id>             Start a task
asmo task complete <id>          Mark task as complete
asmo task fail <id>              Mark task as failed
```

**Examples:**
```bash
# Create task
asmo task create "Add user search" --priority high

# List pending tasks
asmo task list --status pending

# Start and complete task
asmo task start task_123
asmo task complete task_123 --output '{"success": true}'
```

## Configuration

### Config Locations (Fallback Chain)

@asmo/cli automatically finds configuration in this order:

1. **`.cursor/config`** - Claude Code environment (if present)
2. **`~/.asmo/config`** - User home directory
3. **Bundled templates** - Always available as fallback

**No configuration required!** CLI works out of the box with bundled templates.

### Custom Configuration

To customize workflows, roles, or skills:

```bash
# Create config directory
mkdir -p ~/.asmo/config

# Copy bundled templates as starting point
cp -r node_modules/@asmo/core/templates/* ~/.asmo/config/

# Edit workflows
vim ~/.asmo/config/workflows/1-quick-flow/workflow.json

# Edit agent roles
vim ~/.asmo/config/roles/core-roles.json
```

## Examples

### Example 1: Simple Bug Fix

```bash
$ asmo run "Fix typo in README"

⚙️  Initializing ASMO...
🔍 Analyzing task complexity...
   Selected: bug_fix_workflow (confidence: 92.0%)

🚀 Executing workflow...

✅ Execution complete
```

### Example 2: Feature Development

```bash
$ asmo run "Add email validation to signup form" --verbose

⚙️  Initializing ASMO...
🔍 Analyzing task complexity...

📊 Analysis Results:
   Workflow: feature_implementation_full
   Complexity: medium (45/100)
   Confidence: 87.5%
   Reasoning: Feature development task with medium complexity

🚀 Executing workflow...

✅ Execution complete
   Result: success
```

### Example 3: Dry Run

```bash
$ asmo run "Refactor authentication module" --dry-run

⚙️  Initializing ASMO...
🔍 Analyzing task with hybrid system...
   Selected: refactoring (confidence: 85.0%)

✅ Dry run complete (no execution)

To execute: asmo run "Refactor authentication module"
```

## Package.json Integration

Add ASMO commands to your package.json scripts:

```json
{
  "scripts": {
    "asmo:fix": "asmo workflow bug-fix --task",
    "asmo:feature": "asmo workflow feature --task",
    "asmo:test": "asmo workflow comprehensive-testing --task",
    "asmo:analyze": "asmo analyze"
  }
}
```

Then run:
```bash
npm run asmo:fix "Fix login error"
npm run asmo:feature "Add user profile"
```

## Environment Variables

- `USE_SKILLMD` - Use SKILL.md format (default: true)
- `USE_YAML_SKILLS` - Use YAML format for skills (default: false)

## Troubleshooting

### "Workflow not found"

Ensure workflows exist in one of the config locations:
```bash
ls ~/.asmo/config/workflows
ls .cursor/config/orchestration/workflows
```

### "Agent not found"

Check that roles are configured:
```bash
ls ~/.asmo/config/roles
```

## Links

- **GitHub**: [https://github.com/Samch1k/ASMO](https://github.com/Samch1k/ASMO)
- **npm - @asmo/core**: [https://npmjs.com/package/@asmo/core](https://npmjs.com/package/@asmo/core)
- **npm - @asmo/cli**: [https://npmjs.com/package/@asmo/cli](https://npmjs.com/package/@asmo/cli)

## License

MIT - see LICENSE file for details
