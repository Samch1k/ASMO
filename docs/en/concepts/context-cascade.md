# Context Cascade

Context Cascade ensures that information flows correctly between workflow phases. Each phase builds upon the outputs of previous phases, creating a coherent development process.

## Overview

In complex projects, later phases depend on earlier decisions:

```
Product Brief → PRD → Architecture → Epics → Stories → Implementation
```

Context Cascade automatically:
- Tracks document dependencies
- Loads required context for each workflow
- Maintains consistency across phases

## The Cascade Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      Context Cascade                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐                                               │
│  │Product Brief │                                               │
│  └──────┬───────┘                                               │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐    ┌──────────────┐                           │
│  │     PRD      │◄───│  UX Design   │                           │
│  └──────┬───────┘    └──────────────┘                           │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐                                               │
│  │ Architecture │                                               │
│  └──────┬───────┘                                               │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐                                               │
│  │    Epics     │                                               │
│  └──────┬───────┘                                               │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐    ┌──────────────┐                           │
│  │   Stories    │───►│Implementation│                           │
│  └──────────────┘    └──────────────┘                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Document Dependencies

| Workflow | Requires |
|----------|----------|
| `create-prd` | product-brief |
| `create-architecture` | prd, ux-design |
| `create-epics` | prd, architecture |
| `create-story` | epics, prd, architecture |
| `dev-story` | story, architecture, project-context |
| `code-review` | story, architecture |

## Usage

### Basic Usage

```typescript
import { ContextCascade, DocumentRegistry } from '@ai1st/core'

// Initialize with document registry
const registry = new DocumentRegistry({ outputDir: '_ai1st-output' })
const cascade = new ContextCascade(registry)

// Register a document
await registry.registerDocument('product-brief', productBriefContent, {
  project: 'my-project',
  author: 'product-team'
})

// Load context for a workflow
const context = await cascade.loadContextForWorkflow('create-prd')

console.log('Loaded documents:', Object.keys(context.documents))
// Output: ['product-brief']
```

### Getting Dependencies

```typescript
// Get direct dependencies
const deps = cascade.getDependencies('create-architecture')
console.log(deps) // ['prd', 'ux-design']

// Build full context chain
const chain = cascade.buildContextChain('dev-story')
console.log(chain)
// ['product-brief', 'prd', 'ux-design', 'architecture', 'epics', 'story']
```

### Custom Dependencies

```typescript
const cascade = new ContextCascade(registry, {
  customDependencies: {
    'my-workflow': ['prd', 'architecture', 'custom-doc']
  }
})
```

## Document Registry

The Document Registry stores and manages all project documents.

### Registering Documents

```typescript
const doc = await registry.registerDocument(
  'prd',
  prdContent,
  {
    project: 'e-commerce',
    author: 'analyst',
    tags: ['v1.0', 'approved']
  }
)

console.log('Document ID:', doc.id)
console.log('Version:', doc.version)
```

### Retrieving Documents

```typescript
// Get latest version
const prd = await registry.getDocument('prd')

// Get specific version
const prdV1 = await registry.getDocument('prd', 1)

// List all documents
const docs = await registry.listDocuments()
docs.forEach(doc => {
  console.log(`${doc.type}: v${doc.version} (${doc.createdAt})`)
})
```

### Document Types

| Type | Description |
|------|-------------|
| `product-brief` | Strategic vision document |
| `prd` | Product Requirements Document |
| `ux-design` | UX specifications |
| `architecture` | Technical architecture |
| `epics` | Epic definitions |
| `story` | User stories |
| `project-context` | Project-wide context |

## File Storage

Documents are persisted to the filesystem:

```
_ai1st-output/
├── document-index.json     # Document metadata index
├── product-brief/
│   ├── v1.md
│   └── v2.md
├── prd/
│   └── v1.md
└── architecture/
    └── v1.md
```

## Configuration

```typescript
const config = {
  contextCascade: {
    enabled: true,
    outputDir: '_ai1st-output',
    autoLoad: true  // Auto-load context in workflows
  }
}
```

## Integration with WorkflowEngine

When `autoLoad` is enabled, workflows automatically receive context:

```typescript
const engine = new WorkflowEngine(registry, {
  contextCascade: { enabled: true, autoLoad: true }
})

// Context is automatically loaded
const result = await engine.execute('create-architecture', {
  task: 'Design system architecture'
})
// PRD and UX Design are available to the architect agent
```

## Best Practices

1. **Register documents immediately:**
   - Save outputs right after generation
   - Enables downstream workflows to access them

2. **Use consistent naming:**
   - Stick to standard document types
   - Use metadata for project-specific info

3. **Version important changes:**
   - Each registration creates a new version
   - Previous versions remain accessible

4. **Check dependencies before execution:**
   ```typescript
   const missing = await cascade.getMissingDependencies('create-epics')
   if (missing.length > 0) {
     console.log('Missing:', missing.join(', '))
   }
   ```

## Related

- [Document Sharding](../guides/document-sharding.md)
- [Elicitation](./elicitation.md)
- [Workflows](./workflows.md)
