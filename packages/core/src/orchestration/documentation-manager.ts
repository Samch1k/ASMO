/**
 * DocumentationManager - Living Documentation System
 *
 * Phase 1 Task 1.3: Captures decisions, generates living docs, enables querying
 *
 * Features:
 * - Automatic decision capture during workflow execution
 * - Living documentation generation (markdown + JSON)
 * - Document querying and retrieval
 * - Memory MCP integration for persistent storage
 * - Architecture Decision Records (ADR) support
 * - PRD and Epic/Story documentation
 */

import fs from 'fs/promises'
import path from 'path'
import type { AgentState, Artifact } from '../agents/types'
import type { Workflow, WorkflowStep, StepResult } from './types'
import { WorkflowPhase } from './phase-manager'

/**
 * Decision captured during workflow execution
 */
export interface Decision {
  /** Unique decision ID */
  id: string
  /** Workflow context */
  workflowId: string
  /** Phase where decision was made */
  phase: WorkflowPhase
  /** Agent that made the decision */
  agentId: string
  /** Decision type */
  type: 'technical' | 'product' | 'design' | 'approval' | 'architecture'
  /** Decision title/summary */
  title: string
  /** Detailed description */
  description: string
  /** Rationale for the decision */
  rationale: string
  /** Alternatives considered */
  alternatives?: string[]
  /** Consequences of the decision */
  consequences?: string[]
  /** Related artifacts */
  artifacts?: Artifact[]
  /** Timestamp */
  timestamp: Date
  /** Additional metadata */
  metadata?: Record<string, any>
}

/**
 * Living document generated from workflow execution
 */
export interface LivingDoc {
  /** Document ID (workflow ID) */
  id: string
  /** Workflow name */
  workflowName: string
  /** Document type */
  type: 'product_brief' | 'prd' | 'epic' | 'story' | 'sprint_plan' | 'adr' | 'workflow_summary'
  /** Document title */
  title: string
  /** Markdown content */
  markdown: string
  /** JSON data */
  data: Record<string, any>
  /** Decisions captured during workflow */
  decisions: Decision[]
  /** Key insights from learning loop */
  insights?: Insight[]
  /** Created timestamp */
  createdAt: Date
  /** Last updated timestamp */
  updatedAt: Date
  /** Document version */
  version: number
}

/**
 * Insight from learning loop or retrospective
 */
export interface Insight {
  /** Insight ID */
  id: string
  /** Insight type */
  type: 'performance' | 'quality' | 'process' | 'pattern' | 'risk'
  /** Priority */
  priority: 'high' | 'medium' | 'low'
  /** Insight description */
  description: string
  /** Recommendation */
  recommendation: string
  /** Supporting evidence */
  evidence?: string[]
  /** Confidence score (0-1) */
  confidence: number
  /** Related workflow/phase */
  context?: {
    workflowId?: string
    phase?: WorkflowPhase
  }
}

/**
 * Query results from documentation search
 */
export interface DocResults {
  /** Matching documents */
  documents: LivingDoc[]
  /** Matching decisions */
  decisions: Decision[]
  /** Total results */
  total: number
  /** Query that was executed */
  query: string
}

/**
 * DocumentationManager configuration
 */
export interface DocumentationManagerConfig {
  /** Base directory for living docs (default: .cursor/docs/living) */
  baseDir?: string
  /** Whether to store in Memory MCP (default: true) */
  useMemoryMCP?: boolean
  /** Auto-generate docs on workflow completion (default: true) */
  autoGenerate?: boolean
  /** Document version tracking (default: true) */
  versionTracking?: boolean
}

/**
 * DocumentationManager - Manages living documentation
 */
export class DocumentationManager {
  private baseDir: string
  private useMemoryMCP: boolean
  private autoGenerate: boolean
  private versionTracking: boolean

  // In-memory caches
  private decisions: Map<string, Decision[]> = new Map() // workflowId → decisions
  private documents: Map<string, LivingDoc> = new Map()  // docId → document

  // Active workflow tracking
  private activeWorkflows: Map<string, {
    workflow: Workflow
    state: AgentState
    startTime: Date
    decisions: Decision[]
  }> = new Map()

