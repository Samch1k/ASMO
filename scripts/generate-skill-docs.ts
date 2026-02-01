#!/usr/bin/env tsx
/**
 * Generate skill documentation from skills-catalog.json
 */

import * as fs from 'fs'
import * as path from 'path'

interface Skill {
  id: string
  name: string
  description: string
  category: string
  complexity: string
  requires_skills: string[]
  required_mcps: string[]
  confidence_threshold: number
  estimated_time: string
  composable_with: string[]
  metadata: {
    tools: string[]
    docs: string[]
    difficulty: number
    success_rate: number
    aliases: string[]
    domain?: string
  }
}

interface SkillsCatalog {
  version: string
  skills: Skill[]
}

const SKILLS_FILE = path.join(__dirname, '../packages/core/templates/skills/skills-catalog.json')
const DOCS_EN_DIR = path.join(__dirname, '../docs/en/reference/skills')
const DOCS_RU_DIR = path.join(__dirname, '../docs/ru/reference/skills')

const CATEGORY_INFO: Record<string, { en: string; ru: string; emoji: string }> = {
  'architecture': { en: 'Architecture', ru: 'Архитектура', emoji: '🏗️' },
  'development': { en: 'Development', ru: 'Разработка', emoji: '👨‍💻' },
  'debugging': { en: 'Debugging', ru: 'Отладка', emoji: '🐛' },
  'testing': { en: 'Testing', ru: 'Тестирование', emoji: '🧪' },
  'performance': { en: 'Performance', ru: 'Производительность', emoji: '⚡' },
  'ui_design': { en: 'UI/UX Design', ru: 'UI/UX дизайн', emoji: '🎨' },
  'devops': { en: 'DevOps', ru: 'DevOps', emoji: '🚀' },
  'business': { en: 'Business', ru: 'Бизнес', emoji: '💼' },
  'product': { en: 'Product', ru: 'Продукт', emoji: '🎯' },
  'project_management': { en: 'Project Management', ru: 'Управление проектом', emoji: '📋' },
  'project_specific': { en: 'Project Specific', ru: 'Проектные', emoji: '🏢' },
  'analysis': { en: 'Analysis', ru: 'Анализ', emoji: '📊' },
  'superpowers_workflows': { en: 'Superpowers', ru: 'Суперсилы', emoji: '⭐' },
}

const COMPLEXITY_INFO: Record<string, { en: string; ru: string; color: string }> = {
  'basic': { en: 'Basic', ru: 'Базовый', color: '🟢' },
  'intermediate': { en: 'Intermediate', ru: 'Средний', color: '🟡' },
  'advanced': { en: 'Advanced', ru: 'Продвинутый', color: '🟠' },
  'expert': { en: 'Expert', ru: 'Экспертный', color: '🔴' },
}

