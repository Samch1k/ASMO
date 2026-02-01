/**
 * Document Sharding Utility - BMAD Integration
 *
 * Automatically splits large markdown documents into smaller,
 * manageable sections while maintaining navigation structure.
 *
 * Key Features:
 * - Split by heading level (##, ###, etc.)
 * - Token-aware splitting with configurable limits
 * - Automatic index generation with links
 * - Preserves document structure and references
 *
 * @example
 * ```typescript
 * const sharder = new DocumentSharder({ maxTokensPerFile: 10000 })
 * const result = await sharder.shardDocument('docs/PRD.md')
 * // Creates: docs/prd/index.md, docs/prd/01-introduction.md, etc.
 * ```
 */

import * as fs from 'fs/promises'
import * as path from 'path'

/**
 * Section extracted from document
 */
export interface DocumentSection {
  /** Section heading */
  heading: string
  /** Section slug (for filename) */
  slug: string
  /** Heading level (1-6) */
  level: number
  /** Section content (including heading) */
  content: string
  /** Estimated token count */
  tokenCount: number
  /** Line number where section starts */
  startLine: number
  /** Child sections */
  children: DocumentSection[]
}

/**
 * Result of sharding operation
 */
export interface ShardingResult {
  /** Path to generated index file */
  indexPath: string
  /** Output directory */
  outputDir: string
  /** Number of sections created */
  sectionCount: number
  /** Paths to all generated files */
  sectionPaths: string[]
  /** Total token count of original document */
  originalTokens: number
  /** Average tokens per section */
  averageTokensPerSection: number
}

/**
 * Configuration for DocumentSharder
 */
export interface DocumentSharderConfig {
  /** Maximum tokens per file (default: 10000) */
  maxTokensPerFile?: number
  /** Heading level to split at (default: 2 = ##) */
  splitLevel?: number
  /** Minimum tokens for a section to be its own file (default: 500) */
  minTokensPerSection?: number
  /** Include frontmatter in each section (default: true) */
  includeFrontmatter?: boolean
  /** Custom token estimator (default: word count * 1.3) */
  tokenEstimator?: (text: string) => number
  /** Output directory suffix (default: none, replaces .md with /) */
  outputDirSuffix?: string
}

/**
 * Default token estimation (words * 1.3)
 */
function defaultTokenEstimator(text: string): number {
  const words = text.split(/\s+/).filter(w => w.length > 0).length
  return Math.ceil(words * 1.3)
}

/**
 * Document Sharder
 *
 * Splits large markdown files into manageable sections.
 */
export class DocumentSharder {
  private maxTokensPerFile: number
  private splitLevel: number
  private minTokensPerSection: number
  private includeFrontmatter: boolean
  private tokenEstimator: (text: string) => number

  constructor(config: DocumentSharderConfig = {}) {
    this.maxTokensPerFile = config.maxTokensPerFile ?? 10000
    this.splitLevel = config.splitLevel ?? 2
    this.minTokensPerSection = config.minTokensPerSection ?? 500
    this.includeFrontmatter = config.includeFrontmatter !== false
    this.tokenEstimator = config.tokenEstimator ?? defaultTokenEstimator
  }

  /**
   * Shard a markdown document into multiple files
   *
   * @param filePath - Path to the markdown file
   * @param options - Override options for this operation
   * @returns Sharding result
   */
  async shardDocument(
    filePath: string,
    options: Partial<DocumentSharderConfig> = {}
  ): Promise<ShardingResult> {
    const config = { ...this, ...options }

    // Read the document
    const content = await fs.readFile(filePath, 'utf-8')
    const originalTokens = this.tokenEstimator(content)

    // Extract frontmatter if present
    const { frontmatter, body } = this.extractFrontmatter(content)

    // Parse sections
    const sections = this.parseDocument(body, config.splitLevel)

    // Determine output directory
    const outputDir = filePath.replace(/\.md$/, '/')
    await fs.mkdir(outputDir, { recursive: true })

    // Generate section files
    const sectionPaths: string[] = []
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i]
      const fileName = `${String(i + 1).padStart(2, '0')}-${section.slug}.md`
      const sectionPath = path.join(outputDir, fileName)

