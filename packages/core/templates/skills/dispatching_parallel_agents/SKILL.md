---
"name": "Dispatching Parallel Agents"
"description": "Распределение независимых задач на параллельных агентов из Superpowers.


  Core principle: Dispatch one agent per independent problem domain. Let them work concurrently.


  ## Когда использовать


  ✅ Используй когда:

  - 2+ независимые задачи без shared state

  - Каждая задача может быть понята без контекста других

  - 3+ упавших теста в разных файлах

  - Разные подсистемы сломаны независимо

  - Нет последовательных зависимостей


  ❌ НЕ используй когда:

  - Баги связаны (fix одного может fix других)

  - Нужно понять полное состояние системы

  - Агенты будут мешать друг другу (редактируют одни файлы)


  ## The Pattern


  ### 1. Identify Independent Domains

  Группировка багов по подсистемам:

  - File A tests: Tool approval flow

  - File B tests: Batch completion behavior

  - File C tests: Abort functionality


  ### 2. Create Focused Agent Tasks

  Каждый агент получает:

  - **Specific scope**: Одна подзадача/файл

  - **Clear goal**: Конкретный результат (make these tests pass)

  - **Constraints**: Ограничения (don't change other code)

  - **Expected output**: Summary of what you found and fixed


  ### 3. Dispatch in Parallel

  ```typescript

  // В Claude Code / AI среде

  Task(\"Fix agent-tool-abort.test.ts failures\")

  Task(\"Fix batch-completion-behavior.test.ts failures\")

  Task(\"Fix tool-approval-race-conditions.test.ts failures\")

  // Все 3 агента работают одновременно

  ```


  ### 4. Review and Integrate

  Когда агенты вернулись:

  - Прочитать резюме каждого

  - Проверить конфликты (did agents edit same code?)

  - Запустить полный test suite

  - Интегрировать все изменения


  ## Agent Prompt Structure


  Хороший промпт для агента:

  1. **Focused** - Одна четкая проблема

  2. **Self-contained** - Весь контекст для понимания проблемы

  3. **Specific about output** - Что агент должен вернуть?


  Пример:

  ```markdown

  Fix the 3 failing tests in src/agents/agent-tool-abort.test.ts:


  1. \"should abort tool with partial output capture\"

  2. \"should handle mixed completed and aborted tools\"

  3. \"should properly track pendingToolCount\"


  Your task:

  1. Read test file and understand what each test verifies

  2. Identify root cause - timing issues or actual bugs?

  3. Fix by replacing timeouts with event-based waiting

  4. Do NOT just increase timeouts - find the real issue


  Return: Summary of what you found and what you fixed.

  ```


  ## Key Benefits


  1. **Parallelization** - Несколько расследований одновременно

  2. **Focus** - Каждый агент имеет узкую область, меньше контекста

  3. **Independence** - Агенты не мешают друг другу

  4. **Speed** - 3 проблемы решаются за время 1


  ## Common Mistakes


  ❌ Too broad: \"Fix all the tests\" - агент заблудится

  ✅ Specific: \"Fix agent-tool-abort.test.ts\" - focused scope


  ❌ No context: \"Fix the race condition\" - агент не знает где

  ✅ Context: Вставить error messages и test names


  ❌ No constraints: Агент может все refactor

  ✅ Constraints: \"Do NOT change production code\" or \"Fix tests only\"


  ❌ Vague output: \"Fix it\" - ты не знаешь что изменилось

  ✅ Specific: \"Return summary of root cause and changes\"


  ## Verification After Agents Return


  1. **Review each summary** - Понять что изменилось

  2. **Check for conflicts** - Агенты редактировали один код?

  3. **Run full suite** - Проверить что все fixes работают вместе

  4. **Spot check** - Агенты могут делать systematic errors


  ## Real-World Impact


  From debugging session (2025-10-03):

  - 6 failures across 3 files

  - 3 agents dispatched in parallel

  - All investigations completed concurrently

  - All fixes integrated successfully

  - Zero conflicts between agent changes

  - **Time saved**: 3 problems in parallel vs sequentially


  Full guide: ~/.claude/plugins/.../dispatching-parallel-agents/skill.md

  \ Use when: performing relevant tasks. Keywords: parallel agents, parallel debugging, concurrent agents, dispatch agents"
---

# Dispatching Parallel Agents

## Overview

Распределение независимых задач на параллельных агентов из Superpowers.

Core principle: Dispatch one agent per independent problem domain. Let them work concurrently.

## Когда использовать

✅ Используй когда:
- 2+ независимые задачи без shared state
- Каждая задача может быть понята без контекста других
- 3+ упавших теста в разных файлах
- Разные подсистемы сломаны независимо
- Нет последовательных зависимостей

❌ НЕ используй когда:
- Баги связаны (fix одного может fix других)
- Нужно понять полное состояние системы
- Агенты будут мешать друг другу (редактируют одни файлы)

## The Pattern

### 1. Identify Independent Domains
Группировка багов по подсистемам:
- File A tests: Tool approval flow
- File B tests: Batch completion behavior
- File C tests: Abort functionality

### 2. Create Focused Agent Tasks
Каждый агент получает:
- **Specific scope**: Одна подзадача/файл
- **Clear goal**: Конкретный результат (make these tests pass)
- **Constraints**: Ограничения (don't change other code)
- **Expected output**: Summary of what you found and fixed

### 3. Dispatch in Parallel
```typescript
// В Claude Code / AI среде
Task("Fix agent-tool-abort.test.ts failures")
Task("Fix batch-completion-behavior.test.ts failures")
Task("Fix tool-approval-race-conditions.test.ts failures")
// Все 3 агента работают одновременно
```

### 4. Review and Integrate
Когда агенты вернулись:
- Прочитать резюме каждого
- Проверить конфликты (did agents edit same code?)
- Запустить полный test suite
- Интегрировать все изменения

## Agent Prompt Structure

Хороший промпт для агента:
1. **Focused** - Одна четкая проблема
2. **Self-contained** - Весь контекст для понимания проблемы
3. **Specific about output** - Что агент должен вернуть?

Пример:
```markdown
Fix the 3 failing tests in src/agents/agent-tool-abort.test.ts:

1. "should abort tool with partial output capture"
2. "should handle mixed completed and aborted tools"
3. "should properly track pendingToolCount"

Your task:
1. Read test file and understand what each test verifies
2. Identify root cause - timing issues or actual bugs?
3. Fix by replacing timeouts with event-based waiting
4. Do NOT just increase timeouts - find the real issue

Return: Summary of what you found and what you fixed.
```

## Key Benefits

1. **Parallelization** - Несколько расследований одновременно
2. **Focus** - Каждый агент имеет узкую область, меньше контекста
3. **Independence** - Агенты не мешают друг другу
4. **Speed** - 3 проблемы решаются за время 1

## Common Mistakes

❌ Too broad: "Fix all the tests" - агент заблудится
✅ Specific: "Fix agent-tool-abort.test.ts" - focused scope

❌ No context: "Fix the race condition" - агент не знает где
✅ Context: Вставить error messages и test names

❌ No constraints: Агент может все refactor
✅ Constraints: "Do NOT change production code" or "Fix tests only"

❌ Vague output: "Fix it" - ты не знаешь что изменилось
✅ Specific: "Return summary of root cause and changes"

## Verification After Agents Return

1. **Review each summary** - Понять что изменилось
2. **Check for conflicts** - Агенты редактировали один код?
3. **Run full suite** - Проверить что все fixes работают вместе
4. **Spot check** - Агенты могут делать systematic errors

## Real-World Impact

From debugging session (2025-10-03):
- 6 failures across 3 files
- 3 agents dispatched in parallel
- All investigations completed concurrently
- All fixes integrated successfully
- Zero conflicts between agent changes
- **Time saved**: 3 problems in parallel vs sequentially

Full guide: ~/.claude/plugins/.../dispatching-parallel-agents/skill.md


## Prerequisites

This skill requires:

- **task_decomposition**: Must be available before using this skill
- **parallel_coordination**: Must be available before using this skill
- **conflict_resolution**: Must be available before using this skill

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
- Confidence Threshold: 0.8
- Success Rate: 85%
