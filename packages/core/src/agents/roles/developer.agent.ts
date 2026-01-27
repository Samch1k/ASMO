import { BaseAgent } from "../base-agent"
import { AgentState } from "../types"
import { ChatAnthropic } from "@langchain/anthropic"

/**
 * Developer Agent - Responsible for feature implementation and code generation
 * 
 * Capabilities:
 * - Feature implementation (TypeScript)
 * - Code writing and refactoring
 * - Unit test creation
 * - Integration with existing codebase
 * 
 * MCP Integrations:
 * - Filesystem MCP (P0): Read existing code, write new code
 * - Context7 MCP (P0): Look up API documentation
 * - GitHub MCP (P1): Create PRs, manage branches
 * - Memory MCP (P2): Recall project patterns
 */
export class DeveloperAgent extends BaseAgent {
  private llm: ChatAnthropic

  constructor() {
    super('developer', [
      'feature_implementation',
      'code_writing',
      'unit_testing',
      'tdd_workflow', // Superpowers TDD workflow integration
      'refactoring',
      'integration',
      'typescript_expert'
    ])
    
    // Initialize Claude LLM with slightly higher temperature for code variety
    this.llm = new ChatAnthropic({
      modelName: "claude-sonnet-4-20250514",
      temperature: 0.2,
      maxTokens: 8192 // More tokens for code generation
    })
  }

