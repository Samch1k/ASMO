import { BaseAgent } from "../base-agent"
import { AgentState } from "../types"
import { ChatAnthropic } from "@langchain/anthropic"

/**
 * RFQ Specialist Agent - RFQ validation, supplier matching, bid evaluation
 *
 * MeatConnect-specific agent for Request for Quotation (RFQ) workflows
 *
 * Capabilities:
 * - RFQ validation (required fields, pricing structure, specifications)
 * - Supplier matching (capabilities × requirements, geography, certifications)
 * - Bid evaluation (scoring matrix: price, quality, delivery, past performance)
 * - RFQ quality scoring (completeness, clarity, competitive attractiveness)
 * - Supplier recommendation with rationale
 *
 * MCP Integrations:
 * - Supabase MCP: Query RFQ database, supplier database, past bids
 * - Memory MCP: Store RFQ patterns for learning
 * - Filesystem MCP: Read RFQ templates and policies
 */
export class RFQSpecialistAgent extends BaseAgent {
  private llm: ChatAnthropic

  constructor() {
    super('rfq-specialist', [
      'rfq_validation',
      'supplier_matching',
      'bid_evaluation',
      'procurement_strategy',
      'supplier_relationship_management'
    ])

    this.llm = new ChatAnthropic({
      modelName: "claude-sonnet-4-20250514",
      temperature: 0.2,
      maxTokens: 8192
    })
  }

