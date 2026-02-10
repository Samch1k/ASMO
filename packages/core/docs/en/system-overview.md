# ASMO System Overview

**ASMO** (AI System for Multiagent Orchestration) is an autonomous AI development orchestration system that coordinates multiple AI agents to work together as a cohesive team.

**Version**: 1.0.0
**Last Updated**: February 2026

---

## Table of Contents

1. [Architecture](#architecture)
2. [Agents (25)](#agents)
3. [Workflows (27)](#workflows)
4. [Skills (55)](#skills)
5. [Teams Configuration](#teams-configuration) ⭐ NEW
6. [Execution Modes](#execution-modes) ⭐ NEW
7. [Configuration](#configuration)
8. [API Reference](#api-reference)

---

## Architecture

ASMO uses a multi-tier architecture for orchestrating AI agents:

```
┌─────────────────────────────────────────────────────────┐
│                   WorkflowEngine                        │
│  - Adaptive workflow selection                          │
│  - Phase detection & joining                            │
│  - Execution modes (sequential/party/brainstorming)     │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼────────┐  ┌──────▼─────────┐  ┌────▼──────┐
│  AgentRegistry │  │  TeamManager   │  │  Context  │
│  25 agents     │  │  Phase 2       │  │  Cascade  │
└────────────────┘  └────────────────┘  └───────────┘
        │                  │
┌───────▼────────┐  ┌──────▼─────────┐
│  SkillMatcher  │  │  ConfigLoader  │
│  55 skills     │  │  Roles/Teams   │
└────────────────┘  └────────────────┘
```

### Key Components

- **WorkflowEngine**: Orchestrates workflow execution with adaptive selection
- **AgentRegistry**: Manages 25 specialized agents
- **TeamManager**: Groups agents into reusable teams (Phase 2)
- **SkillMatcher**: Matches tasks to 55 skills across 12 categories
- **ContextCascade**: Automatic context flow between phases
- **ConfigLoader**: Loads roles, skills, workflows from templates

---

## Agents

ASMO includes **25 specialized agents** across 3 categories:

### Core Agents (6)

| Agent | ID | Role | Key Skills |
|-------|-----|------|-----------|
| **Architect** | `architect` | System design & architecture | `system_design`, `architecture_decisions`, `adr_creation` |
| **Developer** | `developer` | Code implementation | `code_writing`, `typescript_expert`, `feature_implementation` |
| **Tester** | `tester` | Testing & QA | `unit_testing`, `e2e_testing`, `test_coverage` |
| **Debugger** | `debugger` | Bug investigation & fixing | `debug_investigation`, `bug_reproduction`, `root_cause_analysis` |
| **Optimizer** | `optimizer` | Performance optimization | `performance_analysis`, `code_optimization`, `profiling` |
| **DevOps** | `devops` | Deployment & infrastructure | `deployment`, `ci_cd`, `infrastructure`, `monitoring` |

### Specialized Agents (15)

| Agent | ID | Role | Focus Area |
|-------|-----|------|------------|
| **UI Developer** | `ui-developer` | Frontend & UI | React, Tailwind CSS, responsive design |
| **UX Designer** | `ux-designer` | User experience | Wireframes, user flows, usability |
| **Business Analyst** | `business-analyst` | Requirements analysis | User stories, business logic, KPIs |
| **Project Manager** | `project-manager` | Project coordination | Sprint planning, tracking, risk management |
| **Product Owner** | `product-owner` | Product strategy | Roadmap, prioritization, market research |
| **Scrum Master** | `scrum-master` | Agile ceremonies | Sprint planning, retrospectives, velocity |
| **Security Specialist** | `security-specialist` | Security audit | OWASP compliance, vulnerability scanning |
| **Performance Engineer** | `performance-engineer` | Performance tuning | Profiling, caching, query optimization |
| **Data Architect** | `data-architect` | Database design | Schema design, migrations, data modeling |
| **API Designer** | `api-designer` | API design | REST, GraphQL, OpenAPI specs |
| **Analyst** | `analyst` | Strategic analysis | Market research, competitive analysis |
| **Tech Writer** | `tech-writer` | Documentation | API docs, user guides, README files |
| **Test Architect (TEA)** | `test-architect` | Testing strategy | Risk-based testing, test automation |
| **Adversarial Reviewer** | `adversarial-reviewer` | Critical review | Deep security analysis, edge cases |
| **Code Reviewer** | `code-reviewer` | Code review | Quality checks, security review |

### Validation Agents (4)

| Agent | ID | Role |
|-------|-----|------|
| **Design Validator** | `design-validator` | Design validation |
| **Merge Coordinator** | `merge-coordinator` | Merge conflict resolution |
| **Post-Deploy Monitor** | `post-deploy-monitor` | Post-deployment monitoring |
| **Requirements Validator** | `requirements-validator` | Requirements validation |

---

## Workflows

ASMO provides **27 production-ready workflows** organized by complexity and purpose:

### Core Development Workflows

| Workflow | ID | Complexity | Agents | Use Case |
|----------|-----|-----------|--------|----------|
| **Bug Fix** | `bug_fix_workflow` | 25-40 | debugger, developer, tester | Adaptive bug fixing |
| **Feature Implementation** | `feature_implementation_full` | 55-70 | architect, developer, tester | Full feature development |
| **Code Refactoring** | `code_refactoring` | 50-65 | architect, developer | Code restructuring |
| **Code Review** | `code_review_workflow` | 30-45 | code-reviewer, developer | Code quality review |
| **Dev Story** | `dev_story_workflow` | 40-55 | developer, tester | Story implementation |
| **Create Story** | `create_story_workflow` | 20-30 | product-owner, developer | Story creation |

### Architecture & Design

| Workflow | ID | Complexity |
|----------|-----|-----------|
| **Architecture Design** | `architecture_design` | 81-100 |
| **API Design** | `api_design` | 61-80 |
| **UI Component Library** | `ui_component_library` | 61-80 |

### Quality & Testing

| Workflow | ID | Complexity |
|----------|-----|-----------|
| **Comprehensive Testing** | `comprehensive_testing` | 61-80 |
| **Security Audit** | `security_audit` | 71-85 |
| **Performance Optimization** | `performance_optimization` | 61-80 |
| **Performance Investigation** | `performance_investigation` | 50-65 |
| **Adversarial Review** | `adversarial_review_workflow` | 70-85 |

### TEA (Test Engineering & Automation) - 3 Workflows

| Workflow | ID | Duration | Purpose |
|----------|-----|----------|---------|
| **TEA Planning** | `tea_planning_workflow` | 3-5h | Test planning: risk + strategy |
| **TEA Execution** | `tea_execution_workflow` | 3.5-6h | Test automation + regression |
| **TEA Validation** | `tea_validation_workflow` | 2-3h | Quality gates + release readiness |
| **Automate Tests** | `automate_tests_workflow` | 2h | Quick test automation |

### Product & Planning

| Workflow | ID | Purpose |
|----------|-----|---------|
| **Create Product Brief** | `create_product_brief_workflow` | Product vision |
| **Create PRD** | `create_prd_workflow` | Product requirements |
| **Create UX Design** | `create_ux_design_workflow` | UX design |
| **Create Epics & Stories** | `create_epics_and_stories_workflow` | Backlog creation |
| **Sprint Planning** | `sprint_planning_workflow` | Sprint setup |
| **Check Implementation Readiness** | `check_implementation_readiness_workflow` | Pre-dev validation |
| **Correct Course** | `correct_course_workflow` | Course correction |
| **Retrospective** | `retrospective_workflow` | Team retrospective |

### Database

| Workflow | ID | Purpose |
|----------|-----|---------|
| **Database Migration** | `database_migration` | Schema changes |

---

## Skills

ASMO includes **55 skills** across **12 categories**:

### Development (8 skills)
`code_writing`, `typescript_expert`, `feature_implementation`, `code_optimization`, `refactoring`, `api_implementation`, `database_implementation`, `ui_implementation`

### Testing (6 skills)
`unit_testing`, `e2e_testing`, `test_coverage`, `test_automation`, `regression_testing`, `user_testing`

### Architecture (7 skills)
`system_design`, `architecture_decisions`, `adr_creation`, `architecture_review`, `scalability_planning`, `technology_evaluation`, `integration`

### Debugging (4 skills)
`debug_investigation`, `bug_reproduction`, `root_cause_analysis`, `hotfix_generation`

### Performance (5 skills)
`performance_analysis`, `profiling`, `code_optimization`, `query_optimization`, `bundle_optimization`, `caching_strategy`

### DevOps (4 skills)
`deployment`, `ci_cd`, `infrastructure`, `monitoring`, `incident_response`

### Design (6 skills)
`ui_styling`, `responsive_design`, `accessibility`, `user_flows`, `wireframes`, `prototyping`, `usability`

### Business (7 skills)
`requirements`, `user_stories`, `business_logic`, `kpis`, `process_modeling`, `stakeholder_relations`, `market_research`

### Project Management (6 skills)
`sprint_planning`, `coordination`, `tracking`, `risk_management`, `resource_allocation`, `strategy`, `roadmap`, `prioritization`

### Database (2 skills)
`data_modeling`, `query_optimization`

### Documentation (2 skills)
`documentation`, `technical_writing`

### Analysis (2 skills)
`requirements_analysis`, `user_research`

---

## Teams Configuration

**Phase 2 Feature** — Define reusable agent teams for workflow templates.

### Overview

Teams allow you to group agents into predefined configurations that can be reused across multiple tasks. Instead of manually selecting agents for each workflow, define a team once and reference it by ID.

### Key Concepts

- **Team**: A named group of agents with defined phases and parallelism
- **TeamAgent**: An agent within a team, assigned to a specific phase
- **Phase**: Workflow execution phase (design, implementation, validation, etc.)
- **Parallel Execution**: Agents that can work simultaneously

### Configuration Format

Teams are defined in `teams.json`:

```json
{
  "teams": [
    {
      "id": "feature-team",
      "name": "Feature Implementation Team",
      "description": "Full-cycle feature development",
      "agents": [
        {
          "role_id": "architect",
          "phase": "design",
          "focus": "system architecture"
        },
        {
          "role_id": "developer",
          "phase": "implementation",
          "parallel_with": ["tester"],
          "focus": "core implementation"
        },
        {
          "role_id": "tester",
          "phase": "implementation",
          "focus": "test coverage"
        },
        {
          "role_id": "code-reviewer",
          "phase": "validation"
        }
      ],
      "default_parallel": ["developer", "tester"],
      "approval_required": true,
      "estimated_duration": "3h",
      "metadata": {
        "complexity": "high",
        "team_type": "feature"
      }
    }
  ]
}
```

### Team Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ✅ | Unique team identifier |
| `name` | string | ✅ | Human-readable name |
| `description` | string | ✅ | Team purpose |
| `agents` | TeamAgent[] | ✅ | List of agents |
| `default_parallel` | string[] | ❌ | Default parallel agents |
| `approval_required` | boolean | ❌ | Require approval checkpoints |
| `estimated_duration` | string | ❌ | Expected duration (e.g., "3h") |
| `metadata` | object | ❌ | Custom metadata |

### TeamAgent Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `role_id` | string | ✅ | Agent role ID |
| `phase` | string | ✅ | Workflow phase |
| `focus` | string | ❌ | Specific focus area |
| `parallel_with` | string[] | ❌ | Agents to run in parallel with |

### Usage

```typescript
import { WorkflowEngine } from '@asmo/core'

// Initialize engine
const engine = WorkflowEngine.create(registry)
await engine.initialize()

// Create workflow from team
const workflow = engine.createWorkflowFromTeam(
  'feature-team',           // team ID
  'task-123',               // task ID
  'Implement user auth'     // task description
)

// Execute workflow
const result = await engine.executeWorkflow(workflow)
```

### Example Teams

See [examples/teams/](../examples/teams/) for ready-to-use configurations:
- `feature-team.json` — Full feature development
- `bugfix-team.json` — Quick bug fixes
- `security-team.json` — Security audits
- `tea-team.json` — Test engineering

### Location

Teams are loaded from:
1. `.cursor/config/orchestration/teams.json` (Claude Code)
2. `~/.asmo/config/orchestration/teams.json` (user home)
3. `templates/orchestration/teams.json` (bundled)

**Note**: Teams are **optional**. System works without teams.json using direct workflow selection.

📖 **Full Documentation**: [Teams Configuration](../teams-configuration.md)

---

## Execution Modes

**Phase 3 Feature** — Dynamic execution modes for multi-agent collaboration.

### Overview

ASMO supports three execution modes that determine how agents collaborate during workflow execution:

1. **Sequential** — Agents execute one at a time (default)
2. **Party** — Agents collaborate in parallel with consensus building
3. **Brainstorming** — Structured multi-round brainstorming with ADR

### Sequential Mode (Default)

**When**: Simple to medium complexity tasks (score < 60)

Agents execute workflow steps one by one in sequence:

```
Architect → Developer → Tester → Done
```

**Characteristics**:
- Predictable execution order
- Clear phase boundaries
- Lower token usage
- Faster for simple tasks

### Party Mode

**When**: Complex tasks with multiple patterns detected (score ≥ 60)

Multiple agents work in parallel, discussing and refining solutions:

```
Round 1: Architect + Developer + Tester (parallel)
Round 2: Discussion & refinement
Round 3: Consensus & convergence
```

**Characteristics**:
- Parallel agent execution
- Consensus building through rounds
- Convergence threshold (0.8 default)
- Maximum rounds (5 default)

**Activation**:
```typescript
// Automatically activated by SkillMatcher
if (complexity >= 60 && multiplePatterns) {
  sessionType = 'party'
  maxRounds = 5
  convergenceThreshold = 0.8
}
```

### Brainstorming Mode

**When**: Design and architecture tasks requiring structured exploration

Four-round structured process:

1. **Round 1**: Independent Proposals — Each agent proposes solutions
2. **Round 2**: Cross Critique — Agents review and critique proposals
3. **Round 3**: Synthesis & Voting — Combine best ideas and vote
4. **Round 4**: Final Decision + ADR — Document the chosen approach

**Characteristics**:
- Structured 4-round process
- ADR (Architecture Decision Record) generation
- Design pattern: "design_brainstorming_workflow"
- Explicit pros/cons evaluation

### Mode Selection

Modes are selected automatically by `SkillMatcher.detectSessionType()`:

```typescript
const sessionType = await skillMatcher.detectSessionType(task, complexity)

// Returns:
{
  type: 'party',                 // or 'sequential' or 'brainstorming'
  maxRounds: 5,
  convergenceThreshold: 0.8,
  generateADR: false,
  reasoning: "High complexity with multiple patterns detected"
}
```

### Teams + Execution Modes

Teams and execution modes work **together**:

```typescript
// 1. Create workflow from team (Phase 2)
const workflow = engine.createWorkflowFromTeam('feature-team', taskId, task)

// 2. Execute — mode selected automatically (Phase 3)
const result = await engine.executeWorkflow(workflow)

// → If complexity ≥ 60, team agents work in party mode
// → Otherwise, sequential execution
```

**Example**:
- Team "feature-team" has 4 agents (architect, developer, tester, reviewer)
- Task complexity = 75 → Party mode activated
- Agents from team work in parallel with consensus building

📖 **Full Documentation**: [Execution Modes](../execution-modes.md)

---

## Configuration

### Config Fallback Chain

1. `.cursor/config` — Claude Code environment
2. `~/.asmo/config` — User home directory
3. `node_modules/@asmo/core/templates` — Bundled templates

### Configuration Files

| File | Location | Purpose |
|------|----------|---------|
| `roles/*.json` | `config/roles/` | Agent role definitions |
| `workflows/*.json` | `config/workflows/` | Workflow templates |
| `skills/*/SKILL.md` | `config/skills/` | Skill definitions |
| `teams.json` | `config/orchestration/` | Team configurations (optional) |

### Environment Variables

```bash
# LLM Provider
ANTHROPIC_API_KEY=sk-ant-...     # For API mode
USE_API=false                     # Force API mode (default: auto)

# Features
USE_YAML_SKILLS=true              # Use YAML format
USE_SKILLMD=true                  # Use SKILL.md format

# Modes
ASMO_YOLO_MODE=true               # Auto-approve trivial tasks
ASMO_VERBOSE=true                 # Verbose logging
```

---

## API Reference

### WorkflowEngine

```typescript
import { WorkflowEngine, AgentRegistry } from '@asmo/core'

// Create & initialize
const registry = new AgentRegistry()
const engine = WorkflowEngine.create(registry)
await engine.initialize()

// Execute task with auto-selection
const result = await engine.execute('Add user authentication')

// Create workflow from team
const workflow = engine.createWorkflowFromTeam(
  'feature-team',
  'task-123',
  'Implement payment processing'
)

// Adaptive workflow selection
const selection = await engine.selectWorkflowAdaptively(
  'Optimize database queries',
  { complexityScore: 65 }
)
```

### TeamManager

```typescript
import { getTeamManager } from '@asmo/core'

const teamManager = getTeamManager()
await teamManager.initialize()

// Get team
const team = teamManager.getTeam('feature-team')

// Convert team to workflow steps
const steps = teamManager.teamToSteps('feature-team')

// Get team metrics
const metrics = teamManager.getTeamMetrics('feature-team')
```

### SkillMatcher

```typescript
import { SkillMatcher } from '@asmo/core'

const matcher = new SkillMatcher(skillCatalog, configLoader)

// Match skills to task
const matches = await matcher.matchSkills('Implement OAuth login')

// Detect session type
const sessionType = await matcher.detectSessionType(task, complexity)
// → { type: 'party', maxRounds: 5, ... }
```

---

## See Also

- [Teams Configuration](../teams-configuration.md) — Full Teams API reference
- [Execution Modes](../execution-modes.md) — Party & brainstorming modes
- [Adaptive Phase Detection](../adaptive-phase-detection.md) — Phase joining
- [Context Cascade](../context-cascade.md) — Context management

---

**Last Updated**: February 2026
**Version**: 1.0.0 (Phase 2 + Phase 3 features)
