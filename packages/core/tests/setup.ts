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
jest.mock('../src/llm/provider-factory', () => {
  const mockGenerate = jest.fn().mockResolvedValue({
    content: JSON.stringify({
      summary: 'Mock analysis result',
      keyFindings: ['Finding 1', 'Finding 2'],
      recommendations: ['Recommendation 1', 'Recommendation 2']
    }),
    model: 'mock-model',
    duration: 100,
    provider: 'mock'
  })

  const mockGenerateJSON = jest.fn().mockImplementation(async () => ({
    summary: 'Mock analysis result',
    keyFindings: ['Finding 1', 'Finding 2'],
    recommendations: ['Recommendation 1', 'Recommendation 2']
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