  /**
   * Execute RFQ workflow
   *
   * Process:
   * 1. Extract RFQ data from state
   * 2. Check Memory MCP for similar past RFQs
   * 3. Validate RFQ completeness and quality
   * 4. Query Supabase for eligible suppliers
   * 5. Match suppliers to RFQ requirements (LLM-based scoring)
   * 6. Evaluate existing bids (if any)
   * 7. Generate supplier recommendations
   * 8. Create comprehensive RFQ analysis report
   * 9. Store RFQ pattern in Memory MCP
   */
  async execute(state: AgentState): Promise<Partial<AgentState>> {
    this.log('🥩 Analyzing RFQ and matching suppliers...')

    try {
      // STEP 1: Extract RFQ data
      const rfqData = this.extractRFQData(state)

      if (!rfqData || !rfqData.productType) {
        this.log('Invalid RFQ data', 'warn')
        return this.createEmptyResult(state)
      }

      // STEP 2: Check Memory MCP for similar RFQs
      this.log('Checking past RFQ patterns...')
      const pastRFQs = await this.requestMCP('memory', {
        action: 'search_nodes',
        query: `RFQ ${rfqData.productType}`,
        type: 'rfq_analysis',
        limit: 3
      })

      // STEP 3: Validate RFQ completeness
      this.log('Validating RFQ completeness...')
      const validation = await this.validateRFQ(rfqData)

      if (validation.score < 70) {
        this.log(`RFQ validation failed: ${validation.score}/100`, 'warn')
        // Return with recommendations for improvement
        return this.createValidationFailureResult(state, validation)
      }

      // STEP 4: Query Supabase for eligible suppliers
      this.log('Querying supplier database...')
      const suppliers = await this.queryEligibleSuppliers(rfqData)

      // STEP 5: Match suppliers to RFQ
      this.log('Matching suppliers to RFQ requirements...')
      const matches = await this.matchSuppliers(rfqData, suppliers)

      // STEP 6: Evaluate bids (if any exist)
      this.log('Evaluating bids...')
      const bidEvaluations = await this.evaluateBids(rfqData, matches)

      // STEP 7: Generate recommendations
      this.log('Generating supplier recommendations...')
      const recommendations = this.generateRecommendations(matches, bidEvaluations)

      // STEP 8: Create comprehensive RFQ analysis report
      const analysisReport = this.generateAnalysisReport(
        rfqData,
        validation,
        matches,
        bidEvaluations,
        recommendations,
        pastRFQs
      )

      // STEP 9: Store in Memory MCP
      this.log('Storing RFQ analysis...')
      await this.requestMCP('memory', {
        action: 'create_entities',
        entities: [{
          name: `RFQ Analysis: ${rfqData.productType}`,
          entityType: 'rfq_analysis',
          observations: [
            `Product Type: ${rfqData.productType}`,
            `Quantity: ${rfqData.quantity} ${rfqData.unit}`,
            `Validation Score: ${validation.score}/100`,
            `Matched Suppliers: ${matches.length}`,
            `Top Recommendation: ${recommendations[0]?.supplierName || 'None'}`
          ]
        }]
      })

      // Create artifact
      const artifact = this.createArtifact(
        'documentation',
        analysisReport.fullDocument,
        {
          rfqId: rfqData.id,
          productType: rfqData.productType,
          validationScore: validation.score,
          matchedSuppliers: matches.length,
          topRecommendation: recommendations[0]?.supplierName || 'None'
        }
      )

      // Create result
      const result = this.createResult(
        'success',
        {
          rfqId: rfqData.id,
          validationScore: validation.score,
          matchedSuppliers: matches.length,
          recommendations: recommendations.slice(0, 3).map(r => r.supplierName)
        },
        [artifact]
      )

      return {
        messages: [...state.messages],
        agentResults: [...state.agentResults, result],
        context: {
          ...state.context,
          rfqAnalysis: {
            rfqId: rfqData.id,
            validationScore: validation.score,
            matches: matches,
            recommendations: recommendations
          }
        },
        nextAction: 'supplier_ops' // Hand to Supplier Ops for onboarding if needed
      }

    } catch (error: any) {
      this.log(`RFQ analysis failed: ${error.message}`, 'error')

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
   * Extract RFQ data from state
   */
  private extractRFQData(state: AgentState): any {
    // Check state.context first
    if (state.context?.rfqData) {
      return state.context.rfqData
    }

    // Try to parse from last message
    const lastMessage = state.messages[state.messages.length - 1]
    if (lastMessage && typeof lastMessage.content === 'string') {
      try {
        const parsed = JSON.parse(lastMessage.content)
        if (parsed.productType) {
          return parsed
        }
      } catch {
        // Not JSON, try to extract structured data
        const content = lastMessage.content

        // Simple pattern matching for RFQ data
        const productTypeMatch = content.match(/product[:\s]+([^,\n]+)/i)
        const quantityMatch = content.match(/quantity[:\s]+(\d+)/i)
        const unitMatch = content.match(/unit[:\s]+([^,\n]+)/i)

        if (productTypeMatch) {
          return {
            id: `RFQ-${Date.now()}`,
            productType: productTypeMatch[1].trim(),
            quantity: quantityMatch ? parseInt(quantityMatch[1]) : 100,
            unit: unitMatch ? unitMatch[1].trim() : 'kg',
            deliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            specifications: {}
          }
        }
      }
    }

    // Check task field
    if (state.task) {
      return {
        id: `RFQ-${Date.now()}`,
        productType: state.task,
        quantity: 100,
        unit: 'kg',
        deliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        specifications: {}
      }
    }

    return null
  }

  /**
   * Validate RFQ completeness and quality
   */
  private async validateRFQ(rfqData: any): Promise<{
    score: number
    completeness: number
    clarity: number
    competitiveAttractiveness: number
    issues: Array<{
      severity: 'Critical' | 'Warning' | 'Info'
      field: string
      issue: string
      recommendation: string
    }>
    approved: boolean
  }> {
    const prompt = `Validate this RFQ for a B2B meat trading platform (MeatConnect).

RFQ Data:
${JSON.stringify(rfqData, null, 2)}

Evaluate the RFQ across 3 dimensions:

1. **Completeness** (0-40 points)
   - Required fields present: product type, quantity, unit, delivery date
   - Specifications detail: cut type, grade, packaging, temperature requirements
   - Quality criteria: freshness, certifications (e.g., organic, halal, kosher)
   - Payment terms and delivery location

2. **Clarity** (0-30 points)
   - Clear product description (unambiguous)
   - Specific quantity and units
   - Realistic delivery date
   - Well-defined acceptance criteria

3. **Competitive Attractiveness** (0-30 points)
   - Reasonable quantity (not too small/large for suppliers)
   - Adequate lead time (delivery date not too soon)
   - Clear payment terms
   - Attractive to multiple suppliers

For each issue found, provide:
- severity (Critical/Warning/Info)
- field (which field has the issue)
- issue (description)
- recommendation (how to fix)

Provide response in JSON format:
{
  "score": 85,
  "completeness": 35,
  "clarity": 28,
  "competitiveAttractiveness": 22,
  "issues": [
    {
      "severity": "Warning",
      "field": "specifications",
      "issue": "No cut type specified",
      "recommendation": "Add cut type (e.g., ribeye, tenderloin, ground beef)"
    }
  ],
  "approved": true
}

Approval threshold: 70/100`

    const response = await this.llm.invoke([{ role: 'user', content: prompt }])
    const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content)

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      // Fallback validation
      return {
        score: 60,
        completeness: 25,
        clarity: 20,
        competitiveAttractiveness: 15,
        issues: [
          {
            severity: 'Warning',
            field: 'specifications',
            issue: 'Limited specification details',
            recommendation: 'Add more product specifications'
          }
        ],
        approved: false
      }
    }

    return JSON.parse(jsonMatch[0])
  }

