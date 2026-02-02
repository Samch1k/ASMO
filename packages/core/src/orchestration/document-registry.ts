/**
 * Document Registry - BMAD Integration
 *
 * Manages document storage and retrieval for the Context Cascade system.
 * Documents are persisted to disk and indexed for quick access across workflow phases.
 *
 * Key Features:
 * - Register documents by type (product-brief, prd, architecture, etc.)
 * - Persist documents to configurable output directory
 * - Maintain document index for quick lookup
 * - Support document versioning and history
 *
 * @example
 * ```typescript
 * const registry = new DocumentRegistry({ outputDir: '_asmo-output' })
 * await registry.registerDocument('prd', content, { version: '1.0' })
 * const doc = await registry.getDocument('prd')
 * ```
 */

import * as fs from 'fs/promises'
import * as path from 'path'

/**
 * Document types supported by the registry
 */
export type DocumentType =
  | 'product-brief'
  | 'prd'
  | 'architecture'
  | 'ux-design'
  | 'epics'
  | 'story'
  | 'project-context'
  | 'test-strategy'
  | 'release-notes'
  | 'api-spec'
  | 'data-model'
  | string // Allow custom document types

/**
 * Document stored in the registry
 */
export interface Document {
  /** Document type identifier */
  type: DocumentType
  /** Document content (typically markdown) */
  content: string
  /** Document metadata */
  metadata: DocumentMetadata
  /** File path where document is stored */
  filePath: string
}

/**
 * Document metadata
 */
export interface DocumentMetadata {
  /** Document version (e.g., '1.0', '2.1') */
  version: string
  /** ISO timestamp when document was created */
  createdAt: string
  /** ISO timestamp when document was last updated */
  updatedAt: string
  /** Agent or user that created the document */
  createdBy: string
  /** Optional title for the document */
  title?: string
  /** Optional tags for categorization */
  tags?: string[]
  /** Optional parent document type (for dependency tracking) */
  parentDocument?: DocumentType
  /** Additional custom metadata */
  [key: string]: any
}

/**
 * Document summary for listing
 */
export interface DocumentSummary {
  type: DocumentType
  title: string
  version: string
  createdAt: string
  updatedAt: string
  filePath: string
}

/**
 * Document index structure persisted to disk
 */
interface DocumentIndex {
  version: string
  lastUpdated: string
  documents: Record<DocumentType, DocumentIndexEntry>
}

/**
 * Individual document entry in the index
 */
interface DocumentIndexEntry {
  type: DocumentType
  title: string
  version: string
  createdAt: string
  updatedAt: string
  filePath: string
  checksum?: string
}

/**
 * Configuration for DocumentRegistry
 */
export interface DocumentRegistryConfig {
  /** Output directory for documents (default: '_asmo-output') */
  outputDir: string
  /** Whether to auto-create output directory (default: true) */
  autoCreateDir?: boolean
  /** Index file name (default: 'document-index.json') */
  indexFileName?: string
}

/**
 * Document Registry
 *
 * Manages document storage, retrieval, and indexing for BMAD workflows.
 */
export class DocumentRegistry {
  private outputDir: string
  private indexFileName: string
  private autoCreateDir: boolean
  private index: DocumentIndex | null = null

  constructor(config: Partial<DocumentRegistryConfig> = {}) {
    this.outputDir = config.outputDir || '_asmo-output'
    this.indexFileName = config.indexFileName || 'document-index.json'
    this.autoCreateDir = config.autoCreateDir !== false
  }

  /**
   * Initialize the registry and load index from disk
   */
  async initialize(): Promise<void> {
    if (this.autoCreateDir) {
      await fs.mkdir(this.outputDir, { recursive: true })
    }
    await this.loadIndex()
  }

  /**
   * Register a document in the registry
   *
   * @param type - Document type identifier
   * @param content - Document content (markdown)
   * @param metadata - Optional metadata
   * @returns Registered document
   */
  async registerDocument(
    type: DocumentType,
    content: string,
    metadata: Partial<DocumentMetadata> = {}
  ): Promise<Document> {
    await this.ensureInitialized()

    const now = new Date().toISOString()
    const existingDoc = this.index?.documents[type]
    const version = metadata.version || this.incrementVersion(existingDoc?.version)

    const fullMetadata: DocumentMetadata = {
      version,
      createdAt: existingDoc?.createdAt || now,
      updatedAt: now,
      createdBy: metadata.createdBy || 'unknown',
      title: metadata.title || this.generateTitle(type),
      ...metadata
    }

    // Generate file path
    const fileName = `${type}.md`
    const filePath = path.join(this.outputDir, fileName)

    // Write document to disk
    const documentContent = this.formatDocumentContent(content, fullMetadata)
    await fs.writeFile(filePath, documentContent, 'utf-8')

    // Update index
    const indexEntry: DocumentIndexEntry = {
      type,
      title: fullMetadata.title || type,
      version,
      createdAt: fullMetadata.createdAt,
      updatedAt: fullMetadata.updatedAt,
      filePath
    }

    if (!this.index) {
      this.index = this.createEmptyIndex()
    }
    this.index.documents[type] = indexEntry
    this.index.lastUpdated = now
    await this.saveIndex()

    return {
      type,
      content,
      metadata: fullMetadata,
      filePath
    }
  }

