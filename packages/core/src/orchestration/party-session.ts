/**
 * PartySession - Manages collaborative multi-agent sessions
 *
 * BMAD Phase 4: Party Mode - Collaborative Sessions
 *
 * Enables real-time collaboration where all agents work together,
 * discuss ideas, reach consensus, and produce unified outputs.
 *
 * Features:
 * - Multi-round discussions
 * - Bidirectional communication between agents
 * - Consensus building with convergence detection
 * - Conflict resolution using MergeAgent
 * - Session lifecycle management
 */

import type {
  PartySession as IPartySession,
  PartyState,
  PartyRound,
  PartyMessage,
  Agreement,
  Proposal,
  Vote,
  AgentState,
  AgentWithRoleSkills,
  ConflictDetection
} from './types.js'
import { MergeAgent } from '../agents/roles/merge-coordinator.agent.js'

/**
 * PartySession - Manages collaborative multi-agent sessions
 *
 * Enables real-time collaboration where all agents work together,
 * discuss ideas, reach consensus, and produce unified outputs.
 */
export class PartySession {
  private session: IPartySession
  private mergeAgent: MergeAgent

  constructor(
    id: string,
    name: string,
    description: string,
    agents: AgentWithRoleSkills[],
    facilitator?: string,
    mergeAgent?: MergeAgent
  ) {
    this.session = {
      id,
      name,
      description,
      agents: agents.map(a => a.role.role_id),
      facilitator,
      state: this.createInitialState(id, agents),
      rounds: [],
      status: 'initializing',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.mergeAgent = mergeAgent || new MergeAgent()
  }

  /**
   * Initialize party state
   */
  private createInitialState(partyId: string, agents: AgentWithRoleSkills[]): PartyState {
    return {
      partyId,
      activeAgents: new Set(agents.map(a => a.role.role_id)),
      sharedContext: {
        decisions: {},
        artifacts: [],
        votes: [],
        openQuestions: [],
        proposals: []
      },
      messages: [],
      agreements: [],
      conflictLog: [],
      currentRound: 0,
      convergenceScore: 0,

      // Base AgentState fields
      task: '',
      taskType: 'feature',
      context: {},
      currentAgent: 'party-facilitator',
      agentResults: [],
      mcpData: {},
      nextAction: 'start_party',
      requiresApproval: false
    }
  }

  /**
   * Start a new round of discussion
   */
  async startRound(phase: string): Promise<PartyRound> {
    const roundNumber = this.session.rounds.length + 1

    console.log(`\n🎉 ═══════════════════════════════════════════════════`)
    console.log(`🎉 PARTY MODE - ROUND ${roundNumber}`)
    console.log(`🎉 ═══════════════════════════════════════════════════`)
    console.log(`📍 Phase: ${phase}`)
    console.log(`👥 Active Agents: ${Array.from(this.session.state.activeAgents).join(', ')}`)
    console.log(`🎉 ═══════════════════════════════════════════════════\n`)

    const round: PartyRound = {
      roundNumber,
      phase,
      agentOutputs: new Map(),
      messages: [],
      agreements: [],
      conflicts: [],
      summary: '',
      convergenceScore: 0,
      duration: 0
    }

    this.session.state.currentRound = roundNumber
    this.session.rounds.push(round)
    this.session.status = 'active'

    return round
  }

  /**
   * Add agent output to current round
   */
  addAgentOutput(agentId: string, output: any): void {
    const currentRound = this.session.rounds[this.session.rounds.length - 1]
    if (!currentRound) {
      throw new Error('No active round. Call startRound() first.')
    }

    currentRound.agentOutputs.set(agentId, output)

    console.log(`✅ ${agentId} contributed to round ${currentRound.roundNumber}`)
  }

  /**
   * Send message between agents
   */
  sendMessage(from: string, to: string | 'all', content: string, type: PartyMessage['type']): void {
    const message: PartyMessage = {
      from,
      to,
      content,
      type,
      timestamp: new Date()
    }

    this.session.state.messages.push(message)

    const currentRound = this.session.rounds[this.session.rounds.length - 1]
    if (currentRound) {
      currentRound.messages.push(message)
    }

    console.log(`💬 [${from} → ${to}] ${type}: ${content.substring(0, 60)}...`)
  }

  /**
   * Propose a decision
   */
  proposeDecision(proposer: string, title: string, description: string): string {
    const proposal: Proposal = {
      id: `proposal-${Date.now()}`,
      proposer,
      title,
      description,
      votes: [],
      status: 'pending',
      createdAt: new Date()
    }

    this.session.state.sharedContext.proposals.push(proposal)

    console.log(`📋 ${proposer} proposed: "${title}"`)

    return proposal.id
  }

  /**
   * Vote on a proposal
   */
  vote(voter: string, proposalId: string, choice: Vote['choice'], reasoning?: string): void {
    const proposal = this.session.state.sharedContext.proposals.find(p => p.id === proposalId)
    if (!proposal) {
      throw new Error(`Proposal ${proposalId} not found`)
    }

    const vote: Vote = {
      voter,
      choice,
      confidence: 0.8,
      reasoning,
      timestamp: new Date()
    }

    proposal.votes.push(vote)

    console.log(`🗳️  ${voter} voted "${choice}" on "${proposal.title}"`)
  }

  /**
   * Finalize round with consensus building
   */
  async finalizeRound(): Promise<PartyRound> {
    const currentRound = this.session.rounds[this.session.rounds.length - 1]
    if (!currentRound) {
      throw new Error('No active round to finalize')
    }

    console.log(`\n🔍 Analyzing round ${currentRound.roundNumber}...`)

    // 1. Collect all agent outputs
    const outputs = Array.from(currentRound.agentOutputs.entries()).map(([agentId, output]) => ({
      agentId,
      agentRole: agentId,
      phase: currentRound.phase,
      findings: output,
      confidence: output.confidence || 0.8,
      timestamp: new Date().toISOString()
    }))

    // 2. Use MergeAgent to consolidate and detect conflicts
    const mergeResult = await this.mergeAgent.consolidateParallelOutputs({
      parallelOutputs: outputs,
      task: this.session.state.task,
      phase: currentRound.phase
    })

    // 3. Extract agreements and conflicts
    currentRound.conflicts = mergeResult.conflicts
    currentRound.agreements = this.extractAgreements(mergeResult)
    currentRound.summary = mergeResult.summary || 'Round completed'

    // 4. Calculate convergence score
    currentRound.convergenceScore = this.calculateConvergence(currentRound)
    this.session.state.convergenceScore = currentRound.convergenceScore

    // 5. Update session state
    this.session.state.conflictLog.push(...mergeResult.conflicts)
    this.session.state.agreements.push(...currentRound.agreements)

    console.log(`✅ Round ${currentRound.roundNumber} finalized`)
    console.log(`📊 Convergence: ${(currentRound.convergenceScore * 100).toFixed(0)}%`)
    console.log(`🤝 Agreements: ${currentRound.agreements.length}`)
    console.log(`⚠️  Conflicts: ${currentRound.conflicts.filter(c => c.severity !== 'Low').length}\n`)

    return currentRound
  }

  /**
   * Extract agreements from merge result
   */
  private extractAgreements(mergeResult: any): Agreement[] {
    const agreements: Agreement[] = []

    // Extract from merged findings
    if (mergeResult.mergedFindings) {
      for (const [key, value] of Object.entries(mergeResult.mergedFindings)) {
        if (value && typeof value === 'object' && 'agreement' in value) {
          agreements.push({
            topic: key,
            decision: JSON.stringify(value),
            supportingAgents: mergeResult.contributingAgents || [],
            confidence: mergeResult.confidenceScore / 100,
            reasoning: mergeResult.resolutionStrategy || '',
            alternatives: [],
            timestamp: new Date()
          })
        }
      }
    }

    return agreements
  }

  /**
   * Calculate convergence score (0-1)
   * 1.0 = full consensus, 0.0 = total disagreement
   */
  private calculateConvergence(round: PartyRound): number {
    const totalOutputs = round.agentOutputs.size
    if (totalOutputs === 0) return 0

    const criticalConflicts = round.conflicts.filter(c =>
      c.severity === 'High' || c.severity === 'Critical'
    ).length

    const agreementScore = round.agreements.length / Math.max(totalOutputs, 1)
    const conflictPenalty = criticalConflicts / Math.max(totalOutputs, 1)

    return Math.max(0, Math.min(1, agreementScore - conflictPenalty * 0.5))
  }

  /**
   * Check if party has reached consensus
   */
  hasReachedConsensus(threshold: number = 0.8): boolean {
    return this.session.state.convergenceScore >= threshold
  }

  /**
   * Complete party session
   */
  async complete(): Promise<IPartySession> {
    this.session.status = this.hasReachedConsensus() ? 'converged' : 'completed'
    this.session.updatedAt = new Date()

    console.log(`\n🎊 ═══════════════════════════════════════════════════`)
    console.log(`🎊 PARTY MODE COMPLETE`)
    console.log(`🎊 ═══════════════════════════════════════════════════`)
    console.log(`📊 Status: ${this.session.status}`)
    console.log(`🔄 Rounds: ${this.session.rounds.length}`)
    console.log(`🤝 Total Agreements: ${this.session.state.agreements.length}`)
    console.log(`⚠️  Unresolved Conflicts: ${this.getUnresolvedConflicts().length}`)
    console.log(`📈 Final Convergence: ${(this.session.state.convergenceScore * 100).toFixed(0)}%`)
    console.log(`🎊 ═══════════════════════════════════════════════════\n`)

    return this.session
  }

  /**
   * Get unresolved conflicts
   */
  private getUnresolvedConflicts(): ConflictDetection[] {
    return this.session.state.conflictLog.filter(c => !c.resolvable)
  }

  /**
   * Get session state
   */
  getState(): PartyState {
    return this.session.state
  }

  /**
   * Get session metadata
   */
  getSession(): IPartySession {
    return this.session
  }
}
