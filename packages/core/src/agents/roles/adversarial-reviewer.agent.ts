import { BaseAgent } from "../base-agent"
import { AgentState, Artifact } from "../types"

/**
 * Adversarial Reviewer Agent - Critical Code Review Specialist
 *
 * Implements the BMAD adversarial review pattern where the reviewer
 * MUST find issues. This agent is specifically designed to be critical
 * and find problems that other reviewers might miss.
 *
 * Capabilities:
 * - Deep code analysis for hidden issues
 * - Security vulnerability detection
 * - Performance issue identification
 * - Design flaw detection
 * - Edge case discovery
 * - Best practice violations
 *
 * MCP Integrations:
 * - Memory MCP: Track review history and patterns
 * - Filesystem MCP: Read code for analysis
 * - GitHub MCP: Access PR details and history
 */
export class AdversarialReviewerAgent extends BaseAgent {
  constructor() {
    super('adversarial-reviewer', [
      'adversarial_review',
      'security_review',
      'code_review',
      'design_review',
      'performance_review',
      'issue_detection',
      'critical_analysis'
    ])
  }

  /**
   * Execute adversarial review workflow
   *
   * This agent is designed to ALWAYS find issues. If no obvious issues
   * exist, it will find suggestions for improvement.
   */
  async execute(state: AgentState): Promise<Partial<AgentState>> {
    this.log('🔴 Starting adversarial review...')

    try {
      const artifact = state.context?.artifactToReview as Artifact | undefined
      const attempt = state.context?.attempt || 1

      if (!artifact) {
        return this.reviewFromTask(state)
      }

      // STEP 1: Gather context
      this.log('Gathering review context...')
      const reviewHistory = await this.requestMCP('memory', {
        action: 'search_nodes',
        query: 'adversarial review issues',
        type: 'review',
        limit: 5
      })

      // STEP 2: Perform multi-perspective review
      this.log(`Review attempt ${attempt}...`)
      const issues = await this.performAdversarialReview(artifact, attempt, reviewHistory)

      // STEP 3: Store review results
      if (issues.length > 0) {
        await this.requestMCP('memory', {
          action: 'create_entities',
          entities: [{
            name: `Adversarial Review: ${new Date().toISOString()}`,
            entityType: 'review',
            observations: issues.map(i => `${i.severity}: ${i.title}`)
          }]
        })
      }

      // STEP 4: Create result
      const reviewDocument = this.formatReviewDocument(artifact, issues, attempt)

      const reviewArtifact = this.createArtifact(
        'documentation',
        reviewDocument,
        {
          reviewType: 'adversarial',
          issueCount: issues.length,
          attempt
        }
      )

      const result = this.createResult(
        issues.length > 0 ? 'success' : 'needs_handoff',
        {
          issues,
          issueCount: issues.length,
          reviewedArtifact: artifact.type,
          attempt
        },
        [reviewArtifact]
      )

      this.log(`✅ Found ${issues.length} issues in attempt ${attempt}`)

      return {
        agentResults: [...state.agentResults, result],
        context: {
          ...state.context,
          reviewIssues: issues,
          reviewComplete: true
        },
        nextAction: this.determineNextAction(issues)
      }

    } catch (error: any) {
      this.log(`Adversarial review failed: ${error.message}`, 'error')

      const errorResult = this.createResult('failed', { error: error.message }, [])

      return {
        agentResults: [...state.agentResults, errorResult],
        nextAction: 'error_recovery'
      }
    }
  }

  private async reviewFromTask(state: AgentState): Promise<Partial<AgentState>> {
    // If no specific artifact, review from task description
    const task = state.task
    const issues = await this.reviewGenericContent(task, state.context)

    const result = this.createResult(
      'success',
      {
        issues,
        issueCount: issues.length,
        reviewType: 'task-based'
      },
      []
    )

    return {
      agentResults: [...state.agentResults, result],
      context: {
        ...state.context,
        reviewIssues: issues
      },
      nextAction: 'developer'
    }
  }

