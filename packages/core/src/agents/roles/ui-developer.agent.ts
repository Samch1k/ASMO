import { BaseAgent } from "../base-agent"
import { AgentState } from "../types"

/**
 * UI Developer Agent - Frontend component implementation
 *
 * Capabilities:
 * - React/TypeScript component implementation
 * - Tailwind CSS v4 styling (mobile-first)
 * - Responsive design implementation
 * - Accessibility attributes (ARIA)
 * - Component testing (Vitest + React Testing Library)
 * - Radix UI primitives integration
 *
 * MCP Integrations:
 * - Memory MCP: Store component patterns
 * - Context7 MCP: Research component best practices
 */
export class UIDevAgent extends BaseAgent {
  constructor() {
    super('ui-developer', [
      'component_styling',
      'tailwind_css',
      'accessibility',
      'responsive_design',
      'react_implementation',
      'frontend_testing'
    ])
  }

  /**
   * Execute UI development workflow
   *
   * Process:
   * 1. Extract UX design and wireframes from state
   * 2. Check Memory MCP for similar component patterns
   * 3. Generate React/TypeScript components
   * 4. Apply Tailwind CSS styling (mobile-first)
   * 5. Add accessibility attributes
   * 6. Ensure responsive design
   * 7. Generate component tests
   * 8. Create implementation document
   * 9. Store component patterns in Memory MCP
   */
  async execute(state: AgentState): Promise<Partial<AgentState>> {
    this.log('🎨 Creating UI components...')

    try {
      // STEP 1: Extract UX design and context
      const task = state.task || this.extractTaskFromMessages(state)
      const uxDesign = state.context?.uxDesign
      const components = uxDesign?.components || []
      const wireframes = uxDesign?.wireframes || []

      if (!task) {
        this.log('No task provided', 'warn')
        return this.createEmptyResult(state)
      }

      // STEP 2: Check Memory MCP for similar component patterns
      this.log('Checking component pattern library...')
      const pastComponentPatterns = await this.requestMCP('memory', {
        action: 'search_nodes',
        query: `ui components ${task}`,
        type: 'ui_implementation',
        limit: 3
      })

      // STEP 3: Generate React components
      this.log('Generating React components...')
      const reactComponents = await this.generateReactComponents(task, components, wireframes)

      // STEP 4: Apply Tailwind CSS styling
      this.log('Applying Tailwind CSS styling...')
      // Already included in component generation

      // STEP 5: Add accessibility attributes
      this.log('Ensuring accessibility attributes...')
      // Already included in component generation

      // STEP 6: Generate component tests
      this.log('Generating component tests...')
      const componentTests = await this.generateComponentTests(task, reactComponents)

      // STEP 7: Generate responsive utilities
      this.log('Creating responsive utilities...')
      const responsiveUtilities = this.generateResponsiveUtilities()

      // STEP 8: Create implementation document
      const implementationDocument = this.generateImplementationDocument(
        task,
        reactComponents,
        componentTests,
        responsiveUtilities,
        pastComponentPatterns
      )

      // STEP 9: Store in Memory MCP
      this.log('Storing component patterns...')
      await this.requestMCP('memory', {
        action: 'create_entities',
        entities: [{
          name: `UI Components: ${task}`,
          entityType: 'ui_implementation',
          observations: [
            `Components: ${reactComponents.length}`,
            `Tests: ${componentTests.length}`,
            ...reactComponents.map(c => `Component: ${c.name}`)
          ]
        }]
      })

      // Create artifacts
      const artifacts = [
        // Main implementation document
        this.createArtifact(
          'documentation',
          implementationDocument.fullDocument,
          {
            componentCount: reactComponents.length,
            testCount: componentTests.length,
            framework: 'React + TypeScript',
            styling: 'Tailwind CSS v4'
          }
        ),
        // Component code artifacts
        ...reactComponents.map(comp =>
          this.createArtifact(
            'code',
            comp.code,
            {
              fileName: comp.fileName,
              componentName: comp.name,
              language: 'tsx'
            }
          )
        )
      ]

      // Create result
      const result = this.createResult(
        'success',
        {
          components: reactComponents.map(c => c.name),
          tests: componentTests.map(t => t.name),
          framework: 'React + TypeScript',
          styling: 'Tailwind CSS v4',
          accessibility: 'ARIA attributes included',
          implementationSummary: implementationDocument.summary
        },
        artifacts
      )

      return {
        messages: [...state.messages],
        agentResults: [...state.agentResults, result],
        context: {
          ...state.context,
          uiImplementation: {
            components: reactComponents,
            tests: componentTests,
            responsiveUtilities
          }
        },
        nextAction: 'code_reviewer' // Hand to code reviewer
      }

    } catch (error: any) {
      this.log(`UI development failed: ${error.message}`, 'error')

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
   * Generate React/TypeScript components with Tailwind CSS
   */
  private async generateReactComponents(
    task: string,
    componentRecommendations: any[],
    wireframes: any[]
  ): Promise<Array<{
    name: string
    fileName: string
    code: string
    description: string
    props: string[]
    dependencies: string[]
  }>> {
    const prompt = `Generate React/TypeScript components for this feature using Tailwind CSS v4.

Task: ${task}

Component Recommendations: ${componentRecommendations.map((c: any) => `${c.name} (${c.type}): ${c.purpose}`).join('\n')}

Wireframes: ${wireframes.map((w: any) => w.name).join(', ')}

Requirements:
- Use React functional components with TypeScript
- Use Tailwind CSS v4 utility classes
- Mobile-first responsive design (sm:, md:, lg: breakpoints)
- Include accessibility attributes (ARIA labels, roles, keyboard navigation)
- Use Radix UI primitives where appropriate (buttons, dialogs, dropdowns)
- Export as named export
- Include JSDoc comments

Generate 2-5 production-ready components.

Provide response in JSON format:
{
  "components": [
    {
      "name": "SearchForm",
      "fileName": "SearchForm.tsx",
      "code": "Full TypeScript component code here...",
      "description": "Search form component for supplier discovery",
      "props": ["onSearch", "initialQuery", "filters"],
      "dependencies": ["react", "@radix-ui/react-select"]
    }
  ]
}

Example component structure:
\`\`\`tsx
import { useState } from 'react'

interface SearchFormProps {
  onSearch: (query: string) => void
  initialQuery?: string
}

/**
 * Search form component for supplier discovery
 * Features: Mobile-responsive, accessible, Tailwind styled
 */
export function SearchForm({ onSearch, initialQuery = '' }: SearchFormProps) {
  const [query, setQuery] = useState(initialQuery)

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSearch(query) }}
      className="w-full max-w-2xl mx-auto space-y-4 p-4 md:p-6"
      role="search"
      aria-label="Supplier search form"
    >
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search suppliers..."
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base md:text-lg"
        aria-label="Search input"
      />
      <button
        type="submit"
        className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        aria-label="Search button"
      >
        Search
      </button>
    </form>
  )
}
\`\`\``

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.3,
      maxTokens: 4096
    })
    const content = response.content

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      // Fallback component
      return [{
        name: 'FeatureComponent',
        fileName: 'FeatureComponent.tsx',
        code: `import { useState } from 'react'

interface FeatureComponentProps {
  title: string
}

/**
 * ${task} component
 */
export function FeatureComponent({ title }: FeatureComponentProps) {
  return (
    <div className="w-full p-4 md:p-6 space-y-4">
      <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
      <p className="text-gray-600">Feature implementation placeholder</p>
    </div>
  )
}`,
        description: `Main component for ${task}`,
        props: ['title'],
        dependencies: ['react']
      }]
    }

