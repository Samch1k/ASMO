/**
 * AI-First Template Schema
 *
 * BMAD Gaps Closing: Phase 3 - AI-First Templates
 *
 * Defines structured XML templates for better LLM parsing and validation.
 * Templates use a consistent schema that Claude can reliably parse and populate.
 *
 * Benefits:
 * - Consistent structure for LLM output
 * - Built-in validation via Zod schemas
 * - Clear section boundaries with XML tags
 * - Version tracking for template evolution
 */

import { z } from 'zod'

// =============================================================================
// CORE ENUMS & TYPES
// =============================================================================

/**
 * Template section types
 */
export type TemplateSectionTag =
  | 'context'          // Background and problem statement
  | 'requirements'     // Functional and non-functional requirements
  | 'constraints'      // Limitations and boundaries
  | 'decision'         // The actual decision or recommendation
  | 'output'           // Expected deliverables
  | 'metadata'         // Template metadata (auto-populated)
  | 'validation'       // Validation criteria
  | 'dependencies'     // Related dependencies
  | 'timeline'         // Schedule and milestones
  | 'risks'            // Risk assessment
  | 'alternatives'     // Alternative approaches considered
  | 'custom'           // User-defined sections

/**
 * Content format within sections
 */
export type ContentFormat = 'xml' | 'markdown' | 'json' | 'text'

/**
 * Variable types for template interpolation
 */
export type VariableType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'array'
  | 'object'
  | 'enum'

// =============================================================================
// ZOD SCHEMAS
// =============================================================================

/**
 * Template variable definition schema
 */
export const TemplateVariableSchema = z.object({
  /** Variable name (used in {{name}} placeholders) */
  name: z.string().min(1),
  /** Human-readable description */
  description: z.string().optional(),
  /** Variable type */
  type: z.enum(['string', 'number', 'boolean', 'date', 'array', 'object', 'enum']),
  /** Whether this variable is required */
  required: z.boolean().default(true),
  /** Default value if not provided */
  defaultValue: z.any().optional(),
  /** Enum values (if type is 'enum') */
  enumValues: z.array(z.string()).optional(),
  /** Validation pattern (regex for strings) */
  pattern: z.string().optional(),
  /** Minimum value (for numbers) or length (for strings/arrays) */
  min: z.number().optional(),
  /** Maximum value (for numbers) or length (for strings/arrays) */
  max: z.number().optional(),
  /** Example value for documentation */
  example: z.any().optional()
})

/**
 * Template section definition schema
 */
export const TemplateSectionSchema = z.object({
  /** Section tag/type */
  tag: z.enum([
    'context', 'requirements', 'constraints', 'decision', 'output',
    'metadata', 'validation', 'dependencies', 'timeline', 'risks',
    'alternatives', 'custom'
  ]),
  /** Custom tag name (if tag is 'custom') */
  customTag: z.string().optional(),
  /** Human-readable section title */
  title: z.string().optional(),
  /** Whether this section is required */
  required: z.boolean().default(true),
  /** Content format within this section */
  format: z.enum(['xml', 'markdown', 'json', 'text']).default('markdown'),
  /** Section content template */
  content: z.string().optional(),
  /** Nested subsections */
  subsections: z.array(z.lazy(() => TemplateSectionSchema)).optional(),
  /** Variables specific to this section */
  variables: z.array(TemplateVariableSchema).optional(),
  /** Validation constraints */
  constraints: z.object({
    maxLength: z.number().optional(),
    minLength: z.number().optional(),
    maxItems: z.number().optional(),
    minItems: z.number().optional()
  }).optional(),
  /** Order within parent (for sorting) */
  order: z.number().optional()
})

/**
 * Main AI-First Template schema
 */
