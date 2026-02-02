/**
 * ContextAnalyzer - Analyze project context for phase detection
 *
 * Part of the Adaptive Workflow System
 *
 * Features:
 * - File system scanning
 * - File categorization (implementation, test, docs)
 * - Git history analysis (optional)
 * - Summary generation for LLM analysis
 */

import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'
import type { ProjectContext, ArtifactAnalysis } from './types'

/**
 * File type for categorization
 */
type FileType = 'implementation' | 'test' | 'documentation' | 'config' | 'other'

/**
 * Categorized files result
 */
interface CategorizedFiles {
  implementation: string[]
  tests: string[]
  docs: string[]
  config: string[]
  other: string[]
  all: Array<{ path: string; type: FileType }>
}

/**
 * Configuration for context analysis
 */
export interface ContextAnalyzerConfig {
  /**
   * Maximum depth for file scanning
   * @default 3
   */
  maxDepth?: number

  /**
   * Include git history analysis
   * @default false
   */
  includeGit?: boolean

  /**
   * Maximum files to scan
   * @default 100
   */
  maxFiles?: number

  /**
   * File extensions to ignore
   */
  ignoreExtensions?: string[]

  /**
   * Directories to ignore
   */
  ignoreDirs?: string[]
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Required<ContextAnalyzerConfig> = {
  maxDepth: 3,
  includeGit: false,
  maxFiles: 100,
  ignoreExtensions: ['.lock', '.log', '.map', '.min.js', '.min.css'],
  ignoreDirs: ['node_modules', '.git', 'dist', 'build', 'coverage', '.next', '.cache']
}

/**
 * File patterns for categorization
 */
const FILE_PATTERNS = {
  test: [
    /\.test\.[jt]sx?$/,
    /\.spec\.[jt]sx?$/,
    /__tests__\//,
    /tests?\//,
    /\.e2e\.[jt]sx?$/
  ],
  docs: [
    /\.md$/,
    /\.mdx$/,
    /\.txt$/,
    /\.rst$/,
    /docs?\//,
    /README/i,
    /CHANGELOG/i,
    /LICENSE/i
  ],
  config: [
    /\.json$/,
    /\.ya?ml$/,
    /\.toml$/,
    /\.env/,
    /config\//,
    /\.config\.[jt]s$/,
    /tsconfig/,
    /package\.json$/,
    /\.eslintrc/,
    /\.prettierrc/
  ],
  implementation: [
    /\.tsx?$/,
    /\.jsx?$/,
    /\.py$/,
    /\.go$/,
    /\.rs$/,
    /\.java$/,
    /\.cs$/,
    /\.cpp$/,
    /\.c$/,
    /\.swift$/,
    /\.kt$/
  ]
}

/**
 * ContextAnalyzer - Analyzes project context for intelligent phase detection
 */
export class ContextAnalyzer {
  private config: Required<ContextAnalyzerConfig>

