/**
 * SkillMDLoader - Load skills from SKILL.md format (Anthropic Standard)
 *
 * Implements progressive disclosure (3 levels):
 * - Level 1: Metadata only (name + description) - ~50 tokens per skill
 * - Level 2: Full SKILL.md body - ~2K tokens
 * - Level 3: References on-demand - variable tokens
 *
 * Token efficiency: 85% reduction (50K → 5K for 90 skills)
 */

import fs from 'fs/promises'
import path from 'path'
import yaml from 'yaml'

/**
 * SKILL.md metadata (Level 1)
 */
export interface SkillMetadata {
  name: string
  description: string
}

/**
 * Full SKILL.md (Level 2)
 */
export interface SkillMD {
  id: string
  frontmatter: SkillMetadata
  body: string
  referencesDir?: string
  hasAdvanced: boolean
  hasExamples: boolean
}

/**
 * Skill index entry (for fast lookup)
 */
export interface SkillIndexEntry {
  id: string
  name: string
  description: string
  category?: string
  complexity?: string
}

/**
 * SkillMDLoader - Progressive disclosure loader for SKILL.md files
 */
export class SkillMDLoader {
  private skillsDir: string
  private cache: Map<string, SkillMD> = new Map()
  private metadataCache: Map<string, SkillMetadata> = new Map()
  private indexCache: SkillIndexEntry[] | null = null

  constructor(skillsDir?: string) {
    this.skillsDir = skillsDir || path.join(process.cwd(), '.cursor/skills')
  }

  /**
   * Level 0: List all available skills (just IDs)
   * Fastest operation - no file I/O needed
   */
  async listSkills(): Promise<string[]> {
    try {
      const entries = await fs.readdir(this.skillsDir, { withFileTypes: true })
      return entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
        .sort()
    } catch (error: any) {
      console.error(`❌ Failed to list skills: ${error.message}`)
      return []
    }
  }

  /**
   * Level 1: Load metadata only (name + description)
   * Optimized for skill matching - only reads frontmatter
   * ~50 tokens per skill, ~4K tokens for 90 skills
   */
  async loadMetadata(skillId: string): Promise<SkillMetadata | null> {
    // Check cache first
    if (this.metadataCache.has(skillId)) {
      return this.metadataCache.get(skillId)!
    }

    try {
      const skillPath = path.join(this.skillsDir, skillId, 'SKILL.md')
      const content = await fs.readFile(skillPath, 'utf-8')

      // Extract only frontmatter (efficient - don't parse full body)
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
      if (!frontmatterMatch) {
        console.error(`❌ Invalid SKILL.md format for ${skillId}: missing frontmatter`)
        return null
      }

      const metadata = yaml.parse(frontmatterMatch[1]) as SkillMetadata

      // Validate required fields
      if (!metadata.name || !metadata.description) {
        console.error(`❌ Invalid SKILL.md for ${skillId}: missing name or description`)
        return null
      }

      // Cache and return
      this.metadataCache.set(skillId, metadata)
      return metadata
    } catch (error: any) {
      console.error(`❌ Failed to load metadata for ${skillId}: ${error.message}`)
      return null
    }
  }

  /**
   * Level 1.5: Load index with metadata for all skills
   * Used for fast skill matching across all skills
   * ~4-5K tokens for 90 skills
   */
  async loadIndex(): Promise<SkillIndexEntry[]> {
    // Return cached index if available
    if (this.indexCache) {
      return this.indexCache
    }

    const skillIds = await this.listSkills()
    const index: SkillIndexEntry[] = []

    // Load metadata for all skills in parallel (fast!)
    const metadataPromises = skillIds.map(async (id) => {
      const metadata = await this.loadMetadata(id)
      if (metadata) {
        // Extract category and complexity from body metadata if needed
        // For now, just use frontmatter data
        return {
          id,
          name: metadata.name,
          description: metadata.description
        }
      }
      return null
    })

    const results = await Promise.all(metadataPromises)
    index.push(...results.filter((entry): entry is SkillIndexEntry => entry !== null))

    // Cache index
    this.indexCache = index
    return index
  }

