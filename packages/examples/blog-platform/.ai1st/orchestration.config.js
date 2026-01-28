/**
 * AI1st Orchestration Configuration - Blog Platform
 *
 * This configuration demonstrates parallel execution and UX-first workflows.
 */

export default {
  // Project metadata
  project: {
    name: 'Blog Platform',
    description: 'Full-stack blog with commenting system',
    version: '0.1.0'
  },

  // Active agents for this project
  agents: [
    'architect',
    'developer',
    'ui-developer',
    'ux-designer',
    'tester',
    'devops'
  ],

  // Enable parallel execution
  parallel: {
    enabled: true,
    max_agents: 3  // Allow up to 3 agents working simultaneously
  },

  // Timeouts per agent role
  timeouts: {
    architect: '5m',
    developer: '15m',
    ui_developer: '12m',
    ux_designer: '8m',
    tester: '10m',
    devops: '5m'
  },

  // Workflow definitions
  workflows: {
    /**
     * UX-first feature development workflow
     *
     * Steps:
     * 1. [Parallel] Architect + UX Designer plan together
     * 2. [Parallel] Backend Developer + UI Developer implement
     * 3. [Sequential] Tester validates everything
     */
    feature_with_ux: {
      description: 'Feature development with UX design first',
      phases: [
        {
          name: 'design',
          parallel: true,
          agents: [
            { role: 'architect', task: 'design_schema_and_api' },
            { role: 'ux-designer', task: 'create_mockups_and_flows' }
          ]
        },
        {
          name: 'implementation',
          parallel: true,
          requires: ['design'],
          agents: [
            { role: 'developer', task: 'implement_backend' },
            { role: 'ui-developer', task: 'implement_frontend' }
          ]
        },
        {
          name: 'testing',
          requires: ['implementation'],
          agents: [
            { role: 'tester', task: 'integration_and_e2e_tests' }
          ]
        }
      ]
    },

    /**
     * Bug fix workflow (simpler, no UX needed)
     */
    bug_fix: {
      description: 'Fix bugs with testing',
      phases: [
        {
          name: 'investigation',
          agents: [
            { role: 'developer', task: 'identify_root_cause' }
          ]
        },
        {
          name: 'fix',
          requires: ['investigation'],
          agents: [
            { role: 'developer', task: 'implement_fix' }
          ]
        },
        {
          name: 'testing',
          requires: ['fix'],
          agents: [
            { role: 'tester', task: 'regression_tests' }
          ]
        }
      ]
    }
  },

  // Technology stack (helps agents understand context)
  tech_stack: {
    backend: {
      runtime: 'Node.js',
      framework: 'Express',
      database: 'SQLite',
      orm: 'better-sqlite3'
    },
    frontend: {
      framework: 'React',
      version: '19.0.0',
      bundler: 'Vite',
      router: 'React Router',
      styling: 'CSS Modules'
    }
  },

  // Quality gates
  quality: {
    min_test_coverage: 70,
    require_tests: true,
    require_documentation: false,  // Simple demo project
    accessibility: {
      enabled: true,
      wcag_level: 'AA'
    }
  },

  // Approval checkpoints
  approvals: {
    required: [
      'design',      // Approve design before implementation
      'implementation'  // Approve implementation before deployment
    ],
    auto_approve_tests: false
  }
}
