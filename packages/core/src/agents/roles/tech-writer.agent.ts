import { BaseAgent } from "../base-agent"
import { AgentState } from "../types"

/**
 * Tech Writer Agent - Documentation Specialist
 *
 * Capabilities:
 * - Technical documentation writing
 * - API documentation generation
 * - User guides and tutorials
 * - README and getting started guides
 * - Architecture documentation
 * - Release notes
 * - Internal documentation
 *
 * MCP Integrations:
 * - Memory MCP: Store documentation for consistency
 * - Filesystem MCP: Read code and existing docs
 * - Context7 MCP: Research documentation best practices
 */
export class TechWriterAgent extends BaseAgent {
  constructor() {
    super('tech-writer', [
      'documentation',
      'technical_writing',
      'api_documentation',
      'user_guides',
      'readme_creation',
      'release_notes',
      'architecture_docs'
    ])
  }

  /**
   * Execute documentation workflow
   *
   * Process:
   * 1. Determine documentation type
   * 2. Gather source materials
   * 3. Research best practices
   * 4. Generate documentation
   * 5. Review for clarity and completeness
   * 6. Store documentation
   */
  async execute(state: AgentState): Promise<Partial<AgentState>> {
    this.log('📝 Starting documentation generation...')

    try {
      const task = state.task

      // Check for discovery context — consolidate all deliverables
      if (this.isDiscoveryContext(state)) {
        this.log('Discovery context detected — generating master document')
        return this.generateDiscoveryMasterDocument(state)
      }

      const docType = this.determineDocType(task)

      this.log(`Documentation type: ${docType}`)

      // STEP 1: Gather source materials
      this.log('Gathering source materials...')
      const sourceCode = state.context?.code || state.context?.artifact?.content
      const existingDocs = await this.requestMCP('memory', {
        action: 'search_nodes',
        query: `documentation ${task}`,
        type: 'documentation',
        limit: 3
      })

      // STEP 2: Research best practices
      this.log('Researching documentation best practices...')
      const bestPractices = await this.requestMCP('context7', {
        action: 'get-library-docs',
        libraryId: '/documentation',
        topic: `${docType} documentation best practices`,
        tokens: 2000
      })

      // Build enriched context with gathered materials
      const enrichedContext = {
        ...state.context,
        sourceCode,
        existingDocs,
        bestPractices
      }

      // STEP 3: Generate documentation based on type
      let documentation
      switch (docType) {
        case 'api':
          documentation = await this.generateAPIDocumentation(task, enrichedContext)
          break
        case 'user-guide':
          documentation = await this.generateUserGuide(task, enrichedContext)
          break
        case 'readme':
          documentation = await this.generateReadme(task, enrichedContext)
          break
        case 'architecture':
          documentation = await this.generateArchitectureDocs(task, enrichedContext)
          break
        case 'release-notes':
          documentation = await this.generateReleaseNotes(task, enrichedContext)
          break
        case 'tutorial':
          documentation = await this.generateTutorial(task, enrichedContext)
          break
        default:
          documentation = await this.generateGeneralDocumentation(task, enrichedContext)
      }

      // STEP 4: Review and enhance
      this.log('Reviewing documentation for clarity...')
      const reviewed = await this.reviewDocumentation(documentation)

      // STEP 5: Store in Memory MCP
      this.log('Storing documentation...')
      await this.requestMCP('memory', {
        action: 'create_entities',
        entities: [{
          name: `Documentation: ${task.substring(0, 50)}`,
          entityType: 'documentation',
          observations: [
            `Type: ${docType}`,
            `Sections: ${reviewed.sections?.length || 0}`,
            `Word count: ${reviewed.content.split(/\s+/).length}`
          ]
        }]
      })

      // STEP 6: Create artifact
      const artifact = this.createArtifact(
        'documentation',
        reviewed.content,
        {
          docType,
          sections: reviewed.sections,
          wordCount: reviewed.content.split(/\s+/).length
        }
      )

      const result = this.createResult(
        'success',
        {
          docType,
          summary: reviewed.summary,
          sections: reviewed.sections
        },
        [artifact]
      )

      this.log('✅ Documentation complete')

      return {
        agentResults: [...state.agentResults, result],
        context: {
          ...state.context,
          documentation: {
            type: docType,
            content: reviewed.content,
            sections: reviewed.sections
          }
        },
        nextAction: 'END'
      }

    } catch (error: any) {
      this.log(`Documentation failed: ${error.message}`, 'error')

      const errorResult = this.createResult('failed', { error: error.message }, [])

      return {
        agentResults: [...state.agentResults, errorResult],
        nextAction: 'error_recovery'
      }
    }
  }

