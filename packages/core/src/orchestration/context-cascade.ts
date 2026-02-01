/**
 * Context Cascade - BMAD Integration
 *
 * Manages cascading context between workflow phases, ensuring each phase
 * has access to outputs from its dependent phases.
 *
 * Context Flow:
 * Product Brief → PRD → Architecture → Epics → Stories → Implementation
 *
 * Key Features:
 * - Define context dependencies between workflows
 * - Auto-load required context before workflow execution
 * - Support custom dependency chains
 * - Integrate with DocumentRegistry for persistence
 *
 * @example
 * ```typescript
 * const cascade = new ContextCascade({ documentRegistry })
 * const context = await cascade.loadContextForWorkflow('create-architecture')
 * // Returns: { prd: Document, uxDesign: Document }
 * ```
 */

import { DocumentRegistry, Document, DocumentType } from './document-registry'

/**
 * Cascaded context containing loaded documents
 */
export interface CascadedContext {
  /** Loaded documents keyed by their type */
  [key: string]: Document | null
}

/**
 * Context dependency definition
 */
export interface ContextDependency {
  /** Document type required */
  documentType: DocumentType
  /** Whether this dependency is required (vs optional) */
  required: boolean
  /** Description of why this context is needed */
  description?: string
}

/**
 * Workflow context requirements
 */
export interface WorkflowContextRequirements {
  /** Workflow identifier */
  workflowId: string
  /** Required and optional context dependencies */
  dependencies: ContextDependency[]
}

/**
 * Configuration for ContextCascade
 */
export interface ContextCascadeConfig {
  /** Document registry instance for loading documents */
  documentRegistry?: DocumentRegistry
  /** Output directory (used if documentRegistry not provided) */
  outputDir?: string
  /** Whether to auto-load context (default: true) */
  autoLoad?: boolean
  /** Custom dependency definitions */
  customDependencies?: Record<string, DocumentType[]>
}

/**
 * Result of context loading
 */
export interface ContextLoadResult {
  /** Loaded context */
  context: CascadedContext
  /** Documents that were successfully loaded */
  loaded: DocumentType[]
  /** Documents that were missing */
  missing: DocumentType[]
  /** Whether all required dependencies were satisfied */
  satisfied: boolean
}

/**
 * Default context dependencies for common workflows
 */
const DEFAULT_CONTEXT_DEPENDENCIES: Record<string, DocumentType[]> = {
  // Planning phase workflows
  'create-prd': ['product-brief'],
  'create-architecture': ['prd', 'ux-design'],
  'create-ux-design': ['prd'],
  'create-epics': ['prd', 'architecture'],
  'create-epics-and-stories': ['prd', 'architecture'],
  'create-story': ['epics', 'prd', 'architecture'],

  // Implementation phase workflows
  'dev-story': ['story', 'architecture', 'project-context'],
  'code-review': ['story', 'architecture'],
  'adversarial-review': ['story', 'architecture'],

  // Quality workflows
  'comprehensive-testing': ['story', 'architecture', 'test-strategy'],
  'performance-investigation': ['architecture', 'project-context'],
  'security-audit': ['architecture', 'project-context'],

  // TEA workflows
  'tea-risk-assessment': ['prd', 'architecture'],
  'tea-test-strategy': ['prd', 'architecture', 'epics'],
  'tea-test-design': ['test-strategy', 'story'],
  'tea-test-automation': ['test-strategy', 'story'],
  'tea-quality-gates': ['test-strategy', 'architecture'],
  'tea-release-readiness': ['test-strategy', 'architecture', 'epics'],
  'tea-regression-analysis': ['test-strategy', 'architecture'],
  'tea-test-maintenance': ['test-strategy']
}

/**
 * Context Cascade
 *
 * Manages context dependencies between workflow phases.
 */
export class ContextCascade {
  private documentRegistry: DocumentRegistry
  private autoLoad: boolean
  private customDependencies: Record<string, DocumentType[]>
  private contextDependencies: Record<string, DocumentType[]>

  constructor(config: ContextCascadeConfig = {}) {
    this.documentRegistry =
      config.documentRegistry ||
      new DocumentRegistry({ outputDir: config.outputDir || '_ai1st-output' })
    this.autoLoad = config.autoLoad !== false
    this.customDependencies = config.customDependencies || {}

    // Merge default and custom dependencies
    this.contextDependencies = {
      ...DEFAULT_CONTEXT_DEPENDENCIES,
      ...this.customDependencies
    }
  }

  /**
   * Load context for a specific workflow
   *
   * @param workflowId - Workflow identifier
   * @returns Loaded context result
   */
  async loadContextForWorkflow(workflowId: string): Promise<ContextLoadResult> {
    const dependencies = this.getDependencies(workflowId)
    return this.loadContext(dependencies)
  }

