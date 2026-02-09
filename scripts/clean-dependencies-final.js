#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DEPS_PATH = join(__dirname, '../packages/core/templates/skills/skill-dependencies.json');
const CATALOG_PATH = join(__dirname, '../packages/core/templates/skills/skills-catalog.json');

// Get list of existing skills from catalog
const catalog = JSON.parse(readFileSync(CATALOG_PATH, 'utf-8'));
const existingSkills = new Set(catalog.skills.map(s => s.id));

console.log(`📚 Found ${existingSkills.size} skills in catalog\n`);

const deps = JSON.parse(readFileSync(DEPS_PATH, 'utf-8'));
const before = Object.keys(deps.dependencies).length;

// Remove entries for non-existent skills
const removed = [];
Object.keys(deps.dependencies).forEach(skill => {
  if (!existingSkills.has(skill)) {
    delete deps.dependencies[skill];
    removed.push(skill);
  }
});

console.log(`❌ Removed ${removed.length} dependency entries for deleted skills:`);
removed.forEach(skill => console.log(`   - ${skill}`));
console.log('');

// Clean references in remaining entries
let cleaned = 0;
Object.keys(deps.dependencies).forEach(skill => {
  const config = deps.dependencies[skill];

  if (config.requires) {
    const validRequires = config.requires.filter(r => existingSkills.has(r));
    if (validRequires.length !== config.requires.length) {
      cleaned += config.requires.length - validRequires.length;
      config.requires = validRequires;
    }
  }

  if (config.recommended) {
    const validRecommended = config.recommended.filter(r => existingSkills.has(r));
    if (validRecommended.length !== config.recommended.length) {
      cleaned += config.recommended.length - validRecommended.length;
      config.recommended = validRecommended;
    }
  }
});

console.log(`🧹 Cleaned ${cleaned} invalid references from remaining entries\n`);

const after = Object.keys(deps.dependencies).length;

writeFileSync(DEPS_PATH, JSON.stringify(deps, null, 2));

console.log(`✅ Dependencies cleaned!`);
console.log(`   Before: ${before} entries`);
console.log(`   Removed: ${removed.length} entries`);
console.log(`   After: ${after} entries`);
console.log(`   Cleaned refs: ${cleaned}`);
