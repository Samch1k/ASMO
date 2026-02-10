# ASMO v3.0+ Implementation Plan
## Устранение пробелов на основе аудита от 2026-02-09

---

## 📋 OVERVIEW

**Total Estimate**: 33-45 часов работы
**Tasks**: 7 (1 P0, 3 P1, 3 P2)
**Goal**: Достичь 100% соответствия заявленному функционалу

---

## 🔴 P0: КРИТИЧНЫЕ ЗАДАЧИ (8-12 часов)

### P0.1: Реализовать Party Mode ⏱️ 8-12h

**Проблема**: Заявленная фича отсутствует (единственная критичная проблема)

**Цель**: Реализовать параллельную multi-agent коллаборацию

#### Шаг 1: Создать `PartyModeManager` (3-4h)

**Файл**: `packages/core/src/orchestration/party-mode-manager.ts`

```typescript
import type { Agent } from '../agents/types'
import type { WorkflowState } from './workflow-engine'

export interface PartyModeConfig {
  enabled: boolean
  maxParallelAgents: number
  coordinationStrategy: 'merge' | 'vote' | 'consensus'
  timeout: number
}

export interface PartyModeResult {
  agentResults: Map<string, any>
  mergedResult: any
  duration: number
  conflicts: string[]
}

export class PartyModeManager {
  constructor(private config: PartyModeConfig) {}

  /**
   * Execute multiple agents in parallel
   */
  async executeParallel(
    agents: Agent[],
    task: string,
    context: WorkflowState
  ): Promise<PartyModeResult> {
    // 1. Validate agent count
    if (agents.length > this.config.maxParallelAgents) {
      throw new Error(`Too many agents: ${agents.length} > ${this.config.maxParallelAgents}`)
    }

    // 2. Execute agents in parallel using Promise.allSettled
    const startTime = Date.now()
    const promises = agents.map(agent =>
      this.executeAgent(agent, task, context)
    )
    const results = await Promise.allSettled(promises)

    // 3. Collect successful results
    const agentResults = new Map<string, any>()
    const errors: string[] = []

    results.forEach((result, index) => {
      const agent = agents[index]
      if (result.status === 'fulfilled') {
        agentResults.set(agent.id, result.value)
      } else {
        errors.push(`${agent.id}: ${result.reason}`)
      }
    })

    // 4. Merge results based on strategy
    const mergedResult = await this.mergeResults(
      agentResults,
      this.config.coordinationStrategy
    )

    // 5. Detect conflicts
    const conflicts = this.detectConflicts(agentResults)

    return {
      agentResults,
      mergedResult,
      duration: Date.now() - startTime,
      conflicts: [...conflicts, ...errors]
    }
  }

  /**
   * Execute single agent with timeout
   */
  private async executeAgent(
    agent: Agent,
    task: string,
    context: WorkflowState
  ): Promise<any> {
    return Promise.race([
      agent.execute({ task, context }),
      this.timeout(this.config.timeout, agent.id)
    ])
  }

  /**
   * Merge results from multiple agents
   */
  private async mergeResults(
    results: Map<string, any>,
    strategy: 'merge' | 'vote' | 'consensus'
  ): Promise<any> {
    switch (strategy) {
      case 'merge':
        return this.mergeStrategy(results)
      case 'vote':
        return this.voteStrategy(results)
      case 'consensus':
        return this.consensusStrategy(results)
      default:
        throw new Error(`Unknown strategy: ${strategy}`)
    }
  }

  /**
   * Merge strategy: combine all results
   */
  private mergeStrategy(results: Map<string, any>): any {
    const merged: any = {
      contributors: Array.from(results.keys()),
      outputs: {},
      artifacts: []
    }

    for (const [agentId, result] of results) {
      merged.outputs[agentId] = result.output
      if (result.artifacts) {
        merged.artifacts.push(...result.artifacts)
      }
    }

    return merged
  }

  /**
   * Vote strategy: majority wins
   */
  private voteStrategy(results: Map<string, any>): any {
    // Count occurrences of each output
    const votes = new Map<string, number>()
    const outputMap = new Map<string, any>()

    for (const [agentId, result] of results) {
      const key = JSON.stringify(result.output)
      votes.set(key, (votes.get(key) || 0) + 1)
      if (!outputMap.has(key)) {
        outputMap.set(key, result)
      }
    }

    // Find majority
    let maxVotes = 0
    let winner = ''
    for (const [key, count] of votes) {
      if (count > maxVotes) {
        maxVotes = count
        winner = key
      }
    }

    return {
      ...outputMap.get(winner),
      votingStats: {
        totalVotes: results.size,
        winnerVotes: maxVotes,
        alternatives: votes.size - 1
      }
    }
  }

  /**
   * Consensus strategy: require agreement
   */
  private consensusStrategy(results: Map<string, any>): any {
    const outputs = Array.from(results.values()).map(r => r.output)
    const first = JSON.stringify(outputs[0])

    const hasConsensus = outputs.every(
      output => JSON.stringify(output) === first
    )

    if (!hasConsensus) {
      throw new Error('No consensus reached among agents')
    }

    return {
      ...results.values().next().value,
      consensus: true,
      agreementLevel: 100
    }
  }

  /**
   * Detect conflicts between agent outputs
   */
  private detectConflicts(results: Map<string, any>): string[] {
    const conflicts: string[] = []
    const outputs = Array.from(results.entries())

    for (let i = 0; i < outputs.length; i++) {
      for (let j = i + 1; j < outputs.length; j++) {
        const [agent1, result1] = outputs[i]
        const [agent2, result2] = outputs[j]

        if (this.hasConflict(result1.output, result2.output)) {
          conflicts.push(
            `Conflict between ${agent1} and ${agent2}: different outputs`
          )
        }
      }
    }

    return conflicts
  }

  /**
   * Check if two outputs conflict
   */
  private hasConflict(output1: any, output2: any): boolean {
    return JSON.stringify(output1) !== JSON.stringify(output2)
  }

  /**
   * Timeout helper
   */
  private timeout(ms: number, agentId: string): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Agent ${agentId} timed out after ${ms}ms`))
      }, ms)
    })
  }
}

