/**
 * Reliability Module - Circuit Breaker & Validation
 *
 * Provides fault tolerance and input/output validation.
 */

export {
  CircuitBreaker,
  CircuitBreakerManager,
  getCircuitBreakerManager,
  resetCircuitBreakerManager,
  CircuitOpenError,
  type CircuitState,
  type CircuitBreakerConfig,
  type CircuitBreakerStats,
  type CircuitBreakerEvent
} from './circuit-breaker'

export {
  InputValidator,
  OutputValidator,
  getInputValidator,
  getOutputValidator,
  resetValidators,
  withValidation,
  ValidationError,
  // Schemas
  TaskInputSchema,
  AgentStateSchema,
  AgentOutputSchema,
  RoutingDecisionSchema,
  ExecutionResultSchema,
  // Types
  type ValidatedTaskInput,
  type ValidatedAgentState,
  type ValidatedAgentOutput,
  type ValidatedRoutingDecision,
  type ValidatedExecutionResult,
  type ValidationResult
} from './validation'
