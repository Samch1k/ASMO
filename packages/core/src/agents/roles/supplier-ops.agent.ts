import { BaseAgent } from "../base-agent"
import { AgentState } from "../types"

/**
 * Supplier Ops Agent - Supplier onboarding, compliance, relationship management
 *
 * MeatConnect-specific agent for supplier lifecycle management
 *
 * Capabilities:
 * - Supplier onboarding workflow (verification, documentation, approval)
 * - Compliance checks (certifications, food safety, insurance, tax ID)
 * - Relationship scoring (performance history, reliability, quality)
 * - Risk assessment (financial stability, delivery performance, quality issues)
 * - Supplier health monitoring (order volume, payment history, ratings)
 *
 * MCP Integrations:
 * - Supabase MCP: Query supplier database, order history, ratings
 * - Memory MCP: Store supplier profiles and performance data
 * - Filesystem MCP: Read compliance policies and templates
 */
export class SupplierOpsAgent extends BaseAgent {
  constructor() {
    super('supplier-ops', [
      'verification',
      'ratings',
      'onboarding',
      'compliance',
      'relationship_management',
      'risk_assessment'
    ])
  }

  /**
   * Execute supplier operations workflow
   *
   * Process:
   * 1. Extract supplier data from state
   * 2. Check Memory MCP for supplier history
   * 3. Verify compliance status (certifications, documents)
   * 4. Calculate relationship score (performance, reliability, quality)
   * 5. Assess supplier risk (financial, operational, quality)
   * 6. Determine onboarding/approval recommendation
   * 7. Generate comprehensive supplier operations report
   * 8. Store supplier profile in Memory MCP
   */
  async execute(state: AgentState): Promise<Partial<AgentState>> {
    this.log('🏪 Analyzing supplier operations...')

    try {
      // STEP 1: Extract supplier data
      const supplierData = this.extractSupplierData(state)

      if (!supplierData || !supplierData.name) {
        this.log('Invalid supplier data', 'warn')
        return this.createEmptyResult(state)
      }

      // STEP 2: Check Memory MCP for supplier history
      this.log('Checking supplier history...')
      const supplierHistory = await this.requestMCP('memory', {
        action: 'search_nodes',
        query: `supplier ${supplierData.name}`,
        type: 'supplier_profile',
        limit: 3
      })

      // STEP 3: Verify compliance
      this.log('Verifying compliance status...')
      const compliance = await this.verifyCompliance(supplierData)

      // STEP 4: Calculate relationship score
      this.log('Calculating relationship score...')
      const relationshipScore = await this.calculateRelationshipScore(supplierData, supplierHistory)

      // STEP 5: Assess risk
      this.log('Assessing supplier risk...')
      const riskAssessment = await this.assessSupplierRisk(supplierData, relationshipScore)

      // STEP 6: Determine recommendation
      this.log('Generating recommendation...')
      const recommendation = this.generateRecommendation(compliance, relationshipScore, riskAssessment)

      // STEP 7: Generate comprehensive report
      const operationsReport = this.generateOperationsReport(
        supplierData,
        compliance,
        relationshipScore,
        riskAssessment,
        recommendation,
        supplierHistory
      )

      // STEP 8: Store in Memory MCP
      this.log('Storing supplier profile...')
      await this.requestMCP('memory', {
        action: 'create_entities',
        entities: [{
          name: `Supplier Profile: ${supplierData.name}`,
          entityType: 'supplier_profile',
          observations: [
            `Status: ${recommendation.status}`,
            `Compliance Score: ${compliance.score}/100`,
            `Relationship Score: ${relationshipScore.overallScore}/100`,
            `Risk Level: ${riskAssessment.riskLevel}`,
            `Recommendation: ${recommendation.action}`
          ]
        }]
      })

      // Create artifact
      const artifact = this.createArtifact(
        'documentation',
        operationsReport.fullDocument,
        {
          supplierName: supplierData.name,
          complianceScore: compliance.score,
          relationshipScore: relationshipScore.overallScore,
          riskLevel: riskAssessment.riskLevel,
          recommendation: recommendation.action
        }
      )

      // Create result
      const result = this.createResult(
        recommendation.status === 'Approved' ? 'success' : 'needs_approval',
        {
          supplierName: supplierData.name,
          complianceScore: compliance.score,
          relationshipScore: relationshipScore.overallScore,
          riskLevel: riskAssessment.riskLevel,
          recommendation: recommendation.action
        },
        [artifact]
      )

      return {
        messages: [...state.messages],
        agentResults: [...state.agentResults, result],
        context: {
          ...state.context,
          supplierOps: {
            supplierName: supplierData.name,
            status: recommendation.status,
            complianceScore: compliance.score,
            relationshipScore: relationshipScore.overallScore,
            riskLevel: riskAssessment.riskLevel
          }
        },
        requiresApproval: recommendation.status !== 'Approved',
        nextAction: recommendation.status === 'Approved' ? 'END' : 'manual_review'
      }

    } catch (error: any) {
      this.log(`Supplier ops analysis failed: ${error.message}`, 'error')

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
   * Extract supplier data from state
   */
  private extractSupplierData(state: AgentState): any {
    // Check state.context first
    if (state.context?.supplierData) {
      return state.context.supplierData
    }

    // Try RFQ analysis context (if coming from RFQ workflow)
    if (state.context?.rfqAnalysis?.recommendations?.[0]) {
      const topRec = state.context.rfqAnalysis.recommendations[0]
      return {
        id: topRec.supplierId,
        name: topRec.supplierName,
        status: 'pending_verification'
      }
    }

    // Try to parse from last message
    const lastMessage = state.messages[state.messages.length - 1]
    if (lastMessage && typeof lastMessage.content === 'string') {
      try {
        const parsed = JSON.parse(lastMessage.content)
        if (parsed.name || parsed.supplierName) {
          return {
            id: parsed.id || `SUP-${Date.now()}`,
            name: parsed.name || parsed.supplierName,
            location: parsed.location || 'Unknown',
            status: parsed.status || 'pending_verification'
          }
        }
      } catch {
        // Not JSON, try pattern matching
        const content = lastMessage.content
        const nameMatch = content.match(/supplier[:\s]+([^,\n]+)/i)

        if (nameMatch) {
          return {
            id: `SUP-${Date.now()}`,
            name: nameMatch[1].trim(),
            status: 'pending_verification'
          }
        }
      }
    }

    // Check task field
    if (state.task) {
      return {
        id: `SUP-${Date.now()}`,
        name: state.task,
        status: 'pending_verification'
      }
    }

    return null
  }

  /**
   * Verify compliance status
   */
  private async verifyCompliance(supplierData: any): Promise<{
    score: number
    certifications: number
    documentation: number
    foodSafety: number
    insurance: number
    items: Array<{
      category: string
      status: 'Complete' | 'Missing' | 'Expired'
      item: string
      detail: string
    }>
    approved: boolean
  }> {
    const prompt = `Verify compliance status for this supplier in a B2B meat trading platform (MeatConnect).

Supplier Data:
${JSON.stringify(supplierData, null, 2)}

Evaluate compliance across 4 categories (0-25 points each):

1. **Certifications** (0-25 points)
   - USDA certification (required for meat suppliers)
   - Organic certification (if applicable)
   - Halal/Kosher certification (if applicable)
   - Quality management certification (ISO, HACCP)

2. **Documentation** (0-25 points)
   - Business license (current, not expired)
   - Tax ID verification (EIN, state tax ID)
   - W-9 or W-8 form
   - Banking information for payments

3. **Food Safety** (0-25 points)
   - Food safety certificate (ServSafe, equivalent)
   - Facility inspection reports (last 12 months)
   - Temperature control procedures
   - Traceability system for products

4. **Insurance** (0-25 points)
   - General liability insurance (minimum $1M coverage)
   - Product liability insurance
   - Workers compensation insurance
   - Vehicle/transport insurance

For each compliance item, provide:
- category (certifications/documentation/foodSafety/insurance)
- status (Complete/Missing/Expired)
- item (name of document/certification)
- detail (additional info, expiration date, notes)

Provide response in JSON format:
{
  "score": 85,
  "certifications": 22,
  "documentation": 25,
  "foodSafety": 20,
  "insurance": 18,
  "items": [
    {
      "category": "certifications",
      "status": "Complete",
      "item": "USDA Certification",
      "detail": "Valid until 2027-12-31"
    },
    {
      "category": "foodSafety",
      "status": "Missing",
      "item": "Facility Inspection Report",
      "detail": "No recent inspection report found"
    }
  ],
  "approved": true
}

Approval threshold: 75/100 (must have all critical items: USDA cert, business license, insurance)`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.2,
      maxTokens: 8192
    })

    const jsonMatch = response.content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      // Fallback compliance check
      return {
        score: 60,
        certifications: 15,
        documentation: 20,
        foodSafety: 15,
        insurance: 10,
        items: [
          {
            category: 'certifications',
            status: 'Missing',
            item: 'USDA Certification',
            detail: 'Required for meat suppliers'
          }
        ],
        approved: false
      }
    }

