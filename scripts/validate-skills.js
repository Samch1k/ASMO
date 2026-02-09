#!/usr/bin/env node

/**
 * Skills Validation Script
 *
 * Validates that the skill system is consistent:
 * - All skills referenced in roles exist in catalog
 * - All skills referenced in workflows exist in catalog
 * - All skill dependencies are valid
 * - No unused skills (optional check)
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT = join(__dirname, '..');
const TEMPLATES_DIR = join(ROOT, 'packages/core/templates');

// ANSI colors
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

let errors = [];
let warnings = [];
let info = [];

function log(level, message) {
  const timestamp = new Date().toISOString();
  const prefix = {
    error: `${RED}✗ ERROR${RESET}`,
    warn: `${YELLOW}⚠ WARN${RESET}`,
    info: `${BLUE}ℹ INFO${RESET}`,
    success: `${GREEN}✓ SUCCESS${RESET}`
  }[level];

  console.log(`${prefix} ${message}`);

  if (level === 'error') errors.push(message);
  if (level === 'warn') warnings.push(message);
  if (level === 'info') info.push(message);
}

function loadJSON(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch (error) {
    log('error', `Failed to load ${path}: ${error.message}`);
    return null;
  }
}

function getAllSkillsFromCatalog() {
  const catalogPath = join(TEMPLATES_DIR, 'skills/skills-catalog.json');
  const catalog = loadJSON(catalogPath);
  if (!catalog) return new Set();

  return new Set(catalog.skills.map(s => s.id));
}

function getAllSkillsFromRoles() {
  const coreRolesPath = join(TEMPLATES_DIR, 'roles/core-roles.json');
  const specializedRolesPath = join(TEMPLATES_DIR, 'roles/specialized-roles.json');

  const skills = new Set();

  [coreRolesPath, specializedRolesPath].forEach(path => {
    const data = loadJSON(path);
    if (!data) return;

    data.roles.forEach(role => {
      (role.required_skills || []).forEach(s => skills.add(s));
      (role.optional_skills || []).forEach(s => skills.add(s));
    });
  });

  return skills;
}

function getAllSkillsFromWorkflows() {
  const workflowsDir = join(TEMPLATES_DIR, 'workflows');
  const skills = new Set();

  function scanDir(dir) {
    const entries = readdirSync(dir);

    entries.forEach(entry => {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.endsWith('.json') && !entry.includes('schema')) {
        const data = loadJSON(fullPath);
        if (!data || !data.phases) return;

        data.phases.forEach(phase => {
          (phase.agents || []).forEach(agent => {
            (agent.skills || []).forEach(skill => skills.add(skill));
          });
        });
      }
    });
  }

  try {
    scanDir(workflowsDir);
  } catch (error) {
    log('error', `Failed to scan workflows: ${error.message}`);
  }

  return skills;
}

function validateSkillDependencies(catalogSkills) {
  const depsPath = join(TEMPLATES_DIR, 'skills/skill-dependencies.json');
  const deps = loadJSON(depsPath);
  if (!deps) return;

  log('info', '\\n--- Validating Skill Dependencies ---');

  Object.entries(deps.dependencies || {}).forEach(([skill, config]) => {
    // Check if skill exists in catalog
    if (!catalogSkills.has(skill)) {
      log('warn', `Dependency entry for non-existent skill: ${skill}`);
    }

    // Check if required skills exist
    (config.requires || []).forEach(req => {
      if (!catalogSkills.has(req)) {
        log('error', `Skill "${skill}" requires non-existent skill: ${req}`);
      }
    });

    // Check if recommended skills exist
    (config.recommended || []).forEach(rec => {
      if (!catalogSkills.has(rec)) {
        log('warn', `Skill "${skill}" recommends non-existent skill: ${rec}`);
      }
    });
  });
}

function checkUnusedSkills(catalogSkills, rolesSkills, workflowsSkills) {
  log('info', '\\n--- Checking for Unused Skills ---');

  const unusedSkills = [...catalogSkills].filter(
    skill => !rolesSkills.has(skill) && !workflowsSkills.has(skill)
  );

  if (unusedSkills.length === 0) {
    log('success', 'All skills in catalog are used!');
  } else {
    log('warn', `Found ${unusedSkills.length} unused skills:`);
    unusedSkills.forEach(skill => {
      log('warn', `  - ${skill} (not used in roles or workflows)`);
    });
  }

  return unusedSkills;
}

function main() {
  console.log(`${BLUE}╔═══════════════════════════════════════╗${RESET}`);
  console.log(`${BLUE}║   ASMO Skills Validation Script      ║${RESET}`);
  console.log(`${BLUE}╚═══════════════════════════════════════╝${RESET}`);
  console.log('');

  // Load all skills
  log('info', 'Loading skills from catalog...');
  const catalogSkills = getAllSkillsFromCatalog();
  log('info', `  Found ${catalogSkills.size} skills in catalog`);

  log('info', 'Loading skills from roles...');
  const rolesSkills = getAllSkillsFromRoles();
  log('info', `  Found ${rolesSkills.size} skills referenced in roles`);

  log('info', 'Loading skills from workflows...');
  const workflowsSkills = getAllSkillsFromWorkflows();
  log('info', `  Found ${workflowsSkills.size} skills referenced in workflows`);

  // Validate: roles skills exist in catalog
  log('info', '\\n--- Validating Roles ---');
  const missingInCatalogFromRoles = [...rolesSkills].filter(s => !catalogSkills.has(s));

  if (missingInCatalogFromRoles.length === 0) {
    log('success', 'All role skills exist in catalog!');
  } else {
    log('error', `Found ${missingInCatalogFromRoles.length} skills in roles that DON'T exist in catalog:`);
    missingInCatalogFromRoles.slice(0, 10).forEach(skill => {
      log('error', `  - ${skill}`);
    });
    if (missingInCatalogFromRoles.length > 10) {
      log('error', `  ... and ${missingInCatalogFromRoles.length - 10} more`);
    }
  }

  // Validate: workflow skills exist in catalog
  log('info', '\\n--- Validating Workflows ---');
  const missingInCatalogFromWorkflows = [...workflowsSkills].filter(s => !catalogSkills.has(s));

  if (missingInCatalogFromWorkflows.length === 0) {
    log('success', 'All workflow skills exist in catalog!');
  } else {
    log('error', `Found ${missingInCatalogFromWorkflows.length} skills in workflows that DON'T exist in catalog:`);
    missingInCatalogFromWorkflows.forEach(skill => {
      log('error', `  - ${skill}`);
    });
  }

  // Validate dependencies
  validateSkillDependencies(catalogSkills);

  // Check unused skills
  const unusedSkills = checkUnusedSkills(catalogSkills, rolesSkills, workflowsSkills);

  // Summary
  console.log('');
  console.log(`${BLUE}╔═══════════════════════════════════════╗${RESET}`);
  console.log(`${BLUE}║           Validation Summary          ║${RESET}`);
  console.log(`${BLUE}╚═══════════════════════════════════════╝${RESET}`);
  console.log('');
  console.log(`Skills in catalog:     ${catalogSkills.size}`);
  console.log(`Skills in roles:       ${rolesSkills.size}`);
  console.log(`Skills in workflows:   ${workflowsSkills.size}`);
  console.log('');
  console.log(`${RED}Errors:   ${errors.length}${RESET}`);
  console.log(`${YELLOW}Warnings: ${warnings.length}${RESET}`);
  console.log(`${BLUE}Info:     ${info.length}${RESET}`);
  console.log('');

  if (errors.length === 0 && warnings.length === 0) {
    console.log(`${GREEN}✓ All validations passed!${RESET}`);
    console.log('');
    process.exit(0);
  } else {
    console.log(`${RED}✗ Validation failed with ${errors.length} errors and ${warnings.length} warnings${RESET}`);
    console.log('');

    if (errors.length > 0) {
      console.log(`${RED}Critical issues found. System may not work correctly.${RESET}`);
      process.exit(1);
    } else {
      console.log(`${YELLOW}Non-critical issues found. System should work but needs cleanup.${RESET}`);
      process.exit(0);
    }
  }
}

main();
