# Performance Optimization Workflow - Examples

## Example: Optimize Supplier Search

**Baseline**: 2.5s p95 latency (target: < 500ms)

**1. Analysis** (2h):
- Profile API endpoint
- Bottleneck: N+1 query (loading supplier ratings separately)
- Database query taking 2.1s

**2. Prioritization** (30min):
- High impact: Fix N+1 query (est. 80% improvement)
- Medium impact: Add caching (est. 50% improvement)
- Low impact: Index optimization (est. 10% improvement)

**3. Implementation** (4h):
- Fix N+1: Use JOIN for ratings (2h)
- Add Redis caching (5min TTL) (1.5h)
- Add database indexes (30min)

**4. Validation** (1.5h):
- New p95: 180ms (93% improvement ✅)
- p99: 320ms (< 500ms target ✅)
- Cache hit rate: 78%
- No regressions found

**Total**: 8 hours, 93% improvement
