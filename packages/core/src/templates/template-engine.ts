/**
 * TemplateEngine - AI-First Template Processing
 *
 * BMAD Gaps Closing: Phase 3 - AI-First Templates
 *
 * Handles loading, rendering, validating, and parsing of AI-first templates.
 * Designed for reliable LLM output parsing with structured XML tags.
 *
 * Features:
 * - Template loading from filesystem or registry
 * - Variable interpolation with type validation
 * - XML-based output parsing
 * - Zod schema validation
 * - Template caching for performance
 */

import * as fs from 'fs/promises'
import * as path from 'path'
import { z } from 'zod'
import type {
  AIFirstTemplate,
  TemplateSection,
  TemplateVariable,
  TemplateValidationResult,
  ParsedTemplateOutput,
  ParsedSection,
  TemplateSectionTag
} from './template-schema'
import {
  AIFirstTemplateSchema,
  validateTemplate,
  validateVariable
} from './template-schema'

// =============================================================================
// TYPES
// =============================================================================

/**
 * Render options for template rendering
 */
export interface RenderOptions {
  /** Variables to interpolate */
  variables: Record<string, any>
  /** Whether to validate variables before rendering */
  validate?: boolean
  /** Output format preference */
  format?: 'xml' | 'markdown' | 'text'
  /** Whether to include metadata section */
  includeMetadata?: boolean
}

/**
 * Parse options for output parsing
 */
export interface ParseOptions {
  /** Schema to validate parsed output */
  schema?: z.ZodType<any>
  /** Whether to use strict parsing (fail on missing sections) */
  strict?: boolean
  /** Custom section extractors */
  customExtractors?: Map<string, (content: string) => any>
}

/**
 * Template cache entry
 */
interface CacheEntry {
  template: AIFirstTemplate
  loadedAt: Date
  path?: string
}

// =============================================================================
// TEMPLATE ENGINE
// =============================================================================

/**
 * TemplateEngine - Main class for template operations
 */
export class TemplateEngine {
  private cache: Map<string, CacheEntry> = new Map()
  private templateDir: string

  constructor(templateDir?: string) {
    this.templateDir = templateDir || path.join(process.cwd(), '.cursor/templates/ai-first')
  }

  // ===========================================================================
  // LOADING
  // ===========================================================================

  /**
   * Load a template from file
   */
  async loadTemplate(templatePath: string): Promise<AIFirstTemplate> {
    // Check cache first
    const cached = this.cache.get(templatePath)
    if (cached) {
      return cached.template
    }

    // Resolve path
    const fullPath = path.isAbsolute(templatePath)
      ? templatePath
      : path.join(this.templateDir, templatePath)

    // Read and parse file
    const content = await fs.readFile(fullPath, 'utf-8')
    let data: unknown

    if (fullPath.endsWith('.json')) {
      data = JSON.parse(content)
    } else if (fullPath.endsWith('.yaml') || fullPath.endsWith('.yml')) {
      // Simple YAML-like parsing (for basic cases)
      // In production, use a proper YAML parser
      data = this.parseSimpleYaml(content)
    } else {
      throw new Error(`Unsupported template format: ${fullPath}`)
    }

    // Validate against schema
    const validation = validateTemplate(data)
    if (!validation.valid) {
      throw new Error(`Invalid template: ${validation.errors.map(e => e.message).join(', ')}`)
    }

    const template = AIFirstTemplateSchema.parse(data)

    // Cache the template
    this.cache.set(templatePath, {
      template,
      loadedAt: new Date(),
      path: fullPath
    })

    return template
  }

  /**
   * Load template from object (for programmatic use)
   */
  loadTemplateFromObject(template: AIFirstTemplate): AIFirstTemplate {
    const validation = validateTemplate(template)
    if (!validation.valid) {
      throw new Error(`Invalid template: ${validation.errors.map(e => e.message).join(', ')}`)
    }

    // Cache by ID
    this.cache.set(template.id, {
      template,
      loadedAt: new Date()
    })

    return template
  }

