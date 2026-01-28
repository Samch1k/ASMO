/**
 * @ai1st/core - Autonomous AI Development Teams
 *
 * Main entry point for the AI1st orchestration system.
 */

export const version = '0.1.0'

// ===================================
// ORCHESTRATION
// ===================================
export { WorkflowEngine } from './orchestration/workflow-engine'
export { AgentRegistry } from './orchestration/agent-registry'
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
export { ConfigLoader } from './orchestration/config-loader'
export { RoleManager } from './orchestration/role-manager'
export { InstructionManager } from './orchestration/instruction-manager'
export { SkillMDLoader } from './orchestration/skillmd-loader'

// BMAD Phase 1: Complexity Analysis & Adaptive Selection
export { ComplexityAnalyzer } from './orchestration/complexity-analyzer'
export { WorkflowSelector } from './orchestration/workflow-selector'

// ===================================
// CONFIGURATION
// ===================================
export { ConfigManager } from './orchestration/config/config-manager'
export * from './orchestration/config/types'
export * from './orchestration/config/defaults'

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

// ===================================
// MCP INTEGRATION
// ===================================
export { MCPBridge } from './agents/mcp/mcp-bridge'
