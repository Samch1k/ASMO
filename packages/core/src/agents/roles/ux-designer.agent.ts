import { BaseAgent } from "../base-agent"
import { AgentState } from "../types"

/**
 * UX Designer Agent - User experience design and usability
 *
 * Capabilities:
 * - User flow generation (text-based diagrams)
 * - Wireframe recommendations (ASCII mockups)
 * - Component recommendations (buttons, forms, navigation)
 * - Accessibility checklist (WCAG AA compliance)
 * - Mobile-first responsive design considerations
 * - Usability heuristics validation
 *
 * MCP Integrations:
 * - Memory MCP: Store UX patterns and design decisions
 * - Context7 MCP: Research UX best practices
 */
export class UXDesignerAgent extends BaseAgent {
  constructor() {
    super('ux-designer', [
      'user_flows',
      'wireframes',
      'usability',
      'user_research',
      'accessibility',
      'interaction_design'
    ])
  }

  /**
   * Execute UX design workflow
   *
   * Process:
   * 1. Extract user stories and requirements from state
   * 2. Check Memory MCP for similar UX patterns
   * 3. Generate user flows for key scenarios
   * 4. Create wireframes (ASCII mockups)
   * 5. Recommend UI components
   * 6. Generate accessibility checklist (WCAG AA)
   * 7. Add responsive design considerations
   * 8. Generate comprehensive UX design document
   * 9. Store UX patterns in Memory MCP
   */
  async execute(state: AgentState): Promise<Partial<AgentState>> {
    this.log('🎨 Designing user experience...')

    try {
      // STEP 1: Extract user stories and context
      const task = state.task || this.extractTaskFromMessages(state)
      const userStories = state.context?.requirements?.userStories || []
      // acceptanceCriteria available in state.context for future UX validation
      void (state.context?.requirements?.acceptanceCriteria || [])

      if (!task) {
        this.log('No task provided', 'warn')
        return this.createEmptyResult(state)
      }

      // STEP 2: Check Memory MCP for similar UX patterns
      this.log('Checking UX pattern library...')
      const pastUXPatterns = await this.requestMCP('memory', {
        action: 'search_nodes',
        query: `ux design ${task}`,
        type: 'ux_design',
        limit: 3
      })

      // STEP 3: Generate user flows
      this.log('Generating user flows...')
      const userFlows = await this.generateUserFlows(task, userStories)

      // STEP 4: Create wireframes
      this.log('Creating wireframes...')
      const wireframes = await this.generateWireframes(task, userFlows)

      // STEP 5: Recommend UI components
      this.log('Recommending UI components...')
      const componentRecommendations = await this.recommendComponents(task, userFlows)

      // STEP 6: Generate accessibility checklist
      this.log('Generating accessibility checklist...')
      const accessibilityChecklist = await this.generateAccessibilityChecklist(task)

      // STEP 7: Add responsive design considerations
      this.log('Adding responsive design considerations...')
      const responsiveConsiderations = await this.generateResponsiveConsiderations(task)

      // STEP 8: Generate HTML mockups
      this.log('Generating HTML mockups...')
      const htmlMockups = await this.generateHTMLMockups(task, userFlows)

      // STEP 9: Generate styleguide
      this.log('Generating styleguide...')
      const styleguide = await this.generateStyleguide(task, componentRecommendations)

      // STEP 10: Generate UX design document
      const uxDocument = this.generateUXDocument(
        task,
        userFlows,
        wireframes,
        componentRecommendations,
        accessibilityChecklist,
        responsiveConsiderations,
        pastUXPatterns
      )

      // STEP 11: Store in Memory MCP
      this.log('Storing UX design patterns...')
      await this.requestMCP('memory', {
        action: 'create_entities',
        entities: [{
          name: `UX Design: ${task}`,
          entityType: 'ux_design',
          observations: [
            `User Flows: ${userFlows.length}`,
            `Wireframes: ${wireframes.length}`,
            `Components: ${componentRecommendations.length}`,
            `Accessibility Items: ${accessibilityChecklist.length}`,
            ...userFlows.map(f => `Flow: ${f.name}`)
          ]
        }]
      })

      // Create artifact
      const artifact = this.createArtifact(
        'documentation',
        uxDocument.fullDocument,
        {
          userFlowCount: userFlows.length,
          wireframeCount: wireframes.length,
          componentCount: componentRecommendations.length,
          accessibilityScore: accessibilityChecklist.filter(c => c.implemented).length / accessibilityChecklist.length * 100
        }
      )

      // Create HTML mockups artifact
      const mockupsContent = htmlMockups.map(m => `<!-- Screen: ${m.screenName} -->\n${m.html}`).join('\n\n---\n\n')
      const mockupsArtifact = this.createArtifact(
        'documentation',
        mockupsContent,
        {
          documentType: 'html_mockups',
          screenCount: htmlMockups.length
        }
      )

      // Create styleguide artifact
      const styleguideArtifact = this.createArtifact(
        'documentation',
        styleguide,
        {
          documentType: 'styleguide'
        }
      )

      // Create result
      const result = this.createResult(
        'success',
        {
          userFlows: userFlows.map(f => f.name),
          wireframes: wireframes.map(w => w.name),
          components: componentRecommendations.map(c => c.name),
          accessibilityCompliance: 'WCAG AA',
          htmlMockupCount: htmlMockups.length,
          uxSummary: uxDocument.summary
        },
        [artifact, mockupsArtifact, styleguideArtifact]
      )

      return {
        messages: [...state.messages],
        agentResults: [...state.agentResults, result],
        context: {
          ...state.context,
          uxDesign: {
            userFlows,
            wireframes,
            components: componentRecommendations,
            accessibilityChecklist,
            htmlMockups,
            styleguide
          }
        },
        nextAction: 'architect' // Hand to architect for technical design
      }

    } catch (error: any) {
      this.log(`UX design failed: ${error.message}`, 'error')

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
   * Generate user flows for key scenarios
   */
  private async generateUserFlows(task: string, userStories: any[]): Promise<Array<{
    name: string
    description: string
    steps: Array<{
      stepNumber: number
      action: string
      screen: string
      userIntent: string
      systemResponse: string
    }>
    entryPoint: string
    exitPoint: string
    alternateFlows: string[]
  }>> {
    const prompt = `Generate user flows for this feature in a B2B meat trading platform (your project).

Task: ${task}

User Stories: ${userStories.map((s: any) => `${s.id}: ${s.title}`).join('\n')}

Create 2-4 user flows representing the main usage scenarios.

For each flow, define:
- Entry point (where user starts)
- Steps (screen, action, intent, system response)
- Exit point (where user ends)
- Alternate flows (error paths, edge cases)

Provide response in JSON format:
{
  "flows": [
    {
      "name": "Happy Path: users searches for suppliers",
      "description": "Main flow for users to discover and evaluate suppliers",
      "steps": [
        {
          "stepNumber": 1,
          "action": "User clicks 'Find Suppliers' button",
          "screen": "Dashboard",
          "userIntent": "Discover new suppliers",
          "systemResponse": "Display supplier search form"
        }
      ],
      "entryPoint": "Dashboard",
      "exitPoint": "Supplier profile page",
      "alternateFlows": ["No results found", "Search error"]
    }
  ]
}`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.4,
      maxTokens: 4096
    })

    const jsonMatch = response.content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return [{
        name: 'Main User Flow',
        description: task,
        steps: [
          {
            stepNumber: 1,
            action: 'User accesses feature',
            screen: 'Main screen',
            userIntent: 'Complete task',
            systemResponse: 'Display interface'
          }
        ],
        entryPoint: 'Home page',
        exitPoint: 'Task complete',
        alternateFlows: ['Error handling']
      }]
    }

