# Document Registry

The Document Registry provides centralized storage and versioning for all project documents used in the Context Cascade system.

## Overview

Document Registry:
- Stores documents with version history
- Provides metadata tracking (author, timestamps, tags)
- Persists to filesystem in `_ai1st-output/` directory
- Integrates with Context Cascade for automatic loading

## Basic Usage

```typescript
import { DocumentRegistry } from '@ai1st/core'

// Create registry
const registry = new DocumentRegistry({
  outputDir: '_ai1st-output'
})

// Register a document
const doc = await registry.registerDocument(
  'prd',
  prdContent,
  {
    author: 'analyst',
    project: 'my-project',
    tags: ['v1.0', 'draft']
  }
)

console.log('Document ID:', doc.id)
console.log('Version:', doc.version)
console.log('Created:', doc.createdAt)
```

## Document Types

| Type | Description | Typical Workflow |
|------|-------------|------------------|
| `product-brief` | Strategic vision | `create-product-brief` |
| `prd` | Product Requirements | `create-prd` |
| `ux-design` | UX specifications | `create-ux-design` |
| `architecture` | Technical design | `create-architecture` |
| `epics` | Epic definitions | `create-epics-and-stories` |
| `story` | User stories | `create-story` |
| `project-context` | Project-wide settings | Manual |

## Registering Documents

### Basic Registration

```typescript
await registry.registerDocument('prd', content)
```

### With Metadata

```typescript
await registry.registerDocument('architecture', content, {
  author: 'architect-agent',
  project: 'e-commerce',
  tags: ['approved', 'v2.0'],
  custom: {
    reviewedBy: 'tech-lead',
    approvedAt: new Date().toISOString()
  }
})
```

## Retrieving Documents

### Get Latest Version

```typescript
const prd = await registry.getDocument('prd')
if (prd) {
  console.log('Content:', prd.content)
  console.log('Version:', prd.version)
}
```

### Get Specific Version

```typescript
const prdV1 = await registry.getDocument('prd', 1)
const prdV2 = await registry.getDocument('prd', 2)
```

### Get Multiple Documents

```typescript
const docs = await registry.getDocuments(['prd', 'architecture', 'ux-design'])

for (const [type, doc] of docs) {
  if (doc) {
    console.log(`${type}: v${doc.version}`)
  } else {
    console.log(`${type}: not found`)
  }
}
```

### List All Documents

```typescript
const summary = await registry.listDocuments()

summary.forEach(doc => {
  console.log(`${doc.type}: v${doc.version} (${doc.createdAt})`)
})
```

## Version History

Each registration creates a new version:

```typescript
// Version 1
await registry.registerDocument('prd', 'Initial PRD content')

// Version 2
await registry.registerDocument('prd', 'Updated PRD with feedback')

// Version 3
await registry.registerDocument('prd', 'Final PRD after review')

// Get version history
const history = await registry.getVersionHistory('prd')
console.log('Versions:', history.length) // 3
```

## Checking Document Existence

```typescript
const hasPRD = await registry.hasDocument('prd')
const hasArch = await registry.hasDocument('architecture')

if (!hasArch) {
  console.log('Architecture document not found')
}
```

## File Storage Structure

Documents are persisted to the filesystem:

```
_ai1st-output/
├── document-index.json      # Metadata index
├── product-brief/
│   └── v1.md
├── prd/
│   ├── v1.md
│   └── v2.md
├── architecture/
│   └── v1.md
└── epics/
    └── v1.md
```

### Index File Format

```json
{
  "prd": {
    "type": "prd",
    "versions": [
      {
        "version": 1,
        "path": "prd/v1.md",
        "createdAt": "2024-01-15T10:30:00Z",
        "author": "analyst"
      },
      {
        "version": 2,
        "path": "prd/v2.md",
        "createdAt": "2024-01-16T14:00:00Z",
        "author": "product-owner"
      }
    ],
    "currentVersion": 2
  }
}
```

## Configuration

```typescript
const registry = new DocumentRegistry({
  outputDir: '_ai1st-output',  // Output directory
  autoSave: true,              // Auto-persist on registration
  maxVersions: 10              // Max versions to keep per document
})
```

## Integration with Context Cascade

Document Registry is the storage backend for Context Cascade:

```typescript
import { ContextCascade, DocumentRegistry } from '@ai1st/core'

const registry = new DocumentRegistry()
const cascade = new ContextCascade({ documentRegistry: registry })

// Register documents
await registry.registerDocument('product-brief', briefContent)
await registry.registerDocument('prd', prdContent)

// Load context for workflow
const context = await cascade.loadContextForWorkflow('create-architecture')
// Automatically loads: product-brief, prd, ux-design
```

## Error Handling

```typescript
try {
  const doc = await registry.getDocument('nonexistent')
  if (!doc) {
    console.log('Document not found')
  }
} catch (error) {
  console.error('Registry error:', error.message)
}
```

## Best Practices

1. **Register immediately after generation:**
   ```typescript
   const prd = await analyst.generatePRD(task)
   await registry.registerDocument('prd', prd)
   ```

2. **Use meaningful metadata:**
   ```typescript
   await registry.registerDocument('architecture', content, {
     author: 'architect-agent',
     tags: ['microservices', 'approved'],
     project: 'payment-service'
   })
   ```

3. **Check dependencies before workflows:**
   ```typescript
   const missing = await cascade.getMissingDependencies('create-epics')
   if (missing.length > 0) {
     console.log('Missing documents:', missing.join(', '))
   }
   ```

4. **Clean up old versions periodically:**
   ```typescript
   await registry.pruneVersions('prd', { keepLast: 5 })
   ```

## Related

- [Context Cascade](../concepts/context-cascade.md)
- [Document Sharding](./document-sharding.md)
- [Workflows](../concepts/workflows.md)