/**
 * Singleton instance
 */
let partyModeManager: PartyModeManager | null = null

export function getPartyModeManager(
  config?: Partial<PartyModeConfig>
): PartyModeManager {
  if (!partyModeManager) {
    partyModeManager = new PartyModeManager({
      enabled: true,
      maxParallelAgents: 5,
      coordinationStrategy: 'merge',
      timeout: 30000,
      ...config
    })
  }
  return partyModeManager
}

export function resetPartyModeManager(): void {
  partyModeManager = null
}
```

**Добавить в exports**: `packages/core/src/index.ts`
```typescript
export {
  PartyModeManager,
  getPartyModeManager,
  resetPartyModeManager,
  type PartyModeConfig,
  type PartyModeResult
} from './orchestration/party-mode-manager'
```

#### Шаг 2: Интегрировать с WorkflowEngine (2-3h)

**Файл**: `packages/core/src/orchestration/workflow-engine.ts`

**Изменения**:

1. Добавить в `WorkflowEngineConfig`:
```typescript
export interface WorkflowEngineConfig {
  // ... existing fields
  enablePartyMode?: boolean
  partyModeConfig?: Partial<PartyModeConfig>
}
```

2. Обновить конструктор:
```typescript
constructor(config: WorkflowEngineConfig) {
  // ... existing code

  if (config.enablePartyMode) {
    this.partyModeManager = getPartyModeManager(config.partyModeConfig)
  }
}
```

3. Добавить метод `executeWithPartyMode`:
```typescript
async executeWithPartyMode(
  agents: Agent[],
  task: string,
  state: WorkflowState
): Promise<PartyModeResult> {
  if (!this.partyModeManager) {
    throw new Error('Party mode not enabled')
  }

  console.log(`🎉 [Party Mode] Executing ${agents.length} agents in parallel`)

  const result = await this.partyModeManager.executeParallel(
    agents,
    task,
    state
  )

  // Log conflicts if any
  if (result.conflicts.length > 0) {
    console.warn(`⚠️  [Party Mode] Conflicts detected:`)
    result.conflicts.forEach(c => console.warn(`   - ${c}`))
  }

  // Update metrics
  this.metricsCollector.recordPartyModeExecution({
    agentCount: agents.length,
    duration: result.duration,
    conflicts: result.conflicts.length,
    strategy: this.partyModeManager.config.coordinationStrategy
  })

  return result
}
```

4. Обновить `executeWorkflow` для поддержки Party Mode phases:
```typescript
// В executePhase
if (phase.execution === 'parallel' && this.partyModeManager) {
  const partyResult = await this.executeWithPartyMode(
    phase.agents,
    task,
    state
  )
  phaseResults.push(partyResult)
} else {
  // existing sequential execution
}
```

#### Шаг 3: Создать тесты (2-3h)

**Файл**: `packages/core/tests/orchestration/party-mode.test.ts`

```typescript
import {
  PartyModeManager,
  getPartyModeManager,
  resetPartyModeManager
} from '../../src/orchestration/party-mode-manager'
import type { Agent } from '../../src/agents/types'

