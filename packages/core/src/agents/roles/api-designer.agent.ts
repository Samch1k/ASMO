import { BaseAgent } from "../base-agent"
import { AgentState } from "../types"

/**
 * API Designer Agent - REST/GraphQL contract design, API standards, OpenAPI specs
 *
 * Capabilities:
 * - RESTful API design and documentation
 * - GraphQL schema design
 * - OpenAPI/Swagger specification generation
 * - API versioning strategy
 * - Request/response validation
 * - Error handling standards
 * - Rate limiting and throttling design
 * - API security best practices
 *
 * MCP Integrations:
 * - GitHub MCP (P0): Review existing API code, create OpenAPI specs
 * - Context7 MCP (P1): Research API design best practices
 * - Memory MCP (P2): Store API design decisions
 */
export class APIDesignerAgent extends BaseAgent {
  constructor() {
    super('api-designer', [
      'api_design',
      'rest_api',
      'graphql_design',
      'openapi_spec',
      'api_versioning',
      'request_validation',
      'response_design',
      'error_handling',
      'api_security',
      'rate_limiting'
    ])
  }

  /**
   * Execute API Designer workflow
   *
   * Process:
   * 1. Analyze existing API code via GitHub MCP
   * 2. Research API design best practices via Context7 MCP
   * 3. Retrieve past API design decisions from Memory MCP
   * 4. Design API endpoints and contracts
   * 5. Generate OpenAPI specification
   * 6. Create implementation guide
   * 7. Store design decisions in Memory MCP
   * 8. Handoff to Developer for implementation
   */
  async execute(state: AgentState): Promise<Partial<AgentState>> {
    this.log('📡 Starting API design workflow...')

    try {
      // STEP 1: Analyze existing API code
      this.log('Analyzing existing API code...')
      const existingAPIs = await this.requestMCP('github', {
        action: 'search_code',
        query: 'path:server/routes/ extension:ts',
        repo: process.env.GITHUB_REPO
      })

      const apiHandlers = await this.requestMCP('github', {
        action: 'search_code',
        query: 'app.get app.post app.put app.delete app.patch',
        repo: process.env.GITHUB_REPO
      })

      // STEP 2: Research API design best practices
      this.log('Researching API design best practices...')
      const bestPractices = await this.requestMCP('context7', {
        action: 'get-library-docs',
        libraryId: '/anthropics/prompt-eng-interactive-tutorial',
        topic: `RESTful API design ${state.task}`,
        tokens: 3000
      })

      // STEP 3: Retrieve past design decisions
      this.log('Retrieving past API design decisions...')
      const pastDecisions = await this.requestMCP('memory', {
        action: 'search_nodes',
        query: state.task,
        type: 'api_design'
      })

      // STEP 4: Design API
      this.log('Designing API endpoints and contracts...')
      const apiDesign = await this.designAPI(state, {
        existingAPIs,
        apiHandlers,
        bestPractices,
        pastDecisions
      })

      // STEP 5: Generate OpenAPI spec
      const openAPISpec = this.extractOpenAPISpec(apiDesign)

      // STEP 6: Create artifacts
      const designDocument = this.createArtifact(
        'documentation',
        this.formatAPIDocument(apiDesign),
        {
          documentType: 'api_design',
          apiType: this.determineAPIType(apiDesign),
          timestamp: new Date().toISOString()
        }
      )

      const openAPIFile = this.createArtifact(
        'code',
        openAPISpec,
        {
          language: 'yaml',
          fileName: 'openapi.yaml',
          timestamp: new Date().toISOString()
        }
      )

      // STEP 7: Store in Memory MCP
      this.log('Storing API design decisions...')
      await this.requestMCP('memory', {
        action: 'create_entities',
        entities: [{
          name: `API Design: ${state.task}`,
          entityType: 'api_design',
          observations: [designDocument.content]
        }]
      })

      // STEP 8: Create result and handoff
      const result = this.createResult('needs_handoff', apiDesign, [
        designDocument,
        openAPIFile
      ])
      result.handoffTo = 'developer'
      result.confidence = 0.9

      this.log('✅ API design complete, handing off to Developer')

      return {
        agentResults: [...state.agentResults, result],
        context: {
          ...state.context,
          apiDesign,
          openAPISpec
        },
        nextAction: 'developer'
      }

    } catch (error) {
      this.log(`Error during execution: ${error}`, 'error')

      const failedResult = this.createResult('failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })

      return {
        agentResults: [...state.agentResults, failedResult],
        nextAction: 'END'
      }
    }
  }

  /**
   * Design API using Claude LLM
   */
  private async designAPI(
    state: AgentState,
    context: {
      existingAPIs: any
      apiHandlers: any
      bestPractices: any
      pastDecisions: any
    }
  ): Promise<string> {
    const systemPrompt = `You are the API Designer for MeatConnect, a B2B marketplace platform.

TECHNOLOGY STACK:
Backend:
- Express.js with TypeScript
- Node.js 20+
- RESTful API architecture
- JWT authentication (via Supabase Auth)
- Zod for request validation
- OpenAPI 3.1 specification
- Rate limiting (express-rate-limit)

Frontend:
- React Query for API calls
- Axios for HTTP client
- TypeScript strict mode

DOMAIN CONTEXT:
- B2B two-sided marketplace (Buyers and Suppliers)
- Core workflows: RFQ, Quotes, Orders, Messaging
- Authentication: Supabase Auth (JWT tokens)
- Real-time: Socket.IO for notifications
- File uploads: Supabase Storage

EXISTING APIs:
${JSON.stringify(context.existingAPIs, null, 2)}

CURRENT API HANDLERS:
${JSON.stringify(context.apiHandlers, null, 2)}

BEST PRACTICES RESEARCH:
${JSON.stringify(context.bestPractices, null, 2)}

PAST API DESIGN DECISIONS:
${JSON.stringify(context.pastDecisions, null, 2)}

TASK:
${state.task}

DESIGN RESTFUL API:

1. **API Overview**
   - Purpose: What problem does this API solve?
   - Target Users: Buyers, Suppliers, Admins?
   - Integration Points: Frontend components, third-party services

2. **Endpoint Design**
   For each endpoint:

   **Endpoint Name**: [Descriptive name]

   \`\`\`
   METHOD /api/v1/resource
   \`\`\`

   - **Method**: GET / POST / PUT / PATCH / DELETE
   - **Path**: /api/v1/resource (follow RESTful conventions)
   - **Description**: What this endpoint does
   - **Authentication**: Required / Optional / Public
   - **Rate Limit**: Requests per minute/hour
   - **Request**:
     - Headers: Authorization, Content-Type, etc.
     - Query Parameters: ?page=1&limit=10
     - Path Parameters: /api/v1/resource/:id
     - Body Schema (JSON):
       \`\`\`typescript
       {
         field: string
         value: number
       }
       \`\`\`
   - **Response**:
     - Status Codes:
       - 200 OK: Success
       - 201 Created: Resource created
       - 400 Bad Request: Validation error
       - 401 Unauthorized: Missing/invalid token
       - 403 Forbidden: Insufficient permissions
       - 404 Not Found: Resource not found
       - 429 Too Many Requests: Rate limit exceeded
       - 500 Internal Server Error: Server error
     - Success Response (200):
       \`\`\`typescript
       {
         data: {
           // resource data
         },
         meta: {
           page: number
           limit: number
           total: number
         }
       }
       \`\`\`
     - Error Response (400):
       \`\`\`typescript
       {
         error: {
           code: "VALIDATION_ERROR"
           message: "Invalid input"
           details: [
             { field: "email", message: "Invalid email format" }
           ]
         }
       }
       \`\`\`
   - **Validation Rules**:
     - Field validations (required, min/max, regex, etc.)
     - Business logic validations
   - **Security Considerations**:
     - Authorization checks (RBAC)
     - Input sanitization
     - Rate limiting
   - **Example Request**:
     \`\`\`bash
     curl -X POST https://api.meatconnect.com/api/v1/resource \\
       -H "Authorization: Bearer <token>" \\
       -H "Content-Type: application/json" \\
       -d '{ "field": "value" }'
     \`\`\`

3. **Resource Relationships**
   - Parent-child relationships
   - Nested routes vs query parameters
   - HATEOAS links (optional)

4. **Pagination Strategy**
   - Cursor-based vs offset-based
   - Default page size: 20 items
   - Max page size: 100 items

5. **Filtering & Sorting**
   - Query parameters: ?filter[status]=active&sort=-created_at
   - Supported operators: eq, ne, gt, lt, contains, in

6. **Versioning Strategy**
   - URL versioning: /api/v1, /api/v2
   - Header versioning (alternative)
   - Deprecation policy

7. **Error Handling**
   Standard error format:
   \`\`\`typescript
   {
     error: {
       code: "ERROR_CODE",
       message: "Human-readable error message",
       details: [] // Optional validation errors
     }
   }
   \`\`\`

   Common error codes:
   - VALIDATION_ERROR: Input validation failed
   - AUTHENTICATION_REQUIRED: Missing or invalid auth token
   - PERMISSION_DENIED: Insufficient permissions
   - RESOURCE_NOT_FOUND: Resource doesn't exist
   - RATE_LIMIT_EXCEEDED: Too many requests
   - INTERNAL_ERROR: Server error

8. **Authentication & Authorization**
   - Token format: JWT (Supabase Auth)
   - Token location: Authorization header (Bearer token)
   - Token expiration: 1 hour (refresh token for renewal)
   - Permission model: RBAC (buyer, supplier, admin roles)

9. **Rate Limiting**
   - Anonymous users: 10 requests/minute
   - Authenticated users: 100 requests/minute
   - Burst limit: 20 requests/second
   - Rate limit headers:
     - X-RateLimit-Limit
     - X-RateLimit-Remaining
     - X-RateLimit-Reset

10. **OpenAPI Specification (v3.1)**
    Generate complete OpenAPI spec:

    \`\`\`yaml
    openapi: 3.1.0
    info:
      title: MeatConnect API
      description: B2B marketplace for meat products
      version: 1.0.0
      contact:
        name: API Support
        email: api@meatconnect.com

    servers:
      - url: https://api.meatconnect.com/api/v1
        description: Production server
      - url: http://localhost:3000/api/v1
        description: Local development server

    components:
      securitySchemes:
        bearerAuth:
          type: http
          scheme: bearer
          bearerFormat: JWT

      schemas:
        Error:
          type: object
          properties:
            error:
              type: object
              properties:
                code:
                  type: string
                message:
                  type: string
                details:
                  type: array
                  items:
                    type: object

    paths:
      /resource:
        get:
          summary: List resources
          security:
            - bearerAuth: []
          parameters:
            - name: page
              in: query
              schema:
                type: integer
                default: 1
            - name: limit
              in: query
              schema:
                type: integer
                default: 20
          responses:
            '200':
              description: Success
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      data:
                        type: array
                        items:
                          type: object
                      meta:
                        type: object

        post:
          summary: Create resource
          security:
            - bearerAuth: []
          requestBody:
            required: true
            content:
              application/json:
                schema:
                  type: object
                  required:
                    - field
                  properties:
                    field:
                      type: string
          responses:
            '201':
              description: Created
            '400':
              description: Validation error
              content:
                application/json:
                  schema:
                    $ref: '#/components/schemas/Error'
    \`\`\`

11. **Testing Strategy**
    - Unit tests: Request validation, business logic
    - Integration tests: Full endpoint testing
    - Load tests: Performance under load
    - Security tests: OWASP API Security Top 10

12. **Documentation**
    - Interactive API docs (Swagger UI)
    - Code examples for common use cases
    - Postman collection
    - SDK generation (optional)

Format as a comprehensive API design document with complete OpenAPI specification.`

    const response = await this.callLLM(systemPrompt, {
      model: 'sonnet',
      temperature: 0.2,
      maxTokens: 4096
    })

    return response.content
  }

  /**
   * Determine API type from design
   */
  private determineAPIType(design: string): string {
    const designLower = design.toLowerCase()

    if (designLower.includes('graphql')) {
      return 'GraphQL'
    } else if (designLower.includes('rest') || designLower.includes('restful')) {
      return 'REST'
    } else {
      return 'REST' // Default
    }
  }

  /**
   * Extract OpenAPI specification from design
   */
  private extractOpenAPISpec(design: string): string {
    // Extract YAML code blocks from design
    const yamlMatch = design.match(/```yaml\n([\s\S]*?)\n```/)
    if (yamlMatch && yamlMatch[1]) {
      return yamlMatch[1].trim()
    }

    // If no YAML block found, return placeholder
    return `openapi: 3.1.0
info:
  title: MeatConnect API
  description: B2B marketplace for meat products
  version: 1.0.0
  contact:
    name: API Support
    email: api@meatconnect.com

servers:
  - url: https://api.meatconnect.com/api/v1
    description: Production server
  - url: http://localhost:3000/api/v1
    description: Local development server

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

paths:
  # TODO: Add API endpoints from design
  # ${design.substring(0, 200).replace(/\n/g, '\n  # ')}...
`
  }

  /**
   * Format API design document
   */
  private formatAPIDocument(design: string): string {
    const timestamp = new Date().toISOString().split('T')[0]

    return `# API Design Document

**Date**: ${timestamp}
**Designer**: API Designer Agent
**API Type**: RESTful API
**Specification**: OpenAPI 3.1
**Base URL**: https://api.meatconnect.com/api/v1

---

## Overview

This document describes the API design, including endpoints, request/response schemas, authentication, and best practices.

---

## Detailed API Design

${design}

---

## Implementation Checklist

Before implementing this API:
- [ ] OpenAPI specification is complete and valid
- [ ] All endpoints follow RESTful conventions
- [ ] Authentication and authorization are properly designed
- [ ] Request validation schemas are defined (Zod)
- [ ] Error responses follow standard format
- [ ] Rate limiting is configured
- [ ] API documentation is generated (Swagger UI)
- [ ] Integration tests are written
- [ ] Security review completed (OWASP API Top 10)

---

**Generated by**: API Designer Agent (ASMO Multi-Agent System)
**Timestamp**: ${new Date().toISOString()}

**Next Steps**:
1. Review API design with team and stakeholders
2. Validate OpenAPI spec (\`npx @redocly/cli lint openapi.yaml\`)
3. Implement API endpoints in Express.js
4. Add request validation middleware (Zod)
5. Write integration tests
6. Set up Swagger UI documentation
7. Deploy to staging for testing
8. Update frontend API client (React Query)
`
  }
}
