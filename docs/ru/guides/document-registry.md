# Document Registry (Реестр документов)

Document Registry обеспечивает централизованное хранение и версионирование всех проектных документов, используемых в системе Context Cascade.

## Обзор

Document Registry:
- Хранит документы с историей версий
- Отслеживает метаданные (автор, временные метки, теги)
- Сохраняет на диск в директорию `_asmo-output/`
- Интегрируется с Context Cascade для автоматической загрузки

## Базовое использование

```typescript
import { DocumentRegistry } from '@asmo/core'

// Создание реестра
const registry = new DocumentRegistry({
  outputDir: '_asmo-output'
})

// Регистрация документа
const doc = await registry.registerDocument(
  'prd',
  prdContent,
  {
    author: 'analyst',
    project: 'my-project',
    tags: ['v1.0', 'draft']
  }
)

console.log('ID документа:', doc.id)
console.log('Версия:', doc.version)
console.log('Создан:', doc.createdAt)
```

## Типы документов

| Тип | Описание | Типичный Workflow |
|-----|----------|-------------------|
| `product-brief` | Стратегическое видение | `create-product-brief` |
| `prd` | Product Requirements | `create-prd` |
| `ux-design` | UX спецификации | `create-ux-design` |
| `architecture` | Технический дизайн | `create-architecture` |
| `epics` | Определения эпиков | `create-epics-and-stories` |
| `story` | Пользовательские истории | `create-story` |
| `project-context` | Настройки проекта | Вручную |

## Регистрация документов

### Базовая регистрация

```typescript
await registry.registerDocument('prd', content)
```

### С метаданными

```typescript
await registry.registerDocument('architecture', content, {
  author: 'architect-agent',
  project: 'e-commerce',
  tags: ['approved', 'v2.0'],
  custom: {
    reviewedBy: 'tech-lead',
    approvedAt: new Date().toISOString()
  }
})
```

## Получение документов

### Получить последнюю версию

```typescript
const prd = await registry.getDocument('prd')
if (prd) {
  console.log('Содержимое:', prd.content)
  console.log('Версия:', prd.version)
}
```

### Получить конкретную версию

```typescript
const prdV1 = await registry.getDocument('prd', 1)
const prdV2 = await registry.getDocument('prd', 2)
```

### Получить несколько документов

```typescript
const docs = await registry.getDocuments(['prd', 'architecture', 'ux-design'])

for (const [type, doc] of docs) {
  if (doc) {
    console.log(`${type}: v${doc.version}`)
  } else {
    console.log(`${type}: не найден`)
  }
}
```

### Список всех документов

```typescript
const summary = await registry.listDocuments()

summary.forEach(doc => {
  console.log(`${doc.type}: v${doc.version} (${doc.createdAt})`)
})
```

## История версий

Каждая регистрация создаёт новую версию:

```typescript
// Версия 1
await registry.registerDocument('prd', 'Начальное содержимое PRD')

// Версия 2
await registry.registerDocument('prd', 'Обновлённый PRD с учётом feedback')

// Версия 3
await registry.registerDocument('prd', 'Финальный PRD после ревью')

// Получить историю версий
const history = await registry.getVersionHistory('prd')
console.log('Версий:', history.length) // 3
```

## Проверка существования документа

```typescript
const hasPRD = await registry.hasDocument('prd')
const hasArch = await registry.hasDocument('architecture')

if (!hasArch) {
  console.log('Документ архитектуры не найден')
}
```

## Структура файлового хранилища

Документы сохраняются в файловую систему:

```
_asmo-output/
├── document-index.json      # Индекс метаданных
├── product-brief/
│   └── v1.md
├── prd/
│   ├── v1.md
│   └── v2.md
├── architecture/
│   └── v1.md
└── epics/
    └── v1.md
```

## Конфигурация

```typescript
const registry = new DocumentRegistry({
  outputDir: '_asmo-output',  // Директория вывода
  autoSave: true,              // Авто-сохранение при регистрации
  maxVersions: 10              // Макс. версий на документ
})
```

## Интеграция с Context Cascade

Document Registry — бэкенд хранения для Context Cascade:

```typescript
import { ContextCascade, DocumentRegistry } from '@asmo/core'

const registry = new DocumentRegistry()
const cascade = new ContextCascade({ documentRegistry: registry })

// Регистрация документов
await registry.registerDocument('product-brief', briefContent)
await registry.registerDocument('prd', prdContent)

// Загрузка контекста для workflow
const context = await cascade.loadContextForWorkflow('create-architecture')
// Автоматически загрузит: product-brief, prd, ux-design
```

## Лучшие практики

1. **Регистрируйте сразу после генерации:**
   ```typescript
   const prd = await analyst.generatePRD(task)
   await registry.registerDocument('prd', prd)
   ```

2. **Используйте осмысленные метаданные:**
   ```typescript
   await registry.registerDocument('architecture', content, {
     author: 'architect-agent',
     tags: ['microservices', 'approved'],
     project: 'payment-service'
   })
   ```

3. **Проверяйте зависимости перед workflows:**
   ```typescript
   const missing = await cascade.getMissingDependencies('create-epics')
   if (missing.length > 0) {
     console.log('Отсутствующие документы:', missing.join(', '))
   }
   ```

## Связанные темы

- [Context Cascade](../concepts/context-cascade.md)
- [Document Sharding](./document-sharding.md)
- [Workflows](../concepts/workflows.md)
