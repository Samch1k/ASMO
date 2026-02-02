/**
 * Tests for Validation
 */

// Uses Jest globals (describe, it, expect, beforeEach)
import { z } from 'zod'
import {
  InputValidator,
  OutputValidator,
  getInputValidator,
  getOutputValidator,
  resetValidators,
  withValidation,
  ValidationError,
  TaskInputSchema,
  AgentOutputSchema
} from '../../src/orchestration/reliability/validation'

describe('InputValidator', () => {
  beforeEach(() => {
    resetValidators()
  })

  describe('Singleton', () => {
    it('should return the same instance', () => {
      const instance1 = getInputValidator()
      const instance2 = getInputValidator()
      expect(instance1).toBe(instance2)
    })
  })

  describe('Task Input Validation', () => {
    it('should validate valid task input', () => {
      const validator = new InputValidator()

      const input = {
        id: 'task-1',
        description: 'Test task description'
      }

      const result = validator.validateTaskInput(input)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.id).toBe('task-1')
    })

    it('should reject task without id', () => {
      const validator = new InputValidator()

      const input = {
        description: 'Test task description'
      }

      const result = validator.validateTaskInput(input)

      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errorMessage).toContain('id')
    })

    it('should reject task without description', () => {
      const validator = new InputValidator()

      const input = {
        id: 'task-1'
      }

      const result = validator.validateTaskInput(input)

      expect(result.success).toBe(false)
      expect(result.errorMessage).toContain('description')
    })

    it('should reject empty id', () => {
      const validator = new InputValidator()

      const input = {
        id: '',
        description: 'Test task'
      }

      const result = validator.validateTaskInput(input)

      expect(result.success).toBe(false)
    })

    it('should validate task with complexity', () => {
      const validator = new InputValidator()

      const input = {
        id: 'task-1',
        description: 'Test task',
        complexity: {
          score: 50,
          level: 'medium' as const
        }
      }

      const result = validator.validateTaskInput(input)

      expect(result.success).toBe(true)
      expect(result.data?.complexity?.score).toBe(50)
    })

    it('should reject invalid complexity score', () => {
      const validator = new InputValidator()

      const input = {
        id: 'task-1',
        description: 'Test task',
        complexity: {
          score: 150, // Invalid: > 100
          level: 'medium' as const
        }
      }

      const result = validator.validateTaskInput(input)

      expect(result.success).toBe(false)
    })

    it('should reject invalid complexity level', () => {
      const validator = new InputValidator()

      const input = {
        id: 'task-1',
        description: 'Test task',
        complexity: {
          score: 50,
          level: 'invalid' as any
        }
      }

      const result = validator.validateTaskInput(input)

      expect(result.success).toBe(false)
    })

    it('should validate optional fields', () => {
      const validator = new InputValidator()

      const input = {
        id: 'task-1',
        description: 'Test task',
        taskType: 'feature',
        preferredAgent: 'architect',
        preferredModel: 'opus' as const,
        requiredSkills: ['coding', 'testing'],
        context: { key: 'value' },
        parentTaskId: 'parent-1'
      }

      const result = validator.validateTaskInput(input)

      expect(result.success).toBe(true)
      expect(result.data?.preferredModel).toBe('opus')
    })

    it('should reject invalid preferredModel', () => {
      const validator = new InputValidator()

      const input = {
        id: 'task-1',
        description: 'Test task',
        preferredModel: 'invalid' as any
      }

      const result = validator.validateTaskInput(input)

      expect(result.success).toBe(false)
    })
  })

  describe('Custom Validation', () => {
    it('should validate with custom schema', () => {
      const validator = new InputValidator()

      const customSchema = z.object({
        name: z.string(),
        age: z.number().min(0).max(120)
      })

      const input = { name: 'John', age: 30 }
      const result = validator.validateCustom(customSchema, input)

      expect(result.success).toBe(true)
      expect(result.data?.name).toBe('John')
    })

    it('should reject invalid custom data', () => {
      const validator = new InputValidator()

      const customSchema = z.object({
        name: z.string(),
        age: z.number().min(0).max(120)
      })

      const input = { name: 'John', age: 150 }
      const result = validator.validateCustom(customSchema, input)

      expect(result.success).toBe(false)
    })
  })
})