    const parsed = JSON.parse(jsonMatch[0])
    return parsed.flows || []
  }

  /**
   * Generate ASCII wireframes for key screens
   */
  private async generateWireframes(task: string, userFlows: any[]): Promise<Array<{
    name: string
    screen: string
    wireframe: string
    components: string[]
    interactions: string[]
    notes: string
  }>> {
    const prompt = `Create ASCII wireframes for the key screens in these user flows.

Task: ${task}

User Flows: ${userFlows.map((f: any) => f.name).join(', ')}

For each key screen, create an ASCII wireframe showing:
- Layout structure (header, content, footer)
- Main components (buttons, forms, lists, cards)
- Navigation elements
- Call-to-action placement

Provide response in JSON format:
{
  "wireframes": [
    {
      "name": "Supplier Search Page",
      "screen": "Search",
      "wireframe": "ASCII wireframe here with box drawing characters",
      "components": ["Search input", "Filter dropdown", "Supplier card list", "Pagination"],
      "interactions": ["Type to search", "Click filter", "Click supplier card to view details"],
      "notes": "Mobile-first design, filters collapse on mobile"
    }
  ]
}

Use box drawing characters for wireframes:
┌─────────────────┐
│  Header         │
├─────────────────┤
│  [Search Input] │
│  [Filter ▾]     │
│                 │
│  ┌────────┐     │
│  │ Item 1 │     │
│  └────────┘     │
└─────────────────┘`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.4,
      maxTokens: 4096
    })

    const jsonMatch = response.content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return [{
        name: 'Main Screen',
        screen: 'Main',
        wireframe: `┌─────────────────┐
│  Header         │
├─────────────────┤
│  Main Content   │
│  [CTA Button]   │
└─────────────────┘`,
        components: ['Header', 'Content area', 'CTA button'],
        interactions: ['Click button'],
        notes: 'Simple layout'
      }]
    }

    const parsed = JSON.parse(jsonMatch[0])
    return parsed.wireframes || []
  }

  /**
   * Recommend UI components based on flows
   */
  private async recommendComponents(task: string, userFlows: any[]): Promise<Array<{
    name: string
    type: 'button' | 'form' | 'navigation' | 'display' | 'input' | 'feedback'
    purpose: string
    variant: string
    example: string
    accessibility: string
  }>> {
    const prompt = `Recommend UI components for this feature based on user flows.

Task: ${task}

User Flows: ${userFlows.map((f: any) => f.name).join('\n')}

For each recommended component, specify:
- Component type (button, form, navigation, display, input, feedback)
- Purpose and usage
- Variant (primary, secondary, ghost, etc.)
- Example implementation
- Accessibility considerations

Provide response in JSON format:
{
  "components": [
    {
      "name": "Search Button",
      "type": "button",
      "purpose": "Trigger supplier search",
      "variant": "primary",
      "example": "<button class=\\"btn-primary\\">Search Suppliers</button>",
      "accessibility": "Include aria-label, keyboard accessible, focus visible"
    }
  ]
}`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.4,
      maxTokens: 4096
    })

    const jsonMatch = response.content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return [{
        name: 'Primary Button',
        type: 'button',
        purpose: 'Main action',
        variant: 'primary',
        example: '<button>Action</button>',
        accessibility: 'Keyboard accessible, ARIA labels'
      }]
    }

    const parsed = JSON.parse(jsonMatch[0])
    return parsed.components || []
  }

  /**
   * Generate WCAG AA accessibility checklist
   */
  private async generateAccessibilityChecklist(task: string): Promise<Array<{
    category: 'Perceivable' | 'Operable' | 'Understandable' | 'Robust'
    criterion: string
    wcagLevel: 'A' | 'AA'
    description: string
    implementation: string
    implemented: boolean
  }>> {
    const prompt = `Generate accessibility checklist for this feature following WCAG 2.1 AA standards.

Task: ${task}

WCAG Principles:
1. Perceivable: Information and UI components must be presentable to users
2. Operable: UI components and navigation must be operable
3. Understandable: Information and UI operation must be understandable
4. Robust: Content must be robust enough for various user agents

Generate 8-12 specific accessibility requirements for this feature.

Provide response in JSON format:
{
  "checklist": [
    {
      "category": "Perceivable",
      "criterion": "1.4.3 Contrast (Minimum)",
      "wcagLevel": "AA",
      "description": "Text has contrast ratio of at least 4.5:1",
      "implementation": "Use color palette with sufficient contrast, test with contrast checker",
      "implemented": true
    }
  ]
}`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.4,
      maxTokens: 4096
    })

    const jsonMatch = response.content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return [
        {
          category: 'Perceivable',
          criterion: '1.4.3 Contrast',
          wcagLevel: 'AA',
          description: 'Sufficient color contrast',
          implementation: 'Use high contrast colors',
          implemented: true
        },
        {
          category: 'Operable',
          criterion: '2.1.1 Keyboard',
          wcagLevel: 'A',
          description: 'Keyboard accessible',
          implementation: 'All interactive elements keyboard accessible',
          implemented: true
        }
      ]
    }

    const parsed = JSON.parse(jsonMatch[0])
    return parsed.checklist || []
  }

  /**
   * Generate responsive design considerations
   */
  private async generateResponsiveConsiderations(task: string): Promise<{
    mobileFirst: boolean
    breakpoints: Array<{ size: string; minWidth: string; considerations: string[] }>
    touchTargets: string
    mobileOptimizations: string[]
  }> {
    const prompt = `Define responsive design strategy for this feature (mobile-first approach).

Task: ${task}

Define:
- Breakpoints (mobile, tablet, desktop)
- Touch target sizes (minimum 44x44px)
- Mobile-specific optimizations

Provide response in JSON format:
{
  "mobileFirst": true,
  "breakpoints": [
    {
      "size": "Mobile",
      "minWidth": "0px",
      "considerations": ["Single column layout", "Stacked navigation", "Larger touch targets"]
    },
    {
      "size": "Tablet",
      "minWidth": "768px",
      "considerations": ["Two column layout", "Side navigation"]
    },
    {
      "size": "Desktop",
      "minWidth": "1024px",
      "considerations": ["Multi-column layout", "Hover states", "Keyboard shortcuts"]
    }
  ],
  "touchTargets": "Minimum 44x44px for all interactive elements (WCAG 2.1 AA)",
  "mobileOptimizations": [
    "Reduce image sizes on mobile",
    "Lazy load below-fold content",
    "Use mobile-optimized forms (larger inputs, appropriate input types)"
  ]
}`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.4,
      maxTokens: 4096
    })

    const jsonMatch = response.content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return {
        mobileFirst: true,
        breakpoints: [
          { size: 'Mobile', minWidth: '0px', considerations: ['Single column'] },
          { size: 'Desktop', minWidth: '1024px', considerations: ['Multi-column'] }
        ],
        touchTargets: 'Minimum 44x44px',
        mobileOptimizations: ['Responsive images', 'Touch-friendly buttons']
      }
    }

    return JSON.parse(jsonMatch[0])
  }

  /**
   * Generate comprehensive UX design document
   */
  private generateUXDocument(
    task: string,
    userFlows: any[],
    wireframes: any[],
    components: any[],
    accessibilityChecklist: any[],
    responsiveConsiderations: any,
    pastPatterns: any
  ): {
    fullDocument: string
    summary: string
  } {
    const summary = `Created ${userFlows.length} user flows, ${wireframes.length} wireframes, and ${components.length} component recommendations with WCAG AA accessibility compliance.`

    const fullDocument = `# UX Design Document: ${task}

**Date**: ${new Date().toISOString().split('T')[0]}
**UX Designer**: AI Agent
**Status**: UX Design Complete

---

## Executive Summary

${summary}

---

## User Flows (${userFlows.length})

${userFlows.map(flow => `### ${flow.name}

**Description**: ${flow.description}

**Entry Point**: ${flow.entryPoint}
**Exit Point**: ${flow.exitPoint}

#### Flow Steps

${flow.steps.map((step: any) => `${step.stepNumber}. **${step.screen}**: ${step.action}
   - User Intent: ${step.userIntent}
   - System Response: ${step.systemResponse}
`).join('\n')}

**Alternate Flows**: ${flow.alternateFlows.join(', ')}

`).join('\n---\n\n')}

---

## Wireframes (${wireframes.length})

${wireframes.map(wf => `### ${wf.name}

**Screen**: ${wf.screen}

\`\`\`
${wf.wireframe}
\`\`\`

**Components**: ${wf.components.join(', ')}

**Interactions**:
${wf.interactions.map((i: string) => `- ${i}`).join('\n')}

**Notes**: ${wf.notes}

`).join('\n---\n\n')}