export const AIFirstTemplateSchema = z.object({
  /** Unique template identifier */
  id: z.string().min(1),
  /** Template name */
  name: z.string().min(1),
  /** Template description */
  description: z.string().optional(),
  /** Semantic version (e.g., "1.0.0") */
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  /** Template sections */
  sections: z.array(TemplateSectionSchema).min(1),
  /** Global variables */
  variables: z.array(TemplateVariableSchema).default([]),
  /** Template metadata */
  metadata: z.object({
    /** Author or team */
    author: z.string().optional(),
    /** Creation date */
    createdAt: z.string().datetime().optional(),
    /** Last update date */
    updatedAt: z.string().datetime().optional(),
    /** Template tags for categorization */
    tags: z.array(z.string()).optional(),
    /** Related templates */
    relatedTemplates: z.array(z.string()).optional(),
    /** LLM-specific hints */
    llmHints: z.object({
      /** Preferred output format */
      preferredFormat: z.enum(['xml', 'markdown', 'json']).optional(),
      /** Temperature recommendation */
      temperature: z.number().min(0).max(2).optional(),
      /** Max tokens recommendation */
      maxTokens: z.number().optional(),
      /** Parsing instructions */
      parsingInstructions: z.string().optional()
    }).optional()
  }).optional(),
  /** Global constraints */
  constraints: z.object({
    /** Maximum total pages (for documents) */
    maxPages: z.number().optional(),
    /** Maximum total items (for lists) */
    maxItems: z.number().optional(),
    /** Maximum nesting depth */
    maxDepth: z.number().optional()
  }).optional()
})

// =============================================================================
// TYPE EXPORTS (inferred from schemas)
// =============================================================================

export type TemplateVariable = z.infer<typeof TemplateVariableSchema>
export type TemplateSection = z.infer<typeof TemplateSectionSchema>
export type AIFirstTemplate = z.infer<typeof AIFirstTemplateSchema>

// =============================================================================
// VALIDATION RESULT TYPES
// =============================================================================

/**
 * Result of template validation
 */
export interface TemplateValidationResult {
  /** Whether validation passed */
  valid: boolean
  /** Validation errors */
  errors: TemplateValidationError[]
  /** Validation warnings (non-blocking) */
  warnings: TemplateValidationWarning[]
  /** Sections that were validated */
  validatedSections: string[]
  /** Variables that were resolved */
  resolvedVariables: string[]
}

/**
 * Template validation error
 */
export interface TemplateValidationError {
  /** Error code */
  code: string
  /** Error message */
  message: string
  /** Location in template (path or line) */
  path?: string
  /** Section where error occurred */
  section?: string
  /** Variable that caused error */
  variable?: string
  /** Severity */
  severity: 'error'
}

/**
 * Template validation warning
 */
export interface TemplateValidationWarning {
  /** Warning code */
  code: string
  /** Warning message */
  message: string
  /** Location in template */
  path?: string
  /** Section where warning occurred */
  section?: string
  /** Severity */
  severity: 'warning'
}

// =============================================================================
// PARSED OUTPUT TYPES
// =============================================================================

/**
 * Parsed output from LLM based on template
 */
export interface ParsedTemplateOutput {
  /** Template ID that was used */
  templateId: string
  /** Template version */
  templateVersion: string
  /** Parsed sections */
  sections: ParsedSection[]
  /** Resolved variables */
  variables: Record<string, any>
  /** Raw output (before parsing) */
  rawOutput: string
  /** Parse timestamp */
  parsedAt: Date
  /** Parsing confidence (0-1) */
  confidence: number
}

/**
 * Parsed section from output
 */
export interface ParsedSection {
  /** Section tag */
  tag: TemplateSectionTag
  /** Custom tag (if applicable) */
  customTag?: string
  /** Parsed content */
  content: any
  /** Whether section was found in output */
  found: boolean
  /** Confidence in parsing (0-1) */
  confidence: number
  /** Nested parsed sections */
  subsections?: ParsedSection[]
}

// =============================================================================
// TEMPLATE BUILDER TYPES
// =============================================================================

/**
 * Builder for creating templates programmatically
 */
