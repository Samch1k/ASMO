/**
 * AI1st Configuration for Todo App
 *
 * This configuration demonstrates basic orchestration with minimal complexity.
 * Perfect for showcasing autonomous development with architect, developer, and tester agents.
 */

export default {
  /**
   * Agents used in this project
   */
  agents: ['architect', 'developer', 'tester'],

  /**
   * Timeout configuration (in milliseconds)
   */
  timeouts: {
    architect: 180000,  // 3 minutes for design tasks
    developer: 300000,  // 5 minutes for implementation
    tester: 180000,     // 3 minutes for testing
  },

  /**
   * Parallel execution disabled for this simple demo
   */
  parallel: {
    enabled: false,
    maxAgents: 1,
  },

  /**
   * Approval checkpoints
   */
  approvalRequired: true,

  /**
   * Learning and metrics
   */
  learningEnabled: true,

  /**
   * Technology stack
   */
  techStack: {
    frontend: 'React 19',
    state: 'Zustand',
    styling: 'Tailwind CSS',
    storage: 'localStorage',
  },
}