describe('PartyModeManager', () => {
  let manager: PartyModeManager

  beforeEach(() => {
    resetPartyModeManager()
    manager = getPartyModeManager({
      maxParallelAgents: 3,
      coordinationStrategy: 'merge',
      timeout: 5000
    })
  })

  afterEach(() => {
    resetPartyModeManager()
  })

  describe('executeParallel', () => {
    it('should execute multiple agents in parallel', async () => {
      const mockAgents = [
        createMockAgent('agent-1', { result: 'A' }),
        createMockAgent('agent-2', { result: 'B' }),
        createMockAgent('agent-3', { result: 'C' })
      ]

      const result = await manager.executeParallel(
        mockAgents,
        'test task',
        {} as any
      )

      expect(result.agentResults.size).toBe(3)
      expect(result.agentResults.has('agent-1')).toBe(true)
      expect(result.mergedResult.contributors).toEqual(['agent-1', 'agent-2', 'agent-3'])
    })

    it('should handle agent failures gracefully', async () => {
      const mockAgents = [
        createMockAgent('agent-1', { result: 'A' }),
        createMockAgent('agent-2', null, new Error('Agent failed')),
        createMockAgent('agent-3', { result: 'C' })
      ]

      const result = await manager.executeParallel(
        mockAgents,
        'test task',
        {} as any
      )

      expect(result.agentResults.size).toBe(2) // Only successful agents
      expect(result.conflicts).toContain('agent-2: Agent failed')
    })

    it('should enforce max parallel agents limit', async () => {
      const mockAgents = [
        createMockAgent('agent-1', { result: 'A' }),
        createMockAgent('agent-2', { result: 'B' }),
        createMockAgent('agent-3', { result: 'C' }),
        createMockAgent('agent-4', { result: 'D' }) // Exceeds limit of 3
      ]

      await expect(
        manager.executeParallel(mockAgents, 'test task', {} as any)
      ).rejects.toThrow('Too many agents')
    })

    it('should timeout slow agents', async () => {
      const slowAgent = createMockAgent('slow-agent', { result: 'A' }, null, 10000) // 10s delay

      const result = await manager.executeParallel(
        [slowAgent],
        'test task',
        {} as any
      )

      expect(result.conflicts.length).toBeGreaterThan(0)
      expect(result.conflicts[0]).toContain('timed out')
    })
  })

  describe('merge strategies', () => {
    it('should merge results with "merge" strategy', async () => {
      const mockAgents = [
        createMockAgent('agent-1', { output: 'A', artifacts: ['file1.ts'] }),
        createMockAgent('agent-2', { output: 'B', artifacts: ['file2.ts'] })
      ]

      const result = await manager.executeParallel(
        mockAgents,
        'test task',
        {} as any
      )

      expect(result.mergedResult.artifacts).toContain('file1.ts')
      expect(result.mergedResult.artifacts).toContain('file2.ts')
      expect(result.mergedResult.outputs['agent-1']).toBe('A')
      expect(result.mergedResult.outputs['agent-2']).toBe('B')
    })

    it('should use "vote" strategy when configured', async () => {
      const manager = getPartyModeManager({
        coordinationStrategy: 'vote'
      })

      const mockAgents = [
        createMockAgent('agent-1', { output: 'A' }),
        createMockAgent('agent-2', { output: 'A' }),
        createMockAgent('agent-3', { output: 'B' })
      ]

      const result = await manager.executeParallel(
        mockAgents,
        'test task',
        {} as any
      )

      expect(result.mergedResult.output).toBe('A') // Majority vote
      expect(result.mergedResult.votingStats.winnerVotes).toBe(2)
    })

    it('should require consensus with "consensus" strategy', async () => {
      const manager = getPartyModeManager({
        coordinationStrategy: 'consensus'
      })

      const mockAgents = [
        createMockAgent('agent-1', { output: 'A' }),
        createMockAgent('agent-2', { output: 'B' }) // Different output
      ]

      await expect(
        manager.executeParallel(mockAgents, 'test task', {} as any)
      ).rejects.toThrow('No consensus reached')
    })
  })

  describe('conflict detection', () => {
    it('should detect conflicts between different outputs', async () => {
      const mockAgents = [
        createMockAgent('agent-1', { recommendation: 'approach-A' }),
        createMockAgent('agent-2', { recommendation: 'approach-B' }),
        createMockAgent('agent-3', { recommendation: 'approach-C' })
      ]

      const result = await manager.executeParallel(
        mockAgents,
        'test task',
        {} as any
      )

      expect(result.conflicts.length).toBeGreaterThan(0)
      expect(result.conflicts.some(c => c.includes('Conflict between'))).toBe(true)
    })

    it('should not report conflicts for identical outputs', async () => {
      const sameOutput = { recommendation: 'same-approach' }
      const mockAgents = [
        createMockAgent('agent-1', sameOutput),
        createMockAgent('agent-2', sameOutput),
        createMockAgent('agent-3', sameOutput)
      ]

      const result = await manager.executeParallel(
        mockAgents,
        'test task',
        {} as any
      )

      expect(result.conflicts.length).toBe(0)
    })
  })
})

