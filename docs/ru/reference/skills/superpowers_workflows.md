# ⭐ Суперсилы

7 навыков в этой категории.

## Обзор

| Навык | Сложность | Время | Успешность |
|-------|-----------|-------|------------|
| **Design Brainstorming Workflow** | 🟢 Базовый | 30m | 80% |
| **Dispatching Parallel Agents** | 🟠 Продвинутый | N/A | 80% |
| **Full Feature Lifecycle** | 🔴 Экспертный | 1-2 weeks | 80% |
| **Implementation Planning Workflow** | 🟡 Средний | 1h | 80% |
| **Subagent-Driven Development** | 🟠 Продвинутый | N/A | 80% |
| **Systematic Debugging Workflow** | 🟡 Средний | N/A | 80% |
| **TDD Workflow** | 🟡 Средний | N/A | 80% |


## 🟢 Базовый навыки


### Design Brainstorming Workflow

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

  - Ask: \

| Параметр | Значение |
|----------|----------|
| ID | `design_brainstorming_workflow` |
| Время | 30m |
| Порог уверенности | 0.7 |
| Сложность | 3/10 |






## 🟡 Средний навыки


### Implementation Planning Workflow

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

  - \

| Параметр | Значение |
|----------|----------|
| ID | `implementation_planning_workflow` |
| Время | 1h |
| Порог уверенности | 0.75 |
| Сложность | 6/10 |






### Systematic Debugging Workflow

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

  - Form single hypothesis (\

| Параметр | Значение |
|----------|----------|
| ID | `systematic_debugging_workflow` |
| Время | N/A |
| Порог уверенности | 0.75 |
| Сложность | 6/10 |






### TDD Workflow

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

  \ Keywords: test driven development, tdd, red green refactor, test first development

| Параметр | Значение |
|----------|----------|
| ID | `tdd_workflow` |
| Время | N/A |
| Порог уверенности | 0.75 |
| Сложность | 6/10 |






## 🟠 Продвинутый навыки


### Dispatching Parallel Agents

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

  Task(\

| Параметр | Значение |
|----------|----------|
| ID | `dispatching_parallel_agents` |
| Время | N/A |
| Порог уверенности | 0.8 |
| Сложность | 8/10 |






### Subagent-Driven Development

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

  Implementer: \

| Параметр | Значение |
|----------|----------|
| ID | `subagent_driven_development` |
| Время | N/A |
| Порог уверенности | 0.85 |
| Сложность | 8/10 |






## 🔴 Экспертный навыки


### Full Feature Lifecycle

Complete end-to-end feature development from requirements gathering through deployment and monitoring. Combines requirements analysis, design, planning, implementation, testing, and deployment phases into a cohesive workflow. Use when: implementing complete features from scratch, running full SDLC for new functionality. Keywords: full lifecycle, end-to-end, complete workflow

| Параметр | Значение |
|----------|----------|
| ID | `full_feature_lifecycle` |
| Время | 1-2 weeks |
| Порог уверенности | 0.9 |
| Сложность | 9/10 |






---

[← Назад к каталогу навыков](./index.md)
