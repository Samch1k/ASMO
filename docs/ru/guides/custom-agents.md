# Кастомные агенты

Узнайте, как создавать собственные специализированные агенты для AI1st.

## Обзор

Кастомные агенты позволяют:

- Добавить доменную экспертизу
- Интегрировать с проприетарными инструментами
- Настроить поведение агентов
- Расширить возможности AI1st

## Структура агента

Каждый агент имеет следующие компоненты:

```json
{
  "id": "my-custom-agent",
  "name": "My Custom Agent",
  "description": "Делает что-то конкретное...",
  "category": "project_specific",
  "role_type": "hybrid",
  "can_modify_code": true,
  "requires_plan": false,
  "required_skills": ["skill1", "skill2"],
  "optional_skills": ["skill3"],
  "priority": 5,
  "allowed_mcps": ["filesystem", "memory"],
  "activation_rules": {
    "type": "auto_attached",
    "trigger_keywords": ["keyword1", "keyword2"],
    "task_types": ["task_type"]
  },
  "agent_class": "MyCustomAgent",
  "metadata": {
    "llm_temperature": 0.2,
    "max_tokens": 8192,
    "domain": "My Domain"
  }
}
```

## Шаг 1: Определите роль

Создайте JSON файл в вашем проекте:

```json
// .ai1st/roles/payment-specialist.json
{
  "id": "payment-specialist",
  "name": "Payment Specialist",
  "description": "Обрабатывает интеграцию платежей, Stripe API и транзакции",
  "category": "project_specific",
  "role_type": "hybrid",
  "can_modify_code": true,
  "requires_plan": true,
  "required_skills": [
    "payment_integration",
    "stripe_api",
    "security"
  ],
  "priority": 8,
  "allowed_mcps": ["filesystem", "context7", "stripe"],
  "activation_rules": {
    "type": "auto_attached",
    "trigger_keywords": ["payment", "stripe", "checkout", "платёж"],
    "task_types": ["payment", "integration"]
  },
  "metadata": {
    "llm_temperature": 0.1,
    "max_tokens": 8192,
    "domain": "Payment Processing"
  }
}
```

## Шаг 2: Создайте класс агента

Реализуйте логику агента:

```typescript
// .ai1st/agents/payment-specialist.ts
import { BaseAgent, AgentState, AgentResult } from '@ai1st/core'

export class PaymentSpecialistAgent extends BaseAgent {
  readonly id = 'payment-specialist'
  readonly name = 'Payment Specialist'

  async execute(state: AgentState): Promise<AgentResult> {
    const { task, context } = state

    // 1. Анализ задачи
    const analysis = await this.analyzeTask(task)

    // 2. Проверка безопасности
    if (analysis.requiresSecurity) {
      await this.runSecurityCheck(context)
    }

    // 3. Реализация платёжной логики
    const implementation = await this.implement(task, context)

    // 4. Генерация тестов
    const tests = await this.generateTests(implementation)

    return {
      success: true,
      output: { analysis, implementation, tests },
      artifacts: [
        { type: 'code', path: implementation.filePath },
        { type: 'test', path: tests.filePath }
      ]
    }
  }
}
```

## Шаг 3: Зарегистрируйте агента

```typescript
// .ai1st/config/agents.config.ts
import { PaymentSpecialistAgent } from '../agents/payment-specialist'

export default {
  customAgents: [PaymentSpecialistAgent],
  customRoles: ['.ai1st/roles/payment-specialist.json']
}
```

## Шаг 4: Используйте агента

### В Workflows

```json
{
  "steps": [
    {
      "order": 1,
      "role_id": "payment-specialist",
      "phase": "implementation"
    }
  ]
}
```

### В Party Mode

```typescript
const session = await engine.executePartyMode(
  'Спроектировать checkout flow',
  ['architect', 'payment-specialist', 'security-specialist']
)
```

## Лучшие практики

1. **Единая ответственность** — каждый агент фокусируется на одном домене
2. **Чёткие правила активации** — используйте специфичные ключевые слова
3. **Подходящий приоритет** — устанавливайте по важности
4. **Правильная обработка ошибок** — всегда обрабатывайте ошибки
5. **Тестирование** — пишите тесты для агента

## См. также

- [Концепция агентов](../concepts/agents.md)
- [Каталог агентов](../reference/agents/index.md)
- [Кастомные Workflows](./custom-workflows.md)
