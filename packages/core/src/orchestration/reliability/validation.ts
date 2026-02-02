/**
 * Validation - Zod-based input/output validation
 *
 * Provides schema validation for agent inputs and outputs.
 */

import { z } from 'zod'

// =============================================================================
// COMMON SCHEMAS
// =============================================================================

/**
 * Task input schema
 */
export const TaskInputSchema = z.object({
  id: z.string().min(1, 'Task ID is required'),
  description: z.string().min(1, 'Task description is required'),
  taskType: z.string().optional(),
  complexity: z.object({
    score: z.number().min(0).max(100),
    level: z.enum(['trivial', 'simple', 'medium', 'complex', 'enterprise'])
  }).optional(),
  requiredSkills: z.array(z.string()).optional(),
  preferredAgent: z.string().optional(),
  preferredModel: z.enum(['opus', 'sonnet', 'haiku']).optional(),
  context: z.record(z.string(), z.unknown()).optional(),
  parentTaskId: z.string().optional()
})

export type ValidatedTaskInput = z.infer<typeof TaskInputSchema>

/**
 * Agent state schema
 */
export const AgentStateSchema = z.object({
  task: z.string().min(1),
  taskType: z.enum([
    'bug_fix', 'feature', 'optimization', 'architecture',
    'deployment', 'testing', 'documentation', 'review'
  ]),
  context: z.record(z.string(), z.unknown()),
  messages: z.array(z.any()),  // BaseMessage is complex
  currentAgent: z.string(),
  agentResults: z.array(z.any()),
  mcpData: z.record(z.string(), z.any()),
  nextAction: z.string(),
  requiresApproval: z.boolean()
})

export type ValidatedAgentState = z.infer<typeof AgentStateSchema>

/**
 * Agent output schema
 */
export const AgentOutputSchema = z.object({
  task: z.string().optional(),
  messages: z.array(z.any()).optional(),
  context: z.record(z.string(), z.unknown()).optional(),
  artifacts: z.array(z.object({
    type: z.string(),
    name: z.string(),
    content: z.any(),
    metadata: z.record(z.string(), z.unknown()).optional()
  })).optional(),
  deliverables: z.array(z.string()).optional()
})

export type ValidatedAgentOutput = z.infer<typeof AgentOutputSchema>

/**
 * Routing decision schema
 */
export const RoutingDecisionSchema = z.object({
  taskId: z.string(),
  taskDescription: z.string(),
  selectedModel: z.enum(['opus', 'sonnet', 'haiku']),
  selectedAgent: z.string().optional(),
  rationale: z.string(),
  complexity: z.number().optional(),
  timestamp: z.date()
})

export type ValidatedRoutingDecision = z.infer<typeof RoutingDecisionSchema>

/**
 * Execution result schema
 */
export const ExecutionResultSchema = z.object({
  success: z.boolean(),
  output: AgentOutputSchema.optional(),
  error: z.string().optional(),
  metrics: z.object({
    duration: z.number(),
    mode: z.enum(['session', 'api']),
    model: z.string().optional(),
    inputTokens: z.number().optional(),
    outputTokens: z.number().optional(),
    estimatedCost: z.number().optional()
  })
})

export type ValidatedExecutionResult = z.infer<typeof ExecutionResultSchema>

// =============================================================================
// VALIDATION RESULT
// =============================================================================

export interface ValidationResult<T> {
  success: boolean
  data?: T
  errors?: z.ZodIssue[]
  errorMessage?: string
}

// =============================================================================
// VALIDATORS
// =============================================================================

/**
 * InputValidator - Validates inputs before processing
 */
export class InputValidator {
  /**
   * Validate task input
   */
  validateTaskInput(input: unknown): ValidationResult<ValidatedTaskInput> {
    return this.validate(TaskInputSchema, input)
  }

  /**
   * Validate agent state
   */
  validateAgentState(state: unknown): ValidationResult<ValidatedAgentState> {
    return this.validate(AgentStateSchema, state)
  }

  /**
   * Validate with custom schema
   */
  validateCustom<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
    return this.validate(schema, data)
  }

  /**
   * Generic validation method
   */
  private validate<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
    const result = schema.safeParse(data)

    if (result.success) {
      return {
        success: true,
        data: result.data
      }
    }

    return {
      success: false,
      errors: result.error.issues,
      errorMessage: result.error.issues
        .map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`)
        .join('; ')
    }
  }
}

/**
 * OutputValidator - Validates outputs after processing
 */
export class OutputValidator {
  /**
   * Validate agent output
   */
  validateAgentOutput(output: unknown): ValidationResult<ValidatedAgentOutput> {
    return this.validate(AgentOutputSchema, output)
  }

  /**
   * Validate routing decision
   */
  validateRoutingDecision(decision: unknown): ValidationResult<ValidatedRoutingDecision> {
    return this.validate(RoutingDecisionSchema, decision)
  }

  /**
   * Validate execution result
   */
  validateExecutionResult(result: unknown): ValidationResult<ValidatedExecutionResult> {
    return this.validate(ExecutionResultSchema, result)
  }

  /**
   * Validate with custom schema
   */
  validateCustom<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
    return this.validate(schema, data)
  }

  /**
   * Generic validation method
   */
  private validate<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
    const result = schema.safeParse(data)

    if (result.success) {
      return {
        success: true,
        data: result.data
      }
    }

    return {
      success: false,
      errors: result.error.issues,
      errorMessage: result.error.issues
        .map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`)
        .join('; ')
    }
  }
}

// =============================================================================
// VALIDATION MIDDLEWARE
// =============================================================================

/**
 * Create a validated function wrapper
 */
export function withValidation<TInput, TOutput>(
  inputSchema: z.ZodSchema<TInput>,
  outputSchema: z.ZodSchema<TOutput>,
  fn: (input: TInput) => Promise<TOutput>
): (input: unknown) => Promise<TOutput> {
  return async (rawInput: unknown) => {
    // Validate input
    const inputResult = inputSchema.safeParse(rawInput)
    if (!inputResult.success) {
      throw new ValidationError('Input validation failed', inputResult.error)
    }

    // Execute function
    const output = await fn(inputResult.data)

    // Validate output
    const outputResult = outputSchema.safeParse(output)
    if (!outputResult.success) {
      throw new ValidationError('Output validation failed', outputResult.error)
    }

    return outputResult.data
  }
}

// =============================================================================
// ERRORS
// =============================================================================

/**
 * Validation error
 */
export class ValidationError extends Error {
  public readonly zodError: z.ZodError

  constructor(message: string, zodError: z.ZodError) {
    super(`${message}: ${zodError.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`).join('; ')}`)
    this.name = 'ValidationError'
    this.zodError = zodError
  }
}

// =============================================================================
// SINGLETONS
// =============================================================================

let inputValidatorInstance: InputValidator | null = null
let outputValidatorInstance: OutputValidator | null = null

/**
 * Get singleton InputValidator instance
 */
export function getInputValidator(): InputValidator {
  if (!inputValidatorInstance) {
    inputValidatorInstance = new InputValidator()
  }
  return inputValidatorInstance
}

/**
 * Get singleton OutputValidator instance
 */
export function getOutputValidator(): OutputValidator {
  if (!outputValidatorInstance) {
    outputValidatorInstance = new OutputValidator()
  }
  return outputValidatorInstance
}

/**
 * Reset singletons (for testing)
 */
export function resetValidators(): void {
  inputValidatorInstance = null
  outputValidatorInstance = null
}
