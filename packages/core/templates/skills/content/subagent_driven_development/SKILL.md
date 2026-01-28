---
"name": "Subagent-Driven Development"
"description": "Выполнение implementation plan через dispatch fresh subagent per task из Superpowers.


  Core principle: Fresh subagent per task + two-stage review (spec then quality) = high quality, fast iteration


  ## Когда использовать


  ✅ Используй когда:

  - Есть implementation plan

  - Задачи в основном независимые

  - Хочешь остаться в текущей сессии (не переключаться)


  ❌ НЕ используй когда:

  - Нет плана (сначала brainstorm)

  - Задачи тесно связаны (tight coupling)

  - Нужна работа в параллельной сессии (используй executing-plans)


  ## The Process


  ### Для каждой задачи:


  1. **Dispatch implementer subagent**

  \   - Дать полный текст задачи + контекст

  \   - Implementer может задавать вопросы

  \   - Implementer реализует, тестирует, коммитит, делает self-review


  2. **Dispatch spec compliance reviewer subagent**

  \   - Проверяет: код соответствует спецификации?

  \   - ❌ Если нет → implementer fixes → review again

  \   - ✅ Если да → переходим к code quality


  3. **Dispatch code quality reviewer subagent**

  \   - Проверяет: код хорошо написан?

  \   - ❌ Если нет → implementer fixes → review again

  \   - ✅ Если да → task complete


  4. **Mark task complete in TodoWrite**


  ### После всех задач:


  5. **Dispatch final code reviewer** для всей имплементации

  6. **Use superpowers:finishing-a-development-branch**


  ## Workflow Flow


  ```

  Read plan → Extract all tasks → Create TodoWrite


  ↓


  For each task:

  \  Dispatch implementer → Questions? → Answer → Implement

  \  ↓

  \  Spec compliance review → Issues? → Fix → Re-review

  \  ↓

  \  Code quality review → Issues? → Fix → Re-review

  \  ↓

  \  Mark complete


  ↓


  Final code review → Finishing branch workflow

  ```


  ## Example Workflow


  ```

  Task 1: Hook installation script


  [Dispatch implementation subagent]

  Implementer: \"Should hook be user or system level?\"

  You: \"User level (~/.config/superpowers/hooks/)\"


  Implementer:

  \  - Implemented install-hook command

  \  - Added tests, 5/5 passing

  \  - Self-review: Found missed --force flag, added it

  \  - Committed


  [Dispatch spec compliance reviewer]

  Spec reviewer: ✅ Spec compliant - all requirements met


  [Dispatch code quality reviewer]

  Code reviewer: Strengths: Good test coverage. Issues: None. ✅ Approved


  [Mark Task 1 complete]


  Task 2: Recovery modes


  [Dispatch implementation subagent]

  Implementer:

  \  - Added verify/repair modes

  \  - 8/8 tests passing

  \  - Committed


  [Dispatch spec compliance reviewer]

  Spec reviewer: ❌ Issues:

  \  - Missing: Progress reporting (spec says \"report every 100 items\")

  \  - Extra: Added --json flag (not requested)


  [Implementer fixes issues]

  Implementer: Removed --json flag, added progress reporting


  [Spec reviewer re-reviews]

  Spec reviewer: ✅ Spec compliant now


  [Dispatch code quality reviewer]

  Code reviewer: Issues (Important): Magic number (100)


  [Implementer fixes]

  Implementer: Extracted PROGRESS_INTERVAL constant


  [Code reviewer re-reviews]

  Code reviewer: ✅ Approved


  [Mark Task 2 complete]

  ```


  ## Advantages


  ### vs. Manual execution:

  - Subagents follow TDD naturally

  - Fresh context per task (no confusion)

  - Parallel-safe (subagents don't interfere)

  - Subagent can ask questions (before AND during work)


  ### vs. Executing Plans:

  - Same session (no handoff)

  - Continuous progress (no waiting)

  - Review checkpoints automatic


  ### Efficiency gains:

  - No file reading overhead (controller provides full text)

  - Controller curates exactly what context is needed

  - Subagent gets complete information upfront

  - Questions surfaced before work begins (not after)


  ### Quality gates:

  - Self-review catches issues before handoff

  - Two-stage review: spec compliance, then code quality

  - Review loops ensure fixes actually work

  - Spec compliance prevents over/under-building

  - Code quality ensures implementation is well-built


  ## Red Flags - NEVER DO THIS


  ❌ **Never:**

  - Skip reviews (spec compliance OR code quality)

  - Proceed with unfixed issues

  - Dispatch multiple implementation subagents in parallel (conflicts)

  - Make subagent read plan file (provide full text instead)

  - Skip scene-setting context (subagent needs to understand)

  - Ignore subagent questions (answer before letting them proceed)

  - Accept \"close enough\" on spec compliance (not done = not done)

  - Skip review loops (reviewer found issues = fix + re-review)

  - Let self-review replace actual review (both are needed)

  - **Start code quality review before spec compliance is ✅** (wrong order!)

  - Move to next task while either review has open issues


  ❌ **If subagent asks questions:**

  - Answer clearly and completely

  - Provide additional context if needed

  - Don't rush them into implementation


  ❌ **If reviewer finds issues:**

  - Implementer (same subagent) fixes them

  - Reviewer reviews again

  - Repeat until approved

  - Don't skip the re-review


  ❌ **If subagent fails task:**

  - Dispatch fix subagent with specific instructions

  - Don't try to fix manually (context pollution)


  ## Integration


  **Required workflow skills:**

  - **superpowers:writing-plans** - Creates the plan this skill executes

  - **superpowers:requesting-code-review** - Code review template

  - **superpowers:finishing-a-development-branch** - Complete development


  **Subagents should use:**

  - **superpowers:test-driven-development** - TDD for each task


  **Alternative workflow:**

  - **superpowers:executing-plans** - For parallel session execution


  Full guide: ~/.claude/plugins/.../subagent-driven-development/skill.md

  \ Use when: performing relevant tasks. Keywords: subagent driven dev, subagent development, fresh context per task, two stage review"
---

# Subagent-Driven Development

## Overview

Выполнение implementation plan через dispatch fresh subagent per task из Superpowers.

Core principle: Fresh subagent per task + two-stage review (spec then quality) = high quality, fast iteration

## Когда использовать

✅ Используй когда:
- Есть implementation plan
- Задачи в основном независимые
- Хочешь остаться в текущей сессии (не переключаться)

❌ НЕ используй когда:
- Нет плана (сначала brainstorm)
- Задачи тесно связаны (tight coupling)
- Нужна работа в параллельной сессии (используй executing-plans)

## The Process

### Для каждой задачи:

1. **Dispatch implementer subagent**
   - Дать полный текст задачи + контекст
   - Implementer может задавать вопросы
   - Implementer реализует, тестирует, коммитит, делает self-review

2. **Dispatch spec compliance reviewer subagent**
   - Проверяет: код соответствует спецификации?
   - ❌ Если нет → implementer fixes → review again
   - ✅ Если да → переходим к code quality

3. **Dispatch code quality reviewer subagent**
   - Проверяет: код хорошо написан?
   - ❌ Если нет → implementer fixes → review again
   - ✅ Если да → task complete

4. **Mark task complete in TodoWrite**

### После всех задач:

5. **Dispatch final code reviewer** для всей имплементации
6. **Use superpowers:finishing-a-development-branch**

## Workflow Flow

```
Read plan → Extract all tasks → Create TodoWrite

↓

For each task:
  Dispatch implementer → Questions? → Answer → Implement
  ↓
  Spec compliance review → Issues? → Fix → Re-review
  ↓
  Code quality review → Issues? → Fix → Re-review
  ↓
  Mark complete

↓

Final code review → Finishing branch workflow
```

## Example Workflow

```
Task 1: Hook installation script

[Dispatch implementation subagent]
Implementer: "Should hook be user or system level?"
You: "User level (~/.config/superpowers/hooks/)"

Implementer:
  - Implemented install-hook command
  - Added tests, 5/5 passing
  - Self-review: Found missed --force flag, added it
  - Committed

[Dispatch spec compliance reviewer]
Spec reviewer: ✅ Spec compliant - all requirements met

[Dispatch code quality reviewer]
Code reviewer: Strengths: Good test coverage. Issues: None. ✅ Approved

[Mark Task 1 complete]

Task 2: Recovery modes

[Dispatch implementation subagent]
Implementer:
  - Added verify/repair modes
  - 8/8 tests passing
  - Committed

[Dispatch spec compliance reviewer]
Spec reviewer: ❌ Issues:
  - Missing: Progress reporting (spec says "report every 100 items")
  - Extra: Added --json flag (not requested)

[Implementer fixes issues]
Implementer: Removed --json flag, added progress reporting

[Spec reviewer re-reviews]
Spec reviewer: ✅ Spec compliant now

[Dispatch code quality reviewer]
Code reviewer: Issues (Important): Magic number (100)

[Implementer fixes]
Implementer: Extracted PROGRESS_INTERVAL constant

[Code reviewer re-reviews]
Code reviewer: ✅ Approved

[Mark Task 2 complete]
```

## Advantages

### vs. Manual execution:
- Subagents follow TDD naturally
- Fresh context per task (no confusion)
- Parallel-safe (subagents don't interfere)
- Subagent can ask questions (before AND during work)

### vs. Executing Plans:
- Same session (no handoff)
- Continuous progress (no waiting)
- Review checkpoints automatic

### Efficiency gains:
- No file reading overhead (controller provides full text)
- Controller curates exactly what context is needed
- Subagent gets complete information upfront
- Questions surfaced before work begins (not after)

### Quality gates:
- Self-review catches issues before handoff
- Two-stage review: spec compliance, then code quality
- Review loops ensure fixes actually work
- Spec compliance prevents over/under-building
- Code quality ensures implementation is well-built

## Red Flags - NEVER DO THIS

❌ **Never:**
- Skip reviews (spec compliance OR code quality)
- Proceed with unfixed issues
- Dispatch multiple implementation subagents in parallel (conflicts)
- Make subagent read plan file (provide full text instead)
- Skip scene-setting context (subagent needs to understand)
- Ignore subagent questions (answer before letting them proceed)
- Accept "close enough" on spec compliance (not done = not done)
- Skip review loops (reviewer found issues = fix + re-review)
- Let self-review replace actual review (both are needed)
- **Start code quality review before spec compliance is ✅** (wrong order!)
- Move to next task while either review has open issues

❌ **If subagent asks questions:**
- Answer clearly and completely
- Provide additional context if needed
- Don't rush them into implementation

❌ **If reviewer finds issues:**
- Implementer (same subagent) fixes them
- Reviewer reviews again
- Repeat until approved
- Don't skip the re-review

❌ **If subagent fails task:**
- Dispatch fix subagent with specific instructions
- Don't try to fix manually (context pollution)

## Integration

**Required workflow skills:**
- **superpowers:writing-plans** - Creates the plan this skill executes
- **superpowers:requesting-code-review** - Code review template
- **superpowers:finishing-a-development-branch** - Complete development

**Subagents should use:**
- **superpowers:test-driven-development** - TDD for each task

**Alternative workflow:**
- **superpowers:executing-plans** - For parallel session execution

Full guide: ~/.claude/plugins/.../subagent-driven-development/skill.md


## Prerequisites

This skill requires:

- **implementation_planning_workflow**: Must be available before using this skill
- **tdd_workflow**: Must be available before using this skill
- **code_review_workflow**: Must be available before using this skill

## Quick Start

1. Analyze the task
2. Execute the skill
3. Verify the result
## When to Use

Use this skill when:


**Suitable for**: Complex scenarios requiring expertise

## Required Tools

This skill requires access to:

- **filesystem** MCP server

## Advanced Features

See [ADVANCED.md](references/ADVANCED.md) for:

- Complex scenarios
- Best practices
- Troubleshooting

## Examples

See [EXAMPLES.md](references/EXAMPLES.md) for detailed examples.

---

**Metadata:**
- Category: superpowers_workflows
- Complexity: advanced
- Estimated Time: N/A
- Confidence Threshold: 0.85
- Success Rate: 90%