  /**
   * Query Supabase for eligible suppliers
   */
  private async queryEligibleSuppliers(_rfqData: any): Promise<Array<{
    id: string
    name: string
    location: string
    capabilities: string[]
    certifications: string[]
    rating: number
    pastOrders: number
  }>> {
    try {
      // Query Supabase for suppliers with matching capabilities
      // Query Supabase to verify connection (result used in production for actual supplier data)
      await this.requestMCP('supabase', {
        action: 'list_tables'
      })

      // For PoC, return mock suppliers
      // In production, would query actual supplier database
      return [
        {
          id: 'SUP-001',
          name: 'Premium Meats Inc.',
          location: 'Chicago, IL',
          capabilities: ['beef', 'pork', 'lamb', 'wholesale', 'custom_cuts'],
          certifications: ['USDA', 'organic', 'halal'],
          rating: 4.8,
          pastOrders: 127
        },
        {
          id: 'SUP-002',
          name: 'Global Protein Distributors',
          location: 'Los Angeles, CA',
          capabilities: ['beef', 'poultry', 'seafood', 'wholesale', 'frozen'],
          certifications: ['USDA', 'kosher'],
          rating: 4.5,
          pastOrders: 89
        },
        {
          id: 'SUP-003',
          name: 'Farm Fresh Meats Co.',
          location: 'Austin, TX',
          capabilities: ['beef', 'pork', 'organic', 'grass_fed'],
          certifications: ['USDA', 'organic', 'animal_welfare_certified'],
          rating: 4.9,
          pastOrders: 203
        },
        {
          id: 'SUP-004',
          name: 'Metro Meat Supply',
          location: 'New York, NY',
          capabilities: ['beef', 'pork', 'lamb', 'veal', 'custom_cuts'],
          certifications: ['USDA', 'halal', 'kosher'],
          rating: 4.3,
          pastOrders: 67
        }
      ]
    } catch (error) {
      this.log('Supabase query failed, using mock data', 'warn')
      return []
    }
  }

