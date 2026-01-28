import { BusinessAnalystAgent, ProjectManagerAgent, ProductOwnerAgent } from '../../src'

describe('Business Domain Roles', () => {
  describe('imports', () => {
    it('should import BusinessAnalystAgent', () => {
      expect(BusinessAnalystAgent).toBeDefined()
      expect(typeof BusinessAnalystAgent).toBe('function')
    })

    it('should import ProjectManagerAgent', () => {
      expect(ProjectManagerAgent).toBeDefined()
      expect(typeof ProjectManagerAgent).toBe('function')
    })

    it('should import ProductOwnerAgent', () => {
      expect(ProductOwnerAgent).toBeDefined()
      expect(typeof ProductOwnerAgent).toBe('function')
    })
  })
})
