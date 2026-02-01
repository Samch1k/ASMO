# Архитектура

> Техническая документация для разработчиков и архитекторов

## Обзор

AI1st Framework — это система мультиагентной оркестрации, реализующая методологию BMAD (Business-driven Multi-Agent Development). Она обеспечивает адаптивный выбор workflows, управление жизненным циклом задач и структурированные процессы принятия решений.

**Пакет:** `@ai1st/core` (npm)

**Стек:** TypeScript, PostgreSQL, LRU-cache, Commander.js, tsup

## Диаграмма архитектуры

```
┌─────────────────────────────────────────────────────────────────┐
│                      AI1ST Framework                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │  WorkflowEngine  │  │ ComplexityAnalyzer│  │  TaskManager   │ │
│  │  ─────────────── │  │  ──────────────── │  │  ──────────── │ │
│  │  • execute()     │  │  • analyzeTask()  │  │  • createTask()│ │
│  │  • adaptive      │  │  • score 0-100    │  │  • lifecycle   │ │
│  │    selection     │  │  • level mapping  │  │  • events      │ │
│  └──────────────────┘  └──────────────────┘  └────────────────┘ │
│           │                     │                    │           │
│           └─────────────────────┼────────────────────┘           │
│                                 ↓                                │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │  YoloModeManager │  │ BrainstormSession │  │ TemplateEngine │ │
│  │  ─────────────── │  │  ──────────────── │  │  ──────────── │ │
│  │  • threshold: 30 │  │  • 4 раунда       │  │  • XML/MD      │ │
│  │  • audit trail   │  │  • ADR генерация  │  │  • валидация   │ │
│  │  • bypass logic  │  │  • конвергенция   │  │  • рендеринг   │ │
│  └──────────────────┘  └──────────────────┘  └────────────────┘ │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    TaskPersister                          │   │
│  │  • PostgreSQL + LRU cache (1000 items, 5min TTL)         │   │
│  │  • Connection pooling (max: 20)                          │   │
│  │  • tasks, task_executions, task_comments                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Основные компоненты

### WorkflowEngine

Центральный оркестратор, управляющий выполнением workflows.

```typescript
class WorkflowEngine {
  async execute(
    taskOrWorkflowId: string,
    context?: Record<string, unknown>,
    options?: ExecuteOptions
  ): Promise<WorkflowResult>

  async selectWorkflowAdaptively(
    taskDescription: string,
    context?: ProjectContext
  ): Promise<WorkflowSelection>

  async executePartyMode(
    task: string,
    agents: string[],
    initialState?: Partial<AgentState>,
    options?: PartyModeOptions
  ): Promise<PartySession>
}
```

### ComplexityAnalyzer

Эвристическая оценка сложности задачи (0-100).

```typescript
interface ComplexityScore {
  score: number           // 0-100
  level: ComplexityLevel  // trivial|simple|medium|complex|enterprise
  confidence: number      // 0.0-1.0
  reasoning: string
  factors: ComplexityFactors
  recommendedAgents: string[]
  recommendedWorkflow: string
}
```

### TaskManager

Высокоуровневое управление жизненным циклом задач с PostgreSQL и LRU-кэшированием.

```typescript
interface Task {
  id: string
  title: string
  description?: string
  status: 'created' | 'assigned' | 'in_progress' | 'completed' | 'failed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  complexityScore?: number
  assignedAgent?: string
  workflowId?: string
}
```

## Структура файлов

```
packages/
├── core/                         # @ai1st/core пакет
│   ├── src/
│   │   ├── orchestration/       # Workflow engine, analyzers
│   │   ├── agents/              # Реализации агентов
│   │   └── templates/           # Template engine
│   ├── templates/               # JSON конфигурации
│   └── tests/                   # Юнит тесты
├── cli/                         # @ai1st/cli пакет
└── docs/                        # VitePress документация
```

## См. также

- [Агенты](./agents.md) — архитектура агентов
- [Workflows](./workflows.md) — система workflows
- [Конфигурация](../getting-started/configuration.md) — опции настройки