  constructor(config?: DocumentationManagerConfig) {
    this.baseDir = config?.baseDir || path.join(process.cwd(), '.cursor/docs/living')
    this.useMemoryMCP = config?.useMemoryMCP ?? true
    this.autoGenerate = config?.autoGenerate ?? true
    this.versionTracking = config?.versionTracking ?? true
  }

  /**
   * Initialize documentation manager (create base directory)
   */
  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.baseDir, { recursive: true })
      console.log(`✅ DocumentationManager initialized: ${this.baseDir}`)
    } catch (error) {
      console.error(`❌ Failed to initialize DocumentationManager:`, error)
      throw error
    }
  }

  /**
   * Start tracking a workflow for documentation capture
   */
  startWorkflowTracking(workflow: Workflow, state: AgentState): void {
    this.activeWorkflows.set(workflow.id, {
      workflow,
      state,
      startTime: new Date(),
      decisions: []
    })
    console.log(`📝 [DocumentationManager] Tracking workflow: ${workflow.name} (${workflow.id})`)
  }

  /**
   * Stop tracking a workflow (called on workflow completion)
   */
  async stopWorkflowTracking(workflowId: string, finalState: AgentState, success: boolean): Promise<void> {
    const tracking = this.activeWorkflows.get(workflowId)
    if (!tracking) {
      console.warn(`⚠️  [DocumentationManager] Workflow not tracked: ${workflowId}`)
      return
    }

    // Auto-generate living doc if enabled
    if (this.autoGenerate && success) {
      await this.generateLivingDoc(workflowId, finalState)
    }

    this.activeWorkflows.delete(workflowId)
    console.log(`📝 [DocumentationManager] Stopped tracking: ${workflowId}`)
  }

  /**
   * Capture a decision made during workflow execution
   */
  async captureDecision(decision: Decision): Promise<void> {
    const tracking = this.activeWorkflows.get(decision.workflowId)
    if (!tracking) {
      console.warn(`⚠️  [DocumentationManager] Workflow not tracked: ${decision.workflowId}`)
      return
    }

    // Add to active workflow decisions
    tracking.decisions.push(decision)

    // Add to global decisions map
    if (!this.decisions.has(decision.workflowId)) {
      this.decisions.set(decision.workflowId, [])
    }
    this.decisions.get(decision.workflowId)!.push(decision)

    console.log(`📝 [DocumentationManager] Decision captured: ${decision.title} (${decision.type})`)

    // If Memory MCP enabled, store decision
    if (this.useMemoryMCP) {
      // Note: Memory MCP integration would go here
      // For now, we store in filesystem only
    }
  }

  /**
   * Capture decision from step result
   */
  async captureStepDecision(
    workflow: Workflow,
    step: WorkflowStep,
    stepResult: StepResult,
    _state: AgentState
  ): Promise<void> {
    // Extract decision from step artifacts
    const artifacts = stepResult.output?.artifacts || []
    const decisionArtifacts = artifacts.filter((a: Artifact) => a.type === 'adr' || a.metadata?.isDecision)

    for (const artifact of decisionArtifacts) {
      const decision: Decision = {
        id: `${workflow.id}-${step.role_id}-${step.phase}-${Date.now()}`,
        workflowId: workflow.id,
        phase: step.phase as WorkflowPhase,
        agentId: stepResult.agentId,
        type: this.inferDecisionType(artifact, step),
        title: artifact.metadata?.title || `Decision in ${step.phase}`,
        description: artifact.content.slice(0, 500), // First 500 chars
        rationale: artifact.metadata?.rationale || 'See artifact for details',
        alternatives: artifact.metadata?.alternatives,
        consequences: artifact.metadata?.consequences,
        artifacts: [artifact],
        timestamp: new Date(),
        metadata: {
          stepOrder: step.order,
          stepPhase: step.phase,
          deliverables: step.deliverables
        }
      }

      await this.captureDecision(decision)
    }
  }

  /**
   * Infer decision type from artifact and step
   */
  private inferDecisionType(artifact: Artifact, step: WorkflowStep): Decision['type'] {
    if (artifact.type === 'adr') return 'architecture'
    if (step.phase.toLowerCase().includes('design')) return 'design'
    if (step.phase.toLowerCase().includes('approval')) return 'approval'
    if (step.role_id === 'product-manager') return 'product'
    return 'technical'
  }

  /**
   * Capture approval decision
   */
  async captureApprovalDecision(
    workflowId: string,
    phase: WorkflowPhase,
    approved: boolean,
    feedback?: string
  ): Promise<void> {
    const decision: Decision = {
      id: `${workflowId}-approval-${phase}-${Date.now()}`,
      workflowId,
      phase,
      agentId: 'approval-checkpoint',
      type: 'approval',
      title: `${phase} Approval`,
      description: approved ? `Phase ${phase} was approved` : `Phase ${phase} was rejected`,
      rationale: feedback || (approved ? 'Approved to proceed' : 'Rejected - see feedback'),
      timestamp: new Date(),
      metadata: {
        approved,
        feedback
      }
    }

    await this.captureDecision(decision)
  }

  /**
   * Generate living documentation for a workflow
   */
  async generateLivingDoc(workflowId: string, finalState?: AgentState): Promise<LivingDoc> {
    const tracking = this.activeWorkflows.get(workflowId)
    if (!tracking) {
      throw new Error(`Workflow not tracked: ${workflowId}`)
    }

    const { workflow, state, startTime, decisions } = tracking
    const duration = (new Date().getTime() - startTime.getTime()) / 1000

    // Determine document type based on workflow
    const docType = this.inferDocumentType(workflow)

    // Generate markdown content
    const markdown = this.generateMarkdown(workflow, state, finalState || state, decisions, duration)

    // Generate JSON data
    const data = this.generateJSONData(workflow, state, finalState || state, decisions, duration)

    // Create living doc
    const doc: LivingDoc = {
      id: workflowId,
      workflowName: workflow.name,
      type: docType,
      title: `${workflow.name} - Living Documentation`,
      markdown,
      data,
      decisions,
      createdAt: startTime,
      updatedAt: new Date(),
      version: 1
    }

    // Store in cache
    this.documents.set(workflowId, doc)

    // Save to filesystem
    await this.saveDocument(doc)

    console.log(`📝 [DocumentationManager] Living doc generated: ${workflow.name}`)
    console.log(`   Type: ${docType}`)
    console.log(`   Decisions: ${decisions.length}`)
    console.log(`   Path: ${this.getDocumentPath(doc)}`)

    return doc
  }

  /**
   * Infer document type from workflow
   */
  private inferDocumentType(workflow: Workflow): LivingDoc['type'] {
    const name = workflow.name.toLowerCase()
    const id = workflow.id.toLowerCase()

    if (name.includes('product brief') || id.includes('product_brief')) return 'product_brief'
    if (name.includes('prd') || id.includes('prd')) return 'prd'
    if (name.includes('epic') || id.includes('epic')) return 'epic'
    if (name.includes('story') || name.includes('stories') || id.includes('story')) return 'story'
    if (name.includes('sprint') || id.includes('sprint')) return 'sprint_plan'
    if (name.includes('adr') || id.includes('adr') || name.includes('architecture')) return 'adr'

    return 'workflow_summary'
  }

  /**
   * Generate markdown documentation
   */
  private generateMarkdown(
    workflow: Workflow,
    _initialState: AgentState,
    finalState: AgentState,
    decisions: Decision[],
    duration: number
  ): string {
    const md: string[] = []

    // Header
    md.push(`# ${workflow.name}`)
    md.push('')
    md.push(`**Date**: ${new Date().toISOString().split('T')[0]}`)
    md.push(`**Duration**: ${duration.toFixed(1)}s`)
    md.push(`**Workflow ID**: ${workflow.id}`)
    md.push('')
    md.push('---')
    md.push('')

    // Description
    if (workflow.description) {
      md.push(`## Description`)
      md.push('')
      md.push(workflow.description)
      md.push('')
    }

    // Decisions
    if (decisions.length > 0) {
      md.push(`## Decisions (${decisions.length})`)
      md.push('')

      // Group by type
      const byType = this.groupDecisionsByType(decisions)

      for (const [type, typeDecisions] of Object.entries(byType)) {
        md.push(`### ${this.capitalizeFirst(type)} Decisions`)
        md.push('')

        for (const decision of typeDecisions) {
          md.push(`#### ${decision.title}`)
          md.push('')
          md.push(`**Agent**: ${decision.agentId}`)
          md.push(`**Phase**: ${decision.phase}`)
          md.push(`**Timestamp**: ${decision.timestamp.toISOString()}`)
          md.push('')
          md.push(`**Description**:`)
          md.push(decision.description)
          md.push('')

          if (decision.rationale) {
            md.push(`**Rationale**:`)
            md.push(decision.rationale)
            md.push('')
          }

          if (decision.alternatives && decision.alternatives.length > 0) {
            md.push(`**Alternatives Considered**:`)
            decision.alternatives.forEach(alt => md.push(`- ${alt}`))
            md.push('')
          }

          if (decision.consequences && decision.consequences.length > 0) {
            md.push(`**Consequences**:`)
            decision.consequences.forEach(cons => md.push(`- ${cons}`))
            md.push('')
          }

          md.push('---')
          md.push('')
        }
      }
    }

    // Agent Results
    const agentResults = finalState.agentResults || []
    if (agentResults.length > 0) {
      md.push(`## Agent Execution Summary`)
      md.push('')
      md.push(`**Total Agents**: ${agentResults.length}`)
      md.push('')

      agentResults.forEach((result, idx) => {
        md.push(`### ${idx + 1}. ${result.agentId}`)
        md.push('')
        md.push(`**Status**: ${result.status || 'unknown'}`)
        md.push(`**Timestamp**: ${result.timestamp || 'N/A'}`)
        md.push('')
      })
    }

    // Deliverables
    const deliverables = this.extractDeliverables(workflow, finalState)
    if (deliverables.length > 0) {
      md.push(`## Deliverables`)
      md.push('')
      deliverables.forEach(d => md.push(`- ${d}`))
      md.push('')
    }

    // Footer
    md.push('---')
    md.push('')
    md.push(`**Generated by**: DocumentationManager`)
    md.push(`**Timestamp**: ${new Date().toISOString()}`)

    return md.join('\n')
  }

  /**
   * Group decisions by type
   */
  private groupDecisionsByType(decisions: Decision[]): Record<string, Decision[]> {
    const grouped: Record<string, Decision[]> = {}

    for (const decision of decisions) {
      if (!grouped[decision.type]) {
        grouped[decision.type] = []
      }
      grouped[decision.type].push(decision)
    }

    return grouped
  }

  /**
   * Capitalize first letter
   */
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  /**
   * Extract deliverables from workflow and state
   */
  private extractDeliverables(workflow: Workflow, _state: AgentState): string[] {
    const deliverables = new Set<string>()

    // From workflow steps
    for (const step of workflow.steps) {
      if (step.deliverables) {
        step.deliverables.forEach(d => deliverables.add(d))
      }
    }

    return Array.from(deliverables)
  }

  /**
   * Generate JSON data
   */
  private generateJSONData(
    workflow: Workflow,
    _initialState: AgentState,
    finalState: AgentState,
    decisions: Decision[],
    duration: number
  ): Record<string, any> {
    return {
      workflow: {
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        estimatedTime: workflow.estimated_time
      },
      execution: {
        duration,
        startTime: this.activeWorkflows.get(workflow.id)?.startTime.toISOString(),
        endTime: new Date().toISOString()
      },
      decisions: decisions.map(d => ({
        id: d.id,
        type: d.type,
        phase: d.phase,
        agentId: d.agentId,
        title: d.title,
        timestamp: d.timestamp.toISOString()
      })),
      agentResults: finalState.agentResults || [],
      deliverables: this.extractDeliverables(workflow, finalState)
    }
  }

  /**
   * Save document to filesystem
   */
  private async saveDocument(doc: LivingDoc): Promise<void> {
    const docPath = this.getDocumentPath(doc)

    try {
      // Save markdown
      const mdPath = docPath.replace(/\.json$/, '.md')
      await fs.writeFile(mdPath, doc.markdown, 'utf-8')

      // Save JSON
      const jsonData = {
        id: doc.id,
        workflowName: doc.workflowName,
        type: doc.type,
        title: doc.title,
        data: doc.data,
        decisions: doc.decisions.map(d => ({
          ...d,
          timestamp: d.timestamp.toISOString()
        })),
        insights: doc.insights,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
        version: doc.version
      }
      await fs.writeFile(docPath, JSON.stringify(jsonData, null, 2), 'utf-8')

      console.log(`   ✓ Saved: ${mdPath}`)
      console.log(`   ✓ Saved: ${docPath}`)
    } catch (error) {
      console.error(`❌ Failed to save document: ${doc.id}`, error)
      throw error
    }
  }

  /**
   * Get document file path
   */
  private getDocumentPath(doc: LivingDoc): string {
    const sanitized = doc.id.replace(/[^a-z0-9-_]/gi, '_')
    return path.join(this.baseDir, `${sanitized}.json`)
  }

  /**
   * Update documentation with insights from learning loop
   */
  async updateDocumentation(insights: Insight[]): Promise<void> {
    console.log(`📝 [DocumentationManager] Updating docs with ${insights.length} insights`)

    for (const insight of insights) {
      const workflowId = insight.context?.workflowId
      if (!workflowId) continue

      const doc = this.documents.get(workflowId)
      if (!doc) continue

      // Add insights
      if (!doc.insights) {
        doc.insights = []
      }
      doc.insights.push(insight)

      // Increment version if versioning enabled
      if (this.versionTracking) {
        doc.version++
      }
      doc.updatedAt = new Date()

      // Re-save document
      await this.saveDocument(doc)

      console.log(`   ✓ Updated: ${doc.workflowName} (version ${doc.version})`)
    }
  }

  /**
   * Query documentation by search term
   */
  async queryDocumentation(query: string): Promise<DocResults> {
    const queryLower = query.toLowerCase()
    const matchingDocs: LivingDoc[] = []
    const matchingDecisions: Decision[] = []

    // Search in-memory cache
    for (const doc of this.documents.values()) {
      if (
        doc.title.toLowerCase().includes(queryLower) ||
        doc.workflowName.toLowerCase().includes(queryLower) ||
        doc.markdown.toLowerCase().includes(queryLower)
      ) {
        matchingDocs.push(doc)
      }
    }

    // Search decisions
    for (const decisions of this.decisions.values()) {
      for (const decision of decisions) {
        if (
          decision.title.toLowerCase().includes(queryLower) ||
          decision.description.toLowerCase().includes(queryLower) ||
          decision.rationale.toLowerCase().includes(queryLower)
        ) {
          matchingDecisions.push(decision)
        }
      }
    }

    return {
      documents: matchingDocs,
      decisions: matchingDecisions,
      total: matchingDocs.length + matchingDecisions.length,
      query
    }
  }

  /**
   * Load document from filesystem
   */
  async loadDocument(docId: string): Promise<LivingDoc | null> {
    // Check cache first
    if (this.documents.has(docId)) {
      return this.documents.get(docId)!
    }

    // Load from filesystem
    const sanitized = docId.replace(/[^a-z0-9-_]/gi, '_')
    const docPath = path.join(this.baseDir, `${sanitized}.json`)

    try {
      const data = await fs.readFile(docPath, 'utf-8')
      const parsed = JSON.parse(data)

      const doc: LivingDoc = {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        updatedAt: new Date(parsed.updatedAt),
        decisions: parsed.decisions.map((d: any) => ({
          ...d,
          timestamp: new Date(d.timestamp)
        }))
      }

      this.documents.set(docId, doc)
      return doc
    } catch (error) {
      return null
    }
  }

  /**
   * Get all documents of a specific type
   */
  async getDocumentsByType(type: LivingDoc['type']): Promise<LivingDoc[]> {
    return Array.from(this.documents.values()).filter(doc => doc.type === type)
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalDocuments: number
    totalDecisions: number
    documentsByType: Record<string, number>
  } {
    const documentsByType: Record<string, number> = {}

    for (const doc of this.documents.values()) {
      documentsByType[doc.type] = (documentsByType[doc.type] || 0) + 1
    }

    let totalDecisions = 0
    for (const decisions of this.decisions.values()) {
      totalDecisions += decisions.length
    }

    return {
      totalDocuments: this.documents.size,
      totalDecisions,
      documentsByType
    }
  }
}

// Singleton instance
let instance: DocumentationManager | null = null

/**
 * Get DocumentationManager singleton instance
 */
export function getDocumentationManager(config?: DocumentationManagerConfig): DocumentationManager {
  if (!instance) {
    instance = new DocumentationManager(config)
  }
  return instance
}