  /**
   * Load specific documents as context
   *
   * @param documentTypes - Document types to load
   * @returns Loaded context result
   */
  async loadContext(documentTypes: DocumentType[]): Promise<ContextLoadResult> {
    const context: CascadedContext = {}
    const loaded: DocumentType[] = []
    const missing: DocumentType[] = []

    // Load all documents in parallel
    const documents = await this.documentRegistry.getDocuments(documentTypes)

    for (const [type, doc] of documents) {
      if (doc) {
        context[this.normalizeKey(type)] = doc
        loaded.push(type)
      } else {
        context[this.normalizeKey(type)] = null
        missing.push(type)
      }
    }

    return {
      context,
      loaded,
      missing,
      satisfied: missing.length === 0
    }
  }

  /**
   * Get dependencies for a workflow
   *
   * @param workflowId - Workflow identifier
   * @returns Array of required document types
   */
  getDependencies(workflowId: string): DocumentType[] {
    return this.contextDependencies[workflowId] || []
  }

  /**
   * Check if a workflow has all required context
   *
   * @param workflowId - Workflow identifier
   * @returns true if all dependencies are satisfied
   */
  async hasRequiredContext(workflowId: string): Promise<boolean> {
    const dependencies = this.getDependencies(workflowId)

    for (const dep of dependencies) {
      const hasDoc = await this.documentRegistry.hasDocument(dep)
      if (!hasDoc) {
        return false
      }
    }

    return true
  }

  /**
   * Get missing dependencies for a workflow
   *
   * @param workflowId - Workflow identifier
   * @returns Array of missing document types
   */
  async getMissingDependencies(workflowId: string): Promise<DocumentType[]> {
    const dependencies = this.getDependencies(workflowId)
    const missing: DocumentType[] = []

    for (const dep of dependencies) {
      const hasDoc = await this.documentRegistry.hasDocument(dep)
      if (!hasDoc) {
        missing.push(dep)
      }
    }

    return missing
  }

  /**
   * Add or update custom dependencies for a workflow
   *
   * @param workflowId - Workflow identifier
   * @param dependencies - Document types this workflow depends on
   */
  setDependencies(workflowId: string, dependencies: DocumentType[]): void {
    this.contextDependencies[workflowId] = dependencies
  }

  /**
   * Get the context dependency graph
   *
   * @returns All workflow dependencies
   */
  getDependencyGraph(): Record<string, DocumentType[]> {
    return { ...this.contextDependencies }
  }

  /**
   * Build the full context chain for a workflow
   *
   * This recursively resolves all dependencies, including
   * dependencies of dependencies.
   *
   * @param workflowId - Starting workflow
   * @returns Full list of document types needed
   */
  buildContextChain(workflowId: string): DocumentType[] {
    const visited = new Set<string>()
    const chain: DocumentType[] = []

    const collect = (id: string) => {
      if (visited.has(id)) return
      visited.add(id)

      const deps = this.getDependencies(id)
      for (const dep of deps) {
        if (!chain.includes(dep)) {
          chain.push(dep)
        }
        // Check if this document type has a corresponding workflow
        const workflowForDoc = `create-${dep}`
        if (this.contextDependencies[workflowForDoc]) {
          collect(workflowForDoc)
        }
      }
    }

    collect(workflowId)
    return chain
  }

  /**
   * Get the document registry instance
   */
  getDocumentRegistry(): DocumentRegistry {
    return this.documentRegistry
  }

  /**
   * Check if auto-load is enabled
   */
  isAutoLoadEnabled(): boolean {
    return this.autoLoad
  }

  /**
   * Format context for agent consumption
   *
   * Creates a formatted string representation of the context
   * suitable for including in agent prompts.
   *
   * @param context - Cascaded context
   * @returns Formatted context string
   */
  formatContextForAgent(context: CascadedContext): string {
    const sections: string[] = []

    for (const [key, doc] of Object.entries(context)) {
      if (doc) {
        sections.push(`## ${this.formatTitle(key)}\n\n${doc.content}`)
      }
    }

    return sections.join('\n\n---\n\n')
  }

  /**
   * Create a context summary for logging/debugging
   *
   * @param result - Context load result
   * @returns Summary string
   */
  summarizeContext(result: ContextLoadResult): string {
    const lines = [
      `Context Load Summary:`,
      `  Loaded: ${result.loaded.length} documents`,
      `  Missing: ${result.missing.length} documents`,
      `  Satisfied: ${result.satisfied ? 'Yes' : 'No'}`
    ]

    if (result.loaded.length > 0) {
      lines.push(`  Loaded types: ${result.loaded.join(', ')}`)
    }

    if (result.missing.length > 0) {
      lines.push(`  Missing types: ${result.missing.join(', ')}`)
    }

    return lines.join('\n')
  }

  // Private helpers

  private normalizeKey(type: DocumentType): string {
    // Convert kebab-case to camelCase
    return type.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
  }

  private formatTitle(key: string): string {
    // Convert camelCase to Title Case
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim()
  }
}
