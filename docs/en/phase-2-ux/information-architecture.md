# ASMO -- Information Architecture

## CLI Command Tree

```
asmo
├── run <task>                # Main command -- analyze + execute
│   ├── --verbose             # Detailed output (agent steps, LLM calls, timing)
│   ├── --dry-run             # Full analysis, no execution
│   ├── --use-api             # Force API mode (requires ANTHROPIC_API_KEY)
│   ├── --no-llm              # Heuristics only (~65% accuracy, offline)
│   └── --workflow <id>       # Override automatic workflow selection
│
├── suggest <task>            # Quick recommendation (JSON output)
│   ├── --threshold <n>       # Complexity threshold for useAsmo decision
│   └── --no-json             # Human-readable output instead of JSON
│
├── analyze <task>            # Complexity analysis only
│   ├── --context <path>      # Provide project context for better analysis
│   └── --json                # Machine-readable JSON output
│
├── workflow [name]           # List all workflows or execute a specific one
│   ├── --task <task>         # Task description (required when executing)
│   ├── --dry-run             # Show execution plan without running
│   └── --verbose             # Detailed workflow output
│
└── task <command>            # Task management
    ├── create <title>        # Create a new task
    ├── list                  # List all tasks
    ├── show <id>             # Show task details
    ├── start <id>            # Mark task as in-progress
    ├── complete <id>         # Mark task as complete
    └── fail <id>             # Mark task as failed
```

## Configuration Hierarchy

ASMO resolves configuration through a three-tier fallback chain. Each tier overrides the one below it.

### Tier 1 -- Project-Level (highest priority)

```
.cursor/config/
├── orchestration/
│   └── workflows/          # Project-specific workflow overrides
├── roles/                  # Project-specific role definitions
└── skills/                 # Project-specific skill files
```

Located in the project root. These settings apply only to the current project and take the highest priority. Useful for teams that need project-specific workflow tuning.

### Tier 2 -- User-Level

```
~/.asmo/config/
├── workflows/              # User's personal workflow customizations
├── roles/                  # User's personal role overrides
└── skills/                 # User's personal skill additions
```

Located in the user's home directory. These settings apply across all projects for a given user. Useful for personal preferences and frequently used custom workflows.

### Tier 3 -- Bundled Defaults (lowest priority, always available)

```
node_modules/@asmo/core/templates/
├── workflows/              # 27 workflow definitions (JSON)
├── roles/                  # 5 JSON role files containing 25 roles
├── skills/                 # 55 SKILL.md files
└── teams/                  # Team composition definitions
```

Ships with the `@asmo/core` package. These are the built-in defaults that make ASMO work with zero configuration. They are never modified by the user.

### Resolution Order

```
Project (.cursor/config/)  -->  User (~/.asmo/config/)  -->  Bundled (node_modules/@asmo/core/templates/)
```

When ASMO loads a workflow, role, or skill, it checks each tier in order and uses the first match. This means a project-level `bug_fix_workflow.json` will override the bundled default without affecting other projects.

## Data Flow

```
CLI Input (asmo run "task")
  │
  ├── InputValidator          # Sanitize, validate length, UTF-8, control chars
  │
  ├── ConfigLoader            # Load workflows/roles/skills from 3-tier hierarchy
  │     ├── Roles (JSON)
  │     ├── Skills (SKILL.md)
  │     └── Workflows (JSON templates)
  │
  ├── LLMProviderFactory      # Session → API → Heuristics (auto-fallback)
  │
  ├── ComplexityAnalyzer      # Score 0-100, classify into 5 levels
  │
  ├── WorkflowSelector        # Match task to best workflow
  │
  ├── PhaseDetector           # Detect which phase to start from (adaptive)
  │
  ├── ApprovalCheckpoint      # YOLO bypass (<30) or human approval
  │
  ├── WorkflowEngine          # Orchestrate agent execution
  │     ├── AgentExecutor     # Run individual agents
  │     ├── CircuitBreaker    # Fault tolerance per agent
  │     └── ContextCascade    # Share context between agents
  │
  └── MetricsCollector        # Duration, token usage, success/failure
        └── MetricsOptimizer  # Learning loop for future improvements
```

## Package Structure

```
packages/
├── core/                   # @asmo/core -- orchestration library
│   ├── src/
│   │   ├── agents/         # Agent implementations
│   │   ├── workflows/      # WorkflowEngine, WorkflowSelector
│   │   ├── analysis/       # ComplexityAnalyzer, KeywordAnalyzer
│   │   ├── config/         # ConfigLoader, 3-tier resolution
│   │   ├── llm/            # LLMProviderFactory, Session/API providers
│   │   └── utils/          # InputValidator, CircuitBreaker, etc.
│   ├── templates/          # Bundled defaults (workflows, roles, skills)
│   └── docs/               # Internal technical documentation
│
└── cli/                    # @asmo/cli -- command-line interface
    └── bin/
        └── asmo.js         # Entry point
```
