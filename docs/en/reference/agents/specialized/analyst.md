# Analyst Agent

Strategic analysis and research specialist for market research, competitive analysis, and brainstorming.

## Overview

The Analyst Agent performs strategic analysis tasks including market research, competitive analysis, SWOT analysis, and creative brainstorming sessions. It generates structured analysis documents and recommendations.

## Capabilities

| Skill | Description |
|-------|-------------|
| `analysis` | General strategic analysis |
| `research` | Market and industry research |
| `brainstorming` | Creative ideation sessions |
| `market_analysis` | Market size, trends, segments |
| `competitive_analysis` | Competitor strengths/weaknesses |
| `strategic_planning` | Long-term strategy development |
| `product_brief_creation` | Product vision documents |
| `trend_analysis` | Industry trend identification |

## Analysis Types

### Market Analysis
Analyzes market size, growth, target segments, trends, and entry barriers.

### Competitive Analysis
Evaluates direct/indirect competitors, strengths, weaknesses, and differentiation opportunities.

### Brainstorming
Generates creative ideas with impact/feasibility assessment and categorization.

### Product Brief
Creates strategic product vision documents with problem statement, target users, and success metrics.

### SWOT Analysis
Analyzes Strengths, Weaknesses, Opportunities, and Threats with strategic implications.

## Configuration

```yaml
# agents.yaml
analyst:
  id: analyst
  name: Analyst
  model_preference: sonnet
  role:
    id: analyst
    seniority: senior
    expertise:
      - market_research
      - strategic_analysis
      - competitive_intelligence
```

## Usage

```typescript
import { AnalystAgent } from '@ai1st/core'

const analyst = new AnalystAgent()

const result = await analyst.execute({
  task: 'Perform competitive analysis for our SaaS product',
  context: { industry: 'B2B Software' }
})

console.log(result.context.analysis.competitors)
console.log(result.context.analysis.recommendations)
```

## Output Artifacts

The Analyst Agent produces structured analysis documents in markdown format:

- Market Analysis Report
- Competitive Landscape Analysis
- Brainstorming Session Summary
- Product Brief Document
- SWOT Analysis Report

## MCP Integrations

- **Memory MCP**: Stores insights and analysis results for future reference
- **Context7 MCP**: Researches market data and best practices
- **Filesystem MCP**: Reads existing documents and writes analysis reports

## See Also

- [Custom Agents Guide](/docs/en/guides/custom-agents.md)
- [Product Owner Agent](./product-owner.md)
- [Business Analyst Agent](./business-analyst.md)