// Helper functions
function createMockAgent(
  id: string,
  result: any,
  error?: Error,
  delay: number = 0
): Agent {
  return {
    id,
    name: `Mock ${id}`,
    execute: jest.fn(async () => {
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
      if (error) {
        throw error
      }
      return result
    })
  } as any
}
```

#### Шаг 4: Обновить документацию (1h)

**Файл**: `CLAUDE.md`

Добавить в раздел **Collaboration Patterns**:

```markdown
#### Party Mode
- **Status**: ✅ Реализован
- **Usage**: Параллельное выполнение нескольких агентов
- **Strategies**:
  - `merge` - объединить все результаты
  - `vote` - большинство голосов
  - `consensus` - требуется согласие всех
- **Example**:
  ```typescript
  const engine = WorkflowEngine.create({
    enablePartyMode: true,
    partyModeConfig: {
      maxParallelAgents: 5,
      coordinationStrategy: 'merge',
      timeout: 30000
    }
  })

  const result = await engine.executeWithPartyMode(
    [architect, developer, tester],
    'Design authentication system',
    state
  )
  ```
```

**Файл**: `packages/core/docs/party-mode.md` (новый)

Создать полную документацию с примерами использования.

---

## 🟡 P1: ВАЖНЫЕ ЗАДАЧИ (17-23 часа)

### P1.1: Исправить Schema Validation Warnings ⏱️ 4-6h

**Проблема**: 78+ validation warnings при загрузке ролей

#### Шаг 1: Изучить schema и понять allowed values (1h)

**Файл**: `packages/core/templates/roles/roles.schema.json`

```bash
# Проверить какие значения допустимы для:
# - task_types
# - output_artifacts
# - allowed_mcps
cat packages/core/templates/roles/roles.schema.json | jq '.definitions'
```

#### Шаг 2: Исправить core-roles.json (1h)

**Файл**: `packages/core/templates/roles/core-roles.json`

**Задачи**:
1. Проверить каждое поле `task_types` на соответствие enum в schema
2. Проверить каждое поле `output_artifacts` на соответствие enum
3. Убедиться что все required поля присутствуют

**Пример исправления**:
```json
{
  "id": "architect",
  "activation_rules": {
    "task_types": [
      "feature_development",
      "architecture_design",  // ❌ Invalid → нужно заменить на allowed value
      "refactoring"
    ]
  },
  "metadata": {
    "output_artifacts": [
      "architecture_doc",  // ❌ Invalid → проверить против schema enum
      "code"
    ]
  }
}
```

**Действия**:
1. Прочитать schema для получения allowed values
2. Обновить все invalid values в core-roles.json
3. Запустить валидацию: `pnpm test -- yaml-config-loader.test.ts`

#### Шаг 3: Исправить specialized-roles.json (2-3h)

**Файл**: `packages/core/templates/roles/specialized-roles.json`

**67+ warnings** - больше работы, тот же подход:
1. Проверить `task_types` для всех 15 ролей
2. Проверить `output_artifacts` для всех 15 ролей
3. Проверить `allowed_mcps` (специфично для specialized roles)

**Пример для ui-developer**:
```json
{
  "id": "ui-developer",
  "allowed_mcps": [
    "browser",
    "figma",
    "github",
    "invalid-mcp-name"  // ❌ Invalid → удалить или заменить
  ],
  "activation_rules": {
    "task_types": [
      "ui_development",  // ❌ Проверить против schema
      "component_creation"
    ]
  }
}
```

#### Шаг 4: Решить вопрос с project-roles.json (30min)

**Файл**: `packages/core/templates/roles/project-roles.json`

**Текущее состояние**: Пустой файл `{ "roles": [] }`

**Варианты**:
1. **Удалить файл** - если не планируется использовать project-specific roles
2. **Добавить example role** - если функционал нужен

**Рекомендация**: Добавить пример:
```json
{
  "roles": [
    {
      "id": "asmo-specialist",
      "name": "ASMO Framework Specialist",
      "description": "Expert in ASMO multi-agent orchestration",
      "required_skills": [
        "typescript_expert",
        "system_design",
        "code_writing"
      ],
      "activation_rules": {
        "keywords": ["asmo", "multi-agent", "orchestration"],
        "task_types": ["feature_development", "bug_fix"],
        "complexity_range": [30, 100]
      },
      "metadata": {
        "output_artifacts": ["code", "documentation"],
        "estimated_duration": "2-4 hours"
      }
    }
  ]
}
```

#### Шаг 5: Проверить результат (30min)

```bash
# Запустить ASMO и проверить что warnings исчезли
node packages/cli/bin/asmo.js run "test task" --verbose 2>&1 | grep -i warning

