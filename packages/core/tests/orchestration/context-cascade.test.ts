import { ContextCascade } from '../../src/orchestration/context-cascade'
import { DocumentRegistry } from '../../src/orchestration/document-registry'

/**
 * Tests for BMAD Integration: Context Cascade
 */
describe('BMAD Integration: Context Cascade', () => {
  describe('ContextCascade', () => {
    it('should be importable', () => {
      expect(ContextCascade).toBeDefined()
      expect(typeof ContextCascade).toBe('function')
    })

    it('should instantiate with default config', () => {
      const cascade = new ContextCascade()
      expect(cascade).toBeDefined()
    })

    it('should instantiate with custom config', () => {
      const registry = new DocumentRegistry({ outputDir: '/tmp/test-output' })
      const cascade = new ContextCascade({
        documentRegistry: registry,
        autoLoad: false
      })
      expect(cascade).toBeDefined()
    })

    it('should have loadContextForWorkflow method', () => {
      const cascade = new ContextCascade()
      expect(typeof cascade.loadContextForWorkflow).toBe('function')
    })

    it('should have getDependencies method', () => {
      const cascade = new ContextCascade()
      expect(typeof cascade.getDependencies).toBe('function')
    })

    it('should return dependencies for create-prd workflow', () => {
      const cascade = new ContextCascade()
      const deps = cascade.getDependencies('create-prd')
      expect(deps).toContain('product-brief')
    })

    it('should return dependencies for create-architecture workflow', () => {
      const cascade = new ContextCascade()
      const deps = cascade.getDependencies('create-architecture')
      expect(deps).toContain('prd')
      expect(deps).toContain('ux-design')
    })

    it('should have buildContextChain method', () => {
      const cascade = new ContextCascade()
      expect(typeof cascade.buildContextChain).toBe('function')
    })

    it('should have formatContextForAgent method', () => {
      const cascade = new ContextCascade()
      expect(typeof cascade.formatContextForAgent).toBe('function')
    })
  })

  describe('DocumentRegistry', () => {
    it('should be importable', () => {
      expect(DocumentRegistry).toBeDefined()
      expect(typeof DocumentRegistry).toBe('function')
    })

    it('should instantiate with default config', () => {
      const registry = new DocumentRegistry()
      expect(registry).toBeDefined()
    })

    it('should instantiate with custom config', () => {
      const registry = new DocumentRegistry({
        outputDir: '/tmp/custom-output',
        indexFileName: 'custom-index.json',
        autoCreateDir: false
      })
      expect(registry).toBeDefined()
    })

    it('should have registerDocument method', () => {
      const registry = new DocumentRegistry()
      expect(typeof registry.registerDocument).toBe('function')
    })

    it('should have getDocument method', () => {
      const registry = new DocumentRegistry()
      expect(typeof registry.getDocument).toBe('function')
    })

    it('should have listDocuments method', () => {
      const registry = new DocumentRegistry()
      expect(typeof registry.listDocuments).toBe('function')
    })

    it('should have hasDocument method', () => {
      const registry = new DocumentRegistry()
      expect(typeof registry.hasDocument).toBe('function')
    })
  })
})
