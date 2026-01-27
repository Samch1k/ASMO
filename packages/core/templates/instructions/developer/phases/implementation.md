# Phase Instructions: Implementation

## Focus Areas

During the implementation phase, your primary focus should be on:

1. **Code Quality**
   - Write clean, maintainable TypeScript code
   - Follow established patterns in the codebase
   - Add comprehensive JSDoc comments for public APIs
   - Handle all edge cases and error scenarios
   - Write self-documenting code with clear variable names

2. **Testing**
   - Write unit tests as you implement (TDD encouraged)
   - Achieve minimum 80% code coverage
   - Test happy path, edge cases, and error scenarios
   - Mock external dependencies properly
   - Ensure tests are fast and deterministic

3. **API Implementation**
   - Follow the API specification from design phase
   - Implement proper request validation (Zod schemas)
   - Return consistent error responses
   - Add authentication and authorization middleware
   - Document endpoints with JSDoc comments

4. **Database Operations**
   - Write efficient database queries
   - Use transactions for multi-step operations
   - Add proper indexes for query performance
   - Ensure multi-tenant data isolation (organizationId filter)
   - Handle connection errors and retries

## Constraints

**Implementation Phase Specific:**
- **Follow the design**: Implement what was designed; don't deviate without discussion
- **Test coverage**: Minimum 80% for business logic, 90% for critical paths
- **No magic numbers**: Use constants or config values
- **Error handling**: Every API endpoint must handle errors properly
- **Logging**: Log all operations with appropriate levels (info, warn, error)
- **Security**: Validate all inputs, sanitize outputs, prevent injection attacks

**Performance:**
- API responses < 200ms for reads
- API responses < 1s for writes
- Database queries should use indexes (check EXPLAIN)
- Avoid N+1 queries (use proper query optimization)

**Code Standards:**
- TypeScript strict mode (no `any` types)
- ESLint and Prettier must pass
- No console.log (use proper logger)
- Async/await for asynchronous operations
- Proper error classes (not string errors)

## Deliverables

For the implementation phase, you must provide:

1. **Working Code**
   - Fully functional implementation
   - All TypeScript types defined
   - ESLint and Prettier compliant
   - No compiler warnings or errors

2. **Unit Tests**
   - Tests for all business logic
   - Test happy path and edge cases
   - Test error handling
   - Mock external dependencies
   - Tests should be fast (< 5s total)

3. **API Integration Tests**
   - Tests for all endpoints
   - Test authentication and authorization
   - Test request validation
   - Test error responses
   - Use test database (not production)

4. **Database Migration**
   - Migration files for schema changes
   - Migration should be reversible (down migration)
   - Test migration on development database
   - Document any manual steps needed

5. **Documentation**
   - JSDoc comments for public functions
   - README updates if adding new features
   - Inline comments for complex logic
   - Update API documentation if needed

## Common Patterns

**API Endpoint Structure:**
```typescript
import { Router } from 'express'
import { z } from 'zod'
import { authenticate, authorize } from '@/middleware/auth'
import { validate } from '@/middleware/validation'
import { logger } from '@/utils/logger'

const router = Router()

// Request validation schema
const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().positive()
  }))
})

// Endpoint handler
router.post(
  '/orders',
  authenticate,
  authorize(['buyer']),
  validate(createOrderSchema),
  async (req, res, next) => {
    try {
      const order = await createOrder(req.user.organizationId, req.body)
      logger.info('Order created', { orderId: order.id })
      res.status(201).json(order)
    } catch (error) {
      next(error) // Let error middleware handle it
    }
  }
)
```

**Error Handling:**
```typescript
// Custom error classes
export class ValidationError extends Error {
  statusCode = 400
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends Error {
  statusCode = 404
  constructor(resource: string) {
    super(`${resource} not found`)
    this.name = 'NotFoundError'
  }
}

// Usage
if (!order) {
  throw new NotFoundError('Order')
}
```

## Quality Checklist

Before completing the implementation phase:

- [ ] All features from design phase implemented
- [ ] TypeScript strict mode passes (no `any` types)
- [ ] ESLint and Prettier checks pass
- [ ] Unit tests written with 80%+ coverage
- [ ] API integration tests cover all endpoints
- [ ] Error handling implemented for all edge cases
- [ ] Logging added for key operations
- [ ] Database queries optimized (checked with EXPLAIN)
- [ ] Multi-tenant data isolation verified
- [ ] Security validation (input sanitization, SQL injection prevention)
- [ ] Database migrations tested
- [ ] Documentation updated (JSDoc, README)
- [ ] Code reviewed by another developer
- [ ] No console.log or debug code left in
- [ ] All TODO comments addressed or tracked in issues
