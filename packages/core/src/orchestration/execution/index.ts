/**
 * Execution Module - Dual Execution Modes
 *
 * Provides Session ($0) and API (pay-per-use) execution modes.
 */

export {
  SessionExecutor,
  getSessionExecutor,
  resetSessionExecutor,
  type SessionExecutorConfig,
  type SessionExecutionContext,
  type SessionExecutionResult
} from './session-executor'

export {
  APIExecutor,
  getAPIExecutor,
  resetAPIExecutor,
  type APIExecutorConfig,
  type APIExecutionContext,
  type APIExecutionResult
} from './api-executor'

export {
  ExecutorFactory,
  getExecutorFactory,
  resetExecutorFactory,
  type ExecutionMode,
  type ExecutorFactoryConfig,
  type UnifiedExecutionContext,
  type UnifiedExecutionResult
} from './executor-factory'