export interface TemplateBuilder {
  /** Set template ID */
  setId(id: string): TemplateBuilder
  /** Set template name */
  setName(name: string): TemplateBuilder
  /** Set template version */
  setVersion(version: string): TemplateBuilder
  /** Set template description */
  setDescription(description: string): TemplateBuilder
  /** Add a section */
  addSection(section: Omit<TemplateSection, 'order'>): TemplateBuilder
  /** Add a global variable */
  addVariable(variable: TemplateVariable): TemplateBuilder
  /** Set metadata */
  setMetadata(metadata: AIFirstTemplate['metadata']): TemplateBuilder
  /** Set constraints */
  setConstraints(constraints: AIFirstTemplate['constraints']): TemplateBuilder
  /** Build the template */
  build(): AIFirstTemplate
}

// =============================================================================
// PRESET SECTION TEMPLATES
// =============================================================================

/**
 * Pre-defined section configurations for common use cases
 */
export const PRESET_SECTIONS = {
  /** Context section for PRDs */
  prdContext: {
    tag: 'context' as const,
    title: 'Context and Problem Statement',
    required: true,
    format: 'markdown' as const,
    subsections: [
      { tag: 'custom' as const, customTag: 'problem', title: 'Problem Statement', required: true, format: 'markdown' as const },
      { tag: 'custom' as const, customTag: 'audience', title: 'Target Audience', required: true, format: 'markdown' as const },
      { tag: 'custom' as const, customTag: 'goals', title: 'Goals', required: true, format: 'markdown' as const }
    ]
  },

  /** Requirements section for PRDs */
  prdRequirements: {
    tag: 'requirements' as const,
    title: 'Requirements',
    required: true,
    format: 'markdown' as const,
    subsections: [
      { tag: 'custom' as const, customTag: 'functional', title: 'Functional Requirements', required: true, format: 'markdown' as const },
      { tag: 'custom' as const, customTag: 'non_functional', title: 'Non-Functional Requirements', required: false, format: 'markdown' as const }
    ]
  },

  /** Decision section for ADRs */
  adrDecision: {
    tag: 'decision' as const,
    title: 'Decision',
    required: true,
    format: 'markdown' as const,
    subsections: [
      { tag: 'custom' as const, customTag: 'chosen_option', title: 'Chosen Option', required: true, format: 'markdown' as const },
      { tag: 'custom' as const, customTag: 'rationale', title: 'Rationale', required: true, format: 'markdown' as const }
    ]
  },

  /** Alternatives section for ADRs */
  adrAlternatives: {
    tag: 'alternatives' as const,
    title: 'Considered Alternatives',
    required: true,
    format: 'markdown' as const,
    constraints: {
      minItems: 2,
      maxItems: 5
    }
  },

  /** Timeline section for epics */
  epicTimeline: {
    tag: 'timeline' as const,
    title: 'Timeline and Milestones',
    required: false,
    format: 'markdown' as const
  },

  /** Risks section */
  riskAssessment: {
    tag: 'risks' as const,
    title: 'Risk Assessment',
    required: false,
    format: 'markdown' as const,
    subsections: [
      { tag: 'custom' as const, customTag: 'high_risks', title: 'High Risks', required: false, format: 'markdown' as const },
      { tag: 'custom' as const, customTag: 'mitigations', title: 'Mitigations', required: false, format: 'markdown' as const }
    ]
  }
} as const

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validate a template against the schema
 */
export function validateTemplate(template: unknown): TemplateValidationResult {
  const result = AIFirstTemplateSchema.safeParse(template)

  if (result.success) {
    return {
      valid: true,
      errors: [],
      warnings: [],
      validatedSections: result.data.sections.map(s => s.tag),
      resolvedVariables: result.data.variables.map(v => v.name)
    }
  }

  const errors: TemplateValidationError[] = result.error.issues.map(issue => ({
    code: issue.code,
    message: issue.message,
    path: issue.path.join('.'),
    severity: 'error' as const
  }))

  return {
    valid: false,
    errors,
    warnings: [],
    validatedSections: [],
    resolvedVariables: []
  }
}

