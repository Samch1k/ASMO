# ASMO Configuration Templates

This directory contains configuration templates for the ASMO orchestration system.

## Directory Structure

```
templates/
├── roles/              # Agent role definitions
├── workflows/          # Workflow configurations
└── skills/             # Skill catalog and mappings
```

## Roles

**Location**: `templates/roles/`

Three role configuration files:

- **core-roles.json**: Core development roles (architect, developer, tester, etc.)
- **specialized-roles.json**: Specialized roles (ui-developer, ux-designer, devops, etc.)
- **project-roles.json**: Template for project-specific roles

### Adding Custom Roles

To add project-specific roles:

1. Copy `project-roles.json` template
2. Replace example role with your domain-specific roles
3. Update `id`, `name`, `description`, and skills
4. Set appropriate `trigger_keywords` for auto-activation

## Workflows

**Location**: `templates/workflows/`

Organized by workflow category:

### 1. Quick Flow (`1-quick-flow/`)
- **bug_fix_workflow**: Fast bug fix with testing

### 2. Feature Development (`2-feature-development/`)
- **feature_implementation_full**: Complete feature workflow with approval gates
- **ui_component_library**: UI component development workflow

### 3. Quality Assurance (`3-quality-assurance/`)
- **comprehensive_testing**: Full testing suite (unit, integration, E2E)
- **performance_investigation**: Performance profiling and optimization

## Skills

**Location**: `templates/skills/`

- **skills-catalog.json**: 85 generic skills (domain-specific skills removed)
- **skill-dependencies.json**: Skill dependency graph
- **skill-mcp-mapping.json**: MCP server requirements per skill
- **skills.schema.json**: JSON schema for skill validation

### Skill Categories

Skills are organized into 12 categories:

- `architecture`: System design, API design, database design
- `development`: Coding, implementation, debugging
- `testing`: Unit, integration, E2E, acceptance testing
- `devops`: CI/CD, deployment, monitoring
- `debugging`: Error investigation, log analysis
- `performance`: Optimization, profiling, caching
- `ui_design`: Component styling, responsive design
- `ux_design`: User flows, wireframes, usability
- `product`: Requirements analysis, user stories
- `project_management`: Planning, estimation, coordination
- `business`: Domain modeling, workflow design
- `project_specific`: Custom domain skills (add your own)

## Usage in Code

```typescript
import { ConfigLoader } from '@asmo/core'

// Initialize config loader
const loader = new ConfigLoader('.asmo/config')
await loader.initialize()

// Load roles
const roles = await loader.loadRoles()

// Load skills
const skills = await loader.loadSkills()
```

## Customization

### For Your Project

1. **Copy templates** to `.asmo/config/` in your project
2. **Customize workflows** for your development process
3. **Add project-specific roles** in `project-roles.json`
4. **Add domain skills** in `skills-catalog.json` (category: `project_specific`)

### Example: Adding E-commerce Domain Role

```json
{
  "id": "product-catalog-specialist",
  "name": "Product Catalog Specialist",
  "description": "E-commerce product catalog expert",
  "category": "project_specific",
  "required_skills": ["product_management", "inventory_tracking"],
  "activation_rules": {
    "trigger_keywords": ["product", "catalog", "inventory"]
  }
}
```

## Schema Validation

All configuration files are validated against JSON schemas:

- `roles.schema.json`: Role configuration schema
- `skills.schema.json`: Skill configuration schema

Use these schemas to validate custom configurations before deployment.
