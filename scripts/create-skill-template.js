#!/usr/bin/env node

/**
 * Skill Template Generator
 * Creates a new skill with proper structure
 */

import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SKILLS_DIR = join(__dirname, '../packages/core/templates/skills');

function createSkill(config) {
  const {
    id,
    name,
    description,
    category,
    complexity = 'intermediate',
    estimated_time = '1h',
    required_mcps = ['filesystem'],
    composable_with = [],
    examples = []
  } = config;

  const skillDir = join(SKILLS_DIR, id);
  const refsDir = join(skillDir, 'references');

  // Create directories
  if (!existsSync(skillDir)) {
    mkdirSync(skillDir, { recursive: true });
    mkdirSync(refsDir, { recursive: true });
  } else {
    console.log(`⚠️  Skill ${id} already exists, skipping...`);
    return false;
  }

  // Create SKILL.md
  const skillMd = `---
"name": "${name}"
"description": "${description}"
---

# ${name}

## Overview

${description}

## When to Use

Use this skill when:

- TODO: Add specific use cases
- TODO: Add trigger keywords

**Suitable for**: ${complexity} complexity tasks

## Required Tools

This skill requires access to:

${required_mcps.map(mcp => `- **${mcp}** MCP server`).join('\\n')}

## Works Well With

This skill can be combined with:

${composable_with.length > 0 ? composable_with.map(skill => `- **${skill}**`).join('\\n') : '- TODO: Add composable skills'}

## Examples

See [EXAMPLES.md](references/EXAMPLES.md) for detailed examples.

---

**Metadata:**
- Category: ${category}
- Complexity: ${complexity}
- Estimated Time: ${estimated_time}
- Confidence Threshold: 0.8
`;

  writeFileSync(join(skillDir, 'SKILL.md'), skillMd);

  // Create EXAMPLES.md
  const examplesMd = `# Examples: ${name}

${examples.length > 0 ? examples.map((ex, i) => `
## Example ${i + 1}: ${ex.title}

${ex.description}

### Steps

${ex.steps.map((step, j) => `${j + 1}. ${step}`).join('\\n')}
`).join('\\n') : '## Example 1: Basic Usage\n\nTODO: Add example\n'}
`;

  writeFileSync(join(refsDir, 'EXAMPLES.md'), examplesMd);

  console.log(`✅ Created skill: ${id}`);
  return true;
}

export { createSkill };

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: node create-skill-template.js [skill-config.json]');
    process.exit(1);
  }

  const configPath = args[0];
  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  createSkill(config);
}
