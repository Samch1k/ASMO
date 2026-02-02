/**
 * PersonalityPromptLoader - Dynamic prompt enrichment with agent personalities
 *
 * ✨ BMAD Phase 3: Loads markdown prompts and enriches them with:
 * - Agent personality traits and communication style
 * - Core principles (strict and guidelines)
 * - Bilingual catchphrases and signatures
 *
 * Features:
 * - Automatic language detection (EN/RU)
 * - Personality section generation
 * - Principle enforcement messaging
 * - Agent signature formatting
 */

import * as fs from 'fs/promises'
import * as path from 'path'
import type { Role } from '../agents/types'

/**
 * Agent configuration interface (subset needed for prompt loading)
 */
interface AgentConfig {
  id: string
  name: string
  description: string
  prompt_template?: string
  personality?: Role['personality']
  principles?: Role['principles']
}

/**
 * PersonalityPromptLoader - Enriches prompts with personality data
 */
export class PersonalityPromptLoader {
  /**
   * Load prompt with personality enrichment
   *
   * @param agentConfig - Agent configuration with personality and principles
   * @param task - Current task (for language detection)
   * @param context - Additional context
   * @returns Enriched prompt with personality sections
   */
  async loadPromptWithPersonality(
    agentConfig: AgentConfig,
    task: string,
    context: Record<string, any> = {}
  ): Promise<string> {
    if (!agentConfig) {
      throw new Error('Agent config is required')
    }

    // Detect language from task or context
    const language = this.detectLanguage(task, context)

    // If no personality defined, try to load base prompt only
    if (!agentConfig.personality) {
      if (agentConfig.prompt_template) {
        return this.loadMarkdownPrompt(agentConfig.prompt_template)
      }
      // Return minimal generic prompt
      return this.getGenericPrompt(agentConfig, language)
    }

    // Load base prompt (if available)
    let basePrompt = ''
    if (agentConfig.prompt_template) {
      try {
        basePrompt = await this.loadMarkdownPrompt(agentConfig.prompt_template)
      } catch (error) {
        console.warn(`⚠️  Could not load prompt template: ${agentConfig.prompt_template}`)
        basePrompt = this.getGenericPrompt(agentConfig, language)
      }
    } else {
      basePrompt = this.getGenericPrompt(agentConfig, language)
    }

    // Build personality sections
    const personalitySection = this.buildPersonalitySection(agentConfig, language)
    const principlesSection = this.buildPrinciplesSection(agentConfig, language)
    const signatureSection = this.buildSignatureSection(agentConfig, language)

    // Combine all sections
    // If basePrompt already has personality (like our updated prompts), return as-is
    // Otherwise, prepend personality sections
    if (basePrompt.includes('## About Me') || basePrompt.includes('## Обо мне')) {
      // Prompt already enriched, return as-is
      return basePrompt
    }

    // Enrich base prompt with personality and principles
    return `${personalitySection}\n\n${principlesSection}\n\n${basePrompt}\n\n${signatureSection}`
  }

  /**
   * Detect language from task and context
   *
   * @param task - Task description
   * @param context - Additional context
   * @returns Language code ('en' or 'ru')
   */
  private detectLanguage(task: string, context: Record<string, any>): 'en' | 'ru' {
    // Check explicit language setting
    if (context.language === 'ru' || context.language === 'en') {
      return context.language
    }

    // Check for Cyrillic characters in task
    if (task && /[а-яА-ЯёЁ]/.test(task)) {
      return 'ru'
    }

    // Check context for Cyrillic
    const contextStr = JSON.stringify(context)
    if (/[а-яА-ЯёЁ]/.test(contextStr)) {
      return 'ru'
    }

    // Default to English
    return 'en'
  }

  /**
   * Build personality section with traits and catchphrase
   *
   * @param config - Agent configuration
   * @param language - Language for messages
   * @returns Formatted personality section
   */
  private buildPersonalitySection(config: AgentConfig, language: 'en' | 'ru'): string {
    if (!config.personality) {
      return ''
    }

    const catchphrase = language === 'ru'
      ? config.personality.catchphrase_ru
      : config.personality.catchphrase_en

    const header = language === 'ru'
      ? `# ${config.name} - ${config.description}`
      : `# ${config.name} - ${config.description}`

    return `${header}

## About Me / Обо мне

**My motto / Мой девиз**: "${catchphrase}"

**My style**: ${config.personality.style}

**Traits**: ${config.personality.traits.join(', ')}`
  }

  /**
   * Build principles section with strict and guideline principles
   *
   * @param config - Agent configuration
   * @param language - Language for messages
   * @returns Formatted principles section
   */
  private buildPrinciplesSection(config: AgentConfig, language: 'en' | 'ru'): string {
    if (!config.principles || config.principles.length === 0) {
      return ''
    }

    const header = language === 'ru'
      ? '## Мои принципы (неизменяемые)'
      : '## My Non-Negotiables'

    let section = `${header}\n\n`

    for (const principle of config.principles) {
      const strictness = principle.strict ? '🔒 STRICT' : '💡 GUIDELINE'
      const description = language === 'ru'
        ? principle.description_ru
        : principle.description_en

      section += `${strictness}: **${principle.name}** - ${description}\n`
    }

    return section
  }

  /**
   * Build signature section for agent
   *
   * @param config - Agent configuration
   * @param language - Language for messages
   * @returns Formatted signature
   */
  private buildSignatureSection(config: AgentConfig, language: 'en' | 'ru'): string {
    if (!config.personality?.communication) {
      return `\n---\n*${config.name}*`
    }

    const signature = language === 'ru'
      ? config.personality.communication.signature_ru
      : config.personality.communication.signature_en

    return `\n---\n*${signature}*`
  }

  /**
   * Load markdown prompt from file
   *
   * @param templatePath - Relative path to prompt template
   * @returns Prompt content
   */
  private async loadMarkdownPrompt(templatePath: string): Promise<string> {
    // Try multiple possible locations
    const possiblePaths = [
      path.join(__dirname, 'prompts', templatePath),
      path.join(__dirname, '../prompts', templatePath),
      path.join(__dirname, '../../prompts', templatePath),
      path.join(process.cwd(), 'packages/core/src/orchestration/prompts', templatePath)
    ]

    for (const fullPath of possiblePaths) {
      try {
        const content = await fs.readFile(fullPath, 'utf-8')
        return content
      } catch {
        // Try next path
        continue
      }
    }

    throw new Error(`Could not find prompt template: ${templatePath}`)
  }

  /**
   * Get generic prompt when no template available
   *
   * @param config - Agent configuration
   * @param language - Language for prompt
   * @returns Generic prompt string
   */
  private getGenericPrompt(config: AgentConfig, language: 'en' | 'ru'): string {
    const header = language === 'ru'
      ? `# ${config.name} - ${config.description}`
      : `# ${config.name} - ${config.description}`

    const roleSection = language === 'ru'
      ? '## Моя роль\n\nВыполняйте задачи согласно вашей специализации.'
      : '## My Role\n\nPerform tasks according to your specialization.'

    const taskSection = language === 'ru'
      ? '## Текущая задача\n\n{{task}}'
      : '## Current Task\n\n{{task}}'

    return `${header}\n\n${roleSection}\n\n${taskSection}`
  }
}
