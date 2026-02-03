---
"name": "TDD Workflow"
"description": "Test-Driven Development workflow from Superpowers.


  Core principle: Write test first, watch it fail, write minimal code to pass.


  Process (Red-Green-Refactor):

  1. RED - Write failing test

  2. Verify RED - Watch it fail correctly (MANDATORY - never skip)

  3. GREEN - Write minimal code to pass

  4. Verify GREEN - Watch it pass

  5. REFACTOR - Clean up while staying green

  6. Repeat for next feature


  The Iron Law: NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST


  Key rules:

  - If you didn't watch the test fail, you don't know if it tests the right thing

  - Delete code written before tests, start fresh

  - Tests written after code pass immediately - proving nothing

  - No exceptions without human partner permission


  When to use:

  - New features

  - Bug fixes

  - Refactoring

  - Behavior changes


  Exceptions (ask first):

  - Throwaway prototypes

  - Generated code

  - Configuration files


  Good Tests:

  - Minimal - one thing per test

  - Clear name describing behavior

  - Real code (no mocks unless unavoidable)

  - Shows desired API


  Why order matters:

  - Tests-after pass immediately → prove nothing

  - Tests-first force you to see failure → prove test works

  - Tests-after biased by implementation

  - Tests-first discover edge cases


  Full guide with examples: ~/.claude/plugins/cache/claude-plugins-official/superpowers/4.0.3/skills/test-driven-development/skill.md

  \ Keywords: test driven development, tdd, red green refactor, test first development"
---

# TDD Workflow

## Overview

Test-Driven Development workflow from Superpowers.

Core principle: Write test first, watch it fail, write minimal code to pass.

Process (Red-Green-Refactor):
1. RED - Write failing test
2. Verify RED - Watch it fail correctly (MANDATORY - never skip)
3. GREEN - Write minimal code to pass
4. Verify GREEN - Watch it pass
5. REFACTOR - Clean up while staying green
6. Repeat for next feature

The Iron Law: NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST

Key rules:
- If you didn't watch the test fail, you don't know if it tests the right thing
- Delete code written before tests, start fresh
- Tests written after code pass immediately - proving nothing
- No exceptions without human partner permission

When to use:
- New features
- Bug fixes
- Refactoring
- Behavior changes

Exceptions (ask first):
- Throwaway prototypes
- Generated code
- Configuration files

Good Tests:
- Minimal - one thing per test
- Clear name describing behavior
- Real code (no mocks unless unavoidable)
- Shows desired API

Why order matters:
- Tests-after pass immediately → prove nothing
- Tests-first force you to see failure → prove test works
- Tests-after biased by implementation
- Tests-first discover edge cases

Full guide with examples: ~/.claude/plugins/cache/claude-plugins-official/superpowers/4.0.3/skills/test-driven-development/skill.md


## Prerequisites

This skill requires:

- **unit_testing**: Must be available before using this skill
- **typescript_expert**: Must be available before using this skill

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

- **code_writing**
- **refactoring**
- **bug_diagnosis**

## Examples

See [EXAMPLES.md](references/EXAMPLES.md) for detailed examples.

---

**Metadata:**
- Category: superpowers_workflows
- Complexity: intermediate
- Estimated Time: N/A
- Confidence Threshold: 0.75
- Success Rate: 90%