/**
 * Validate variable value against its definition
 */
export function validateVariable(
  value: unknown,
  definition: TemplateVariable
): { valid: boolean; error?: string } {
  // Required check
  if (definition.required && (value === undefined || value === null)) {
    return { valid: false, error: `Variable "${definition.name}" is required` }
  }

  // Skip further validation if not required and not provided
  if (value === undefined || value === null) {
    return { valid: true }
  }

  // Type check
  switch (definition.type) {
    case 'string':
      if (typeof value !== 'string') {
        return { valid: false, error: `Variable "${definition.name}" must be a string` }
      }
      // Pattern check
      if (definition.pattern && !new RegExp(definition.pattern).test(value)) {
        return { valid: false, error: `Variable "${definition.name}" doesn't match pattern` }
      }
      // Length check
      if (definition.min !== undefined && value.length < definition.min) {
        return { valid: false, error: `Variable "${definition.name}" is too short` }
      }
      if (definition.max !== undefined && value.length > definition.max) {
        return { valid: false, error: `Variable "${definition.name}" is too long` }
      }
      break

    case 'number':
      if (typeof value !== 'number') {
        return { valid: false, error: `Variable "${definition.name}" must be a number` }
      }
      if (definition.min !== undefined && value < definition.min) {
        return { valid: false, error: `Variable "${definition.name}" is below minimum` }
      }
      if (definition.max !== undefined && value > definition.max) {
        return { valid: false, error: `Variable "${definition.name}" exceeds maximum` }
      }
      break

    case 'boolean':
      if (typeof value !== 'boolean') {
        return { valid: false, error: `Variable "${definition.name}" must be a boolean` }
      }
      break

    case 'date':
      if (!(value instanceof Date) && isNaN(Date.parse(value as string))) {
        return { valid: false, error: `Variable "${definition.name}" must be a valid date` }
      }
      break

    case 'array':
      if (!Array.isArray(value)) {
        return { valid: false, error: `Variable "${definition.name}" must be an array` }
      }
      if (definition.min !== undefined && value.length < definition.min) {
        return { valid: false, error: `Variable "${definition.name}" has too few items` }
      }
      if (definition.max !== undefined && value.length > definition.max) {
        return { valid: false, error: `Variable "${definition.name}" has too many items` }
      }
      break

    case 'object':
      if (typeof value !== 'object' || Array.isArray(value)) {
        return { valid: false, error: `Variable "${definition.name}" must be an object` }
      }
      break

    case 'enum':
      if (!definition.enumValues?.includes(value as string)) {
        return { valid: false, error: `Variable "${definition.name}" must be one of: ${definition.enumValues?.join(', ')}` }
      }
      break
  }

  return { valid: true }
}

/**
 * Create a template builder
 */
export function createTemplateBuilder(): TemplateBuilder {
  const template: Partial<AIFirstTemplate> = {
    version: '1.0.0',
    sections: [],
    variables: []
  }

  let sectionOrder = 0

  return {
    setId(id: string) {
      template.id = id
      return this
    },

    setName(name: string) {
      template.name = name
      return this
    },

    setVersion(version: string) {
      template.version = version
      return this
    },

    setDescription(description: string) {
      template.description = description
      return this
    },

    addSection(section: Omit<TemplateSection, 'order'>) {
      template.sections!.push({ ...section, order: sectionOrder++ })
      return this
    },

    addVariable(variable: TemplateVariable) {
      template.variables!.push(variable)
      return this
    },

    setMetadata(metadata: AIFirstTemplate['metadata']) {
      template.metadata = metadata
      return this
    },

    setConstraints(constraints: AIFirstTemplate['constraints']) {
      template.constraints = constraints
      return this
    },

    build(): AIFirstTemplate {
      const result = AIFirstTemplateSchema.parse(template)
      return result
    }
  }
}