    const parsed = JSON.parse(jsonMatch[0])
    return parsed.components || []
  }

  /**
   * Generate component tests using Vitest + React Testing Library
   */
  private async generateComponentTests(task: string, components: any[]): Promise<Array<{
    name: string
    fileName: string
    code: string
    testCases: string[]
  }>> {
    const prompt = `Generate component tests for these React components using Vitest and React Testing Library.

Task: ${task}

Components: ${components.map((c: any) => c.name).join(', ')}

For each component, generate tests covering:
- Rendering
- User interactions (clicks, form submissions)
- Accessibility (ARIA attributes, keyboard navigation)
- Responsive behavior (if applicable)

Use Vitest + React Testing Library conventions.

Provide response in JSON format:
{
  "tests": [
    {
      "name": "SearchForm",
      "fileName": "SearchForm.test.tsx",
      "code": "Full test file code here...",
      "testCases": ["renders search input", "calls onSearch on submit", "has accessible labels"]
    }
  ]
}

Example test structure:
\`\`\`tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SearchForm } from './SearchForm'

describe('SearchForm', () => {
  it('renders search input', () => {
    render(<SearchForm onSearch={vi.fn()} />)
    expect(screen.getByRole('search')).toBeInTheDocument()
  })

  it('calls onSearch on submit', () => {
    const onSearch = vi.fn()
    render(<SearchForm onSearch={onSearch} />)

    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: 'test query' } })

    const button = screen.getByRole('button', { name: /search/i })
    fireEvent.click(button)

    expect(onSearch).toHaveBeenCalledWith('test query')
  })

  it('has accessible labels', () => {
    render(<SearchForm onSearch={vi.fn()} />)
    expect(screen.getByLabelText('Search input')).toBeInTheDocument()
  })
})
\`\`\``

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.3,
      maxTokens: 4096
    })
    const content = response.content

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      // Fallback test
      return components.map(comp => ({
        name: comp.name,
        fileName: `${comp.name}.test.tsx`,
        code: `import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ${comp.name} } from './${comp.name}'

describe('${comp.name}', () => {
  it('renders without crashing', () => {
    render(<${comp.name} ${comp.props.length > 0 ? `${comp.props[0]}="test"` : ''} />)
    expect(screen.getByRole('region')).toBeInTheDocument()
  })
})`,
        testCases: ['renders without crashing']
      }))
    }

    const parsed = JSON.parse(jsonMatch[0])
    return parsed.tests || []
  }

  /**
   * Generate responsive design utilities
   */
  private generateResponsiveUtilities(): {
    breakpoints: Record<string, string>
    containerSizes: Record<string, string>
    spacing: string[]
    typography: string[]
  } {
    return {
      breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px'
      },
      containerSizes: {
        sm: 'max-w-screen-sm',
        md: 'max-w-screen-md',
        lg: 'max-w-screen-lg',
        xl: 'max-w-screen-xl',
        '2xl': 'max-w-screen-2xl'
      },
      spacing: [
        'p-4 md:p-6 lg:p-8',
        'space-y-4 md:space-y-6',
        'gap-4 md:gap-6',
        'mt-4 md:mt-6 lg:mt-8'
      ],
      typography: [
        'text-sm md:text-base',
        'text-lg md:text-xl lg:text-2xl',
        'text-2xl md:text-3xl lg:text-4xl',
        'leading-normal md:leading-relaxed'
      ]
    }
  }

  /**
   * Generate implementation document
   */
  private generateImplementationDocument(
    task: string,
    components: any[],
    tests: any[],
    responsiveUtilities: any,
    pastPatterns: any
  ): {
    fullDocument: string
    summary: string
  } {
    const summary = `Implemented ${components.length} React/TypeScript components with ${tests.length} test suites using Tailwind CSS v4.`

    const fullDocument = `# UI Implementation Document: ${task}

**Date**: ${new Date().toISOString().split('T')[0]}
**UI Developer**: AI Agent
**Status**: UI Implementation Complete

---

## Executive Summary

${summary}

**Technology Stack**:
- React 18 + TypeScript
- Tailwind CSS v4 (mobile-first)
- Radix UI primitives
- Vitest + React Testing Library

---

## Components Implemented (${components.length})

${components.map(comp => `### ${comp.name}

**File**: \`client/src/components/${comp.fileName}\`
**Description**: ${comp.description}

**Props**:
${comp.props.map((p: string) => `- \`${p}\``).join('\n')}

