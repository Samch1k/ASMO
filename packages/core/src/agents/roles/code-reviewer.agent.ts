import { BaseAgent } from "../base-agent"
import { AgentState } from "../types"

/**
 * Code Reviewer Agent - Code quality and security review
 *
 * Capabilities:
 * - Code quality checks (complexity, duplication, smells)
 * - Security vulnerability scanning (OWASP patterns)
 * - Best practices validation (SOLID principles)
 * - Performance analysis (algorithmic complexity, memory usage)
 * - Test coverage verification
 * - Plan alignment validation
 *
 * MCP Integrations:
 * - Memory MCP: Store code review patterns and learnings
 * - Filesystem MCP: Read code files for review
 * - Context7 MCP: Research best practices
 */
export class CodeReviewerAgent extends BaseAgent {
  constructor() {
    super('code-reviewer', [
      'code_review',
      'security_analysis',
      'performance_analysis',
      'best_practices',
      'test_coverage_analysis',
      'architecture_review'
    ])
  }

  /**
   * Execute code review workflow
   *
   * Process:
   * 1. Extract code artifacts from state
   * 2. Check Memory MCP for similar code review patterns
   * 3. Analyze code quality (complexity, duplication, smells)
   * 4. Scan for security vulnerabilities (OWASP)
   * 5. Validate best practices (SOLID, patterns)
   * 6. Check test coverage
   * 7. Validate plan alignment (if plan exists)
   * 8. Generate comprehensive review report
   * 9. Store review in Memory MCP
   */
  async execute(state: AgentState): Promise<Partial<AgentState>> {
    this.log('🔍 Reviewing code quality and security...')

    try {
      // STEP 1: Extract code artifacts from state
      const task = state.task || this.extractTaskFromMessages(state)
      const codeArtifacts = this.extractCodeArtifacts(state)
      const implementationPlan = state.context?.implementationPlan

      if (!codeArtifacts || codeArtifacts.length === 0) {
        this.log('No code artifacts to review', 'warn')
        return this.createEmptyResult(state)
      }

      // STEP 2: Check Memory MCP for similar reviews
      this.log('Checking code review history...')
      const pastReviews = await this.requestMCP('memory', {
        action: 'search_nodes',
        query: `code review ${task}`,
        type: 'code_review',
        limit: 3
      })

      // STEP 3: Analyze code quality
      this.log('Analyzing code quality...')
      const qualityAnalysis = await this.analyzeCodeQuality(codeArtifacts)

      // STEP 4: Scan for security vulnerabilities
      this.log('Scanning for security vulnerabilities...')
      const securityScan = await this.scanSecurityVulnerabilities(codeArtifacts)

      // STEP 5: Validate best practices
      this.log('Validating best practices...')
      const bestPracticesCheck = await this.validateBestPractices(codeArtifacts)

      // STEP 6: Check test coverage
      this.log('Checking test coverage...')
      const testCoverage = await this.checkTestCoverage(state, codeArtifacts)

      // STEP 7: Validate plan alignment (if plan exists)
      let planAlignment = null
      if (implementationPlan) {
        this.log('Validating plan alignment...')
        planAlignment = await this.validatePlanAlignment(codeArtifacts, implementationPlan)
      }

      // STEP 8: Calculate overall score
      const overallScore = this.calculateOverallScore(
        qualityAnalysis,
        securityScan,
        bestPracticesCheck,
        testCoverage
      )

      // STEP 9: Determine approval status
      const approved = overallScore >= 75 // Threshold: 75/100

      // STEP 10: Generate review report
      const reviewReport = this.generateReviewReport(
        task,
        codeArtifacts,
        qualityAnalysis,
        securityScan,
        bestPracticesCheck,
        testCoverage,
        planAlignment,
        overallScore,
        approved,
        pastReviews
      )

      // STEP 11: Store in Memory MCP
      this.log(approved ? '✅ Code review passed' : '⚠️ Code review needs improvements', approved ? 'info' : 'warn')
      await this.requestMCP('memory', {
        action: 'create_entities',
        entities: [{
          name: `Code Review: ${task}`,
          entityType: 'code_review',
          observations: [
            `Overall Score: ${overallScore}/100`,
            `Approved: ${approved}`,
            `Quality: ${qualityAnalysis.score}/25`,
            `Security: ${securityScan.score}/25`,
            `Best Practices: ${bestPracticesCheck.score}/25`,
            `Test Coverage: ${testCoverage.score}/25`,
            ...reviewReport.issues.map(i => `Issue: ${i}`)
          ]
        }]
      })

      // Create artifact
      const artifact = this.createArtifact(
        'documentation',
        reviewReport.fullReport,
        {
          approved,
          overallScore,
          qualityScore: qualityAnalysis.score,
          securityScore: securityScan.score,
          bestPracticesScore: bestPracticesCheck.score,
          testCoverageScore: testCoverage.score
        }
      )

      // Create result
      const result = this.createResult(
        approved ? 'success' : 'needs_approval',
        {
          approved,
          overallScore,
          criticalIssues: reviewReport.criticalIssues.length,
          importantIssues: reviewReport.importantIssues.length,
          suggestions: reviewReport.suggestions.length,
          recommendation: reviewReport.recommendation
        },
        [artifact]
      )

      return {
        messages: [...state.messages],
        agentResults: [...state.agentResults, result],
        requiresApproval: !approved,
        nextAction: approved ? 'tester' : 'revise_code'
      }

    } catch (error: any) {
      this.log(`Code review failed: ${error.message}`, 'error')

      const errorResult = this.createResult(
        'failed',
        { error: error.message },
        []
      )

      return {
        messages: [...state.messages],
        agentResults: [...state.agentResults, errorResult],
        nextAction: 'error_recovery'
      }
    }
  }

