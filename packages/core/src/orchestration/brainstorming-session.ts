/**
 * BrainstormingSession - Structured 4-round collaborative decision-making
 *
 * BMAD Gaps Closing: Structured Brainstorming
 *
 * Extends PartySession with a formalized 4-round process:
 * 1. Independent Proposals - Each agent proposes independently
 * 2. Cross Critique - Agents critique each other's proposals
 * 3. Synthesis - Combine best ideas and vote
 * 4. Decision - Final decision + ADR generation
 *
 * This enables high-quality collaborative decisions with full audit trail.
 */

import { PartySession } from './party-session.js'
import type {
  AgentWithRoleSkills,
  BrainstormingPhase,
  BrainstormingRound,
  BrainstormingProposal,
  Critique,
  SynthesisPoint,
  BrainstormingVote,
  BrainstormingConfig,
  BrainstormingResult,
  Agreement,
  PartyRound
} from './types.js'
import { MergeAgent } from '../agents/roles/merge-coordinator.agent.js'
import * as fs from 'fs/promises'
import * as path from 'path'

/**
 * Default brainstorming configuration
 */
const DEFAULT_CONFIG: BrainstormingConfig = {
  topic: '',
  convergenceThreshold: 0.8,
  maxRoundDurationMs: 300000, // 5 minutes
  generateADR: true,
  requireUnanimity: false,
  minParticipation: 0.6
}

/**
 * BrainstormingSession extends PartySession with structured 4-round format
 */
export class BrainstormingSession extends PartySession {
  private config: BrainstormingConfig
  private brainstormingRounds: BrainstormingRound[] = []
  private proposals: Map<string, BrainstormingProposal[]> = new Map()
  private critiques: Map<string, Critique[]> = new Map()
  private synthesisPoints: SynthesisPoint[] = []
  private sessionId: string
  private participants: string[]
  private startTime: Date
  private convergenceHistory: number[] = []

  constructor(
    id: string,
    name: string,
    description: string,
    agents: AgentWithRoleSkills[],
    config: Partial<BrainstormingConfig> = {},
    facilitator?: string,
    mergeAgent?: MergeAgent
  ) {
    super(id, name, description, agents, facilitator, mergeAgent)

    this.sessionId = id
    this.participants = agents.map(a => a.role.role_id)
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.startTime = new Date()

    // Initialize proposals map for each agent
    for (const agent of agents) {
      this.proposals.set(agent.role.role_id, [])
      this.critiques.set(agent.role.role_id, [])
    }
  }

  // ============================================================================
  // ROUND 1: INDEPENDENT PROPOSALS
  // ============================================================================

  /**
   * Execute Round 1: Each agent proposes independently
   *
   * Each agent submits proposals without seeing others' ideas.
   * This prevents anchoring bias and ensures diverse perspectives.
   */
  async executeRound1(): Promise<Map<string, BrainstormingProposal[]>> {
    console.log('\n🧠 ═══════════════════════════════════════════════════')
    console.log('🧠 BRAINSTORMING - ROUND 1: INDEPENDENT PROPOSALS')
    console.log('🧠 ═══════════════════════════════════════════════════')
    console.log(`📋 Topic: ${this.config.topic}`)
    console.log(`👥 Participants: ${this.participants.join(', ')}`)
    console.log('🧠 ═══════════════════════════════════════════════════\n')

    // Start the party round
    await this.startRound('independent_proposals')

    const round: BrainstormingRound = {
      roundNumber: 1,
      phase: 'independent_proposals',
      startTime: new Date(),
      proposals: new Map(),
      participationRate: 0,
      convergenceScore: 0
    }

    this.brainstormingRounds.push(round)

    // In a real implementation, each agent would be called to generate proposals
    // For now, we collect proposals through addProposal method
    return this.proposals
  }

