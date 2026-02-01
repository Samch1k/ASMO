# Настройка окружения разработки

Полное руководство по настройке локального окружения для разработки AI1st.

## Требования

### Обязательные

| Инструмент | Версия | Проверка |
|------------|--------|----------|
| Node.js | 18+ | `node --version` |
| pnpm | 8+ | `pnpm --version` |
| Git | 2.30+ | `git --version` |

### Рекомендуемые

| Инструмент | Назначение |
|------------|------------|
| VS Code | IDE с расширениями |
| Docker | Для PostgreSQL |
| PostgreSQL | 14+ (или Docker) |

## Установка

### 1. Fork и клонирование

```bash
# Fork через GitHub UI, затем:
git clone https://github.com/YOUR_USERNAME/ai1st-orchestration.git
cd ai1st-orchestration

# Добавить upstream
git remote add upstream https://github.com/Samch1k/ai1st-orchestration.git
```

### 2. Установка зависимостей

```bash
# Установка всех зависимостей монорепозитория
pnpm install
```

### 3. Настройка переменных окружения

```bash
# Копировать пример
cp .env.example .env

# Редактировать .env
```

```bash
# .env
DATABASE_URL=postgresql://user:password@localhost:5432/ai1st
AI1ST_LOG_LEVEL=debug
AI1ST_YOLO_ENABLED=false
```

### 4. База данных

#### Вариант A: Docker

```bash
# Запуск PostgreSQL в Docker
docker run -d \
  --name ai1st-postgres \
  -e POSTGRES_USER=ai1st \
  -e POSTGRES_PASSWORD=ai1st \
  -e POSTGRES_DB=ai1st \
  -p 5432:5432 \
  postgres:14
```

#### Вариант B: Локальный PostgreSQL

```bash
# Создание базы данных
createdb ai1st
```

### 5. Миграции

```bash
# Применить миграции
pnpm db:migrate
```

### 6. Проверка установки

```bash
# Сборка
pnpm build

# Тесты
pnpm test

# Линтинг
pnpm lint
```

## Структура монорепозитория

```
ai1st-orchestration/
├── packages/
│   ├── core/           # Основная библиотека
│   ├── cli/            # CLI инструмент
│   └── docs/           # VitePress документация
├── scripts/            # Скрипты генерации
├── docs/               # Markdown документация
└── examples/           # Примеры использования
```

## VS Code настройка

### Рекомендуемые расширения

```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### Настройки

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Команды разработки

| Команда | Описание |
|---------|----------|
| `pnpm dev` | Режим разработки |
| `pnpm build` | Сборка всех пакетов |
| `pnpm test` | Запуск тестов |
| `pnpm test:watch` | Тесты в watch режиме |
| `pnpm lint` | Линтинг |
| `pnpm lint:fix` | Автоисправление |
| `pnpm typecheck` | Проверка типов |
| `pnpm docs:dev` | Локальная документация |

## Workflow разработки

### 1. Синхронизация с upstream

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

### 2. Создание ветки

```bash
git checkout -b feature/my-feature
```

### 3. Разработка

```bash
# Запуск в watch режиме
pnpm dev

# Тесты в watch режиме
pnpm test:watch
```

### 4. Коммит и push

```bash
git add .
git commit -m "feat: add my feature"
git push origin feature/my-feature
```

## Решение проблем

### pnpm install fails

```bash
# Очистить кэш
pnpm store prune
rm -rf node_modules
pnpm install
```

### TypeScript ошибки

```bash
# Перезапустить TS server в VS Code
Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

### Тесты падают

```bash
# Проверить базу данных
pg_isready

# Пересоздать тестовую БД
pnpm db:reset
```

## См. также

- [Стандарты кода](./coding-standards.md)
- [Тестирование](./testing.md)
