# Агент Test Architect (TEA)

Test Engineering Architect для комплексной тест-стратегии и обеспечения качества.

## Обзор

Агент Test Architect (TEA) проектирует и контролирует стратегии тестирования для программных проектов. Он занимается риск-ориентированным тестированием, quality gates, проверкой релизной готовности и фреймворками автоматизации тестирования.

## Возможности

| Навык | Описание |
|-------|----------|
| `test_strategy` | Комплексное планирование тестирования |
| `risk_based_testing` | Приоритизированный выбор тестов |
| `quality_gates` | Определение критериев качества |
| `release_readiness` | Валидация релизной готовности |
| `test_automation` | Проектирование фреймворков автоматизации |
| `regression_analysis` | Оценка влияния регрессии |
| `test_maintenance` | Оптимизация тест-сьютов |
| `coverage_analysis` | Стратегии покрытия кода |

## TEA Workflows

Агент Test Architect поддерживает 8 специализированных тестовых workflow:

| Workflow | Описание |
|----------|----------|
| `tea-1-risk-assessment` | Выявление рисков и приоритетов тестирования |
| `tea-2-test-strategy` | Определение комплексного подхода к тестированию |
| `tea-3-test-design` | Проектирование тест-кейсов и сценариев |
| `tea-4-test-automation` | Настройка фреймворка автоматизации |
| `tea-5-quality-gates` | Определение критериев качества |
| `tea-6-release-readiness` | Валидация критериев релиза |
| `tea-7-regression-analysis` | Анализ влияния регрессии |
| `tea-8-test-maintenance` | Оптимизация тест-сьюта |

## Конфигурация

```yaml
# agents.yaml
test-architect:
  id: test-architect
  name: Test Architect
  model_preference: sonnet
  role:
    id: test-architect
    seniority: lead
    expertise:
      - test_strategy
      - quality_engineering
      - automation_frameworks
```

## Использование

```typescript
import { TestArchitectAgent } from '@asmo/core'

const tea = new TestArchitectAgent()

const result = await tea.execute({
  task: 'Создать тест-стратегию для модуля обработки платежей',
  context: {
    module: 'payments',
    riskLevel: 'high',
    coverage: { current: 45, target: 80 }
  }
})

console.log(result.context.testStrategy)
console.log(result.context.qualityGates)
```

## Компоненты тест-стратегии

### Оценка рисков
- Анализ бизнес-влияния
- Оценка технической сложности
- Исторические паттерны дефектов
- Идентификация точек интеграции

### Quality Gates
- Пороги покрытия кода
- Бенчмарки производительности
- Требования security-сканирования
- Полнота документации

### Фреймворк автоматизации
- Выбор инструментов (Jest, Playwright и др.)
- Интеграция с CI/CD
- Стратегия параллельного выполнения
- Отчётность и дашборды

## Выходные артефакты

- Документ тест-стратегии
- Матрица оценки рисков
- Определения Quality Gates
- Тест-план
- Спецификация фреймворка автоматизации

## MCP интеграции

- **Filesystem MCP**: Анализирует существующие тесты и код
- **Memory MCP**: Отслеживает историю тестов и паттерны
- **Context7 MCP**: Ссылается на лучшие практики тестирования

## См. также

- [Руководство по TEA Testing](/docs/ru/guides/tea-testing.md)
- [Workflow Quality Assurance](/docs/ru/reference/workflows/3-quality-assurance.md)
- [Агент Tester](/docs/ru/reference/agents/core/tester.md)
