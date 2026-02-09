/**
 * Jest setup file
 * Mocks external services that require API keys
 */

import * as path from 'path'

// Mock fs/promises for workflow config files
jest.mock('fs/promises', () => {
  const actual = jest.requireActual('fs/promises')
  return {
    ...actual,
    readFile: jest.fn(async (filePath: string, encoding?: string) => {
      // If trying to read from .cursor/config, redirect to templates
      if (typeof filePath === 'string' && filePath.includes('.cursor/config/orchestration/workflows')) {
        const relativePath = filePath.split('.cursor/config/orchestration/workflows')[1]
        const templatesPath = path.join(
          __dirname,
          '../templates/workflows',
          relativePath || ''
        )
        try {
          return actual.readFile(templatesPath, encoding)
        } catch {
          // If templates path fails, return empty workflow config
          if (filePath.endsWith('workflows.json')) {
            return JSON.stringify({ workflows: [], global_settings: {} })
          }
          throw new Error(`ENOENT: no such file or directory, open '${filePath}'`)
        }
      }
      return actual.readFile(filePath, encoding)
    }),
    access: jest.fn(async (filePath: string) => {
      // Redirect .cursor config checks to templates
      if (typeof filePath === 'string' && filePath.includes('.cursor/config/orchestration/workflows')) {
        const relativePath = filePath.split('.cursor/config/orchestration/workflows')[1]
        const templatesPath = path.join(
          __dirname,
          '../templates/workflows',
          relativePath || ''
        )
        return actual.access(templatesPath)
      }
      return actual.access(filePath)
    }),
    readdir: jest.fn(async (dirPath: string, options?: any) => {
      // Redirect .cursor config directory reads to templates
      if (typeof dirPath === 'string' && dirPath.includes('.cursor/config/orchestration/workflows')) {
        const relativePath = dirPath.split('.cursor/config/orchestration/workflows')[1]
        const templatesPath = path.join(
          __dirname,
          '../templates/workflows',
          relativePath || ''
        )
        return actual.readdir(templatesPath, options)
      }
      return actual.readdir(dirPath, options)
    }),
    stat: jest.fn(async (filePath: string) => {
      // Redirect .cursor config stat checks to templates
      if (typeof filePath === 'string' && filePath.includes('.cursor/config/orchestration/workflows')) {
        const relativePath = filePath.split('.cursor/config/orchestration/workflows')[1]
        const templatesPath = path.join(
          __dirname,
          '../templates/workflows',
          relativePath || ''
        )
        return actual.stat(templatesPath)
      }
      return actual.stat(filePath)
    })
  }
})