  /**
   * Add a proposal from an agent during Round 1
   */
  addProposal(agentId: string, proposal: Omit<BrainstormingProposal, 'id' | 'agentId' | 'createdAt'>): BrainstormingProposal {
    if (!this.proposals.has(agentId)) {
      throw new Error(`Agent ${agentId} is not a participant in this brainstorming session`)
    }

    const fullProposal: BrainstormingProposal = {
      ...proposal,
      id: `proposal-${agentId}-${Date.now()}`,
      agentId,
      createdAt: new Date()
    }

    this.proposals.get(agentId)!.push(fullProposal)

    // Also add to party session output
    this.addAgentOutput(agentId, { type: 'proposal', proposal: fullProposal })

    // Send message to all
    this.sendMessage(agentId, 'all', `Proposed: "${proposal.title}"`, 'proposal')

    console.log(`📝 ${agentId} proposed: "${proposal.title}"`)
    console.log(`   Approach: ${proposal.approach.substring(0, 80)}...`)
    console.log(`   Confidence: ${(proposal.confidenceScore * 100).toFixed(0)}%`)

    return fullProposal
  }

  /**
   * Finalize Round 1 and calculate initial metrics
   */
  async finalizeRound1(): Promise<BrainstormingRound> {
    const round = this.brainstormingRounds[0]
    if (!round || round.phase !== 'independent_proposals') {
      throw new Error('Round 1 not started or already completed')
    }

    // Store proposals in round
    round.proposals = new Map(this.proposals)

    // Calculate participation rate
    let participatingAgents = 0
    for (const [_agentId, agentProposals] of this.proposals) {
      if (agentProposals.length > 0) {
        participatingAgents++
      }
    }
    round.participationRate = participatingAgents / this.participants.length

    // Calculate initial convergence (low at this stage)
    round.convergenceScore = this.calculateProposalSimilarity()

    round.endTime = new Date()
    round.durationMs = round.endTime.getTime() - round.startTime.getTime()

    // Track convergence
    this.convergenceHistory.push(round.convergenceScore)

    // Finalize party round
    await this.finalizeRound()

    console.log(`\n✅ Round 1 Complete`)
    console.log(`   Proposals: ${this.getTotalProposals()}`)
    console.log(`   Participation: ${(round.participationRate * 100).toFixed(0)}%`)
    console.log(`   Initial Convergence: ${(round.convergenceScore * 100).toFixed(0)}%\n`)

    return round
  }

  // ============================================================================
  // ROUND 2: CROSS CRITIQUE
  // ============================================================================

  /**
   * Execute Round 2: Agents critique each other's proposals
   *
   * Each agent reviews and scores proposals from other agents.
   * Provides structured feedback with pros, cons, and suggestions.
   */
  async executeRound2(): Promise<Map<string, Critique[]>> {
    console.log('\n🔍 ═══════════════════════════════════════════════════')
    console.log('🔍 BRAINSTORMING - ROUND 2: CROSS CRITIQUE')
    console.log('🔍 ═══════════════════════════════════════════════════')
    console.log(`📋 Reviewing ${this.getTotalProposals()} proposals`)
    console.log('🔍 ═══════════════════════════════════════════════════\n')

    await this.startRound('cross_critique')

    const round: BrainstormingRound = {
      roundNumber: 2,
      phase: 'cross_critique',
      startTime: new Date(),
      critiques: new Map(),
      participationRate: 0,
      convergenceScore: 0
    }

    this.brainstormingRounds.push(round)

    return this.critiques
  }

