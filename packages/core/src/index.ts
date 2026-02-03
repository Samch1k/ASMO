/**
 * @asmo/core - ASMO: AI System for Multiagent Orchestration
 *
 * Main entry point for the ASMO orchestration system.
 */

export const version = '0.1.0'

// ===================================
// LLM PROVIDERS
// ===================================
export {
  // Types (ModelTier is exported from routing-logger below)
  type MessageRole,
  type Message,
  type UserMessage,
  type AssistantMessage,
  type SystemMessage,
  type LLMGenerateOptions,
  type LLMResponse,
  type ILLMProvider,
  type ProviderPreference,
  type ProviderInfo,
  // Factories
  createUserMessage,
  createAssistantMessage,
  createSystemMessage,
  ANTHROPIC_MODELS,
  // Providers
  SessionLLMProvider,
  type SessionProviderConfig,
  AnthropicLLMProvider,
  type AnthropicProviderConfig,
  // Factory
  LLMProviderFactory,
  getLLMProviderFactory,
  getLLMProvider,
  resetLLMProviderFactory,
  printProviderStatus
} from './llm'

// ===================================
// ORCHESTRATION
// ===================================
export { WorkflowEngine } from './orchestration/workflow-engine'
export { AgentRegistry, type SelectAgentOptions } from './orchestration/agent-registry'
export { SkillMatcher } from './orchestration/skill-matcher'
export { PhaseManager } from './orchestration/phase-manager'
export { IterationManager } from './orchestration/iteration-manager'
export { ApprovalCheckpoint } from './orchestration/approval-checkpoint'
export { LearningLoop } from './orchestration/learning-loop'
export { MetricsOptimizer } from './orchestration/metrics-optimizer'
export { MetricsCollector } from './orchestration/metrics-collector'
export { MetricsPersister } from './orchestration/metrics-persister'
export { RetrospectiveAgent } from './orchestration/retrospective-agent'
export { RetrospectiveReportGenerator } from './orchestration/retrospective-report-generator'
export { ChecklistManager } from './orchestration/checklist-manager'
export { TeamManager } from './orchestration/team-manager'
export { ConfigLoader, getConfigLoader } from './orchestration/config-loader'
export { RoleManager } from './orchestration/role-manager'
export { InstructionManager } from './orchestration/instruction-manager'
export { SkillMDLoader, createSkillMDLoader } from './orchestration/skillmd-loader'

// BMAD Phase 1: Complexity Analysis & Adaptive Selection
export { ComplexityAnalyzer } from './orchestration/complexity-analyzer'
export { WorkflowSelector } from './orchestration/workflow-selector'

// Adaptive Workflow System: Phase Detection
export { ContextAnalyzer } from './orchestration/context-analyzer'
export { PhaseDetector } from './orchestration/phase-detector'

// BMAD Phase 2: YOLO Mode & Brainstorming
export { YoloModeManager } from './orchestration/yolo-mode-manager'
export { BrainstormingSession } from './orchestration/brainstorming-session'

// BMAD Phase 3: Task Management
export { TaskManager, getTaskManager } from './orchestration/task-manager'
export { TaskPersister, type TaskStatus, type TaskPriority } from './orchestration/task-persister'
export { JsonTaskPersister, getJsonTaskPersister } from './orchestration/json-task-persister'

// BMAD Phase 4: Multi-Agent Collaboration
export { PartySession } from './orchestration/party-session'

// BMAD Phase 5: Help & Documentation
export { HelpSystem } from './orchestration/help-system'
export { DocumentationManager } from './orchestration/documentation-manager'

// BMAD Integration: Core Concepts
export { AdversarialReviewSession } from './orchestration/adversarial-review'
export { ContextCascade } from './orchestration/context-cascade'
export { DocumentRegistry } from './orchestration/document-registry'
export { ElicitationManager } from './orchestration/elicitation'

// BMAD Integration: Utilities
export { DocumentSharder } from './utils/document-sharding'
export { SingletonFactory, createSingleton } from './utils/singleton'

