import { DocumentSharder } from '../../src/utils/document-sharding'

/**
 * Tests for BMAD Integration: Document Sharding
 */
describe('BMAD Integration: Document Sharding', () => {
  describe('DocumentSharder', () => {
    it('should be importable', () => {
      expect(DocumentSharder).toBeDefined()
      expect(typeof DocumentSharder).toBe('function')
    })

    it('should instantiate with default config', () => {
      const sharder = new DocumentSharder()
      expect(sharder).toBeDefined()
    })

    it('should instantiate with custom config', () => {
      const sharder = new DocumentSharder({
        maxTokensPerFile: 5000,
        splitLevel: 3,
        minTokensPerSection: 200,
        includeFrontmatter: false
      })
      expect(sharder).toBeDefined()
    })

    it('should have shardDocument method', () => {
      const sharder = new DocumentSharder()
      expect(typeof sharder.shardDocument).toBe('function')
    })

    it('should have parseDocument method', () => {
      const sharder = new DocumentSharder()
      expect(typeof sharder.parseDocument).toBe('function')
    })

    it('should have needsSharding method', () => {
      const sharder = new DocumentSharder()
      expect(typeof sharder.needsSharding).toBe('function')
    })

    it('should have getDocumentStats method', () => {
      const sharder = new DocumentSharder()
      expect(typeof sharder.getDocumentStats).toBe('function')
    })

    it('should have reassembleDocument method', () => {
      const sharder = new DocumentSharder()
      expect(typeof sharder.reassembleDocument).toBe('function')
    })

    describe('parseDocument', () => {
      it('should parse document with ## headings', () => {
        // Set minTokensPerSection=0 to prevent merging small sections in test
        const sharder = new DocumentSharder({ minTokensPerSection: 0 })
        const content = `# Title

Introduction text

## Section 1

Content for section 1

## Section 2

Content for section 2
`
        const sections = sharder.parseDocument(content)
        expect(sections.length).toBeGreaterThanOrEqual(2)
      })

      it('should handle document with no headings', () => {
        const sharder = new DocumentSharder()
        const content = `Just some plain text without any headings.
More text here.`
        const sections = sharder.parseDocument(content)
        expect(sections.length).toBeGreaterThanOrEqual(1)
      })

      it('should respect splitLevel configuration', () => {
        // Set minTokensPerSection=0 to prevent merging small sections
        const sharder = new DocumentSharder({ splitLevel: 3, minTokensPerSection: 0 })
        // Use explicit newlines to ensure proper parsing
        const content = [
          '# Title',
          '',
          '## Level 2',
          '',
          '### Level 3',
          '',
          'Content',
          '',
          '### Level 3 Again',
          '',
          'More content'
        ].join('\n')
        const sections = sharder.parseDocument(content, 3)
        // With splitLevel=3 and no merging, should have 4 sections: Title, Level 2, Level 3, Level 3 Again
        expect(sections.length).toBeGreaterThanOrEqual(3)
        // Check that we have sections with level 3 headings
        const level3Sections = sections.filter(s => s.level === 3)
        expect(level3Sections.length).toBeGreaterThan(0)
      })
    })
  })
})
