# Кастомные Workflows

Узнайте, как создавать проектные workflows для AI1st.

## Обзор

Кастомные workflows позволяют:

- Определить проектные процессы
- Настроить последовательность агентов
- Добавить кастомные фазы и checkpoint'ы
- Интегрировать с вашими инструментами

## Структура Workflow

```json
{
  "id": "my_workflow",
  "name": "My Custom Workflow",
  "description": "Что делает этот workflow",
  "trigger_condition": {
    "keywords": ["keyword1", "keyword2"],
    "task_types": ["task_type"],
    "required_skills": ["skill1", "skill2"],
    "complexity_range": ["medium", "complex"]
  },
  "steps": [
    {
      "order": 1,
      "role_id": "agent_id",
      "phase": "phase_name",
      "description": "Что делает этот шаг",
      "deliverables": ["output1", "output2"],
      "exit_criteria": "Когда переходить дальше",
      "timeout": "30m"
    }
  ],
  "estimated_time": "2h",
  "success_criteria": "Definition of done"
}
```

## Шаг 1: Определите Workflow

```json
// .ai1st/workflows/deployment-workflow.json
{
  "id": "safe_deployment",
  "name": "Safe Deployment Workflow",
  "description": "Деплой с возможностью отката и мониторингом",
  "trigger_condition": {
    "keywords": ["deploy", "release", "деплой"],
    "task_types": ["deployment"],
    "required_skills": ["deployment", "monitoring"]
  },
  "steps": [
    {
      "order": 1,
      "role_id": "tester",
      "phase": "pre_deployment_testing",
      "description": "Запуск полного тест-сьюта",
      "deliverables": ["test_results", "coverage_report"],
      "exit_criteria": "Все тесты проходят с >80% coverage",
      "timeout": "30m"
    },
    {
      "order": 2,
      "role_id": "devops",
      "phase": "staging_deployment",
      "description": "Деплой на staging",
      "timeout": "15m"
    },
    {
      "order": 3,
      "role_id": "devops",
      "phase": "production_deployment",
      "requires_approval": true,
      "timeout": "30m"
    }
  ],
  "estimated_time": "2h",
  "success_criteria": "Production деплой успешен"
}
```

## Шаг 2: Параллельное выполнение

```json
{
  "steps": [
    {
      "order": 1,
      "role_id": "architect",
      "phase": "design",
      "parallel_with": ["ux-designer"]
    },
    {
      "order": 1,
      "role_id": "ux-designer",
      "phase": "design",
      "parallel_with": ["architect"]
    },
    {
      "order": 2,
      "role_id": "developer",
      "phase": "implementation"
    }
  ]
}
```

## Шаг 3: Зарегистрируйте Workflow

```typescript
// .ai1st/config/workflows.config.ts
export default {
  customWorkflows: [
    '.ai1st/workflows/deployment-workflow.json'
  ]
}
```

## Шаг 4: Используйте Workflow

### По ID

```typescript
const result = await engine.executeWorkflow('safe_deployment', {
  version: '1.2.3',
  environment: 'production'
})
```

### Адаптивный выбор

```typescript
const result = await engine.execute('Задеплоить версию 1.2.3 в production')
// Совпадает с keywords: deploy, production
// Выбран workflow: safe_deployment
```

## Свойства шагов

| Свойство | Обязательно | Описание |
|----------|-------------|----------|
| `order` | Да | Порядок выполнения (1, 2, 3...) |
| `role_id` | Да | Агент для выполнения |
| `phase` | Да | Название фазы |
| `deliverables` | Да | Ожидаемые результаты |
| `exit_criteria` | Да | Условие успеха |
| `timeout` | Да | Макс. время выполнения |
| `parallel_with` | Нет | Агенты для параллельного запуска |
| `requires_approval` | Нет | Требует утверждения |

## Лучшие практики

1. **Чёткие названия фаз** — `pre_deployment_testing`, не `step1`
2. **Специфичные критерии выхода** — `Все тесты проходят с >80% coverage`
3. **Реалистичные таймауты** — соответствуют реальному времени
4. **Значимые артефакты** — `test_results`, `deployment_logs`
5. **Утверждения для рисковых шагов** — `requires_approval: true`

## См. также

- [Концепция Workflows](../concepts/workflows.md)
- [Каталог Workflows](../reference/workflows/index.md)
- [Кастомные агенты](./custom-agents.md)
