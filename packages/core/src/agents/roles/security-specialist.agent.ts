import { BaseAgent } from "../base-agent"
import { AgentState } from "../types"

/**
 * Security Specialist Agent - Vulnerability scanning, security audit, threat modeling
 *
 * Capabilities:
 * - Security vulnerability assessment
 * - OWASP Top 10 compliance checking
 * - Authentication and authorization review
 * - Data protection and privacy audit
 * - Dependency vulnerability scanning
 * - Security best practices enforcement
 * - Incident response planning
 *
 * MCP Integrations:
 * - GitHub MCP (P0): Scan code for vulnerabilities, check dependencies
 * - Sentry MCP (P1): Analyze error patterns for security issues
 * - Memory MCP (P2): Store security audit findings
 */
export class SecuritySpecialistAgent extends BaseAgent {
  constructor() {
    super('security-specialist', [
      'security_audit',
      'vulnerability_scanning',
      'threat_modeling',
      'auth_authorization_review',
      'data_protection',
      'dependency_audit',
      'owasp_compliance',
      'incident_response',
      'security_testing'
    ])
  }

  /**
   * Execute Security Specialist workflow
   *
   * Process:
   * 1. Scan codebase for security vulnerabilities via GitHub MCP
   * 2. Check dependency vulnerabilities
   * 3. Analyze error patterns from Sentry MCP
   * 4. Perform security assessment using LLM
   * 5. Generate security audit report
   * 6. Store findings in Memory MCP
   * 7. Handoff to Developer for remediation
   */
  async execute(state: AgentState): Promise<Partial<AgentState>> {
    this.log('🔒 Starting Security audit...')

    try {
      // STEP 1: Scan codebase via GitHub MCP
      this.log('Scanning codebase for security issues...')
      const codeVulnerabilities = await this.requestMCP('github', {
        action: 'search_code',
        query: 'password apiKey secret token',
        repo: process.env.GITHUB_REPO
      })

      // STEP 2: Check dependency vulnerabilities
      this.log('Checking dependency vulnerabilities...')
      const dependencyAudit = await this.requestMCP('github', {
        action: 'get_file_contents',
        path: 'package.json',
        repo: process.env.GITHUB_REPO
      })

      // STEP 3: Analyze error patterns from Sentry
      this.log('Analyzing error patterns...')
      const errorPatterns = await this.requestMCP('sentry', {
        action: 'search_issues',
        query: 'is:unresolved level:error',
        limit: 50
      })

      // STEP 4: Perform security assessment
      this.log('Performing comprehensive security assessment...')
      const securityAssessment = await this.assessSecurity(state, {
        codeVulnerabilities,
        dependencyAudit,
        errorPatterns
      })

      // STEP 5: Create audit report artifact
      const auditReport = this.createArtifact(
        'documentation',
        this.formatAuditReport(securityAssessment),
        {
          auditType: 'security',
          severity: this.calculateSeverity(securityAssessment),
          timestamp: new Date().toISOString()
        }
      )

      // STEP 6: Store in Memory MCP
      this.log('Storing security audit findings...')
      await this.requestMCP('memory', {
        action: 'create_entities',
        entities: [{
          name: `Security Audit: ${state.task}`,
          entityType: 'security_audit',
          observations: [auditReport.content]
        }]
      })

      // STEP 7: Determine if remediation is needed
      const needsRemediation = this.needsRemediation(securityAssessment)
      const result = this.createResult(
        needsRemediation ? 'needs_handoff' : 'success',
        securityAssessment,
        [auditReport]
      )

      if (needsRemediation) {
        result.handoffTo = 'developer'
      }
      result.confidence = 0.9

      this.log(
        needsRemediation
          ? '⚠️  Security issues found, handing off to Developer'
          : '✅ No critical security issues found'
      )

      return {
        agentResults: [...state.agentResults, result],
        context: {
          ...state.context,
          securityAssessment,
          auditReport
        },
        nextAction: needsRemediation ? 'developer' : 'END'
      }

    } catch (error) {
      this.log(`Error during execution: ${error}`, 'error')

      const failedResult = this.createResult('failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })

      return {
        agentResults: [...state.agentResults, failedResult],
        nextAction: 'END'
      }
    }
  }

  /**
   * Assess security using Claude LLM
   */
  private async assessSecurity(
    state: AgentState,
    context: {
      codeVulnerabilities: any
      dependencyAudit: any
      errorPatterns: any
    }
  ): Promise<string> {
    const systemPrompt = `You are the Security Specialist for MeatConnect, a B2B marketplace platform.

TECHNOLOGY STACK:
Frontend:
- React 19 with TypeScript (strict mode)
- Tailwind CSS v4
- Radix UI primitives
- React Query for server state

Backend:
- Express.js with TypeScript
- Node.js 20+
- PostgreSQL via Supabase
- Drizzle ORM
- Socket.IO for real-time

Deployment:
- Vercel (frontend - serverless)
- Render (backend - containerized)
- Supabase (database + storage + auth)

DOMAIN CONTEXT:
- B2B two-sided marketplace (Buyers and Suppliers)
- Handles sensitive business data (quotes, prices, contracts)
- Payment processing integration
- User authentication and authorization
- File uploads (product images, documents)
- Real-time notifications

CODE SCAN RESULTS:
${JSON.stringify(context.codeVulnerabilities, null, 2)}

DEPENDENCY AUDIT:
${JSON.stringify(context.dependencyAudit, null, 2)}

ERROR PATTERNS (from Sentry):
${JSON.stringify(context.errorPatterns, null, 2)}

TASK:
${state.task}

PERFORM COMPREHENSIVE SECURITY AUDIT:

1. **OWASP Top 10 Assessment**
   For each category, provide:
   - Status: Compliant / At Risk / Vulnerable
   - Findings: Specific issues found
   - Impact: Critical / High / Medium / Low
   - Recommendations: Actionable fixes

   Categories to assess:
   - A01:2021 – Broken Access Control
   - A02:2021 – Cryptographic Failures
   - A03:2021 – Injection
   - A04:2021 – Insecure Design
   - A05:2021 – Security Misconfiguration
   - A06:2021 – Vulnerable and Outdated Components
   - A07:2021 – Identification and Authentication Failures
   - A08:2021 – Software and Data Integrity Failures
   - A09:2021 – Security Logging and Monitoring Failures
   - A10:2021 – Server-Side Request Forgery (SSRF)

2. **Code Security Issues**
   - Hardcoded secrets or API keys
   - SQL injection vulnerabilities
   - XSS (Cross-Site Scripting) risks
   - CSRF (Cross-Site Request Forgery) protection
   - Insecure direct object references
   - Missing input validation

3. **Authentication & Authorization**
   - Session management
   - Password policies
   - Role-based access control (RBAC)
   - API authentication (JWT, OAuth)
   - Token storage and handling

4. **Data Protection**
   - Sensitive data encryption (at rest, in transit)
   - PII (Personally Identifiable Information) handling
   - GDPR/CCPA compliance
   - Secure file uploads
   - Database security

5. **Dependency Vulnerabilities**
   - Known CVEs in dependencies
   - Outdated packages with security patches
   - Supply chain risks

6. **Infrastructure Security**
   - HTTPS enforcement
   - CORS configuration
   - CSP (Content Security Policy)
   - Rate limiting
   - DDoS protection

7. **Incident Response**
   - Logging and monitoring
   - Error handling (avoid information leakage)
   - Security incident procedures

8. **Recommendations Priority List**
   CRITICAL (fix immediately):
   - [List critical issues]

   HIGH (fix this sprint):
   - [List high priority issues]

   MEDIUM (plan for next sprint):
   - [List medium priority issues]

   LOW (backlog):
   - [List low priority issues]

Format as a clear, actionable security audit report.`

    const response = await this.callLLM(systemPrompt, {
      model: 'sonnet',
      temperature: 0.1,
      maxTokens: 4096
    })

    return response.content
  }

  /**
   * Calculate overall severity from assessment
   */
  private calculateSeverity(assessment: string): string {
    const assessmentLower = assessment.toLowerCase()

    if (assessmentLower.includes('critical') || assessmentLower.includes('vulnerable')) {
      return 'critical'
    } else if (assessmentLower.includes('high') || assessmentLower.includes('at risk')) {
      return 'high'
    } else if (assessmentLower.includes('medium')) {
      return 'medium'
    } else {
      return 'low'
    }
  }

  /**
   * Determine if remediation is needed
   */
  private needsRemediation(assessment: string): boolean {
    const severity = this.calculateSeverity(assessment)
    return severity === 'critical' || severity === 'high'
  }

  /**
   * Format security audit report
   */
  private formatAuditReport(assessment: string): string {
    const timestamp = new Date().toISOString().split('T')[0]

    return `# Security Audit Report

**Date**: ${timestamp}
**Auditor**: Security Specialist Agent
**Scope**: MeatConnect Platform Security Assessment
**Compliance Framework**: OWASP Top 10 (2021)

---

## Executive Summary

This security audit evaluates the MeatConnect platform for vulnerabilities, compliance with OWASP Top 10 standards, and best practices for secure software development.

---

## Detailed Findings

${assessment}

---

## Compliance Statement

This audit follows OWASP Top 10 (2021) security standards and industry best practices for B2B marketplace platforms.

---

**Generated by**: Security Specialist Agent (ASMO Multi-Agent System)
**Timestamp**: ${new Date().toISOString()}

**Next Steps**:
1. Review critical and high-priority findings
2. Assign remediation tasks to development team
3. Schedule follow-up audit after fixes
4. Update security documentation
`
  }
}