// ===================================
// CONFIGURATION
// ===================================
export { ConfigManager } from './orchestration/config/config-manager'
export * from './orchestration/config/types'
export * from './orchestration/config/defaults'

// YAML Config (Variant D)
export {
  YamlConfigLoader,
  getYamlConfigLoader,
  resetYamlConfigLoader,
  type AgentConfig,
  type AgentRoleConfig,
  type AgentSkillConfig,
  type AgentExecutionConfig,
  type AgentsYamlConfig,
  type ModelConfig,
  type ModelCharacteristics,
  type RoutingConfig as YamlRoutingConfig,
  type ModelsYamlConfig,
  type ReliabilityConfig
} from './orchestration/config/yaml-config-loader'

// Prompt Templates
export {
  PromptLoader,
  getPromptLoader,
  resetPromptLoader,
  type PromptContext,
  type PromptTemplate,
  type LoadedPrompt
} from './orchestration/prompts'

// ===================================
// RELIABILITY (CircuitBreaker & Validation)
// ===================================
export {
  CircuitBreaker,
  CircuitBreakerManager,
  getCircuitBreakerManager,
  resetCircuitBreakerManager,
  CircuitOpenError,
  InputValidator,
  OutputValidator,
  getInputValidator,
  getOutputValidator,
  resetValidators,
  withValidation,
  ValidationError,
  TaskInputSchema,
  AgentStateSchema,
  AgentOutputSchema,
  type CircuitState,
  type CircuitBreakerConfig,
  type CircuitBreakerStats,
  type ValidationResult,
  type ValidatedTaskInput,
  type ValidatedAgentOutput
} from './orchestration/reliability'

// ===================================
// EXECUTION MODES (Dual: Session $0 / API pay-per-use)
// ===================================
export {
  SessionExecutor,
  getSessionExecutor,
  resetSessionExecutor,
  APIExecutor,
  getAPIExecutor,
  resetAPIExecutor,
  ExecutorFactory,
  getExecutorFactory,
  resetExecutorFactory,
  type ExecutionMode,
  type SessionExecutorConfig,
  type APIExecutorConfig,
  type ExecutorFactoryConfig,
  type UnifiedExecutionContext,
  type UnifiedExecutionResult
} from './orchestration/execution'

// ===================================
// TYPES
// ===================================
export * from './orchestration/types'

// ===================================
// AGENTS
// ===================================
export { BaseAgent } from './agents/base-agent'
export * from './agents/types'

// Core agent roles
export { ArchitectAgent } from './agents/roles/architect.agent'
export { DeveloperAgent } from './agents/roles/developer.agent'
export { TesterAgent } from './agents/roles/tester.agent'
export { DebuggerAgent } from './agents/roles/debugger.agent'
export { DevOpsAgent } from './agents/roles/devops.agent'
export { OptimizerAgent } from './agents/roles/optimizer.agent'

// Specialized UI/UX roles
export { UIDevAgent } from './agents/roles/ui-developer.agent'
export { UXDesignerAgent } from './agents/roles/ux-designer.agent'

// Code quality roles
export { CodeReviewerAgent } from './agents/roles/code-reviewer.agent'

// Validation & coordination roles
export { DesignValidatorAgent } from './agents/roles/design-validator.agent'
export { MergeAgent } from './agents/roles/merge-coordinator.agent'
export { PostDeployMonitorAgent } from './agents/roles/post-deploy-monitor.agent'
export { RequirementsValidatorAgent } from './agents/roles/requirements-validator.agent'

// Business domain roles
export { BusinessAnalystAgent } from './agents/roles/business-analyst.agent'
export { ProjectManagerAgent } from './agents/roles/project-manager.agent'
export { ProductOwnerAgent } from './agents/roles/product-owner.agent'

