# Workflow Catalog

AI1st includes **12 production-ready workflows** for common development tasks.

## Overview

| # | Workflow | Category | Time | Agents |
|---|----------|----------|------|--------|
| 1 | [🐛 Bug Fix Workflow](./1-bug_fix_workflow.md) | Quick Fixes | 1h 5m | 3 |
| 10 | [🔌 API Design](./10-api_design.md) | API Design | 6h 30m | 4 |
| 2 | [✨ Full Feature Implementation](./2-feature_implementation_full.md) | Feature Development | 2h 25m | 6 |
| 2 | [🎨 UI Component Library Development](./2-ui_component_library.md) | Feature Development | 1h 20m | 3 |
| 3 | [🧪 Multi-Layer Testing](./3-comprehensive_testing.md) | Quality Assurance | 35m | 3 |
| 3 | [📊 Performance Investigation & Optimization](./3-performance_investigation.md) | Quality Assurance | 1h 35m | 4 |
| 4 | [🔧 Advanced Bug Fix](./4-advanced_bug_fix.md) | Bug Fixing | 3h 20m | 5 |
| 5 | [♻️ Code Refactoring](./5-code_refactoring.md) | Refactoring | 3h 30m | 4 |
| 6 | [⚡ Performance Optimization](./6-performance_optimization.md) | Performance | 3h 50m | 4 |
| 7 | [🔒 Security Audit](./7-security_audit.md) | Security | 6h | 4 |
| 8 | [🏗️ Architecture Design](./8-architecture_design.md) | Architecture | 6h | 3 |
| 9 | [💾 Database Migration](./9-database_migration.md) | Database | 6h+ (depends on data size) | 4 |

## By Category


### Quick Fixes

- [🐛 Bug Fix Workflow](./1-bug_fix_workflow.md) - Debug → Fix → Test pipeline for bug fixes...

### API Design

- [🔌 API Design](./10-api_design.md) - Design REST/GraphQL API contracts with best practices...

### Feature Development

- [✨ Full Feature Implementation](./2-feature_implementation_full.md) - Complete feature lifecycle: Design → Implement → Test → Depl...
- [🎨 UI Component Library Development](./2-ui_component_library.md) - UX-first component development: Design UX → Implement UI → T...

### Quality Assurance

- [🧪 Multi-Layer Testing](./3-comprehensive_testing.md) - Parallel unit + E2E + performance tests before deployment...
- [📊 Performance Investigation & Optimization](./3-performance_investigation.md) - Parallel analysis by Debugger + Optimizer, then Developer im...

### Bug Fixing

- [🔧 Advanced Bug Fix](./4-advanced_bug_fix.md) - Comprehensive bug resolution with root cause analysis and pr...

### Refactoring

- [♻️ Code Refactoring](./5-code_refactoring.md) - Systematic code quality improvement while maintaining functi...

### Performance

- [⚡ Performance Optimization](./6-performance_optimization.md) - Systematic performance analysis and improvement workflow...

### Security

- [🔒 Security Audit](./7-security_audit.md) - Comprehensive security assessment and vulnerability mitigati...

### Architecture

- [🏗️ Architecture Design](./8-architecture_design.md) - Comprehensive system architecture design and documentation...

### Database

- [💾 Database Migration](./9-database_migration.md) - Safe database schema changes and data migration workflow...

## Complexity Levels

Workflows are automatically selected based on task complexity:

| Level | Score | Recommended Workflows |
|-------|-------|----------------------|
| Trivial | 0-20 | Quick Flow (YOLO Mode) |
| Simple | 21-40 | Bug Fix, Quick Flow |
| Medium | 41-60 | Feature Development, Refactoring |
| Complex | 61-80 | Security Audit, API Design |
| Enterprise | 81-100 | Architecture Design, Database Migration |

## See Also

- [Workflow Concepts](../../concepts/workflows.md)
- [Adaptive Workflow Selection](../../guides/adaptive-workflow.md)
- [Creating Custom Workflows](../../guides/custom-workflows.md)
