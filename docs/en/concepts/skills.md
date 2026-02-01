# Skills

Skills are specific capabilities that agents use to accomplish tasks.

## What is a Skill?

A skill defines:
- **Capability** - What the skill does
- **Complexity** - Difficulty level (basic to expert)
- **Requirements** - Other skills or tools needed
- **Time estimate** - Expected execution time

## Skill Categories

AI1st includes **85 skills** across **12 categories**:

| Category | Count | Examples |
|----------|-------|----------|
| 🏗️ Architecture | 7 | System design, ADR creation |
| 👨‍💻 Development | 8 | Code writing, feature implementation |
| 🐛 Debugging | 7 | Bug diagnosis, root cause analysis |
| 🧪 Testing | 8 | Unit testing, E2E testing |
| ⚡ Performance | 8 | Profiling, optimization |
| 🎨 UI/UX Design | 7 | Styling, accessibility |
| 🚀 DevOps | 6 | Deployment, CI/CD |
| 💼 Business | 5 | Requirements, KPIs |
| 🎯 Product | 4 | Strategy, prioritization |
| 📋 Project Management | 4 | Coordination, tracking |
| 📊 Analysis | 4 | BMad analysis |
| ⭐ Superpowers | 5 | Advanced workflows |

## Skill Anatomy

```json
{
  "id": "code_writing",
  "name": "Code Writing",
  "description": "Write production-quality TypeScript code...",
  "category": "development",
  "complexity": "intermediate",
  "requires_skills": ["typescript_expert"],
  "required_mcps": ["filesystem", "context7"],
  "confidence_threshold": 0.8,
  "estimated_time": "30m",
  "composable_with": ["unit_testing", "refactoring"],
  "metadata": {
    "tools": ["typescript", "eslint", "prettier"],
    "difficulty": 6,
    "success_rate": 0.85,
    "aliases": ["coding", "programming"]
  }
}
```

## Complexity Levels

| Level | Difficulty | Example Skills |
|-------|------------|----------------|
| 🟢 Basic | 1-3 | Simple fixes, documentation |
| 🟡 Intermediate | 4-6 | Code writing, testing |
| 🟠 Advanced | 7-8 | Performance optimization |
| 🔴 Expert | 9-10 | Architecture decisions |

## Skill Matching

AI1st automatically matches skills to tasks:

### By Keywords

```typescript
// Task: "Fix the authentication bug"
// Matched skills: bug_diagnosis, root_cause_analysis, hotfix_generation
```

### By Aliases

```typescript
// Task: "Write some unit tests"
// Matches "unit_testing" via alias "unit tests"
```

### By Composition

Skills can be combined for complex tasks:

```typescript
// Task: "Add a new API endpoint"
// Composed skills:
// - architecture_decisions (required by api_design)
// - api_design
// - code_writing
// - unit_testing
```

## Skill Dependencies

Some skills require others:

```
architecture_decisions
         ↓
    adr_creation
         ↓
  technology_evaluation
```

```json
{
  "id": "adr_creation",
  "requires_skills": ["architecture_decisions"]
}
```

## MCP Requirements

Skills may require specific MCP servers:

| Skill | Required MCPs |
|-------|---------------|
| E2E Testing | playwright |
| Deployment | vercel, render |
| Code Writing | filesystem, context7 |

## Using Skills

### In Agent Definitions

```json
{
  "id": "developer",
  "required_skills": [
    "code_writing",
    "typescript_expert",
    "unit_testing"
  ],
  "optional_skills": [
    "refactoring",
    "integration"
  ]
}
```

### In Workflow Triggers

```json
{
  "trigger_condition": {
    "required_skills": [
      "debugging",
      "root_cause_analysis"
    ]
  }
}
```

### Programmatic Access

```typescript
import { SkillMatcher } from '@ai1st/core'

const matcher = new SkillMatcher()
const skills = await matcher.matchSkills(
  'Add OAuth authentication',
  { projectType: 'web-app' }
)

console.log(skills)
// ['authentication', 'security', 'api_design', 'code_writing']
```

## Skill Confidence

Each skill has a confidence threshold (0.0 - 1.0):

```typescript
const match = await matcher.matchSkill('unit_testing', task)
if (match.confidence >= skill.confidence_threshold) {
  // Skill is confidently matched
}
```

## See Also

- [Skills Catalog](../reference/skills/index.md) - Full skill documentation
- [Agents](./agents.md) - How agents use skills
- [Workflows](./workflows.md) - Skills in workflow triggers
