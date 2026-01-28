---
"name": "BMad Workflow Analysis"
"description": "Analyze BMad workflow execution metrics and generate enhanced AI-powered recommendations for optimization. Reads metrics from database or files, identifies patterns, and provides actionable insights. Use when: analyzing workflow performance, optimizing BMad workflows. Keywords: bmad, workflow analysis, performance optimization, retrospective"
---

# BMad Workflow Analysis

## Overview

Analyzes BMad (Breakthrough Method of Agile AI-Driven Development) workflow execution metrics to generate enhanced AI-powered recommendations. This skill replaces API-based LLM calls with free Claude CLI analysis.

## Quick Start

```bash
# Analyze latest workflow
/bmad-analyze latest

# Analyze specific workflow by ID
/bmad-analyze <workflow-id>

# Analyze with custom focus
/bmad-analyze latest --focus performance
```

## When to Use

Use this skill when:

- A BMad workflow has completed and needs analysis
- You see the message "💡 Want AI insights? Run: /bmad-analyze latest"
- You want deeper insights than rule-based recommendations
- Optimizing workflow performance and agent efficiency

**Suitable for**: BMad-enabled projects with workflow metrics

## What This Skill Does

1. **Reads Workflow Metrics**
   - Loads execution data from database or saved files
   - Extracts step timings, agent performance, confidence scores
   - Identifies bottlenecks and error patterns

2. **Analyzes Patterns**
   - Detects slow steps and agents
   - Identifies retry patterns and failure modes
   - Finds parallelization opportunities
   - Compares against historical data

3. **Generates Recommendations**
   - Priority-ranked actionable improvements
   - Effort estimates (low/medium/high)
   - Impact predictions (time savings, success rate improvements)
   - Specific implementation guidance

4. **Updates Reports**
   - Enhances existing retrospective reports
   - Adds AI insights section
   - Saves enhanced recommendations

## Input Format

The skill expects one of:

- **`latest`** - Analyzes most recent workflow execution
- **`<workflow-id>`** - Analyzes specific workflow by UUID
- **`--focus <area>`** - Optional focus area (performance, quality, cost, agents)

## Output Format

Enhanced recommendations in JSON format:

```json
{
  "overallAssessment": "string",
  "recommendations": [
    {
      "priority": "critical|high|medium|low",
      "category": "performance|quality|cost|process",
      "title": "string",
      "description": "string",
      "impact": "string",
      "effort": "low|medium|high",
      "implementation": "string"
    }
  ],
  "insights": {
    "bottlenecks": ["string"],
    "opportunities": ["string"],
    "risks": ["string"]
  },
  "nextSteps": ["string"]
}
```

## Required Tools

This skill requires access to:

- **filesystem** - Read metrics files and retrospective reports
- **database** (optional) - Query BMad metrics tables if DATABASE_URL set

## Works Well With

This skill can be combined with:

- **bmad-enhance** - Further refine specific recommendations
- **performance-optimization** - Implement performance improvements
- **workflow-design** - Redesign workflow based on insights

## Integration

### In RetrospectiveAgent

When no ANTHROPIC_API_KEY is set:

```typescript
if (!this.anthropic) {
  console.log('⚠️ [BMad] No API key, saving metrics for Claude analysis...')
  await this.saveMetricsForAnalysis(workflowMetrics)
  console.log('💡 [BMad] Run: /bmad-analyze latest for AI insights')
  return this.generateBasicRecommendations(metrics)
}
```

### Saved Metrics Location

Metrics are saved to:
- `.bmad/metrics-<workflow-id>.json` - Full workflow metrics
- `.bmad/analysis-context-<workflow-id>.md` - Human-readable context

## Advanced Features

See [EXAMPLES.md](references/EXAMPLES.md) for:

- Sample analyses
- Common patterns detected
- Real-world recommendations
- Integration examples

---

**Metadata:**
- Category: analysis
- Complexity: intermediate
- Estimated Time: 2-5m
- Confidence Threshold: 0.90
- Success Rate: 95%
