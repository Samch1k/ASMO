# Справочник

Полный справочник API, агентов, workflows и навыков ASMO.

## Разделы

### [API Reference](./api/index.md)

Документация публичного API:

- Классы и интерфейсы
- Методы и параметры
- Примеры использования
- TypeScript типы

### [Агенты](./agents/index.md)

Каталог 24 специализированных агентов:

| Категория | Количество | Описание |
|-----------|------------|----------|
| Core | 6 | Основные агенты разработки |
| Specialized | 10 | Специализированные эксперты |
| Validation | 5 | Валидация и ревью |
| Business | 3 | Бизнес-агенты |

### [Workflows](./workflows/index.md)

Каталог 10+ встроенных workflows:

| Уровень | Workflows | Сложность |
|---------|-----------|-----------|
| Simple | 2 | 0-40 |
| Standard | 3 | 41-60 |
| Complex | 3 | 61-80 |
| Enterprise | 2 | 81-100 |

### [Навыки](./skills/index.md)

Каталог 85 навыков по категориям:

| Категория | Навыков | Примеры |
|-----------|---------|---------|
| Frontend | 12 | React, Vue, CSS |
| Backend | 10 | Node.js, Python, Go |
| Database | 8 | PostgreSQL, MongoDB |
| DevOps | 10 | Docker, K8s, CI/CD |
| И другие... | 45+ | Security, Testing, etc. |

### [CLI](./cli.md)

Команды CLI инструмента:

```bash
asmo execute "task"    # Выполнить задачу
asmo analyze "task"    # Анализ сложности
asmo list agents       # Список агентов
asmo list workflows    # Список workflows
```

## Быстрый доступ

### Основные классы

```typescript
import {
  WorkflowEngine,
  AgentRegistry,
  ComplexityAnalyzer,
  YoloModeManager
} from '@asmo/core'
```

### Типы

```typescript
import type {
  WorkflowResult,
  AgentConfig,
  ComplexityLevel,
  ExecuteOptions
} from '@asmo/core'
```

## Версионирование

API следует [Semantic Versioning](https://semver.org/):

- **Major** (x.0.0) — breaking changes
- **Minor** (0.x.0) — новые функции
- **Patch** (0.0.x) — исправления

## См. также

- [Концепции](../concepts/index.md)
- [Руководства](../guides/index.md)
- [Примеры](../examples/index.md)
