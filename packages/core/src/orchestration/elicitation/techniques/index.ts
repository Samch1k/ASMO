/**
 * Elicitation Techniques Index
 *
 * Exports all available elicitation techniques.
 */

export { firstPrinciplesTechnique } from './first-principles'
export { redTeamBlueTeamTechnique } from './red-team-blue-team'
export { preMortemTechnique } from './pre-mortem'
export { socraticTechnique } from './socratic'
export { devilsAdvocateTechnique } from './devils-advocate'

import { ElicitationTechnique, ElicitationTechniqueId } from '../types'
import { firstPrinciplesTechnique } from './first-principles'
import { redTeamBlueTeamTechnique } from './red-team-blue-team'
import { preMortemTechnique } from './pre-mortem'
import { socraticTechnique } from './socratic'
import { devilsAdvocateTechnique } from './devils-advocate'

/**
 * Map of all available techniques
 */
export const TECHNIQUES: Map<ElicitationTechniqueId, ElicitationTechnique> = new Map([
  ['first-principles', firstPrinciplesTechnique],
  ['red-team-blue-team', redTeamBlueTeamTechnique],
  ['pre-mortem', preMortemTechnique],
  ['socratic', socraticTechnique],
  ['devils-advocate', devilsAdvocateTechnique]
])

/**
 * Get a technique by ID
 */
export function getTechnique(id: ElicitationTechniqueId): ElicitationTechnique | undefined {
  return TECHNIQUES.get(id)
}

/**
 * Get all available technique IDs
 */
export function getAvailableTechniques(): ElicitationTechniqueId[] {
  return Array.from(TECHNIQUES.keys())
}

/**
 * Get technique descriptions for display
 */
export function getTechniqueDescriptions(): Array<{
  id: ElicitationTechniqueId
  name: string
  description: string
  useCase: string
}> {
  return Array.from(TECHNIQUES.values()).map(t => ({
    id: t.id,
    name: t.name,
    description: t.description,
    useCase: t.useCase
  }))
}
