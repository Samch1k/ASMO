#!/usr/bin/env tsx
/**
 * Generate workflow documentation from JSON workflow definitions
 */

import * as fs from 'fs'
import * as path from 'path'

interface WorkflowStep {
  order: number
  role_id: string
  phase: string
  description: string
  parallel_with?: string[]
  deliverables: string[]
  exit_criteria: string
  timeout: string
  requires_approval?: boolean
}

interface Workflow {
  id: string
  name: string
  description: string
  trigger_condition: {
    keywords: string[]
    task_types: string[]
    required_skills: string[]
    complexity_range?: string[]
  }
  steps: WorkflowStep[]
  estimated_time: string
  success_criteria: string
  metadata?: Record<string, unknown>
}

const WORKFLOWS_DIR = path.join(__dirname, '../packages/core/templates/workflows')
const DOCS_EN_DIR = path.join(__dirname, '../docs/en/reference/workflows')
const DOCS_RU_DIR = path.join(__dirname, '../docs/ru/reference/workflows')

function getWorkflowEmoji(id: string): string {
  const emojis: Record<string, string> = {
    'bug_fix_workflow': '🐛',
    'feature_implementation_full': '✨',
    'ui_component_library': '🎨',
    'comprehensive_testing': '🧪',
    'performance_investigation': '📊',
    'advanced_bug_fix': '🔧',
    'code_refactoring': '♻️',
    'performance_optimization': '⚡',
    'security_audit': '🔒',
    'architecture_design': '🏗️',
    'database_migration': '💾',
    'api_design': '🔌',
  }
  return emojis[id] || '📋'
}

function generateWorkflowMarkdown(workflow: Workflow, lang: 'en' | 'ru', index: number): string {
  const emoji = getWorkflowEmoji(workflow.id)

  // Group steps by phase
  const phases = new Map<number, WorkflowStep[]>()
  for (const step of workflow.steps) {
    if (!phases.has(step.order)) {
      phases.set(step.order, [])
    }
    phases.get(step.order)!.push(step)
  }

  const stepsTable = Array.from(phases.entries())
    .sort(([a], [b]) => a - b)
    .map(([order, steps]) => {
      if (steps.length > 1) {
        // Parallel steps
        return steps.map((step, i) =>
          `| ${i === 0 ? order : ''} | ${step.role_id} | ${step.phase} | ${step.deliverables.slice(0, 2).join(', ')} | ${step.timeout} | ${i === 0 ? '⚡ Parallel' : ''} |`
        ).join('\n')
      }
      const step = steps[0]
      return `| ${order} | ${step.role_id} | ${step.phase} | ${step.deliverables.slice(0, 2).join(', ')} | ${step.timeout} | ${step.requires_approval ? '✅ Required' : '-'} |`
    })
    .join('\n')

  if (lang === 'ru') {
    return `# ${emoji} ${workflow.name}

> ${workflow.description}

## Обзор

| Параметр | Значение |
|----------|----------|
| **ID** | \`${workflow.id}\` |
| **Время выполнения** | ${workflow.estimated_time} |
| **Количество фаз** | ${phases.size} |
| **Агентов задействовано** | ${new Set(workflow.steps.map(s => s.role_id)).size} |

## Условия запуска

### Ключевые слова
${workflow.trigger_condition.keywords.slice(0, 6).map(k => `\`${k}\``).join(', ')}

### Типы задач
${workflow.trigger_condition.task_types.map(t => `- ${t}`).join('\n')}

### Необходимые навыки
${workflow.trigger_condition.required_skills.map(s => `- \`${s}\``).join('\n')}

${workflow.trigger_condition.complexity_range ? `### Уровень сложности\n${workflow.trigger_condition.complexity_range.map(c => `- ${c}`).join('\n')}` : ''}

## Фазы выполнения

| # | Агент | Фаза | Артефакты | Timeout | Approve |
|---|-------|------|-----------|---------|---------|
${stepsTable}

## Детальное описание фаз

${Array.from(phases.entries())
  .sort(([a], [b]) => a - b)
  .map(([order, steps]) => {
    if (steps.length > 1) {
      return `### Фаза ${order}: Параллельное выполнение

${steps.map(step => `
#### ${step.role_id} - ${step.phase}

${step.description}

**Артефакты:**
${step.deliverables.map(d => `- ${d}`).join('\n')}

**Критерий завершения:** ${step.exit_criteria}
`).join('\n')}`
    }
    const step = steps[0]
    return `### Фаза ${order}: ${step.phase}

**Агент:** \`${step.role_id}\`

${step.description}

**Артефакты:**
${step.deliverables.map(d => `- ${d}`).join('\n')}

**Критерий завершения:** ${step.exit_criteria}

**Timeout:** ${step.timeout}
${step.requires_approval ? '\n**⚠️ Требуется подтверждение перед продолжением**' : ''}`
  })
  .join('\n\n')}

