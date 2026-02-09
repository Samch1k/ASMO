# Phase 1: Документация и анализ - План выполнения

## Цель фазы
Понять текущее состояние ASMO через метрики и создать foundation для принятия решений об упрощении.

## Задачи фазы

### Task #15: CLI tool `asmo stats` ⏱️ 2-3 часа
**Статус:** In Progress
**Приоритет:** P0 (блокирует #5)

**Подзадачи:**
1. [ ] Создать `packages/cli/src/commands/stats.ts`
2. [ ] Реализовать анализ skills usage:
   - Grep по roles JSON (required_skills, optional_skills)
   - Grep по workflow definitions
   - Подсчет references
3. [ ] Реализовать анализ workflows:
   - Парсинг workflow directories
   - Подсчет agents per workflow
   - Dependencies (если есть в metadata)
4. [ ] Реализовать анализ agents:
   - Парсинг roles JSON
   - Подсчет skills per agent
   - Категоризация (core/specialized/validation)
5. [ ] CLI interface с chalk formatting
6. [ ] Тесты для stats command
7. [ ] Документация в README

**Acceptance Criteria:**
- [ ] `asmo stats --type skills` показывает usage matrix
- [ ] `asmo stats --type workflows` показывает список с метаданными
- [ ] `asmo stats --type agents` показывает категоризацию
- [ ] `asmo stats --format json` работает для automation
- [ ] Код покрыт тестами (≥80%)

---

### Task #5: Skills usage audit ⏱️ 1-2 часа
**Статус:** Pending (blocked by #15)
**Приоритет:** P0

**Подзадачи:**
1. [ ] Запустить `asmo stats --type skills --format csv > skills-audit.csv`
2. [ ] Анализ results:
   - Категоризация: core (3+ refs) | moderate (1-2) | rare (0)
   - Поиск дублирующихся skills (похожие названия/описания)
   - Проверка MeetConnect-related skills для удаления
3. [ ] Создать recommendations document:
   - Skills to keep (core)
   - Skills to merge (duplicates)
   - Skills to remove (rare + MeetConnect)
4. [ ] Target: 92 → 60 skills

**Acceptance Criteria:**
- [ ] CSV файл с usage matrix
- [ ] Markdown документ с recommendations
- [ ] Четкий список: keep / merge / remove

---

### Task #12: Context Cascade documentation ⏱️ 1.5 часа
**Статус:** Pending (blocked by #5)
**Приоритет:** P1

**Подзадачи:**
1. [ ] Изучить `context-cascade.ts` implementation
2. [ ] Проверить workflow dependencies в коде
3. [ ] Создать `packages/core/docs/context-cascade.md`:
   - Концепция и архитектура
   - Dependency graph (Mermaid diagram)
   - Практические примеры (3-4 use cases)
   - Troubleshooting guide
4. [ ] Обновить PRD: ссылка на детальную документацию

**Acceptance Criteria:**
- [ ] Документ с примерами кода
- [ ] Визуальная диаграмма dependencies
- [ ] Troubleshooting section

---

### Task #7: SDLC Coverage Map + Decision Tree ⏱️ 2 часа
**Статус:** Pending (blocked by #5)
**Приоритет:** P1

**Подзадачи:**
1. [ ] Категоризация workflows по SDLC фазам (используя skills audit)
2. [ ] Создать `docs/workflows/sdlc-map.md`:
   - Mermaid diagram: Discovery → Planning → Implementation → Quality → Ops → Retro
   - Workflow mapping к фазам
   - Workflow relationships matrix
3. [ ] Создать `docs/workflows/decision-tree.md`:
   - Interactive logic для выбора workflow
   - Примеры: Bug? → complexity? → bug-fix
   - CLI integration idea: `asmo suggest-workflow`
4. [ ] Визуализация в ASCII/Mermaid

**Acceptance Criteria:**
- [ ] Visual SDLC map
- [ ] Decision tree с примерами
- [ ] Документация linked from main docs

---

### Task #13: Performance benchmarks ⏱️ 1.5 часа
**Статус:** Pending (можно параллельно)
**Приоритет:** P2

**Подзадачи:**
1. [ ] Создать `packages/core/tests/benchmarks/` directory
2. [ ] Benchmark scripts:
   - ComplexityAnalyzer: 10 tasks разной сложности
   - WorkflowSelector: selection speed
   - Sample workflows: quick-flow, feature-dev, etc.
3. [ ] Измерение:
   - Execution time
   - LLM calls count
   - Session vs API timing
4. [ ] Создать `docs/benchmarks/performance.md`
5. [ ] Сравнение с NFR-1 targets из PRD

**Acceptance Criteria:**
- [ ] Benchmark results table
- [ ] Comparison с PRD targets
- [ ] Recommendations (если есть gaps)

---

## Execution Order

```
START
  ↓
#15 (asmo stats CLI) [2-3h]
  ↓
#5 (Skills audit) [1-2h]
  ↓ (parallel split)
  ├─→ #12 (Context Cascade docs) [1.5h]
  ├─→ #7 (SDLC Map) [2h]
  └─→ #13 (Benchmarks) [1.5h] — можно параллельно
  ↓
Phase 1 Review & Verification
  ↓
Phase 2 Planning
```

## Phase 1 Deliverables

✅ **Tools:**
- CLI command: `asmo stats`

✅ **Analysis:**
- Skills usage matrix (CSV + recommendations)
- Performance benchmarks results

✅ **Documentation:**
- Context Cascade guide
- SDLC Coverage Map
- Workflow Decision Tree

## Success Criteria для Phase 1

- [ ] `asmo stats` работает и дает полезные данные
- [ ] Четкое понимание, какие skills удалять/объединять
- [ ] Visual guides для workflow navigation
- [ ] Performance baseline установлен
- [ ] Все docs peer-reviewed и accurate

## Estimated Timeline

- **Optimistic:** 6 часов (1 рабочий день)
- **Realistic:** 8-9 часов (1.5 дня)
- **Pessimistic:** 12 часов (2 дня, если найдем issues)

---

**Status:** Planning Complete ✅
**Next Action:** Begin Task #15 (asmo stats CLI)