---

## Component Recommendations (${components.length})

${components.map(comp => `### ${comp.name} (${comp.type})

**Purpose**: ${comp.purpose}
**Variant**: ${comp.variant}

**Example**:
\`\`\`html
${comp.example}
\`\`\`

**Accessibility**: ${comp.accessibility}

`).join('\n')}

---

## Accessibility Compliance (WCAG 2.1 AA)

**Compliance Status**: ${Math.round(accessibilityChecklist.filter(c => c.implemented).length / accessibilityChecklist.length * 100)}% implemented

${['Perceivable', 'Operable', 'Understandable', 'Robust'].map(category => {
  const items = accessibilityChecklist.filter((c: any) => c.category === category)
  return `### ${category} (${items.length} items)

${items.map((item: any) => `#### ${item.criterion} (${item.wcagLevel})

**Description**: ${item.description}

**Implementation**: ${item.implementation}

**Status**: ${item.implemented ? '✅ Implemented' : '⚠️ Pending'}
`).join('\n')}`
}).join('\n\n')}

---

## Responsive Design Strategy

**Approach**: ${responsiveConsiderations.mobileFirst ? 'Mobile-First ✅' : 'Desktop-First'}

### Breakpoints

${responsiveConsiderations.breakpoints.map((bp: any) => `#### ${bp.size} (${bp.minWidth}+)

${bp.considerations.map((c: string) => `- ${c}`).join('\n')}
`).join('\n')}

