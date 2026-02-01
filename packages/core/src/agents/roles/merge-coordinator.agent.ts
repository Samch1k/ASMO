/**
 * MergeAgent - Merge parallel agent outputs with intelligent conflict resolution
 *
 * Day 9: Parallel Output Consolidation
 *
 * Purpose: Consolidate findings from parallel agent executions into unified reports
 *
 * Use Cases:
 * - Developer + UI Developer → Combined code implementation
 * - Tester + Optimizer → Combined test results + performance metrics
 * - Multiple validators → Consolidated validation report
 *
 * Features:
 * - LLM-based intelligent merging
 * - Conflict detection and resolution
 * - Priority-based merging (by confidence scores)
 * - Unresolvable conflict flagging
 * - Comprehensive consolidated reports
 */

import { BaseAgent } from '../base-agent'
import { AgentState } from '../types'
import { ChatAnthropic } from '@langchain/anthropic'
import { AIMessage } from '@langchain/core/messages'

export interface ParallelOutput {
  agentId: string
  agentRole: string
  phase: string
  findings: any
  confidence?: number
  timestamp: string
}

export interface ConflictDetection {
  field: string
  conflictingValues: Array<{
    agentId: string
    value: any
    confidence?: number
  }>
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
  resolvable: boolean
}

export interface MergeResult {
  mergedFindings: any
  conflicts: ConflictDetection[]
  resolutionStrategy: string
  confidenceScore: number
  contributingAgents: string[]
  unresolvedConflicts: ConflictDetection[]
}

/**
 * MergeAgent - Consolidates parallel agent outputs
 */
export class MergeAgent extends BaseAgent {
  private llm: ChatAnthropic

  constructor() {
    super('merge-coordinator', [
      'conflict_resolution',
      'data_consolidation',
      'report_generation',
      'quality_assurance'
    ])

    this.llm = new ChatAnthropic({
      modelName: "claude-sonnet-4-20250514",
      temperature: 0.1, // Low temperature for consistent merging
      maxTokens: 8192
    })
  }

  async execute(state: AgentState): Promise<Partial<AgentState>> {
    console.log('\n🔀 MERGE AGENT: Starting parallel output consolidation')

    try {
      // 1. Extract parallel outputs from state
      const parallelOutputs = this.extractParallelOutputs(state)

      if (parallelOutputs.length === 0) {
        console.log('⚠️  No parallel outputs found to merge')
        return {
          messages: [...state.messages, new AIMessage('No parallel outputs to merge')],
          nextAction: 'END'
        }
      }

      console.log(`📊 Found ${parallelOutputs.length} parallel outputs to merge:`)
      parallelOutputs.forEach(output => {
        console.log(`   - ${output.agentRole} (${output.agentId}) - Phase: ${output.phase}`)
      })

      // 2. Detect conflicts
      const conflicts = await this.detectConflicts(parallelOutputs)

      if (conflicts.length > 0) {
        console.log(`\n⚠️  Detected ${conflicts.length} conflict(s):`)
        conflicts.forEach(conflict => {
          console.log(`   - ${conflict.field}: ${conflict.severity} severity (${conflict.resolvable ? 'Resolvable' : 'UNRESOLVABLE'})`)
        })
      } else {
        console.log('\n✅ No conflicts detected')
      }

      // 3. Merge outputs using LLM
      const mergeResult = await this.mergeOutputs(parallelOutputs, conflicts)

      console.log(`\n📝 Merge complete:`)
      console.log(`   Contributing Agents: ${mergeResult.contributingAgents.join(', ')}`)
      console.log(`   Confidence Score: ${mergeResult.confidenceScore}/100`)
      console.log(`   Resolution Strategy: ${mergeResult.resolutionStrategy}`)

      if (mergeResult.unresolvedConflicts.length > 0) {
        console.log(`   ⚠️  Unresolved Conflicts: ${mergeResult.unresolvedConflicts.length}`)
        mergeResult.unresolvedConflicts.forEach(conflict => {
          console.log(`      - ${conflict.field}: ${conflict.severity}`)
        })
      }

      // 4. Generate consolidated report
      const consolidatedReport = this.generateConsolidatedReport(mergeResult, parallelOutputs)

      // 5. Store in Memory MCP
      await this.storeMergeResult(mergeResult, parallelOutputs)

      // 6. Return result
      return {
        messages: [...state.messages, new AIMessage(JSON.stringify(consolidatedReport, null, 2))],
        context: {
          ...state.context,
          consolidatedReport,
          mergeResult,
          parallelOutputs
        },
        metadata: {
          ...state.metadata,
          merge_complete: true,
          merge_confidence: mergeResult.confidenceScore,
          unresolved_conflicts: mergeResult.unresolvedConflicts.length
        },
        nextAction: mergeResult.unresolvedConflicts.length > 0 ? 'manual_review' : 'continue'
      }

    } catch (error: any) {
      console.error('❌ Merge Agent execution failed:', error.message)

      return {
        messages: [...state.messages, new AIMessage(JSON.stringify({
          error: 'Merge failed',
          message: error.message
        }))],
        nextAction: 'error'
      }
    }
  }

