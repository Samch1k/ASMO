import { BaseAgent } from "../base-agent"
import { AgentState } from "../types"
import { getYamlConfigLoader, type AgentConfig } from "../../orchestration/config/yaml-config-loader"
import type { ModelTier } from "../../llm"
import {
  createSingleChoiceQuestion,
  createMultipleChoiceQuestion,
  createBooleanQuestion,
  InputRequiredError,
  type QuestionGroup,
  type AnswerSet
} from "../../orchestration/user-input-types"

/**
 * Architect Agent - Responsible for system design and architecture decisions
 *
 * Configuration loaded from: agents.yaml
 *
 * Capabilities:
 * - System design and architecture planning
 * - Technology evaluation and selection
 * - Creating Architecture Decision Records (ADRs)
 * - Database schema design
 * - API contract definition
 *
 * User Input:
 * - Asks structured questions when creating new projects/services
 * - Collects tech stack, feature, and scope preferences
 * - Uses answers to generate tailored architecture
 *
 * MCP Integrations:
 * - Memory MCP (P0): Store and retrieve architecture decisions
 * - Supabase MCP (P0): Analyze current database schema
 * - Context7 MCP (P1): Research best practices and patterns
 * - GitHub MCP (P2): Create ADR issues
 */
export class ArchitectAgent extends BaseAgent {
  private _agentConfig: AgentConfig | undefined
  private _modelTier: ModelTier

  constructor() {
    // Load config from YAML
    const configLoader = getYamlConfigLoader()
    const config = configLoader.getAgent('architect')

    // Extract skills from config or use defaults
    const skills = config?.skills.map(s => s.id) || [
      'system_design',
      'architecture_decisions',
      'adr_creation',
      'technology_evaluation',
      'data_modeling',
      'scalability_planning'
    ]

    super('architect', skills)

    this._agentConfig = config

    // Get model from config or default to sonnet
    this._modelTier = (config?.model_preference || 'sonnet') as ModelTier
  }

  /**
   * Get agent configuration from YAML
   */
  getConfig(): AgentConfig | undefined {
    return this._agentConfig
  }

