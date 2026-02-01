# Agent Catalog

AI1st includes **24 agents** organized into three categories.

## Overview

| Category | Count | Description |
|----------|-------|-------------|
| [Core](#core-agents) | 6 | Essential development agents |
| [Specialized](#specialized-agents) | 18 | Domain-specific roles |
| [Validation](#validation-agents) | 0 | Quality and control agents |

## Core Agents

Essential agents for standard development tasks.

| Agent | Description | Type |
|-------|-------------|------|
| [🏗️ Architect](./core/architect.md) | System architecture and design decisions. Creates architectu... | reasoning |
| [👨‍💻 Developer](./core/developer.md) | Feature implementation and code generation. Writes productio... | execution |
| [🐛 Debugger](./core/debugger.md) | Bug investigation and root cause analysis. Diagnoses errors,... | hybrid |
| [⚡ Optimizer](./core/optimizer.md) | Performance analysis and optimization. Profiles code perform... | hybrid |
| [🧪 Tester](./core/tester.md) | Test creation and quality assurance. Creates unit tests, int... | execution |
| [🚀 DevOps](./core/devops.md) | Deployment, CI/CD, and infrastructure management. Handles de... | execution |

## Specialized Agents

Agents for specific domains and tasks.

| Agent | Description | Domain |
|-------|-------------|--------|
| [🎨 UI Developer](./specialized/ui-developer.md) | Frontend and UI component development specialist. ... | UI/Frontend Development |
| [🎭 UX Designer](./specialized/ux-designer.md) | User experience design and prototyping specialist.... | UX Design |
| [📊 Business Analyst](./specialized/business-analyst.md) | Requirements gathering and business analysis speci... | Business Analysis |
| [📋 Project Manager](./specialized/project-manager.md) | Project planning and coordination specialist. Plan... | Project Management |
| [🎯 Product Owner](./specialized/product-owner.md) | Product vision and prioritization specialist. Defi... | Product Management |
| [🔄 Scrum Master](./specialized/scrum-master.md) | Agile ceremonies and sprint management specialist.... | Agile/Scrum Management |
| [🔒 Security Specialist](./specialized/security-specialist.md) | Security audit and vulnerability assessment specia... | Security & Compliance |
| [📈 Performance Engineer](./specialized/performance-engineer.md) | Performance profiling and optimization specialist.... | Performance Engineering |
| [💾 Data Architect](./specialized/data-architect.md) | Database schema design and data migration speciali... | Database Architecture |
| [🔌 API Designer](./specialized/api-designer.md) | RESTful API and OpenAPI specification specialist. ... | API Design |
| [✅ Design Validator](./specialized/design-validator.md) | Architecture and API design validation specialist.... | System Architecture Validation |
| [🔀 Merge Coordinator](./specialized/merge-coordinator.md) | Parallel agent output consolidation specialist. Me... | Parallel Output Consolidation |
| [👁️ Post-Deploy Monitor](./specialized/post-deploy-monitor.md) | Deployment health and smoke testing specialist. Mo... | Deployment Monitoring |
| [📝 Requirements Validator](./specialized/requirements-validator.md) | Requirements quality assurance specialist. Validat... | Requirements Quality Assurance |
| [📊 Analyst](./specialized/analyst.md) | Strategic analysis, market research, brainstorming, SWOT analysis | Strategic Analysis |
| [📝 Tech Writer](./specialized/tech-writer.md) | Documentation specialist for API docs, user guides, READMEs | Technical Documentation |
| [🧪 Test Architect (TEA)](./specialized/test-architect.md) | Test strategy, risk-based testing, quality gates, release readiness | Testing & QA |
| [👁️ Adversarial Reviewer](./specialized/adversarial-reviewer.md) | Critical code review that MUST find issues, escalating scrutiny | Code Review |

## Validation Agents

Agents for quality assurance and control.

| Agent | Description | Type |
|-------|-------------|------|


## Role Types

- **Reasoning** - Agents that analyze and make decisions
- **Execution** - Agents that perform concrete actions
- **Hybrid** - Combination of analysis and execution

## See Also

- [Agent Concepts](../../concepts/agents.md)
- [Creating Custom Agents](../../guides/custom-agents.md)