  /**
   * Public method to consolidate parallel outputs from party sessions
   * Used by PartySession.finalizeRound()
   */
  async consolidateParallelOutputs(params: {
    parallelOutputs: ParallelOutput[]
    task: string
    phase: string
  }): Promise<{
    conflicts: ConflictDetection[]
    summary: string
    mergedFindings: Record<string, unknown>
    contributingAgents: string[]
    confidenceScore: number
    resolutionStrategy: string
  }> {
    const { parallelOutputs } = params

    // Detect conflicts
    const conflicts = await this.detectConflicts(parallelOutputs)

    // Merge outputs
    const mergeResult = await this.mergeOutputs(parallelOutputs, conflicts)

    return {
      conflicts,
      summary: `Merged findings from ${parallelOutputs.length} agents`,
      mergedFindings: mergeResult.mergedFindings,
      contributingAgents: mergeResult.contributingAgents,
      confidenceScore: mergeResult.confidenceScore,
      resolutionStrategy: mergeResult.resolutionStrategy
    }
  }

  /**
   * Extract parallel outputs from state
   * Looks for namespaced findings like "${agentId}_${phase}_findings"
   */
  private extractParallelOutputs(state: AgentState): ParallelOutput[] {
    const outputs: ParallelOutput[] = []
    const context = state.context || {}

    // Look for namespaced findings
    for (const key of Object.keys(context)) {
      const match = key.match(/^(.+)_(.+)_findings$/)
      if (match) {
        const [, agentId, phase] = match
        outputs.push({
          agentId,
          agentRole: agentId.replace(/-/g, ' '),
          phase,
          findings: context[key],
          timestamp: new Date().toISOString()
        })
      }
    }

    // Also check agentResults for parallel execution results
    const agentResults = state.agentResults || []
    const recentResults = agentResults.slice(-5) // Last 5 results

    for (const result of recentResults) {
      // Check if result has parallel execution marker
      if (result.result && typeof result.result === 'object') {
        outputs.push({
          agentId: result.agentId,
          agentRole: result.agentId,
          phase: (result as any).phase || 'unknown',
          findings: result.result,
          timestamp: typeof result.timestamp === 'string' ? result.timestamp : result.timestamp.toISOString()
        })
      }
    }

    return outputs
  }

  /**
   * Detect conflicts between parallel outputs
   */
  private async detectConflicts(outputs: ParallelOutput[]): Promise<ConflictDetection[]> {
    if (outputs.length < 2) {
      return [] // No conflicts with single output
    }

    const conflicts: ConflictDetection[] = []

    // Compare each pair of outputs
    for (let i = 0; i < outputs.length; i++) {
      for (let j = i + 1; j < outputs.length; j++) {
        const output1 = outputs[i]
        const output2 = outputs[j]

        // Detect conflicts in findings
        const pairConflicts = this.compareFindings(output1, output2)
        conflicts.push(...pairConflicts)
      }
    }

    return conflicts
  }