// Specialized agents (BMAD Phase 5)
export { APIDesignerAgent } from './agents/roles/api-designer.agent'
export { DataArchitectAgent } from './agents/roles/data-architect.agent'
export { PerformanceEngineerAgent } from './agents/roles/performance-engineer.agent'
export { ScrumMasterAgent } from './agents/roles/scrum-master.agent'
export { SecuritySpecialistAgent } from './agents/roles/security-specialist.agent'

// BMAD New Agents
export { ProductManagerAgent } from './agents/roles/product-manager.agent'
export { RFQSpecialistAgent } from './agents/roles/rfq-specialist.agent'
export { SupplierOpsAgent } from './agents/roles/supplier-ops.agent'

// BMAD Integration: New Agents
export { AnalystAgent } from './agents/roles/analyst.agent'
export { TechWriterAgent } from './agents/roles/tech-writer.agent'
export { TestArchitectAgent } from './agents/roles/test-architect.agent'
export { AdversarialReviewerAgent } from './agents/roles/adversarial-reviewer.agent'

// ===================================
// DYNAMIC ORCHESTRATOR (Native TypeScript - replaces LangGraph)
// ===================================
export {
  DynamicOrchestrator,
  getDynamicOrchestrator,
  resetDynamicOrchestrator,
  orchestrateTask,
  orchestrateTasks,
  type OrchestratorConfig,
  type OrchestrationTask,
  type OrchestrationResult,
  type AgentRegistryLike as DynamicAgentRegistry
} from './orchestration/dynamic-orchestrator'

export {
  TaskRouter,
  getTaskRouter,
  resetTaskRouter,
  type RoutingConfig,
  type TaskContext,
  type RoutingResult
} from './orchestration/task-router'

export {
  AgentExecutor,
  getAgentExecutor,
  resetAgentExecutor,
  type ExecutorConfig,
  type ExecutionContext,
  type ExecutionResult
} from './orchestration/agent-executor'

// Error utilities
export {
  type ErrorCategory,
  categorizeError,
  isRetryable,
  getRetryDelayMultiplier,
  analyzeError
} from './orchestration/errors'

export {
  RoutingLogger,
  getRoutingLogger,
  resetRoutingLogger,
  type ModelTier,
  type RoutingDecision,
  type RoutingLogEntry
} from './orchestration/routing-logger'

// Convenience functions for backwards compatibility
import { getDynamicOrchestrator, type OrchestrationTask } from './orchestration/dynamic-orchestrator'
import type { BaseAgent } from './agents/base-agent'

export async function runMultiAgentTask(task: string, agent?: BaseAgent): Promise<any> {
  const orchestrator = getDynamicOrchestrator()
  const orchestrationTask: OrchestrationTask = {
    id: `task_${Date.now()}`,
    description: task
  }
  const result = await orchestrator.executeTask(orchestrationTask, agent)
  return result.result
}

export async function runWorkflow(workflowId: string, tasks: OrchestrationTask[]): Promise<any> {
  const orchestrator = getDynamicOrchestrator()
  return orchestrator.executeWorkflow(workflowId, tasks)
}

export function getOrchestratorStats() {
  const orchestrator = getDynamicOrchestrator()
  const stats = orchestrator.getStats()
  return {
    totalAgents: 26,
    routing: stats.routing,
    runningTasks: stats.runningTasks,
    version: '3.0.0',
    framework: 'ASMO Native (DynamicOrchestrator)'
  }
}

// Claude Code Integration
export {
  ClaudeCodeAdapter,
  type AnalysisResult,
  type PhaseAnalysisResult,
  type PhaseIntent,
  type PhaseForAnalysis,
  type PhaseAnalysisContext,
  type WorkflowForPhaseAnalysis
} from './agents/claude-code-adapter'

// ===================================
// MCP INTEGRATION
// ===================================
export { MCPBridge } from './agents/mcp/mcp-bridge'

// ===================================
// TEMPLATES
// ===================================
export { TemplateEngine } from './templates/template-engine'
export * from './templates/template-schema'
