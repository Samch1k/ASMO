/**
 * APIExecutor Tests
 * Tests for API-based execution mode (Anthropic API direct calls)
 */

import {
  APIExecutor,
  getAPIExecutor,
  resetAPIExecutor,
  type APIExecutionContext
} from '../../src/orchestration/execution/api-executor'
import type { AgentState } from '../../src/agents/types'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock state factory
function createMockState(): AgentState {
  return {
    task: 'Test task',
    taskType: 'testing',
    context: { key: 'value' },
    messages: [],
    agentResults: [],
    currentAgent: 'test-agent',
    mcpData: {},
    nextAction: 'continue',
    requiresApproval: false,
    artifacts: [],
    deliverables: []
  }
}

// Mock context factory
function createMockContext(overrides?: Partial<APIExecutionContext>): APIExecutionContext {
  return {
    taskId: 'task-1',
    prompt: 'Test prompt for execution',
    state: createMockState(),
    model: 'sonnet',
    ...overrides
  }
}

// Mock API response
function createMockAPIResponse(overrides?: Partial<any>): any {
  return {
    id: 'msg_123',
    type: 'message',
    role: 'assistant',
    content: [{ type: 'text', text: 'Test response from API' }],
    model: 'claude-sonnet-4-20250514',
    stop_reason: 'end_turn',
    usage: {
      input_tokens: 100,
      output_tokens: 50
    },
    ...overrides
  }
}

