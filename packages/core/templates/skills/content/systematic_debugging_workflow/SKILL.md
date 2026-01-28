---
"name": "Systematic Debugging Workflow"
"description": "4-phase systematic debugging process from Superpowers.


  Core principle: ALWAYS find root cause before attempting fixes. Symptom fixes are failure.


  The Iron Law: NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST


  The Four Phases (must complete each before next):


  Phase 1: Root Cause Investigation

  - Read error messages carefully (don't skip)

  - Reproduce consistently

  - Check recent changes (git diff, commits)

  - Gather evidence in multi-component systems

  - Trace data flow backward


  Phase 2: Pattern Analysis

  - Find working examples in codebase

  - Compare against references

  - Identify differences

  - Understand dependencies


  Phase 3: Hypothesis and Testing

  - Form single hypothesis (\"I think X because Y\")

  - Test minimally (smallest possible change)

  - Verify before continuing

  - Don't know? Say \"I don't understand X\"


  Phase 4: Implementation

  - Create failing test case first

  - Implement single fix addressing root cause

  - Verify fix works

  - If 3+ fixes failed → STOP, question architecture


  When to use:

  - ANY technical issue

  - Test failures

  - Bugs in production

  - Unexpected behavior

  - Build/integration issues

  - Especially when under time pressure


  Red Flags - STOP and follow process:

  - \"Quick fix for now\"

  - \"Just try changing X\"

  - \"Skip the test, verify manually\"

  - \"One more fix attempt\" (after 2+)

  - Each fix reveals new problem


  Full guide with examples: ~/.claude/plugins/cache/claude-plugins-official/superpowers/4.0.3/skills/systematic-debugging/skill.md

  \ Keywords: systematic debugging, root cause debugging, 4 phase debugging, debugging workflow"
---

# Systematic Debugging Workflow

## Overview

4-phase systematic debugging process from Superpowers.

Core principle: ALWAYS find root cause before attempting fixes. Symptom fixes are failure.

The Iron Law: NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST

The Four Phases (must complete each before next):

Phase 1: Root Cause Investigation
- Read error messages carefully (don't skip)
- Reproduce consistently
- Check recent changes (git diff, commits)
- Gather evidence in multi-component systems
- Trace data flow backward

Phase 2: Pattern Analysis
- Find working examples in codebase
- Compare against references
- Identify differences
- Understand dependencies

Phase 3: Hypothesis and Testing
- Form single hypothesis ("I think X because Y")
- Test minimally (smallest possible change)
- Verify before continuing
- Don't know? Say "I don't understand X"

Phase 4: Implementation
- Create failing test case first
- Implement single fix addressing root cause
- Verify fix works
- If 3+ fixes failed → STOP, question architecture

When to use:
- ANY technical issue
- Test failures
- Bugs in production
- Unexpected behavior
- Build/integration issues
- Especially when under time pressure

Red Flags - STOP and follow process:
- "Quick fix for now"
- "Just try changing X"
- "Skip the test, verify manually"
- "One more fix attempt" (after 2+)
- Each fix reveals new problem

Full guide with examples: ~/.claude/plugins/cache/claude-plugins-official/superpowers/4.0.3/skills/systematic-debugging/skill.md


## Prerequisites

This skill requires:

- **bug_diagnosis**: Must be available before using this skill
- **root_cause_analysis**: Must be available before using this skill

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

- **tdd_workflow**
- **code_review**
- **integration_testing**

## Examples

See [EXAMPLES.md](references/EXAMPLES.md) for detailed examples.

---

**Metadata:**
- Category: superpowers_workflows
- Complexity: intermediate
- Estimated Time: N/A
- Confidence Threshold: 0.75
- Success Rate: 95%
