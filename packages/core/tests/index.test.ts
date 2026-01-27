/**
 * Package exports smoke tests
 *
 * Verify that the main package exports are accessible
 */

describe('Package exports', () => {
  it('should export core orchestration classes', async () => {
    const exports = await import('../src/index')

    expect(exports.WorkflowEngine).toBeDefined()
    expect(exports.AgentRegistry).toBeDefined()
    expect(exports.SkillMatcher).toBeDefined()
    expect(exports.PhaseManager).toBeDefined()
  })

  it('should export base agent classes', async () => {
    const exports = await import('../src/index')

    expect(exports.BaseAgent).toBeDefined()
  })

  it('should export agent roles', async () => {
    const exports = await import('../src/index')

    expect(exports.ArchitectAgent).toBeDefined()
    expect(exports.DeveloperAgent).toBeDefined()
    expect(exports.TesterAgent).toBeDefined()
  })

  it('should export configuration classes', async () => {
    const exports = await import('../src/index')

    expect(exports.ConfigManager).toBeDefined()
    expect(exports.ConfigLoader).toBeDefined()
  })
})