  /**
   * Execute developer workflow
   * 
   * Process:
   * 1. Get architecture context from previous agent (Architect)
   * 2. Read relevant existing files via Filesystem MCP
   * 3. Look up API documentation via Context7 MCP
   * 4. Generate implementation code using LLM
   * 5. Generate unit tests
   * 6. Create code artifacts
   * 7. Determine if handoff to Tester is needed
   */
  async execute(state: AgentState): Promise<Partial<AgentState>> {
    this.log('💻 Starting feature implementation...')

    try {
      // STEP 1: Get architecture context
      const architectureDecision = state.context.architectureDecision
      if (!architectureDecision) {
        this.log('No architecture decision found, proceeding with task directly...', 'warn')
      }

      // STEP 2: Identify and read relevant files
      this.log('Identifying relevant files...')
      const relevantFiles = this.identifyRelevantFiles(state.task)
      
      this.log(`Reading ${relevantFiles.length} files...`)
      const filesContent = await this.requestMCP('filesystem', {
        action: 'read_multiple_files',
        paths: relevantFiles
      })

      // STEP 3: Look up API documentation
      this.log('Looking up API documentation...')
      const apiDocs = await this.requestMCP('context7', {
        action: 'get-library-docs',
        context7CompatibleLibraryID: this.selectLibraryForTask(state.task),
        topic: state.task,
        tokens: 4000
      })

      // STEP 4: Generate implementation using LLM
      this.log('Generating implementation code...')
      const implementation = await this.generateImplementation(state, {
        architectureDecision,
        filesContent,
        apiDocs
      })

      // STEP 5: Generate unit tests
      this.log('Generating unit tests...')
      const tests = await this.generateTests(state, implementation)

      // STEP 6: Create artifacts
      const codeArtifact = this.createArtifact(
        'code',
        implementation,
        {
          language: 'typescript',
          filesAffected: relevantFiles
        }
      )

      const testArtifact = this.createArtifact(
        'test',
        tests,
        {
          testFramework: 'vitest',
          coverage: 'unit'
        }
      )

      // STEP 7: Determine handoff
      const needsTesting = state.taskType === 'feature' || state.taskType === 'bug_fix'
      
      const result = this.createResult(
        needsTesting ? 'needs_handoff' : 'success',
        {
          implementation,
          tests,
          filesModified: relevantFiles.length
        },
        [codeArtifact, testArtifact]
      )

      if (needsTesting) {
        result.handoffTo = 'tester'
        this.log('✅ Implementation complete, handing off to Tester')
      } else {
        this.log('✅ Implementation complete')
      }

      return {
        agentResults: [...state.agentResults, result],
        context: {
          ...state.context,
          implementation,
          tests,
          codeArtifact,
          testArtifact
        },
        nextAction: needsTesting ? 'tester' : 'END'
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
   * Identify relevant files based on task description
   */
  private identifyRelevantFiles(task: string): string[] {
    const taskLower = task.toLowerCase()
    const files: string[] = []

    // RFQ-related
    if (taskLower.includes('rfq')) {
      files.push(
        'server/routes/rfqs.ts',
        'server/storage/database.ts',
        'shared/schema/rfq.ts',
        'client/src/pages/requests/CreateRequest.tsx'
      )
    }

    // User/Auth related
    if (taskLower.includes('user') || taskLower.includes('auth')) {
      files.push(
        'server/routes/auth.ts',
        'server/auth.ts',
        'shared/schema/user.ts'
      )
    }

    // Product related
    if (taskLower.includes('product') || taskLower.includes('catalog')) {
      files.push(
        'server/routes/products.ts',
        'shared/schema/product.ts',
        'client/src/pages/products/ProductList.tsx'
      )
    }

    // Message/Chat related
    if (taskLower.includes('message') || taskLower.includes('chat')) {
      files.push(
        'server/routes/messages.ts',
        'shared/schema/message.ts',
        'client/src/components/Chat/OptimizedChatInterface.tsx'
      )
    }

    // Default: include main schema and database files
    if (files.length === 0) {
      files.push(
        'shared/schema/index.ts',
        'server/storage/database.ts'
      )
    }

    return files
  }

  /**
   * Select appropriate library for Context7 lookup
   */
  private selectLibraryForTask(task: string): string {
    const taskLower = task.toLowerCase()

    if (taskLower.includes('react') || taskLower.includes('component')) {
      return '/facebook/react'
    }
    if (taskLower.includes('drizzle') || taskLower.includes('database')) {
      return '/drizzle-team/drizzle-orm'
    }
    if (taskLower.includes('express') || taskLower.includes('api')) {
      return '/expressjs/express'
    }
    if (taskLower.includes('tailwind') || taskLower.includes('style')) {
      return '/tailwindlabs/tailwindcss'
    }

    // Default to React
    return '/facebook/react'
  }

  /**
   * Generate implementation code using Claude LLM
   */
  private async generateImplementation(
    state: AgentState,
    context: {
      architectureDecision: string
      filesContent: any
      apiDocs: any
    }
  ): Promise<string> {
    const systemPrompt = `You are an expert TypeScript Developer for your project.

TECHNOLOGY STACK:
- TypeScript (strict mode)
- React 19 for frontend
- Express.js for backend
- Drizzle ORM (NOT Prisma)
- PostgreSQL via Supabase

ARCHITECTURE DECISION:
${context.architectureDecision || 'No architecture decision provided'}

EXISTING CODE:
${JSON.stringify(context.filesContent, null, 2)}

API DOCUMENTATION:
${JSON.stringify(context.apiDocs, null, 2)}

TASK:
${state.task}

REQUIREMENTS:
1. Write production-quality TypeScript code
2. Follow your project conventions:
   - Use Drizzle ORM for database (NOT raw SQL)
   - Use Zod for validation
   - Proper error handling with try-catch
   - TypeScript strict mode compliance
3. Include inline comments explaining complex logic
4. Handle edge cases
5. Follow DRY principle
6. Export functions/components properly

OUTPUT FORMAT:
Provide ONLY the code implementation, properly formatted.
Include file paths as comments at the top of each file.
Example:
// File: server/routes/example.ts
import ...

export const handler = ...`

    const response = await this.llm.invoke([
      { role: "user", content: systemPrompt }
    ])

    return typeof response.content === 'string'
      ? response.content
      : JSON.stringify(response.content)
  }

  /**
   * Generate unit tests using Claude LLM
   */
  private async generateTests(
    state: AgentState,
    implementation: string
  ): Promise<string> {
    const systemPrompt = `You are writing unit tests for your project.

IMPLEMENTATION CODE:
${implementation}

TASK:
${state.task}

REQUIREMENTS:
1. Use Vitest framework
2. Test framework: @testing-library for React components
3. Cover:
   - Happy path
   - Edge cases
   - Error scenarios
4. Aim for 80%+ coverage
5. Use descriptive test names

OUTPUT FORMAT:
Provide ONLY the test code, properly formatted.
Include file path as comment.
Example:
// File: tests/example.test.ts
import { describe, it, expect } from 'vitest'
...`

    const response = await this.llm.invoke([
      { role: "user", content: systemPrompt }
    ])

    return typeof response.content === 'string'
      ? response.content
      : JSON.stringify(response.content)
  }
}


