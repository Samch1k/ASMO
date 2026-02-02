# BMAD Implementation - Quick Start

**Дата**: 2026-02-02
**Статус**: Ready to start
**Execution mode**: Sequential (по фазам)

---

## 🚀 Быстрый старт

### Вариант 1: Запуск через ASMO CLI

```bash
# Находясь в корне проекта ASMO
asmo run "Реализовать интеграцию BMAD методологии согласно плану в .asmo/prompts/bmad-implementation-agent-prompt.md"
```

### Вариант 2: Запуск через Claude Code

Скопируй и вставь в Claude Code:

```
Ты - Implementation Agent. Твоя задача - реализовать интеграцию BMAD методологии в ASMO.

План: /Users/aliaksandrsmolka/.claude/plans/quirky-conjuring-unicorn-updated.md
Промпт: /Users/aliaksandrsmolka/ASMO/.asmo/prompts/bmad-implementation-agent-prompt.md

Прочитай оба файла и начни реализацию с Фазы 1, День 1: MenuCommandRouter.

КРИТИЧНО:
- Читай файлы перед модификацией (Read tool)
- Не дублируй существующие workflows ([IR], [CC] уже есть!)
- MenuCommandRouter должен работать с 5 existing workflows
- Все error messages билингвальные (EN + RU)

Начинай!
```

### Вариант 3: Поэтапная реализация

Если хочешь контролировать процесс:

**Фаза 1 (критично)**:
```bash
asmo run "[Фаза 1] Реализовать MenuCommandRouter, TestEnforcementValidator и 3 новых workflow согласно плану"
```

**Фаза 2 (personalities)**:
```bash
asmo run "[Фаза 2] Добавить personalities и principles в agents.yaml, реализовать PrincipleValidators"
```

**Фаза 3 (dynamic prompts)**:
```bash
asmo run "[Фаза 3] Реализовать PersonalityPromptLoader и интегрировать в BaseAgent"
```

**Фаза 4 (documentation)**:
```bash
asmo run "[Фаза 4] Сгенерировать документацию BMAD через TechWriterAgent"
```

---

## 📋 Checklist перед стартом

- [x] План сохранен: `/Users/aliaksandrsmolka/.claude/plans/quirky-conjuring-unicorn-updated.md`
- [x] Промпт создан: `/Users/aliaksandrsmolka/ASMO/.asmo/prompts/bmad-implementation-agent-prompt.md`
- [ ] Текущая ветка git: `git checkout -b feature/bmad-integration`
- [ ] Dependencies установлены: `pnpm install`
- [ ] Тесты проходят: `pnpm test`
- [ ] Environment настроен: `.env` с `ANTHROPIC_API_KEY`

---

## 🎯 Ожидаемый результат

После завершения всех фаз:

### Новые команды работают:
```bash
# Existing workflows
asmo run "[IR]"                          # ✅ Implementation Readiness
asmo run "[CC] reduce scope to MVP"      # ✅ Course Correction
asmo run "[ГР]"                          # ✅ Russian command

# NEW workflows
asmo run "[DS] implement user auth"      # ✅ Dev Story (TDD)
asmo run "[CR] review auth code"         # ✅ Code Review
asmo run "[CS] create login story"       # ✅ Create Story
```

### Personalities работают:
```bash
asmo run "[DS] implement feature"
# Output:
# 🚫 Amelia says: I will not mark this complete until 100% of tests pass
# ✅ Tests: 10 passed, 0 failed, 10 total
# - Amelia, Developer (Tests Must Pass ✅)
```

### Principles блокируют:
```bash
asmo run "[CS] improve performance"
# Output:
# ❌ Principle Violation: zero_ambiguity
#    Agent: Bob (Scrum Master)
#    🚫 Bob says: Ambiguous term "improve" - be specific with numbers
```

### Документация сгенерирована:
```bash
ls docs/en/guides/bmad-*.md  # 4 files
ls docs/ru/guides/bmad-*.md  # 4 files
grep "BMAD v1.0" CHANGELOG.md
```

---

## 📞 Поддержка

Если что-то идет не так:

1. **Проверь логи**: `tail -f logs/asmo.log`
2. **Проверь статус**: `asmo status`
3. **Откат**: `git checkout main && git branch -D feature/bmad-integration`
4. **Вопросы**: Прочитай план в `.claude/plans/quirky-conjuring-unicorn-updated.md`

---

## 🔥 Начать сейчас

```bash
# Копируй и запускай:
git checkout -b feature/bmad-integration
asmo run "Реализовать BMAD интеграцию по плану в .asmo/prompts/bmad-implementation-agent-prompt.md, начиная с Фазы 1"
```

**Удачи!** 🚀
