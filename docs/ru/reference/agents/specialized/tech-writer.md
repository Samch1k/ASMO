# Агент Tech Writer

Специалист по документации: API документация, руководства пользователя, техническое писательство.

## Обзор

Агент Tech Writer создаёт профессиональную техническую документацию, включая API-справочники, руководства пользователя, README и системную документацию. Следует лучшим практикам документирования и поддерживает консистентный стиль.

## Возможности

| Навык | Описание |
|-------|----------|
| `documentation` | Создание общей документации |
| `technical_writing` | Написание технического контента |
| `api_documentation` | Документация API-справочников |
| `user_guides` | Документация для конечных пользователей |
| `readme_creation` | Создание README-файлов проекта |
| `system_documentation` | Документация архитектуры и систем |
| `style_guide_compliance` | Соблюдение стиля документации |
| `doc_maintenance` | Обновление и исправление документации |

## Типы документации

### API документация
- Описания endpoint'ов с параметрами
- Примеры запросов/ответов
- Руководства по аутентификации
- Документация обработки ошибок

### Руководства пользователя
- Туториалы "Начало работы"
- Обзоры функциональности
- Руководства по устранению проблем
- Разделы FAQ

### Системная документация
- Обзоры архитектуры
- Руководства по деплою
- Справочники конфигурации
- Документация интеграций

### README файлы
- Обзор проекта
- Инструкции по установке
- Примеры быстрого старта
- Руководства для контрибьюторов

## Конфигурация

```yaml
# agents.yaml
tech-writer:
  id: tech-writer
  name: Tech Writer
  model_preference: sonnet
  role:
    id: tech-writer
    seniority: senior
    expertise:
      - technical_writing
      - api_documentation
      - user_experience_writing
```

## Использование

```typescript
import { TechWriterAgent } from '@asmo/core'

const writer = new TechWriterAgent()

const result = await writer.execute({
  task: 'Создать API документацию для endpoint\'ов аутентификации пользователей',
  context: {
    endpoints: ['/auth/login', '/auth/register', '/auth/refresh']
  }
})

console.log(result.artifacts[0].content) // API документация
```

## Выходные артефакты

- API Reference (OpenAPI/Markdown)
- Руководство пользователя (Markdown)
- README.md
- Документация архитектуры
- Записи Changelog

## Принципы стиля

Агент Tech Writer следует этим принципам:
- Ясный, лаконичный язык
- Консистентная терминология
- Примеры кода для всех функций
- Прогрессивное раскрытие (простое → сложное)
- Доступное форматирование

## MCP интеграции

- **Filesystem MCP**: Читает исходный код и записывает документацию
- **Memory MCP**: Поддерживает консистентность стиля документации
- **Context7 MCP**: Ссылается на лучшие практики документирования

## См. также

- [Руководство по Document Sharding](/docs/ru/guides/document-sharding.md)
- [Агент Analyst](./analyst.md)
- [Агент Architect](/docs/ru/reference/agents/core/architect.md)
