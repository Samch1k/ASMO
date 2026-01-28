# Full Feature Lifecycle - Examples

## Example 1: User Profile Customization Feature

**Scenario**: Add ability for users to customize their profile with avatar, bio, and preferences.

**Phase 1 - Requirements** (Day 1, 4h):
- Requirements Engineer: Gather requirements from product team
- Business Analyst: Create 5 user stories with acceptance criteria
- Requirements Validator: Validate completeness → APPROVED

**Phase 2 - Design** (Day 2, 6h):
- UX Designer: Create user flows and wireframes
- Architect: Design database schema (user_profiles table), API endpoints
- Design Validator: Review architecture → APPROVED

**Phase 3 - Planning** (Day 2, 2h):
- Project Manager: Break down into 12 tasks, estimate 40 hours
- Risk assessment: Low risk (standard CRUD operations)

**Phase 4 - Implementation** (Days 3-5, 24h):
- Developer (parallel): Backend API (CRUD endpoints, validation)
- UI Developer (parallel): Profile editing UI components
- Code Reviewer: Review code quality → APPROVED

**Phase 5 - Testing** (Day 6, 8h):
- Tester (parallel): 20 unit tests + 5 E2E tests
- Optimizer (parallel): Performance testing (< 200ms response time)
- All tests passing ✅

**Phase 6 - Deployment** (Day 7, 4h):
- DevOps: Deploy to staging → smoke tests pass
- DevOps: Deploy to production
- Post-Deploy Monitor: Health check → HEALTHY ✅

**Total**: 7 days, 48 hours across 6 phases

## Example 2: Supplier Rating System (MeatConnect)

**Scenario**: Add supplier rating system to RFQ workflow.

**Phase 1 - Requirements** (2h):
- Product Owner: Priority = High, Business Value = 85/100
- Business Analyst: 3 user stories (buyer rates supplier, view ratings, supplier sees own rating)
- Requirements Validator: INVEST criteria pass → APPROVED

**Phase 2 - Design** (4h):
- Architect: PostgreSQL schema (ratings table), 3 API endpoints
- UX Designer: 5-star rating widget design
- Design Validator: Architecture review pass → APPROVED

**Phase 3 - Planning** (2h):
- Project Manager: 6 tasks, 15 hours estimated
- Low risk (straightforward CRUD)

**Phase 4 - Implementation** (8h):
- Developer: API endpoints + validation (4h)
- UI Developer: Rating widget + history modal (4h)
- Code Reviewer: Quality 85/100 → APPROVED

**Phase 5 - Testing** (6h):
- Tester: 20 unit tests + 5 E2E tests (all passing)
- Optimizer: API < 200ms, Lighthouse 95/100
- Merge Agent: All results consolidated → READY

**Phase 6 - Deployment** (2h):
- DevOps: Staging deployment + migration
- Post-Deploy Monitor: Health = HEALTHY, Error rate = 0%

**Total**: ~2 days, 24 hours across 6 phases

## Example 3: Performance Optimization Feature

**Scenario**: Optimize slow product search endpoint.

**Phase 1 - Requirements** (1h):
- Current: 2-3s response time
- Target: < 500ms response time
- Acceptance: 95th percentile < 500ms

**Phase 2 - Design** (3h):
- Optimizer: Profile queries, identify bottlenecks
- Architect: Design caching strategy (Redis), database indexes
- Design Validator: Caching approach validated → APPROVED

**Phase 3 - Planning** (1h):
- Project Manager: 4 tasks (query optimization, caching, indexes, testing)
- 8 hours estimated

**Phase 4 - Implementation** (6h):
- Developer: Implement Redis caching + optimize queries
- Database indexes added
- Code Reviewer: Performance improvements verified → APPROVED

**Phase 5 - Testing** (4h):
- Load testing: 1000 req/s sustained
- Response time: p95 = 180ms (target: 500ms) ✅
- Cache hit rate: 85%

**Phase 6 - Deployment** (2h):
- DevOps: Deploy with Redis configuration
- Post-Deploy Monitor: Performance metrics validated → SUCCESS

**Total**: ~2 days, 17 hours