# Должно быть 0 validation warnings
```

---

### P1.2: Связать Missing Skills с Roles ⏱️ 1h

**Проблема**: 7 навыков существуют, но не привязаны к ролям

#### Задача: Обновить specialized-roles.json

**Файл**: `packages/core/templates/roles/specialized-roles.json`

**Изменения**:

1. **project-manager** - добавить 3 навыка:
```json
{
  "id": "project-manager",
  "required_skills": [
    "tracking",           // ✅ Добавить
    "coordination",       // ✅ Добавить
    "sprint_planning",    // ✅ Добавить
    "resource_allocation",
    "risk_management"
    // ... existing skills
  ]
}
```

2. **product-owner** - добавить 3 навыка:
```json
{
  "id": "product-owner",
  "required_skills": [
    "strategy",          // ✅ Добавить
    "roadmap",           // ✅ Добавить
    "prioritization",    // ✅ Добавить
    "requirements",
    "stakeholder_relations"
    // ... existing skills
  ]
}
```

3. **scrum-master** - добавить 1 навык:
```json
{
  "id": "scrum-master",
  "required_skills": [
    "sprint_planning",   // ✅ Добавить
    "coordination",
    "process_modeling"
    // ... existing skills
  ]
}
```

#### Проверка:
```bash
# Запустить и проверить что warnings исчезли
node packages/cli/bin/asmo.js run "test" --verbose 2>&1 | grep "Warning: Missing required skills"
# Должно быть 0 warnings
```

---

### P1.3: Увеличить Test Coverage (35 → 60+ тестов) ⏱️ 12-16h

**Цель**: Покрыть тестами недостающие компоненты

#### Шаг 1: MetricsCollector тесты (1.5h)

**Файл**: `packages/core/tests/orchestration/metrics-collector.test.ts`

```typescript
import { MetricsCollector } from '../../src/orchestration/metrics-collector'

describe('MetricsCollector', () => {
  let collector: MetricsCollector

  beforeEach(() => {
    collector = new MetricsCollector()
  })

  it('should record workflow execution metrics', () => {
    collector.recordWorkflowExecution({
      workflowId: 'test-workflow',
      duration: 1000,
      success: true,
      complexity: 50
    })

    const metrics = collector.getMetrics('test-workflow')
    expect(metrics.totalRuns).toBe(1)
    expect(metrics.averageDuration).toBe(1000)
  })

  it('should track success rate', () => {
    collector.recordWorkflowExecution({
      workflowId: 'test-workflow',
      duration: 1000,
      success: true,
      complexity: 50
    })
    collector.recordWorkflowExecution({
      workflowId: 'test-workflow',
      duration: 1200,
      success: false,
      complexity: 50
    })

    const metrics = collector.getMetrics('test-workflow')
    expect(metrics.successRate).toBe(0.5)
  })

  // ... more tests
})
```

#### Шаг 2: MetricsPersister тесты (1.5h)

**Файл**: `packages/core/tests/orchestration/metrics-persister.test.ts`

```typescript
import { MetricsPersister } from '../../src/orchestration/metrics-persister'
import * as fs from 'fs/promises'
import * as path from 'path'