  /**
   * Get template by ID (from cache)
   */
  getTemplate(templateId: string): AIFirstTemplate | undefined {
    return this.cache.get(templateId)?.template
  }

  /**
   * List all loaded templates
   */
  listTemplates(): Array<{ id: string; name: string; version: string }> {
    return Array.from(this.cache.values()).map(entry => ({
      id: entry.template.id,
      name: entry.template.name,
      version: entry.template.version
    }))
  }

  /**
   * Clear template cache
   */
  clearCache(): void {
    this.cache.clear()
  }

  // ===========================================================================
  // RENDERING
  // ===========================================================================

  /**
   * Render a template with variables
   */
  render(templateId: string, options: RenderOptions): string {
    const template = this.getTemplate(templateId)
    if (!template) {
      throw new Error(`Template not found: ${templateId}`)
    }

    // Validate variables if requested
    if (options.validate !== false) {
      this.validateVariables(template, options.variables)
    }

    // Build output based on format
    const format = options.format || 'xml'

    switch (format) {
      case 'xml':
        return this.renderXml(template, options.variables, options.includeMetadata)
      case 'markdown':
        return this.renderMarkdown(template, options.variables, options.includeMetadata)
      case 'text':
        return this.renderText(template, options.variables)
      default:
        throw new Error(`Unsupported format: ${format}`)
    }
  }

  /**
   * Render template as XML
   */
  private renderXml(
    template: AIFirstTemplate,
    variables: Record<string, any>,
    includeMetadata?: boolean
  ): string {
    const lines: string[] = []

    lines.push(`<template id="${template.id}" version="${template.version}">`)

    // Metadata section
    if (includeMetadata) {
      lines.push('  <metadata>')
      lines.push(`    <generated_at>${new Date().toISOString()}</generated_at>`)
      lines.push(`    <template_name>${template.name}</template_name>`)
      lines.push('  </metadata>')
    }

    // Render each section
    for (const section of template.sections.sort((a, b) => (a.order || 0) - (b.order || 0))) {
      lines.push(this.renderXmlSection(section, variables, 1))
    }

    lines.push('</template>')

    return lines.join('\n')
  }

  /**
   * Render a single XML section
   */
  private renderXmlSection(
    section: TemplateSection,
    variables: Record<string, any>,
    depth: number
  ): string {
    const indent = '  '.repeat(depth)
    const lines: string[] = []
    const tag = section.customTag || section.tag

    // Opening tag with attributes
    const attrs: string[] = []
    if (section.required) attrs.push('required="true"')
    if (section.format !== 'markdown') attrs.push(`format="${section.format}"`)

    const attrStr = attrs.length > 0 ? ' ' + attrs.join(' ') : ''
    lines.push(`${indent}<${tag}${attrStr}>`)

    // Title if present
    if (section.title) {
      lines.push(`${indent}  <title>${section.title}</title>`)
    }

    // Content with variable interpolation
    if (section.content) {
      const content = this.interpolateVariables(section.content, variables)
      lines.push(`${indent}  <content>`)
      content.split('\n').forEach(line => {
        lines.push(`${indent}    ${line}`)
      })
      lines.push(`${indent}  </content>`)
    }

    // Nested subsections
    if (section.subsections && section.subsections.length > 0) {
      for (const subsection of section.subsections) {
        lines.push(this.renderXmlSection(subsection, variables, depth + 1))
      }
    }

    // Closing tag
    lines.push(`${indent}</${tag}>`)

    return lines.join('\n')
  }

  /**
   * Render template as Markdown
   */
  private renderMarkdown(
    template: AIFirstTemplate,
    variables: Record<string, any>,
    includeMetadata?: boolean
  ): string {
    const lines: string[] = []

    // Header
    lines.push(`# ${this.interpolateVariables(template.name, variables)}`)
    lines.push('')

    if (template.description) {
      lines.push(this.interpolateVariables(template.description, variables))
      lines.push('')
    }

    // Metadata
    if (includeMetadata) {
      lines.push('---')
      lines.push(`Template: ${template.id}`)
      lines.push(`Version: ${template.version}`)
      lines.push(`Generated: ${new Date().toISOString()}`)
      lines.push('---')
      lines.push('')
    }

    // Render sections
    for (const section of template.sections.sort((a, b) => (a.order || 0) - (b.order || 0))) {
      lines.push(this.renderMarkdownSection(section, variables, 2))
    }

    return lines.join('\n')
  }

