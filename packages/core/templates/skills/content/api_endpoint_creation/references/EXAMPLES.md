# API Endpoint Creation - Examples

## Example 1: POST /api/ratings - Create Rating

**ADR**: Use PostgreSQL for ACID compliance, validate rating 1-5, require auth

**Implementation**:
```typescript
// POST /api/ratings
router.post('/ratings',
  authenticate,
  validateSchema(ratingSchema),
  async (req, res) => {
    const { rfqId, supplierId, rating, comment } = req.body
    const result = await db.ratings.create({ ... })
    res.status(201).json(result)
  }
)
```

**Tests**: 8 unit tests + 3 integration tests (all passing)

## Example 2: GET /api/suppliers/:id/avg-rating

**ADR**: Cache for 5 minutes (ratings don't change frequently)

**Implementation**: Query with JOIN, Redis caching

**Tests**: 5 unit tests + 2 integration tests + load test (500 req/s)