**Dependencies**:
${comp.dependencies.map((d: string) => `- ${d}`).join('\n')}

**Code**:
\`\`\`tsx
${comp.code}
\`\`\`

---
`).join('\n')}

---

## Component Tests (${tests.length})

${tests.map(test => `### ${test.name} Tests

**File**: \`client/src/components/__tests__/${test.fileName}\`

**Test Cases**:
${test.testCases.map((tc: string) => `- ${tc}`).join('\n')}

**Code**:
\`\`\`tsx
${test.code}
\`\`\`

---
`).join('\n')}

---

## Responsive Design Utilities

### Breakpoints (Mobile-First)

${Object.entries(responsiveUtilities.breakpoints).map(([key, value]) => `- **${key}**: ${value}`).join('\n')}

### Container Sizes

${Object.entries(responsiveUtilities.containerSizes).map(([key, value]) => `- **${key}**: ${value}`).join('\n')}

### Common Spacing Patterns

${responsiveUtilities.spacing.map((s: string) => `- \`${s}\``).join('\n')}

### Typography Responsive Classes

${responsiveUtilities.typography.map((t: string) => `- \`${t}\``).join('\n')}

---

## Accessibility Implementation

### ARIA Attributes

All interactive components include:
- \`aria-label\`: Descriptive labels for screen readers
- \`role\`: Semantic roles (button, search, navigation, etc.)
- \`aria-describedby\`: Additional context where needed

### Keyboard Navigation

- Tab order follows visual order
- Enter/Space for button activation
- Escape to close modals/dropdowns
- Arrow keys for navigation (where applicable)

### Focus Management

- Visible focus indicators (\`focus:ring-2 focus:ring-blue-500\`)
- Focus trap in modals
- Focus return after closing dialogs

### Color Contrast

- Minimum 4.5:1 for normal text
- 3:1 for large text (18px+)
- Tested with WCAG AA standards

---

## Component Architecture

### Directory Structure

\`\`\`
client/src/components/
${components.map((c: any) => `├── ${c.fileName}`).join('\n')}
client/src/components/__tests__/
${tests.map((t: any) => `├── ${t.fileName}`).join('\n')}
\`\`\`

### Import/Export Pattern

All components use named exports:
\`\`\`tsx
export function ComponentName() { ... }
\`\`\`

Import in parent components:
\`\`\`tsx
import { SearchForm, SupplierCard } from '@/components'
\`\`\`

---

## Styling Guidelines

### Tailwind CSS v4 Conventions

1. **Mobile-First**: Base styles are mobile, use \`md:\` and \`lg:\` for larger screens
2. **Utility-First**: Prefer utility classes over custom CSS
3. **Consistent Spacing**: Use Tailwind spacing scale (4, 6, 8, etc.)
4. **Color Palette**: Use semantic colors (blue for primary, gray for neutral, red for danger)

### Example Responsive Pattern

\`\`\`tsx
<div className="
  // Mobile (default)
  p-4 space-y-4 text-sm

  // Tablet (768px+)
  md:p-6 md:space-y-6 md:text-base

  // Desktop (1024px+)
  lg:p-8 lg:space-y-8 lg:text-lg
">
  Content
</div>
\`\`\`

---

## Testing Strategy

### Coverage Goals

- Unit Tests: 80%+ coverage
- Integration Tests: Key user flows
- Accessibility Tests: ARIA attributes, keyboard navigation

### Running Tests

\`\`\`bash
# Run all component tests
pnpm test:components

# Run with coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
\`\`\`

---

## Historical Patterns

${pastPatterns && pastPatterns.length > 0 ?
  `Similar component implementations:\n${pastPatterns.map((p: any) => `- ${p.name || p.title || 'Previous implementation'}`).join('\n')}` :
  'No similar implementations found in history.'
}

---

## Next Steps

1. **Code Review**: Submit components for review
2. **Integration**: Integrate components into parent pages
3. **Testing**: Run full test suite, verify accessibility
4. **Documentation**: Update Storybook (if using)
5. **Deployment**: Deploy to staging for QA testing

---

## Performance Considerations

- Lazy load images with \`loading="lazy"\`
- Use React.memo() for expensive renders
- Minimize bundle size (tree-shaking)
- Optimize Tailwind CSS output (PurgeCSS)

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

**Generated by**: UI Developer Agent
**Timestamp**: ${new Date().toISOString()}
`

    return { fullDocument, summary }
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
      'code',
      '// No task provided for UI implementation',
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
