#!/usr/bin/env tsx
/**
 * Generate agent documentation from JSON role definitions
 */

import * as fs from 'fs'
import * as path from 'path'

interface Role {
  id: string
  name: string
  description: string
  category: string
  role_type: string
  can_modify_code: boolean
  requires_plan?: boolean
  can_run_tests?: boolean
  can_deploy?: boolean
  required_skills: string[]
  optional_skills: string[]
  priority: number
  allowed_mcps: string[]
  activation_rules: {
    type: string
    trigger_keywords: string[]
    task_types: string[]
  }
  agent_class: string
  metadata: {
    llm_temperature: number
    max_tokens: number
    output_artifacts: string[]
    domain: string
    validation_threshold?: number
    confidence_threshold?: number
    error_threshold?: number
    approval_threshold?: number
  }
}

interface RolesFile {
  version: string
  roles: Role[]
}

const TEMPLATES_DIR = path.join(__dirname, '../packages/core/templates/roles')
const DOCS_EN_DIR = path.join(__dirname, '../docs/en/reference/agents')
const DOCS_RU_DIR = path.join(__dirname, '../docs/ru/reference/agents')

function getCategoryFolder(category: string): string {
  switch (category) {
    case 'core':
      return 'core'
    case 'specialized':
      return 'specialized'
    case 'validation':
    case 'project_specific':
      return 'validation'
    default:
      return 'specialized'
  }
}

function generateAgentMarkdown(role: Role, lang: 'en' | 'ru'): string {
  const emoji = getAgentEmoji(role.id)
  const capabilities = []
  if (role.can_modify_code) capabilities.push(lang === 'ru' ? '✏️ Может изменять код' : '✏️ Can modify code')
  if (role.requires_plan) capabilities.push(lang === 'ru' ? '📋 Требует план' : '📋 Requires plan')
  if (role.can_run_tests) capabilities.push(lang === 'ru' ? '🧪 Может запускать тесты' : '🧪 Can run tests')
  if (role.can_deploy) capabilities.push(lang === 'ru' ? '🚀 Может деплоить' : '🚀 Can deploy')

  if (lang === 'ru') {
    return `# ${emoji} ${role.name}

> ${role.description}

## Обзор

| Параметр | Значение |
|----------|----------|
| **ID** | \`${role.id}\` |
| **Категория** | ${translateCategory(role.category)} |
| **Тип роли** | ${translateRoleType(role.role_type)} |
| **Приоритет** | ${role.priority}/10 |
| **Домен** | ${role.metadata.domain} |

## Возможности

${capabilities.length > 0 ? capabilities.join('\n') : '- Стандартные возможности агента'}

## Навыки

### Обязательные навыки

${role.required_skills.map(s => `- \`${s}\``).join('\n') || '- Нет обязательных навыков'}

### Дополнительные навыки

${role.optional_skills.map(s => `- \`${s}\``).join('\n') || '- Нет дополнительных навыков'}

## Интеграции (MCP)

${role.allowed_mcps.map(m => `- \`${m}\``).join('\n')}

## Правила активации

- **Тип**: ${role.activation_rules.type === 'auto_attached' ? 'Авто-подключение' : 'Ручной вызов'}
- **Ключевые слова**: ${role.activation_rules.trigger_keywords.slice(0, 5).map(k => `\`${k}\``).join(', ')}
- **Типы задач**: ${role.activation_rules.task_types.map(t => `\`${t}\``).join(', ')}

## Параметры LLM

| Параметр | Значение |
|----------|----------|
| Temperature | ${role.metadata.llm_temperature} |
| Max Tokens | ${role.metadata.max_tokens} |

## Артефакты

${role.metadata.output_artifacts.map(a => `- \`${a}\``).join('\n')}

## Использование

\`\`\`typescript
import { AgentRegistry } from '@ai1st/core'

const registry = new AgentRegistry()
const agent = await registry.getAgent('${role.id}')
\`\`\`

---

[← Назад к списку агентов](./index.md)
`
  }

  return `# ${emoji} ${role.name}

> ${role.description}

## Overview

| Property | Value |
|----------|-------|
| **ID** | \`${role.id}\` |
| **Category** | ${role.category} |
| **Role Type** | ${role.role_type} |
| **Priority** | ${role.priority}/10 |
| **Domain** | ${role.metadata.domain} |

## Capabilities

${capabilities.length > 0 ? capabilities.join('\n') : '- Standard agent capabilities'}

## Skills

### Required Skills

${role.required_skills.map(s => `- \`${s}\``).join('\n') || '- No required skills'}