// Mock LLM provider for tests
// Returns a mock provider that works for all test types
jest.mock('../src/llm/provider-factory', () => {
  // Smart mock that analyzes prompt content and returns appropriate complexity
  const mockGenerate = jest.fn().mockImplementation(async (prompt: string) => {
    const promptLower = prompt.toLowerCase()
    
    // Check if this is a complexity analysis prompt
    if (promptLower.includes('complexity') || promptLower.includes('analyze the task') || promptLower.includes('task:')) {
      // Extract only the task description to match against, not the template text
      let taskText = prompt.toLowerCase()
      const tdIndex = prompt.indexOf('Task Description:')
      if (tdIndex !== -1) {
        const afterTD = prompt.substring(tdIndex + 'Task Description:'.length).trimStart()
        const endIndex = afterTD.search(/\n\n|\nProject Context:|\nAnalyze the following/)
        taskText = (endIndex !== -1 ? afterTD.substring(0, endIndex) : afterTD).toLowerCase().trim()
      }

      // Determine complexity based on keywords in the task description
      let score = 30  // default simple
      let level = 'simple'
      let recommendedAgents = ['developer', 'tester']
      let riskLevel = 'low'
      let securityImpact = false
      let dataChanges = false
      let filesAffected = 1
      let dependencies = 0
      let domainExpertiseRequired = false

      // Detect presence of keywords for priority-based classification
      const hasBugFix = taskText.includes('bug') || taskText.includes('fix') || taskText.includes('error')
      const hasTrivial = taskText.includes('typo') || taskText.includes('rename') ||
                         taskText.includes('comment') || taskText.includes('readme') ||
                         taskText.includes('documentation') || taskText.includes('doc')
      const hasPerformance = taskText.includes('performance') || taskText.includes('optimiz')

      // Trivial tasks (score: 5-15) - highest priority
      if (hasTrivial) {
        score = 10
        level = 'trivial'
        recommendedAgents = ['developer']
      }
      // Bug fixes (score: 25-35) - check before medium to avoid "fix X in Y page" matching medium
      else if (hasBugFix && !taskText.includes('refactor') && !taskText.includes('migrate')) {
        score = 30
        level = 'simple'
        recommendedAgents = ['debugger', 'tester']
      }
      // Enterprise (score: 85-100)
      else if (taskText.includes('microservice') || taskText.includes('entire platform') ||
          taskText.includes('enterprise') ||
          (taskText.includes('architecture') && taskText.includes('design'))) {
        score = 90
        level = 'enterprise'
        recommendedAgents = ['architect', 'developer', 'devops', 'tester']
        riskLevel = 'high'
        filesAffected = 20
        dependencies = 10
        dataChanges = true
        domainExpertiseRequired = true
      }
      // Complex tasks (score: 65-80)
      else if (taskText.includes('security') || taskText.includes('oauth') ||
               taskText.includes('authentication') || taskText.includes('refactor') ||
               taskText.includes('migrate') || taskText.includes('migration') ||
               (taskText.includes('database') && (taskText.includes('migration') || taskText.includes('schema')))) {
        score = 70
        level = 'complex'
        recommendedAgents = ['architect', 'developer', 'tester', 'security']
        riskLevel = 'high'
        securityImpact = taskText.includes('security') || taskText.includes('auth') || taskText.includes('oauth')
        dataChanges = taskText.includes('database') || taskText.includes('migration') || taskText.includes('migrate')
        filesAffected = 10
        dependencies = 5
        domainExpertiseRequired = true
      }
      // Medium complexity (score: 45-55)
      else if (taskText.includes('feature') || taskText.includes('implement') ||
               taskText.includes('add') || taskText.includes('page') ||
               taskText.includes('upload') || taskText.includes('profile') ||
               hasPerformance ||
               taskText.includes('api') || taskText.includes('endpoint')) {
        score = hasPerformance ? 55 : 50
        level = 'medium'
        recommendedAgents = ['developer', 'tester', 'architect']
        filesAffected = 5
        dependencies = 2
        domainExpertiseRequired = hasPerformance
      }

      // Set performanceImpact based on keywords, not just score
      const performanceImpact = hasPerformance || score > 70

      return {
        content: JSON.stringify({
          score,
          confidence: 0.85,
          reasoning: `Complexity level: ${level} (score: ${score}/100).`,
          recommendedAgents,
          factors: {
            filesAffected,
            dependencies,
            riskLevel,
            domainExpertiseRequired,
            estimatedLOC: score * 5,
            dataChanges,
            securityImpact,
            performanceImpact
          }
        }),
        model: 'mock-model',
        duration: 100,
        provider: 'mock'
      }
    }
    // Default generic response for other prompts
    return {
      content: JSON.stringify({
        summary: 'Mock analysis result',
        keyFindings: ['Finding 1', 'Finding 2'],
        recommendations: ['Recommendation 1']
      }),
      model: 'mock-model',
      duration: 100,
      provider: 'mock'
    }
  })

  const mockGenerateJSON = jest.fn().mockImplementation(async () => ({
    summary: 'Mock analysis result',
    keyFindings: ['Finding 1'],
    recommendations: ['Recommendation 1']
  }))

  const mockProvider = {
    id: 'mock',
    name: 'Mock Provider',
    cost: '$0',
    isAvailable: jest.fn().mockReturnValue(true),
    generate: mockGenerate,
    generateJSON: mockGenerateJSON
  }

  return {
    getLLMProvider: jest.fn().mockReturnValue(mockProvider),
    getLLMProviderFactory: jest.fn().mockReturnValue({
      getProvider: jest.fn().mockReturnValue(mockProvider),
      hasAvailableProvider: jest.fn().mockReturnValue(true),
      getProviderStatus: jest.fn().mockReturnValue([])
    }),
    resetLLMProviderFactory: jest.fn(),
    printProviderStatus: jest.fn(),
    LLMProviderFactory: jest.fn().mockReturnValue({
      getProvider: jest.fn().mockReturnValue(mockProvider),
      hasAvailableProvider: jest.fn().mockReturnValue(true),
      getProviderStatus: jest.fn().mockReturnValue([])
    })
  }
})

// Suppress console during tests
const originalConsoleLog = console.log
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

beforeAll(() => {
  // Optionally suppress console output during tests
  if (process.env.JEST_SILENT === 'true') {
    console.log = jest.fn()
    console.error = jest.fn()
    console.warn = jest.fn()
  }
})

afterAll(() => {
  console.log = originalConsoleLog
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
})