describe('APIExecutor', () => {
  const originalEnv = process.env

  beforeEach(() => {
    resetAPIExecutor()
    mockFetch.mockReset()
    // Set up API key for tests
    process.env = { ...originalEnv, ANTHROPIC_API_KEY: 'test-api-key' }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('singleton', () => {
    it('should return singleton instance', () => {
      const executor1 = getAPIExecutor()
      const executor2 = getAPIExecutor()

      expect(executor1).toBe(executor2)
    })

    it('should reset singleton', () => {
      const executor1 = getAPIExecutor()
      resetAPIExecutor()
      const executor2 = getAPIExecutor()

      expect(executor1).not.toBe(executor2)
    })
  })

  describe('constructor', () => {
    it('should create with default config', () => {
      const executor = new APIExecutor()
      const info = executor.getInfo()

      expect(info.mode).toBe('api')
      expect(info.provider).toBe('anthropic')
    })

    it('should accept custom config', () => {
      const executor = new APIExecutor({
        verbose: true,
        timeout: 60000,
        maxRetries: 5
      })

      expect(executor).toBeDefined()
    })
  })

  describe('execute', () => {
    it('should execute task successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createMockAPIResponse())
      })

      const executor = new APIExecutor()
      const context = createMockContext()

      const result = await executor.execute(context)

      expect(result.success).toBe(true)
      expect(result.metrics.mode).toBe('api')
      expect(result.metrics.duration).toBeGreaterThanOrEqual(0)
    })

    it('should include token counts in metrics', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createMockAPIResponse({
          usage: { input_tokens: 150, output_tokens: 75 }
        }))
      })

      const executor = new APIExecutor()
      const context = createMockContext()

      const result = await executor.execute(context)

      expect(result.metrics.inputTokens).toBe(150)
      expect(result.metrics.outputTokens).toBe(75)
    })

    it('should estimate cost in metrics', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createMockAPIResponse())
      })

      const executor = new APIExecutor()
      const context = createMockContext()

      const result = await executor.execute(context)

      expect(result.metrics.estimatedCost).toBeDefined()
      expect(result.metrics.estimatedCost).toBeGreaterThanOrEqual(0)
    })

    it('should include model in metrics', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createMockAPIResponse())
      })

      const executor = new APIExecutor()
      const context = createMockContext({ model: 'opus' })

      const result = await executor.execute(context)

      expect(result.metrics.model).toBeDefined()
    })

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error')
      })

      const executor = new APIExecutor()
      const context = createMockContext()

      const result = await executor.execute(context)

      expect(result.success).toBe(false)
      expect(result.error).toContain('API error 500')
    })

    it('should fail without API key', async () => {
      delete process.env.ANTHROPIC_API_KEY

      const executor = new APIExecutor()
      const context = createMockContext()

      const result = await executor.execute(context)

      expect(result.success).toBe(false)
      expect(result.error).toContain('API key not configured')
    })

    it('should include raw response in result', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createMockAPIResponse())
      })

      const executor = new APIExecutor()
      const context = createMockContext()

      const result = await executor.execute(context)

      expect(result.rawResponse).toBeDefined()
      expect(JSON.parse(result.rawResponse!)).toHaveProperty('id')
    })

    it('should mark output with API execution context', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createMockAPIResponse({ id: 'msg_test_123' }))
      })

      const executor = new APIExecutor()
      const context = createMockContext()

      const result = await executor.execute(context)

      expect(result.output!.context!._apiExecution).toBe(true)
      expect(result.output!.context!._responseId).toBe('msg_test_123')
    })
  })

  describe('isAvailable', () => {
    it('should return true when API key is set', () => {
      process.env.ANTHROPIC_API_KEY = 'test-key'
      const executor = new APIExecutor()

      expect(executor.isAvailable()).toBe(true)
    })

    it('should return false when API key is not set', () => {
      delete process.env.ANTHROPIC_API_KEY
      const executor = new APIExecutor()

      expect(executor.isAvailable()).toBe(false)
    })

    it('should return true when API key is in config', () => {
      delete process.env.ANTHROPIC_API_KEY
      const executor = new APIExecutor({ apiKey: 'config-key' })

      expect(executor.isAvailable()).toBe(true)
    })
  })

  describe('getInfo', () => {
    it('should return executor info', () => {
      const executor = new APIExecutor()
      const info = executor.getInfo()

      expect(info.mode).toBe('api')
      expect(info.provider).toBe('anthropic')
      expect(info.cost).toContain('token')
      expect(info.description).toBeTruthy()
      expect(typeof info.available).toBe('boolean')
    })
  })

  describe('updateConfig', () => {
    it('should update configuration', () => {
      const executor = new APIExecutor({ verbose: false })

      executor.updateConfig({ verbose: true, timeout: 30000 })

      // Config was updated - verify by behavior
      expect(executor).toBeDefined()
    })
  })

  describe('API request building', () => {
    it('should include system prompt when provided', async () => {
      let capturedRequest: any
      mockFetch.mockImplementation(async (_url, options) => {
        capturedRequest = JSON.parse(options.body)
        return {
          ok: true,
          json: () => Promise.resolve(createMockAPIResponse())
        }
      })

      const executor = new APIExecutor()
      const context = createMockContext({
        systemPrompt: 'You are a helpful assistant.'
      })

      await executor.execute(context)

      expect(capturedRequest.system).toBe('You are a helpful assistant.')
    })

    it('should send proper headers', async () => {
      let capturedOptions: any
      mockFetch.mockImplementation(async (_url, options) => {
        capturedOptions = options
        return {
          ok: true,
          json: () => Promise.resolve(createMockAPIResponse())
        }
      })

      const executor = new APIExecutor()
      const context = createMockContext()

      await executor.execute(context)

      expect(capturedOptions.headers['Content-Type']).toBe('application/json')
      expect(capturedOptions.headers['x-api-key']).toBe('test-api-key')
      expect(capturedOptions.headers['anthropic-version']).toBe('2023-06-01')
    })

    it('should include prompt in messages', async () => {
      let capturedRequest: any
      mockFetch.mockImplementation(async (_url, options) => {
        capturedRequest = JSON.parse(options.body)
        return {
          ok: true,
          json: () => Promise.resolve(createMockAPIResponse())
        }
      })

      const executor = new APIExecutor()
      const context = createMockContext({ prompt: 'Execute this task' })

      await executor.execute(context)

      const lastMessage = capturedRequest.messages[capturedRequest.messages.length - 1]
      expect(lastMessage.role).toBe('user')
      expect(lastMessage.content).toBe('Execute this task')
    })
  })

  describe('verbose mode', () => {
    it('should log when verbose is enabled', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createMockAPIResponse())
      })

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      const executor = new APIExecutor({ verbose: true })
      const context = createMockContext()

      await executor.execute(context)

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('API key handling', () => {
    it('should use environment variable API key', async () => {
      process.env.ANTHROPIC_API_KEY = 'env-api-key'
      let capturedOptions: any
      mockFetch.mockImplementation(async (_url, options) => {
        capturedOptions = options
        return {
          ok: true,
          json: () => Promise.resolve(createMockAPIResponse())
        }
      })

      const executor = new APIExecutor()
      const context = createMockContext()

      await executor.execute(context)

      expect(capturedOptions.headers['x-api-key']).toBe('env-api-key')
    })

    it('should use config API key when provided', async () => {
      delete process.env.ANTHROPIC_API_KEY
      let capturedOptions: any
      mockFetch.mockImplementation(async (_url, options) => {
        capturedOptions = options
        return {
          ok: true,
          json: () => Promise.resolve(createMockAPIResponse())
        }
      })

      const executor = new APIExecutor({ apiKey: 'config-api-key' })
      const context = createMockContext()

      await executor.execute(context)

      expect(capturedOptions.headers['x-api-key']).toBe('config-api-key')
    })

    it('should resolve env var reference in config', async () => {
      process.env.MY_CUSTOM_KEY = 'my-custom-api-key'
      let capturedOptions: any
      mockFetch.mockImplementation(async (_url, options) => {
        capturedOptions = options
        return {
          ok: true,
          json: () => Promise.resolve(createMockAPIResponse())
        }
      })

      const executor = new APIExecutor({ apiKey: '$MY_CUSTOM_KEY' })
      const context = createMockContext()

      await executor.execute(context)

      expect(capturedOptions.headers['x-api-key']).toBe('my-custom-api-key')
    })
  })
})