  /**
   * Get a document by type
   *
   * @param type - Document type to retrieve
   * @returns Document or null if not found
   */
  async getDocument(type: DocumentType): Promise<Document | null> {
    await this.ensureInitialized()

    const entry = this.index?.documents[type]
    if (!entry) {
      return null
    }

    try {
      const rawContent = await fs.readFile(entry.filePath, 'utf-8')
      const { content, metadata } = this.parseDocumentContent(rawContent)

      return {
        type,
        content,
        metadata: {
          version: entry.version,
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt,
          createdBy: metadata.createdBy || 'unknown',
          title: entry.title,
          ...metadata
        },
        filePath: entry.filePath
      }
    } catch (error) {
      console.error(`Failed to read document ${type}:`, error)
      return null
    }
  }

  /**
   * List all documents in the registry
   *
   * @returns Array of document summaries
   */
  async listDocuments(): Promise<DocumentSummary[]> {
    await this.ensureInitialized()

    if (!this.index) {
      return []
    }

    return Object.values(this.index.documents).map(entry => ({
      type: entry.type,
      title: entry.title,
      version: entry.version,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      filePath: entry.filePath
    }))
  }

  /**
   * Check if a document exists
   *
   * @param type - Document type to check
   * @returns true if document exists
   */
  async hasDocument(type: DocumentType): Promise<boolean> {
    await this.ensureInitialized()
    return !!this.index?.documents[type]
  }

  /**
   * Delete a document from the registry
   *
   * @param type - Document type to delete
   * @returns true if document was deleted
   */
  async deleteDocument(type: DocumentType): Promise<boolean> {
    await this.ensureInitialized()

    const entry = this.index?.documents[type]
    if (!entry) {
      return false
    }

    try {
      await fs.unlink(entry.filePath)
    } catch {
      // File may not exist, continue
    }

    delete this.index!.documents[type]
    this.index!.lastUpdated = new Date().toISOString()
    await this.saveIndex()

    return true
  }

  /**
   * Get multiple documents by types
   *
   * @param types - Array of document types
   * @returns Map of type to document (null if not found)
   */
  async getDocuments(types: DocumentType[]): Promise<Map<DocumentType, Document | null>> {
    const results = new Map<DocumentType, Document | null>()

    await Promise.all(
      types.map(async type => {
        const doc = await this.getDocument(type)
        results.set(type, doc)
      })
    )

    return results
  }

  /**
   * Get the output directory path
   */
  getOutputDir(): string {
    return this.outputDir
  }

  /**
   * Get the index file path
   */
  getIndexPath(): string {
    return path.join(this.outputDir, this.indexFileName)
  }

  // Private methods

  private async ensureInitialized(): Promise<void> {
    if (!this.index) {
      await this.initialize()
    }
  }

  private async loadIndex(): Promise<void> {
    const indexPath = this.getIndexPath()

    try {
      const content = await fs.readFile(indexPath, 'utf-8')
      this.index = JSON.parse(content)
    } catch {
      // Index doesn't exist, create empty one
      this.index = this.createEmptyIndex()
    }
  }

  private async saveIndex(): Promise<void> {
    if (!this.index) return

    const indexPath = this.getIndexPath()
    await fs.writeFile(indexPath, JSON.stringify(this.index, null, 2), 'utf-8')
  }

  private createEmptyIndex(): DocumentIndex {
    return {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      documents: {}
    }
  }

  private incrementVersion(currentVersion?: string): string {
    if (!currentVersion) return '1.0'

    const parts = currentVersion.split('.')
    const minor = parseInt(parts[1] || '0', 10) + 1
    return `${parts[0]}.${minor}`
  }

  private generateTitle(type: DocumentType): string {
    return type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  private formatDocumentContent(content: string, metadata: DocumentMetadata): string {
    // Add YAML frontmatter with metadata
    const frontmatter = [
      '---',
      `title: "${metadata.title}"`,
      `version: "${metadata.version}"`,
      `createdAt: "${metadata.createdAt}"`,
      `updatedAt: "${metadata.updatedAt}"`,
      `createdBy: "${metadata.createdBy}"`,
      metadata.tags ? `tags: [${metadata.tags.map(t => `"${t}"`).join(', ')}]` : null,
      metadata.parentDocument ? `parentDocument: "${metadata.parentDocument}"` : null,
      '---',
      ''
    ]
      .filter(Boolean)
      .join('\n')

    return frontmatter + content
  }

  private parseDocumentContent(rawContent: string): {
    content: string
    metadata: Partial<DocumentMetadata>
  } {
    const frontmatterMatch = rawContent.match(/^---\n([\s\S]*?)\n---\n/)

    if (!frontmatterMatch) {
      return { content: rawContent, metadata: {} }
    }

    const frontmatter = frontmatterMatch[1]
    const content = rawContent.slice(frontmatterMatch[0].length)

    // Parse YAML frontmatter (simple parsing)
    const metadata: Partial<DocumentMetadata> = {}
    const lines = frontmatter.split('\n')

    for (const line of lines) {
      const match = line.match(/^(\w+):\s*(.+)$/)
      if (match) {
        const [, key, value] = match
        // Remove quotes if present
        const cleanValue = value.replace(/^["']|["']$/g, '')
        ;(metadata as any)[key] = cleanValue
      }
    }

    return { content, metadata }
  }
}