  /**
   * Add a critique from one agent to another's proposal
   */
  addCritique(
    fromAgent: string,
    toProposalId: string,
    critique: Omit<Critique, 'id' | 'fromAgent' | 'toProposalId' | 'toAgent' | 'createdAt'>
  ): Critique {
    // Find the proposal being critiqued
    let targetProposal: BrainstormingProposal | undefined
    let toAgent: string = ''

    for (const [agentId, agentProposals] of this.proposals) {
      const found = agentProposals.find(p => p.id === toProposalId)
      if (found) {
        targetProposal = found
        toAgent = agentId
        break
      }
    }

    if (!targetProposal) {
      throw new Error(`Proposal ${toProposalId} not found`)
    }

    if (fromAgent === toAgent) {
      throw new Error('Agents cannot critique their own proposals')
    }

    const fullCritique: Critique = {
      ...critique,
      id: `critique-${fromAgent}-${toProposalId}-${Date.now()}`,
      fromAgent,
      toProposalId,
      toAgent,
      createdAt: new Date()
    }

    if (!this.critiques.has(fromAgent)) {
      this.critiques.set(fromAgent, [])
    }
    this.critiques.get(fromAgent)!.push(fullCritique)

    // Add to party session
    this.addAgentOutput(fromAgent, { type: 'critique', critique: fullCritique })

    // Send message
    this.sendMessage(
      fromAgent,
      toAgent,
      `Critique of "${targetProposal.title}": Score ${critique.score}/10, ${critique.endorsement}`,
      'response'
    )

    const endorsementEmoji = {
      strong: '👍👍',
      moderate: '👍',
      weak: '🤔',
      opposed: '👎'
    }[critique.endorsement]

    console.log(`${endorsementEmoji} ${fromAgent} → ${toAgent}: Score ${critique.score}/10`)
    console.log(`   Endorsement: ${critique.endorsement}`)
    if (critique.blockers?.length) {
      console.log(`   ⚠️ Blockers: ${critique.blockers.join(', ')}`)
    }

    return fullCritique
  }

  /**
   * Finalize Round 2
   */
  async finalizeRound2(): Promise<BrainstormingRound> {
    const round = this.brainstormingRounds[1]
    if (!round || round.phase !== 'cross_critique') {
      throw new Error('Round 2 not started or already completed')
    }

    round.critiques = new Map(this.critiques)

    // Calculate participation
    let participatingAgents = 0
    for (const [_agentId, agentCritiques] of this.critiques) {
      if (agentCritiques.length > 0) {
        participatingAgents++
      }
    }
    round.participationRate = participatingAgents / this.participants.length

    // Calculate convergence based on critique alignment
    round.convergenceScore = this.calculateCritiqueConvergence()

    round.endTime = new Date()
    round.durationMs = round.endTime.getTime() - round.startTime.getTime()

    this.convergenceHistory.push(round.convergenceScore)

    await this.finalizeRound()

    console.log(`\n✅ Round 2 Complete`)
    console.log(`   Critiques: ${this.getTotalCritiques()}`)
    console.log(`   Participation: ${(round.participationRate * 100).toFixed(0)}%`)
    console.log(`   Convergence: ${(round.convergenceScore * 100).toFixed(0)}%\n`)

    return round
  }

  // ============================================================================
  // ROUND 3: SYNTHESIS
  // ============================================================================

  /**
   * Execute Round 3: Synthesis and voting
   *
   * Combines the best elements from proposals based on critique feedback.
   * Agents vote on synthesis points to determine final direction.
   */
  async executeRound3(): Promise<SynthesisPoint[]> {
    console.log('\n⚗️ ═══════════════════════════════════════════════════')
    console.log('⚗️ BRAINSTORMING - ROUND 3: SYNTHESIS')
    console.log('⚗️ ═══════════════════════════════════════════════════')
    console.log('🔄 Combining best ideas from proposals and critiques')
    console.log('⚗️ ═══════════════════════════════════════════════════\n')

    await this.startRound('synthesis')

    const round: BrainstormingRound = {
      roundNumber: 3,
      phase: 'synthesis',
      startTime: new Date(),
      synthesisPoints: [],
      participationRate: 0,
      convergenceScore: 0
    }

    this.brainstormingRounds.push(round)

    // Auto-generate synthesis points from top proposals
    this.synthesisPoints = this.generateSynthesisPoints()

    return this.synthesisPoints
  }

