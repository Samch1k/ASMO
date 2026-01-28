# BMad Analysis Examples

## Example 1: Performance Bottleneck Detection

**Scenario**: Workflow completed in 18 minutes, slower than 12-minute average

**Metrics Input**:
```json
{
  "workflowId": "abc-123",
  "workflowName": "complete_feature_lifecycle",
  "totalDurationMs": 1080000,
  "success": true,
  "steps": [
    {
      "stepName": "architect",
      "durationMs": 420000,
      "agentConfidence": 0.75,
      "retries": 2
    },
    {
      "stepName": "developer",
      "durationMs": 180000,
      "agentConfidence": 0.92,
      "retries": 0
    }
  ]
}
```

**Analysis Output**:
```json
{
  "overallAssessment": "Workflow 50% slower than average due to architect bottleneck with 2 retries",
  "recommendations": [
    {
      "priority": "high",
      "category": "performance",
      "title": "Reduce architect timeout from 30m to 10m",
      "description": "Architect step took 7 minutes but has 30m timeout. Retries suggest transient failures, not complex work.",
      "impact": "Faster failure detection, reduce wasted time on hung operations by ~35%",
      "effort": "low",
      "implementation": "Update .cursor/config/orchestration/workflows.json: 'architect.timeout': '10m'"
    },
    {
      "priority": "high",
      "category": "quality",
      "title": "Investigate architect retry causes",
      "description": "2 retries on architect suggest MCP tool failures or unclear requirements",
      "impact": "Eliminate retries = 6-8 minutes saved per workflow",
      "effort": "medium",
      "implementation": "Check logs for 'ECONNREFUSED' or 'timeout' errors; validate MCP connections"
    }
  ],
  "insights": {
    "bottlenecks": ["architect step: 7 min (39% of total time)"],
    "opportunities": ["Parallel execution: developer + ui_developer saved 3 min"],
    "risks": ["High retry rate (2 in architect) suggests instability"]
  },
  "nextSteps": [
    "Review architect agent logs for retry root causes",
    "Consider reducing timeout to 10m",
    "Add health checks before architect execution"
  ]
}
```

---

## Example 2: Successful Optimized Workflow

**Scenario**: Workflow completed in 12 minutes after optimization

**Metrics Input**:
```json
{
  "workflowId": "xyz-789",
  "workflowName": "complete_feature_lifecycle",
  "totalDurationMs": 720000,
  "success": true,
  "optimizationsApplied": [
    "parallel_execution: developer + ui_developer",
    "timeout_adjustment: architect 30m -> 10m"
  ],
  "steps": [
    {
      "stepName": "architect",
      "durationMs": 240000,
      "agentConfidence": 0.88,
      "retries": 0
    },
    {
      "stepName": "developer",
      "durationMs": 180000,
      "agentConfidence": 0.95,
      "retries": 0,
      "parallelWith": "ui_developer"
    }
  ]
}
```

**Analysis Output**:
```json
{
  "overallAssessment": "Excellent execution! 33% faster than baseline. Optimizations working as expected.",
  "recommendations": [
    {
      "priority": "medium",
      "category": "process",
      "title": "Consolidate validation steps",
      "description": "Requirements validation and design validation have similar patterns. Consider merge.",
      "impact": "Save 2-3 minutes per workflow (15% improvement)",
      "effort": "medium",
      "implementation": "Create unified validator agent with phase-specific rules"
    },
    {
      "priority": "low",
      "category": "monitoring",
      "title": "Add confidence score trending",
      "description": "Agent confidence consistently high (>0.85). Track trends to detect degradation.",
      "impact": "Early warning system for workflow quality issues",
      "effort": "low",
      "implementation": "Add confidence_trend field to metrics dashboard"
    }
  ],
  "insights": {
    "bottlenecks": ["None identified"],
    "opportunities": [
      "Developer + UI Developer parallel execution saved ~3 min",
      "Timeout optimization prevented hang scenarios"
    ],
    "risks": ["None identified"]
  },
  "nextSteps": [
    "Monitor this optimized configuration for 10+ runs",
    "Consider applying validation consolidation",
    "Document optimization patterns for other workflows"
  ]
}
```

---

## Example 3: Failed Workflow Analysis

**Scenario**: Workflow failed during testing phase

**Metrics Input**:
```json
{
  "workflowId": "fail-456",
  "workflowName": "complete_feature_lifecycle",
  "totalDurationMs": 480000,
  "success": false,
  "failedAtStep": "tester",
  "steps": [
    {
      "stepName": "tester",
      "durationMs": 120000,
      "agentConfidence": 0.45,
      "retries": 3,
      "error": "Test execution timeout"
    }
  ]
}
```