  /**
   * Execute architect workflow
   *
   * Process:
   * 1. Check Memory MCP for past architectural decisions
   * 2. Detect if user input is needed
   * 3. If needed → ask structured questions via askUser()
   * 4. Analyze current system state via MCP
   * 5. Generate architectural decision using LLM + user answers
   * 6. Create ADR (Architecture Decision Record)
   * 7. Store ADR in Memory MCP
   * 8. Handoff to Developer for implementation
   */
  async execute(state: AgentState): Promise<Partial<AgentState>> {
    this.log('🏗️  Analyzing architecture requirements...')

    try {
      // STEP 1: Check Memory MCP for past decisions
      this.log('Checking past architectural decisions...')
      const pastDecisions = await this.requestMCP('memory', {
        action: 'search_nodes',
        query: state.task,
        type: 'architecture_decision'
      })

      // STEP 2: Check if user already provided answers (from previous phase)
      let userAnswers: AnswerSet | null = state.context?.userAnswers ?? null

      // STEP 3: If no answers yet AND task needs user input → ask
      if (!userAnswers && this.needsUserInput(state.task)) {
        this.log('📋 Task requires user input, preparing questions...')

        const questionGroups = this.buildQuestionGroups(state.task)

        try {
          const response = await this.askUser(
            `Architecture design for: "${state.task}"\nNeed to clarify requirements before generating architecture.`,
            questionGroups
          )

          userAnswers = response.answers
          this.log(`✅ Received ${userAnswers.answers.length} answers from user`)
        } catch (error) {
          if (error instanceof InputRequiredError) {
            // Mandatory gate: input was required but unavailable (no TTY, timeout)
            // Do NOT fall back to defaults — re-throw to stop the workflow
            this.log('❌ User input is required but was not provided. Workflow cannot continue.', 'error')
            throw error
          }
          // User deliberately cancelled (Ctrl+C) — proceed with defaults
          this.log('User input cancelled, proceeding with intelligent defaults', 'warn')
          userAnswers = null
        }
      }

      // STEP 4: Analyze current schema via Supabase MCP
      this.log('Analyzing current database schema...')
      const currentSchema = await this.requestMCP('supabase', {
        action: 'list_tables',
        project_id: process.env.SUPABASE_PROJECT_ID
      })

      // STEP 5: Research best practices via Context7 MCP
      this.log('Researching architecture patterns and best practices...')
      const bestPractices = await this.requestMCP('context7', {
        action: 'get-library-docs',
        libraryId: '/anthropics/prompt-eng-interactive-tutorial',
        topic: `${state.task} architecture patterns`,
        tokens: 3000
      })

      // STEP 6: Generate architectural decision using LLM
      this.log('Generating architectural decision...')
      const decision = await this.generateDecision(state, {
        pastDecisions,
        currentSchema,
        bestPractices,
        userAnswers
      })

      // STEP 7: Create ADR artifact
      const adr = this.createArtifact(
        'adr',
        this.formatADR(state.task, decision),
        {
          documentType: 'adr',
          taskType: state.taskType,
          timestamp: new Date().toISOString(),
          hasUserInput: !!userAnswers
        }
      )

      // STEP 8: Generate Technical Specification
      this.log('Generating Technical Specification...')
      const techSpec = await this.generateTechnicalSpecification(state, decision, {
        userAnswers,
        pastDecisions,
        currentSchema
      })

      const techSpecArtifact = this.createArtifact(
        'documentation',
        techSpec,
        {
          documentType: 'technical_specification',
          timestamp: new Date().toISOString(),
          hasUserInput: !!userAnswers
        }
      )

      // STEP 9: Store in Memory MCP
      this.log('Storing ADR in Memory MCP...')
      await this.requestMCP('memory', {
        action: 'create_entities',
        entities: [{
          name: `ADR: ${state.task}`,
          entityType: 'architecture_decision',
          observations: [adr.content]
        }]
      })

      // STEP 10: Create result and determine handoff
      const result = this.createResult('needs_handoff', decision, [adr, techSpecArtifact])
      result.handoffTo = 'developer'
      result.confidence = userAnswers ? 0.95 : 0.75 // Higher confidence with user input

      this.log('✅ Architecture analysis complete, handing off to Developer')

      return {
        agentResults: [...state.agentResults, result],
        context: {
          ...state.context,
          architectureDecision: decision,
          technicalSpecification: techSpec,
          userAnswers,
          adr
        },
        nextAction: 'developer'
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
   * Detect if task requires user input
   *
   * Returns true for creation/new project tasks that need clarification.
   * Returns false for tasks with enough context (bug fixes, refactoring, etc.)
   */
  private needsUserInput(task: string): boolean {
    const taskLower = task.toLowerCase()

    // Creation tasks need user input
    const creationPatterns = [
      /создать|создай|сделать|сделай|разработать|разработай/,
      /построить|построй|реализовать|реализуй/,
      /\bcreate\b|\bbuild\b|\bdevelop\b|\bimplement\b/,
      /новый сервис|новое приложение|новый проект/,
      /\bnew service\b|\bnew app\b|\bnew project\b/
    ]

    const isCreation = creationPatterns.some(p => p.test(taskLower))

    // Bug fixes, refactoring, optimization don't need user input
    const noInputPatterns = [
      /исправить|починить|fix|repair|debug/,
      /рефакторинг|refactor|cleanup/,
      /оптимизировать|optimize|improve performance/,
      /обновить|update|upgrade/
    ]

    const isNoInput = noInputPatterns.some(p => p.test(taskLower))

    return isCreation && !isNoInput
  }

  /**
   * Build structured question groups based on task
   */
  private buildQuestionGroups(_task: string): QuestionGroup[] {
    const groups: QuestionGroup[] = []

    // Group 1: Application Scale
    groups.push({
      id: 'scale',
      title: 'Application Scale',
      description: 'Help us understand the scope of your project',
      questions: [
        createSingleChoiceQuestion(
          'app-type',
          'What type of application is this?',
          [
            { id: 'fullstack', label: 'Full-Stack (Frontend + Backend + DB)', recommended: true },
            { id: 'spa', label: 'Frontend SPA Only (localStorage/mock data)' },
            { id: 'api', label: 'Backend API Only' },
            { id: 'monolith', label: 'Monolith (all-in-one)' }
          ],
          'Determines the overall architecture pattern'
        ),
        createSingleChoiceQuestion(
          'scope',
          'What is the project scope?',
          [
            { id: 'mvp', label: 'MVP / Prototype', recommended: true, description: 'Core features, fast delivery' },
            { id: 'production', label: 'Production-Ready', description: 'Full features, proper architecture' },
            { id: 'enterprise', label: 'Enterprise', description: 'Scalable, HA, full observability' }
          ]
        )
      ]
    })

    // Group 2: Technology Stack
    groups.push({
      id: 'tech-stack',
      title: 'Technology Stack',
      description: 'Choose your preferred technologies',
      questions: [
        createSingleChoiceQuestion(
          'frontend',
          'Frontend framework?',
          [
            { id: 'react', label: 'React', recommended: true },
            { id: 'vue', label: 'Vue.js' },
            { id: 'angular', label: 'Angular' },
            { id: 'svelte', label: 'Svelte' },
            { id: 'none', label: 'No frontend (API only)' }
          ]
        ),
        createSingleChoiceQuestion(
          'backend',
          'Backend framework?',
          [
            { id: 'express', label: 'Express.js', recommended: true },
            { id: 'fastify', label: 'Fastify' },
            { id: 'nestjs', label: 'NestJS' },
            { id: 'none', label: 'No backend (frontend only)' }
          ]
        ),
        createSingleChoiceQuestion(
          'database',
          'Database?',
          [
            { id: 'postgres', label: 'PostgreSQL', recommended: true },
            { id: 'sqlite', label: 'SQLite (simple, file-based)' },
            { id: 'mysql', label: 'MySQL' },
            { id: 'mongodb', label: 'MongoDB' },
            { id: 'json', label: 'JSON file (demo/prototype)' },
            { id: 'none', label: 'No database' }
          ]
        ),
        createBooleanQuestion(
          'typescript',
          'Use TypeScript?',
          true,
          'Recommended for better type safety and developer experience'
        )
      ]
    })

    // Group 3: Features
    groups.push({
      id: 'features',
      title: 'Key Features',
      description: 'Select features to include',
      questions: [
        createMultipleChoiceQuestion(
          'features',
          'Which features do you need?',
          [
            { id: 'auth', label: 'Authentication', description: 'User login/registration' },
            { id: 'admin', label: 'Admin Panel', description: 'Administrative interface' },
            { id: 'api', label: 'REST API', description: 'RESTful endpoints' },
            { id: 'realtime', label: 'Real-time Updates', description: 'WebSocket/SSE' },
            { id: 'notifications', label: 'Notifications', description: 'Email/push notifications' }
          ],
          'Select all that apply. You can add more later.'
        ),
        createSingleChoiceQuestion(
          'auth-type',
          'Authentication method?',
          [
            { id: 'simple', label: 'Simple (name/email, no password)', recommended: true, description: 'Good for demos and prototypes' },
            { id: 'jwt', label: 'JWT (email + password)' },
            { id: 'oauth', label: 'OAuth (Google/GitHub)' },
            { id: 'none', label: 'No authentication' }
          ]
        )
      ]
    })

    // Group 4: Language preference
    groups.push({
      id: 'preferences',
      title: 'Preferences',
      questions: [
        createSingleChoiceQuestion(
          'ui-language',
          'Interface language?',
          [
            { id: 'en', label: 'English', recommended: true },
            { id: 'ru', label: 'Russian' },
            { id: 'both', label: 'Both (i18n)' }
          ]
        )
      ]
    })

    return groups
  }

  /**
   * Generate architectural decision using LLM
   * Uses user answers (if available) to tailor the architecture
   */
  private async generateDecision(
    state: AgentState,
    context: {
      pastDecisions: any
      currentSchema: any
      bestPractices: any
      userAnswers: AnswerSet | null
    }
  ): Promise<string> {
    // Build dynamic system prompt based on context
    const systemPrompt = this.buildSystemPrompt(state, context)

    const response = await this.callLLM(state.task, {
      model: this._modelTier,
      temperature: 0.1, // Low temperature for consistent architectural decisions
      maxTokens: 4096,
      systemPrompt
    })

    return response.content
  }

  /**
   * Build dynamic system prompt based on task and user answers
   */
  private buildSystemPrompt(
    state: AgentState,
    context: {
      pastDecisions: any
      currentSchema: any
      bestPractices: any
      userAnswers: AnswerSet | null
    }
  ): string {
    const { userAnswers } = context

    // Extract user preferences (or use defaults)
    const appType = this.getAnswerValue(userAnswers, 'app-type', 'fullstack')
    const scope = this.getAnswerValue(userAnswers, 'scope', 'mvp')
    const frontend = this.getAnswerValue(userAnswers, 'frontend', 'react')
    const backend = this.getAnswerValue(userAnswers, 'backend', 'express')
    const database = this.getAnswerValue(userAnswers, 'database', 'postgres')
    const typescript = this.getAnswerValue(userAnswers, 'typescript', true)
    const features = this.getAnswerValue(userAnswers, 'features', ['api'])
    const authType = this.getAnswerValue(userAnswers, 'auth-type', 'simple')
    const uiLanguage = this.getAnswerValue(userAnswers, 'ui-language', 'en')

    // Build tech stack description
    const techStack = this.describeTechStack(frontend, backend, database, typescript)
    const featureList = Array.isArray(features) ? features.join(', ') : features
    const scopeDesc = scope === 'mvp' ? 'MVP / Prototype (fast delivery, core features)'
      : scope === 'production' ? 'Production-Ready (full features, proper architecture)'
      : 'Enterprise (scalable, HA, full observability)'

    return `You are the System Architect for a software project.

PROJECT REQUIREMENTS:
- Task: ${state.task}
- Application Type: ${appType}
- Scope: ${scopeDesc}
- Language: ${uiLanguage === 'en' ? 'English' : uiLanguage === 'ru' ? 'Russian' : 'Both (i18n)'}

TECHNOLOGY STACK (${userAnswers ? 'chosen by user' : 'defaults'}):
${techStack}

FEATURES:
- Selected: ${featureList || 'none specified'}
- Authentication: ${authType}

PAST DECISIONS:
${JSON.stringify(context.pastDecisions, null, 2)}

CURRENT SCHEMA:
${JSON.stringify(context.currentSchema, null, 2)}

BEST PRACTICES:
${JSON.stringify(context.bestPractices, null, 2)}

YOUR TASK:
Generate a detailed architecture design for: ${state.task}

PROVIDE:
1. Architecture Overview
   - High-level architecture diagram (text-based)
   - Key components and their interactions
   - Data flow description

2. Project Structure
   - Directory structure
   - Key files and their purposes
   - Module organization

3. Database Schema
   - Tables/collections needed
   - Key relationships
   - Indexes and constraints

4. API Design
   - Endpoints list with methods
   - Request/response formats
   - Error handling strategy

5. Implementation Plan
   - Step-by-step approach (ordered)
   - Estimated complexity per step
   - Dependencies between steps

6. Risks & Considerations
   - Technical risks
   - Mitigation strategies
   - Performance considerations

Format as clear, actionable documentation that a Developer agent can use to implement.
Do NOT ask questions — use the provided requirements to make decisions.`
  }

  /**
   * Build tech stack description from user choices
   */
  private describeTechStack(
    frontend: string,
    backend: string,
    database: string,
    typescript: boolean
  ): string {
    const lang = typescript ? 'TypeScript' : 'JavaScript'
    const lines: string[] = []

    if (frontend !== 'none') {
      const frameworkMap: Record<string, string> = {
        'react': `React 19 with ${lang}`,
        'vue': `Vue.js 3 with ${lang}`,
        'angular': `Angular 18 with ${lang}`,
        'svelte': `SvelteKit with ${lang}`
      }
      lines.push(`Frontend: ${frameworkMap[frontend] || frontend}`)
    }

    if (backend !== 'none') {
      const backendMap: Record<string, string> = {
        'express': `Express.js with ${lang}`,
        'fastify': `Fastify with ${lang}`,
        'nestjs': `NestJS with ${lang}`
      }
      lines.push(`Backend: ${backendMap[backend] || backend}`)
    }

    const dbMap: Record<string, string> = {
      'postgres': 'PostgreSQL',
      'sqlite': 'SQLite',
      'mysql': 'MySQL',
      'mongodb': 'MongoDB',
      'json': 'JSON file storage',
      'none': 'No database'
    }
    lines.push(`Database: ${dbMap[database] || database}`)

    return lines.join('\n')
  }

  /**
   * Get answer value with fallback default
   */
  private getAnswerValue(answers: AnswerSet | null, questionId: string, defaultValue: any): any {
    if (!answers) return defaultValue
    return this.getAnswer(answers, questionId) ?? defaultValue
  }

  /**
   * Generate Technical Specification document
   * Builds on the ADR with detailed implementation guidance
   */
  private async generateTechnicalSpecification(
    state: AgentState,
    architectureDecision: string,
    context: {
      userAnswers: AnswerSet | null
      pastDecisions: any
      currentSchema: any
    }
  ): Promise<string> {
    const { userAnswers } = context
    const appType = this.getAnswerValue(userAnswers, 'app-type', 'fullstack')
    const scope = this.getAnswerValue(userAnswers, 'scope', 'mvp')
    const frontend = this.getAnswerValue(userAnswers, 'frontend', 'react')
    const backend = this.getAnswerValue(userAnswers, 'backend', 'express')
    const database = this.getAnswerValue(userAnswers, 'database', 'postgres')

    const prompt = `Generate a detailed Technical Specification document based on this architecture decision.

TASK: ${state.task}

ARCHITECTURE DECISION (ADR):
${architectureDecision}

USER PREFERENCES:
- App Type: ${appType}
- Scope: ${scope}
- Frontend: ${frontend}
- Backend: ${backend}
- Database: ${database}

Create a Technical Specification with these sections:
1. Tech Stack Justification — why each technology was chosen
2. System Components — detailed component descriptions with responsibilities
3. Data Flow — how data moves through the system (request lifecycle)
4. Deployment Model — infrastructure, environments, CI/CD
5. Security Architecture — authentication, authorization, data protection
6. Performance Targets — response times, throughput, resource limits
7. External Integrations — third-party services and APIs
8. Development Workflow — branching strategy, PR process, code review
9. Monitoring & Observability — logging, metrics, alerting
10. Migration & Rollback Strategy — deployment safety

Format as a clean markdown document with clear headings.`

    const response = await this.callLLM(prompt, {
      model: this._modelTier,
      temperature: 0.1,
      maxTokens: 6144
    })

    const timestamp = new Date().toISOString().split('T')[0]

    return `# Technical Specification: ${state.task}

**Date**: ${timestamp}
**Architect**: Architect Agent
**Status**: Draft
**Scope**: ${scope}

---

${response.content}

---

**Generated by**: Architect Agent (ASMO Multi-Agent System)
**Timestamp**: ${new Date().toISOString()}
`
  }

  /**
   * Format ADR (Architecture Decision Record)
   */
  private formatADR(title: string, decision: string): string {
    const timestamp = new Date().toISOString().split('T')[0]

    return `# ADR: ${title}

**Date**: ${timestamp}
**Status**: Proposed
**Deciders**: Architect Agent
**Context**: Architecture Decision

---

## Decision

${decision}

---

**Created by**: Architect Agent (ASMO Multi-Agent System)
**Timestamp**: ${new Date().toISOString()}
`
  }
}
