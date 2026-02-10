# Модель данных

## Основные TypeScript-интерфейсы

### Task

Фундаментальная единица работы в ASMO. Каждый вызов CLI создаёт Task, который проходит через конвейер оркестрации.

```typescript
interface Task {
  id: string
  title: string
  description?: string
  status: 'created' | 'assigned' | 'in_progress' | 'completed' | 'failed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  complexityScore?: number
  complexityLevel?: string
  assignedAgent?: string
  workflowId?: string
  parentTaskId?: string
  metadata: Record<string, unknown>
}
```

### ComplexityScore

Формируется `ComplexityAnalyzer`. Определяет выбор workflow, маршрутизацию моделей и решения YOLO-режима.

```typescript
interface ComplexityScore {
  score: number          // 0-100
  level: ComplexityLevel // trivial | simple | medium | complex | enterprise
  confidence: number     // 0.0-1.0
  reasoning: string
  factors: ComplexityFactors
  recommendedAgents: string[]
  recommendedWorkflow: string
}
```

**Пороги уровней сложности:**

| Уровень | Диапазон оценки | Модель | YOLO |
|---------|-----------------|--------|------|
| trivial | 0--15 | Haiku | Да |
| simple | 16--30 | Haiku | Да |
| medium | 31--55 | Sonnet | Нет |
| complex | 56--80 | Sonnet | Нет |
| enterprise | 81--100 | Opus | Нет |

### ComplexityFactors

Индивидуальные факторы оценки, суммирующиеся в итоговую оценку сложности.

```typescript
interface ComplexityFactors {
  filesAffected: number           // +5..+35
  dependencies: number            // +0..+30
  riskLevel: 'low' | 'medium' | 'high'  // +5..+25
  domainExpertiseRequired: boolean       // +0 или +15
  estimatedLOC: number            // +5..+30
  dataChanges: boolean            // +0 или +20
  securityImpact: boolean         // +0 или +15
  performanceImpact: boolean      // +0 или +10
}
```

### WorkflowResult

Возвращается после завершения выполнения workflow. Содержит результаты всех фаз, артефакты и метрики производительности.

```typescript
interface WorkflowResult {
  workflowId: string
  status: 'completed' | 'failed'
  steps: StepResult[]
  artifacts: Artifact[]
  metrics: {
    totalTime: number
    agentsUsed: string[]
    complexityScore: number
  }
}
```

### StepResult

Результат отдельной фазы workflow или шага выполнения агента.

```typescript
interface StepResult {
  stepId: string
  agentId: string
  status: 'completed' | 'failed' | 'skipped'
  output: unknown
  duration: number
  tokensUsed?: number
}
```

### Artifact

Выходной артефакт, созданный агентом при выполнении workflow (файлы кода, тестовые наборы, документация и т.д.).

```typescript
interface Artifact {
  id: string
  type: string
  name: string
  content: string | Buffer
  metadata: Record<string, unknown>
  createdBy: string
  createdAt: Date
}
```

## Слой персистенции

### MetricsPersister (SQLite)

Хранит метрики выполнения workflow и агентов для цикла обучения.

**Таблицы:**

| Таблица | Назначение |
|---------|------------|
| `workflow_metrics` | Статистика выполнения по workflow (длительность, статус, сложность) |
| `agent_step_metrics` | Статистика по шагам агентов (длительность, токены, успех/неудача) |
| `bottleneck_data` | Выявленные узкие места и рекомендации |

### TaskPersister (SQLite / JSON)

Хранит состояние задач, историю выполнения и родительско-дочерние связи.

### DocumentRegistry

Управляет версионированными документами, созданными в процессе выполнения workflow, индексированными по фазам.

## Схема базы данных

```sql
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'created',
  priority TEXT NOT NULL DEFAULT 'medium',
  complexity_score INTEGER,
  complexity_level TEXT,
  assigned_agent TEXT,
  workflow_id TEXT,
  parent_task_id TEXT REFERENCES tasks(id),
  metadata TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workflow_metrics (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  task_id TEXT REFERENCES tasks(id),
  status TEXT NOT NULL,
  total_time_ms INTEGER NOT NULL,
  agents_used TEXT NOT NULL,
  complexity_score INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agent_step_metrics (
  id TEXT PRIMARY KEY,
  workflow_metric_id TEXT REFERENCES workflow_metrics(id),
  agent_id TEXT NOT NULL,
  step_id TEXT NOT NULL,
  status TEXT NOT NULL,
  duration_ms INTEGER NOT NULL,
  tokens_used INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bottleneck_data (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  phase TEXT NOT NULL,
  bottleneck_type TEXT NOT NULL,
  description TEXT,
  recommendation TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Связи сущностей

```
Task 1──* StepResult       (задача порождает несколько результатов шагов)
Task 1──1 ComplexityScore   (у каждой задачи одна оценка сложности)
Task 1──* Artifact          (агенты создают артефакты по задаче)
Task *──1 Workflow          (многие задачи могут ссылаться на шаблон workflow)
Task 1──* Task              (родительско-дочерняя связь через parentTaskId)
WorkflowMetric 1──* AgentStepMetric  (детализация по агентам)
```

## Связанные документы

- [Обзор архитектуры](./README.md)
- [Архитектурная схема](./architecture-diagram.md)
- [API-контракт](./api-contract.md)