  constructor(config?: ContextAnalyzerConfig) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config
    }
  }

  /**
   * Analyze project context and return artifact analysis
   *
   * @param context - Project context (path, files, etc.)
   * @returns Analysis of existing artifacts
   */
  async analyze(context?: ProjectContext): Promise<ArtifactAnalysis> {
    // If no context provided, return empty analysis
    if (!context || !context.projectPath) {
      return this.emptyAnalysis('No project context provided')
    }

    try {
      // 1. Scan files in project
      const files = await this.scanFiles(context.projectPath)

      // 2. Categorize files
      const categorized = this.categorizeFiles(files)

      // 3. Get git info (optional)
      const recentChanges = this.config.includeGit
        ? this.getGitInfo(context.projectPath)
        : undefined

      // 4. Generate summary
      const summary = this.generateSummary(categorized, recentChanges)

      return {
        hasImplementation: categorized.implementation.length > 0,
        hasTests: categorized.tests.length > 0,
        hasDocs: categorized.docs.length > 0,
        files: categorized.all,
        recentChanges,
        summary
      }
    } catch (error) {
      console.error('ContextAnalyzer error:', error)
      return this.emptyAnalysis(`Analysis failed: ${(error as Error).message}`)
    }
  }

  /**
   * Scan files in the project directory
   */
  private async scanFiles(projectPath: string): Promise<string[]> {
    const files: string[] = []

    const scanDir = (dir: string, depth: number): void => {
      // Check depth limit
      if (depth > this.config.maxDepth) return
      // Check file count limit
      if (files.length >= this.config.maxFiles) return

      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true })

        for (const entry of entries) {
          if (files.length >= this.config.maxFiles) break

          const fullPath = path.join(dir, entry.name)
          const relativePath = path.relative(projectPath, fullPath)

          // Skip ignored directories
          if (entry.isDirectory()) {
            if (this.config.ignoreDirs.some(d => entry.name === d || entry.name.startsWith('.'))) {
              continue
            }
            scanDir(fullPath, depth + 1)
          } else {
            // Skip ignored extensions
            const ext = path.extname(entry.name)
            if (this.config.ignoreExtensions.includes(ext)) {
              continue
            }
            files.push(relativePath)
          }
        }
      } catch {
        // Ignore permission errors etc.
      }
    }

    // Start scanning
    if (fs.existsSync(projectPath)) {
      scanDir(projectPath, 0)
    }

    return files
  }

  /**
   * Categorize files by type
   */
  private categorizeFiles(files: string[]): CategorizedFiles {
    const result: CategorizedFiles = {
      implementation: [],
      tests: [],
      docs: [],
      config: [],
      other: [],
      all: []
    }

    for (const file of files) {
      const type = this.getFileType(file)

      result.all.push({ path: file, type })

      switch (type) {
        case 'test':
          result.tests.push(file)
          break
        case 'documentation':
          result.docs.push(file)
          break
        case 'config':
          result.config.push(file)
          break
        case 'implementation':
          result.implementation.push(file)
          break
        default:
          result.other.push(file)
      }
    }

    return result
  }

  /**
   * Determine file type based on patterns
   */
  private getFileType(filePath: string): FileType {
    // Check test patterns first (highest priority)
    if (FILE_PATTERNS.test.some(pattern => pattern.test(filePath))) {
      return 'test'
    }

    // Check docs patterns
    if (FILE_PATTERNS.docs.some(pattern => pattern.test(filePath))) {
      return 'documentation'
    }

    // Check config patterns
    if (FILE_PATTERNS.config.some(pattern => pattern.test(filePath))) {
      return 'config'
    }

    // Check implementation patterns
    if (FILE_PATTERNS.implementation.some(pattern => pattern.test(filePath))) {
      return 'implementation'
    }

    return 'other'
  }

  /**
   * Get recent git changes (optional)
   */
  private getGitInfo(projectPath: string): string | undefined {
    try {
      // Get last 5 commit messages
      const result = execSync(
        'git log --oneline -5 2>/dev/null',
        { cwd: projectPath, encoding: 'utf-8', timeout: 5000 }
      )
      return result.trim() || undefined
    } catch {
      return undefined
    }
  }

  /**
   * Generate human-readable summary
   */
  private generateSummary(categorized: CategorizedFiles, recentChanges?: string): string {
    const parts: string[] = []

    // Implementation summary
    if (categorized.implementation.length > 0) {
      const sample = categorized.implementation.slice(0, 3).join(', ')
      parts.push(`${categorized.implementation.length} implementation files (e.g., ${sample})`)
    } else {
      parts.push('No implementation files found')
    }

    // Test summary
    if (categorized.tests.length > 0) {
      parts.push(`${categorized.tests.length} test files`)
    } else {
      parts.push('No tests found')
    }

    // Docs summary
    if (categorized.docs.length > 0) {
      parts.push(`${categorized.docs.length} documentation files`)
    }

    // Git info
    if (recentChanges) {
      const commits = recentChanges.split('\n').length
      parts.push(`${commits} recent commits`)
    }

    return parts.join('; ')
  }

  /**
   * Create empty analysis with message
   */
  private emptyAnalysis(message: string): ArtifactAnalysis {
    return {
      hasImplementation: false,
      hasTests: false,
      hasDocs: false,
      files: [],
      summary: message
    }
  }

  /**
   * Quick check if path has any source files
   */
  static hasSourceFiles(projectPath: string): boolean {
    if (!fs.existsSync(projectPath)) return false

    try {
      const entries = fs.readdirSync(projectPath, { withFileTypes: true })
      for (const entry of entries) {
        if (entry.isFile()) {
          const ext = path.extname(entry.name)
          if (['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs'].includes(ext)) {
            return true
          }
        }
      }
    } catch {
      return false
    }

    return false
  }
}