describe('MetricsPersister', () => {
  let persister: MetricsPersister
  let tempDir: string

  beforeEach(async () => {
    tempDir = path.join(__dirname, '.temp-metrics')
    await fs.mkdir(tempDir, { recursive: true })
    persister = new MetricsPersister(tempDir)
  })

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  it('should persist metrics to file', async () => {
    const metrics = {
      workflowId: 'test-workflow',
      runs: [
        { duration: 1000, success: true, timestamp: Date.now() }
      ]
    }

    await persister.save('test-workflow', metrics)

    const exists = await fs.access(
      path.join(tempDir, 'test-workflow.json')
    ).then(() => true).catch(() => false)

    expect(exists).toBe(true)
  })

  // ... more tests
})
```

#### Шаг 3: MetricsOptimizer тесты (2h)

**Файл**: `packages/core/tests/orchestration/metrics-optimizer.test.ts`

```typescript
import { MetricsOptimizer } from '../../src/orchestration/metrics-optimizer'
import { MetricsCollector } from '../../src/orchestration/metrics-collector'

describe('MetricsOptimizer', () => {
  let optimizer: MetricsOptimizer
  let collector: MetricsCollector

  beforeEach(() => {
    collector = new MetricsCollector()
    optimizer = new MetricsOptimizer(collector)
  })

  it('should analyze workflow performance', () => {
    // Record multiple runs
    for (let i = 0; i < 5; i++) {
      collector.recordWorkflowExecution({
        workflowId: 'test-workflow',
        duration: 1000 + i * 100,
        success: true,
        complexity: 50
      })
    }

    const analysis = optimizer.analyzeWorkflow('test-workflow')

    expect(analysis.averageDuration).toBeGreaterThan(1000)
    expect(analysis.recommendedModel).toBeDefined()
  })

  it('should suggest routing optimizations', () => {
    // Simulate slow runs
    for (let i = 0; i < 3; i++) {
      collector.recordWorkflowExecution({
        workflowId: 'slow-workflow',
        duration: 5000,
        success: true,
        complexity: 30,
        model: 'sonnet'
      })
    }

    const suggestions = optimizer.suggestOptimizations('slow-workflow')

    expect(suggestions).toContain('Consider using Haiku for lower complexity')
  })

  // ... more tests
})
```

#### Шаг 4: YoloModeManager тесты (1.5h)

**Файл**: `packages/core/tests/orchestration/yolo-mode-manager.test.ts`

```typescript
import { YoloModeManager, getYoloModeManager } from '../../src/orchestration/yolo-mode-manager'

