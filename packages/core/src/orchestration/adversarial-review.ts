/**
 * Adversarial Review Session - BMAD Integration
 *
 * Implements the BMAD adversarial review pattern where reviewers MUST find
 * issues. If no issues are found after maximum retries, a warning is returned
 * indicating the review may not be thorough enough.
 *
 * Key Principles:
 * - Reviewers MUST find at least one issue
 * - If no issues found, force re-analysis with stronger prompts
 * - Track review attempts and escalate prompting
 * - Distinguish between genuine "no issues" and shallow reviews
 *
 * @example
 * ```typescript
 * const session = new AdversarialReviewSession({
 *   minIssuesRequired: 1,
 *   maxRetries: 3
 * })
 * const result = await session.executeReview(artifact, reviewerAgent)
 * ```
 */

import { BaseAgent } from '../agents/base-agent'
import { AgentState, Artifact } from '../agents/types'

/**
 * Issue severity levels
 */
export type IssueSeverity = 'critical' | 'major' | 'minor' | 'suggestion'

/**
 * Issue category
 */
export type IssueCategory =
  | 'security'
  | 'performance'
  | 'maintainability'
  | 'correctness'
  | 'design'
  | 'testing'
  | 'documentation'
  | 'accessibility'
  | 'other'

/**
 * Individual issue found during review
 */
export interface ReviewIssue {
  /** Unique issue identifier */
  id: string
  /** Issue severity */
  severity: IssueSeverity
  /** Issue category */
  category: IssueCategory
  /** Short title */
  title: string
  /** Detailed description */
  description: string
  /** File path or location (if applicable) */
  location?: string
  /** Line number(s) (if applicable) */
  lineNumbers?: number[]
  /** Suggested fix */
  suggestedFix?: string
  /** Impact if not addressed */
  impact?: string
  /** Confidence in this finding (0-1) */
  confidence: number
}

/**
 * Result of an adversarial review
 */
export interface AdversarialReviewResult {
  /** Issues found during review */
  issues: ReviewIssue[]
  /** Whether the artifact was approved (no blocking issues) */
  approved: boolean
  /** Number of review attempts */
  attempts: number
  /** Warning message if no issues found after retries */
  warning?: string
  /** Summary of the review */
  summary: string
  /** Timestamp of review completion */
  timestamp: string
  /** Total review duration in milliseconds */
  durationMs: number
}

/**
 * Configuration for AdversarialReviewSession
 */
export interface AdversarialReviewConfig {
  /** Minimum number of issues required (default: 1) */
  minIssuesRequired?: number
  /** Maximum retry attempts (default: 3) */
  maxRetries?: number
  /** Issue severities that block approval */
  blockingSeverities?: IssueSeverity[]
  /** Enable verbose logging */
  verbose?: boolean
}

/**
 * Escalation prompts for retry attempts
 */
const ESCALATION_PROMPTS = [
  // Attempt 1: Standard review
  `Review this artifact critically. Look for issues in:
- Security vulnerabilities
- Performance problems
- Code maintainability
- Edge cases not handled
- Missing error handling
- Incomplete implementations`,

  // Attempt 2: Push harder
  `Your previous review found no issues. This is statistically unlikely.
Please review again with EXTREME scrutiny. Consider:
- What assumptions are being made?
- What edge cases are not covered?
- What could break under load?
- What security implications exist?
- What maintenance burden does this create?
You MUST find at least one area of concern.`,

  // Attempt 3: Final attempt
  `This is the final review attempt. No issues have been found yet.
Take a step back and think about:
- If you were a malicious actor, how would you exploit this?
- If this ran for 10 years, what problems would emerge?
- What would a senior architect criticize about this?
- What improvements would make this production-ready?
Provide AT LEAST suggestions for improvement if no bugs are found.`
]

/**
 * Adversarial Review Session
 *
 * Manages the adversarial review process for artifacts.
 */
export class AdversarialReviewSession {
  private minIssuesRequired: number
  private maxRetries: number
  private blockingSeverities: IssueSeverity[]
  private verbose: boolean

  constructor(config: AdversarialReviewConfig = {}) {
    this.minIssuesRequired = config.minIssuesRequired ?? 1
    this.maxRetries = config.maxRetries ?? 3
    this.blockingSeverities = config.blockingSeverities ?? ['critical', 'major']
    this.verbose = config.verbose ?? false
  }