## Критерий успеха

${workflow.success_criteria}

## Использование

\`\`\`typescript
import { WorkflowEngine, AgentRegistry } from '@ai1st/core'

const registry = new AgentRegistry()
const engine = new WorkflowEngine(registry)
await engine.initialize()

// Запуск по ID
const result = await engine.execute('${workflow.id}')

// Или адаптивный выбор по описанию задачи
const result = await engine.execute('${workflow.trigger_condition.keywords[0]}...')
\`\`\`

---

[← Назад к списку workflows](./index.md)
`
  }

  return `# ${emoji} ${workflow.name}

> ${workflow.description}

## Overview

| Property | Value |
|----------|-------|
| **ID** | \`${workflow.id}\` |
| **Estimated Time** | ${workflow.estimated_time} |
| **Phases** | ${phases.size} |
| **Agents Involved** | ${new Set(workflow.steps.map(s => s.role_id)).size} |

## Trigger Conditions

### Keywords
${workflow.trigger_condition.keywords.slice(0, 6).map(k => `\`${k}\``).join(', ')}

### Task Types
${workflow.trigger_condition.task_types.map(t => `- ${t}`).join('\n')}

### Required Skills
${workflow.trigger_condition.required_skills.map(s => `- \`${s}\``).join('\n')}

${workflow.trigger_condition.complexity_range ? `### Complexity Range\n${workflow.trigger_condition.complexity_range.map(c => `- ${c}`).join('\n')}` : ''}

## Execution Phases

| # | Agent | Phase | Deliverables | Timeout | Approval |
|---|-------|-------|--------------|---------|----------|
${stepsTable}

## Phase Details

${Array.from(phases.entries())
  .sort(([a], [b]) => a - b)
  .map(([order, steps]) => {
    if (steps.length > 1) {
      return `### Phase ${order}: Parallel Execution

${steps.map(step => `
#### ${step.role_id} - ${step.phase}

${step.description}

**Deliverables:**
${step.deliverables.map(d => `- ${d}`).join('\n')}

**Exit Criteria:** ${step.exit_criteria}
`).join('\n')}`
    }
    const step = steps[0]
    return `### Phase ${order}: ${step.phase}

**Agent:** \`${step.role_id}\`

${step.description}

**Deliverables:**
${step.deliverables.map(d => `- ${d}`).join('\n')}

**Exit Criteria:** ${step.exit_criteria}

**Timeout:** ${step.timeout}
${step.requires_approval ? '\n**⚠️ Approval required before continuing**' : ''}`
  })
  .join('\n\n')}

## Success Criteria

${workflow.success_criteria}

## Usage

\`\`\`typescript
import { WorkflowEngine, AgentRegistry } from '@ai1st/core'

const registry = new AgentRegistry()
const engine = new WorkflowEngine(registry)
await engine.initialize()

// Execute by ID
const result = await engine.execute('${workflow.id}')

// Or adaptive selection by task description
const result = await engine.execute('${workflow.trigger_condition.keywords[0]}...')
\`\`\`

---

[← Back to Workflows](./index.md)
`
}

