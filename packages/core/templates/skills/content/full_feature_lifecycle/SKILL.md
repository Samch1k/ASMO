---
name: "Full Feature Lifecycle"
description: "Complete end-to-end feature development from requirements gathering through deployment and monitoring. Combines requirements analysis, design, planning, implementation, testing, and deployment phases into a cohesive workflow. Use when: implementing complete features from scratch, running full SDLC for new functionality. Keywords: full lifecycle, end-to-end, complete workflow"
---

# Full Feature Lifecycle

## Overview

This composite skill orchestrates the complete software development lifecycle for a feature, coordinating multiple specialized skills across six distinct phases. It ensures systematic progression from initial requirements through production deployment.

## 🔄 Relationship to BMAD Workflows

This skill provides **planning guidance** for feature development. For **automated execution**, use:

```bash
pnpm workflow:run --workflow complete_feature_lifecycle --task "Your task"
```

**Use this skill when**:
- You want to understand the SDLC phases
- You need guidance on what to do in each phase
- You're planning manually or customizing the flow

**Use the workflow when**:
- You want automated agent orchestration
- You have a clear task ready to implement
- You want metrics and retrospective analysis

**They work together**: Use this skill to plan, then execute with the workflow.

**Automatic workflow matching**: Simply describe your task with keywords like "полный цикл" or "complete feature" and the system will automatically trigger the appropriate workflow.

## Phases

### 1. Requirements Phase
- Gather and validate requirements
- Create user stories with acceptance criteria
- Stakeholder alignment and prioritization

### 2. Design Phase
- System architecture and design
- API contracts and data modeling
- UX/UI wireframes and flows

### 3. Planning Phase
- Task breakdown and estimation
- Sprint planning and resource allocation
- Risk assessment

### 4. Implementation Phase
- Code writing (backend + frontend)
- Component development
- Integration

### 5. Testing Phase
- Unit testing
- E2E testing
- Performance validation

### 6. Deployment Phase
- CI/CD pipeline execution
- Deployment to staging/production
- Post-deploy monitoring

## Combines Skills

- requirements
- user_stories
- system_design
- adr_creation
- sprint_planning
- code_writing
- component_styling
- unit_testing
- e2e_testing
- deployment
- monitoring

## When to Use

Use this skill when:

- Starting a completely new feature
- Need structured approach from requirements to deployment
- Want to ensure all phases are properly executed
- Working on features requiring multiple disciplines (backend, frontend, testing, ops)

**Suitable for**: Medium to large features requiring 1+ weeks of development

## Quick Start

1. Begin with requirements gathering
2. Validate requirements with stakeholders (approval checkpoint)
3. Design system architecture
4. Validate design (approval checkpoint)
5. Plan implementation
6. Execute implementation (parallel: backend + frontend)
7. Run comprehensive testing (parallel: tests + performance)
8. Deploy to staging, then production
9. Monitor post-deployment health

## Examples

See [EXAMPLES.md](references/EXAMPLES.md) for detailed examples.

---

**Metadata:**
- Category: superpowers_workflows
- Complexity: expert
- Estimated Time: 1-2 weeks
- Confidence Threshold: 0.9
