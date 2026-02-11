/**
 * Full Discovery Workflow Tests
 *
 * Tests cover:
 * - Workflow JSON loading and structure validation
 * - Step ordering and parallel detection
 * - Agent artifact documentType metadata
 * - HTML mockup generation (UXDesignerAgent)
 * - Technical Specification generation (ArchitectAgent)
 * - Quality Strategy generation (TestArchitectAgent)
 * - Master document consolidation (TechWriterAgent)
 */

import * as path from 'path'

// Workflow JSON path
const WORKFLOW_PATH = path.join(
  __dirname,
  '../../templates/workflows/24-full-discovery/full_discovery_workflow.json'
)

describe('Full Discovery Workflow', () => {
  let workflow: any

  beforeAll(async () => {
    const raw = await (jest.requireActual('fs/promises') as typeof import('fs/promises'))
      .readFile(WORKFLOW_PATH, 'utf-8')
    workflow = JSON.parse(raw)
  })

  describe('Workflow JSON structure', () => {
    it('should have correct id and name', () => {
      expect(workflow.id).toBe('full_discovery_workflow')
      expect(workflow.name).toBe('Full Discovery Phase')
    })

    it('should have 8 steps', () => {
      expect(workflow.steps).toHaveLength(8)
    })

    it('should have orders 1 through 7', () => {
      const orders = [...new Set(workflow.steps.map((s: any) => s.order))].sort()
      expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7])
    })

    it('should have parallel steps at order 5', () => {
      const order5Steps = workflow.steps.filter((s: any) => s.order === 5)
      expect(order5Steps).toHaveLength(2)

      const roleIds = order5Steps.map((s: any) => s.role_id).sort()
      expect(roleIds).toEqual(['api-designer', 'data-architect'])

      // Both should reference each other in parallel_with
      for (const step of order5Steps) {
        expect(step.parallel_with).toBeDefined()
        expect(step.parallel_with.length).toBe(1)
      }
    })

    it('should use correct role_ids in expected order', () => {
      const rolesByOrder = workflow.steps
        .sort((a: any, b: any) => a.order - b.order)
        .map((s: any) => ({ order: s.order, role: s.role_id }))

      expect(rolesByOrder[0]).toEqual({ order: 1, role: 'architect' })
      expect(rolesByOrder[1]).toEqual({ order: 2, role: 'business-analyst' })
      expect(rolesByOrder[2]).toEqual({ order: 3, role: 'ux-designer' })
      expect(rolesByOrder[3]).toEqual({ order: 4, role: 'architect' })
      // Order 5 has two steps (parallel)
      const order5Roles = rolesByOrder.filter((r: any) => r.order === 5).map((r: any) => r.role).sort()
      expect(order5Roles).toEqual(['api-designer', 'data-architect'])
      expect(rolesByOrder[6]).toEqual({ order: 6, role: 'test-architect' })
      expect(rolesByOrder[7]).toEqual({ order: 7, role: 'tech-writer' })
    })

    it('should have trigger keywords for discovery', () => {
      const keywords = workflow.trigger_condition.keywords
      expect(keywords).toContain('full discovery')
      expect(keywords).toContain('discovery phase')
      expect(keywords).toContain('comprehensive planning')
      expect(keywords).toContain('полное исследование')
      expect(keywords).toContain('фаза дискавери')
    })

    it('should target complex and enterprise complexity', () => {
      expect(workflow.trigger_condition.complexity_range).toEqual(['complex', 'enterprise'])
    })

    it('should have phases metadata for adaptive detection', () => {
      expect(workflow.phases).toBeDefined()
      expect(Object.keys(workflow.phases)).toHaveLength(7)
      expect(workflow.phases.user_input).toBeDefined()
      expect(workflow.phases.requirements).toBeDefined()
      expect(workflow.phases.ux_design).toBeDefined()
      expect(workflow.phases.architecture).toBeDefined()
      expect(workflow.phases.data_and_api).toBeDefined()
      expect(workflow.phases.quality_planning).toBeDefined()
      expect(workflow.phases.documentation).toBeDefined()
    })

    it('should have adaptive_phase_detection enabled', () => {
      expect(workflow.metadata.adaptive_phase_detection).toBe(true)
    })

    it('should have estimated time of 6h', () => {
      expect(workflow.estimated_time).toBe('6h')
    })
  })

  describe('Step dependency validation', () => {
    it('should have no required artifacts for step 1 (user input)', () => {
      const step1 = workflow.steps.find((s: any) => s.order === 1)
      expect(step1.phase_join_criteria.required_artifacts).toEqual([])
    })

    it('should require user_preferences for step 2 (requirements)', () => {
      const step2 = workflow.steps.find((s: any) => s.order === 2)
      expect(step2.phase_join_criteria.required_artifacts).toContain('user_preferences')
    })

    it('should require prd_document for step 3 (ux_design)', () => {
      const step3 = workflow.steps.find((s: any) => s.order === 3)
      expect(step3.phase_join_criteria.required_artifacts).toContain('prd_document')
    })

    it('should require prd + ux for step 4 (architecture)', () => {
      const step4 = workflow.steps.find((s: any) => s.order === 4)
      expect(step4.phase_join_criteria.required_artifacts).toContain('prd_document')
      expect(step4.phase_join_criteria.required_artifacts).toContain('user_flows')
    })

    it('should require architecture for order 5 steps', () => {
      const order5Steps = workflow.steps.filter((s: any) => s.order === 5)
      for (const step of order5Steps) {
        expect(step.phase_join_criteria.required_artifacts).toContain('adr_document')
        expect(step.phase_join_criteria.required_artifacts).toContain('technical_specification')
      }
    })

    it('should require all design artifacts for step 6 (quality)', () => {
      const step6 = workflow.steps.find((s: any) => s.order === 6)
      expect(step6.phase_join_criteria.required_artifacts).toContain('prd_document')
      expect(step6.phase_join_criteria.required_artifacts).toContain('adr_document')
      expect(step6.phase_join_criteria.required_artifacts).toContain('database_schema')
      expect(step6.phase_join_criteria.required_artifacts).toContain('api_contracts')
    })

    it('should require all 7 deliverable types for step 7 (master doc)', () => {
      const step7 = workflow.steps.find((s: any) => s.order === 7)
      const required = step7.phase_join_criteria.required_artifacts
      expect(required).toContain('prd_document')
      expect(required).toContain('html_mockups')
      expect(required).toContain('adr_document')
      expect(required).toContain('technical_specification')
      expect(required).toContain('database_schema')
      expect(required).toContain('api_contracts')
      expect(required).toContain('quality_strategy')
    })

    it('each step should have a timeout', () => {
      for (const step of workflow.steps) {
        expect(step.timeout).toBeDefined()
        expect(step.timeout).toMatch(/^\d+m$/)
      }
    })

    it('each step should have deliverables', () => {
      for (const step of workflow.steps) {
        expect(step.deliverables).toBeDefined()
        expect(step.deliverables.length).toBeGreaterThan(0)
      }
    })
  })
})