describe('YoloModeManager', () => {
  let manager: YoloModeManager

  beforeEach(() => {
    manager = getYoloModeManager({ threshold: 30 })
  })

  it('should auto-approve tasks below threshold', () => {
    const result = manager.shouldAutoApprove(25)
    expect(result).toBe(true)
  })

  it('should not auto-approve tasks above threshold', () => {
    const result = manager.shouldAutoApprove(35)
    expect(result).toBe(false)
  })

  it('should respect disabled state', () => {
    manager.disable()
    const result = manager.shouldAutoApprove(25)
    expect(result).toBe(false)
  })

  // ... more tests
})
```

#### Шаг 5: ConfigManager тесты (1.5h)

**Файл**: `packages/core/tests/orchestration/config-manager.test.ts`

#### Шаг 6: PersonalityPromptLoader тесты (2h)

**Файл**: `packages/core/tests/orchestration/personality-prompt-loader.test.ts`

#### Шаг 7: BrainstormingSession тесты (1.5h)

**Файл**: `packages/core/tests/orchestration/brainstorming-session.test.ts`

#### Шаг 8: DocumentRegistry тесты (1h)

**Файл**: `packages/core/tests/orchestration/document-registry.test.ts`

#### Шаг 9: IterationManager тесты (1.5h)

**Файл**: `packages/core/tests/orchestration/iteration-manager.test.ts`

---

## 🟢 P2: МОЖНО ОТЛОЖИТЬ (8-10 часов)

### P2.1: Удалить пустую директорию 4-bug-fix ⏱️ 1min

```bash
rm -rf packages/core/templates/workflows/4-bug-fix/
```

### P2.2: Создать teams.json example ⏱️ 30min

**Файл**: `.cursor/config/orchestration/teams.json.example`

```json
{
  "$schema": "../../../packages/core/templates/config/teams.schema.json",
  "teams": [
    {
      "id": "frontend-team",
      "name": "Frontend Development Team",
      "description": "Handles UI/UX and frontend development tasks",
      "agents": [
        "ui-developer",
        "ux-designer"
      ],
      "workflows": [
        "ui_component_library",
        "create_ux_design_workflow"
      ],
      "specialization": "frontend"
    },
    {
      "id": "backend-team",
      "name": "Backend Development Team",
      "description": "Handles API, database, and backend logic",
      "agents": [
        "developer",
        "data-architect",
        "api-designer"
      ],
      "workflows": [
        "api_design",
        "database_migration",
        "feature_implementation_full"
      ],
      "specialization": "backend"
    },
    {
      "id": "qa-team",
      "name": "Quality Assurance Team",
      "description": "Testing, quality gates, and test automation",
      "agents": [
        "tester",
        "test-architect"
      ],
      "workflows": [
        "comprehensive_testing",
        "tea_planning_workflow",
        "tea_execution_workflow",
        "tea_validation_workflow"
      ],
      "specialization": "testing"
    },
    {
      "id": "security-team",
      "name": "Security Team",
      "description": "Security audits, vulnerability scanning, compliance",
      "agents": [
        "security-specialist"
      ],
      "workflows": [
        "security_audit"
      ],
      "specialization": "security"
    },
    {
      "id": "performance-team",
      "name": "Performance Team",
      "description": "Performance optimization and profiling",
      "agents": [
        "optimizer",
        "performance-engineer"
      ],
      "workflows": [
        "performance_optimization",
        "performance_investigation"
      ],
      "specialization": "performance"
    },
    {
      "id": "product-team",
      "name": "Product Management Team",
      "description": "Product strategy, roadmap, requirements",
      "agents": [
        "product-owner",
        "business-analyst",
        "project-manager"
      ],
      "workflows": [
        "create_product_brief_workflow",
        "create_prd_workflow",
        "create_epics_and_stories_workflow",
        "sprint_planning_workflow"
      ],
      "specialization": "product"
    }
  ]
}
```

**Документация**: Добавить в `CLAUDE.md`:
```markdown
### Teams Configuration

Create `.cursor/config/orchestration/teams.json` to enable team-based routing:

```bash
cp .cursor/config/orchestration/teams.json.example .cursor/config/orchestration/teams.json
```

Teams allow grouping agents by specialization for faster routing.
```

### P2.3: CLI Integration Tests ⏱️ 8-10h

**Директория**: `packages/cli/tests/integration/`

#### Структура:
```
packages/cli/tests/integration/
├── run-command.test.ts      (2h)
├── suggest-command.test.ts  (1.5h)
├── analyze-command.test.ts  (1.5h)
├── workflow-command.test.ts (1.5h)
├── task-command.test.ts     (1h)
├── stats-command.test.ts    (1h)
└── helpers.ts               (30min)
```

#### Пример: run-command.test.ts

```typescript
import { spawn } from 'child_process'
import * as path from 'path'

