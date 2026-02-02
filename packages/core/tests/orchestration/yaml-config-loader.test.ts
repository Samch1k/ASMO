/**
 * YamlConfigLoader Tests
 * Tests for YAML configuration loading and model selection
 */

import {
  YamlConfigLoader,
  getYamlConfigLoader,
  resetYamlConfigLoader
} from '../../src/orchestration/config/yaml-config-loader'

describe('YamlConfigLoader', () => {
  beforeEach(() => {
    resetYamlConfigLoader()
  })

  describe('singleton', () => {
    it('should return singleton instance', () => {
      const loader1 = getYamlConfigLoader()
      const loader2 = getYamlConfigLoader()

      expect(loader1).toBe(loader2)
    })

    it('should reset singleton', () => {
      const loader1 = getYamlConfigLoader()
      resetYamlConfigLoader()
      const loader2 = getYamlConfigLoader()

      expect(loader1).not.toBe(loader2)
    })
  })

  describe('loadAgentsConfig', () => {
    it('should load agents configuration', () => {
      const loader = new YamlConfigLoader()
      const config = loader.loadAgentsConfig()

      expect(config).toBeDefined()
      expect(config.version).toBeDefined()
      expect(config.agents).toBeDefined()
    })

    it('should cache loaded config', () => {
      const loader = new YamlConfigLoader()

      const config1 = loader.loadAgentsConfig()
      const config2 = loader.loadAgentsConfig()

      expect(config1).toBe(config2)
    })

    it('should contain expected agents', () => {
      const loader = new YamlConfigLoader()
      const config = loader.loadAgentsConfig()

      expect(config.agents.architect).toBeDefined()
      expect(config.agents.developer).toBeDefined()
    })
  })

  describe('loadModelsConfig', () => {
    it('should load models configuration', () => {
      const loader = new YamlConfigLoader()
      const config = loader.loadModelsConfig()

      expect(config).toBeDefined()
      expect(config.models).toBeDefined()
    })

    it('should contain model tiers', () => {
      const loader = new YamlConfigLoader()
      const config = loader.loadModelsConfig()

      expect(config.models.opus).toBeDefined()
      expect(config.models.sonnet).toBeDefined()
      expect(config.models.haiku).toBeDefined()
    })

    it('should include routing configuration', () => {
      const loader = new YamlConfigLoader()
      const config = loader.loadModelsConfig()

      expect(config.routing).toBeDefined()
      expect(config.routing.default_model).toBeDefined()
    })
  })

  describe('getAgent', () => {
    it('should return agent by id', () => {
      const loader = new YamlConfigLoader()
      const agent = loader.getAgent('architect')

      expect(agent).toBeDefined()
      expect(agent?.id).toBe('architect')
      expect(agent?.name).toBe('Architect')
    })

    it('should return undefined for unknown agent', () => {
      const loader = new YamlConfigLoader()
      const agent = loader.getAgent('unknown-agent')

      expect(agent).toBeUndefined()
    })

    it('should include agent skills', () => {
      const loader = new YamlConfigLoader()
      const agent = loader.getAgent('architect')

      expect(agent?.skills).toBeDefined()
      expect(Array.isArray(agent?.skills)).toBe(true)
    })

    it('should include agent role', () => {
      const loader = new YamlConfigLoader()
      const agent = loader.getAgent('architect')

      expect(agent?.role).toBeDefined()
      expect(agent?.role.id).toBe('architect')
    })
  })

  describe('getAllAgents', () => {
    it('should return all agents', () => {
      const loader = new YamlConfigLoader()
      const agents = loader.getAllAgents()

      expect(Array.isArray(agents)).toBe(true)
      expect(agents.length).toBeGreaterThan(0)
    })

    it('should return agents with required properties', () => {
      const loader = new YamlConfigLoader()
      const agents = loader.getAllAgents()

      agents.forEach(agent => {
        expect(agent.id).toBeDefined()
        expect(agent.name).toBeDefined()
        expect(agent.model_preference).toBeDefined()
      })
    })
  })

  describe('getAgentsByGroup', () => {
    it('should return agents by group', () => {
      const loader = new YamlConfigLoader()
      const coreAgents = loader.getAgentsByGroup('core')

      expect(Array.isArray(coreAgents)).toBe(true)
    })

    it('should return empty array for unknown group', () => {
      const loader = new YamlConfigLoader()
      const agents = loader.getAgentsByGroup('unknown-group')

      expect(agents).toEqual([])
    })
  })

  describe('getAgentsBySkill', () => {
    it('should return agents with specific skill', () => {
      const loader = new YamlConfigLoader()
      const agents = loader.getAgentsBySkill('system_design')

      expect(Array.isArray(agents)).toBe(true)
      // Architect should have system_design skill
      const hasArchitect = agents.some(a => a.id === 'architect')
      expect(hasArchitect).toBe(true)
    })

    it('should return empty array for unknown skill', () => {
      const loader = new YamlConfigLoader()
      const agents = loader.getAgentsBySkill('unknown-skill')

      expect(agents).toEqual([])
    })
  })

  describe('selectModelForTask', () => {
    it('should select haiku for simple tasks', () => {
      const loader = new YamlConfigLoader()
      const model = loader.selectModelForTask(undefined, 20)

      expect(model).toBe('haiku')
    })

    it('should select sonnet for medium tasks', () => {
      const loader = new YamlConfigLoader()
      const model = loader.selectModelForTask(undefined, 50)

      expect(model).toBe('sonnet')
    })

    it('should select opus for complex tasks', () => {
      const loader = new YamlConfigLoader()
      const model = loader.selectModelForTask(undefined, 85)

      expect(model).toBe('opus')
    })

    it('should apply task type overrides', () => {
      const loader = new YamlConfigLoader()

      // quick_fix should always use haiku
      const model = loader.selectModelForTask('quick_fix', 50)
      expect(model).toBe('haiku')
    })

    it('should use default model when no score provided', () => {
      const loader = new YamlConfigLoader()
      const model = loader.selectModelForTask()

      // Should return default model (sonnet)
      expect(['opus', 'sonnet', 'haiku']).toContain(model)
    })
  })

  describe('getModel', () => {
    it('should return model with characteristics', () => {
      const loader = new YamlConfigLoader()
      const model = loader.getModel('sonnet')

      expect(model).toBeDefined()
      expect(model?.characteristics).toBeDefined()
      expect(model?.characteristics?.reasoning).toBeDefined()
      expect(model?.characteristics?.speed).toBeDefined()
      expect(model?.characteristics?.cost).toBeDefined()
    })

    it('should return undefined for unknown model', () => {
      const loader = new YamlConfigLoader()
      const model = loader.getModel('unknown' as any)

      expect(model).toBeUndefined()
    })
  })
})