  /**
   * Generate synthesis points from proposals and critiques
   */
  private generateSynthesisPoints(): SynthesisPoint[] {
    const points: SynthesisPoint[] = []

    // Rank proposals by average critique score
    const proposalScores: Map<string, { proposal: BrainstormingProposal; avgScore: number; critiques: Critique[] }> = new Map()

    for (const [_agentId, agentProposals] of this.proposals) {
      for (const proposal of agentProposals) {
        const critiquesForProposal: Critique[] = []

        for (const [_critiqueAgent, agentCritiques] of this.critiques) {
          const matching = agentCritiques.filter(c => c.toProposalId === proposal.id)
          critiquesForProposal.push(...matching)
        }

        const avgScore = critiquesForProposal.length > 0
          ? critiquesForProposal.reduce((sum, c) => sum + c.score, 0) / critiquesForProposal.length
          : proposal.confidenceScore * 10

        proposalScores.set(proposal.id, {
          proposal,
          avgScore,
          critiques: critiquesForProposal
        })
      }
    }

    // Sort by score
    const sortedProposals = Array.from(proposalScores.values())
      .sort((a, b) => b.avgScore - a.avgScore)

    // Create synthesis points from top proposals
    for (let i = 0; i < Math.min(3, sortedProposals.length); i++) {
      const { proposal, avgScore, critiques } = sortedProposals[i]

      // Incorporate suggestions from critiques
      const allSuggestions = critiques.flatMap(c => c.suggestions)
      const synthesizedApproach = this.synthesizeApproach(proposal, allSuggestions)

      const point: SynthesisPoint = {
        id: `synthesis-${i + 1}-${Date.now()}`,
        topic: proposal.title,
        synthesizedApproach,
        contributingProposals: [proposal.id],
        contributingAgents: [proposal.agentId, ...critiques.map(c => c.fromAgent)],
        votes: [],
        consensusLevel: 'split',
        finalScore: avgScore,
        createdAt: new Date()
      }

      points.push(point)

      console.log(`📌 Synthesis Point ${i + 1}: "${proposal.title}"`)
      console.log(`   Base Score: ${avgScore.toFixed(1)}/10`)
      console.log(`   Contributors: ${point.contributingAgents.join(', ')}`)
    }

    return points
  }

  /**
   * Synthesize approach by incorporating suggestions
   */
  private synthesizeApproach(proposal: BrainstormingProposal, suggestions: string[]): string {
    let approach = proposal.approach

    if (suggestions.length > 0) {
      approach += '\n\n**Incorporated Feedback:**\n'
      for (const suggestion of suggestions.slice(0, 3)) {
        approach += `- ${suggestion}\n`
      }
    }

    return approach
  }

  /**
   * Vote on a synthesis point
   */
  voteSynthesis(voter: string, synthesisPointId: string, score: number, reasoning: string, conditions?: string[]): BrainstormingVote {
    const point = this.synthesisPoints.find(p => p.id === synthesisPointId)
    if (!point) {
      throw new Error(`Synthesis point ${synthesisPointId} not found`)
    }

    const vote: BrainstormingVote = {
      voter,
      synthesisPointId,
      score,
      reasoning,
      conditions,
      timestamp: new Date()
    }

    point.votes.push(vote)

    // Update consensus level
    point.consensusLevel = this.calculateConsensusLevel(point.votes)
    point.finalScore = point.votes.reduce((sum, v) => sum + v.score, 0) / point.votes.length

    this.addAgentOutput(voter, { type: 'vote', vote })
    this.sendMessage(voter, 'all', `Voted ${score}/10 on "${point.topic}"`, 'vote')

    console.log(`🗳️ ${voter} voted ${score}/10 on "${point.topic}"`)

    return vote
  }

  /**
   * Calculate consensus level from votes
   */
  private calculateConsensusLevel(votes: BrainstormingVote[]): 'unanimous' | 'majority' | 'split' | 'contested' {
    if (votes.length === 0) return 'split'

    const avgScore = votes.reduce((sum, v) => sum + v.score, 0) / votes.length
    const variance = votes.reduce((sum, v) => sum + Math.pow(v.score - avgScore, 2), 0) / votes.length

    // All scores >= 7 = unanimous
    if (votes.every(v => v.score >= 7)) return 'unanimous'

    // Low variance = majority
    if (variance < 2) return 'majority'

    // High variance but positive avg = split
    if (avgScore >= 5) return 'split'

    // Low avg = contested
    return 'contested'
  }