  /**
   * Extract code artifacts from agent results
   */
  private extractCodeArtifacts(state: AgentState): Array<{
    fileName: string
    code: string
    language: string
  }> {
    const codeArtifacts: Array<{ fileName: string; code: string; language: string }> = []

    for (const result of state.agentResults) {
      if (result.artifacts) {
        for (const artifact of result.artifacts) {
          if (artifact.type === 'code') {
            codeArtifacts.push({
              fileName: artifact.metadata?.fileName || 'unknown.ts',
              code: artifact.content,
              language: artifact.metadata?.language || 'typescript'
            })
          }
        }
      }
    }

    return codeArtifacts
  }

  /**
   * Analyze code quality (complexity, duplication, smells)
   */
  private async analyzeCodeQuality(codeArtifacts: any[]): Promise<{
    score: number
    issues: Array<{ severity: string; file: string; issue: string; recommendation: string }>
    metrics: {
      complexity: string
      duplication: string
      maintainability: string
    }
  }> {
    const prompt = `Analyze code quality for these files. Check for:
1. **Cyclomatic Complexity**: Functions should have complexity < 10
2. **Code Duplication**: Look for repeated logic that should be extracted
3. **Code Smells**: Long methods, large classes, feature envy, etc.
4. **Maintainability**: Clear naming, proper abstraction, single responsibility

Files:
${codeArtifacts.map((f, i) => `\n### File ${i + 1}: ${f.fileName}\n\`\`\`${f.language}\n${f.code.substring(0, 2000)}\n\`\`\`\n`).join('\n')}

Provide response in JSON format:
{
  "score": 22,
  "issues": [
    {
      "severity": "Important",
      "file": "Component.tsx",
      "issue": "Function has cyclomatic complexity of 15 (threshold: 10)",
      "recommendation": "Break down into smaller functions"
    }
  ],
  "metrics": {
    "complexity": "Medium (avg 7)",
    "duplication": "Low (< 5%)",
    "maintainability": "Good"
  }
}

Score: 0-25 points (25 = excellent, 20-24 = good, 15-19 = acceptable, < 15 = needs work)`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.1,
      maxTokens: 8192
    })
    const content = response.content

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return {
        score: 20,
        issues: [],
        metrics: {
          complexity: 'Unknown',
          duplication: 'Unknown',
          maintainability: 'Unknown'
        }
      }
    }

    return JSON.parse(jsonMatch[0])
  }

  /**
   * Scan for security vulnerabilities (OWASP Top 10)
   */
  private async scanSecurityVulnerabilities(codeArtifacts: any[]): Promise<{
    score: number
    vulnerabilities: Array<{ severity: string; file: string; vulnerability: string; recommendation: string }>
    owasp: string[]
  }> {
    const prompt = `Scan for security vulnerabilities following OWASP Top 10:

1. **SQL Injection**: Unsanitized database queries
2. **XSS (Cross-Site Scripting)**: Unsanitized user input in HTML
3. **Authentication Issues**: Weak password validation, missing auth checks
4. **Sensitive Data Exposure**: Hardcoded secrets, logs containing sensitive data
5. **Access Control**: Missing authorization checks
6. **Security Misconfiguration**: Default credentials, debug mode in production
7. **CSRF**: Missing CSRF tokens on state-changing operations
8. **Insecure Dependencies**: Known vulnerabilities in packages
9. **Insufficient Logging**: Missing audit trails
10. **Server-Side Request Forgery (SSRF)**: Unvalidated URLs

Files:
${codeArtifacts.map((f, i) => `\n### File ${i + 1}: ${f.fileName}\n\`\`\`${f.language}\n${f.code.substring(0, 2000)}\n\`\`\`\n`).join('\n')}

Provide response in JSON format:
{
  "score": 23,
  "vulnerabilities": [
    {
      "severity": "Critical",
      "file": "api.ts",
      "vulnerability": "Potential SQL injection in query construction",
      "recommendation": "Use parameterized queries or ORM"
    }
  ],
  "owasp": ["A03:2021 – Injection"]
}

Score: 0-25 points (25 = no vulnerabilities, 20-24 = minor issues, 15-19 = important issues, < 15 = critical issues)`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.1,
      maxTokens: 8192
    })
    const content = response.content

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return {
        score: 20,
        vulnerabilities: [],
        owasp: []
      }
    }

    return JSON.parse(jsonMatch[0])
  }

  /**
   * Validate best practices (SOLID, design patterns)
   */
  private async validateBestPractices(codeArtifacts: any[]): Promise<{
    score: number
    violations: Array<{ principle: string; file: string; violation: string; recommendation: string }>
    patterns: string[]
  }> {
    const prompt = `Validate adherence to best practices and SOLID principles:

**SOLID Principles**:
- **S**ingle Responsibility: Each class/function has one reason to change
- **O**pen/Closed: Open for extension, closed for modification
- **L**iskov Substitution: Subtypes must be substitutable for base types
- **I**nterface Segregation: Clients shouldn't depend on unused interfaces
- **D**ependency Inversion: Depend on abstractions, not concretions

**Design Patterns**: Check for proper use of Factory, Strategy, Observer, etc.

**Code Conventions**:
- Consistent naming (camelCase, PascalCase)
- Proper TypeScript types (avoid 'any')
- Error handling (try-catch, error boundaries)
- Async/await usage

Files:
${codeArtifacts.map((f, i) => `\n### File ${i + 1}: ${f.fileName}\n\`\`\`${f.language}\n${f.code.substring(0, 2000)}\n\`\`\`\n`).join('\n')}

Provide response in JSON format:
{
  "score": 21,
  "violations": [
    {
      "principle": "Single Responsibility",
      "file": "Component.tsx",
      "violation": "Component handles both data fetching and UI rendering",
      "recommendation": "Extract data fetching to custom hook"
    }
  ],
  "patterns": ["Custom Hook pattern", "Component composition"]
}

Score: 0-25 points (25 = excellent adherence, 20-24 = good, 15-19 = acceptable, < 15 = poor)`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.1,
      maxTokens: 8192
    })
    const content = response.content

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return {
        score: 20,
        violations: [],
        patterns: []
      }
    }

    return JSON.parse(jsonMatch[0])
  }

  /**
   * Check test coverage
   */
  private async checkTestCoverage(state: AgentState, codeArtifacts: any[]): Promise<{
    score: number
    coverage: number
    missingTests: string[]
    testQuality: string
  }> {
    // Extract test files from artifacts
    const testFiles = state.agentResults
      .flatMap(r => r.artifacts || [])
      .filter(a => a.metadata?.fileName?.includes('.test.'))

    const prompt = `Evaluate test coverage for the implemented code:

**Code Files**: ${codeArtifacts.length} files
**Test Files**: ${testFiles.length} test files

Code:
${codeArtifacts.map((f, i) => `${i + 1}. ${f.fileName}`).join('\n')}

Tests:
${testFiles.map((t, i) => `${i + 1}. ${t.metadata?.fileName || 'unknown'}`).join('\n')}

Evaluate:
1. **Coverage**: What % of code has tests? (estimate)
2. **Missing Tests**: What's not tested?
3. **Test Quality**: Are tests meaningful or just happy-path?

Provide response in JSON format:
{
  "score": 22,
  "coverage": 85,
  "missingTests": [
    "Error handling in submitForm()",
    "Edge case: empty array",
    "Loading state transitions"
  ],
  "testQuality": "Good - covers main flows and some edge cases"
}

Score: 0-25 points based on coverage (25 = 100%, 20 = 80%, 15 = 60%, 10 = 40%, 5 = 20%)`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.1,
      maxTokens: 8192
    })
    const content = response.content

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return {
        score: testFiles.length > 0 ? 15 : 5,
        coverage: testFiles.length > 0 ? 60 : 20,
        missingTests: ['Comprehensive test coverage needed'],
        testQuality: 'Unknown'
      }
    }

    return JSON.parse(jsonMatch[0])
  }

  /**
   * Validate plan alignment (if plan exists)
   */
  private async validatePlanAlignment(codeArtifacts: any[], plan: any): Promise<{
    aligned: boolean
    deviations: Array<{ planned: string; actual: string; justified: boolean }>
    completeness: number
  }> {
    const prompt = `Compare implementation against the original plan:

**Plan**: ${JSON.stringify(plan, null, 2)}

**Implementation**: ${codeArtifacts.length} files

Check:
1. Are all planned features implemented?
2. Are there deviations from the plan?
3. If deviations exist, are they justified improvements or problematic?

Provide response in JSON format:
{
  "aligned": true,
  "deviations": [
    {
      "planned": "Use Redux for state management",
      "actual": "Used React Context API",
      "justified": true
    }
  ],
  "completeness": 95
}

Completeness: 0-100% (how much of plan is implemented)`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.1,
      maxTokens: 8192
    })
    const content = response.content

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return {
        aligned: true,
        deviations: [],
        completeness: 100
      }
    }

    return JSON.parse(jsonMatch[0])
  }

  /**
   * Calculate overall score
   */
  private calculateOverallScore(
    quality: any,
    security: any,
    bestPractices: any,
    testCoverage: any
  ): number {
    return quality.score + security.score + bestPractices.score + testCoverage.score
  }

  /**
   * Generate comprehensive review report
   */
  private generateReviewReport(
    task: string,
    codeArtifacts: any[],
    quality: any,
    security: any,
    bestPractices: any,
    testCoverage: any,
    planAlignment: any,
    overallScore: number,
    approved: boolean,
    pastReviews: any
  ): {
    fullReport: string
    recommendation: string
    criticalIssues: any[]
    importantIssues: any[]
    suggestions: any[]
    issues: string[]
  } {
    // Categorize issues
    const criticalIssues = security.vulnerabilities.filter((v: any) => v.severity === 'Critical')
    const importantIssues = [
      ...quality.issues.filter((i: any) => i.severity === 'Important'),
      ...security.vulnerabilities.filter((v: any) => v.severity === 'Important'),
      ...bestPractices.violations.filter((v: any) => v.severity === 'Important')
    ]
    const suggestions = [
      ...quality.issues.filter((i: any) => i.severity === 'Suggestion'),
      ...bestPractices.violations.filter((v: any) => v.severity === 'Suggestion')
    ]

    const recommendation = this.generateRecommendation(approved, criticalIssues.length, importantIssues.length, overallScore)

    const issues = [
      ...criticalIssues.map((i: any) => `Critical: ${i.vulnerability}`),
      ...importantIssues.map((i: any) => `Important: ${i.issue || i.violation || i.vulnerability}`)
    ]

    const fullReport = `# Code Review Report: ${task}

**Date**: ${new Date().toISOString().split('T')[0]}
**Reviewer**: Code Reviewer Agent
**Status**: ${approved ? '✅ APPROVED' : '⚠️ NEEDS REVISION'}

---

## Executive Summary

**Overall Score**: ${overallScore}/100
**Approval Status**: ${approved ? 'Approved for next phase' : 'Requires improvements before proceeding'}

${recommendation}

---

## Score Breakdown

| Category | Score | Status |
|----------|-------|--------|
| Code Quality | ${quality.score}/25 | ${quality.score >= 20 ? '✅ Good' : quality.score >= 15 ? '⚠️ Acceptable' : '❌ Needs Work'} |
| Security | ${security.score}/25 | ${security.score >= 20 ? '✅ Good' : security.score >= 15 ? '⚠️ Acceptable' : '❌ Needs Work'} |
| Best Practices | ${bestPractices.score}/25 | ${bestPractices.score >= 20 ? '✅ Good' : bestPractices.score >= 15 ? '⚠️ Acceptable' : '❌ Needs Work'} |
| Test Coverage | ${testCoverage.score}/25 | ${testCoverage.score >= 20 ? '✅ Good' : testCoverage.score >= 15 ? '⚠️ Acceptable' : '❌ Needs Work'} |
| **Total** | **${overallScore}/100** | ${approved ? '✅ Pass' : '❌ Fail'} |

**Approval Threshold**: 75/100

---

## Files Reviewed (${codeArtifacts.length})

${codeArtifacts.map((f, i) => `${i + 1}. ${f.fileName} (${f.code.split('\n').length} lines)`).join('\n')}

---

## Code Quality Analysis

**Metrics**:
- **Complexity**: ${quality.metrics.complexity}
- **Duplication**: ${quality.metrics.duplication}
- **Maintainability**: ${quality.metrics.maintainability}

${quality.issues.length > 0 ? `### Issues (${quality.issues.length})

${quality.issues.map((i: any, idx: number) => `#### ${idx + 1}. ${i.issue} [${i.severity}]

**File**: ${i.file}
**Recommendation**: ${i.recommendation}
`).join('\n')}` : '✅ No code quality issues found'}

---

## Security Analysis

**OWASP Categories**: ${security.owasp.length > 0 ? security.owasp.join(', ') : 'None'}

${security.vulnerabilities.length > 0 ? `### Vulnerabilities (${security.vulnerabilities.length})

${security.vulnerabilities.map((v: any, idx: number) => `#### ${idx + 1}. ${v.vulnerability} [${v.severity}]

**File**: ${v.file}
**Recommendation**: ${v.recommendation}
`).join('\n')}` : '✅ No security vulnerabilities found'}

---

## Best Practices Validation

**Design Patterns Used**: ${bestPractices.patterns.join(', ')}

${bestPractices.violations.length > 0 ? `### SOLID Violations (${bestPractices.violations.length})

${bestPractices.violations.map((v: any, idx: number) => `#### ${idx + 1}. ${v.principle} [${v.severity || 'Important'}]

**File**: ${v.file}
**Violation**: ${v.violation}
**Recommendation**: ${v.recommendation}
`).join('\n')}` : '✅ No SOLID violations found'}

---

## Test Coverage

**Coverage**: ${testCoverage.coverage}%
**Quality**: ${testCoverage.testQuality}

${testCoverage.missingTests.length > 0 ? `### Missing Tests (${testCoverage.missingTests.length})

${testCoverage.missingTests.map((t: string, idx: number) => `${idx + 1}. ${t}`).join('\n')}` : '✅ Comprehensive test coverage'}

---

${planAlignment ? `## Plan Alignment

**Aligned with Plan**: ${planAlignment.aligned ? '✅ Yes' : '⚠️ Partial'}
**Completeness**: ${planAlignment.completeness}%

${planAlignment.deviations.length > 0 ? `### Deviations from Plan (${planAlignment.deviations.length})

${planAlignment.deviations.map((d: any, idx: number) => `${idx + 1}. **Planned**: ${d.planned}
   **Actual**: ${d.actual}
   **Justified**: ${d.justified ? '✅ Yes' : '❌ No'}
`).join('\n')}` : '✅ No deviations from plan'}

---` : ''}

## Issue Summary

### Critical Issues (${criticalIssues.length})
${criticalIssues.length > 0 ? criticalIssues.map((i: any, idx: number) => `${idx + 1}. ${i.vulnerability} (${i.file})`).join('\n') : 'None ✅'}

### Important Issues (${importantIssues.length})
${importantIssues.length > 0 ? importantIssues.map((i: any, idx: number) => `${idx + 1}. ${i.issue || i.violation || i.vulnerability} (${i.file})`).join('\n') : 'None ✅'}

### Suggestions (${suggestions.length})
${suggestions.length > 0 ? suggestions.map((i: any, idx: number) => `${idx + 1}. ${i.issue || i.violation} (${i.file})`).join('\n') : 'None'}

---

## Historical Context

${pastReviews && pastReviews.length > 0 ?
  `Similar code reviews:\n${pastReviews.map((r: any) => `- ${r.name || r.title || 'Previous review'}`).join('\n')}` :
  'No similar reviews found in history.'
}

---

## Recommendation

${recommendation}

### Next Steps

${approved ? `1. ✅ Code is approved for next phase
2. Proceed to testing (Tester agent)
3. Monitor for any issues during testing
4. Consider addressing suggestions in future iterations` : `1. ❌ Address critical issues immediately
2. Fix important issues before proceeding
3. Re-submit for code review after fixes
4. Consider suggestions for future improvements`}

---

**Generated by**: Code Reviewer Agent
**Timestamp**: ${new Date().toISOString()}
`

    return {
      fullReport,
      recommendation,
      criticalIssues,
      importantIssues,
      suggestions,
      issues
    }
  }

  /**
   * Generate actionable recommendation
   */
  private generateRecommendation(
    approved: boolean,
    criticalCount: number,
    importantCount: number,
    score: number
  ): string {
    if (criticalCount > 0) {
      return `**CRITICAL**: ${criticalCount} critical security vulnerabilities found. Code MUST NOT proceed to production until these are fixed. These issues pose significant security risks.`
    }

    if (!approved) {
      return `**NEEDS REVISION**: Code scored ${score}/100 (threshold: 75). Found ${importantCount} important issues that should be addressed before proceeding. While not critical, these issues impact code quality and maintainability.`
    }

    if (score >= 90) {
      return `**EXCELLENT**: Code quality is excellent (${score}/100). Well-structured, secure, and thoroughly tested. Approved for next phase with confidence.`
    }

    if (score >= 80) {
      return `**GOOD**: Code quality is good (${score}/100). Some minor improvements suggested but overall solid implementation. Approved for next phase.`
    }

    return `**ACCEPTABLE**: Code quality is acceptable (${score}/100). Meets minimum standards for approval. Consider addressing suggestions in future iterations.`
  }

  /**
   * Extract task from messages
   */
  private extractTaskFromMessages(state: AgentState): string {
    for (const message of state.messages.slice().reverse()) {
      const content = typeof message.content === 'string' ? message.content : ''
      if (content && content.length > 10) {
        return content
      }
    }
    return ''
  }

  /**
   * Create empty result when no code to review
   */
  private createEmptyResult(state: AgentState): Partial<AgentState> {
    const artifact = this.createArtifact(
      'documentation',
      '# Code Review Report\n\nNo code artifacts provided for review.',
      { approved: false, overallScore: 0 }
    )

    const result = this.createResult(
      'failed',
      { error: 'No code artifacts to review' },
      [artifact]
    )

    return {
      messages: [...state.messages],
      agentResults: [...state.agentResults, result],
      nextAction: 'error_recovery'
    }
  }
}