describe('asmo run command', () => {
  const CLI_PATH = path.join(__dirname, '../../bin/asmo.js')

  it('should execute simple task with --dry-run', (done) => {
    const proc = spawn('node', [
      CLI_PATH,
      'run',
      'Add unit tests for auth module',
      '--dry-run'
    ])

    let output = ''
    proc.stdout.on('data', (data) => {
      output += data.toString()
    })

    proc.on('close', (code) => {
      expect(code).toBe(0)
      expect(output).toContain('Analyzing task complexity')
      expect(output).toContain('Selected workflow')
      done()
    })
  })

  it('should respect --workflow flag', (done) => {
    const proc = spawn('node', [
      CLI_PATH,
      'run',
      'Test task',
      '--workflow',
      'bug_fix_workflow',
      '--dry-run'
    ])

    let output = ''
    proc.stdout.on('data', (data) => {
      output += data.toString()
    })

    proc.on('close', (code) => {
      expect(code).toBe(0)
      expect(output).toContain('bug_fix_workflow')
      done()
    })
  })

  it('should handle Russian language input', (done) => {
    const proc = spawn('node', [
      CLI_PATH,
      'run',
      'Добавь тесты для модуля аутентификации',
      '--dry-run'
    ])

    let output = ''
    proc.stdout.on('data', (data) => {
      output += data.toString()
    })

    proc.on('close', (code) => {
      expect(code).toBe(0)
      expect(output).not.toContain('error')
      done()
    })
  })

  // ... more tests
})
```

---

## 📊 PROGRESS TRACKING

### Чеклист выполнения:

#### P0 (Критично - 8-12h)
- [ ] P0.1.1: Создать PartyModeManager (3-4h)
- [ ] P0.1.2: Интегрировать с WorkflowEngine (2-3h)
- [ ] P0.1.3: Написать тесты party-mode.test.ts (2-3h)
- [ ] P0.1.4: Обновить документацию (1h)

#### P1 (Важно - 17-23h)
- [ ] P1.1.1: Изучить schema (1h)
- [ ] P1.1.2: Исправить core-roles.json (1h)
- [ ] P1.1.3: Исправить specialized-roles.json (2-3h)
- [ ] P1.1.4: Решить вопрос project-roles.json (30min)
- [ ] P1.1.5: Проверить результат (30min)
- [ ] P1.2: Связать missing skills (1h)
- [ ] P1.3.1: MetricsCollector тесты (1.5h)
- [ ] P1.3.2: MetricsPersister тесты (1.5h)
- [ ] P1.3.3: MetricsOptimizer тесты (2h)
- [ ] P1.3.4: YoloModeManager тесты (1.5h)
- [ ] P1.3.5: ConfigManager тесты (1.5h)
- [ ] P1.3.6: PersonalityPromptLoader тесты (2h)
- [ ] P1.3.7: BrainstormingSession тесты (1.5h)
- [ ] P1.3.8: DocumentRegistry тесты (1h)
- [ ] P1.3.9: IterationManager тесты (1.5h)

#### P2 (Отложить - 8-10h)
- [ ] P2.1: Удалить 4-bug-fix/ (1min)
- [ ] P2.2: Создать teams.json.example (30min)
- [ ] P2.3.1: run-command.test.ts (2h)
- [ ] P2.3.2: suggest-command.test.ts (1.5h)
- [ ] P2.3.3: analyze-command.test.ts (1.5h)
- [ ] P2.3.4: workflow-command.test.ts (1.5h)
- [ ] P2.3.5: task-command.test.ts (1h)
- [ ] P2.3.6: stats-command.test.ts (1h)

---

## 🎯 MILESTONES

### Milestone 1: Party Mode Complete (P0) ✅
**ETA**: После 8-12 часов работы
**Deliverables**:
- PartyModeManager реализован и протестирован
- Интеграция с WorkflowEngine
- Документация обновлена
- **Результат**: 100% Collaboration Patterns

### Milestone 2: Clean Initialization (P1.1 + P1.2) ✅
**ETA**: После 5-7 часов работы (после M1)
**Deliverables**:
- 0 schema validation warnings
- 0 missing skills warnings
- Чистые логи при запуске
- **Результат**: Профессиональный UX

### Milestone 3: Quality Confidence (P1.3) ✅
**ETA**: После 12-16 часов работы (после M2)
**Deliverables**:
- 60+ тестов (vs 35 сейчас)
- Критичные компоненты покрыты на 80%+
- CI/CD готов к запуску
- **Результат**: Высокая уверенность в качестве

### Milestone 4: Production Polish (P2) ✅
**ETA**: После 8-10 часов работы (после M3)
**Deliverables**:
- Чистая структура проекта (no empty dirs)
- Teams feature enabled
- CLI fully tested
- **Результат**: 100% готовность к production

---

## 🚀 NEXT STEPS

1. **Начать с P0.1** - Party Mode (самая критичная задача)
2. **Быстрые победы** - P1.2 (1 час) + P2.1 (1 минута)
3. **Качество** - P1.1 (schema) + P1.3 (tests)
4. **Полировка** - P2.2 + P2.3

**Total Timeline**: 33-45 часов = **1-2 недели** при полной занятости

---

## ✅ SUCCESS CRITERIA

### Технические метрики:
- ✅ 0 validation warnings при инициализации
- ✅ 0 missing skills warnings
- ✅ 60+ test files (сейчас 35)
- ✅ Party Mode работает и протестирован
- ✅ Все 5/5 Collaboration Patterns реализованы

### Функциональные метрики:
- ✅ 100% заявленного функционала реализовано
- ✅ Система стабильна (все тесты проходят)
- ✅ Документация актуальна
- ✅ Production-ready

### Бизнес-метрики:
- ✅ Можно уверенно демонстрировать систему
- ✅ Готово к публикации (open source)
- ✅ Соответствует всем заявлениям в README

---

**Конец плана**