function generateCategoryMarkdown(category: string, skills: Skill[], lang: 'en' | 'ru'): string {
  const info = CATEGORY_INFO[category] || { en: category, ru: category, emoji: '📌' }
  const categoryName = lang === 'ru' ? info.ru : info.en

  const byComplexity = {
    basic: skills.filter(s => s.complexity === 'basic'),
    intermediate: skills.filter(s => s.complexity === 'intermediate'),
    advanced: skills.filter(s => s.complexity === 'advanced'),
    expert: skills.filter(s => s.complexity === 'expert'),
  }

  if (lang === 'ru') {
    return `# ${info.emoji} ${categoryName}

${skills.length} навыков в этой категории.

## Обзор

| Навык | Сложность | Время | Успешность |
|-------|-----------|-------|------------|
${skills.map(s => {
  const cx = COMPLEXITY_INFO[s.complexity] || { ru: s.complexity, color: '⚪' }
  return `| **${s.name}** | ${cx.color} ${cx.ru} | ${s.estimated_time} | ${Math.round(s.metadata.success_rate * 100)}% |`
}).join('\n')}

${Object.entries(byComplexity)
  .filter(([_, arr]) => arr.length > 0)
  .map(([level, arr]) => {
    const cx = COMPLEXITY_INFO[level]
    return `
## ${cx.color} ${cx.ru} навыки

${arr.map(s => `
### ${s.name}

${s.description}

| Параметр | Значение |
|----------|----------|
| ID | \`${s.id}\` |
| Время | ${s.estimated_time} |
| Порог уверенности | ${s.confidence_threshold} |
| Сложность | ${s.metadata.difficulty}/10 |

${s.requires_skills.length > 0 ? `**Требует:** ${s.requires_skills.map(r => `\`${r}\``).join(', ')}` : ''}
${s.composable_with.length > 0 ? `**Комбинируется с:** ${s.composable_with.map(c => `\`${c}\``).join(', ')}` : ''}
${s.metadata.aliases.length > 0 ? `**Алиасы:** ${s.metadata.aliases.join(', ')}` : ''}
`).join('\n')}`
  }).join('\n')}

---

[← Назад к каталогу навыков](./index.md)
`
  }

  return `# ${info.emoji} ${categoryName}

${skills.length} skills in this category.

## Overview

| Skill | Complexity | Time | Success Rate |
|-------|------------|------|--------------|
${skills.map(s => {
  const cx = COMPLEXITY_INFO[s.complexity] || { en: s.complexity, color: '⚪' }
  return `| **${s.name}** | ${cx.color} ${cx.en} | ${s.estimated_time} | ${Math.round(s.metadata.success_rate * 100)}% |`
}).join('\n')}

${Object.entries(byComplexity)
  .filter(([_, arr]) => arr.length > 0)
  .map(([level, arr]) => {
    const cx = COMPLEXITY_INFO[level]
    return `
## ${cx.color} ${cx.en} Skills

${arr.map(s => `
### ${s.name}

${s.description}

| Property | Value |
|----------|-------|
| ID | \`${s.id}\` |
| Time | ${s.estimated_time} |
| Confidence Threshold | ${s.confidence_threshold} |
| Difficulty | ${s.metadata.difficulty}/10 |

${s.requires_skills.length > 0 ? `**Requires:** ${s.requires_skills.map(r => `\`${r}\``).join(', ')}` : ''}
${s.composable_with.length > 0 ? `**Composable with:** ${s.composable_with.map(c => `\`${c}\``).join(', ')}` : ''}
${s.metadata.aliases.length > 0 ? `**Aliases:** ${s.metadata.aliases.join(', ')}` : ''}
`).join('\n')}`
  }).join('\n')}

---

[← Back to Skills Catalog](./index.md)
`
}