  /**
   * Detect discovery context by checking artifact documentType values
   */
  private isDiscoveryContext(state: AgentState): boolean {
    const artifacts = state.artifacts || []
    const documentTypes = artifacts
      .map((a: any) => a.metadata?.documentType)
      .filter(Boolean)

    const discoveryTypes = ['prd', 'html_mockups', 'technical_specification']
    const matchCount = discoveryTypes.filter(t => documentTypes.includes(t)).length

    return matchCount >= 2
  }

  /**
   * Generate master discovery document consolidating all 7 deliverables
   */
  private async generateDiscoveryMasterDocument(state: AgentState): Promise<Partial<AgentState>> {
    const artifacts = state.artifacts || []

    // Find deliverables by documentType
    const findByType = (type: string) =>
      artifacts.find((a: any) => a.metadata?.documentType === type)

    const prd = findByType('prd')
    const htmlMockups = findByType('html_mockups')
    const styleguide = findByType('styleguide')
    const adr = findByType('adr')
    const techSpec = findByType('technical_specification')
    const dbSchema = findByType('database_schema')
    const apiDesign = findByType('api_design')
    const testStrategy = findByType('test_strategy')

    // Build deliverable summary
    const deliverables = [
      { name: 'PRD (Product Requirements Document)', found: !!prd, type: 'prd' },
      { name: 'HTML Mockups + Styleguide', found: !!(htmlMockups || styleguide), type: 'html_mockups' },
      { name: 'Architecture Decision Record (ADR)', found: !!adr, type: 'adr' },
      { name: 'Technical Specification', found: !!techSpec, type: 'technical_specification' },
      { name: 'Database Schema', found: !!dbSchema, type: 'database_schema' },
      { name: 'API Contracts', found: !!apiDesign, type: 'api_design' },
      { name: 'Quality Strategy', found: !!testStrategy, type: 'test_strategy' }
    ]

    const foundCount = deliverables.filter(d => d.found).length

    // Generate executive summary via LLM
    const summaryContext = {
      task: state.task,
      deliverables: deliverables.map(d => ({ name: d.name, found: d.found })),
      prdSummary: prd?.content?.substring(0, 500) || 'Not available',
      techSpecSummary: techSpec?.content?.substring(0, 500) || 'Not available',
      adrSummary: adr?.content?.substring(0, 500) || 'Not available'
    }

    const prompt = `Write an executive summary and implementation roadmap for a discovery phase.

Project: ${state.task}

Deliverables produced: ${foundCount}/7
${deliverables.map(d => `- ${d.found ? '[x]' : '[ ]'} ${d.name}`).join('\n')}

PRD excerpt: ${summaryContext.prdSummary}
Technical Spec excerpt: ${summaryContext.techSpecSummary}

Write:
1. Executive Summary (2-3 paragraphs: what was discovered, key decisions, risks)
2. Implementation Roadmap (5-8 phases with dependencies and estimated effort)
3. Key Risks and Mitigations (top 5)
4. Recommended Next Steps

Format as markdown sections.`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.3,
      maxTokens: 4096
    })

    const timestamp = new Date().toISOString().split('T')[0]

    const masterDocument = `# Discovery Master Document: ${state.task}

**Date**: ${timestamp}
**Generated by**: Tech Writer Agent (ASMO)
**Deliverables**: ${foundCount}/7 complete

---

## Deliverable Status

| # | Deliverable | Status |
|---|-------------|--------|
${deliverables.map((d, i) => `| ${i + 1} | ${d.name} | ${d.found ? 'Complete' : 'Missing'} |`).join('\n')}

---

${response.content}

---

## Deliverable References

${prd ? `### 1. PRD\n\n${prd.content.substring(0, 2000)}${prd.content.length > 2000 ? '\n\n*[Truncated — see full PRD artifact]*' : ''}\n\n---\n` : '### 1. PRD\n\n*Not produced in this run*\n\n---\n'}