      let sectionContent = section.content
      if (this.includeFrontmatter && frontmatter) {
        sectionContent = this.addFrontmatterToSection(frontmatter, section, sectionContent)
      }

      await fs.writeFile(sectionPath, sectionContent, 'utf-8')
      sectionPaths.push(sectionPath)
    }

    // Generate index file
    const indexPath = path.join(outputDir, 'index.md')
    const indexContent = this.generateIndex(filePath, sections, frontmatter)
    await fs.writeFile(indexPath, indexContent, 'utf-8')

    return {
      indexPath,
      outputDir,
      sectionCount: sections.length,
      sectionPaths,
      originalTokens,
      averageTokensPerSection: Math.round(originalTokens / sections.length)
    }
  }

  /**
   * Parse document into sections based on headings
   *
   * @param content - Document content (without frontmatter)
   * @param splitLevel - Heading level to split at
   * @returns Array of sections
   */
  parseDocument(content: string, splitLevel: number = this.splitLevel): DocumentSection[] {
    const lines = content.split('\n')
    const sections: DocumentSection[] = []
    let currentSection: DocumentSection | null = null
    let currentContent: string[] = []
    let lineNumber = 0

    for (const line of lines) {
      lineNumber++
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)

      if (headingMatch) {
        const level = headingMatch[1].length

        if (level <= splitLevel) {
          // Save previous section
          if (currentSection) {
            currentSection.content = currentContent.join('\n')
            currentSection.tokenCount = this.tokenEstimator(currentSection.content)
            sections.push(currentSection)
          }

          // Start new section
          const heading = headingMatch[2].trim()
          currentSection = {
            heading,
            slug: this.slugify(heading),
            level,
            content: '',
            tokenCount: 0,
            startLine: lineNumber,
            children: []
          }
          currentContent = [line]
        } else {
          // Add to current content
          currentContent.push(line)
        }
      } else {
        currentContent.push(line)
      }
    }

    // Save last section
    if (currentSection) {
      currentSection.content = currentContent.join('\n')
      currentSection.tokenCount = this.tokenEstimator(currentSection.content)
      sections.push(currentSection)
    }

    // Handle content before first heading
    if (sections.length === 0 && currentContent.length > 0) {
      sections.push({
        heading: 'Introduction',
        slug: 'introduction',
        level: 1,
        content: currentContent.join('\n'),
        tokenCount: this.tokenEstimator(currentContent.join('\n')),
        startLine: 1,
        children: []
      })
    }

    return this.mergeSmalSections(sections)
  }

  /**
   * Merge small sections that are below the minimum token threshold
   */
  private mergeSmalSections(sections: DocumentSection[]): DocumentSection[] {
    const merged: DocumentSection[] = []
    let accumulator: DocumentSection | null = null

    for (const section of sections) {
      if (section.tokenCount < this.minTokensPerSection) {
        if (accumulator) {
          // Merge with accumulator
          accumulator.content += '\n\n' + section.content
          accumulator.tokenCount += section.tokenCount
          accumulator.children.push(section)
        } else if (merged.length > 0) {
          // Merge with previous section
          const prev = merged[merged.length - 1]
          prev.content += '\n\n' + section.content
          prev.tokenCount += section.tokenCount
          prev.children.push(section)
        } else {
          // Start accumulator
          accumulator = { ...section, children: [section] }
        }
      } else {
        // Flush accumulator if exists
        if (accumulator) {
          merged.push(accumulator)
          accumulator = null
        }
        merged.push(section)
      }
    }

    // Flush final accumulator
    if (accumulator) {
      if (merged.length > 0) {
        const prev = merged[merged.length - 1]
        prev.content += '\n\n' + accumulator.content
        prev.tokenCount += accumulator.tokenCount
      } else {
        merged.push(accumulator)
      }
    }

    return merged
  }

  /**
   * Extract YAML frontmatter from document
   */
  private extractFrontmatter(content: string): {
    frontmatter: string | null
    body: string
  } {
    const match = content.match(/^---\n([\s\S]*?)\n---\n/)

    if (match) {
      return {
        frontmatter: match[1],
        body: content.slice(match[0].length)
      }
    }

    return { frontmatter: null, body: content }
  }

  /**
   * Add frontmatter to a section file
   */
  private addFrontmatterToSection(
    originalFrontmatter: string,
    section: DocumentSection,
    content: string
  ): string {
    const frontmatterLines = [
      '---',
      `title: "${section.heading}"`,
      `parent: index`,
      `order: ${section.startLine}`
    ]

    // Include original frontmatter metadata if present
    if (originalFrontmatter) {
      frontmatterLines.push(`original_source: true`)
    }

    frontmatterLines.push('---', '')

    return frontmatterLines.join('\n') + content
  }

  /**
   * Generate index.md with links to all sections
   */
  private generateIndex(
    originalPath: string,
    sections: DocumentSection[],
    frontmatter: string | null
  ): string {
    const fileName = path.basename(originalPath, '.md')
    const title = this.unslugify(fileName)

    const lines = ['---']
    if (frontmatter) {
      lines.push(frontmatter)
    } else {
      lines.push(`title: "${title}"`)
    }
    lines.push('---', '')

    lines.push(`# ${title}`, '')
    lines.push('This document has been split into the following sections:', '')

    // Table of contents
    lines.push('## Table of Contents', '')
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i]
      const fileName = `${String(i + 1).padStart(2, '0')}-${section.slug}.md`
      const indent = '  '.repeat(Math.max(0, section.level - 1))
      lines.push(`${indent}${i + 1}. [${section.heading}](./${fileName})`)
    }

    lines.push('')
    lines.push('---')
    lines.push('')
    lines.push(`*Generated by Document Sharder - ${new Date().toISOString()}*`)

    return lines.join('\n')
  }

  /**
   * Convert heading to URL-safe slug
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with dashes
      .replace(/-+/g, '-') // Collapse multiple dashes
      .replace(/^-|-$/g, '') // Trim dashes from ends
      .substring(0, 50) // Limit length
  }

  /**
   * Convert slug back to title case
   */
  private unslugify(slug: string): string {
    return slug
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
  }

  /**
   * Estimate if a document needs sharding
   *
   * @param filePath - Path to the document
   * @returns true if document exceeds max tokens
   */
  async needsSharding(filePath: string): Promise<boolean> {
    const content = await fs.readFile(filePath, 'utf-8')
    const tokens = this.tokenEstimator(content)
    return tokens > this.maxTokensPerFile
  }

  /**
   * Get document statistics without sharding
   *
   * @param filePath - Path to the document
   * @returns Document statistics
   */
  async getDocumentStats(filePath: string): Promise<{
    totalTokens: number
    sectionCount: number
    sections: Array<{ heading: string; tokens: number }>
    needsSharding: boolean
  }> {
    const content = await fs.readFile(filePath, 'utf-8')
    const { body } = this.extractFrontmatter(content)
    const sections = this.parseDocument(body)

    return {
      totalTokens: this.tokenEstimator(content),
      sectionCount: sections.length,
      sections: sections.map(s => ({
        heading: s.heading,
        tokens: s.tokenCount
      })),
      needsSharding: this.tokenEstimator(content) > this.maxTokensPerFile
    }
  }

  /**
   * Reassemble a sharded document back into a single file
   *
   * @param indexPath - Path to the index.md
   * @returns Reassembled document content
   */
  async reassembleDocument(indexPath: string): Promise<string> {
    const dir = path.dirname(indexPath)
    const files = await fs.readdir(dir)

    // Sort section files by name (01-, 02-, etc.)
    const sectionFiles = files
      .filter(f => f.match(/^\d{2}-.*\.md$/) && f !== 'index.md')
      .sort()

    const sections: string[] = []
    for (const file of sectionFiles) {
      const content = await fs.readFile(path.join(dir, file), 'utf-8')
      const { body } = this.extractFrontmatter(content)
      sections.push(body.trim())
    }

    return sections.join('\n\n')
  }
}
