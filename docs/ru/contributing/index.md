# Участие в разработке

Руководство для контрибьюторов AI1st.

## Быстрый старт

```bash
# 1. Fork репозитория
git clone https://github.com/YOUR_USERNAME/ai1st-orchestration.git
cd ai1st-orchestration

# 2. Установка зависимостей
pnpm install

# 3. Создание ветки
git checkout -b feature/my-feature

# 4. Разработка
pnpm dev

# 5. Тестирование
pnpm test

# 6. Создание PR
git push origin feature/my-feature
```

## Разделы

| Раздел | Описание |
|--------|----------|
| [Настройка окружения](./setup.md) | Установка и конфигурация |
| [Стандарты кода](./coding-standards.md) | Стиль и соглашения |
| [Тестирование](./testing.md) | Написание и запуск тестов |

## Типы вклада

### 🐛 Баг-репорты

1. Проверьте [существующие issues](https://github.com/Samch1k/ai1st-orchestration/issues)
2. Создайте issue с шаблоном Bug Report
3. Включите:
   - Шаги воспроизведения
   - Ожидаемое поведение
   - Фактическое поведение
   - Версия и окружение

### ✨ Новые функции

1. Обсудите в [Discussions](https://github.com/Samch1k/ai1st-orchestration/discussions)
2. Создайте issue с шаблоном Feature Request
3. Дождитесь одобрения перед реализацией

### 📝 Документация

- Исправления опечаток
- Улучшение примеров
- Новые руководства
- Переводы

### 🧪 Тесты

- Увеличение покрытия
- Тесты для edge cases
- Performance тесты

## Процесс Pull Request

### 1. Создание ветки

```bash
# Для функций
git checkout -b feature/описание

# Для багов
git checkout -b fix/описание

# Для документации
git checkout -b docs/описание
```

### 2. Коммиты

Используйте Conventional Commits:

```bash
feat: добавить новую функцию
fix: исправить баг
docs: обновить документацию
test: добавить тесты
refactor: рефакторинг кода
chore: обновить зависимости
```

### 3. Проверки

Перед созданием PR:

```bash
pnpm lint        # Линтинг
pnpm typecheck   # TypeScript
pnpm test        # Тесты
pnpm build       # Сборка
```

### 4. Описание PR

- Что изменено
- Почему изменено
- Как тестировать
- Screenshots (если UI)

## Code Review

### Критерии

- ✅ Проходят все тесты
- ✅ Нет ошибок линтера
- ✅ Соответствует стандартам
- ✅ Документация обновлена
- ✅ Покрытие не уменьшилось

### Процесс

1. Автоматические проверки (CI)
2. Ревью мейнтейнером
3. Запрос изменений (если нужно)
4. Одобрение и merge

## Ресурсы

- [GitHub Issues](https://github.com/Samch1k/ai1st-orchestration/issues)
- [Discussions](https://github.com/Samch1k/ai1st-orchestration/discussions)
- [Code of Conduct](https://github.com/Samch1k/ai1st-orchestration/blob/main/CODE_OF_CONDUCT.md)

## См. также

- [Архитектура](../concepts/architecture.md)
- [Справочник API](../reference/api/index.md)
