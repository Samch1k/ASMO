/**
 * User Input Mechanism - Example Usage
 *
 * Demonstrates how agents can ask users for input during workflow execution.
 */

import {
  createSingleChoiceQuestion,
  createMultipleChoiceQuestion,
  createTextQuestion,
  createBooleanQuestion,
  type QuestionGroup
} from '@asmo/core'

/**
 * Example 1: Simple Single Choice Question
 *
 * Ask user to choose from predefined options
 */
export function example1_SimpleChoice(): QuestionGroup {
  return {
    id: 'database-selection',
    title: 'Database Selection',
    description: 'Choose the database for your application',
    questions: [
      createSingleChoiceQuestion(
        'database',
        'Which database would you like to use?',
        [
          {
            id: 'postgres',
            label: 'PostgreSQL',
            description: 'Powerful open-source relational database',
            recommended: true
          },
          {
            id: 'mysql',
            label: 'MySQL',
            description: 'Popular open-source database'
          },
          {
            id: 'sqlite',
            label: 'SQLite',
            description: 'Lightweight file-based database'
          },
          {
            id: 'mongodb',
            label: 'MongoDB',
            description: 'NoSQL document database'
          }
        ],
        'PostgreSQL is recommended for production applications with complex queries'
      )
    ]
  }
}

/**
 * Example 2: Multiple Questions in Group
 *
 * Ask several related questions grouped together
 */
export function example2_TechStackQuestions(): QuestionGroup {
  return {
    id: 'tech-stack',
    title: 'Technology Stack',
    description: 'Configure your application stack',
    questions: [
      createSingleChoiceQuestion(
        'framework',
        'Which web framework?',
        [
          { id: 'react', label: 'React', recommended: true },
          { id: 'vue', label: 'Vue.js' },
          { id: 'angular', label: 'Angular' },
          { id: 'svelte', label: 'Svelte' }
        ]
      ),
      createSingleChoiceQuestion(
        'api',
        'Which API framework?',
        [
          { id: 'express', label: 'Express.js', recommended: true },
          { id: 'fastify', label: 'Fastify' },
          { id: 'nest', label: 'NestJS' },
          { id: 'graphql', label: 'GraphQL' }
        ]
      ),
      createBooleanQuestion(
        'typescript',
        'Use TypeScript?',
        true,
        'TypeScript provides type safety and better developer experience'
      )
    ]
  }
}

/**
 * Example 3: Multiple Choice (Select Multiple)
 *
 * Allow user to select multiple options
 */
export function example3_FeatureSelection(): QuestionGroup {
  return {
    id: 'features',
    title: 'Feature Selection',
    description: 'Select features to include in your application',
    questions: [
      createMultipleChoiceQuestion(
        'features',
        'Which features would you like to include?',
        [
          {
            id: 'auth',
            label: 'Authentication',
            description: 'User login and registration'
          },
          {
            id: 'admin',
            label: 'Admin Dashboard',
            description: 'Administrative interface'
          },
          {
            id: 'api',
            label: 'REST API',
            description: 'RESTful API endpoints'
          },
          {
            id: 'notifications',
            label: 'Notifications',
            description: 'Email and push notifications'
          },
          {
            id: 'analytics',
            label: 'Analytics',
            description: 'Usage tracking and analytics'
          }
        ],
        'Select all features you need. You can add more later.'
      )
    ]
  }
}

/**
 * Example 4: Text Input with Validation
 *
 * Collect free-form text with validation rules
 */
export function example4_ProjectDetails(): QuestionGroup {
  return {
    id: 'project-details',
    title: 'Project Details',
    description: 'Basic information about your project',
    questions: [
      createTextQuestion(
        'project-name',
        'What is your project name?',
        true,
        'my-awesome-project',
        'This will be used for the package.json name'
      ),
      {
        id: 'project-description',
        type: 'text' as const,
        text: 'Brief description of your project',
        required: false,
        context: 'Optional: Describe what your project does'
      },
      {
        id: 'port',
        type: 'number' as const,
        text: 'Which port should the server run on?',
        defaultValue: 3000,
        required: true,
        validation: {
          min: 1024,
          max: 65535,
          message: 'Port must be between 1024 and 65535'
        }
      }
    ]
  }
}