  /**
   * Finalize Round 3
   */
  async finalizeRound3(): Promise<BrainstormingRound> {
    const round = this.brainstormingRounds[2]
    if (!round || round.phase !== 'synthesis') {
      throw new Error('Round 3 not started or already completed')
    }

    round.synthesisPoints = [...this.synthesisPoints]

    // Calculate participation from votes
    const voters = new Set<string>()
    for (const point of this.synthesisPoints) {
      for (const vote of point.votes) {
        voters.add(vote.voter)
      }
    }
    round.participationRate = voters.size / this.participants.length

    // Convergence based on voting agreement
    round.convergenceScore = this.calculateVotingConvergence()

    round.endTime = new Date()
    round.durationMs = round.endTime.getTime() - round.startTime.getTime()

    this.convergenceHistory.push(round.convergenceScore)

    await this.finalizeRound()

    console.log(`\n✅ Round 3 Complete`)
    console.log(`   Synthesis Points: ${this.synthesisPoints.length}`)
    console.log(`   Total Votes: ${this.synthesisPoints.reduce((sum, p) => sum + p.votes.length, 0)}`)
    console.log(`   Convergence: ${(round.convergenceScore * 100).toFixed(0)}%\n`)

    return round
  }

  // ============================================================================
  // ROUND 4: DECISION
  // ============================================================================

  /**
   * Execute Round 4: Final decision + ADR generation
   *
   * Determines the winning approach and generates an ADR documenting the decision.
   */
  async executeRound4(): Promise<{ decision: Agreement; adr?: string; adrPath?: string }> {
    console.log('\n✅ ═══════════════════════════════════════════════════')
    console.log('✅ BRAINSTORMING - ROUND 4: DECISION')
    console.log('✅ ═══════════════════════════════════════════════════')
    console.log('🎯 Determining final decision')
    console.log('✅ ═══════════════════════════════════════════════════\n')

    await this.startRound('decision')

    const round: BrainstormingRound = {
      roundNumber: 4,
      phase: 'decision',
      startTime: new Date(),
      participationRate: 1.0, // Decision is automatic
      convergenceScore: 0
    }

    this.brainstormingRounds.push(round)

    // Determine winner
    const winner = this.determineWinner()

    if (!winner) {
      throw new Error('No synthesis points to decide from')
    }

    // Create agreement
    const decision: Agreement = {
      topic: this.config.topic,
      decision: winner.synthesizedApproach,
      supportingAgents: winner.contributingAgents,
      confidence: winner.finalScore / 10,
      reasoning: `Selected based on highest score (${winner.finalScore.toFixed(1)}/10) with ${winner.consensusLevel} consensus`,
      alternatives: this.synthesisPoints
        .filter(p => p.id !== winner.id)
        .map(p => p.topic),
      timestamp: new Date()
    }

    round.finalDecision = decision
    round.convergenceScore = decision.confidence

    this.convergenceHistory.push(round.convergenceScore)

    console.log(`🎯 Decision: "${winner.topic}"`)
    console.log(`   Score: ${winner.finalScore.toFixed(1)}/10`)
    console.log(`   Consensus: ${winner.consensusLevel}`)
    console.log(`   Supporters: ${winner.contributingAgents.join(', ')}`)

    // Generate ADR if enabled
    let adr: string | undefined
    let adrPath: string | undefined

    if (this.config.generateADR) {
      const adrResult = await this.generateADR(decision, winner)
      adr = adrResult.content
      adrPath = adrResult.path
      round.adrPath = adrPath
    }

    round.endTime = new Date()
    round.durationMs = round.endTime.getTime() - round.startTime.getTime()

    await this.finalizeRound()

    console.log(`\n✅ Round 4 Complete`)
    if (adrPath) {
      console.log(`   📄 ADR Generated: ${adrPath}`)
    }

    return { decision, adr, adrPath }
  }