describe('Agent documentType metadata', () => {
  describe('UXDesignerAgent', () => {
    it('should export generateHTMLMockups method', async () => {
      const { UXDesignerAgent } = await import('../../src/agents/roles/ux-designer.agent')
      const agent = new UXDesignerAgent()
      expect(typeof (agent as any).generateHTMLMockups).toBe('function')
    })

    it('should export generateStyleguide method', async () => {
      const { UXDesignerAgent } = await import('../../src/agents/roles/ux-designer.agent')
      const agent = new UXDesignerAgent()
      expect(typeof (agent as any).generateStyleguide).toBe('function')
    })
  })

  describe('ArchitectAgent', () => {
    it('should export generateTechnicalSpecification method', async () => {
      const { ArchitectAgent } = await import('../../src/agents/roles/architect.agent')
      const agent = new ArchitectAgent()
      expect(typeof (agent as any).generateTechnicalSpecification).toBe('function')
    })
  })

  describe('TestArchitectAgent', () => {
    it('should export generateQualityStrategy method', async () => {
      const { TestArchitectAgent } = await import('../../src/agents/roles/test-architect.agent')
      const agent = new TestArchitectAgent()
      expect(typeof (agent as any).generateQualityStrategy).toBe('function')
    })

    it('should export isDiscoveryContext method', async () => {
      const { TestArchitectAgent } = await import('../../src/agents/roles/test-architect.agent')
      const agent = new TestArchitectAgent()
      expect(typeof (agent as any).isDiscoveryContext).toBe('function')
    })

    it('should detect discovery context from artifacts', async () => {
      const { TestArchitectAgent } = await import('../../src/agents/roles/test-architect.agent')
      const agent = new TestArchitectAgent()

      const stateWithDiscovery = {
        artifacts: [
          { metadata: { documentType: 'prd' } },
          { metadata: { documentType: 'html_mockups' } },
          { metadata: { documentType: 'technical_specification' } }
        ]
      }

      const stateWithoutDiscovery = {
        artifacts: [
          { metadata: { documentType: 'code' } }
        ]
      }

      expect((agent as any).isDiscoveryContext(stateWithDiscovery)).toBe(true)
      expect((agent as any).isDiscoveryContext(stateWithoutDiscovery)).toBe(false)
    })

    it('should detect discovery context from workflow ID', async () => {
      const { TestArchitectAgent } = await import('../../src/agents/roles/test-architect.agent')
      const agent = new TestArchitectAgent()

      const state = {
        workflow: { id: 'full_discovery_workflow' },
        artifacts: []
      }

      expect((agent as any).isDiscoveryContext(state)).toBe(true)
    })
  })

  describe('TechWriterAgent', () => {
    it('should export isDiscoveryContext method', async () => {
      const { TechWriterAgent } = await import('../../src/agents/roles/tech-writer.agent')
      const agent = new TechWriterAgent()
      expect(typeof (agent as any).isDiscoveryContext).toBe('function')
    })

    it('should detect discovery context from artifacts', async () => {
      const { TechWriterAgent } = await import('../../src/agents/roles/tech-writer.agent')
      const agent = new TechWriterAgent()

      const stateWithDiscovery = {
        artifacts: [
          { metadata: { documentType: 'prd' } },
          { metadata: { documentType: 'html_mockups' } },
          { metadata: { documentType: 'technical_specification' } }
        ]
      }

      expect((agent as any).isDiscoveryContext(stateWithDiscovery)).toBe(true)
    })

    it('should NOT detect discovery with fewer than 2 discovery artifacts', async () => {
      const { TechWriterAgent } = await import('../../src/agents/roles/tech-writer.agent')
      const agent = new TechWriterAgent()

      const state = {
        artifacts: [
          { metadata: { documentType: 'prd' } }
        ]
      }

      expect((agent as any).isDiscoveryContext(state)).toBe(false)
    })
  })

  describe('BusinessAnalystAgent', () => {
    it('should include documentType prd in artifact metadata', async () => {
      // Verify the source code contains documentType: 'prd'
      const raw = await (jest.requireActual('fs/promises') as typeof import('fs/promises'))
        .readFile(
          path.join(__dirname, '../../src/agents/roles/business-analyst.agent.ts'),
          'utf-8'
        )
      expect(raw).toContain("documentType: 'prd'")
    })
  })

  describe('DataArchitectAgent', () => {
    it('should include documentType database_schema in artifact metadata', async () => {
      const raw = await (jest.requireActual('fs/promises') as typeof import('fs/promises'))
        .readFile(
          path.join(__dirname, '../../src/agents/roles/data-architect.agent.ts'),
          'utf-8'
        )
      expect(raw).toContain("documentType: 'database_schema'")
    })
  })

  describe('APIDesignerAgent', () => {
    it('should include documentType api_design in artifact metadata', async () => {
      const raw = await (jest.requireActual('fs/promises') as typeof import('fs/promises'))
        .readFile(
          path.join(__dirname, '../../src/agents/roles/api-designer.agent.ts'),
          'utf-8'
        )
      expect(raw).toContain("documentType: 'api_design'")
    })
  })
})

describe('Parallel execution at order 5', () => {
  it('DataArchitectAgent and APIDesignerAgent run at same order', () => {
    // Already validated in structure test, but explicit check
    const order5Steps = workflow.steps.filter((s: any) => s.order === 5)
    expect(order5Steps).toHaveLength(2)

    const dataArchStep = order5Steps.find((s: any) => s.role_id === 'data-architect')
    const apiDesignStep = order5Steps.find((s: any) => s.role_id === 'api-designer')

    expect(dataArchStep).toBeDefined()
    expect(apiDesignStep).toBeDefined()
    expect(dataArchStep.parallel_with).toContain('api-designer')
    expect(apiDesignStep.parallel_with).toContain('data-architect')
  })

  // Use a module-scoped variable to hold workflow for this describe block
  let workflow: any
  beforeAll(async () => {
    const raw = await (jest.requireActual('fs/promises') as typeof import('fs/promises'))
      .readFile(WORKFLOW_PATH, 'utf-8')
    workflow = JSON.parse(raw)
  })
})
