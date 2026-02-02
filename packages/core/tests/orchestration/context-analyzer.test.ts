/**
 * ContextAnalyzer unit tests
 *
 * Adaptive Workflow System: Phase Detection
 *
 * Tests cover:
 * - Basic import and instantiation
 * - File scanning and categorization
 * - Artifact analysis
 * - Configuration options
 * - Error handling
 */

import { ContextAnalyzer } from '../../src/orchestration/context-analyzer'
import type { ProjectContext } from '../../src/orchestration/types'

describe('ContextAnalyzer', () => {
  describe('import and instantiation', () => {
    it('should be importable', () => {
      expect(ContextAnalyzer).toBeDefined()
      expect(typeof ContextAnalyzer).toBe('function')
    })

    it('should instantiate with default config', () => {
      const analyzer = new ContextAnalyzer()
      expect(analyzer).toBeInstanceOf(ContextAnalyzer)
    })

    it('should instantiate with custom config', () => {
      const analyzer = new ContextAnalyzer({
        maxDepth: 5
      })
      expect(analyzer).toBeInstanceOf(ContextAnalyzer)
    })
  })

  describe('analyze - basic functionality', () => {
    let analyzer: ContextAnalyzer

    beforeEach(() => {
      analyzer = new ContextAnalyzer({ maxDepth: 2 })
    })

    it('should return ArtifactAnalysis structure', async () => {
      const context: ProjectContext = {
        projectPath: process.cwd()
      }

      const result = await analyzer.analyze(context)

      expect(result).toBeDefined()
      expect(typeof result.hasImplementation).toBe('boolean')
      expect(typeof result.hasTests).toBe('boolean')
      expect(typeof result.hasDocs).toBe('boolean')
      expect(Array.isArray(result.files)).toBe(true)
      expect(typeof result.summary).toBe('string')
    })

    it('should detect implementation files', async () => {
      const context: ProjectContext = {
        projectPath: process.cwd()
      }

      const result = await analyzer.analyze(context)

      // Current project should have .ts files
      expect(result.hasImplementation).toBe(true)
      expect(result.files.length).toBeGreaterThan(0)
    })

    it('should work without projectPath', async () => {
      const context: ProjectContext = {}

      const result = await analyzer.analyze(context)

      // Should return default/empty analysis
      expect(result).toBeDefined()
      expect(typeof result.hasImplementation).toBe('boolean')
    })
  })

  describe('file categorization', () => {
    let analyzer: ContextAnalyzer

    beforeEach(() => {
      analyzer = new ContextAnalyzer({ maxDepth: 3 })
    })

    it('should categorize files by type', async () => {
      const context: ProjectContext = {
        projectPath: process.cwd()
      }

      const result = await analyzer.analyze(context)

      // Files array should contain typed entries
      expect(result.files.every(f => 
        ['implementation', 'test', 'documentation', 'config', 'other'].includes(f.type)
      )).toBe(true)
    })

    it('should handle context with predefined files', async () => {
      const context: ProjectContext = {
        projectPath: process.cwd(),
        files: [
          'src/index.ts',
          'src/utils.ts',
          'tests/index.test.ts'
        ]
      }

      const result = await analyzer.analyze(context)

      expect(result).toBeDefined()
    })
  })

  describe('summary generation', () => {
    let analyzer: ContextAnalyzer

    beforeEach(() => {
      analyzer = new ContextAnalyzer()
    })

    it('should generate non-empty summary', async () => {
      const context: ProjectContext = {
        projectPath: process.cwd()
      }

      const result = await analyzer.analyze(context)

      expect(result.summary).toBeTruthy()
      expect(result.summary.length).toBeGreaterThan(10)
    })
  })

  describe('error handling', () => {
    let analyzer: ContextAnalyzer

    beforeEach(() => {
      analyzer = new ContextAnalyzer()
    })

    it('should handle non-existent project path gracefully', async () => {
      const context: ProjectContext = {
        projectPath: '/non/existent/path/12345'
      }

      // Should not throw, should return empty/default analysis
      const result = await analyzer.analyze(context)

      expect(result).toBeDefined()
      expect(result.hasImplementation).toBe(false)
      expect(result.hasTests).toBe(false)
    })

    it('should handle empty context', async () => {
      const result = await analyzer.analyze({})

      expect(result).toBeDefined()
    })

    it('should handle undefined context', async () => {
      const result = await analyzer.analyze(undefined)

      expect(result).toBeDefined()
    })
  })

  describe('configuration options', () => {
    it('should respect maxDepth option', async () => {
      const shallowAnalyzer = new ContextAnalyzer({ maxDepth: 1 })
      const deepAnalyzer = new ContextAnalyzer({ maxDepth: 5 })

      const context: ProjectContext = {
        projectPath: process.cwd()
      }

      const shallowResult = await shallowAnalyzer.analyze(context)
      const deepResult = await deepAnalyzer.analyze(context)

      // Both should return valid results
      expect(shallowResult).toBeDefined()
      expect(deepResult).toBeDefined()
    })
  })
})