function generateIndexMarkdown(workflows: Array<{ workflow: Workflow; category: string; index: number }>, lang: 'en' | 'ru'): string {
  const categories = new Map<string, typeof workflows>()

  for (const item of workflows) {
    if (!categories.has(item.category)) {
      categories.set(item.category, [])
    }
    categories.get(item.category)!.push(item)
  }

  const categoryTranslations: Record<string, string> = {
    '1-quick-flow': lang === 'ru' ? 'Быстрые исправления' : 'Quick Fixes',
    '2-feature-development': lang === 'ru' ? 'Разработка функций' : 'Feature Development',
    '3-quality-assurance': lang === 'ru' ? 'Контроль качества' : 'Quality Assurance',
    '4-bug-fix': lang === 'ru' ? 'Исправление багов' : 'Bug Fixing',
    '5-refactoring': lang === 'ru' ? 'Рефакторинг' : 'Refactoring',
    '6-performance-optimization': lang === 'ru' ? 'Оптимизация' : 'Performance',
    '7-security-audit': lang === 'ru' ? 'Безопасность' : 'Security',
    '8-architecture-design': lang === 'ru' ? 'Архитектура' : 'Architecture',
    '9-database-migration': lang === 'ru' ? 'База данных' : 'Database',
    '10-api-design': lang === 'ru' ? 'API дизайн' : 'API Design',
  }

  if (lang === 'ru') {
    return `# Каталог Workflows

AI1st включает **${workflows.length} production-ready workflows** для типичных задач разработки.

## Обзор

| # | Workflow | Категория | Время | Агентов |
|---|----------|-----------|-------|---------|
${workflows.map(({ workflow, category, index }) =>
  `| ${index} | [${getWorkflowEmoji(workflow.id)} ${workflow.name}](./${index}-${workflow.id}.md) | ${categoryTranslations[category] || category} | ${workflow.estimated_time} | ${new Set(workflow.steps.map(s => s.role_id)).size} |`
).join('\n')}

## По категориям

${Array.from(categories.entries())
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([category, items]) => `
### ${categoryTranslations[category] || category}

${items.map(({ workflow, index }) =>
  `- [${getWorkflowEmoji(workflow.id)} ${workflow.name}](./${index}-${workflow.id}.md) - ${workflow.description.slice(0, 60)}...`
).join('\n')}`
  ).join('\n')}

## Уровни сложности

Workflows автоматически выбираются на основе сложности задачи:

| Уровень | Баллы | Рекомендуемые workflows |
|---------|-------|------------------------|
| Trivial | 0-20 | Quick Flow (YOLO Mode) |
| Simple | 21-40 | Bug Fix, Quick Flow |
| Medium | 41-60 | Feature Development, Refactoring |
| Complex | 61-80 | Security Audit, API Design |
| Enterprise | 81-100 | Architecture Design, Database Migration |

## См. также

- [Концепция workflows](../../concepts/workflows.md)
- [Адаптивный выбор workflow](../../guides/adaptive-workflow.md)
- [Создание custom workflows](../../guides/custom-workflows.md)
`
  }

  return `# Workflow Catalog

AI1st includes **${workflows.length} production-ready workflows** for common development tasks.

## Overview

| # | Workflow | Category | Time | Agents |
|---|----------|----------|------|--------|
${workflows.map(({ workflow, category, index }) =>
  `| ${index} | [${getWorkflowEmoji(workflow.id)} ${workflow.name}](./${index}-${workflow.id}.md) | ${categoryTranslations[category] || category} | ${workflow.estimated_time} | ${new Set(workflow.steps.map(s => s.role_id)).size} |`
).join('\n')}

## By Category

${Array.from(categories.entries())
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([category, items]) => `
### ${categoryTranslations[category] || category}

${items.map(({ workflow, index }) =>
  `- [${getWorkflowEmoji(workflow.id)} ${workflow.name}](./${index}-${workflow.id}.md) - ${workflow.description.slice(0, 60)}...`
).join('\n')}`
  ).join('\n')}

## Complexity Levels

Workflows are automatically selected based on task complexity:

| Level | Score | Recommended Workflows |
|-------|-------|----------------------|
| Trivial | 0-20 | Quick Flow (YOLO Mode) |
| Simple | 21-40 | Bug Fix, Quick Flow |
| Medium | 41-60 | Feature Development, Refactoring |
| Complex | 61-80 | Security Audit, API Design |
| Enterprise | 81-100 | Architecture Design, Database Migration |

## See Also

- [Workflow Concepts](../../concepts/workflows.md)
- [Adaptive Workflow Selection](../../guides/adaptive-workflow.md)
- [Creating Custom Workflows](../../guides/custom-workflows.md)
`
}

export async function generateWorkflowDocs(): Promise<void> {
  console.log('📋 Generating workflow documentation...')

  const workflowDirs = fs.readdirSync(WORKFLOWS_DIR).filter(f =>
    fs.statSync(path.join(WORKFLOWS_DIR, f)).isDirectory()
  ).sort()

  const allWorkflows: Array<{ workflow: Workflow; category: string; index: number }> = []

  for (const dir of workflowDirs) {
    const dirPath = path.join(WORKFLOWS_DIR, dir)
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'))

    for (const file of files) {
      const content = fs.readFileSync(path.join(dirPath, file), 'utf-8')
      const workflow: Workflow = JSON.parse(content)
      const index = parseInt(dir.split('-')[0]) || allWorkflows.length + 1
      allWorkflows.push({ workflow, category: dir, index })
    }
  }

  console.log(`  Found ${allWorkflows.length} workflows`)

  // Generate docs for each language
  for (const lang of ['en', 'ru'] as const) {
    const docsDir = lang === 'en' ? DOCS_EN_DIR : DOCS_RU_DIR

    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true })
    }

    // Generate index
    const indexContent = generateIndexMarkdown(allWorkflows, lang)
    fs.writeFileSync(path.join(docsDir, 'index.md'), indexContent)

    // Generate individual workflow docs
    for (const { workflow, index } of allWorkflows) {
      const content = generateWorkflowMarkdown(workflow, lang, index)
      fs.writeFileSync(path.join(docsDir, `${index}-${workflow.id}.md`), content)
    }
  }

  console.log('  ✅ Workflow documentation generated')
}

// Run if executed directly
if (require.main === module) {
  generateWorkflowDocs()
}