### Optional Skills

${role.optional_skills.map(s => `- \`${s}\``).join('\n') || '- No optional skills'}

## Integrations (MCP)

${role.allowed_mcps.map(m => `- \`${m}\``).join('\n')}

## Activation Rules

- **Type**: ${role.activation_rules.type === 'auto_attached' ? 'Auto-attached' : 'Manual'}
- **Trigger Keywords**: ${role.activation_rules.trigger_keywords.slice(0, 5).map(k => `\`${k}\``).join(', ')}
- **Task Types**: ${role.activation_rules.task_types.map(t => `\`${t}\``).join(', ')}

## LLM Parameters

| Parameter | Value |
|-----------|-------|
| Temperature | ${role.metadata.llm_temperature} |
| Max Tokens | ${role.metadata.max_tokens} |

## Output Artifacts

${role.metadata.output_artifacts.map(a => `- \`${a}\``).join('\n')}

## Usage

\`\`\`typescript
import { AgentRegistry } from '@ai1st/core'

const registry = new AgentRegistry()
const agent = await registry.getAgent('${role.id}')
\`\`\`

---

[← Back to Agents](./index.md)
`
}

function getAgentEmoji(id: string): string {
  const emojis: Record<string, string> = {
    'architect': '🏗️',
    'developer': '👨‍💻',
    'debugger': '🐛',
    'optimizer': '⚡',
    'tester': '🧪',
    'devops': '🚀',
    'ui-developer': '🎨',
    'ux-designer': '🎭',
    'business-analyst': '📊',
    'project-manager': '📋',
    'product-owner': '🎯',
    'scrum-master': '🔄',
    'security-specialist': '🔒',
    'performance-engineer': '📈',
    'data-architect': '💾',
    'api-designer': '🔌',
    'design-validator': '✅',
    'merge-coordinator': '🔀',
    'post-deploy-monitor': '👁️',
    'requirements-validator': '📝',
    'code-reviewer': '👀',
  }
  return emojis[id] || '🤖'
}

function translateCategory(category: string): string {
  const translations: Record<string, string> = {
    'core': 'Базовый',
    'specialized': 'Специализированный',
    'validation': 'Валидация',
    'project_specific': 'Проектный',
  }
  return translations[category] || category
}

function translateRoleType(type: string): string {
  const translations: Record<string, string> = {
    'reasoning': 'Аналитический',
    'execution': 'Исполнительный',
    'hybrid': 'Гибридный',
  }
  return translations[type] || type
}

