# Document Sharding

Document Sharding automatically splits large markdown documents into manageable sections, making them easier to process by AI agents with context limits.

## Overview

Large documents (PRDs, architecture specs, etc.) often exceed AI context windows. Document Sharding:

- Splits documents by heading level
- Creates an index file with navigation
- Maintains cross-references
- Supports reassembly

## Basic Usage

```typescript
import { DocumentSharder } from '@ai1st/core'

const sharder = new DocumentSharder({
  maxTokensPerFile: 10000,
  splitLevel: 2  // Split at ## headings
})

// Shard a large document
const result = await sharder.shardDocument('/docs/PRD.md')

console.log('Index:', result.indexPath)
console.log('Sections:', result.sectionCount)
console.log('Files:', result.files)
```

## Result Structure

```
Before:
docs/
└── PRD.md (50,000 tokens)

After:
docs/
├── PRD.md → PRD/
└── PRD/
    ├── index.md           # Overview + navigation
    ├── 01-introduction.md
    ├── 02-requirements.md
    ├── 03-user-stories.md
    └── 04-technical-specs.md
```

## Configuration

```typescript
const sharder = new DocumentSharder({
  maxTokensPerFile: 10000,    // Target size per file
  splitLevel: 2,              // Heading level to split (## = 2)
  minTokensPerSection: 500,   // Don't split tiny sections
  includeFrontmatter: true    // Include YAML frontmatter
})
```

### Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `maxTokensPerFile` | 10000 | Maximum tokens per shard |
| `splitLevel` | 2 | Heading level to split at (1=H1, 2=H2, etc.) |
| `minTokensPerSection` | 500 | Minimum section size |
| `includeFrontmatter` | true | Keep YAML frontmatter in shards |

## Methods

### Check if Sharding Needed

```typescript
const needsSharding = await sharder.needsSharding('/docs/large-doc.md')

if (needsSharding) {
  await sharder.shardDocument('/docs/large-doc.md')
}
```

### Get Document Stats

```typescript
const stats = await sharder.getDocumentStats('/docs/PRD.md')

console.log('Estimated tokens:', stats.estimatedTokens)
console.log('Sections:', stats.sectionCount)
console.log('Needs sharding:', stats.needsSharding)
```

### Parse Without Sharding

```typescript
// Parse document into sections (in memory)
const sections = sharder.parseDocument(content, 2)

sections.forEach(section => {
  console.log(`${section.heading}: ${section.estimatedTokens} tokens`)
})
```

### Reassemble Document

```typescript
// Reassemble sharded document
const reassembled = await sharder.reassembleDocument('/docs/PRD/')

// Write back to single file
await fs.writeFile('/docs/PRD-reassembled.md', reassembled)
```

## Index File Format

The generated index file includes:

```markdown
# PRD

> Auto-generated index for sharded document

## Sections

1. [Introduction](./01-introduction.md)
2. [Requirements](./02-requirements.md)
3. [User Stories](./03-user-stories.md)
4. [Technical Specs](./04-technical-specs.md)

## Metadata

- Original file: PRD.md
- Total sections: 4
- Sharded at: 2024-01-15T10:30:00Z
```

## Section File Format

Each section file includes metadata:

```markdown
---
section: 2
heading: Requirements
parent: PRD
prev: 01-introduction.md
next: 03-user-stories.md
---

# Requirements

[Section content...]
```

## Integration with Context Cascade

Document Sharding works with Context Cascade to load specific sections:

```typescript
import { ContextCascade, DocumentRegistry, DocumentSharder } from '@ai1st/core'

const registry = new DocumentRegistry()
const sharder = new DocumentSharder()
const cascade = new ContextCascade(registry)

// Register sharded document
const stats = await sharder.getDocumentStats(prdPath)
if (stats.needsSharding) {
  const result = await sharder.shardDocument(prdPath)

  // Register each section separately
  for (const file of result.files) {
    const content = await fs.readFile(file, 'utf-8')
    await registry.registerDocument('prd-section', content, {
      section: file,
      parent: 'prd'
    })
  }
}
```

## CLI Usage

```bash
# Check if sharding needed
npx ai1st shard --check docs/PRD.md

# Shard a document
npx ai1st shard docs/PRD.md

# Shard with custom settings
npx ai1st shard docs/PRD.md --level 3 --max-tokens 5000

# Reassemble
npx ai1st shard --reassemble docs/PRD/
```

## Best Practices

1. **Choose appropriate split level:**
   - `2` (##) for most documents
   - `3` (###) for very detailed docs
   - `1` (#) for collections of independent sections

2. **Set reasonable token limits:**
   - 10,000 for general use
   - 5,000 for agents with smaller context
   - 20,000 for comprehensive analysis

3. **Preserve context:**
   - Include section navigation (prev/next)
   - Maintain parent document reference
   - Keep cross-references intact

4. **Handle edge cases:**
   - Very short sections may be merged
   - Code blocks are kept together
   - Tables are not split mid-row

## Limitations

- Inline links to sections need updating after sharding
- Nested heading hierarchies may require multiple passes
- Very large code blocks may exceed section limits

## Related

- [Context Cascade](../concepts/context-cascade.md)
- [Document Registry](../concepts/context-cascade.md#document-registry)
- [Tech Writer Agent](../reference/agents/tech-writer.md)