  /**
   * Execute an adversarial review on an artifact
   *
   * @param artifact - The artifact to review
   * @param reviewerAgent - Agent performing the review
   * @param context - Additional context for the review
   * @returns Review result
   */
  async executeReview(
    artifact: Artifact,
    reviewerAgent: BaseAgent,
    context: Record<string, any> = {}
  ): Promise<AdversarialReviewResult> {
    const startTime = Date.now()
    let attempt = 0
    let allIssues: ReviewIssue[] = []

    while (attempt < this.maxRetries) {
      attempt++
      this.log(`Review attempt ${attempt}/${this.maxRetries}`)

      const escalationPrompt = ESCALATION_PROMPTS[attempt - 1] || ESCALATION_PROMPTS[2]

      const state = this.buildReviewState(artifact, escalationPrompt, context, attempt)
      const result = await reviewerAgent.execute(state)

      const issues = this.extractIssues(result)
      allIssues = [...allIssues, ...issues]

      this.log(`Attempt ${attempt} found ${issues.length} issues`)

      if (allIssues.length >= this.minIssuesRequired) {
        // Found enough issues, complete the review
        const hasBlockingIssues = this.hasBlockingIssues(allIssues)

        return {
          issues: this.deduplicateIssues(allIssues),
          approved: !hasBlockingIssues,
          attempts: attempt,
          summary: this.generateSummary(allIssues, attempt),
          timestamp: new Date().toISOString(),
          durationMs: Date.now() - startTime
        }
      }
    }

    // No issues found after all retries
    return {
      issues: allIssues,
      approved: true,
      attempts: attempt,
      warning: `No issues found after ${this.maxRetries} review attempts. ` +
        `This may indicate an incomplete review. Consider manual inspection.`,
      summary: this.generateNoIssuesSummary(attempt),
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime
    }
  }

  /**
   * Execute a quick review (single attempt, no escalation)
   *
   * @param artifact - The artifact to review
   * @param reviewerAgent - Agent performing the review
   * @returns Review issues found
   */
  async quickReview(
    artifact: Artifact,
    reviewerAgent: BaseAgent
  ): Promise<ReviewIssue[]> {
    const state = this.buildReviewState(artifact, ESCALATION_PROMPTS[0], {}, 1)
    const result = await reviewerAgent.execute(state)
    return this.extractIssues(result)
  }

  /**
   * Validate an artifact passes review (convenience method)
   *
   * @param artifact - Artifact to validate
   * @param reviewerAgent - Reviewer agent
   * @returns true if no blocking issues
   */
  async validateArtifact(
    artifact: Artifact,
    reviewerAgent: BaseAgent
  ): Promise<boolean> {
    const result = await this.executeReview(artifact, reviewerAgent)
    return result.approved
  }

  // Private methods

  private buildReviewState(
    artifact: Artifact,
    escalationPrompt: string,
    context: Record<string, any>,
    attempt: number
  ): AgentState {
    return {
      messages: [],
      task: `Adversarial Review (Attempt ${attempt})\n\n${escalationPrompt}`,
      taskType: 'architecture',
      context: {
        ...context,
        artifactToReview: artifact,
        reviewType: 'adversarial',
        attempt
      },
      currentAgent: 'adversarial-reviewer',
      agentResults: [],
      mcpData: {},
      nextAction: 'review',
      requiresApproval: false
    }
  }

  private extractIssues(result: Partial<AgentState>): ReviewIssue[] {
    const issues: ReviewIssue[] = []

    // Extract issues from agent results
    for (const agentResult of result.agentResults || []) {
      const output = agentResult.output

      if (output?.issues && Array.isArray(output.issues)) {
        for (const issue of output.issues) {
          issues.push(this.normalizeIssue(issue))
        }
      }

      // Also check artifacts for embedded issues
      for (const artifact of agentResult.artifacts || []) {
        const parsed = this.parseIssuesFromContent(artifact.content)
        issues.push(...parsed)
      }
    }

    // Check context for issues
    if (result.context?.reviewIssues) {
      const contextIssues = result.context.reviewIssues
      if (Array.isArray(contextIssues)) {
        for (const issue of contextIssues) {
          issues.push(this.normalizeIssue(issue))
        }
      }
    }

    return issues
  }

