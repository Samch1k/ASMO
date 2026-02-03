---
name: "API Endpoint Creation"
description: "Create production-ready API endpoints with architecture decisions, implementation, validation, and testing. Includes ADR creation, code writing, schema validation, unit tests, and integration tests. Use when: adding new API endpoints, creating RESTful routes, building backend APIs. Keywords: API, endpoint, REST, backend"
---

# API Endpoint Creation

## Overview

Composite skill for creating production-quality API endpoints following best practices. Combines architectural decision-making, implementation, validation, and comprehensive testing.

## Process

1. **Architecture Decision** (ADR)
   - Document endpoint purpose and design choices
   - Define request/response contracts
   - Choose status codes and error handling approach

2. **Implementation**
   - Write endpoint handler code
   - Add request validation (schemas)
   - Implement error handling
   - Add logging and monitoring

3. **Testing**
   - Unit tests for handler logic
   - Integration tests for full request/response cycle
   - Edge case and error scenario testing

4. **Validation**
   - OpenAPI/Swagger documentation
   - Security review (auth, input validation)
   - Performance testing

## Combines Skills

- adr_creation
- code_writing
- typescript_expert
- integration
- unit_testing

## When to Use

- Creating new REST API endpoints
- Adding GraphQL resolvers
- Building backend routes

**Suitable for**: All API development tasks

## Examples

See [EXAMPLES.md](references/EXAMPLES.md) for detailed examples.

---

**Metadata:**
- Category: development
- Complexity: intermediate
- Estimated Time: 2-4h
- Confidence Threshold: 0.8
