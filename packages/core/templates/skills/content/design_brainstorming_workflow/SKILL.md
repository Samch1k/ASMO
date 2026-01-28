---
"name": "Design Brainstorming Workflow"
"description": "Collaborative design refinement workflow from Superpowers.


  Turns ideas into fully formed designs through natural dialogue.


  Use before any creative work:

  - Creating features

  - Building components

  - Adding functionality

  - Modifying behavior


  The Process:


  1. Understanding the idea:

  - Check current project state (files, docs, commits)

  - Ask questions one at a time to refine idea

  - Prefer multiple choice when possible

  - Focus on: purpose, constraints, success criteria


  2. Exploring approaches:

  - Propose 2-3 different approaches with trade-offs

  - Present conversationally with recommendation and reasoning

  - Lead with recommended option, explain why


  3. Presenting the design:

  - Once understood, present design in sections (200-300 words)

  - Ask after each section if it looks right

  - Cover: architecture, components, data flow, errors, testing

  - Be ready to go back and clarify


  After the Design:

  - Write to docs/plans/YYYY-MM-DD-<topic>-design.md

  - Commit design document

  - Ask: \"Ready for implementation?\"

  - Use writing-plans workflow for implementation plan


  Key Principles:

  - One question at a time (don't overwhelm)

  - Multiple choice preferred (easier to answer)

  - YAGNI ruthlessly (remove unnecessary features)

  - Explore alternatives (2-3 approaches)

  - Incremental validation (validate each section)

  - Be flexible (go back when unclear)


  Full guide: ~/.claude/plugins/cache/claude-plugins-official/superpowers/4.0.3/skills/brainstorming/skill.md

  \ Use when: performing relevant tasks. Keywords: brainstorming, design ideation, collaborative design, design refinement"
---

# Design Brainstorming Workflow

## Overview

Collaborative design refinement workflow from Superpowers.

Turns ideas into fully formed designs through natural dialogue.

Use before any creative work:
- Creating features
- Building components
- Adding functionality
- Modifying behavior

The Process:

1. Understanding the idea:
- Check current project state (files, docs, commits)
- Ask questions one at a time to refine idea
- Prefer multiple choice when possible
- Focus on: purpose, constraints, success criteria

2. Exploring approaches:
- Propose 2-3 different approaches with trade-offs
- Present conversationally with recommendation and reasoning
- Lead with recommended option, explain why

3. Presenting the design:
- Once understood, present design in sections (200-300 words)
- Ask after each section if it looks right
- Cover: architecture, components, data flow, errors, testing
- Be ready to go back and clarify

After the Design:
- Write to docs/plans/YYYY-MM-DD-<topic>-design.md
- Commit design document
- Ask: "Ready for implementation?"
- Use writing-plans workflow for implementation plan

Key Principles:
- One question at a time (don't overwhelm)
- Multiple choice preferred (easier to answer)
- YAGNI ruthlessly (remove unnecessary features)
- Explore alternatives (2-3 approaches)
- Incremental validation (validate each section)
- Be flexible (go back when unclear)

Full guide: ~/.claude/plugins/cache/claude-plugins-official/superpowers/4.0.3/skills/brainstorming/skill.md


## Prerequisites

This skill requires:

- **system_design**: Must be available before using this skill
- **user_research**: Must be available before using this skill

## Quick Start

1. Analyze the task
2. Execute the skill
3. Verify the result
## When to Use

Use this skill when:


**Suitable for**: Straightforward tasks

## Required Tools

This skill requires access to:

- **filesystem** MCP server

## Works Well With

This skill can be combined with:

- **implementation_planning_workflow**
- **user_research**
- **requirements_analysis**

## Examples

See [EXAMPLES.md](references/EXAMPLES.md) for detailed examples.

---

**Metadata:**
- Category: superpowers_workflows
- Complexity: basic
- Estimated Time: 30m
- Confidence Threshold: 0.7
- Success Rate: 85%