  private normalizeIssue(raw: any): ReviewIssue {
    return {
      id: raw.id || `issue-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      severity: this.normalizeSeverity(raw.severity),
      category: this.normalizeCategory(raw.category),
      title: raw.title || 'Untitled Issue',
      description: raw.description || '',
      location: raw.location,
      lineNumbers: raw.lineNumbers,
      suggestedFix: raw.suggestedFix,
      impact: raw.impact,
      confidence: typeof raw.confidence === 'number' ? raw.confidence : 0.8
    }
  }

  private normalizeSeverity(severity: any): IssueSeverity {
    const normalized = String(severity).toLowerCase()
    const valid: IssueSeverity[] = ['critical', 'major', 'minor', 'suggestion']
    return valid.includes(normalized as IssueSeverity)
      ? (normalized as IssueSeverity)
      : 'minor'
  }

  private normalizeCategory(category: any): IssueCategory {
    const normalized = String(category).toLowerCase()
    const valid: IssueCategory[] = [
      'security', 'performance', 'maintainability', 'correctness',
      'design', 'testing', 'documentation', 'accessibility', 'other'
    ]
    return valid.includes(normalized as IssueCategory)
      ? (normalized as IssueCategory)
      : 'other'
  }

  private parseIssuesFromContent(content: string): ReviewIssue[] {
    const issues: ReviewIssue[] = []

    // Parse markdown-style issues (## Issue: Title)
    const issuePattern = /## (?:Issue|Problem|Bug|Concern):\s*(.+?)(?:\n|$)([\s\S]*?)(?=## |$)/gi
    let match: RegExpExecArray | null

    while ((match = issuePattern.exec(content)) !== null) {
      const title = match[1].trim()
      const description = match[2].trim()

      issues.push({
        id: `parsed-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        severity: this.inferSeverityFromText(title + ' ' + description),
        category: this.inferCategoryFromText(title + ' ' + description),
        title,
        description,
        confidence: 0.7
      })
    }

    return issues
  }

  private inferSeverityFromText(text: string): IssueSeverity {
    const lower = text.toLowerCase()
    if (lower.includes('critical') || lower.includes('security') || lower.includes('vulnerability')) {
      return 'critical'
    }
    if (lower.includes('major') || lower.includes('bug') || lower.includes('error')) {
      return 'major'
    }
    if (lower.includes('suggestion') || lower.includes('improve') || lower.includes('consider')) {
      return 'suggestion'
    }
    return 'minor'
  }

  private inferCategoryFromText(text: string): IssueCategory {
    const lower = text.toLowerCase()
    if (lower.includes('security') || lower.includes('auth') || lower.includes('inject')) {
      return 'security'
    }
    if (lower.includes('performance') || lower.includes('slow') || lower.includes('memory')) {
      return 'performance'
    }
    if (lower.includes('test') || lower.includes('coverage')) {
      return 'testing'
    }
    if (lower.includes('design') || lower.includes('architecture')) {
      return 'design'
    }
    if (lower.includes('doc') || lower.includes('comment')) {
      return 'documentation'
    }
    return 'maintainability'
  }

  private hasBlockingIssues(issues: ReviewIssue[]): boolean {
    return issues.some(issue => this.blockingSeverities.includes(issue.severity))
  }

  private deduplicateIssues(issues: ReviewIssue[]): ReviewIssue[] {
    const seen = new Map<string, ReviewIssue>()

    for (const issue of issues) {
      const key = `${issue.title}-${issue.location || ''}`
      if (!seen.has(key) || seen.get(key)!.confidence < issue.confidence) {
        seen.set(key, issue)
      }
    }

    return Array.from(seen.values())
  }

  private generateSummary(issues: ReviewIssue[], attempts: number): string {
    const byCategory = new Map<IssueCategory, number>()
    const bySeverity = new Map<IssueSeverity, number>()

    for (const issue of issues) {
      byCategory.set(issue.category, (byCategory.get(issue.category) || 0) + 1)
      bySeverity.set(issue.severity, (bySeverity.get(issue.severity) || 0) + 1)
    }

    const lines = [
      `Adversarial Review Complete (${attempts} attempt${attempts > 1 ? 's' : ''})`,
      `Found ${issues.length} issue${issues.length !== 1 ? 's' : ''}:`,
      '',
      'By Severity:',
      ...Array.from(bySeverity.entries()).map(([s, c]) => `  - ${s}: ${c}`),
      '',
      'By Category:',
      ...Array.from(byCategory.entries()).map(([c, count]) => `  - ${c}: ${count}`)
    ]

    return lines.join('\n')
  }

  private generateNoIssuesSummary(attempts: number): string {
    return [
      `Adversarial Review Complete (${attempts} attempts)`,
      `No issues found after exhaustive review.`,
      '',
      'Recommendation: Consider manual review by a senior engineer.',
      'The absence of findings may indicate:',
      '- High-quality code/design',
      '- Review blind spots',
      '- Need for domain-specific expertise'
    ].join('\n')
  }

  private log(message: string): void {
    if (this.verbose) {
      console.log(`[AdversarialReview] ${message}`)
    }
  }
}
