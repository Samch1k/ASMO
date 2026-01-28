# Deployment Pipeline - Examples

## Example: Deploy Rating System

**CI/CD Pipeline**:

1. **Build** (2min):
   - Install dependencies
   - TypeScript compilation
   - Run linter

2. **Test** (5min):
   - Unit tests: 16 tests pass
   - Integration tests: 10 tests pass
   - E2E tests: 8 tests pass

3. **Deploy to Staging** (3min):
   - Docker build
   - Push to registry
   - Deploy to staging environment
   - Run database migrations

4. **Smoke Tests** (2min):
   - Health check: ✅
   - API tests: ✅
   - Database connectivity: ✅

5. **Deploy to Production** (3min):
   - Blue-green deployment
   - Traffic shift: 0% → 100%
   - Old version kept for rollback

6. **Monitoring** (continuous):
   - Error rate: 0%
   - Response time: p95 = 180ms
   - Health: HEALTHY ✅

**Total**: 15 minutes automated pipeline
