# API Design Workflow Checklist

## Phase 1: Requirements (architect)

### Before Starting
- [ ] Business requirements understood
- [ ] Use cases documented
- [ ] Consumer requirements identified
- [ ] Existing systems reviewed

### During Execution
- [ ] API requirements defined
- [ ] Use cases prioritized
- [ ] Design principles established (REST/GraphQL/gRPC)
- [ ] Technology stack selected
- [ ] Authentication/authorization approach defined
- [ ] Rate limiting strategy determined

### Completion Criteria
- [ ] Requirements document complete
- [ ] Technology approach decided
- [ ] Design principles agreed upon
- [ ] Stakeholders aligned

## Phase 2: Contract Design (architect)

### Before Starting
- [ ] Requirements reviewed
- [ ] API standards documented
- [ ] Naming conventions established

### During Execution
- [ ] Resource models designed
- [ ] Endpoints defined
- [ ] Request/response schemas created
- [ ] Error responses standardized
- [ ] Authentication mechanism designed
- [ ] API versioning strategy defined
- [ ] Rate limiting specified
- [ ] Pagination strategy designed

### Completion Criteria
- [ ] Complete API specification
- [ ] All endpoints documented
- [ ] Data models defined
- [ ] Authentication/authorization clear
- [ ] Versioning strategy established

## Phase 3: Review (code-reviewer)

### Before Starting
- [ ] API design complete
- [ ] Review criteria established

### During Execution
- [ ] RESTful principles followed (if REST)
- [ ] Naming conventions consistent
- [ ] Error handling comprehensive
- [ ] Security best practices applied
- [ ] Performance considerations addressed
- [ ] Backward compatibility ensured

### Completion Criteria
- [ ] Design review report complete
- [ ] All issues addressed
- [ ] Security assessment passed
- [ ] Design approved

## Phase 4: Documentation (developer)

### Before Starting
- [ ] API design approved
- [ ] Documentation standards defined

### During Execution
- [ ] OpenAPI/GraphQL schema created
- [ ] Endpoint descriptions written
- [ ] Request/response examples provided
- [ ] Authentication flow documented
- [ ] Error codes documented
- [ ] SDK stubs generated
- [ ] Integration guide written
- [ ] Postman/Insomnia collection created

### Completion Criteria
- [ ] Complete API documentation
- [ ] All endpoints have examples
- [ ] Error handling documented
- [ ] Integration guide complete
- [ ] SDK stubs available

## Phase 5: Implementation (developer)

### Before Starting
- [ ] API design and documentation ready
- [ ] Development environment configured
- [ ] Database schema ready (if needed)

### During Execution
- [ ] Endpoints implemented
- [ ] Request validation added
- [ ] Error handling implemented
- [ ] Authentication/authorization integrated
- [ ] Rate limiting implemented
- [ ] Logging added
- [ ] API tests written

### Completion Criteria
- [ ] All endpoints implemented
- [ ] Validation working correctly
- [ ] Error responses match specification
- [ ] Tests passing
- [ ] Code reviewed

## Phase 6: Testing (tester)

### Before Starting
- [ ] API implementation complete
- [ ] Test environment ready
- [ ] Test data prepared

### During Execution
- [ ] Functional tests executed
- [ ] Authentication/authorization tested
- [ ] Error cases validated
- [ ] Performance tests run
- [ ] Security tests performed
- [ ] Integration tests executed
- [ ] Load tests performed

### Completion Criteria
- [ ] All functional tests passing
- [ ] Security tests passed
- [ ] Performance meets requirements
- [ ] Integration tests successful
- [ ] Documentation verified against implementation

## Final Approval

- [ ] All phases completed successfully
- [ ] API documentation complete and accurate
- [ ] Implementation matches specification
- [ ] All tests passing
- [ ] Security validated
- [ ] Performance acceptable
- [ ] Ready for deployment