${htmlMockups ? `### 2. HTML Mockups\n\n${htmlMockups.metadata?.screenCount || 'Multiple'} screens generated. Open HTML files in browser to preview.\n\n---\n` : '### 2. HTML Mockups\n\n*Not produced in this run*\n\n---\n'}

${adr ? `### 3. Architecture Decision Record\n\n${adr.content.substring(0, 2000)}${adr.content.length > 2000 ? '\n\n*[Truncated — see full ADR artifact]*' : ''}\n\n---\n` : '### 3. Architecture Decision Record\n\n*Not produced in this run*\n\n---\n'}

${techSpec ? `### 4. Technical Specification\n\n${techSpec.content.substring(0, 2000)}${techSpec.content.length > 2000 ? '\n\n*[Truncated — see full Technical Specification artifact]*' : ''}\n\n---\n` : '### 4. Technical Specification\n\n*Not produced in this run*\n\n---\n'}

${dbSchema ? `### 5. Database Schema\n\n${dbSchema.content.substring(0, 2000)}${dbSchema.content.length > 2000 ? '\n\n*[Truncated — see full Database Schema artifact]*' : ''}\n\n---\n` : '### 5. Database Schema\n\n*Not produced in this run*\n\n---\n'}

${apiDesign ? `### 6. API Contracts\n\n${apiDesign.content.substring(0, 2000)}${apiDesign.content.length > 2000 ? '\n\n*[Truncated — see full API Contracts artifact]*' : ''}\n\n---\n` : '### 6. API Contracts\n\n*Not produced in this run*\n\n---\n'}

${testStrategy ? `### 7. Quality Strategy\n\n${testStrategy.content.substring(0, 2000)}${testStrategy.content.length > 2000 ? '\n\n*[Truncated — see full Quality Strategy artifact]*' : ''}\n\n---\n` : '### 7. Quality Strategy\n\n*Not produced in this run*\n\n---\n'}

## Sign-Off

- [ ] Product Owner approval
- [ ] Technical Lead review
- [ ] Stakeholder sign-off
- [ ] Ready for implementation

---

**Generated by**: Tech Writer Agent (ASMO Multi-Agent System)
**Timestamp**: ${new Date().toISOString()}
`

    // Store in Memory MCP
    await this.requestMCP('memory', {
      action: 'create_entities',
      entities: [{
        name: `Discovery: ${state.task?.substring(0, 50)}`,
        entityType: 'documentation',
        observations: [
          `Deliverables: ${foundCount}/7`,
          ...deliverables.filter(d => d.found).map(d => `Completed: ${d.name}`)
        ]
      }]
    })

    const artifact = this.createArtifact(
      'documentation',
      masterDocument,
      {
        documentType: 'discovery_master',
        deliverableCount: foundCount,
        totalDeliverables: 7
      }
    )

    const result = this.createResult(
      'success',
      {
        docType: 'discovery_master',
        summary: `Discovery master document consolidating ${foundCount}/7 deliverables`,
        deliverables: deliverables.map(d => ({ name: d.name, found: d.found }))
      },
      [artifact]
    )

    this.log(`✅ Master document complete (${foundCount}/7 deliverables)`)

    return {
      agentResults: [...state.agentResults, result],
      context: {
        ...state.context,
        documentation: {
          type: 'discovery_master',
          content: masterDocument,
          sections: ['Executive Summary', 'Implementation Roadmap', 'Risks', 'Deliverable References']
        }
      },
      nextAction: 'END'
    }
  }

  private determineDocType(task: string): string {
    const lower = task.toLowerCase()

    if (lower.includes('api') || lower.includes('endpoint')) return 'api'
    if (lower.includes('user guide') || lower.includes('user-guide')) return 'user-guide'
    if (lower.includes('readme')) return 'readme'
    if (lower.includes('architecture') || lower.includes('system design')) return 'architecture'
    if (lower.includes('release') || lower.includes('changelog')) return 'release-notes'
    if (lower.includes('tutorial') || lower.includes('how to') || lower.includes('getting started')) return 'tutorial'

    return 'general'
  }

  private async generateAPIDocumentation(
    task: string,
    context: any
  ): Promise<DocumentationResult> {
    const prompt = `Generate API documentation.

