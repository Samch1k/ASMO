# Document Sharding (Шардирование документов)

Document Sharding автоматически разбивает большие markdown-документы на управляемые секции, делая их доступными для обработки AI-агентами с ограничениями контекста.

## Обзор

Большие документы (PRD, архитектурные спецификации и т.д.) часто превышают контекстные окна AI. Document Sharding:

- Разбивает документы по уровню заголовков
- Создаёт индексный файл с навигацией
- Сохраняет перекрёстные ссылки
- Поддерживает пересборку

## Базовое использование

```typescript
import { DocumentSharder } from '@asmo/core'

const sharder = new DocumentSharder({
  maxTokensPerFile: 10000,
  splitLevel: 2  // Разбивка по ## заголовкам
})

// Шардирование большого документа
const result = await sharder.shardDocument('/docs/PRD.md')

console.log('Индекс:', result.indexPath)
console.log('Секций:', result.sectionCount)
console.log('Файлы:', result.files)
```

## Структура результата

```
До:
docs/
└── PRD.md (50,000 токенов)

После:
docs/
├── PRD.md → PRD/
└── PRD/
    ├── index.md           # Обзор + навигация
    ├── 01-introduction.md
    ├── 02-requirements.md
    ├── 03-user-stories.md
    └── 04-technical-specs.md
```

## Конфигурация

```typescript
const sharder = new DocumentSharder({
  maxTokensPerFile: 10000,    // Целевой размер на файл
  splitLevel: 2,              // Уровень заголовка для разбивки (## = 2)
  minTokensPerSection: 500,   // Не разбивать маленькие секции
  includeFrontmatter: true    // Включать YAML frontmatter
})
```

### Параметры конфигурации

| Параметр | По умолчанию | Описание |
|----------|--------------|----------|
| `maxTokensPerFile` | 10000 | Максимум токенов на шард |
| `splitLevel` | 2 | Уровень заголовка для разбивки (1=H1, 2=H2 и т.д.) |
| `minTokensPerSection` | 500 | Минимальный размер секции |
| `includeFrontmatter` | true | Сохранять YAML frontmatter в шардах |

## Методы

### Проверка необходимости шардирования

```typescript
const needsSharding = await sharder.needsSharding('/docs/large-doc.md')

if (needsSharding) {
  await sharder.shardDocument('/docs/large-doc.md')
}
```

### Получение статистики документа

```typescript
const stats = await sharder.getDocumentStats('/docs/PRD.md')

console.log('Оценка токенов:', stats.estimatedTokens)
console.log('Секций:', stats.sectionCount)
console.log('Нужно шардирование:', stats.needsSharding)
```

### Парсинг без шардирования

```typescript
// Разбор документа на секции (в памяти)
const sections = sharder.parseDocument(content, 2)

sections.forEach(section => {
  console.log(`${section.heading}: ${section.estimatedTokens} токенов`)
})
```

### Пересборка документа

```typescript
// Пересобрать шардированный документ
const reassembled = await sharder.reassembleDocument('/docs/PRD/')

// Записать обратно в один файл
await fs.writeFile('/docs/PRD-reassembled.md', reassembled)
```

## Формат индексного файла

Сгенерированный индексный файл включает:

```markdown
# PRD

> Автогенерированный индекс для шардированного документа

## Секции

1. [Введение](./01-introduction.md)
2. [Требования](./02-requirements.md)
3. [Пользовательские истории](./03-user-stories.md)
4. [Технические спецификации](./04-technical-specs.md)

## Метаданные

- Исходный файл: PRD.md
- Всего секций: 4
- Шардировано: 2024-01-15T10:30:00Z
```

## Интеграция с Context Cascade

Document Sharding работает с Context Cascade для загрузки конкретных секций:

```typescript
import { ContextCascade, DocumentRegistry, DocumentSharder } from '@asmo/core'

const registry = new DocumentRegistry()
const sharder = new DocumentSharder()
const cascade = new ContextCascade(registry)

// Регистрация шардированного документа
const stats = await sharder.getDocumentStats(prdPath)
if (stats.needsSharding) {
  const result = await sharder.shardDocument(prdPath)

  // Регистрация каждой секции отдельно
  for (const file of result.files) {
    const content = await fs.readFile(file, 'utf-8')
    await registry.registerDocument('prd-section', content, {
      section: file,
      parent: 'prd'
    })
  }
}
```

## Лучшие практики

1. **Выбирайте подходящий уровень разбивки:**
   - `2` (##) для большинства документов
   - `3` (###) для очень детальных документов
   - `1` (#) для коллекций независимых секций

2. **Устанавливайте разумные лимиты токенов:**
   - 10,000 для общего использования
   - 5,000 для агентов с меньшим контекстом
   - 20,000 для комплексного анализа

3. **Сохраняйте контекст:**
   - Включайте навигацию по секциям (prev/next)
   - Поддерживайте ссылку на родительский документ
   - Сохраняйте перекрёстные ссылки

## Ограничения

- Inline-ссылки на секции требуют обновления после шардирования
- Вложенные иерархии заголовков могут требовать нескольких проходов
- Очень большие блоки кода могут превысить лимиты секции

## Связанные темы

- [Context Cascade](../concepts/context-cascade.md)
- [Document Registry](../concepts/context-cascade.md#document-registry)
- [Tech Writer Agent](../reference/agents/tech-writer.md)