describe('OutputValidator', () => {
  beforeEach(() => {
    resetValidators()
  })

  describe('Singleton', () => {
    it('should return the same instance', () => {
      const instance1 = getOutputValidator()
      const instance2 = getOutputValidator()
      expect(instance1).toBe(instance2)
    })
  })

  describe('Agent Output Validation', () => {
    it('should validate valid output', () => {
      const validator = new OutputValidator()

      const output = {
        task: 'Completed task',
        messages: [],
        context: { result: 'success' }
      }

      const result = validator.validateAgentOutput(output)

      expect(result.success).toBe(true)
    })

    it('should validate output with artifacts', () => {
      const validator = new OutputValidator()

      const output = {
        task: 'Task with artifacts',
        artifacts: [
          {
            type: 'code',
            name: 'main.ts',
            content: 'console.log("hello")',
            metadata: { language: 'typescript' }
          }
        ]
      }

      const result = validator.validateAgentOutput(output)

      expect(result.success).toBe(true)
      expect(result.data?.artifacts).toHaveLength(1)
    })

    it('should reject invalid artifact (missing type)', () => {
      const validator = new OutputValidator()

      const output = {
        task: 'Task',
        artifacts: [
          {
            name: 'file.txt',
            content: 'content'
          }
        ]
      }

      const result = validator.validateAgentOutput(output)

      expect(result.success).toBe(false)
    })

    it('should validate deliverables', () => {
      const validator = new OutputValidator()

      const output = {
        task: 'Task',
        deliverables: ['doc1.md', 'doc2.md']
      }

      const result = validator.validateAgentOutput(output)

      expect(result.success).toBe(true)
      expect(result.data?.deliverables).toHaveLength(2)
    })
  })

  describe('Execution Result Validation', () => {
    it('should validate successful result', () => {
      const validator = new OutputValidator()

      const result = {
        success: true,
        output: { task: 'Done' },
        metrics: {
          duration: 1000,
          mode: 'session' as const
        }
      }

      const validationResult = validator.validateExecutionResult(result)

      expect(validationResult.success).toBe(true)
    })

    it('should validate failed result', () => {
      const validator = new OutputValidator()

      const result = {
        success: false,
        error: 'Something went wrong',
        metrics: {
          duration: 500,
          mode: 'api' as const,
          model: 'sonnet',
          inputTokens: 100,
          outputTokens: 50,
          estimatedCost: 0.001
        }
      }

      const validationResult = validator.validateExecutionResult(result)

      expect(validationResult.success).toBe(true)
    })

    it('should reject invalid mode', () => {
      const validator = new OutputValidator()

      const result = {
        success: true,
        metrics: {
          duration: 1000,
          mode: 'invalid' as any
        }
      }

      const validationResult = validator.validateExecutionResult(result)

      expect(validationResult.success).toBe(false)
    })
  })
})

describe('withValidation', () => {
  it('should validate input and output', async () => {
    const inputSchema = z.object({
      value: z.number()
    })

    const outputSchema = z.object({
      doubled: z.number()
    })

    const fn = async (input: { value: number }) => ({
      doubled: input.value * 2
    })

    const validatedFn = withValidation(inputSchema, outputSchema, fn)

    const result = await validatedFn({ value: 5 })
    expect(result.doubled).toBe(10)
  })

  it('should throw ValidationError for invalid input', async () => {
    const inputSchema = z.object({
      value: z.number()
    })

    const outputSchema = z.object({
      doubled: z.number()
    })

    const fn = async (input: { value: number }) => ({
      doubled: input.value * 2
    })

    const validatedFn = withValidation(inputSchema, outputSchema, fn)

    await expect(
      validatedFn({ value: 'not a number' })
    ).rejects.toThrow(ValidationError)
  })

  it('should throw ValidationError for invalid output', async () => {
    const inputSchema = z.object({
      value: z.number()
    })

    const outputSchema = z.object({
      doubled: z.number()
    })

    const fn = async (_input: { value: number }) => ({
      doubled: 'not a number' as any
    })

    const validatedFn = withValidation(inputSchema, outputSchema, fn)

    await expect(
      validatedFn({ value: 5 })
    ).rejects.toThrow(ValidationError)
  })

  it('should include zod error in ValidationError', async () => {
    const inputSchema = z.object({
      value: z.number()
    })

    const outputSchema = z.object({
      result: z.string()
    })

    const fn = async (input: { value: number }) => ({
      result: String(input.value)
    })

    const validatedFn = withValidation(inputSchema, outputSchema, fn)

    try {
      await validatedFn({ value: 'invalid' })
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError)
      expect((error as ValidationError).zodError).toBeDefined()
    }
  })
})

describe('Schemas', () => {
  describe('TaskInputSchema', () => {
    it('should parse valid input', () => {
      const result = TaskInputSchema.safeParse({
        id: 'test',
        description: 'Test description'
      })

      expect(result.success).toBe(true)
    })

    it('should have correct type inference', () => {
      const validInput = {
        id: 'test',
        description: 'Test'
      }

      const result = TaskInputSchema.parse(validInput)

      // TypeScript should infer these types
      const _id: string = result.id
      const _description: string = result.description

      expect(_id).toBe('test')
      expect(_description).toBe('Test')
    })
  })

  describe('AgentOutputSchema', () => {
    it('should allow empty object', () => {
      const result = AgentOutputSchema.safeParse({})

      expect(result.success).toBe(true)
    })

    it('should parse full output', () => {
      const result = AgentOutputSchema.safeParse({
        task: 'Done',
        messages: [],
        context: {},
        artifacts: [
          { type: 'file', name: 'test.ts', content: '' }
        ],
        deliverables: ['output.md']
      })

      expect(result.success).toBe(true)
    })
  })
})