  /**
   * Determine the winning synthesis point
   */
  private determineWinner(): SynthesisPoint | undefined {
    if (this.synthesisPoints.length === 0) return undefined

    // If requireUnanimity, only consider unanimous
    if (this.config.requireUnanimity) {
      const unanimous = this.synthesisPoints.find(p => p.consensusLevel === 'unanimous')
      if (unanimous) return unanimous
    }

    // Otherwise, highest score
    return this.synthesisPoints.reduce((best, current) =>
      current.finalScore > best.finalScore ? current : best
    )
  }

  /**
   * Generate ADR from the decision
   */
  private async generateADR(decision: Agreement, winner: SynthesisPoint): Promise<{ content: string; path?: string }> {
    const adrNumber = Date.now()
    const date = new Date().toISOString().split('T')[0]

    // Build options section from all proposals
    const allProposals = Array.from(this.proposals.values()).flat()
    const optionsSections = allProposals.map((p, i) => {
      const critiquesForProposal = Array.from(this.critiques.values())
        .flat()
        .filter(c => c.toProposalId === p.id)

      const pros = [...p.pros, ...critiquesForProposal.flatMap(c => c.pros)].slice(0, 3)
      const cons = [...p.cons, ...critiquesForProposal.flatMap(c => c.cons)].slice(0, 3)

      return `### Option ${i + 1}: ${p.title}

**Description**: ${p.description}

**Proposed by**: ${p.agentId}

**Pros**:
${pros.map(pro => `* ${pro}`).join('\n')}

**Cons**:
${cons.map(con => `* ${con}`).join('\n')}
`
    }).join('\n---\n\n')

    const adrContent = `# ADR ${adrNumber}: ${this.config.topic}

**Date**: ${date}
**Status**: Accepted
**Deciders**: ${this.participants.join(', ')}
**Brainstorming Session**: ${this.sessionId}

---

## Context and Problem Statement

${this.config.context || `This decision was made through a structured brainstorming session to address: ${this.config.topic}`}

${this.config.constraints?.length ? `**Constraints:**\n${this.config.constraints.map(c => `* ${c}`).join('\n')}` : ''}

---

## Decision Drivers

* Input from ${this.participants.length} agents
* ${this.getTotalProposals()} proposals considered
* ${this.getTotalCritiques()} cross-critiques analyzed
* ${this.synthesisPoints.length} synthesis points evaluated
* Convergence score: ${(this.convergenceHistory[this.convergenceHistory.length - 1] * 100).toFixed(0)}%

---

## Considered Options

${optionsSections}

---

## Decision Outcome

**Chosen option**: "${winner.topic}"

### Rationale

${decision.reasoning}

**Final Score**: ${winner.finalScore.toFixed(1)}/10
**Consensus Level**: ${winner.consensusLevel}
**Supporting Agents**: ${decision.supportingAgents.join(', ')}

### Synthesized Approach

${decision.decision}

---

## Alternatives Considered

${decision.alternatives.map(alt => `* ${alt}`).join('\n')}

---

## Consequences

### Positive Consequences

* Decision made with full team input
* All perspectives considered and documented
* Clear audit trail of decision process

### Potential Risks

* Implementation complexity may vary from estimates
* Team alignment needed during execution

---

## Session Metrics

| Metric | Value |
|--------|-------|
| Total Rounds | 4 |
| Proposals | ${this.getTotalProposals()} |
| Critiques | ${this.getTotalCritiques()} |
| Synthesis Points | ${this.synthesisPoints.length} |
| Participation | ${(this.getAverageParticipation() * 100).toFixed(0)}% |
| Final Convergence | ${(decision.confidence * 100).toFixed(0)}% |
| Duration | ${this.getSessionDuration()} |

---

**Generated by**: BrainstormingSession
**Session ID**: ${this.sessionId}
**Timestamp**: ${new Date().toISOString()}
`

    // Save if path provided
    let savedPath: string | undefined
    if (this.config.adrOutputPath) {
      try {
        const outputDir = path.dirname(this.config.adrOutputPath)
        await fs.mkdir(outputDir, { recursive: true })
        await fs.writeFile(this.config.adrOutputPath, adrContent, 'utf-8')
        savedPath = this.config.adrOutputPath
        console.log(`📄 ADR saved to: ${savedPath}`)
      } catch (error) {
        console.error(`Failed to save ADR: ${error}`)
      }
    }

    return { content: adrContent, path: savedPath }
  }