  /**
   * Compare two outputs and detect conflicts
   */
  private compareFindings(output1: ParallelOutput, output2: ParallelOutput): ConflictDetection[] {
    const conflicts: ConflictDetection[] = []
    const findings1 = output1.findings || {}
    const findings2 = output2.findings || {}

    // Get all keys from both findings
    const allKeys = new Set([...Object.keys(findings1), ...Object.keys(findings2)])

    for (const key of allKeys) {
      const value1 = findings1[key]
      const value2 = findings2[key]

      // Skip if both are undefined
      if (value1 === undefined && value2 === undefined) {
        continue
      }

      // Check for conflict
      if (value1 !== undefined && value2 !== undefined) {
        // Both agents provided a value - check if they differ
        if (JSON.stringify(value1) !== JSON.stringify(value2)) {
          // Determine severity based on key name
          let severity: ConflictDetection['severity'] = 'Medium'
          if (key.includes('critical') || key.includes('error') || key.includes('security')) {
            severity = 'Critical'
          } else if (key.includes('warning') || key.includes('issue')) {
            severity = 'High'
          } else if (key.includes('suggestion') || key.includes('info')) {
            severity = 'Low'
          }

          // Check if resolvable (numeric values can average, booleans can't)
          const resolvable = (typeof value1 === 'number' && typeof value2 === 'number') ||
                            (typeof value1 === 'string' && typeof value2 === 'string')

          conflicts.push({
            field: key,
            conflictingValues: [
              {
                agentId: output1.agentId,
                value: value1,
                confidence: output1.confidence
              },
              {
                agentId: output2.agentId,
                value: value2,
                confidence: output2.confidence
              }
            ],
            severity,
            resolvable
          })
        }
      }
    }

    return conflicts
  }

