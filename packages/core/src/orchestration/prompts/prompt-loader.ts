/**
 * Prompt Template Loader
 *
 * Loads and renders prompt templates for agents.
 * Templates are markdown files with variable substitution.
 *
 * Variable syntax: {{variable_name}}
 */

import * as fs from 'fs'
import * as path from 'path'

// =============================================================================
// TYPES
// =============================================================================

export interface PromptContext {
  /** Current task description */
  task?: string
  /** Task type (feature, bug_fix, etc.) */
  taskType?: string
  /** Project context */
  projectContext?: Record<string, unknown>
  /** Agent-specific context */
  agentContext?: Record<string, unknown>
  /** Additional variables */
  [key: string]: unknown
}

export interface PromptTemplate {
  /** Template name/id */
  name: string
  /** Raw template content */
  content: string
  /** Template file path */
  filePath: string
}

export interface LoadedPrompt {
  /** Rendered prompt content */
  content: string
  /** Variables used in rendering */
  variables: Record<string, string>
  /** Template metadata */
  template: PromptTemplate
}

// =============================================================================
// PROMPT LOADER
// =============================================================================

export class PromptLoader {
  private templateCache: Map<string, PromptTemplate> = new Map()
  private promptsDir: string

  constructor(promptsDir?: string) {
    this.promptsDir = promptsDir || path.join(__dirname)
  }

  /**
   * Load a prompt template by name
   */
  loadTemplate(templateName: string): PromptTemplate {
    // Check cache
    const cached = this.templateCache.get(templateName)
    if (cached) {
      return cached
    }

    // Resolve file path
    const filePath = this.resolveTemplatePath(templateName)

    // Read template file
    if (!fs.existsSync(filePath)) {
      throw new Error(`Prompt template not found: ${templateName} (${filePath})`)
    }

    const content = fs.readFileSync(filePath, 'utf-8')

    const template: PromptTemplate = {
      name: templateName,
      content,
      filePath
    }

    // Cache it
    this.templateCache.set(templateName, template)

    return template
  }

  /**
   * Render a template with context
   */
  render(templateName: string, context: PromptContext): LoadedPrompt {
    const template = this.loadTemplate(templateName)

    // Extract variables from template
    const variablePattern = /\{\{(\w+)\}\}/g
    const variables: Record<string, string> = {}

    // Replace variables with context values
    const rendered = template.content.replace(variablePattern, (_match, varName) => {
      const value = this.resolveVariable(varName, context)
      variables[varName] = value
      return value
    })

    return {
      content: rendered,
      variables,
      template
    }
  }

  /**
   * Get all available templates
   */
  listTemplates(): string[] {
    if (!fs.existsSync(this.promptsDir)) {
      return []
    }

    return fs.readdirSync(this.promptsDir)
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace('.md', ''))
  }

  /**
   * Clear template cache
   */
  clearCache(): void {
    this.templateCache.clear()
  }

  /**
   * Resolve template file path
   */
  private resolveTemplatePath(templateName: string): string {
    // If already has extension, use as-is
    if (templateName.endsWith('.md')) {
      return path.isAbsolute(templateName)
        ? templateName
        : path.join(this.promptsDir, templateName)
    }

    // Add .md extension
    return path.join(this.promptsDir, `${templateName}.md`)
  }

  /**
   * Resolve a variable from context
   */
  private resolveVariable(varName: string, context: PromptContext): string {
    // Direct match
    if (varName in context && context[varName] !== undefined) {
      const value = context[varName]
      return typeof value === 'string' ? value : JSON.stringify(value, null, 2)
    }

    // Check nested in projectContext
    if (context.projectContext && varName in context.projectContext) {
      const value = context.projectContext[varName]
      return typeof value === 'string' ? value : JSON.stringify(value, null, 2)
    }

    // Check nested in agentContext
    if (context.agentContext && varName in context.agentContext) {
      const value = context.agentContext[varName]
      return typeof value === 'string' ? value : JSON.stringify(value, null, 2)
    }

    // Return placeholder if not found
    console.warn(`[ASMO] Prompt variable "${varName}" not resolved`)
    return `[${varName}]`
  }
}

// =============================================================================
// SINGLETON
// =============================================================================

let promptLoaderInstance: PromptLoader | null = null

export function getPromptLoader(promptsDir?: string): PromptLoader {
  if (!promptLoaderInstance) {
    promptLoaderInstance = new PromptLoader(promptsDir)
  }
  return promptLoaderInstance
}

export function resetPromptLoader(): void {
  promptLoaderInstance = null
}
