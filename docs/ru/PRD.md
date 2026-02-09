# Product Requirements Document (PRD)

# AI1st Orchestration System (ASMO)

> **Версия:** 1.1.0  
> **Дата:** 9 февраля 2026  
> **Статус:** В разработке  
> **Автор:** AI1st Team

---

## Содержание

1. [Обзор продукта](#1-обзор-продукта)
2. [Бизнес-контекст](#2-бизнес-контекст)
3. [Функциональные требования](#3-функциональные-требования)
4. [Нефункциональные требования](#4-нефункциональные-требования)
5. [Архитектурные решения](#5-архитектурные-решения)
6. [Каталог Workflow-ов](#6-каталог-workflow-ов)
7. [Каталог агентов](#7-каталог-агентов)
8. [Технический стек](#8-технический-стек)
9. [User Personas](#9-user-personas)
10. [Use Cases](#10-use-cases)
11. [Модель данных](#11-модель-данных)
12. [API Reference](#12-api-reference)
13. [Стратегия тестирования](#13-стратегия-тестирования)
14. [Deployment & Operations](#14-deployment--operations)
15. [Roadmap](#15-roadmap)
16. [Риски и митигация](#16-риски-и-митигация)
17. [Метрики успеха](#17-метрики-успеха)

---

## 1. Обзор продукта

### 1.1 Название и версия

- **Название:** AI1st Orchestration System (ASMO)
- **Пакеты:** `@asmo/core`, `@asmo/cli`
- **Текущая версия:** 1.1.0

### 1.2 Краткое описание

ASMO — это многоагентная система оркестрации на TypeScript, реализующая методологию BMAD (Business-driven Multi-Agent Development). Система обеспечивает адаптивный выбор workflow-ов, интеллектуальную маршрутизацию задач к агентам и автоматизированный анализ сложности.

### 1.3 Проблема

Современные инструменты разработки с LLM страдают от:

- **Высокой стоимости** API-вызовов при разработке
- **Отсутствия структурированных workflow-ов** для сложных задач
- **Зависимости от внешних библиотек** (LangGraph и подобные)
- **Ручной маршрутизации** задач между специализированными агентами
- **Отсутствия адаптивного анализа** сложности задач

### 1.4 Ценностное предложение

| Проблема                    | Решение ASMO                                                   |
| --------------------------- | -------------------------------------------------------------- |
| Высокая стоимость LLM       | **Dual LLM Strategy**: Session ($0) → API ($$$) → Heuristics   |
| Зависимости от библиотек    | **Native TypeScript**: замена LangGraph на DynamicOrchestrator |
| Ручная маршрутизация        | **TaskRouter**: автоматический выбор модели и агента           |
| Простые approvals           | **YOLO Mode**: auto-bypass для trivial задач (score < 30)      |
| Разрозненная работа агентов | **Party Mode**: параллельная коллаборация + brainstorming      |

### 1.5 Целевая аудитория

1. **Разработчики LLM-систем** — используют ASMO как фреймворк для автоматизации разработки
2. **Архитекторы ПО** — применяют structured decision-making (ADR через BrainstormingSession)
3. **DevOps-инженеры** — используют автоматизацию deployment и monitoring workflows

---

## 2. Бизнес-контекст

### 2.1 Рыночная ниша

ASMO позиционируется как **lightweight, native TypeScript** альтернатива тяжелым orchestration frameworks:

| Характеристика     | ASMO                 | LangGraph | Другие    |
| ------------------ | -------------------- | --------- | --------- |
| Язык               | TypeScript           | Python    | Python/JS |
| Зависимости        | Minimal              | Heavy     | Medium    |
| Cost Strategy      | Dual (Session + API) | API only  | API only  |
| Built-in Agents    | 25                   | Generic   | Generic   |
| Built-in Workflows | 26                   | None      | Few       |

### 2.2 Уникальные преимущества

1. **Dual LLM Strategy** — $0 для development через Session, pay-per-use для production
2. **25 специализированных агентов** — от Architect до Adversarial Reviewer
3. **27 workflows** — от quick-fix до enterprise architecture design
4. **BMAD Method** — structured decision-making с Adversarial Review и Context Cascade
5. **YOLO Mode** — автоматический bypass approvals для простых задач
6. **Native TypeScript** — zero external orchestration dependencies

### 2.3 Основные метрики

- **Agents:** 25 (6 core + 15 specialized + 4 validation)
- **Workflows:** 26 directories
- **Skills:** 236 files
- **LLM Routing:** Haiku (0-30) → Sonnet (31-70) → Opus (71-100)
- **Complexity Levels:** 5 (trivial → simple → medium → complex → enterprise)

---

## 3. Функциональные требования

### FR-1: Task Analysis & Routing

**Компоненты:**

- `ComplexityAnalyzer` — анализ сложности задач (score 0-100, 5 levels)
- `WorkflowSelector` — выбор workflow на основе complexity
- `TaskRouter` — маршрутизация к модели и агенту
- `SkillMatcher` — LLM-based matching навыков к агентам

**Acceptance Criteria:**

| Критерий | Описание                                                            |
| -------- | ------------------------------------------------------------------- |
| AC-1.1   | Система должна классифицировать задачу по 5 уровням сложности       |
| AC-1.2   | Точность рекомендации workflow ≥ 77%                                |
| AC-1.3   | Routing должен выбирать модель на основе complexity score           |
| AC-1.4   | При низкой confidence (< 0.5) — запрос подтверждения у пользователя |

**Complexity Factors (8):**

```typescript
interface ComplexityFactors {
  filesAffected: number // +5..+35 баллов
  dependencies: number // +0..+30 баллов
  riskLevel: 'low' | 'medium' | 'high' // +5..+25 баллов
  domainExpertiseRequired: boolean // +0/+15 баллов
  estimatedLOC: number // +5..+30 баллов
  dataChanges: boolean // +0/+20 баллов
  securityImpact: boolean // +0/+15 баллов
  performanceImpact: boolean // +0/+10 баллов
}
```

**Model Routing:**

| Complexity     | Score  | Модель | Примеры задач                  |
| -------------- | ------ | ------ | ------------------------------ |
| Trivial/Simple | 0-30   | Haiku  | Quick fixes, docs, formatting  |
| Medium/Complex | 31-70  | Sonnet | Features, bugs, code review    |
| Enterprise     | 71-100 | Opus   | Architecture, security, design |

**Приоритет:** P0 (Critical)

---

### FR-2: Workflow Execution Engine

**Компоненты:**

- `WorkflowEngine` — центральный orchestrator
- `DynamicOrchestrator` — native TypeScript замена LangGraph
- `PhaseManager` — управление фазами выполнения
- `IterationManager` — retry с exponential backoff
- `ApprovalCheckpoint` — точки одобрения
- `YoloModeManager` — auto-bypass для простых задач
- `AgentExecutor` — выполнение агентов с reliability
- `ContextCascade` — каскадный поток контекста между фазами

**Acceptance Criteria:**

| Критерий | Описание                                                                |
| -------- | ----------------------------------------------------------------------- |
| AC-2.1   | Выполнение workflow с поддержкой всех фаз                               |
| AC-2.2   | Автоматические retry при retryable errors (max 3)                       |
| AC-2.3   | YOLO mode для задач с complexity < 30                                   |
| AC-2.4   | Circuit Breaker активация при 5 consecutive failures                    |
| AC-2.5   | Context cascade между фазами (Product Brief → PRD → Architecture → ...) |

**Workflow Lifecycle:**

```
Pending → Running → Waiting (approval) → Completed/Failed
```

**Context Cascade Dependencies:**

| Workflow              | Требует                              |
| --------------------- | ------------------------------------ |
| `create-prd`          | product-brief                        |
| `create-architecture` | prd, ux-design                       |
| `create-epics`        | prd, architecture                    |
| `create-story`        | epics, prd, architecture             |
| `dev-story`           | story, architecture, project-context |

**Приоритет:** P0 (Critical)

---

### FR-3: Multi-Agent Collaboration

**Компоненты:**

- Sequential execution (default)
- `PartySession` — параллельное выполнение + convergence
- `BrainstormingSession` — 4-round structured decision making
- `AdversarialReview` — критический review с обязательным нахождением issues

**BrainstormingSession Rounds:**

| Round | Фаза                    | Описание                                  |
| ----- | ----------------------- | ----------------------------------------- |
| 1     | `independent_proposals` | Независимые предложения от каждого агента |
| 2     | `cross_critique`        | Критика предложений другими агентами      |
| 3     | `synthesis`             | Синтез лучших идей                        |
| 4     | `decision`              | Финальное решение + генерация ADR         |

**Acceptance Criteria:**

| Критерий | Описание                                                           |
| -------- | ------------------------------------------------------------------ |
| AC-3.1   | Поддержка sequential, parallel и brainstorming modes               |
| AC-3.2   | Генерация ADR в конце BrainstormingSession                         |
| AC-3.3   | Adversarial review должен находить минимум N issues (configurable) |

**Приоритет:** P1 (High)

---

### FR-4: Adaptive Phase Detection

**Компоненты:**

- `ContextAnalyzer` — сканирование артефактов (code, tests, docs, git history)
- `PhaseDetector` — LLM-based определение стартовой фазы

**Acceptance Criteria:**

| Критерий | Описание                                                                |
| -------- | ----------------------------------------------------------------------- |
| AC-4.1   | Корректное определение стартовой фазы на основе существующих артефактов |
| AC-4.2   | Возврат confidence score                                                |
| AC-4.3   | Предложение альтернативных фаз при низкой уверенности                   |

**Приоритет:** P1 (High)

---

### FR-5: LLM Provider Layer

**Компоненты:**

- `LLMProviderFactory` — фабрика провайдеров
- `SessionProvider` — $0 через Claude CLI (`claude -p`)
- `AnthropicProvider` — pay-per-use через Anthropic API

**Fallback Chain:**

```
SessionProvider ($0) → AnthropicProvider ($$) → Heuristics (fallback)
```

**Acceptance Criteria:**

| Критерий | Описание                                        |
| -------- | ----------------------------------------------- |
| AC-5.1   | SessionProvider как primary (cost optimization) |
| AC-5.2   | Fallback на API при недоступности Session       |
| AC-5.3   | Fallback на Heuristics при полном отказе LLM    |

**Приоритет:** P0 (Critical)

---

### FR-6: MCP Integration

**MCP Servers (8):**

| Priority | Server       | Назначение               |
| -------- | ------------ | ------------------------ |
| P0       | `memory`     | Knowledge graph storage  |
| P0       | `supabase`   | Database integration     |
| P0       | `filesystem` | File I/O                 |
| P1       | `context7`   | Library documentation    |
| P1       | `github`     | Repository management    |
| P1       | `playwright` | Browser automation (E2E) |
| P2       | `render`     | Backend deployment logs  |
| P2       | `vercel`     | Frontend deployment logs |

**Приоритет:** P0 (Critical)

---

### FR-7: Configuration Management

**Компоненты:**

- `ConfigManager` — 3-tier конфигурация
- `ConfigLoader` — загрузка ролей, скиллов, workflows
- `RoleManager` — управление ролями агентов
- `PromptLoader` — загрузка промптов
- `SkillMDLoader` — парсинг SKILL.md файлов

**3-Tier Configuration:**

```
Bundled Templates (fallback) → Config File (~/.asmo/config) → Environment Variables
```

**Fallback Paths:**

```
.cursor/config → ~/.asmo/config → packages/core/templates/
```

**Приоритет:** P0 (Critical)

---

### FR-8: Persistence Layer

**Компоненты:**

- `TaskPersister` — PostgreSQL + LRU cache для задач
- Database Schema: `tasks`, `task_executions`, `task_comments`

**Database Schema:**

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  status VARCHAR(20) DEFAULT 'created',
  priority VARCHAR(20) DEFAULT 'medium',
  complexity_score INTEGER,
  complexity_level VARCHAR(20),
  assigned_agent VARCHAR(100),
  workflow_id VARCHAR(100),
  parent_task_id UUID REFERENCES tasks(id),
  metadata JSONB DEFAULT '{}'
);
```

**Приоритет:** P1 (High)

---

## 4. Нефункциональные требования

### NFR-1: Performance

| Метрика                 | Target                     |
| ----------------------- | -------------------------- |
| Время анализа сложности | < 5 секунд                 |
| Workflow selection      | < 2 секунды                |
| Agent execution timeout | Configurable (default 30s) |
| Max concurrent agents   | 10                         |

### NFR-2: Reliability

| Метрика                   | Target                    |
| ------------------------- | ------------------------- |
| Circuit Breaker threshold | 5 consecutive failures    |
| Max retries               | 3 (exponential backoff)   |
| Error categorization      | 100% (retryable vs fatal) |
| System uptime             | ≥ 99%                     |

### NFR-3: Scalability

| Метрика               | Target |
| --------------------- | ------ |
| Workflow definitions  | 100+   |
| Agent definitions     | 100+   |
| Skill definitions     | 500+   |
| Concurrent executions | 50     |

### NFR-4: Maintainability

| Метрика                | Target           |
| ---------------------- | ---------------- |
| TypeScript strict mode | 100%             |
| Test coverage          | ≥ 80%            |
| JSDoc coverage         | ≥ 90% public API |
| Zero TypeScript errors | Required         |

### NFR-5: Security

- API keys через environment variables only
- No sensitive data в logs
- MCP access role-based restrictions
- Zod validation для всех user inputs

---

## 5. Архитектурные решения

### ADR-001: Dual LLM Strategy

**Решение:** SessionProvider ($0) как primary, AnthropicProvider ($$) как fallback.  
**Обоснование:** Cost optimization для development (80% use cases).  
**Компромиссы:** Зависимость от Claude CLI availability.

### ADR-002: Native TypeScript Orchestration

**Решение:** Заменить LangGraph на DynamicOrchestrator.  
**Обоснование:** Уменьшение зависимостей, полный контроль, -400 lines of code.  
**Компромиссы:** Поддержка кастомного решения.

### ADR-003: LLM-First Intelligence

**Решение:** ComplexityAnalyzer, PhaseDetector, SkillMatcher используют LLM.  
**Обоснование:** Более точные результаты vs heuristics.  
**Компромиссы:** Зависимость от LLM availability.

### ADR-004: 3-Tier Configuration Cascade

**Решение:** defaults → config file → env vars.  
**Обоснование:** Гибкость + ease-of-use для npm package.

### ADR-005: Singleton Pattern

**Решение:** 17+ singletons с `getX()`/`resetX()`.  
**Обоснование:** Thread-safe доступ, глобальное состояние.

### ADR-006: YOLO Mode

**Решение:** Auto-bypass approvals для score < 30.  
**Обоснование:** UX optimization для простых задач.

### ADR-007: Circuit Breaker

**Решение:** CircuitBreakerManager с state machine (CLOSED → OPEN → HALF_OPEN).  
**Обоснование:** Защита от cascading failures.

### ADR-008: Context Cascade

**Решение:** Cascading context flow между workflow phases.  
**Обоснование:** Обеспечение консистентности при сложных workflow.

---

## 6. Каталог Workflow-ов

### 6.1 Обзор

**Всего:** 26 workflow directories

### 6.2 Discovery & Planning Workflows

| ID                                | Название           | Сложность | Описание                        |
| --------------------------------- | ------------------ | --------- | ------------------------------- |
| 11-adversarial-review             | Adversarial Review | Complex   | Критический code review         |
| 12-create-product-brief           | Product Brief      | Medium    | Стратегическое видение продукта |
| 13-create-prd                     | Create PRD         | Complex   | Product Requirements Document   |
| 14-create-ux-design               | UX Design          | Medium    | UX спецификации и wireframes    |
| 15-create-epics-and-stories       | Epics & Stories    | Medium    | Разбивка на work units          |
| 16-check-implementation-readiness | Readiness Check    | Medium    | Gate validation                 |
| 17-sprint-planning                | Sprint Planning    | Medium    | Инициализация спринта           |

### 6.3 Implementation Workflows

| ID                         | Название             | Сложность  | Time |
| -------------------------- | -------------------- | ---------- | ---- |
| 1-quick-flow               | Quick Flow           | Trivial    | 30m  |
| 2-feature-development      | Feature Development  | Medium     | 2.5h |
| 3-quality-assurance        | Quality Assurance    | Medium     | 35m  |
| 4-bug-fix                  | Bug Fix              | Simple     | 1h   |
| 5-refactoring              | Refactoring          | Medium     | 3.5h |
| 6-performance-optimization | Performance          | Complex    | 4h   |
| 7-security-audit           | Security Audit       | Complex    | 6h   |
| 8-architecture-design      | Architecture         | Enterprise | 6h   |
| 9-database-migration       | DB Migration         | Enterprise | 6h+  |
| 10-api-design              | API Design           | Complex    | 6.5h |

### 6.4 Post-Implementation Workflows

| ID                | Название       | Описание                     |
| ----------------- | -------------- | ---------------------------- |
| 18-correct-course | Correct Course | Mid-sprint scope adjustments |
| 19-retrospective  | Retrospective  | Post-epic lessons learned    |
| 20-automate-tests | Automate Tests | Generate test suites         |
| 21-dev-story      | Dev Story      | Story implementation         |
| 22-code-review    | Code Review    | Standard code review         |
| 23-create-story   | Create Story   | User story creation          |

### 6.5 TEA Testing Workflows (3)

**Consolidated from 8 → 3 adaptive workflows (Phase 2 Task #3)**

| ID             | Название                           | Сложность | Time    | Описание                                          |
| -------------- | ---------------------------------- | --------- | ------- | ------------------------------------------------- |
| tea-planning   | TEA Planning                       | Medium    | 3h-5h   | Risk + Strategy + Design (consolidates tea-1,2,3) |
| tea-execution  | TEA Execution                      | Complex   | 3.5h-6h | Automation + Regression + Maintenance (tea-4,7,8) |
| tea-validation | TEA Validation (Quality & Release) | Medium    | 2h-3h   | Quality Gates + Release Readiness (tea-5,6)       |

**Benefits:**
- 62% reduction in workflows (8 → 3)
- Adaptive complexity-based skipping
- Clear linear flow: planning → execution → validation
- Time savings: 36% for simple projects, 15% for medium

---

## 7. Каталог агентов

### 7.1 Обзор

**Всего:** 25 агентов (6 core + 15 specialized + 4 validation)

### 7.2 Core Agents (6)

| ID          | Название  | Role Type | Can Modify Code |
| ----------- | --------- | --------- | --------------- |
| `architect` | Architect | Reasoning | ❌              |
| `developer` | Developer | Execution | ✅              |
| `debugger`  | Debugger  | Hybrid    | ✅              |
| `optimizer` | Optimizer | Hybrid    | ✅              |
| `tester`    | Tester    | Execution | ✅              |
| `devops`    | DevOps    | Execution | ❌              |

### 7.3 Specialized Agents (15)

| ID                     | Название             | Domain             | Role Type |
| ---------------------- | -------------------- | ------------------ | --------- |
| `ui-developer`         | UI Developer         | Frontend           | Execution |
| `ux-designer`          | UX Designer          | User Experience    | Reasoning |
| `business-analyst`     | Business Analyst     | Requirements       | Reasoning |
| `project-manager`      | Project Manager      | Coordination       | Hybrid    |
| `product-owner`        | Product Owner        | Strategy           | Reasoning |
| `scrum-master`         | Scrum Master         | Agile              | Hybrid    |
| `security-specialist`  | Security Specialist  | Security           | Reasoning |
| `performance-engineer` | Performance Engineer | Performance        | Reasoning |
| `data-architect`       | Data Architect       | Database           | Reasoning |
| `api-designer`         | API Designer         | API Contracts      | Reasoning |
| `analyst`              | Analyst              | Strategic Analysis | Reasoning |
| `tech-writer`          | Tech Writer          | Documentation      | Execution |
| `test-architect`       | Test Architect (TEA) | Test Strategy      | Reasoning |
| `adversarial-reviewer` | Adversarial Reviewer | Critical Review    | Reasoning |
| `code-reviewer`        | Code Reviewer        | Code Quality       | Reasoning |

### 7.4 Validation Agents (4)

| ID                       | Название               | Purpose                       |
| ------------------------ | ---------------------- | ----------------------------- |
| `design-validator`       | Design Validator       | Architecture review           |
| `merge-coordinator`      | Merge Coordinator      | Parallel output consolidation |
| `post-deploy-monitor`    | Post-Deploy Monitor    | Deployment health             |
| `requirements-validator` | Requirements Validator | INVEST criteria checking      |

### 7.5 Agent Activation Rules

| Type              | Описание                                    |
| ----------------- | ------------------------------------------- |
| `auto_attached`   | Автоматически по keywords и file patterns   |
| `manual`          | Явное указание в workflow или пользователем |
| `agent_requested` | По запросу другого агента                   |

---

## 8. Технический стек

### 8.1 Runtime

- **Node.js:** ≥ 18.x
- **TypeScript:** 5.x (strict mode)

### 8.2 Core Dependencies

| Пакет       | Назначение        |
| ----------- | ----------------- |
| `anthropic` | Anthropic API SDK |
| `zod`       | Schema validation |
| `commander` | CLI framework     |
| `lru-cache` | In-memory caching |

### 8.3 Build & Monorepo

| Инструмент | Назначение             |
| ---------- | ---------------------- |
| `pnpm`     | Package manager        |
| `turbo`    | Monorepo orchestration |
| `tsup`     | TypeScript bundling    |

### 8.4 Packages

| Package      | Описание               |
| ------------ | ---------------------- |
| `@asmo/core` | Core library           |
| `@asmo/cli`  | Command-line interface |

---

## 9. User Personas

### Persona 1: Sarah — Senior Backend Developer

**Goal:** Автоматизировать проектирование и реализацию complex features.

**Pain Points:**

- Трудоемкость manual complexity analysis
- Переключение между different AI tools
- Высокая стоимость LLM API calls

**How ASMO Helps:**

- ✅ ComplexityAnalyzer автоматически оценивает сложность
- ✅ Unified CLI interface для всех задач
- ✅ SessionProvider ($0) для development

### Persona 2: Alex — Software Architect

**Goal:** Принимать architectural decisions на основе данных.

**Pain Points:**

- Отсутствие structured ADR approach
- Сложность multi-stakeholder brainstorming
- Недостаточная критическая проверка

**How ASMO Helps:**

- ✅ BrainstormingSession → ADR generation
- ✅ AdversarialReview для критической проверки
- ✅ DocumentRegistry для версионирования

### Persona 3: Mike — DevOps Engineer

**Goal:** Автоматизировать deployment и monitoring workflows.

**Pain Points:**

- Ручной rollback при failures
- Отсутствие retrospectives
- Tracking метрик across workflows

**How ASMO Helps:**

- ✅ PostDeployMonitor для smoke testing
- ✅ Retrospective workflow
- ✅ MCP integration с Render/Vercel

---

## 10. Use Cases

### UC-1: Simple Bug Fix (YOLO Mode)

**Сценарий:**

```
User: asmo run "fix typo in README"
→ ComplexityAnalyzer: score = 15, level = trivial
→ YOLO Mode: auto-bypass approvals
→ WorkflowSelector: "4-bug-fix"
→ Debugger agent: executes fix
→ Output: fixed code + commit message
```

**Success Criteria:**

- Execution time < 60 seconds
- No human approval required

### UC-2: Feature Implementation with Brainstorming

**Сценарий:**

```
User: asmo run "implement user authentication"
→ ComplexityAnalyzer: score = 75, level = complex
→ WorkflowSelector: "3-feature-implementation-full"
→ ApprovalCheckpoint: "Start planning?"
→ BrainstormingSession: Architect + Developer + SecuritySpecialist
→ 4 rounds → ADR generated
→ Implementation phase → Tests → Docs
→ Output: PRD + Architecture + Code + Tests
```

**Success Criteria:**

- ADR создан с обоснованием
- Implementation passes all tests

### UC-3: Adversarial Code Review

**Сценарий:**

```
User: asmo run "review PR #123 critically"
→ AdversarialReviewer agent activated
→ Must find minimum 5 issues
→ 3-level escalation if not enough found
→ Output: detailed review with issues
```

**Success Criteria:**

- Minimum issues count found
- Escalation works correctly

---

## 11. Модель данных

### Task

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

```typescript
interface ComplexityScore {
  score: number // 0-100
  level: ComplexityLevel // trivial|simple|medium|complex|enterprise
  confidence: number // 0.0-1.0
  reasoning: string
  factors: ComplexityFactors
  recommendedAgents: string[]
  recommendedWorkflow: string
}
```

### WorkflowResult

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

---

## 12. API Reference

### CLI Commands

```bash
asmo run <task>              # Execute task with auto workflow selection
asmo suggest <task>          # Suggest workflow without execution
asmo analyze <task>          # Analyze complexity only
asmo workflow <workflow-id>  # Execute specific workflow
asmo task <task-id>          # Check task status
```

### Programmatic API (@asmo/core)

```typescript
// Entry point
import { WorkflowEngine } from '@asmo/core'
const engine = new WorkflowEngine()
const result = await engine.execute('Add user auth', context, options)

// Complexity analysis
import { ComplexityAnalyzer } from '@asmo/core'
const analyzer = new ComplexityAnalyzer()
const score = await analyzer.analyzeTask(task, context)

// Orchestration
import { getDynamicOrchestrator } from '@asmo/core'
const orchestrator = getDynamicOrchestrator()
const result = await orchestrator.executeTask(task)

// Brainstorming
const session = await engine.executePartyMode('Design auth system', [
  'architect',
  'security-specialist',
  'developer',
])
```

---

## 13. Стратегия тестирования

### Unit Tests

- **Framework:** Jest + ts-jest
- **Coverage target:** ≥ 80%
- **Scope:** Все core components

### Integration Tests

- Workflow execution end-to-end
- Agent collaboration scenarios
- MCP Bridge integration

### E2E Tests

- CLI commands execution
- Real workflow scenarios (mocked LLM)

**Test Commands:**

```bash
pnpm test              # Run all tests
pnpm test:coverage     # With coverage report
pnpm test:watch        # Watch mode
```

---

## 14. Deployment & Operations

### Installation

```bash
# Global CLI
npm install -g @asmo/cli

# Library usage
npm install @asmo/core
```

### Configuration

**Fallback Chain:**

```
.cursor/config → ~/.asmo/config → bundled templates
```

**Environment Variables:**

```bash
ANTHROPIC_API_KEY=...
ASMO_CONFIG_PATH=...
ASMO_YOLO_THRESHOLD=30
```

---

## 15. Roadmap

### Version 1.2.0 (Next)

- [ ] Improved Heuristics fallback (v2)
- [ ] Enhanced error messages with hints
- [ ] New workflow: code-generation-from-spec
- [ ] MetricsOptimizer performance improvements

### Version 2.0.0 (Future)

- [ ] Multi-LLM support (OpenAI, Gemini)
- [ ] Web UI for monitoring
- [ ] Cloud-hosted metrics (optional)
- [ ] Team collaboration features

### Version 3.0.0 (Long-term)

- [ ] Self-improving agents
- [ ] Custom agent DSL
- [ ] Community workflow marketplace

---

## 16. Риски и митигация

| Риск                          | Вероятность | Влияние | Митигация                            |
| ----------------------------- | ----------- | ------- | ------------------------------------ |
| LLM API unavailability        | Medium      | High    | Dual LLM + Heuristics fallback       |
| Session CLI deprecation       | Low         | Medium  | AnthropicProvider готов как fallback |
| MCP Server failures           | Medium      | Medium  | Graceful degradation, priorities     |
| Workflow complexity explosion | High        | High    | LearningLoop + MetricsOptimizer      |
| Test coverage degradation     | Medium      | High    | CI/CD enforcement ≥ 80%              |

---

## 17. Метрики успеха

### Product Adoption (6 месяцев)

| Метрика       | Target     |
| ------------- | ---------- |
| npm downloads | 1000/month |
| GitHub stars  | 500        |
| Active users  | 100        |

### Performance

| Метрика                             | Target                   |
| ----------------------------------- | ------------------------ |
| Workflow execution time improvement | -20%                     |
| LLM cost reduction                  | -30% via SessionProvider |

### Quality

| Метрика           | Target   |
| ----------------- | -------- |
| Bug report rate   | < 5/week |
| Test coverage     | ≥ 80%    |
| User satisfaction | ≥ 4.5/5  |

### Developer Experience

| Метрика                    | Target      |
| -------------------------- | ----------- |
| Documentation completeness | 100%        |
| Time-to-first-workflow     | < 5 minutes |
| Issue resolution time      | < 48 hours  |

---

## Приложения

### A. Список файлов проекта

```
packages/
├── core/                    # @asmo/core
│   ├── src/
│   │   ├── orchestration/   # Workflow, Complexity, YOLO, etc.
│   │   ├── agents/          # BaseAgent + 25 specialized
│   │   └── templates/       # Template engine
│   └── templates/
│       ├── roles/           # 5 JSON files
│       ├── workflows/       # 26 directories
│       └── skills/          # 236 files
├── cli/                     # @asmo/cli
└── docs/                    # Documentation
```

### B. Ссылки

- [Architecture Diagram](./architecture-diagram.md)
- [CHANGELOG](../../CHANGELOG.md)
- [Getting Started](./getting-started/installation.md)

---

**Документ создан:** 9 февраля 2026  
**Последнее обновление:** 9 февраля 2026  
**Версия документа:** 1.0.0
