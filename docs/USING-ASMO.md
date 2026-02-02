# Как использовать asmo для исправления проблем

## Установка

```bash
cd packages/cli
pnpm link --global
```

## Базовое использование

### Быстрые команды BMAD (v3.0) - РЕКОМЕНДУЕТСЯ

Используйте короткие команды для быстрого запуска workflow:

```bash
# История для разработки (TDD с Amelia)
asmo run "[ИС] реализовать аутентификацию через OAuth2"

# Создание истории (без неоднозначности с Bob)
asmo run "[СИ] добавить систему уведомлений"

# Обзор кода (комплексная проверка)
asmo run "[КО] проверить интеграцию с платежной системой"

# Готовность к реализации (проверка требований)
asmo run "[ГР]"

# Коррекция курса (изменение подхода)
asmo run "[КК] сократить область до MVP"
```

**Доступные команды:**

| Команда | Workflow | BMAD Агент | Принцип |
|---------|----------|------------|---------|
| `[ИС]` | Dev Story | Amelia | Строгое прохождение тестов |
| `[СИ]` | Create Story | Bob + John | Без неоднозначности + ПОЧЕМУ |
| `[КО]` | Code Review | Несколько | Контроль качества |
| `[ГР]` | Implementation Readiness | Bob | Ясность требований |
| `[КК]` | Course Correction | Winston | Оценка рисков |
| `[СБ]` | Product Brief | John | Бизнес-ценность |
| `[ВТ]` | Validate PRD | Bob + John | Валидация ТЗ |
| `[СЭ]` | Create Epics | John | Декомпозиция |

### Анализ задачи

```bash
asmo analyze "Your task description"
```

### Создание задачи

```bash
asmo task create "Task title" \
  --description "Detailed description" \
  --priority high
```

### Запуск workflow (традиционный способ)

```bash
asmo workflow <workflow-name> \
  --task "Task description" \
  --agents architect,developer,tester
```

## Примеры для нашего проекта

### Рефакторинг

```bash
asmo workflow refactoring \
  --task "Refactor WorkflowEngine to reduce dependencies" \
  --agents architect,developer,code-reviewer
```

### Тестирование

```bash
asmo task create "Generate tests for 28 agents" \
  --workflow testing \
  --priority high
```

### Миграция

```bash
asmo task create "Migrate from LangChain to Anthropic SDK" \
  --workflow migration \
  --priority high
```

## Примеры с BMAD (v3.0)

### TDD-разработка с Amelia

```bash
# Amelia не завершит задачу, пока не пройдут ВСЕ тесты
asmo run "[ИС] реализовать систему логирования"

# Amelia выполняет цикл:
# 1. Red Phase: Пишет падающие тесты
# 2. Green Phase: Минимальный код для прохождения
# 3. Refactor Phase: Улучшение качества
# 4. Блокировка: Если test_results.failed > 0
```

### Создание историй без неоднозначности с Bob

```bash
# ❌ Неправильно: Bob заблокирует
asmo run "[СИ] улучшить производительность"
# Ошибка: "улучшить" - неоднозначно, "производительность" - какая метрика?

# ✅ Правильно: Bob одобрит
asmo run "[СИ] сократить время отклика API с 500мс до <200мс (p95)"
# Конкретно, измеримо, с числами
```

### Бизнес-ценность с John

```bash
# ❌ Неправильно: John заблокирует
asmo run "[СИ] добавить темную тему"
# Ошибка: Отсутствует "ПОЧЕМУ" (бизнес-ценность)

# ✅ Правильно: John одобрит
asmo run "[СИ] добавить темную тему, чтобы пользователи ночной смены могли работать без напряжения глаз, увеличивая длительность сессий на 25%"
# Есть "чтобы", есть метрика (25%), есть бизнес-влияние
```

### Выбор технологий с Winston

```bash
# Winston предупредит о рисках
asmo run "спроектировать систему уведомлений с MongoDB и Microservices"

# Предупреждения Winston:
# ⚠️  "MongoDB" - средний риск - Рассмотрите PostgreSQL с JSONB
# ⚠️  "Microservices" - высокий риск - Начните с модульного монолита
#
# Рекомендация: PostgreSQL + REST API + Модульный Монолит
# Обоснование: Проверено в боях, зрелая экосистема
```
