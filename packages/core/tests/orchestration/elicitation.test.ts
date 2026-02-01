import {
  ElicitationManager,
  getTechnique,
  getAvailableTechniques,
  getTechniqueDescriptions,
  firstPrinciplesTechnique,
  redTeamBlueTeamTechnique,
  preMortemTechnique,
  socraticTechnique,
  devilsAdvocateTechnique
} from '../../src/orchestration/elicitation'

/**
 * Tests for BMAD Integration: Advanced Elicitation
 */
describe('BMAD Integration: Advanced Elicitation', () => {
  describe('ElicitationManager', () => {
    it('should be importable', () => {
      expect(ElicitationManager).toBeDefined()
      expect(typeof ElicitationManager).toBe('function')
    })

    it('should instantiate with default config', () => {
      const manager = new ElicitationManager()
      expect(manager).toBeDefined()
    })

    it('should instantiate with custom config', () => {
      const manager = new ElicitationManager({
        enabled: true,
        defaultTechniques: ['first-principles', 'socratic'],
        applyToWorkflows: ['create-prd'],
        maxInsightsPerTechnique: 5,
        verbose: true
      })
      expect(manager).toBeDefined()
    })

    it('should have applyElicitation method', () => {
      const manager = new ElicitationManager()
      expect(typeof manager.applyElicitation).toBe('function')
    })

    it('should have applyMultipleElicitations method', () => {
      const manager = new ElicitationManager()
      expect(typeof manager.applyMultipleElicitations).toBe('function')
    })

    it('should have getAvailableTechniques method', () => {
      const manager = new ElicitationManager()
      expect(typeof manager.getAvailableTechniques).toBe('function')
    })

    it('should return available techniques', () => {
      const manager = new ElicitationManager()
      const techniques = manager.getAvailableTechniques()
      expect(techniques).toContain('first-principles')
      expect(techniques).toContain('red-team-blue-team')
      expect(techniques).toContain('pre-mortem')
      expect(techniques).toContain('socratic')
      expect(techniques).toContain('devils-advocate')
    })

    it('should have shouldApplyToWorkflow method', () => {
      const manager = new ElicitationManager()
      expect(typeof manager.shouldApplyToWorkflow).toBe('function')
    })

    it('should return true for configured workflows', () => {
      const manager = new ElicitationManager({
        applyToWorkflows: ['create-prd']
      })
      expect(manager.shouldApplyToWorkflow('create-prd')).toBe(true)
      expect(manager.shouldApplyToWorkflow('other-workflow')).toBe(false)
    })
  })

  describe('Elicitation Techniques', () => {
    describe('getTechnique', () => {
      it('should return first-principles technique', () => {
        const technique = getTechnique('first-principles')
        expect(technique).toBeDefined()
        expect(technique?.id).toBe('first-principles')
        expect(technique?.name).toBe('First Principles Analysis')
      })

      it('should return red-team-blue-team technique', () => {
        const technique = getTechnique('red-team-blue-team')
        expect(technique).toBeDefined()
        expect(technique?.id).toBe('red-team-blue-team')
      })

      it('should return pre-mortem technique', () => {
        const technique = getTechnique('pre-mortem')
        expect(technique).toBeDefined()
        expect(technique?.id).toBe('pre-mortem')
      })

      it('should return socratic technique', () => {
        const technique = getTechnique('socratic')
        expect(technique).toBeDefined()
        expect(technique?.id).toBe('socratic')
      })

      it('should return devils-advocate technique', () => {
        const technique = getTechnique('devils-advocate')
        expect(technique).toBeDefined()
        expect(technique?.id).toBe('devils-advocate')
      })

      it('should return undefined for unknown technique', () => {
        const technique = getTechnique('unknown' as any)
        expect(technique).toBeUndefined()
      })
    })

    describe('getAvailableTechniques', () => {
      it('should return all 5 techniques', () => {
        const techniques = getAvailableTechniques()
        expect(techniques.length).toBe(5)
      })
    })

    describe('getTechniqueDescriptions', () => {
      it('should return descriptions for all techniques', () => {
        const descriptions = getTechniqueDescriptions()
        expect(descriptions.length).toBe(5)
        descriptions.forEach(desc => {
          expect(desc.id).toBeDefined()
          expect(desc.name).toBeDefined()
          expect(desc.description).toBeDefined()
          expect(desc.useCase).toBeDefined()
        })
      })
    })

    describe('Technique exports', () => {
      it('should export firstPrinciplesTechnique', () => {
        expect(firstPrinciplesTechnique).toBeDefined()
        expect(firstPrinciplesTechnique.id).toBe('first-principles')
        expect(typeof firstPrinciplesTechnique.generatePrompt).toBe('function')
      })

      it('should export redTeamBlueTeamTechnique', () => {
        expect(redTeamBlueTeamTechnique).toBeDefined()
        expect(redTeamBlueTeamTechnique.id).toBe('red-team-blue-team')
        expect(typeof redTeamBlueTeamTechnique.generatePrompt).toBe('function')
      })

      it('should export preMortemTechnique', () => {
        expect(preMortemTechnique).toBeDefined()
        expect(preMortemTechnique.id).toBe('pre-mortem')
        expect(typeof preMortemTechnique.generatePrompt).toBe('function')
      })

      it('should export socraticTechnique', () => {
        expect(socraticTechnique).toBeDefined()
        expect(socraticTechnique.id).toBe('socratic')
        expect(typeof socraticTechnique.generatePrompt).toBe('function')
      })

      it('should export devilsAdvocateTechnique', () => {
        expect(devilsAdvocateTechnique).toBeDefined()
        expect(devilsAdvocateTechnique.id).toBe('devils-advocate')
        expect(typeof devilsAdvocateTechnique.generatePrompt).toBe('function')
      })
    })

    describe('generatePrompt', () => {
      const testContent = 'Test content for analysis'

      it('should generate first-principles prompt', () => {
        const prompt = firstPrinciplesTechnique.generatePrompt(testContent)
        expect(prompt).toContain('First Principles')
        expect(prompt).toContain(testContent)
      })

      it('should generate red-team-blue-team prompt', () => {
        const prompt = redTeamBlueTeamTechnique.generatePrompt(testContent)
        expect(prompt).toContain('Red Team')
        expect(prompt).toContain('Blue Team')
        expect(prompt).toContain(testContent)
      })

      it('should generate pre-mortem prompt', () => {
        const prompt = preMortemTechnique.generatePrompt(testContent)
        expect(prompt).toContain('Pre-mortem')
        expect(prompt).toContain('FAILED')
        expect(prompt).toContain(testContent)
      })

      it('should generate socratic prompt', () => {
        const prompt = socraticTechnique.generatePrompt(testContent)
        expect(prompt).toContain('Socratic')
        expect(prompt).toContain(testContent)
      })

      it('should generate devils-advocate prompt', () => {
        const prompt = devilsAdvocateTechnique.generatePrompt(testContent)
        expect(prompt).toContain("Devil's Advocate")
        expect(prompt).toContain(testContent)
      })
    })
  })
})