  /**
   * Merge outputs using LLM for intelligent resolution
   */
  private async mergeOutputs(
    outputs: ParallelOutput[],
    conflicts: ConflictDetection[]
  ): Promise<MergeResult> {
    // Build prompt for LLM
    const prompt = `You are a merge agent responsible for consolidating findings from multiple parallel agents.

**Parallel Outputs:**
${outputs.map((output, index) => `
${index + 1}. Agent: ${output.agentRole} (${output.agentId})
   Phase: ${output.phase}
   Findings: ${JSON.stringify(output.findings, null, 2)}
   Confidence: ${output.confidence || 'N/A'}
`).join('\n')}

**Detected Conflicts:**
${conflicts.length > 0 ? conflicts.map((conflict, index) => `
${index + 1}. Field: ${conflict.field}
   Severity: ${conflict.severity}
   Resolvable: ${conflict.resolvable ? 'Yes' : 'No'}
   Conflicting Values:
${conflict.conflictingValues.map(cv => `   - ${cv.agentId}: ${JSON.stringify(cv.value)} (confidence: ${cv.confidence || 'N/A'})`).join('\n')}
`).join('\n') : 'None detected'}

**Your Task:**
1. Merge all findings into a single, coherent result
2. Resolve conflicts intelligently:
   - For numeric values: Average or take the more conservative value
   - For boolean values: Prioritize by agent confidence or err on side of caution
   - For strings: Combine or prioritize by specificity
   - For arrays: Merge and deduplicate
3. Flag any conflicts that cannot be automatically resolved
4. Provide a confidence score (0-100) for the merged result
5. Describe your resolution strategy

**Output Format (JSON):**
{
  "mergedFindings": { /* merged findings */ },
  "resolutionStrategy": "Brief description of how conflicts were resolved",
  "confidenceScore": 85,
  "unresolvedConflicts": [
    {
      "field": "fieldName",
      "reason": "Why it couldn't be resolved",
      "recommendedAction": "What should be done manually"
    }
  ]
}

Provide only the JSON output, no additional text.`

    try {
      const response = await this.llm.invoke(prompt)
      const content = response.content as string

      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from LLM response')
      }

      const llmResult = JSON.parse(jsonMatch[0])

      return {
        mergedFindings: llmResult.mergedFindings || {},
        conflicts,
        resolutionStrategy: llmResult.resolutionStrategy || 'LLM-based intelligent merging',
        confidenceScore: llmResult.confidenceScore || 70,
        contributingAgents: outputs.map(o => o.agentId),
        unresolvedConflicts: (llmResult.unresolvedConflicts || []).map((uc: any) => ({
          field: uc.field,
          conflictingValues: [],
          severity: 'High' as const,
          resolvable: false
        }))
      }

    } catch (error: any) {
      console.error('⚠️  LLM merge failed, using fallback strategy:', error.message)

      // Fallback: Simple merge without conflict resolution
      return this.fallbackMerge(outputs, conflicts)
    }
  }

  /**
   * Fallback merge strategy (no LLM)
   * Used when LLM call fails
   */
  private fallbackMerge(
    outputs: ParallelOutput[],
    conflicts: ConflictDetection[]
  ): MergeResult {
    const mergedFindings: any = {}

    // Simple merge: last agent wins for conflicts
    for (const output of outputs) {
      Object.assign(mergedFindings, output.findings)
    }

    return {
      mergedFindings,
      conflicts,
      resolutionStrategy: 'Fallback: Last agent wins strategy',
      confidenceScore: 60, // Lower confidence for fallback
      contributingAgents: outputs.map(o => o.agentId),
      unresolvedConflicts: conflicts.filter(c => !c.resolvable)
    }
  }

  /**
   * Generate consolidated report
   */
  private generateConsolidatedReport(
    mergeResult: MergeResult,
    parallelOutputs: ParallelOutput[]
  ): {
    summary: string
    mergedFindings: any
    contributingAgents: Array<{ agentId: string; role: string; phase: string }>
    conflictResolution: {
      totalConflicts: number
      resolved: number
      unresolved: number
      strategy: string
    }
    confidence: number
    recommendedActions: string[]
  } {
    const resolved = mergeResult.conflicts.length - mergeResult.unresolvedConflicts.length

    const recommendedActions: string[] = []

    if (mergeResult.unresolvedConflicts.length > 0) {
      recommendedActions.push('Manual review required for unresolved conflicts')
      mergeResult.unresolvedConflicts.forEach(conflict => {
        recommendedActions.push(`Review conflict in field: ${conflict.field}`)
      })
    }

    if (mergeResult.confidenceScore < 70) {
      recommendedActions.push('Low confidence score - consider re-running parallel agents')
    }

    return {
      summary: `Merged findings from ${parallelOutputs.length} parallel agents`,
      mergedFindings: mergeResult.mergedFindings,
      contributingAgents: parallelOutputs.map(output => ({
        agentId: output.agentId,
        role: output.agentRole,
        phase: output.phase
      })),
      conflictResolution: {
        totalConflicts: mergeResult.conflicts.length,
        resolved,
        unresolved: mergeResult.unresolvedConflicts.length,
        strategy: mergeResult.resolutionStrategy
      },
      confidence: mergeResult.confidenceScore,
      recommendedActions: recommendedActions.length > 0 ? recommendedActions : ['No additional actions required']
    }
  }

  /**
   * Store merge result in Memory MCP for future reference
   */
  private async storeMergeResult(
    mergeResult: MergeResult,
    parallelOutputs: ParallelOutput[]
  ): Promise<void> {
    try {
      const memoryKey = `merge_${Date.now()}_${parallelOutputs.map(o => o.agentId).join('_')}`

      await this.requestMCP('memory', {
        action: 'create_entities',
        entities: [{
          name: memoryKey,
          entityType: 'merge_result',
          observations: [
            `Timestamp: ${new Date().toISOString()}`,
            `Contributing Agents: ${mergeResult.contributingAgents.join(', ')}`,
            `Confidence Score: ${mergeResult.confidenceScore}`,
            `Conflicts Resolved: ${mergeResult.conflicts.length - mergeResult.unresolvedConflicts.length}`,
            `Conflicts Unresolved: ${mergeResult.unresolvedConflicts.length}`,
            `Resolution Strategy: ${mergeResult.resolutionStrategy}`
          ]
        }]
      })

      console.log(`💾 Merge result stored: ${memoryKey}`)
    } catch (error: any) {
      console.error('⚠️  Failed to store merge result:', error.message)
    }
  }
}
