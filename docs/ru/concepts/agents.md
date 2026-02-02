# Агенты

Агенты — это специализированные AI-роли, выполняющие конкретные задачи в workflows ASMO.

## Что такое агент?

Агент — это AI-сущность с:
- **Специализированной ролью** — конкретная экспертиза (Архитектор, Разработчик, Тестировщик)
- **Определёнными навыками** — способности, которые он может использовать
- **Правами доступа** — MCP-серверы, которые он может использовать
- **Правилами активации** — когда он активируется

## Категории агентов

ASMO включает **24 агента** в трёх категориях:

### Core агенты (6)

Базовые агенты для стандартных задач разработки:

| Агент | Роль | Может изменять код |
|-------|------|-------------------|
| 🏗️ Architect | Проектирование системы, ADR | Нет |
| 👨‍💻 Developer | Реализация фич | Да |
| 🐛 Debugger | Исследование багов | Да |
| ⚡ Optimizer | Оптимизация производительности | Да |
| 🧪 Tester | Контроль качества | Да |
| 🚀 DevOps | Деплой, CI/CD | Нет |

### Специализированные агенты (10)

Экспертиза в конкретных доменах:

| Агент | Домен | Тип роли |
|-------|-------|----------|
| 🎨 UI Developer | Frontend | Исполнительный |
| 🎭 UX Designer | Пользовательский опыт | Аналитический |
| 📊 Business Analyst | Требования | Аналитический |
| 📋 Project Manager | Координация | Гибридный |
| 🎯 Product Owner | Стратегия | Аналитический |
| 🔄 Scrum Master | Agile | Гибридный |
| 🔒 Security Specialist | Безопасность | Аналитический |
| 📈 Performance Engineer | Производительность | Аналитический |
| 💾 Data Architect | База данных | Аналитический |
| 🔌 API Designer | API контракты | Аналитический |

### Агенты валидации (4+)

Контроль качества и координация:

| Агент | Назначение |
|-------|------------|
| ✅ Design Validator | Ревью архитектуры |
| 🔀 Merge Coordinator | Консолидация параллельных результатов |
| 👁️ Post-Deploy Monitor | Мониторинг деплоя |
| 📝 Requirements Validator | Проверка по критериям INVEST |

## Типы ролей

| Тип | Описание | Пример |
|-----|----------|--------|
| **Аналитический (reasoning)** | Анализирует и принимает решения | Architect |
| **Исполнительный (execution)** | Выполняет конкретные действия | Developer |
| **Гибридный (hybrid)** | И анализ, и выполнение | Debugger |

## Использование агентов

### В Workflows

```json
{
  "steps": [
    {
      "order": 1,
      "role_id": "architect",
      "phase": "design",
      "description": "Спроектировать решение"
    },
    {
      "order": 2,
      "role_id": "developer",
      "phase": "implementation",
      "description": "Реализовать решение"
    }
  ]
}
```

### В Party Mode

```typescript
const session = await engine.executePartyMode(
  'Спроектировать систему аутентификации',
  ['architect', 'security-specialist', 'developer'],
  undefined,
  { maxRounds: 3 }
)
```

### Прямой доступ

```typescript
import { AgentRegistry } from '@asmo/core'

const registry = new AgentRegistry()
const architect = await registry.getAgent('architect')
const result = await architect.execute({
  task: 'Спроектировать схему БД',
  context: { tables: ['users', 'orders'] }
})
```

## См. также

- [Каталог агентов](../reference/agents/index.md) — полная документация
- [Кастомные агенты](../guides/custom-agents.md) — создание своих агентов
- [Workflows](./workflows.md) — как агенты работают в workflows