  /**
   * Render a single Markdown section
   */
  private renderMarkdownSection(
    section: TemplateSection,
    variables: Record<string, any>,
    headingLevel: number
  ): string {
    const lines: string[] = []
    const heading = '#'.repeat(headingLevel)

    // Title
    const title = section.title || section.customTag || section.tag
    lines.push(`${heading} ${title}`)
    lines.push('')

    // Content
    if (section.content) {
      const content = this.interpolateVariables(section.content, variables)
      lines.push(content)
      lines.push('')
    }

    // Subsections
    if (section.subsections && section.subsections.length > 0) {
      for (const subsection of section.subsections) {
        lines.push(this.renderMarkdownSection(subsection, variables, headingLevel + 1))
      }
    }

    return lines.join('\n')
  }

  /**
   * Render template as plain text
   */
  private renderText(
    template: AIFirstTemplate,
    variables: Record<string, any>
  ): string {
    const lines: string[] = []

    lines.push(this.interpolateVariables(template.name, variables).toUpperCase())
    lines.push('='.repeat(50))
    lines.push('')

    for (const section of template.sections) {
      const title = section.title || section.tag
      lines.push(title.toUpperCase())
      lines.push('-'.repeat(title.length))

      if (section.content) {
        lines.push(this.interpolateVariables(section.content, variables))
      }
      lines.push('')
    }

    return lines.join('\n')
  }

