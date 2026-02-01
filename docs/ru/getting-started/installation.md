# Установка

Руководство по установке AI1st Framework в ваш проект.

## Системные требования

- **Node.js**: 18.0 или выше
- **Менеджер пакетов**: npm 9+ или pnpm 8+ (рекомендуется)
- **TypeScript**: 5.0+ (опционально, но рекомендуется)

## Установка

### Используя pnpm (рекомендуется)

```bash
pnpm add @ai1st/core
```

### Используя npm

```bash
npm install @ai1st/core
```

### Используя yarn

```bash
yarn add @ai1st/core
```

## Опциональные зависимости

AI1st работает с различными MCP-серверами для расширенных возможностей:

```bash
# Для работы с базой данных
pnpm add @mcp/supabase

# Для деплоя
pnpm add @mcp/vercel @mcp/render

# Для интеграции с GitHub
pnpm add @mcp/github

# Для автоматизации браузера
pnpm add @mcp/playwright
```

## Настройка базы данных (опционально)

Для персистентности задач AI1st использует PostgreSQL:

```bash
# Установите URL базы данных
export DATABASE_URL="postgresql://user:password@localhost:5432/ai1st"
```

## Переменные окружения

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `DATABASE_URL` | Строка подключения PostgreSQL | - |
| `ANTHROPIC_API_KEY` | API ключ Anthropic | - |
| `AI1ST_YOLO_THRESHOLD` | Порог сложности для YOLO mode | 30 |
| `AI1ST_LOG_LEVEL` | Уровень логирования | info |

Создайте файл `.env` в корне проекта:

```bash
DATABASE_URL=postgresql://localhost:5432/ai1st
ANTHROPIC_API_KEY=your-api-key
AI1ST_YOLO_THRESHOLD=30
AI1ST_LOG_LEVEL=info
```

## Проверка установки

Создайте тестовый файл:

```typescript
// test-ai1st.ts
import { WorkflowEngine, AgentRegistry } from '@ai1st/core'

async function main() {
  const registry = new AgentRegistry()
  const engine = new WorkflowEngine(registry)

  await engine.initialize()

  console.log('✅ AI1st успешно установлен!')
  console.log(`Доступных workflows: ${engine.getWorkflows().length}`)
}

main().catch(console.error)
```

Запустите:

```bash
npx tsx test-ai1st.ts
```

## Следующие шаги

- [Быстрый старт](./quick-start.md) — запустите первый workflow
- [Конфигурация](./configuration.md) — настройте AI1st для вашего проекта