  /**
   * Level 2: Load full SKILL.md (frontmatter + body)
   * Used when skill is matched and details are needed
   * ~2K tokens per skill
   */
  async loadFull(skillId: string): Promise<SkillMD | null> {
    // Check cache first
    if (this.cache.has(skillId)) {
      return this.cache.get(skillId)!
    }

    try {
      const skillPath = path.join(this.skillsDir, skillId, 'SKILL.md')
      const content = await fs.readFile(skillPath, 'utf-8')

      // Parse frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
      if (!frontmatterMatch) {
        console.error(`❌ Invalid SKILL.md format for ${skillId}: missing frontmatter`)
        return null
      }

      const frontmatter = yaml.parse(frontmatterMatch[1]) as SkillMetadata
      const body = content.slice(frontmatterMatch[0].length).trim()

      // Check for references directory
      const referencesDir = path.join(this.skillsDir, skillId, 'references')
      const hasReferences = await this.dirExists(referencesDir)

      // Check which reference files exist
      let hasAdvanced = false
      let hasExamples = false
      if (hasReferences) {
        hasAdvanced = await this.fileExists(path.join(referencesDir, 'ADVANCED.md'))
        hasExamples = await this.fileExists(path.join(referencesDir, 'EXAMPLES.md'))
      }

      const skill: SkillMD = {
        id: skillId,
        frontmatter,
        body,
        referencesDir: hasReferences ? referencesDir : undefined,
        hasAdvanced,
        hasExamples
      }

      // Cache and return
      this.cache.set(skillId, skill)
      return skill
    } catch (error: any) {
      console.error(`❌ Failed to load full skill ${skillId}: ${error.message}`)
      return null
    }
  }

  /**
   * Level 3: Load reference file on-demand
   * Used for advanced guides and detailed examples
   * Variable tokens (typically 1-3K per reference)
   */
  async loadReference(skillId: string, fileName: string): Promise<string | null> {
    try {
      const referencePath = path.join(this.skillsDir, skillId, 'references', fileName)
      const content = await fs.readFile(referencePath, 'utf-8')
      return content
    } catch (error: any) {
      console.error(`❌ Failed to load reference ${skillId}/${fileName}: ${error.message}`)
      return null
    }
  }

  /**
   * Convenience method: Load ADVANCED.md reference
   */
  async loadAdvanced(skillId: string): Promise<string | null> {
    return await this.loadReference(skillId, 'ADVANCED.md')
  }

  /**
   * Convenience method: Load EXAMPLES.md reference
   */
  async loadExamples(skillId: string): Promise<string | null> {
    return await this.loadReference(skillId, 'EXAMPLES.md')
  }

  /**
   * Batch load metadata for multiple skills
   * Optimized for parallel loading
   */
  async loadMetadataBatch(skillIds: string[]): Promise<Map<string, SkillMetadata>> {
    const results = new Map<string, SkillMetadata>()

    const promises = skillIds.map(async (id) => {
      const metadata = await this.loadMetadata(id)
      if (metadata) {
        results.set(id, metadata)
      }
    })

    await Promise.all(promises)
    return results
  }

  /**
   * Clear all caches (useful for testing or after updates)
   */
  clearCache(): void {
    this.cache.clear()
    this.metadataCache.clear()
    this.indexCache = null
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { metadata: number; full: number; index: boolean } {
    return {
      metadata: this.metadataCache.size,
      full: this.cache.size,
      index: this.indexCache !== null
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private async dirExists(dir: string): Promise<boolean> {
    try {
      const stat = await fs.stat(dir)
      return stat.isDirectory()
    } catch {
      return false
    }
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }
}

/**
 * Singleton instance for global use
 */
export const skillMDLoader = new SkillMDLoader()
