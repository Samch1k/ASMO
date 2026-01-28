import { DesignValidatorAgent, MergeAgent, PostDeployMonitorAgent, RequirementsValidatorAgent } from '../../src'

describe('Validation and Coordination Roles', () => {
  describe('imports', () => {
    it('should import DesignValidatorAgent', () => {
      expect(DesignValidatorAgent).toBeDefined()
      expect(typeof DesignValidatorAgent).toBe('function')
    })

    it('should import MergeAgent', () => {
      expect(MergeAgent).toBeDefined()
      expect(typeof MergeAgent).toBe('function')
    })

    it('should import PostDeployMonitorAgent', () => {
      expect(PostDeployMonitorAgent).toBeDefined()
      expect(typeof PostDeployMonitorAgent).toBe('function')
    })

    it('should import RequirementsValidatorAgent', () => {
      expect(RequirementsValidatorAgent).toBeDefined()
      expect(typeof RequirementsValidatorAgent).toBe('function')
    })
  })
})