  // ============================================================================
  // FULL EXECUTION
  // ============================================================================

  /**
   * Execute full 4-round brainstorming session
   *
   * This is the main entry point for running a complete brainstorming session.
   * Caller provides proposals and critiques between rounds.
   */
  async execute(): Promise<BrainstormingResult> {
    console.log('\n🎯 ═══════════════════════════════════════════════════════════')
    console.log('🎯 STARTING STRUCTURED BRAINSTORMING SESSION')
    console.log('🎯 ═══════════════════════════════════════════════════════════')
    console.log(`📋 Topic: ${this.config.topic}`)
    console.log(`👥 Participants: ${this.participants.join(', ')}`)
    console.log(`🎯 Convergence Threshold: ${(this.config.convergenceThreshold * 100).toFixed(0)}%`)
    console.log('🎯 ═══════════════════════════════════════════════════════════\n')

    let success = true
    let completionReason: 'consensus' | 'max_rounds' | 'timeout' | 'manual' = 'max_rounds'
    let finalDecision: Agreement

    try {
      // Round 1: Independent Proposals
      await this.executeRound1()
      // Note: Caller should call addProposal for each agent
      // Then call finalizeRound1()

      // Check if we already have proposals (for automated flow)
      if (this.getTotalProposals() === 0) {
        console.log('⏳ Waiting for proposals... (call addProposal for each agent)')
        return this.buildPendingResult()
      }

      await this.finalizeRound1()

      // Round 2: Cross Critique
      await this.executeRound2()
      // Note: Caller should call addCritique for each agent
      // Then call finalizeRound2()

      if (this.getTotalCritiques() === 0) {
        console.log('⏳ Waiting for critiques... (call addCritique for each agent)')
        return this.buildPendingResult()
      }

      await this.finalizeRound2()

      // Round 3: Synthesis
      await this.executeRound3()

      // Auto-generate synthesis points
      if (this.synthesisPoints.length === 0) {
        throw new Error('No synthesis points generated')
      }

      await this.finalizeRound3()

      // Check convergence
      if (this.hasReachedConsensus(this.config.convergenceThreshold)) {
        completionReason = 'consensus'
      }

      // Round 4: Decision
      const { decision, adr, adrPath } = await this.executeRound4()
      finalDecision = decision

      // Complete the party session
      await this.complete()

      return {
        sessionId: this.sessionId,
        topic: this.config.topic,
        participants: this.participants,
        rounds: this.brainstormingRounds,
        finalDecision,
        generatedADR: adr,
        adrPath,
        totalDurationMs: Date.now() - this.startTime.getTime(),
        convergenceHistory: this.convergenceHistory,
        success,
        completionReason
      }
    } catch (error) {
      success = false
      console.error('Brainstorming session failed:', error)

      return {
        sessionId: this.sessionId,
        topic: this.config.topic,
        participants: this.participants,
        rounds: this.brainstormingRounds,
        finalDecision: {
          topic: this.config.topic,
          decision: 'Session failed',
          supportingAgents: [],
          confidence: 0,
          reasoning: `Error: ${error}`,
          alternatives: [],
          timestamp: new Date()
        },
        totalDurationMs: Date.now() - this.startTime.getTime(),
        convergenceHistory: this.convergenceHistory,
        success: false,
        completionReason: 'manual'
      }
    }
  }

  /**
   * Build result for pending state (waiting for input)
   */
  private buildPendingResult(): BrainstormingResult {
    return {
      sessionId: this.sessionId,
      topic: this.config.topic,
      participants: this.participants,
      rounds: this.brainstormingRounds,
      finalDecision: {
        topic: this.config.topic,
        decision: 'Pending',
        supportingAgents: [],
        confidence: 0,
        reasoning: 'Session awaiting input',
        alternatives: [],
        timestamp: new Date()
      },
      totalDurationMs: Date.now() - this.startTime.getTime(),
      convergenceHistory: this.convergenceHistory,
      success: false,
      completionReason: 'manual'
    }
  }