function generateIndexMarkdown(skills: Skill[], lang: 'en' | 'ru'): string {
  const byCategory = new Map<string, Skill[]>()

  for (const skill of skills) {
    if (!byCategory.has(skill.category)) {
      byCategory.set(skill.category, [])
    }
    byCategory.get(skill.category)!.push(skill)
  }

  const sortedCategories = Array.from(byCategory.entries()).sort((a, b) => b[1].length - a[1].length)

  if (lang === 'ru') {
    return `# Каталог навыков

AI1st включает **${skills.length} навыков** в **${byCategory.size} категориях** для полного покрытия задач разработки.

## Статистика

| Метрика | Значение |
|---------|----------|
| Всего навыков | ${skills.length} |
| Категорий | ${byCategory.size} |
| Базовых | ${skills.filter(s => s.complexity === 'basic').length} |
| Средних | ${skills.filter(s => s.complexity === 'intermediate').length} |
| Продвинутых | ${skills.filter(s => s.complexity === 'advanced').length} |
| Экспертных | ${skills.filter(s => s.complexity === 'expert').length} |

## По категориям

| Категория | Навыков | Описание |
|-----------|---------|----------|
${sortedCategories.map(([cat, arr]) => {
  const info = CATEGORY_INFO[cat] || { ru: cat, emoji: '📌' }
  return `| [${info.emoji} ${info.ru}](./${cat}.md) | ${arr.length} | ${arr.slice(0, 3).map(s => s.name).join(', ')}... |`
}).join('\n')}

## Топ навыков по использованию

${skills
  .sort((a, b) => b.metadata.success_rate - a.metadata.success_rate)
  .slice(0, 10)
  .map((s, i) => `${i + 1}. **${s.name}** - ${Math.round(s.metadata.success_rate * 100)}% успешность`)
  .join('\n')}

## Как работает skill matching

AI1st автоматически подбирает навыки на основе:

1. **Ключевых слов** - Анализ описания задачи
2. **Алиасов** - Альтернативные названия навыков
3. **Зависимостей** - Автоматическое включение требуемых навыков
4. **Композиции** - Комбинирование совместимых навыков

## См. также

- [Концепция навыков](../../concepts/skills.md)
- [Каталог агентов](../agents/index.md)
`
  }

  return `# Skills Catalog

AI1st includes **${skills.length} skills** across **${byCategory.size} categories** for comprehensive development coverage.

## Statistics

| Metric | Value |
|--------|-------|
| Total Skills | ${skills.length} |
| Categories | ${byCategory.size} |
| Basic | ${skills.filter(s => s.complexity === 'basic').length} |
| Intermediate | ${skills.filter(s => s.complexity === 'intermediate').length} |
| Advanced | ${skills.filter(s => s.complexity === 'advanced').length} |
| Expert | ${skills.filter(s => s.complexity === 'expert').length} |

## By Category

| Category | Skills | Examples |
|----------|--------|----------|
${sortedCategories.map(([cat, arr]) => {
  const info = CATEGORY_INFO[cat] || { en: cat, emoji: '📌' }
  return `| [${info.emoji} ${info.en}](./${cat}.md) | ${arr.length} | ${arr.slice(0, 3).map(s => s.name).join(', ')}... |`
}).join('\n')}

## Top Skills by Success Rate

${skills
  .sort((a, b) => b.metadata.success_rate - a.metadata.success_rate)
  .slice(0, 10)
  .map((s, i) => `${i + 1}. **${s.name}** - ${Math.round(s.metadata.success_rate * 100)}% success rate`)
  .join('\n')}

## How Skill Matching Works

AI1st automatically selects skills based on:

1. **Keywords** - Task description analysis
2. **Aliases** - Alternative skill names
3. **Dependencies** - Auto-include required skills
4. **Composition** - Combine compatible skills

## See Also

- [Skills Concepts](../../concepts/skills.md)
- [Agent Catalog](../agents/index.md)
`
}

export async function generateSkillDocs(): Promise<void> {
  console.log('🎯 Generating skill documentation...')

  if (!fs.existsSync(SKILLS_FILE)) {
    console.log('  ⚠️ Skills catalog not found, skipping')
    return
  }

  const content = fs.readFileSync(SKILLS_FILE, 'utf-8')
  const catalog: SkillsCatalog = JSON.parse(content)
  const skills = catalog.skills

  console.log(`  Found ${skills.length} skills`)

  // Group by category
  const byCategory = new Map<string, Skill[]>()
  for (const skill of skills) {
    if (!byCategory.has(skill.category)) {
      byCategory.set(skill.category, [])
    }
    byCategory.get(skill.category)!.push(skill)
  }

  // Generate docs for each language
  for (const lang of ['en', 'ru'] as const) {
    const docsDir = lang === 'en' ? DOCS_EN_DIR : DOCS_RU_DIR

    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true })
    }

    // Generate index
    const indexContent = generateIndexMarkdown(skills, lang)
    fs.writeFileSync(path.join(docsDir, 'index.md'), indexContent)

    // Generate category pages
    for (const [category, categorySkills] of byCategory) {
      const content = generateCategoryMarkdown(category, categorySkills, lang)
      fs.writeFileSync(path.join(docsDir, `${category}.md`), content)
    }
  }

  console.log('  ✅ Skill documentation generated')
}

// Run if executed directly
if (require.main === module) {
  generateSkillDocs()
}
