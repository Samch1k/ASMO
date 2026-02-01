# Tech Writer Agent

Documentation specialist for API documentation, user guides, and technical writing.

## Overview

The Tech Writer Agent creates professional technical documentation including API references, user guides, READMEs, and system documentation. It follows documentation best practices and maintains consistent style.

## Capabilities

| Skill | Description |
|-------|-------------|
| `documentation` | General documentation creation |
| `technical_writing` | Technical content writing |
| `api_documentation` | API reference documentation |
| `user_guides` | End-user documentation |
| `readme_creation` | Project README files |
| `system_documentation` | Architecture and system docs |
| `style_guide_compliance` | Consistent documentation style |
| `doc_maintenance` | Documentation updates and fixes |

## Documentation Types

### API Documentation
- Endpoint descriptions with parameters
- Request/response examples
- Authentication guides
- Error handling documentation

### User Guides
- Getting started tutorials
- Feature walkthroughs
- Troubleshooting guides
- FAQ sections

### System Documentation
- Architecture overviews
- Deployment guides
- Configuration references
- Integration documentation

### README Files
- Project overview
- Installation instructions
- Quick start examples
- Contributing guidelines

## Configuration

```yaml
# agents.yaml
tech-writer:
  id: tech-writer
  name: Tech Writer
  model_preference: sonnet
  role:
    id: tech-writer
    seniority: senior
    expertise:
      - technical_writing
      - api_documentation
      - user_experience_writing
```

## Usage

```typescript
import { TechWriterAgent } from '@ai1st/core'

const writer = new TechWriterAgent()

const result = await writer.execute({
  task: 'Create API documentation for the user authentication endpoints',
  context: {
    endpoints: ['/auth/login', '/auth/register', '/auth/refresh']
  }
})

console.log(result.artifacts[0].content) // API documentation
```

## Output Artifacts

- API Reference (OpenAPI/Markdown)
- User Guide (Markdown)
- README.md
- Architecture Documentation
- Changelog entries

## Style Guidelines

The Tech Writer Agent follows these principles:
- Clear, concise language
- Consistent terminology
- Code examples for all features
- Progressive disclosure (simple → advanced)
- Accessible formatting

## MCP Integrations

- **Filesystem MCP**: Reads source code and writes documentation
- **Memory MCP**: Maintains documentation style consistency
- **Context7 MCP**: References documentation best practices

## See Also

- [Document Sharding Guide](/docs/en/guides/document-sharding.md)
- [Analyst Agent](./analyst.md)
- [Architect Agent](/docs/en/reference/agents/core/architect.md)