/**
 * Example 5: Complete ArchitectAgent Usage
 *
 * How ArchitectAgent would use askUser() in practice
 */
export async function example5_ArchitectUsage() {
  // Pseudo-code showing how ArchitectAgent would use askUser()

  /*
  class ArchitectAgent extends BaseAgent {
    async execute(state: AgentState): Promise<Partial<AgentState>> {
      // Step 1: Check if we need user input
      if (this.needsUserInput(state.task)) {

        // Step 2: Build question groups
        const questionGroups = [
          example2_TechStackQuestions(),
          example3_FeatureSelection(),
          example4_ProjectDetails()
        ]

        // Step 3: Ask user (workflow pauses here)
        const response = await this.askUser(
          'Need to clarify architecture decisions before generating design',
          questionGroups
        )

        // Step 4: Extract answers
        const framework = this.getAnswer(response.answers, 'framework')
        const api = this.getAnswer(response.answers, 'api')
        const typescript = this.getAnswer(response.answers, 'typescript')
        const features = this.getAnswer(response.answers, 'features')
        const projectName = this.getAnswer(response.answers, 'project-name')
        const port = this.getAnswer(response.answers, 'port')

        // Step 5: Use answers to generate architecture
        const architecture = await this.generateArchitecture({
          framework,
          api,
          typescript,
          features,
          projectName,
          port
        })

        // Step 6: Return result with artifacts
        return this.createResult('success', architecture, [
          this.createArtifact('adr', architecture.adr),
          this.createArtifact('diagram', architecture.diagram)
        ])
      }

      // If no user input needed, proceed with defaults
      return this.createResult('success', 'Architecture generated with defaults')
    }
  }
  */
}

/**
 * Example 6: CLI Display
 *
 * How questions appear in terminal
 */
export function example6_CLIDisplay() {
  /*
  Terminal output when ArchitectAgent asks questions:

  ══════════════════════════════════════════════════════════════════
  ⏸️  Architect needs your input
  ══════════════════════════════════════════════════════════════════

  Context:
    Need to clarify architecture decisions before generating design

  [Technology Stack] Which web framework?
    PostgreSQL is recommended for production applications with complex queries
  ❯ React (recommended)
    Vue.js
    Angular
    Svelte

  [Technology Stack] Which API framework?
  ❯ Express.js (recommended)
    Fastify
    NestJS
    GraphQL

  [Technology Stack] Use TypeScript? (Y/n) Y

  [Feature Selection] Which features would you like to include?
    Select all features you need. You can add more later.
  ◉ Authentication - User login and registration
  ◯ Admin Dashboard - Administrative interface
  ◉ REST API - RESTful API endpoints
  ◯ Notifications - Email and push notifications
  ◯ Analytics - Usage tracking and analytics

  [Project Details] What is your project name? my-awesome-project

  [Project Details] Which port should the server run on? 3000

  ✅ Answers submitted successfully
     6 questions answered
  ══════════════════════════════════════════════════════════════════

  🔨 Generating architecture based on your choices...
  */
}

/**
 * Example 7: Error Handling
 *
 * How to handle cancellation and timeout
 */
export async function example7_ErrorHandling() {
  /*
  try {
    const response = await this.askUser(
      'Configuration needed',
      questionGroups,
      [],
      60000 // 60 second timeout
    )

    // Process answers
    const choice = this.getAnswer(response.answers, 'my-question')

  } catch (error) {
    if (error.message === 'User cancelled input request') {
      // User pressed Ctrl+C
      this.log('User cancelled configuration', 'warn')
      return this.createResult('failed', 'Cancelled by user')
    }

    if (error.message === 'Request timeout') {
      // Timeout expired
      this.log('Configuration timeout', 'warn')
      return this.createResult('failed', 'Timeout waiting for user input')
    }

    // Other error
    throw error
  }
  */
}