function generateIndexMarkdown(roles: Role[], lang: 'en' | 'ru'): string {
  const coreRoles = roles.filter(r => r.category === 'core')
  const specializedRoles = roles.filter(r => r.category === 'specialized')
  const validationRoles = roles.filter(r => r.category === 'validation' || r.category === 'project_specific')

  if (lang === 'ru') {
    return `# Каталог агентов

AI1st включает **${roles.length} агентов**, организованных в три категории.

## Обзор

| Категория | Количество | Описание |
|-----------|------------|----------|
| [Core](#core-агенты) | ${coreRoles.length} | Базовые агенты разработки |
| [Specialized](#специализированные-агенты) | ${specializedRoles.length} | Специализированные роли |
| [Validation](#агенты-валидации) | ${validationRoles.length} | Агенты проверки и контроля |

## Core агенты

Базовые агенты для стандартных задач разработки.

| Агент | Описание | Тип |
|-------|----------|-----|
${coreRoles.map(r => `| [${getAgentEmoji(r.id)} ${r.name}](./core/${r.id}.md) | ${r.description.slice(0, 60)}... | ${translateRoleType(r.role_type)} |`).join('\n')}

## Специализированные агенты

Агенты для специфических доменов и задач.

| Агент | Описание | Домен |
|-------|----------|-------|
${specializedRoles.map(r => `| [${getAgentEmoji(r.id)} ${r.name}](./specialized/${r.id}.md) | ${r.description.slice(0, 50)}... | ${r.metadata.domain} |`).join('\n')}

## Агенты валидации

Агенты для проверки качества и контроля.

| Агент | Описание | Тип |
|-------|----------|-----|
${validationRoles.map(r => `| [${getAgentEmoji(r.id)} ${r.name}](./validation/${r.id}.md) | ${r.description.slice(0, 60)}... | ${translateRoleType(r.role_type)} |`).join('\n')}

## Типы ролей

- **Аналитический (reasoning)** - Агенты, которые анализируют и принимают решения
- **Исполнительный (execution)** - Агенты, которые выполняют конкретные действия
- **Гибридный (hybrid)** - Комбинация анализа и исполнения

## См. также

- [Концепция агентов](../../concepts/agents.md)
- [Создание custom агентов](../../guides/custom-agents.md)
`
  }

  return `# Agent Catalog

AI1st includes **${roles.length} agents** organized into three categories.

## Overview

| Category | Count | Description |
|----------|-------|-------------|
| [Core](#core-agents) | ${coreRoles.length} | Essential development agents |
| [Specialized](#specialized-agents) | ${specializedRoles.length} | Domain-specific roles |
| [Validation](#validation-agents) | ${validationRoles.length} | Quality and control agents |

## Core Agents

Essential agents for standard development tasks.

| Agent | Description | Type |
|-------|-------------|------|
${coreRoles.map(r => `| [${getAgentEmoji(r.id)} ${r.name}](./core/${r.id}.md) | ${r.description.slice(0, 60)}... | ${r.role_type} |`).join('\n')}

## Specialized Agents

Agents for specific domains and tasks.

| Agent | Description | Domain |
|-------|-------------|--------|
${specializedRoles.map(r => `| [${getAgentEmoji(r.id)} ${r.name}](./specialized/${r.id}.md) | ${r.description.slice(0, 50)}... | ${r.metadata.domain} |`).join('\n')}

## Validation Agents

Agents for quality assurance and control.

| Agent | Description | Type |
|-------|-------------|------|
${validationRoles.map(r => `| [${getAgentEmoji(r.id)} ${r.name}](./validation/${r.id}.md) | ${r.description.slice(0, 60)}... | ${r.role_type} |`).join('\n')}

## Role Types

- **Reasoning** - Agents that analyze and make decisions
- **Execution** - Agents that perform concrete actions
- **Hybrid** - Combination of analysis and execution

## See Also

- [Agent Concepts](../../concepts/agents.md)
- [Creating Custom Agents](../../guides/custom-agents.md)
`
}

export async function generateAgentDocs(): Promise<void> {
  console.log('🤖 Generating agent documentation...')

  // Load all role files
  const roleFiles = ['core-roles.json', 'specialized-roles.json', 'validation-roles.json']
  const allRoles: Role[] = []

  for (const file of roleFiles) {
    const filePath = path.join(TEMPLATES_DIR, file)
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8')
      const data: RolesFile = JSON.parse(content)
      allRoles.push(...data.roles)
    }
  }

  console.log(`  Found ${allRoles.length} agents`)

  // Generate docs for each language
  for (const lang of ['en', 'ru'] as const) {
    const docsDir = lang === 'en' ? DOCS_EN_DIR : DOCS_RU_DIR

    // Generate index
    const indexContent = generateIndexMarkdown(allRoles, lang)
    fs.writeFileSync(path.join(docsDir, 'index.md'), indexContent)

    // Generate individual agent docs
    for (const role of allRoles) {
      const categoryFolder = getCategoryFolder(role.category)
      const agentDir = path.join(docsDir, categoryFolder)

      if (!fs.existsSync(agentDir)) {
        fs.mkdirSync(agentDir, { recursive: true })
      }

      const content = generateAgentMarkdown(role, lang)
      fs.writeFileSync(path.join(agentDir, `${role.id}.md`), content)
    }
  }

  console.log('  ✅ Agent documentation generated')
}

// Run if executed directly
if (require.main === module) {
  generateAgentDocs()
}