### Touch Targets

${responsiveConsiderations.touchTargets}

### Mobile Optimizations

${responsiveConsiderations.mobileOptimizations.map((opt: string) => `- ${opt}`).join('\n')}

---

## Usability Heuristics

### 1. Visibility of System Status
User always knows what's happening through clear feedback and status indicators.

### 2. Match Between System and Real World
Interface uses familiar language and concepts from meat trading domain.

### 3. User Control and Freedom
Users can undo/redo actions, cancel operations, and navigate freely.

### 4. Consistency and Standards
UI follows platform conventions and internal consistency.

### 5. Error Prevention
Design prevents errors through constraints, confirmations, and validation.

### 6. Recognition Rather Than Recall
Options, actions, and objects are visible. User doesn't need to remember information.

### 7. Flexibility and Efficiency
Shortcuts for experienced users, while remaining accessible to novices.

### 8. Aesthetic and Minimalist Design
Interfaces contain only relevant information, avoiding clutter.

### 9. Help Users Recognize, Diagnose, and Recover from Errors
Error messages in plain language, indicate problem, suggest solution.

### 10. Help and Documentation
Contextual help available when needed, focused on user tasks.

---

## Historical Patterns

${pastPatterns && pastPatterns.length > 0 ?
  `Similar UX patterns used in the past:\n${pastPatterns.map((p: any) => `- ${p.name || p.title || 'Previous pattern'}`).join('\n')}` :
  'No similar patterns found in history.'
}

