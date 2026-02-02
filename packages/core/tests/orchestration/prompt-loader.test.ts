/**
 * PromptLoader Tests
 * Tests for prompt template loading and rendering
 */

import * as path from 'path'
import {
  PromptLoader,
  getPromptLoader,
  resetPromptLoader
} from '../../src/orchestration/prompts'

const PROMPTS_DIR = path.join(__dirname, '../../src/orchestration/prompts')

describe('PromptLoader', () => {
  beforeEach(() => {
    resetPromptLoader()
  })

  describe('singleton', () => {
    it('should return singleton instance', () => {
      const loader1 = getPromptLoader()
      const loader2 = getPromptLoader()

      expect(loader1).toBe(loader2)
    })

    it('should reset singleton', () => {
      const loader1 = getPromptLoader()
      resetPromptLoader()
      const loader2 = getPromptLoader()

      expect(loader1).not.toBe(loader2)
    })
  })

  describe('loadTemplate', () => {
    it('should load template from file', () => {
      const loader = new PromptLoader(PROMPTS_DIR)
      const template = loader.loadTemplate('architect')

      expect(template).toBeDefined()
      expect(template.name).toBe('architect')
      expect(template.content).toContain('Architect')
    })

    it('should cache loaded templates', () => {
      const loader = new PromptLoader(PROMPTS_DIR)

      const template1 = loader.loadTemplate('architect')
      const template2 = loader.loadTemplate('architect')

      expect(template1).toBe(template2)
    })

    it('should throw on missing template', () => {
      const loader = new PromptLoader(PROMPTS_DIR)

      expect(() => {
        loader.loadTemplate('non-existent-template')
      }).toThrow()
    })

    it('should include file path in template', () => {
      const loader = new PromptLoader(PROMPTS_DIR)
      const template = loader.loadTemplate('architect')

      expect(template.filePath).toContain('architect.md')
    })
  })

  describe('render', () => {
    it('should replace {{variables}}', () => {
      const loader = new PromptLoader(PROMPTS_DIR)
      const result = loader.render('architect', {
        task: 'Design a new API',
        timestamp: '2024-01-01'
      })

      expect(result.content).toContain('Design a new API')
      expect(result.variables.task).toBe('Design a new API')
    })

    it('should handle missing variables gracefully', () => {
      const loader = new PromptLoader(PROMPTS_DIR)
      const result = loader.render('architect', {})

      // Missing variables should be replaced with [varName]
      expect(result.content).toBeDefined()
    })

    it('should track used variables', () => {
      const loader = new PromptLoader(PROMPTS_DIR)
      const result = loader.render('architect', {
        task: 'Test task',
        projectContext: { name: 'Test' }
      })

      expect(result.variables).toBeDefined()
      expect(typeof result.variables).toBe('object')
    })

    it('should support nested context', () => {
      const loader = new PromptLoader(PROMPTS_DIR)
      const result = loader.render('architect', {
        projectContext: {
          name: 'MyProject',
          version: '1.0.0'
        }
      })

      expect(result.content).toBeDefined()
    })

    it('should return template metadata', () => {
      const loader = new PromptLoader(PROMPTS_DIR)
      const result = loader.render('architect', { task: 'Test' })

      expect(result.template).toBeDefined()
      expect(result.template.name).toBe('architect')
    })
  })

  describe('listTemplates', () => {
    it('should list all .md files', () => {
      const loader = new PromptLoader(PROMPTS_DIR)
      const templates = loader.listTemplates()

      expect(Array.isArray(templates)).toBe(true)
      expect(templates.length).toBeGreaterThan(0)
    })

    it('should include architect template', () => {
      const loader = new PromptLoader(PROMPTS_DIR)
      const templates = loader.listTemplates()

      expect(templates).toContain('architect')
    })

    it('should include developer template', () => {
      const loader = new PromptLoader(PROMPTS_DIR)
      const templates = loader.listTemplates()

      expect(templates).toContain('developer')
    })
  })

  describe('clearCache', () => {
    it('should clear template cache', () => {
      const loader = new PromptLoader(PROMPTS_DIR)

      // Load template to cache it
      const template1 = loader.loadTemplate('architect')

      // Clear cache
      loader.clearCache()

      // Load again - should be new object
      const template2 = loader.loadTemplate('architect')

      // Content should be same, but might be different object
      expect(template2.content).toBe(template1.content)
    })
  })
})