  // ============================================================================
  // METRICS & UTILITIES
  // ============================================================================

  /**
   * Get total number of proposals
   */
  getTotalProposals(): number {
    let total = 0
    for (const [_agentId, agentProposals] of this.proposals) {
      total += agentProposals.length
    }
    return total
  }

  /**
   * Get total number of critiques
   */
  getTotalCritiques(): number {
    let total = 0
    for (const [_agentId, agentCritiques] of this.critiques) {
      total += agentCritiques.length
    }
    return total
  }

  /**
   * Calculate proposal similarity (for convergence)
   */
  private calculateProposalSimilarity(): number {
    // Simple heuristic: if proposals mention similar keywords, higher convergence
    const allProposals = Array.from(this.proposals.values()).flat()
    if (allProposals.length < 2) return 0

    // Just return a baseline - real implementation would use NLP
    return 0.3
  }

  /**
   * Calculate critique convergence
   */
  private calculateCritiqueConvergence(): number {
    const allCritiques = Array.from(this.critiques.values()).flat()
    if (allCritiques.length < 2) return 0.3

    // Check endorsement alignment
    const endorsements = allCritiques.map(c => c.endorsement)
    const strongOrModerate = endorsements.filter(e => e === 'strong' || e === 'moderate').length
    return strongOrModerate / endorsements.length
  }

  /**
   * Calculate voting convergence
   */
  private calculateVotingConvergence(): number {
    if (this.synthesisPoints.length === 0) return 0

    // Average consensus level across points
    const consensusScores = {
      unanimous: 1.0,
      majority: 0.8,
      split: 0.5,
      contested: 0.2
    }

    const totalScore = this.synthesisPoints.reduce(
      (sum, p) => sum + consensusScores[p.consensusLevel],
      0
    )

    return totalScore / this.synthesisPoints.length
  }

  /**
   * Get average participation rate
   */
  private getAverageParticipation(): number {
    if (this.brainstormingRounds.length === 0) return 0

    const totalRate = this.brainstormingRounds.reduce(
      (sum, r) => sum + r.participationRate,
      0
    )

    return totalRate / this.brainstormingRounds.length
  }

  /**
   * Get session duration as string
   */
  private getSessionDuration(): string {
    const ms = Date.now() - this.startTime.getTime()
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)

    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    }
    return `${seconds}s`
  }

  /**
   * Get all proposals (read-only)
   */
  getProposals(): Map<string, BrainstormingProposal[]> {
    return new Map(this.proposals)
  }

  /**
   * Get all critiques (read-only)
   */
  getCritiques(): Map<string, Critique[]> {
    return new Map(this.critiques)
  }

  /**
   * Get synthesis points (read-only)
   */
  getSynthesisPoints(): SynthesisPoint[] {
    return [...this.synthesisPoints]
  }

  /**
   * Get brainstorming-specific rounds
   */
  getBrainstormingRounds(): BrainstormingRound[] {
    return [...this.brainstormingRounds]
  }

  /**
   * Get convergence history
   */
  getConvergenceHistory(): number[] {
    return [...this.convergenceHistory]
  }

  /**
   * Get session configuration
   */
  getConfig(): BrainstormingConfig {
    return { ...this.config }
  }
}

/**
 * Factory function to create a brainstorming session
 */
export function createBrainstormingSession(
  topic: string,
  agents: AgentWithRoleSkills[],
  options: Partial<Omit<BrainstormingConfig, 'topic'>> = {}
): BrainstormingSession {
  const sessionId = `brainstorm-${Date.now()}`

  return new BrainstormingSession(
    sessionId,
    `Brainstorming: ${topic}`,
    `Structured 4-round brainstorming session for: ${topic}`,
    agents,
    { ...options, topic }
  )
}