---

## Next Steps

1. **Technical Design**: Hand to Architect for system design and API specification
2. **Visual Design**: UI Developer to implement components with Tailwind CSS
3. **Usability Testing**: Validate flows with real users
4. **Accessibility Audit**: Test with screen readers and keyboard navigation

---

## Sign-Off

- [ ] UX Designer approval
- [ ] Product Owner review
- [ ] Accessibility specialist review

---

**Generated by**: UX Designer Agent
**Timestamp**: ${new Date().toISOString()}
`

    return { fullDocument, summary }
  }

  /**
   * Generate self-contained HTML5 + Tailwind CSS mockups for key screens
   */
  private async generateHTMLMockups(task: string, userFlows: any[]): Promise<Array<{
    screenName: string
    html: string
  }>> {
    const screens = userFlows.flatMap((f: any) =>
      f.steps?.map((s: any) => s.screen) || []
    ).filter((v: string, i: number, a: string[]) => a.indexOf(v) === i).slice(0, 5)

    const prompt = `Generate self-contained HTML5 mockups with Tailwind CSS (via CDN) for these screens.

Task: ${task}

Screens to mock up: ${screens.join(', ') || 'Main screen, List view, Detail view'}

For each screen, create a COMPLETE, self-contained HTML file that:
- Uses <!DOCTYPE html> with Tailwind CSS CDN (<script src="https://cdn.tailwindcss.com"></script>)
- Is responsive (mobile-first)
- Uses semantic HTML5 elements
- Includes realistic placeholder content
- Has a consistent header/navigation across screens

Return JSON:
{
  "mockups": [
    {
      "screenName": "Screen Name",
      "html": "<!DOCTYPE html>\\n<html>...</html>"
    }
  ]
}`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.4,
      maxTokens: 8192
    })

    const jsonMatch = response.content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return [{
        screenName: 'Main Screen',
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${task} - Main Screen</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen">
  <header class="bg-white shadow"><div class="max-w-7xl mx-auto px-4 py-4"><h1 class="text-xl font-bold text-gray-900">${task}</h1></div></header>
  <main class="max-w-7xl mx-auto px-4 py-8"><p class="text-gray-600">Main content area</p></main>
</body>
</html>`
      }]
    }

    const parsed = JSON.parse(jsonMatch[0])
    return parsed.mockups || []
  }

  /**
   * Generate design system / styleguide document
   */
  private async generateStyleguide(task: string, components: any[]): Promise<string> {
    const prompt = `Generate a design system styleguide document for this project.

Task: ${task}

Components used: ${components.map((c: any) => c.name).join(', ')}

Create a markdown styleguide covering:
1. Color Palette (primary, secondary, neutral, semantic colors with hex codes)
2. Typography (font families, sizes, weights, line heights)
3. Spacing Scale (4px base, 8-step scale)
4. Component Patterns (buttons, forms, cards, navigation)
5. Icons and Imagery guidelines
6. Responsive breakpoints

Format as a clean markdown document.`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.4,
      maxTokens: 4096
    })

    return response.content
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
   * Create empty result when no task provided
   */
  private createEmptyResult(state: AgentState): Partial<AgentState> {
    const artifact = this.createArtifact(
      'documentation',
      '# UX Design Document\n\nNo task provided for UX design.',
      {}
    )

    const result = this.createResult(
      'failed',
      { error: 'No task provided' },
      [artifact]
    )

    return {
      messages: [...state.messages],
      agentResults: [...state.agentResults, result],
      nextAction: 'error_recovery'
    }
  }
}