Task: ${task}

Context: ${JSON.stringify(context, null, 2)}

Create comprehensive API documentation including:
1. Overview and purpose
2. Authentication/Authorization
3. Base URL and versioning
4. Endpoints (for each):
   - HTTP method and path
   - Description
   - Request parameters (path, query, body)
   - Response format with examples
   - Error codes
5. Rate limiting
6. Code examples (curl, JavaScript, Python)

Use OpenAPI-style documentation format where applicable.

Return as JSON:
{
  "summary": "Brief summary",
  "sections": ["Overview", "Authentication", "Endpoints", ...],
  "content": "Full markdown documentation"
}`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.3,
      maxTokens: 8192
    })
    return this.parseDocumentationResponse(response.content)
  }

  private async generateUserGuide(
    task: string,
    context: any
  ): Promise<DocumentationResult> {
    const prompt = `Generate a user guide.

Task: ${task}

Context: ${JSON.stringify(context, null, 2)}

Create a user-friendly guide including:
1. Introduction and purpose
2. Prerequisites
3. Key concepts (glossary)
4. Step-by-step instructions (with screenshots placeholders)
5. Common use cases
6. Troubleshooting FAQ
7. Tips and best practices

Write for non-technical users. Use clear, simple language.

Return as JSON:
{
  "summary": "Brief summary",
  "sections": ["Introduction", "Prerequisites", ...],
  "content": "Full markdown documentation"
}`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.3,
      maxTokens: 8192
    })
    return this.parseDocumentationResponse(response.content)
  }

  private async generateReadme(
    task: string,
    context: any
  ): Promise<DocumentationResult> {
    const prompt = `Generate a README.md file.

Task: ${task}

Context: ${JSON.stringify(context, null, 2)}

Create a comprehensive README including:
1. Project name and badges
2. Brief description (elevator pitch)
3. Key features (bullet points)
4. Quick start / Installation
5. Usage examples
6. Configuration options
7. Contributing guidelines
8. License
9. Credits/Acknowledgments

Make it scannable with clear headings.

Return as JSON:
{
  "summary": "Brief summary",
  "sections": ["Overview", "Features", "Installation", ...],
  "content": "Full markdown README"
}`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.3,
      maxTokens: 8192
    })
    return this.parseDocumentationResponse(response.content)
  }

  private async generateArchitectureDocs(
    task: string,
    context: any
  ): Promise<DocumentationResult> {
    const prompt = `Generate architecture documentation.

Task: ${task}

Context: ${JSON.stringify(context, null, 2)}

Create comprehensive architecture documentation including:
1. System Overview
2. High-level architecture diagram (describe in text/mermaid)
3. Component descriptions
4. Data flow
5. Technology stack
6. Design decisions (ADRs format)
7. Scalability considerations
8. Security considerations
9. Deployment architecture
10. Monitoring and observability

Use C4 model terminology where applicable.