  /**
   * Interpolate variables in content string
   */
  private interpolateVariables(content: string, variables: Record<string, any>): string {
    return content.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
      const value = variables[varName]
      if (value === undefined) {
        return match // Keep placeholder if variable not found
      }
      if (Array.isArray(value)) {
        return value.join(', ')
      }
      if (typeof value === 'object') {
        return JSON.stringify(value)
      }
      return String(value)
    })
  }

  // ===========================================================================
  // VALIDATION
  // ===========================================================================

  /**
   * Validate variables against template definitions
   */
  validateVariables(template: AIFirstTemplate, variables: Record<string, any>): void {
    const errors: string[] = []

    for (const varDef of template.variables) {
      const result = validateVariable(variables[varDef.name], varDef)
      if (!result.valid && result.error) {
        errors.push(result.error)
      }
    }

    if (errors.length > 0) {
      throw new Error(`Variable validation failed: ${errors.join('; ')}`)
    }
  }

  /**
   * Validate output against template structure
   */
  validate(output: string, templateId: string): TemplateValidationResult {
    const template = this.getTemplate(templateId)
    if (!template) {
      return {
        valid: false,
        errors: [{ code: 'TEMPLATE_NOT_FOUND', message: `Template not found: ${templateId}`, severity: 'error' }],
        warnings: [],
        validatedSections: [],
        resolvedVariables: []
      }
    }

    const errors: TemplateValidationResult['errors'] = []
    const warnings: TemplateValidationResult['warnings'] = []
    const validatedSections: string[] = []

    // Check required sections are present
    for (const section of template.sections) {
      const tag = section.customTag || section.tag
      const sectionRegex = new RegExp(`<${tag}[^>]*>`, 'i')

      if (sectionRegex.test(output)) {
        validatedSections.push(tag)
      } else if (section.required) {
        errors.push({
          code: 'MISSING_SECTION',
          message: `Required section missing: ${tag}`,
          section: tag,
          severity: 'error'
        })
      } else {
        warnings.push({
          code: 'OPTIONAL_SECTION_MISSING',
          message: `Optional section missing: ${tag}`,
          section: tag,
          severity: 'warning'
        })
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      validatedSections,
      resolvedVariables: []
    }
  }

  // ===========================================================================
  // PARSING
  // ===========================================================================

  /**
   * Parse LLM output according to template
   */
  parseOutput(output: string, templateId: string, options?: ParseOptions): ParsedTemplateOutput {
    const template = this.getTemplate(templateId)
    if (!template) {
      throw new Error(`Template not found: ${templateId}`)
    }

    const parsedSections: ParsedSection[] = []

    // Parse each section
    for (const section of template.sections) {
      const parsedSection = this.parseSection(output, section, options?.customExtractors)
      parsedSections.push(parsedSection)

      // Strict mode: fail on missing required sections
      if (options?.strict && section.required && !parsedSection.found) {
        throw new Error(`Required section not found: ${section.tag}`)
      }
    }

    // Extract variables from output (if any variable markers exist)
    const variables = this.extractVariables(output, template.variables)

    // Validate against schema if provided
    if (options?.schema) {
      const sectionData: Record<string, any> = {}
      for (const ps of parsedSections) {
        sectionData[ps.tag] = ps.content
      }

      const result = options.schema.safeParse(sectionData)
      if (!result.success) {
        throw new Error(`Schema validation failed: ${result.error.message}`)
      }
    }

    // Calculate overall confidence
    const foundSections = parsedSections.filter(s => s.found)
    const confidence = foundSections.length / parsedSections.length

    return {
      templateId,
      templateVersion: template.version,
      sections: parsedSections,
      variables,
      rawOutput: output,
      parsedAt: new Date(),
      confidence
    }
  }

  /**
   * Parse a single section from output
   */
  private parseSection(
    output: string,
    section: TemplateSection,
    customExtractors?: Map<string, (content: string) => any>
  ): ParsedSection {
    const tag = section.customTag || section.tag

    // Try custom extractor first
    if (customExtractors?.has(tag)) {
      const extractor = customExtractors.get(tag)!
      try {
        const content = extractor(output)
        return {
          tag: section.tag as TemplateSectionTag,
          customTag: section.customTag,
          content,
          found: true,
          confidence: 1.0
        }
      } catch {
        // Fall through to default parsing
      }
    }

    // XML-style extraction
    const xmlRegex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i')
    const xmlMatch = output.match(xmlRegex)

    if (xmlMatch) {
      const content = xmlMatch[1].trim()

      // Parse nested content if there's a <content> tag
      const contentTagRegex = /<content>([\s\S]*?)<\/content>/i
      const contentMatch = content.match(contentTagRegex)
      const finalContent = contentMatch ? contentMatch[1].trim() : content

      // Parse subsections
      let subsections: ParsedSection[] | undefined
      if (section.subsections && section.subsections.length > 0) {
        subsections = section.subsections.map((sub: TemplateSection) =>
          this.parseSection(content, sub, customExtractors)
        )
      }

      return {
        tag: section.tag as TemplateSectionTag,
        customTag: section.customTag,
        content: finalContent,
        found: true,
        confidence: 1.0,
        subsections
      }
    }

    // Markdown-style extraction (fallback)
    const title = section.title || tag
    const mdRegex = new RegExp(`#+\\s*${title}\\s*\\n([\\s\\S]*?)(?=\\n#+|$)`, 'i')
    const mdMatch = output.match(mdRegex)

    if (mdMatch) {
      return {
        tag: section.tag as TemplateSectionTag,
        customTag: section.customTag,
        content: mdMatch[1].trim(),
        found: true,
        confidence: 0.8 // Lower confidence for markdown parsing
      }
    }

    // Section not found
    return {
      tag: section.tag as TemplateSectionTag,
      customTag: section.customTag,
      content: null,
      found: false,
      confidence: 0
    }
  }

  /**
   * Extract variables from output
   */
  private extractVariables(
    output: string,
    definitions: TemplateVariable[]
  ): Record<string, any> {
    const variables: Record<string, any> = {}

    for (const def of definitions) {
      // Try XML-style variable
      const xmlRegex = new RegExp(`<${def.name}>([\\s\\S]*?)</${def.name}>`, 'i')
      const xmlMatch = output.match(xmlRegex)

      if (xmlMatch) {
        variables[def.name] = this.parseVariableValue(xmlMatch[1].trim(), def.type)
        continue
      }

      // Try key: value style
      const kvRegex = new RegExp(`${def.name}:\\s*(.+)`, 'i')
      const kvMatch = output.match(kvRegex)

      if (kvMatch) {
        variables[def.name] = this.parseVariableValue(kvMatch[1].trim(), def.type)
        continue
      }

      // Use default value if defined
      if (def.defaultValue !== undefined) {
        variables[def.name] = def.defaultValue
      }
    }

    return variables
  }

  /**
   * Parse variable value to appropriate type
   */
  private parseVariableValue(value: string, type: TemplateVariable['type']): any {
    switch (type) {
      case 'number':
        return parseFloat(value)
      case 'boolean':
        return value.toLowerCase() === 'true' || value === '1'
      case 'date':
        return new Date(value)
      case 'array':
        // Try JSON parse, fallback to comma-separated
        try {
          return JSON.parse(value)
        } catch {
          return value.split(',').map(s => s.trim())
        }
      case 'object':
        return JSON.parse(value)
      case 'enum':
      case 'string':
      default:
        return value
    }
  }

  // ===========================================================================
  // UTILITIES
  // ===========================================================================

  /**
   * Simple YAML-like parser for basic templates
   * Note: In production, use a proper YAML library
   */
  private parseSimpleYaml(content: string): unknown {
    // This is a very basic parser - use js-yaml in production
    const lines = content.split('\n')
    const result: Record<string, unknown> = {}

    for (const line of lines) {
      if (line.trim().startsWith('#') || line.trim() === '') continue

      const match = line.match(/^(\s*)(\w+):\s*(.*)$/)
      if (match) {
        const [, _spaces, key, value] = match

        if (value) {
          result[key] = value.trim()
        } else {
          result[key] = {}
        }
      }
    }

    return result
  }

  /**
   * Generate LLM prompt for template completion
   */
  generatePrompt(templateId: string, context?: string): string {
    const template = this.getTemplate(templateId)
    if (!template) {
      throw new Error(`Template not found: ${templateId}`)
    }

    const lines: string[] = []

    lines.push(`Please complete the following template. Use XML tags as shown.`)
    lines.push('')

    if (context) {
      lines.push(`Context: ${context}`)
      lines.push('')
    }

    lines.push(`Template: ${template.name} (${template.id} v${template.version})`)
    lines.push('')

    lines.push('Required sections:')
    for (const section of template.sections) {
      const tag = section.customTag || section.tag
      const required = section.required ? '(required)' : '(optional)'
      lines.push(`- <${tag}> ${required}`)

      if (section.subsections) {
        for (const sub of section.subsections) {
          const subTag = sub.customTag || sub.tag
          lines.push(`  - <${subTag}>`)
        }
      }
    }
    lines.push('')

    if (template.variables.length > 0) {
      lines.push('Variables to include:')
      for (const v of template.variables) {
        const req = v.required ? '(required)' : '(optional)'
        lines.push(`- ${v.name}: ${v.type} ${req} ${v.description || ''}`)
      }
      lines.push('')
    }

    if (template.constraints) {
      lines.push('Constraints:')
      if (template.constraints.maxPages) {
        lines.push(`- Maximum pages: ${template.constraints.maxPages}`)
      }
      if (template.constraints.maxItems) {
        lines.push(`- Maximum items: ${template.constraints.maxItems}`)
      }
    }

    return lines.join('\n')
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let engineInstance: TemplateEngine | null = null

/**
 * Get singleton TemplateEngine instance
 */
export function getTemplateEngine(templateDir?: string): TemplateEngine {
  if (!engineInstance) {
    engineInstance = new TemplateEngine(templateDir)
  }
  return engineInstance
}

/**
 * Reset singleton (for testing)
 */
export function resetTemplateEngine(): void {
  engineInstance = null
}
