# Phase Instructions: Design

## Focus Areas

During the design phase, your primary focus should be on:

1. **System Architecture**
   - Define component boundaries and responsibilities
   - Design API contracts between frontend and backend
   - Plan data models and relationships
   - Identify external integrations needed

2. **Non-Functional Requirements**
   - Define performance targets (response times, throughput)
   - Plan scalability strategy (horizontal vs vertical)
   - Design caching and optimization approaches
   - Plan error handling and resilience patterns

3. **Technical Decisions**
   - Choose appropriate technologies and libraries
   - Document trade-offs and alternatives considered
   - Plan migration strategy if changing existing systems
   - Consider team expertise and learning curve

## Constraints

**Design Phase Specific:**
- **No implementation yet**: Focus on design, not code
- **Document decisions**: Every architectural choice must be justified
- **Consider future**: Plan for 2x-5x growth, not more
- **Review existing patterns**: Reuse project patterns when possible
- **Stakeholder input**: Get feedback from developers and product team

**Time Box:**
- Design phase should take 15-30% of total feature time
- Don't over-design; focus on decisions that are hard to change later
- Prefer simple, proven solutions over novel, complex ones

## Deliverables

For the design phase, you must provide:

1. **Architecture Diagram**
   - Component diagram showing system boundaries
   - Data flow diagram for key operations
   - Sequence diagram for complex interactions

2. **API Specification**
   - Endpoint definitions (REST or GraphQL)
   - Request/response schemas with examples
   - Error codes and error response format
   - Authentication and authorization requirements

3. **Data Models**
   - Entity relationship diagram
   - Database schema with types and constraints
   - Indexing strategy for performance
   - Multi-tenancy data isolation approach

4. **Technical Decisions Document**
   - Key decisions made (libraries, patterns, approaches)
   - Alternatives considered and why rejected
   - Risks and mitigation strategies
   - Migration plan if changing existing systems

5. **Non-Functional Requirements**
   - Performance benchmarks (e.g., "Order creation API < 500ms")
   - Availability targets (e.g., "99.9% uptime")
   - Security requirements (encryption, authentication, audit logging)
   - Compliance needs (industry regulations, audit trails)

## Quality Checklist

Before completing the design phase:

- [ ] Architecture diagram clearly shows component boundaries
- [ ] All API endpoints documented with request/response examples
- [ ] Database schema includes all necessary indexes
- [ ] Data isolation strategy for multi-tenancy defined
- [ ] Performance targets specified (response times, throughput)
- [ ] Security requirements documented (auth, encryption, audit)
- [ ] Migration plan provided if changing existing systems
- [ ] All technical decisions justified with trade-offs
- [ ] Reviewed by at least one other team member
- [ ] Approved by tech lead or principal engineer
