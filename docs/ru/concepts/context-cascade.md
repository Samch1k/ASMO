# Context Cascade (Каскад контекста)

Context Cascade обеспечивает правильный поток информации между фазами workflow. Каждая фаза строится на результатах предыдущих фаз, создавая связный процесс разработки.

## Обзор

В сложных проектах поздние фазы зависят от ранних решений:

```
Product Brief → PRD → Architecture → Epics → Stories → Implementation
```

Context Cascade автоматически:
- Отслеживает зависимости документов
- Загружает необходимый контекст для каждого workflow
- Поддерживает консистентность между фазами

## Поток каскада

```
┌─────────────────────────────────────────────────────────────────┐
│                      Context Cascade                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐                                               │
│  │Product Brief │                                               │
│  └──────┬───────┘                                               │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐    ┌──────────────┐                           │
│  │     PRD      │◄───│  UX Design   │                           │
│  └──────┬───────┘    └──────────────┘                           │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐                                               │
│  │ Architecture │                                               │
│  └──────┬───────┘                                               │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐                                               │
│  │    Epics     │                                               │
│  └──────┬───────┘                                               │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐    ┌──────────────┐                           │
│  │   Stories    │───►│Implementation│                           │
│  └──────────────┘    └──────────────┘                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Зависимости документов

| Workflow | Требует |
|----------|---------|
| `create-prd` | product-brief |
| `create-architecture` | prd, ux-design |
| `create-epics` | prd, architecture |
| `create-story` | epics, prd, architecture |
| `dev-story` | story, architecture, project-context |
| `code-review` | story, architecture |

## Использование

### Базовое использование

```typescript
import { ContextCascade, DocumentRegistry } from '@ai1st/core'

// Инициализация с реестром документов
const registry = new DocumentRegistry({ outputDir: '_ai1st-output' })
const cascade = new ContextCascade(registry)

// Регистрация документа
await registry.registerDocument('product-brief', productBriefContent, {
  project: 'my-project',
  author: 'product-team'
})

// Загрузка контекста для workflow
const context = await cascade.loadContextForWorkflow('create-prd')

console.log('Загруженные документы:', Object.keys(context.documents))
// Output: ['product-brief']
```

### Получение зависимостей

```typescript
// Получить прямые зависимости
const deps = cascade.getDependencies('create-architecture')
console.log(deps) // ['prd', 'ux-design']

// Построить полную цепочку контекста
const chain = cascade.buildContextChain('dev-story')
console.log(chain)
// ['product-brief', 'prd', 'ux-design', 'architecture', 'epics', 'story']
```

### Пользовательские зависимости

```typescript
const cascade = new ContextCascade(registry, {
  customDependencies: {
    'my-workflow': ['prd', 'architecture', 'custom-doc']
  }
})
```

## Document Registry

Document Registry хранит и управляет всеми документами проекта.

### Регистрация документов

```typescript
const doc = await registry.registerDocument(
  'prd',
  prdContent,
  {
    project: 'e-commerce',
    author: 'analyst',
    tags: ['v1.0', 'approved']
  }
)

console.log('ID документа:', doc.id)
console.log('Версия:', doc.version)
```

### Получение документов

```typescript
// Получить последнюю версию
const prd = await registry.getDocument('prd')

// Получить конкретную версию
const prdV1 = await registry.getDocument('prd', 1)

// Список всех документов
const docs = await registry.listDocuments()
docs.forEach(doc => {
  console.log(`${doc.type}: v${doc.version} (${doc.createdAt})`)
})
```

### Типы документов

| Тип | Описание |
|-----|----------|
| `product-brief` | Документ стратегического видения |
| `prd` | Product Requirements Document |
| `ux-design` | UX спецификации |
| `architecture` | Техническая архитектура |
| `epics` | Определения эпиков |
| `story` | Пользовательские истории |
| `project-context` | Контекст всего проекта |

## Хранение файлов

Документы сохраняются в файловую систему:

```
_ai1st-output/
├── document-index.json     # Индекс метаданных документов
├── product-brief/
│   ├── v1.md
│   └── v2.md
├── prd/
│   └── v1.md
└── architecture/
    └── v1.md
```

## Конфигурация

```typescript
const config = {
  contextCascade: {
    enabled: true,
    outputDir: '_ai1st-output',
    autoLoad: true  // Авто-загрузка контекста в workflows
  }
}
```

## Интеграция с WorkflowEngine

При включённом `autoLoad` workflows автоматически получают контекст:

```typescript
const engine = new WorkflowEngine(registry, {
  contextCascade: { enabled: true, autoLoad: true }
})

// Контекст загружается автоматически
const result = await engine.execute('create-architecture', {
  task: 'Спроектировать архитектуру системы'
})
// PRD и UX Design доступны агенту-архитектору
```

## Лучшие практики

1. **Регистрируйте документы сразу:**
   - Сохраняйте результаты сразу после генерации
   - Это позволит последующим workflows получить к ним доступ

2. **Используйте единообразные имена:**
   - Придерживайтесь стандартных типов документов
   - Используйте метаданные для специфичной информации проекта

3. **Версионируйте важные изменения:**
   - Каждая регистрация создаёт новую версию
   - Предыдущие версии остаются доступными

## Связанные темы

- [Document Sharding](../guides/document-sharding.md)
- [Elicitation](./elicitation.md)
- [Workflows](./workflows.md)
