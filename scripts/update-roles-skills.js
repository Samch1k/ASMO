#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CORE_ROLES_PATH = join(__dirname, '../packages/core/templates/roles/core-roles.json');
const SPECIALIZED_ROLES_PATH = join(__dirname, '../packages/core/templates/roles/specialized-roles.json');

// Mapping of old skills to new unified skills
const SKILL_MAPPING = {
  // UI group → ui_styling
  'component_styling': 'ui_styling',
  'animation': 'ui_styling',
  'css_optimization': 'ui_styling',
  'tailwind_css': 'ui_styling',

  // Debugging group → debug_investigation
  'bug_diagnosis': 'debug_investigation',
  'error_investigation': 'debug_investigation',
  'root_cause_analysis': 'debug_investigation',
  'log_analysis': 'debug_investigation',

  // Testing group → system_testing
  'acceptance_testing': 'system_testing',
  'smoke_testing': 'system_testing',

  // Product group → market_research
  'competitive_analysis': 'market_research',
  'market_analysis': 'market_research',

  // Project management → stakeholder_relations
  'stakeholder_management': 'stakeholder_relations',
  'stakeholder_communication': 'stakeholder_relations'
};

// Skills to completely remove (don't exist and not critical)
const SKILLS_TO_REMOVE = [
  // Specialized skills that don't exist
  'security_audit', 'vulnerability_scanning', 'threat_modeling',
  'security_review', 'security_analysis',
  'auth_authorization_review', 'data_protection', 'dependency_audit',
  'owasp_compliance', 'security_testing',
  'test_strategy', 'risk_based_testing', 'quality_gates',
  'test_automation', 'release_readiness', 'regression_analysis',
  'test_maintenance', 'coverage_analysis',
  'performance_profiling', 'optimization', 'load_testing',
  'database_tuning', 'caching_strategy', 'frontend_performance',
  'backend_performance', 'capacity_planning', 'monitoring_setup',
  'database_design', 'schema_modeling', 'data_migration',
  'database_normalization', 'index_optimization', 'data_integrity',
  'backup_recovery', 'data_lifecycle', 'relationship_design',
  'api_design', 'rest_api', 'openapi_spec',
  'graphql_design', 'api_versioning', 'request_validation',
  'response_design', 'error_handling', 'api_security', 'rate_limiting',
  'documentation', 'technical_writing', 'api_documentation',
  'user_guides', 'readme_creation', 'release_notes',
  'architecture_docs', 'tutorial_creation',
  'backlog_management', 'agile_ceremonies', 'impediment_resolution',
  'velocity_tracking', 'retrospective_facilitation', 'story_estimation',
  'team_coaching',
  'analysis', 'research', 'brainstorming',
  'strategic_planning', 'trend_analysis', 'product_brief_creation',
  'adversarial_review', 'best_practices', 'code_review',
  'design_review', 'performance_review', 'issue_detection', 'critical_analysis',
  'test_coverage_analysis'
];

function updateRole(role) {
  let changes = 0;

  // Update required_skills
  if (role.required_skills) {
    const newRequired = [];
    role.required_skills.forEach(skill => {
      if (SKILL_MAPPING[skill]) {
        if (!newRequired.includes(SKILL_MAPPING[skill])) {
          newRequired.push(SKILL_MAPPING[skill]);
          changes++;
        }
      } else if (!SKILLS_TO_REMOVE.includes(skill)) {
        newRequired.push(skill);
      } else {
        changes++;
      }
    });
    role.required_skills = newRequired;
  }

  // Update optional_skills
  if (role.optional_skills) {
    const newOptional = [];
    role.optional_skills.forEach(skill => {
      if (SKILL_MAPPING[skill]) {
        if (!newOptional.includes(SKILL_MAPPING[skill]) && !role.required_skills.includes(SKILL_MAPPING[skill])) {
          newOptional.push(SKILL_MAPPING[skill]);
          changes++;
        }
      } else if (!SKILLS_TO_REMOVE.includes(skill)) {
        newOptional.push(skill);
      } else {
        changes++;
      }
    });
    role.optional_skills = newOptional;
  }

  return changes;
}

function updateRolesFile(filePath, fileName) {
  console.log(`\n🔄 Updating ${fileName}...`);

  const data = JSON.parse(readFileSync(filePath, 'utf-8'));
  let totalChanges = 0;

  data.roles.forEach(role => {
    const changes = updateRole(role);
    if (changes > 0) {
      console.log(`   ✅ ${role.id}: ${changes} changes`);
      totalChanges += changes;
    }
  });

  writeFileSync(filePath, JSON.stringify(data, null, 2));

  console.log(`   Total: ${totalChanges} changes in ${data.roles.length} roles`);
  return totalChanges;
}

console.log('🔄 Updating roles to use unified skills...\n');

const coreChanges = updateRolesFile(CORE_ROLES_PATH, 'core-roles.json');
const specializedChanges = updateRolesFile(SPECIALIZED_ROLES_PATH, 'specialized-roles.json');

console.log(`\n✅ Roles updated successfully!`);
console.log(`   Core roles: ${coreChanges} changes`);
console.log(`   Specialized roles: ${specializedChanges} changes`);
console.log(`   Total: ${coreChanges + specializedChanges} changes`);