  private async performAdversarialReview(
    artifact: Artifact,
    attempt: number,
    history: any
  ): Promise<ReviewIssue[]> {
    const escalationLevel = this.getEscalationLevel(attempt)

    const prompt = `You are an ADVERSARIAL REVIEWER. Your job is to find problems.
${escalationLevel}

## Content to Review (${artifact.type}):

${artifact.content}

## Review History:
${JSON.stringify(history, null, 2)}

## Your Mission:

You MUST find issues. Search aggressively for:

### 1. Security Issues
- Injection vulnerabilities (SQL, XSS, command)
- Authentication/authorization flaws
- Data exposure risks
- Insecure configurations
- Missing input validation

### 2. Performance Issues
- N+1 queries
- Unbounded operations
- Memory leaks
- Missing caching opportunities
- Inefficient algorithms

### 3. Reliability Issues
- Missing error handling
- Race conditions
- Unhandled edge cases
- Resource leaks
- Inconsistent state handling

### 4. Maintainability Issues
- Code duplication
- Poor naming
- Missing abstractions
- Tight coupling
- Missing documentation

### 5. Design Issues
- SOLID violations
- Anti-patterns
- Over-engineering
- Under-engineering
- Inconsistent patterns

### 6. Testing Gaps
- Missing test coverage
- Untested edge cases
- Missing integration tests
- Hardcoded test data

Return issues as JSON:
{
  "issues": [
    {
      "id": "ISSUE-001",
      "severity": "critical|major|minor|suggestion",
      "category": "security|performance|reliability|maintainability|design|testing",
      "title": "Short descriptive title",
      "description": "Detailed explanation of the issue",
      "location": "File or section reference",
      "lineNumbers": [1, 2, 3],
      "suggestedFix": "How to fix this issue",
      "impact": "What happens if not fixed",
      "confidence": 0.9
    }
  ]
}`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.1,
      maxTokens: 6144
    })
    return this.parseIssues(response.content)
  }

  private async reviewGenericContent(
    task: string,
    context: any
  ): Promise<ReviewIssue[]> {
    const prompt = `You are an ADVERSARIAL REVIEWER analyzing a task/plan.

## Task to Review:
${task}

## Context:
${JSON.stringify(context, null, 2)}

Find issues with the approach, plan, or requirements:

1. Ambiguities and unclear requirements
2. Missing edge cases
3. Potential implementation challenges
4. Security considerations not addressed
5. Performance concerns
6. Scalability issues
7. Maintenance burden
8. Missing acceptance criteria
9. Unrealistic assumptions
10. Integration risks

Return as JSON:
{
  "issues": [
    {
      "id": "ISSUE-001",
      "severity": "critical|major|minor|suggestion",
      "category": "requirements|design|implementation|testing",
      "title": "Issue title",
      "description": "Detailed description",
      "suggestedFix": "Recommendation",
      "confidence": 0.8
    }
  ]
}`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.1,
      maxTokens: 6144
    })
    return this.parseIssues(response.content)
  }

  private getEscalationLevel(attempt: number): string {
    if (attempt === 1) {
      return `## First Review Pass
Conduct a thorough review. Look for obvious and non-obvious issues.`
    }

    if (attempt === 2) {
      return `## Second Review Pass (ESCALATED)
Your first pass found no issues. This is SUSPICIOUS.
Look HARDER. Question every assumption. Be MORE critical.
Consider: What would break this under production load?`
    }

    return `## Final Review Pass (MAXIMUM SCRUTINY)
After ${attempt - 1} passes, no issues found. This is statistically unlikely.
Apply MAXIMUM scrutiny. Even if the code is perfect, find:
- Areas that COULD be improved
- Potential future issues
- Documentation gaps
- Alternative approaches
You MUST find at least suggestions for improvement.`
  }

  private parseIssues(content: any): ReviewIssue[] {
    const str = typeof content === 'string' ? content : JSON.stringify(content)
    const jsonMatch = str.match(/\{[\s\S]*\}/)

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        return (parsed.issues || []).map((issue: any) => this.normalizeIssue(issue))
      } catch {
        // Fall through
      }
    }

    // Try to extract issues from text if JSON parsing fails
    return this.extractIssuesFromText(str)
  }

  private normalizeIssue(raw: any): ReviewIssue {
    return {
      id: raw.id || `ISSUE-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      severity: this.normalizeSeverity(raw.severity),
      category: this.normalizeCategory(raw.category),
      title: raw.title || 'Untitled Issue',
      description: raw.description || '',
      location: raw.location,
      lineNumbers: raw.lineNumbers,
      suggestedFix: raw.suggestedFix,
      impact: raw.impact,
      confidence: typeof raw.confidence === 'number' ? raw.confidence : 0.7
    }
  }

  private normalizeSeverity(severity: any): IssueSeverity {
    const s = String(severity).toLowerCase()
    if (s === 'critical') return 'critical'
    if (s === 'major' || s === 'high') return 'major'
    if (s === 'suggestion' || s === 'low' || s === 'info') return 'suggestion'
    return 'minor'
  }

  private normalizeCategory(category: any): IssueCategory {
    const c = String(category).toLowerCase()
    const valid: IssueCategory[] = [
      'security', 'performance', 'reliability', 'maintainability',
      'design', 'testing', 'documentation', 'requirements', 'other'
    ]
    return valid.includes(c as IssueCategory) ? (c as IssueCategory) : 'other'
  }

  private extractIssuesFromText(text: string): ReviewIssue[] {
    const issues: ReviewIssue[] = []
    const lines = text.split('\n')

    let currentIssue: Partial<ReviewIssue> | null = null

    for (const line of lines) {
      // Look for issue patterns
      const issueMatch = line.match(/^#+\s*(Issue|Problem|Bug|Concern|Warning):\s*(.+)/i)
      if (issueMatch) {
        if (currentIssue?.title) {
          issues.push(this.normalizeIssue(currentIssue))
        }
        currentIssue = {
          title: issueMatch[2],
          description: '',
          severity: this.inferSeverityFromText(issueMatch[2])
        }
      } else if (currentIssue) {
        currentIssue.description = (currentIssue.description || '') + line + '\n'
      }
    }

    if (currentIssue?.title) {
      issues.push(this.normalizeIssue(currentIssue))
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
    if (lower.includes('suggest') || lower.includes('consider') || lower.includes('could')) {
      return 'suggestion'
    }
    return 'minor'
  }

  private formatReviewDocument(
    artifact: Artifact,
    issues: ReviewIssue[],
    attempt: number
  ): string {
    const bySeverity = {
      critical: issues.filter(i => i.severity === 'critical'),
      major: issues.filter(i => i.severity === 'major'),
      minor: issues.filter(i => i.severity === 'minor'),
      suggestion: issues.filter(i => i.severity === 'suggestion')
    }

    return `# Adversarial Review Report

**Date**: ${new Date().toISOString()}
**Artifact Type**: ${artifact.type}
**Review Attempt**: ${attempt}
**Total Issues Found**: ${issues.length}

## Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | ${bySeverity.critical.length} |
| 🟠 Major | ${bySeverity.major.length} |
| 🟡 Minor | ${bySeverity.minor.length} |
| 💡 Suggestion | ${bySeverity.suggestion.length} |

## Critical Issues

${bySeverity.critical.length > 0
  ? bySeverity.critical.map(i => this.formatIssue(i)).join('\n\n')
  : '_No critical issues found_'}

## Major Issues

${bySeverity.major.length > 0
  ? bySeverity.major.map(i => this.formatIssue(i)).join('\n\n')
  : '_No major issues found_'}

## Minor Issues

${bySeverity.minor.length > 0
  ? bySeverity.minor.map(i => this.formatIssue(i)).join('\n\n')
  : '_No minor issues found_'}

## Suggestions

${bySeverity.suggestion.length > 0
  ? bySeverity.suggestion.map(i => this.formatIssue(i)).join('\n\n')
  : '_No suggestions_'}

---

## Verdict

${issues.length === 0
  ? '⚠️ **WARNING**: No issues found. This is unusual for an adversarial review. Consider additional manual review.'
  : bySeverity.critical.length > 0
    ? '🔴 **BLOCKED**: Critical issues must be addressed before proceeding.'
    : bySeverity.major.length > 0
      ? '🟠 **CHANGES REQUESTED**: Major issues should be addressed.'
      : '🟢 **APPROVED WITH NOTES**: Minor issues and suggestions for improvement.'
}

---
*Generated by Adversarial Reviewer Agent*
`
  }

  private formatIssue(issue: ReviewIssue): string {
    return `### ${issue.id}: ${issue.title}

**Category**: ${issue.category}
**Confidence**: ${Math.round(issue.confidence * 100)}%
${issue.location ? `**Location**: ${issue.location}` : ''}
${issue.lineNumbers ? `**Lines**: ${issue.lineNumbers.join(', ')}` : ''}

${issue.description}

${issue.suggestedFix ? `**Suggested Fix**: ${issue.suggestedFix}` : ''}
${issue.impact ? `**Impact if not fixed**: ${issue.impact}` : ''}`
  }

  private determineNextAction(issues: ReviewIssue[]): string {
    const hasCritical = issues.some(i => i.severity === 'critical')
    const hasMajor = issues.some(i => i.severity === 'major')

    if (hasCritical) {
      return 'developer' // Must fix critical issues
    }
    if (hasMajor) {
      return 'developer' // Should fix major issues
    }
    return 'merge-coordinator' // Can proceed to merge
  }
}

type IssueSeverity = 'critical' | 'major' | 'minor' | 'suggestion'
type IssueCategory =
  | 'security'
  | 'performance'
  | 'reliability'
  | 'maintainability'
  | 'design'
  | 'testing'
  | 'documentation'
  | 'requirements'
  | 'other'

interface ReviewIssue {
  id: string
  severity: IssueSeverity
  category: IssueCategory
  title: string
  description: string
  location?: string
  lineNumbers?: number[]
  suggestedFix?: string
  impact?: string
  confidence: number
}
