/**
 * Elicitation Module - BMAD Integration
 *
 * Advanced elicitation techniques for deeper analysis and
 * improved decision-making in AI-assisted workflows.
 *
 * Available Techniques:
 * - First Principles: Deconstruct to fundamentals
 * - Red Team / Blue Team: Adversarial analysis
 * - Pre-mortem: Anticipate failure
 * - Socratic: Deep questioning
 * - Devil's Advocate: Challenge assumptions
 */

export { ElicitationManager } from './elicitation-manager'

export * from './types'

export {
  firstPrinciplesTechnique,
  redTeamBlueTeamTechnique,
  preMortemTechnique,
  socraticTechnique,
  devilsAdvocateTechnique,
  TECHNIQUES,
  getTechnique,
  getAvailableTechniques,
  getTechniqueDescriptions
} from './techniques'