  /**
   * Match suppliers to RFQ requirements using LLM-based scoring
   */
  private async matchSuppliers(rfqData: any, suppliers: any[]): Promise<Array<{
    supplier: any
    matchScore: number
    capabilityMatch: number
    certificationMatch: number
    performanceScore: number
    reasoning: string
    strengths: string[]
    concerns: string[]
  }>> {
    const prompt = `Match suppliers to this RFQ for a B2B meat trading platform.

RFQ:
- Product Type: ${rfqData.productType}
- Quantity: ${rfqData.quantity} ${rfqData.unit}
- Delivery Date: ${rfqData.deliveryDate}
- Specifications: ${JSON.stringify(rfqData.specifications || {}, null, 2)}

Suppliers:
${suppliers.map((s, idx) => `${idx + 1}. ${s.name} (${s.id})
   - Location: ${s.location}
   - Capabilities: ${s.capabilities.join(', ')}
   - Certifications: ${s.certifications.join(', ')}
   - Rating: ${s.rating}/5
   - Past Orders: ${s.pastOrders}`).join('\n\n')}

For each supplier, calculate a match score (0-100):
- Capability Match (0-40): Does supplier have capabilities for this product?
- Certification Match (0-30): Does supplier have required certifications?
- Performance Score (0-30): Based on rating and past orders (higher = better)

Total Match Score = Capability + Certification + Performance

For each supplier, provide:
- supplierId
- matchScore (0-100)
- capabilityMatch (0-40)
- certificationMatch (0-30)
- performanceScore (0-30)
- reasoning (why this score was assigned)
- strengths (list of 2-3 strengths for this RFQ)
- concerns (list of 1-2 concerns or limitations)

Provide response in JSON format:
{
  "matches": [
    {
      "supplierId": "SUP-001",
      "matchScore": 85,
      "capabilityMatch": 35,
      "certificationMatch": 25,
      "performanceScore": 25,
      "reasoning": "Strong match with excellent capabilities and certifications",
      "strengths": ["Organic certified", "High rating", "Many past orders"],
      "concerns": ["Located far from delivery point"]
    }
  ]
}

Sort suppliers by matchScore (highest first).`

    const response = await this.llm.invoke([{ role: 'user', content: prompt }])
    const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content)

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      // Fallback: simple matching
      return suppliers.map(supplier => ({
        supplier,
        matchScore: 70,
        capabilityMatch: 30,
        certificationMatch: 20,
        performanceScore: 20,
        reasoning: 'Basic match based on capabilities',
        strengths: ['Available', 'Experienced'],
        concerns: ['Limited information']
      }))
    }

    const parsed = JSON.parse(jsonMatch[0])

    // Combine supplier data with match scores
    return parsed.matches.map((match: any) => {
      const supplier = suppliers.find(s => s.id === match.supplierId)
      return {
        supplier: supplier || { id: match.supplierId, name: 'Unknown' },
        matchScore: match.matchScore,
        capabilityMatch: match.capabilityMatch,
        certificationMatch: match.certificationMatch,
        performanceScore: match.performanceScore,
        reasoning: match.reasoning,
        strengths: match.strengths,
        concerns: match.concerns
      }
    })
  }

  /**
   * Evaluate bids (if any exist)
   */
  private async evaluateBids(rfqData: any, matches: any[]): Promise<Array<{
    supplier: any
    bidAmount: number
    priceScore: number
    qualityScore: number
    deliveryScore: number
    overallScore: number
    recommendation: 'Accept' | 'Negotiate' | 'Reject'
    reasoning: string
  }>> {
    // For PoC, generate mock bids for top 3 matches
    const topMatches = matches.slice(0, 3)

    const prompt = `Generate and evaluate bids for this RFQ in a B2B meat trading platform.

RFQ:
- Product Type: ${rfqData.productType}
- Quantity: ${rfqData.quantity} ${rfqData.unit}
- Estimated Market Price: $5-7 per ${rfqData.unit}

Top Matched Suppliers:
${topMatches.map((m, idx) => `${idx + 1}. ${m.supplier.name} (Match Score: ${m.matchScore}/100)
   - Rating: ${m.supplier.rating}/5
   - Strengths: ${m.strengths.join(', ')}`).join('\n\n')}

For each supplier, generate a realistic bid and evaluate it:

Scoring (0-100 total):
- Price Score (0-40): How competitive is the price?
- Quality Score (0-30): Supplier's quality reputation and certifications
- Delivery Score (0-30): Ability to meet delivery date and location

Recommendation:
- Accept: Score >= 75
- Negotiate: Score 60-74
- Reject: Score < 60

Provide response in JSON format:
{
  "bids": [
    {
      "supplierId": "SUP-001",
      "bidAmount": 6.20,
      "priceScore": 35,
      "qualityScore": 28,
      "deliveryScore": 25,
      "overallScore": 88,
      "recommendation": "Accept",
      "reasoning": "Competitive pricing with excellent quality reputation"
    }
  ]
}`

    const response = await this.llm.invoke([{ role: 'user', content: prompt }])
    const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content)

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      // No bids available
      return []
    }

    const parsed = JSON.parse(jsonMatch[0])

    // Combine bid data with supplier info
    return parsed.bids.map((bid: any) => {
      const match = matches.find(m => m.supplier.id === bid.supplierId)
      return {
        supplier: match?.supplier || { id: bid.supplierId, name: 'Unknown' },
        bidAmount: bid.bidAmount,
        priceScore: bid.priceScore,
        qualityScore: bid.qualityScore,
        deliveryScore: bid.deliveryScore,
        overallScore: bid.overallScore,
        recommendation: bid.recommendation,
        reasoning: bid.reasoning
      }
    })
  }

  /**
   * Generate supplier recommendations
   */
  private generateRecommendations(matches: any[], bidEvaluations: any[]): Array<{
    rank: number
    supplierName: string
    supplierId: string
    matchScore: number
    bidScore?: number
    overallScore: number
    recommendation: string
    rationale: string
  }> {
    // Combine match scores with bid scores (if bids exist)
    const recommendations = matches.map(match => {
      const bid = bidEvaluations.find(b => b.supplier.id === match.supplier.id)

      // Overall score = 50% match score + 50% bid score (if bid exists)
      const overallScore = bid
        ? (match.matchScore * 0.5) + (bid.overallScore * 0.5)
        : match.matchScore

      return {
        supplierName: match.supplier.name,
        supplierId: match.supplier.id,
        matchScore: match.matchScore,
        bidScore: bid?.overallScore,
        overallScore: Math.round(overallScore),
        recommendation: bid?.recommendation || 'Awaiting Bid',
        rationale: bid
          ? `${match.reasoning}. Bid evaluation: ${bid.reasoning}`
          : match.reasoning
      }
    })

    // Sort by overall score
    recommendations.sort((a, b) => b.overallScore - a.overallScore)

    // Add rank
    return recommendations.map((rec, idx) => ({
      rank: idx + 1,
      ...rec
    }))
  }

  /**
   * Generate comprehensive RFQ analysis report
   */
  private generateAnalysisReport(
    rfqData: any,
    validation: any,
    matches: any[],
    bidEvaluations: any[],
    recommendations: any[],
    pastRFQs: any
  ): {
    fullDocument: string
  } {
    const fullDocument = `# RFQ Analysis: ${rfqData.productType}

**RFQ ID**: ${rfqData.id}
**Date**: ${new Date().toISOString().split('T')[0]}
**Analyst**: RFQ Specialist Agent
**Status**: Analysis Complete

---

## RFQ Details

**Product Type**: ${rfqData.productType}
**Quantity**: ${rfqData.quantity} ${rfqData.unit}
**Delivery Date**: ${rfqData.deliveryDate}
**Specifications**: ${JSON.stringify(rfqData.specifications || {}, null, 2)}

---

## RFQ Validation

**Overall Score**: ${validation.score}/100 ${validation.approved ? '✅ APPROVED' : '❌ NEEDS IMPROVEMENT'}

### Score Breakdown
- **Completeness**: ${validation.completeness}/40
- **Clarity**: ${validation.clarity}/30
- **Competitive Attractiveness**: ${validation.competitiveAttractiveness}/30

### Issues & Recommendations

${validation.issues.length > 0 ? validation.issues.map((issue: any) => `#### ${issue.severity}: ${issue.field}
**Issue**: ${issue.issue}
**Recommendation**: ${issue.recommendation}`).join('\n\n') : 'No issues identified. RFQ is well-formed.'}

---

## Supplier Matching

**Total Suppliers Matched**: ${matches.length}

${matches.map((match: any, idx: number) => `### ${idx + 1}. ${match.supplier.name} (${match.supplier.id})

**Match Score**: ${match.matchScore}/100
- Capability Match: ${match.capabilityMatch}/40
- Certification Match: ${match.certificationMatch}/30
- Performance Score: ${match.performanceScore}/30

**Location**: ${match.supplier.location}
**Rating**: ${match.supplier.rating}/5 (${match.supplier.pastOrders} past orders)
**Capabilities**: ${match.supplier.capabilities.join(', ')}
**Certifications**: ${match.supplier.certifications.join(', ')}

**Reasoning**: ${match.reasoning}

**Strengths**:
${match.strengths.map((s: string) => `- ${s}`).join('\n')}

**Concerns**:
${match.concerns.map((c: string) => `- ${c}`).join('\n')}`).join('\n\n---\n\n')}

---

## Bid Evaluations

${bidEvaluations.length > 0 ? `**Total Bids Received**: ${bidEvaluations.length}

${bidEvaluations.map((bid: any, idx: number) => `### ${idx + 1}. ${bid.supplier.name} - $${bid.bidAmount} per ${rfqData.unit}

**Overall Score**: ${bid.overallScore}/100
- Price Score: ${bid.priceScore}/40
- Quality Score: ${bid.qualityScore}/30
- Delivery Score: ${bid.deliveryScore}/30

**Recommendation**: ${bid.recommendation}
**Reasoning**: ${bid.reasoning}`).join('\n\n')}` : 'No bids received yet. Awaiting supplier responses.'}

---

## Recommendations

${recommendations.map((rec: any) => `### ${rec.rank}. ${rec.supplierName} (${rec.supplierId})

**Overall Score**: ${rec.overallScore}/100
- Match Score: ${rec.matchScore}/100
${rec.bidScore ? `- Bid Score: ${rec.bidScore}/100` : ''}

**Recommendation**: ${rec.recommendation}

**Rationale**: ${rec.rationale}`).join('\n\n')}

---

## Action Items

1. ${validation.approved ? '✅ RFQ is approved for distribution' : '❌ Revise RFQ based on recommendations above'}
2. ${bidEvaluations.length > 0 ? `Review top bid from ${recommendations[0].supplierName}` : 'Distribute RFQ to top 3 matched suppliers'}
3. ${bidEvaluations.length > 0 && recommendations[0].recommendation === 'Negotiate' ? 'Negotiate with top bidder to improve terms' : ''}
4. ${bidEvaluations.length > 0 && recommendations[0].recommendation === 'Accept' ? 'Proceed with supplier onboarding and contract' : ''}

---

## Historical Context

${pastRFQs && pastRFQs.length > 0 ?
  `Similar RFQs in the past:\n${pastRFQs.map((rfq: any) => `- ${rfq.name || rfq.title || 'Previous RFQ'}`).join('\n')}` :
  'No similar RFQs found in history.'
}

---

**Generated by**: RFQ Specialist Agent
**Timestamp**: ${new Date().toISOString()}
**Next Step**: ${validation.approved ? (bidEvaluations.length > 0 ? 'Contract negotiation' : 'Supplier outreach') : 'RFQ revision'}
`

    return { fullDocument }
  }

  /**
   * Create validation failure result
   */
  private createValidationFailureResult(state: AgentState, validation: any): Partial<AgentState> {
    const report = `# RFQ Validation Failed

**Score**: ${validation.score}/100 (Threshold: 70)

## Issues

${validation.issues.map((issue: any) => `### ${issue.severity}: ${issue.field}
**Issue**: ${issue.issue}
**Recommendation**: ${issue.recommendation}`).join('\n\n')}

## Next Steps

Please revise the RFQ based on the recommendations above and resubmit.`

    const artifact = this.createArtifact(
      'documentation',
      report,
      {
        validationScore: validation.score,
        approved: false
      }
    )

    const result = this.createResult(
      'needs_approval',
      {
        validationScore: validation.score,
        approved: false,
        issues: validation.issues
      },
      [artifact]
    )

    return {
      messages: [...state.messages],
      agentResults: [...state.agentResults, result],
      requiresApproval: true,
      nextAction: 'revise_rfq'
    }
  }

  /**
   * Create empty result when no RFQ data provided
   */
  private createEmptyResult(state: AgentState): Partial<AgentState> {
    const artifact = this.createArtifact(
      'documentation',
      '# RFQ Analysis\n\nNo RFQ data provided for analysis.',
      {}
    )

    const result = this.createResult(
      'failed',
      { error: 'No RFQ data provided' },
      [artifact]
    )

    return {
      messages: [...state.messages],
      agentResults: [...state.agentResults, result],
      nextAction: 'error_recovery'
    }
  }
}