Return as JSON:
{
  "summary": "Brief summary",
  "sections": ["Overview", "Components", "Data Flow", ...],
  "content": "Full markdown documentation"
}`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.3,
      maxTokens: 8192
    })
    return this.parseDocumentationResponse(response.content)
  }

  private async generateReleaseNotes(
    task: string,
    context: any
  ): Promise<DocumentationResult> {
    const prompt = `Generate release notes.

Task: ${task}

Context: ${JSON.stringify(context, null, 2)}

Create release notes following Keep a Changelog format:
1. Version number and date
2. Summary of release highlights
3. Added: New features
4. Changed: Changes to existing functionality
5. Deprecated: Features to be removed
6. Removed: Removed features
7. Fixed: Bug fixes
8. Security: Security fixes
9. Breaking changes (if any)
10. Migration guide (if needed)

Return as JSON:
{
  "summary": "Brief summary",
  "sections": ["Highlights", "Added", "Changed", "Fixed", ...],
  "content": "Full markdown release notes"
}`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.3,
      maxTokens: 8192
    })
    return this.parseDocumentationResponse(response.content)
  }

  private async generateTutorial(
    task: string,
    context: any
  ): Promise<DocumentationResult> {
    const prompt = `Generate a step-by-step tutorial.

Task: ${task}

Context: ${JSON.stringify(context, null, 2)}

Create a hands-on tutorial including:
1. What you'll learn (objectives)
2. Prerequisites
3. Time to complete
4. Step-by-step instructions:
   - Clear numbered steps
   - Code snippets with explanations
   - Expected outputs
   - Checkpoint validations
5. What's next (related tutorials)
6. Troubleshooting common issues

Make each step atomic and verifiable.

Return as JSON:
{
  "summary": "Brief summary",
  "sections": ["Objectives", "Prerequisites", "Steps", ...],
  "content": "Full markdown tutorial"
}`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.3,
      maxTokens: 8192
    })
    return this.parseDocumentationResponse(response.content)
  }

  private async generateGeneralDocumentation(
    task: string,
    context: any
  ): Promise<DocumentationResult> {
    const prompt = `Generate technical documentation.

Task: ${task}

Context: ${JSON.stringify(context, null, 2)}

Create clear, comprehensive documentation including:
1. Overview and purpose
2. Key concepts
3. Detailed explanation
4. Examples
5. Reference material
6. Related resources

Follow technical writing best practices:
- Clear, concise language
- Logical structure
- Consistent terminology
- Actionable information

Return as JSON:
{
  "summary": "Brief summary",
  "sections": ["Overview", "Concepts", ...],
  "content": "Full markdown documentation"
}`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.3,
      maxTokens: 8192
    })
    return this.parseDocumentationResponse(response.content)
  }

  private async reviewDocumentation(
    doc: DocumentationResult
  ): Promise<DocumentationResult> {
    const prompt = `Review and improve this documentation for clarity, completeness, and accuracy.

Documentation:
${doc.content}

Check for:
1. Clear and concise writing
2. Logical structure and flow
3. Complete information (no gaps)
4. Consistent terminology
5. Proper formatting
6. Grammar and spelling

Return the improved documentation in JSON format:
{
  "summary": "Brief summary of improvements",
  "sections": ["section1", "section2", ...],
  "content": "Improved markdown documentation"
}`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.3,
      maxTokens: 8192
    })
    return this.parseDocumentationResponse(response.content)
  }

  private parseDocumentationResponse(content: any): DocumentationResult {
    const str = typeof content === 'string' ? content : JSON.stringify(content)
    const jsonMatch = str.match(/\{[\s\S]*\}/)

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          summary: parsed.summary || 'Documentation generated',
          sections: parsed.sections || [],
          content: parsed.content || str
        }
      } catch {
        // Fall through
      }
    }

    return {
      summary: 'Documentation generated',
      sections: [],
      content: str
    }
  }
}

interface DocumentationResult {
  summary: string
  sections: string[]
  content: string
}