    return JSON.parse(jsonMatch[0])
  }

  /**
   * Calculate relationship score based on performance history
   */
  private async calculateRelationshipScore(supplierData: any, supplierHistory: any): Promise<{
    overallScore: number
    orderPerformance: number
    qualityMetrics: number
    communication: number
    paymentHistory: number
    metrics: {
      totalOrders: number
      onTimeDelivery: number
      qualityIssues: number
      avgRating: number
    }
    reasoning: string
  }> {
    const prompt = `Calculate relationship score for this supplier in a B2B meat trading platform.

Supplier: ${supplierData.name}
History: ${JSON.stringify(supplierHistory, null, 2)}

Evaluate relationship quality across 4 dimensions (0-25 points each):

1. **Order Performance** (0-25 points)
   - On-time delivery rate (target: > 95%)
   - Order accuracy (correct products, quantities)
   - Fulfillment rate (no cancellations)
   - Response time to orders (< 24 hours)

2. **Quality Metrics** (0-25 points)
   - Product quality consistency
   - Quality issues / complaints (lower = better)
   - Returns / refunds (lower = better)
   - Food safety incidents (should be zero)

3. **Communication** (0-25 points)
   - Responsiveness (< 4 hours for inquiries)
   - Proactive communication (price changes, delays)
   - Professionalism and clarity
   - Issue resolution effectiveness

4. **Payment History** (0-25 points)
   - Invoice accuracy (no frequent disputes)
   - Payment terms compliance
   - Credit history (if applicable)
   - Financial stability indicators

Provide response in JSON format:
{
  "overallScore": 85,
  "orderPerformance": 22,
  "qualityMetrics": 24,
  "communication": 20,
  "paymentHistory": 19,
  "metrics": {
    "totalOrders": 127,
    "onTimeDelivery": 96.5,
    "qualityIssues": 3,
    "avgRating": 4.8
  },
  "reasoning": "Excellent supplier with consistent quality and reliable delivery"
}

Note: For new suppliers with no history, use industry benchmarks and assign moderate scores (15-18 per category).`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.2,
      maxTokens: 8192
    })

    const jsonMatch = response.content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      // Fallback for new supplier
      return {
        overallScore: 65,
        orderPerformance: 16,
        qualityMetrics: 17,
        communication: 16,
        paymentHistory: 16,
        metrics: {
          totalOrders: 0,
          onTimeDelivery: 0,
          qualityIssues: 0,
          avgRating: 0
        },
        reasoning: 'New supplier with no performance history'
      }
    }

    return JSON.parse(jsonMatch[0])
  }

  /**
   * Assess supplier risk
   */
  private async assessSupplierRisk(supplierData: any, relationshipScore: any): Promise<{
    riskLevel: 'Low' | 'Medium' | 'High' | 'Critical'
    riskScore: number
    riskFactors: Array<{
      category: string
      risk: string
      severity: 'Low' | 'Medium' | 'High' | 'Critical'
      mitigation: string
    }>
  }> {
    const prompt = `Assess risk factors for this supplier in a B2B meat trading platform.

Supplier: ${supplierData.name}
Relationship Score: ${relationshipScore.overallScore}/100
Performance Metrics: ${JSON.stringify(relationshipScore.metrics, null, 2)}

Identify risk factors across categories:
- **Operational Risk**: Delivery failures, capacity constraints, quality issues
- **Financial Risk**: Payment issues, financial instability, credit problems
- **Compliance Risk**: Expired certifications, regulatory violations, safety incidents
- **Reputation Risk**: Negative reviews, customer complaints, ethical concerns

For each risk factor:
- category (operational/financial/compliance/reputation)
- risk (description of the risk)
- severity (Low/Medium/High/Critical)
- mitigation (how to reduce or manage this risk)

Risk Scoring:
- Risk Score = (Number of High risks × 20) + (Number of Medium risks × 10) + (Number of Low risks × 5)
- Risk Level: Low (0-20), Medium (21-40), High (41-60), Critical (61+)

Provide response in JSON format:
{
  "riskLevel": "Medium",
  "riskScore": 25,
  "riskFactors": [
    {
      "category": "operational",
      "risk": "New supplier with limited track record",
      "severity": "Medium",
      "mitigation": "Start with small orders, monitor closely for first 3 months"
    },
    {
      "category": "compliance",
      "risk": "USDA certification expiring in 2 months",
      "severity": "Low",
      "mitigation": "Request renewal documentation proactively"
    }
  ]
}`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.2,
      maxTokens: 8192
    })

    const jsonMatch = response.content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      // Fallback risk assessment
      return {
        riskLevel: 'Medium',
        riskScore: 30,
        riskFactors: [
          {
            category: 'operational',
            risk: 'Limited supplier information available',
            severity: 'Medium',
            mitigation: 'Conduct thorough due diligence before approval'
          }
        ]
      }
    }

    return JSON.parse(jsonMatch[0])
  }

  /**
   * Generate recommendation based on compliance, relationship, and risk
   */
  private generateRecommendation(compliance: any, relationshipScore: any, riskAssessment: any): {
    status: 'Approved' | 'Conditional' | 'Rejected'
    action: string
    reasoning: string
    conditions?: string[]
  } {
    // Decision matrix
    const compliancePass = compliance.approved && compliance.score >= 75
    const relationshipPass = relationshipScore.overallScore >= 65
    // riskAcceptable is checked via riskAssessment.riskLevel comparisons below

    if (compliancePass && relationshipPass && riskAssessment.riskLevel === 'Low') {
      return {
        status: 'Approved',
        action: 'Approve supplier for full access',
        reasoning: `Supplier meets all requirements: compliance score ${compliance.score}/100, relationship score ${relationshipScore.overallScore}/100, low risk level. Ready for full platform access.`
      }
    }

    if (compliancePass && relationshipPass && riskAssessment.riskLevel === 'Medium') {
      return {
        status: 'Conditional',
        action: 'Approve with conditions and monitoring',
        reasoning: `Supplier meets basic requirements but has medium risk. Approve with conditions and enhanced monitoring.`,
        conditions: [
          'Start with limited order volume (< $10K/month)',
          'Weekly performance reviews for first 3 months',
          'Require insurance confirmation before large orders',
          riskAssessment.riskFactors
            .filter((f: any) => f.severity === 'Medium' || f.severity === 'High')
            .map((f: any) => `Address ${f.category} risk: ${f.mitigation}`)
            .join('; ')
        ]
      }
    }

    if (!compliancePass) {
      return {
        status: 'Rejected',
        action: 'Reject - Compliance requirements not met',
        reasoning: `Compliance score ${compliance.score}/100 (minimum 75 required). Missing critical compliance items. Cannot approve until all requirements are met.`,
        conditions: compliance.items
          .filter((i: any) => i.status === 'Missing' || i.status === 'Expired')
          .map((i: any) => `Required: ${i.item} (${i.category})`)
      }
    }

    if (riskAssessment.riskLevel === 'Critical' || riskAssessment.riskLevel === 'High') {
      return {
        status: 'Rejected',
        action: 'Reject - Risk level too high',
        reasoning: `Risk level: ${riskAssessment.riskLevel} (risk score: ${riskAssessment.riskScore}). Cannot approve suppliers with high or critical risk levels.`,
        conditions: riskAssessment.riskFactors
          .filter((f: any) => f.severity === 'High' || f.severity === 'Critical')
          .map((f: any) => `Resolve ${f.category} risk: ${f.risk}`)
      }
    }

    if (!relationshipPass) {
      return {
        status: 'Conditional',
        action: 'Approve for trial period',
        reasoning: `Relationship score ${relationshipScore.overallScore}/100 is below ideal (65+). Approve for trial period with close monitoring.`,
        conditions: [
          'Trial period: 90 days',
          'Weekly performance reviews',
          'Limit order volume to $5K/month during trial',
          'Review and reassess after trial period'
        ]
      }
    }

    return {
      status: 'Conditional',
      action: 'Manual review required',
      reasoning: 'Unable to determine approval status automatically. Requires manual review by operations team.'
    }
  }

  /**
   * Generate comprehensive supplier operations report
   */
  private generateOperationsReport(
    supplierData: any,
    compliance: any,
    relationshipScore: any,
    riskAssessment: any,
    recommendation: any,
    supplierHistory: any
  ): {
    fullDocument: string
  } {
    const fullDocument = `# Supplier Operations Report: ${supplierData.name}

**Supplier ID**: ${supplierData.id}
**Date**: ${new Date().toISOString().split('T')[0]}
**Analyst**: Supplier Ops Agent
**Status**: ${recommendation.status}

---

## Supplier Details

**Name**: ${supplierData.name}
**Location**: ${supplierData.location || 'Not specified'}
**Current Status**: ${supplierData.status || 'pending_verification'}

---

## Compliance Verification

**Overall Compliance Score**: ${compliance.score}/100 ${compliance.approved ? '✅ APPROVED' : '❌ FAILED'}

### Score Breakdown
- **Certifications**: ${compliance.certifications}/25
- **Documentation**: ${compliance.documentation}/25
- **Food Safety**: ${compliance.foodSafety}/25
- **Insurance**: ${compliance.insurance}/25

### Compliance Items

${compliance.items.map((item: any) => `#### ${item.status === 'Complete' ? '✅' : item.status === 'Expired' ? '⏰' : '❌'} ${item.item}

**Category**: ${item.category}
**Status**: ${item.status}
**Detail**: ${item.detail}`).join('\n\n')}

---

## Relationship Score

**Overall Score**: ${relationshipScore.overallScore}/100

### Score Breakdown
- **Order Performance**: ${relationshipScore.orderPerformance}/25
- **Quality Metrics**: ${relationshipScore.qualityMetrics}/25
- **Communication**: ${relationshipScore.communication}/25
- **Payment History**: ${relationshipScore.paymentHistory}/25

### Performance Metrics
- **Total Orders**: ${relationshipScore.metrics.totalOrders}
- **On-Time Delivery**: ${relationshipScore.metrics.onTimeDelivery}%
- **Quality Issues**: ${relationshipScore.metrics.qualityIssues}
- **Average Rating**: ${relationshipScore.metrics.avgRating}/5

**Analysis**: ${relationshipScore.reasoning}

---

## Risk Assessment

**Risk Level**: ${riskAssessment.riskLevel}
**Risk Score**: ${riskAssessment.riskScore}

### Risk Factors

${riskAssessment.riskFactors.map((risk: any) => `#### ${risk.severity === 'Critical' ? '🔴' : risk.severity === 'High' ? '🟠' : risk.severity === 'Medium' ? '🟡' : '🟢'} ${risk.risk}

**Category**: ${risk.category}
**Severity**: ${risk.severity}
**Mitigation**: ${risk.mitigation}`).join('\n\n')}

---

## Recommendation

**Status**: **${recommendation.status}**
**Action**: ${recommendation.action}

**Reasoning**: ${recommendation.reasoning}

${recommendation.conditions && recommendation.conditions.length > 0 ? `### Conditions

${recommendation.conditions.map((c: string) => `- ${c}`).join('\n')}` : ''}

---

## Historical Context

${supplierHistory && supplierHistory.length > 0 ?
  `Previous interactions with this supplier:\n${supplierHistory.map((h: any) => `- ${h.name || h.title || 'Previous record'}`).join('\n')}` :
  'No prior history found for this supplier.'
}

---

## Next Steps

${recommendation.status === 'Approved' ? `
1. ✅ Send approval notification to supplier
2. ✅ Grant full platform access
3. ✅ Set up payment and billing
4. ✅ Schedule onboarding call
5. ✅ Add to RFQ distribution lists
` : recommendation.status === 'Conditional' ? `
1. ⚠️ Send conditional approval with requirements
2. ⚠️ Grant limited platform access
3. ⚠️ Set up monitoring and review schedule
4. ⚠️ Address conditions listed above
5. ⚠️ Schedule reassessment date
` : `
1. ❌ Send rejection notification with reasons
2. ❌ Provide guidance on requirements
3. ❌ Allow reapplication after issues resolved
4. ❌ Store profile for future reference
`}

---

**Generated by**: Supplier Ops Agent
**Timestamp**: ${new Date().toISOString()}
**Requires Manual Review**: ${recommendation.status !== 'Approved'}
`

    return { fullDocument }
  }

  /**
   * Create empty result when no supplier data provided
   */
  private createEmptyResult(state: AgentState): Partial<AgentState> {
    const artifact = this.createArtifact(
      'documentation',
      '# Supplier Operations\n\nNo supplier data provided for analysis.',
      {}
    )

    const result = this.createResult(
      'failed',
      { error: 'No supplier data provided' },
      [artifact]
    )

    return {
      messages: [...state.messages],
      agentResults: [...state.agentResults, result],
      nextAction: 'error_recovery'
    }
  }
}
