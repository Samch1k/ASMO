# Установка

Руководство по установке ASMO Framework в ваш проект.

## Системные требования

- **Node.js**: 18.0 или выше
- **Менеджер пакетов**: npm 9+ или pnpm 8+ (рекомендуется)
- **TypeScript**: 5.0+ (опционально, но рекомендуется)

## Установка

### Используя pnpm (рекомендуется)

```bash
pnpm add @asmo/core
```

### Используя npm

```bash
npm install @asmo/core
```

### Используя yarn

```bash
yarn add @asmo/core
```

## Опциональные зависимости

ASMO работает с различными MCP-серверами для расширенных возможностей:

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

Для персистентности задач ASMO использует PostgreSQL:

```bash
# Установите URL базы данных
export DATABASE_URL="postgresql://user:password@localhost:5432/asmo"
```

## Переменные окружения

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `DATABASE_URL` | Строка подключения PostgreSQL | - |
| `ANTHROPIC_API_KEY` | API ключ Anthropic | - |
| `ASMO_YOLO_THRESHOLD` | Порог сложности для YOLO mode | 30 |
| `ASMO_LOG_LEVEL` | Уровень логирования | info |

Создайте файл `.env` в корне проекта:

```bash
DATABASE_URL=postgresql://localhost:5432/asmo
ANTHROPIC_API_KEY=your-api-key
ASMO_YOLO_THRESHOLD=30
ASMO_LOG_LEVEL=info
```

## Проверка установки

Создайте тестовый файл:

```typescript
// test-asmo.ts
import { WorkflowEngine, AgentRegistry } from '@asmo/core'

async function main() {
  const registry = new AgentRegistry()
  const engine = new WorkflowEngine(registry)

  await engine.initialize()

  console.log('✅ ASMO успешно установлен!')
  console.log(`Доступных workflows: ${engine.getWorkflows().length}`)
}

main().catch(console.error)
```

Запустите:

```bash
npx tsx test-asmo.ts
```

## Следующие шаги

- [Быстрый старт](./quick-start.md) — запустите первый workflow
- [Конфигурация](./configuration.md) — настройте ASMO для вашего проекта