**Analysis Output**:
```json
{
  "overallAssessment": "Critical failure: Tester agent failed after 3 retries due to timeout. Low confidence (0.45) indicates test setup issues.",
  "recommendations": [
    {
      "priority": "critical",
      "category": "quality",
      "title": "Fix test environment setup",
      "description": "Tester timeout after 2 min with low confidence suggests missing dependencies or broken test setup",
      "impact": "Eliminate workflow failures, restore 80%+ success rate",
      "effort": "high",
      "implementation": "Check: 1) Test DB available 2) Test data seeded 3) Required services running"
    },
    {
      "priority": "high",
      "category": "process",
      "title": "Add pre-test validation checkpoint",
      "description": "Validate test environment before running tester agent",
      "impact": "Fail fast if environment broken, save 8-10 minutes per failed run",
      "effort": "medium",
      "implementation": "Add health-check step before tester in workflows.json"
    },
    {
      "priority": "high",
      "category": "monitoring",
      "title": "Alert on low confidence scores",
      "description": "Confidence <0.50 is red flag. Set up alerts for early detection.",
      "impact": "Faster incident response, reduce MTTR",
      "effort": "low",
      "implementation": "Add threshold check in MetricsCollector: if confidence < 0.5, log warning"
    }
  ],
  "insights": {
    "bottlenecks": ["Test execution timeout"],
    "opportunities": ["Pre-validation can prevent wasted execution time"],
    "risks": [
      "Test environment instability",
      "No graceful degradation for test failures",
      "3 retries = 6+ minutes wasted on each failure"
    ]
  },
  "nextSteps": [
    "URGENT: Fix test environment (check DB, services, data)",
    "Add health check before testing phase",
    "Implement confidence score monitoring",
    "Consider reducing max retries to 2 for faster failure"
  ]
}
```

---

## Example 4: Usage in CLI

### Analyze Latest Workflow
```bash
$ /bmad-analyze latest

🔍 Analyzing workflow: complete_feature_lifecycle (abc-123)
📊 Duration: 14m 28s
✅ Status: Success
📈 Optimizations applied: 2

[Claude analyzes metrics...]

✅ Analysis complete!

Key Findings:
  ✅ Workflow 35% faster than baseline
  ⚠️  Architect confidence declined (0.88 → 0.75)
  💡 3 high-priority recommendations generated

Enhanced report saved to:
  docs/retrospectives/2026-01-26-complete-feature-lifecycle.md
```

### Focus on Performance
```bash
$ /bmad-analyze latest --focus performance

🔍 Focusing on: Performance optimization
📊 Analyzing execution timings...

Top Performance Insights:
  1. Parallel execution saved 3m 12s (22%)
  2. Architect timeout reduction saved 1m 45s (12%)
  3. Bottleneck: code_reviewer (4m 20s, 30% of total)

Recommendations:
  🔴 HIGH: Parallelize code_reviewer with tester
  🟠 MEDIUM: Cache common validation patterns
  🟡 LOW: Add timeout for code_reviewer (currently unlimited)
```

---

## Common Patterns Detected

### Pattern 1: Timeout Too High
**Symptom**: Step duration much shorter than timeout (e.g., 2m duration, 30m timeout)
**Recommendation**: Reduce timeout to 150% of max observed duration
**Impact**: Faster failure detection, reduce wasted compute

### Pattern 2: High Retry Rate
**Symptom**: >20% of executions require retries
**Recommendation**: Investigate root cause (MCP failures, unclear requirements)
**Impact**: Eliminate retries = 30-40% time savings

### Pattern 3: Sequential Execution Opportunity
**Symptom**: Two independent steps running sequentially
**Recommendation**: Enable parallel execution
**Impact**: 40-50% time reduction for those steps

### Pattern 4: Low Agent Confidence
**Symptom**: Confidence score <0.70
**Recommendation**: Improve skill matching, requirements clarity, or agent prompts
**Impact**: Better output quality, fewer downstream issues

### Pattern 5: Validation Duplication
**Symptom**: Multiple validators checking similar things
**Recommendation**: Consolidate validation logic
**Impact**: 15-20% faster validation, cleaner code

---

## Integration Example

### In your workflow execution script:

```typescript
import { WorkflowEngine } from './.cursor/lib/orchestration/workflow-engine.js'

const engine = new WorkflowEngine(...)
await engine.initialize()

const result = await engine.executeWorkflow(workflow, context)

if (!result.success) {
  console.log('❌ Workflow failed. Analyzing...')
  // Metrics automatically saved, ready for analysis
}

console.log('💡 For detailed AI insights, run:')
console.log('   /bmad-analyze', result.workflowId)
```

### In RetrospectiveAgent:

```typescript
async generateRetrospective(metrics: WorkflowMetrics): Promise<RetrospectiveReport> {
  // Generate basic recommendations
  const basic = this.generateBasicRecommendations(metrics)

  if (!this.anthropic) {
    // Save for Claude CLI analysis
    await this.saveMetricsForAnalysis(metrics)
    console.log('💡 [BMad] Run: /bmad-analyze latest for AI insights')

    return {
      ...basic,
      aiInsightsAvailable: true,
      analysisCommand: '/bmad-analyze latest'
    }
  }

  // Use API if available
  return await this.generateWithLLM(metrics)
}
```
