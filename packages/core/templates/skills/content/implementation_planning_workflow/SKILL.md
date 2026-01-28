---
"name": "Implementation Planning Workflow"
"description": "Comprehensive implementation planning workflow from Superpowers.


  Creates detailed bite-sized plans assuming engineer has zero context.


  Use when you have spec/requirements for multi-step task, before touching code.


  Plan Structure:

  - Goal (one sentence)

  - Architecture (2-3 sentences)

  - Tech Stack (key technologies)

  - Tasks broken into 2-5 minute steps


  Bite-Sized Task Granularity:

  Each step is one action (2-5 minutes):

  - \"Write the failing test\" - step

  - \"Run it to verify it fails\" - step

  - \"Implement minimal code to pass\" - step

  - \"Run tests to verify pass\" - step

  - \"Commit\" - step


  Task Structure:

  1. Files (Create/Modify/Test with exact paths)

  2. Step-by-step with code examples

  3. Exact commands with expected output

  4. Commit instructions


  Remember:

  - Exact file paths always

  - Complete code in plan (not \"add validation\")

  - Exact commands with expected output

  - DRY, YAGNI, TDD principles

  - Frequent commits


  Save plans to: docs/plans/YYYY-MM-DD-<feature-name>.md


  Assumptions:

  - Engineer is skilled but knows nothing about our codebase

  - Engineer doesn't know good test design well

  - Provide everything they need


  Execution Handoff:

  After plan, offer:

  1. Subagent-Driven (this session) - fresh subagent per task

  2. Parallel Session (separate) - batch execution


  Full guide with examples: ~/.claude/plugins/cache/claude-plugins-official/superpowers/4.0.3/skills/writing-plans/skill.md

  \ Keywords: writing plans, implementation planning, task planning, development planning"
---

# Implementation Planning Workflow

## Overview

Comprehensive implementation planning workflow from Superpowers.

Creates detailed bite-sized plans assuming engineer has zero context.

Use when you have spec/requirements for multi-step task, before touching code.

Plan Structure:
- Goal (one sentence)
- Architecture (2-3 sentences)
- Tech Stack (key technologies)
- Tasks broken into 2-5 minute steps

Bite-Sized Task Granularity:
Each step is one action (2-5 minutes):
- "Write the failing test" - step
- "Run it to verify it fails" - step
- "Implement minimal code to pass" - step
- "Run tests to verify pass" - step
- "Commit" - step

Task Structure:
1. Files (Create/Modify/Test with exact paths)
2. Step-by-step with code examples
3. Exact commands with expected output
4. Commit instructions

Remember:
- Exact file paths always
- Complete code in plan (not "add validation")
- Exact commands with expected output
- DRY, YAGNI, TDD principles
- Frequent commits

Save plans to: docs/plans/YYYY-MM-DD-<feature-name>.md

Assumptions:
- Engineer is skilled but knows nothing about our codebase
- Engineer doesn't know good test design well
- Provide everything they need

Execution Handoff:
After plan, offer:
1. Subagent-Driven (this session) - fresh subagent per task
2. Parallel Session (separate) - batch execution

Full guide with examples: ~/.claude/plugins/cache/claude-plugins-official/superpowers/4.0.3/skills/writing-plans/skill.md


## Prerequisites

This skill requires:

- **system_design**: Must be available before using this skill
- **task_breakdown**: Must be available before using this skill

## Quick Start

1. Analyze the task
2. Execute the skill
3. Verify the result
## When to Use

Use this skill when:


**Suitable for**: Moderate complexity tasks

## Required Tools

This skill requires access to:

- **filesystem** MCP server

## Works Well With

This skill can be combined with:

- **design_brainstorming_workflow**
- **tdd_workflow**
- **code_writing**

## Examples

See [EXAMPLES.md](references/EXAMPLES.md) for detailed examples.

---

**Metadata:**
- Category: superpowers_workflows
- Complexity: intermediate
- Estimated Time: 1h
- Confidence Threshold: 0.75
- Success Rate: 90%
