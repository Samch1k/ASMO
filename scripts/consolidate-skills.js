#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CATALOG_PATH = join(__dirname, '../packages/core/templates/skills/skills-catalog.json');

// Skills to remove (will be replaced by unified skills)
const SKILLS_TO_REMOVE = [
  // UI group
  'component_styling', 'animation', 'css_optimization', 'tailwind_css',
  // Debugging group
  'bug_diagnosis', 'error_investigation', 'root_cause_analysis', 'log_analysis',
  // Testing group
  'acceptance_testing', 'smoke_testing',
  // Product group
  'competitive_analysis', 'market_analysis',
  // Project management group
  'stakeholder_management', 'stakeholder_communication'
];

// New unified skills to add
const UNIFIED_SKILLS = [
  {
    id: 'ui_styling',
    name: 'UI Styling',
    description: 'Component styling with Tailwind CSS, animations, CSS optimization, and modern styling techniques.',
    category: 'ui_design',
    complexity: 'intermediate',
    requires_skills: [],
    required_mcps: ['filesystem'],
    confidence_threshold: 0.8,
    estimated_time: '30m-2h',
    composable_with: ['responsive_design', 'accessibility'],
    metadata: { tools: [], docs: [], difficulty: 6, success_rate: 0.85, aliases: ['component styling', 'tailwind', 'css', 'animation'] }
  },
  {
    id: 'debug_investigation',
    name: 'Debug Investigation',
    description: 'Comprehensive debugging including bug diagnosis, error investigation, root cause analysis, and log analysis.',
    category: 'debugging',
    complexity: 'advanced',
    requires_skills: [],
    required_mcps: ['filesystem', 'github'],
    confidence_threshold: 0.85,
    estimated_time: '30m-2h',
    composable_with: ['hotfix_generation', 'code_review'],
    metadata: { tools: [], docs: [], difficulty: 7, success_rate: 0.85, aliases: ['debug', 'investigation', 'root cause'] }
  },
  {
    id: 'system_testing',
    name: 'System Testing',
    description: 'End-to-end system testing including acceptance testing and smoke testing.',
    category: 'testing',
    complexity: 'intermediate',
    requires_skills: [],
    required_mcps: ['filesystem'],
    confidence_threshold: 0.8,
    estimated_time: '30m-1h',
    composable_with: ['e2e_testing', 'unit_testing'],
    metadata: { tools: [], docs: [], difficulty: 6, success_rate: 0.85, aliases: ['acceptance', 'smoke', 'UAT'] }
  },
  {
    id: 'market_research',
    name: 'Market Research',
    description: 'Market and competitive analysis to identify opportunities and threats.',
    category: 'product',
    complexity: 'advanced',
    requires_skills: [],
    required_mcps: ['filesystem', 'memory'],
    confidence_threshold: 0.85,
    estimated_time: '1-2h',
    composable_with: ['strategy', 'prioritization'],
    metadata: { tools: [], docs: [], difficulty: 7, success_rate: 0.85, aliases: ['market analysis', 'competitive analysis'] }
  },
  {
    id: 'stakeholder_relations',
    name: 'Stakeholder Relations',
    description: 'Stakeholder management and communication to build effective partnerships.',
    category: 'project_management',
    complexity: 'advanced',
    requires_skills: [],
    required_mcps: ['filesystem', 'memory'],
    confidence_threshold: 0.85,
    estimated_time: 'varies',
    composable_with: ['coordination', 'sprint_planning'],
    metadata: { tools: [], docs: [], difficulty: 7, success_rate: 0.85, aliases: ['stakeholder management', 'communication'] }
  }
];

console.log('🔄 Consolidating skills...\n');

const catalog = JSON.parse(readFileSync(CATALOG_PATH, 'utf-8'));
const before = catalog.skills.length;

// Remove old skills
const removed = [];
catalog.skills = catalog.skills.filter(skill => {
  if (SKILLS_TO_REMOVE.includes(skill.id)) {
    removed.push(skill.id);
    return false;
  }
  return true;
});

console.log(`❌ Removed ${removed.length} old skills:`);
removed.forEach(id => console.log(`   - ${id}`));
console.log('');

// Add new unified skills
const added = [];
UNIFIED_SKILLS.forEach(skill => {
  const exists = catalog.skills.find(s => s.id === skill.id);
  if (!exists) {
    catalog.skills.push(skill);
    added.push(skill.id);
  }
});

console.log(`✅ Added ${added.length} unified skills:`);
added.forEach(id => console.log(`   - ${id}`));
console.log('');

const after = catalog.skills.length;

writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2));

console.log(`📊 Summary:`);
console.log(`   Before: ${before} skills`);
console.log(`   Removed: ${removed.length}`);
console.log(`   Added: ${added.length}`);
console.log(`   After: ${after} skills`);
console.log(`   Net change: ${after - before}`);
console.log('');
console.log('✅ Skills consolidated successfully!');
