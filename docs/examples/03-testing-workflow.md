# Example 3: Testing Workflow

Complete walkthrough of planning comprehensive tests using ASMO's TEA workflows.

---

## Scenario

Your team has built a checkout flow and needs comprehensive test coverage:

> **Task:** Plan comprehensive tests for checkout flow
>
> **Checkout Flow:**
> 1. Add items to cart
> 2. Review cart (update quantities, remove items)
> 3. Enter shipping address
> 4. Select shipping method
> 5. Enter payment details
> 6. Review order
> 7. Place order
> 8. Order confirmation
>
> **Requirements:**
> - Unit tests for components
> - Integration tests for API
> - E2E tests for full flow
> - Edge cases covered
> - Error scenarios tested

---

## Step 1: Analyze Complexity

```bash
asmo analyze "Plan comprehensive tests for checkout flow with cart, shipping, payment, and order confirmation"
```

**Output:**
```
🔍 Complexity Analysis

Task: "Plan comprehensive tests for checkout flow..."

Scores:
  Technical Scope:     6/10  (Multiple components: cart, shipping, payment, order)
  Business Impact:     9/10  (Critical: checkout = revenue)
  Risk Level:          7/10  (Payment processing, order placement)
  Performance Impact:  6/10  (Database, API calls, payment gateway)

Overall Complexity: 55/100 (Medium)

Recommendation:
  Workflow: tea_planning_workflow
  Reason: Comprehensive test planning for critical business flow

  Agents: test-architect, tester, business-analyst
  Estimated Time: 3-5 hours (adaptive)

Phases:
  1. Risk Assessment (1-1.5h)
     → Identify test risks, prioritize areas

  2. Test Strategy (1-1.5h)
     → Define test approach, levels, coverage

  3. Test Design (1-2h)
     → Design test cases, test data, scenarios

Adaptive Features:
  - Skips boundary/equivalence analysis for simple projects
  - Full analysis for complex checkout flow (complexity: 55)
```

---

## Step 2: Run ASMO

```bash
asmo workflow tea_planning_workflow --task "Plan comprehensive tests for checkout flow with cart, shipping, payment, and order confirmation"
```

---

## Step 3: Approval Checkpoint

```
📋 Workflow Plan: tea_planning_workflow

Complexity: 55/100 (Medium)
Estimated Time: 3.5-4 hours

Phase 1: Risk Assessment (test-architect)
  Duration: 1 hour
  Deliverables:
    • Risk matrix (business impact × technical complexity)
    • Test priorities (high/medium/low)
    • Coverage targets
    • Risk mitigation strategies

Phase 2: Test Strategy (test-architect + tester)
  Duration: 1.5 hours
  Deliverables:
    • Test levels (unit, integration, E2E)
    • Test types (functional, non-functional)
    • Test environment strategy
    • Test data strategy
    • Automation approach

Phase 3: Test Design (tester + business-analyst)
  Duration: 1-1.5 hours
  Deliverables:
    • Test scenarios
    • Test cases (positive, negative, edge)
    • Test data sets
    • Expected results
    • Traceability matrix

Total: 16 deliverables

❓ Approve workflow? (Y/n) █
```

**Action:** Type `Y`

---

## Step 4: Phase 1 - Risk Assessment

```
🤖 Phase 1/3: Risk Assessment (test-architect)

📍 Current: Analyzing test risks for checkout flow...

Risk Analysis:
  ✓ Business impact analysis
  ✓ Technical complexity assessment
  ✓ Risk prioritization
  ✓ Coverage targets defined

Risks Identified: 15
  - High priority: 5
  - Medium priority: 7
  - Low priority: 3

✅ Risk assessment complete
📦 Artifacts:
   - risk-matrix.md
   - test-priorities.md
   - coverage-targets.md
   - risk-mitigation-plan.md
⏱️  Time: 55 minutes
```

### Artifact: risk-matrix.md

```markdown
# Risk Matrix: Checkout Flow Testing

## High-Priority Risks

| Risk | Business Impact | Technical Complexity | Priority | Mitigation |
|------|----------------|---------------------|----------|------------|
| **Payment processing failure** | CRITICAL | High | 1 | Comprehensive payment gateway tests, mock payment scenarios |
| **Order not placed but charged** | CRITICAL | Medium | 2 | Transaction rollback tests, idempotency tests |
| **Inventory race condition** | HIGH | High | 3 | Concurrent order tests, stock management tests |
| **Cart data loss** | HIGH | Medium | 4 | Cart persistence tests, session timeout tests |
| **Address validation bypass** | MEDIUM | Low | 5 | Invalid address tests, edge case testing |

## Medium-Priority Risks

| Risk | Business Impact | Technical Complexity | Priority |
|------|----------------|---------------------|----------|
| Cart quantity overflow (>999) | MEDIUM | Low | 6 |
| Shipping calculation error | MEDIUM | Medium | 7 |
| Promo code abuse | MEDIUM | Medium | 8 |
| Email notification failure | LOW | Low | 9 |
| UI responsive issues | LOW | Medium | 10 |

## Coverage Targets

| Component | Target | Rationale |
|-----------|--------|-----------|
| **Payment processing** | 100% | Critical path, revenue impact |
| **Order placement** | 100% | Critical path, data integrity |
| **Cart operations** | 95% | High usage, user experience |
| **Shipping logic** | 90% | Business logic, accuracy |
| **Address validation** | 85% | Input validation, security |
| **UI components** | 80% | User interface, UX |

## Test Priority Matrix

```
                High Business Impact
                       ↑
                       │
    Payment Processing │ Order Placement
    Inventory Mgmt     │ Transaction Rollback
                       │
Low Complexity ────────┼──────── High Complexity
                       │
    UI Components      │ Concurrent Orders
    Email Notifications│ Stock Race Conditions
                       │
                       ↓
                Low Business Impact
```

## Risk Mitigation Strategies

1. **Payment Processing**
   - Test all payment scenarios (success, decline, timeout)
   - Mock payment gateway for predictable testing
   - Test idempotency (duplicate submissions)

2. **Order Placement**
   - Test transaction boundaries
   - Test rollback on failure
   - Test data consistency

3. **Inventory Race Conditions**
   - Concurrent order tests (10+ simultaneous orders)
   - Stock depletion scenarios
   - Overselling prevention tests

4. **Cart Persistence**
   - Session timeout tests
   - Browser close/reopen tests
   - Cart migration (guest → logged-in)
```

---

## Step 5: Phase 2 - Test Strategy

```
🤖 Phase 2/3: Test Strategy (test-architect + tester)

📍 Current: Defining comprehensive test strategy...

Strategy Defined:
  ✓ Test levels identified (4 levels)
  ✓ Test types defined (6 types)
  ✓ Environment strategy
  ✓ Test data strategy
  ✓ Automation approach (70% automated)

Test Cases Planned: 127
  - Unit: 45
  - Integration: 38
  - E2E: 25
  - Manual: 19

✅ Test strategy complete
📦 Artifacts:
   - test-strategy.md
   - test-levels.md
   - test-automation-plan.md
   - test-environment-strategy.md
   - test-data-strategy.md
⏱️  Time: 1h 22m
```

### Artifact: test-strategy.md

```markdown
# Test Strategy: Checkout Flow

## Test Levels

### 1. Unit Tests (45 tests)

**Scope:** Individual components in isolation

**Components:**
- Cart component (10 tests)
- Shipping form (8 tests)
- Payment form (12 tests)
- Order summary (8 tests)
- Validation logic (7 tests)

**Tools:** Jest, React Testing Library

**Example:**
```typescript
describe('Cart Component', () => {
  it('should add item to cart', () => { ... })
  it('should update quantity', () => { ... })
  it('should remove item', () => { ... })
  it('should calculate subtotal correctly', () => { ... })
})
```

### 2. Integration Tests (38 tests)

**Scope:** API endpoints and database interactions

**Endpoints:**
- POST /api/cart/add (5 tests)
- PUT /api/cart/update (5 tests)
- DELETE /api/cart/remove (4 tests)
- POST /api/orders (12 tests - critical)
- POST /api/payment (12 tests - critical)

**Tools:** Supertest, Jest

**Example:**
```typescript
describe('POST /api/orders', () => {
  it('should create order with valid data', async () => { ... })
  it('should rollback on payment failure', async () => { ... })
  it('should prevent duplicate orders (idempotency)', async () => { ... })
  it('should handle inventory depletion', async () => { ... })
})
```

### 3. End-to-End Tests (25 tests)

**Scope:** Full user journeys

**Scenarios:**
- Happy path: Complete checkout (1 test)
- Guest checkout (1 test)
- Logged-in checkout (1 test)
- Multiple items (1 test)
- Promo code application (2 tests)
- Payment decline handling (3 tests)
- Address validation (5 tests)
- Cart persistence (4 tests)
- Error recovery (7 tests)

**Tools:** Playwright

**Example:**
```typescript
test('complete checkout flow', async ({ page }) => {
  await page.goto('/products')
  await page.click('[data-testid="add-to-cart"]')
  await page.goto('/cart')
  await page.click('[data-testid="checkout"]')
  // ... shipping, payment, confirmation
  await expect(page.locator('[data-testid="order-confirmation"]')).toBeVisible()
})
```

### 4. Manual Tests (19 tests)

**Scope:** Exploratory and edge cases

**Areas:**
- Browser compatibility (5 tests)
- Mobile responsiveness (4 tests)
- Payment gateway UI (3 tests)
- Email confirmation (2 tests)
- Accessibility (5 tests)

## Test Types

### 1. Functional Tests (90 tests)
- Positive scenarios (45)
- Negative scenarios (30)
- Edge cases (15)

### 2. Security Tests (12 tests)
- XSS prevention (3)
- CSRF protection (2)
- Payment data security (4)
- Address validation (3)

### 3. Performance Tests (10 tests)
- Page load time (< 2s)
- Cart operations (< 200ms)
- Order placement (< 3s)
- Concurrent orders (100 simultaneous)

### 4. Usability Tests (8 tests)
- Form validation feedback
- Error messages clarity
- Loading states
- Success confirmations

### 5. Compatibility Tests (5 tests)
- Chrome, Firefox, Safari, Edge
- Mobile (iOS, Android)

### 6. Accessibility Tests (2 tests)
- Keyboard navigation
- Screen reader support

## Test Automation Strategy

**Automation Target:** 70% of tests

**Automated:**
- ✅ All unit tests (45) - 100%
- ✅ All integration tests (38) - 100%
- ✅ Most E2E tests (20/25) - 80%
- ✅ Some performance tests (8/10) - 80%

**Manual:**
- ❌ Browser compatibility (5)
- ❌ Exploratory testing (7)
- ❌ Accessibility (2)
- ❌ Some E2E edge cases (5)

**Total Automation:** 111/127 tests (87%)

## Test Environment Strategy

### 1. Local Development
- Unit tests run on every save (watch mode)
- Integration tests run before commit
- Mock payment gateway
- Local database (Docker)

### 2. CI/CD (GitHub Actions)
- All tests run on PR
- E2E tests run on staging deployment
- Performance tests run nightly

### 3. Staging
- Full E2E test suite
- Real payment gateway (test mode)
- Production-like data

### 4. Production
- Smoke tests after deployment
- Monitoring alerts
- Error tracking (Sentry)

## Test Data Strategy

### Approach: Factories + Fixtures

**Test Data Categories:**

1. **Valid Data** (50 cases)
   - Standard cart items
   - Valid addresses (US, International)
   - Valid payment cards (test cards)

2. **Invalid Data** (30 cases)
   - Empty cart
   - Invalid addresses
   - Declined payment cards
   - Expired cards

3. **Edge Cases** (25 cases)
   - Large quantities (999+)
   - Many items in cart (50+)
   - Long addresses
   - Special characters in names
   - Out-of-stock items

**Data Management:**
```typescript
// factories/cart.factory.ts
export function createCart(overrides = {}) {
  return {
    items: [
      { id: 1, name: 'Product A', price: 29.99, quantity: 1 }
    ],
    subtotal: 29.99,
    tax: 2.40,
    shipping: 5.99,
    total: 38.38,
    ...overrides
  }
}

// Usage
const cart = createCart({ items: [/* custom items */] })
```

## Test Execution Plan

### Daily (Local)
- Unit tests (on save)
- Integration tests (before commit)

### On PR
- All unit tests
- All integration tests
- Critical E2E tests (5 tests)

### On Merge to Main
- Full test suite (127 tests)
- Performance tests
- Security scans

### Nightly
- Full E2E suite
- Cross-browser tests
- Performance regression tests

## Success Criteria

- ✅ 100% of high-priority risks covered
- ✅ 95% of medium-priority risks covered
- ✅ 80% overall code coverage
- ✅ 87% test automation
- ✅ All critical paths tested
- ✅ < 2 hour test execution time
```

---

## Step 6: Phase 3 - Test Design

```
🤖 Phase 3/3: Test Design (tester + business-analyst)

📍 Current: Designing detailed test cases...

Test Cases Designed:
  ✓ Unit test cases (45)
  ✓ Integration test cases (38)
  ✓ E2E test scenarios (25)
  ✓ Manual test cases (19)

Test Data:
  ✓ Valid data sets (50)
  ✓ Invalid data sets (30)
  ✓ Edge case data (25)

Deliverables:
  ✓ Test scenarios document
  ✓ Test case specifications
  ✓ Test data sets
  ✓ Traceability matrix
  ✓ Expected results

✅ Test design complete
📦 Artifacts:
   - test-scenarios.md
   - test-cases.xlsx
   - test-data-sets.json
   - expected-results.md
   - traceability-matrix.md
⏱️  Time: 1h 18m
```

### Artifact: test-scenarios.md (Sample)

```markdown
# Test Scenarios: Checkout Flow

## Scenario 1: Happy Path - Complete Checkout

**Objective:** Verify successful order placement

**Preconditions:**
- User logged in
- Products available in stock
- Valid payment method configured

**Steps:**
1. Add item to cart
2. Navigate to cart
3. Click "Checkout"
4. Enter shipping address
5. Select shipping method (Standard)
6. Enter payment details (valid card)
7. Review order
8. Click "Place Order"

**Expected Results:**
- ✅ Order created in database
- ✅ Payment processed successfully
- ✅ Inventory reduced
- ✅ Confirmation email sent
- ✅ Order confirmation page displayed
- ✅ Order number generated

**Test Data:**
```json
{
  "item": { "id": "PROD-001", "quantity": 2 },
  "address": {
    "street": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zip": "94102"
  },
  "card": {
    "number": "4111111111111111",
    "exp": "12/25",
    "cvv": "123"
  }
}
```

---

## Scenario 2: Payment Decline

**Objective:** Verify graceful handling of declined payment

**Steps:**
1-7. (same as happy path)
8. Enter payment details (test decline card: 4000000000000002)
9. Click "Place Order"

**Expected Results:**
- ✅ Payment decline error displayed
- ✅ Order NOT created in database
- ✅ Inventory NOT reduced
- ✅ User remains on payment page
- ✅ Cart data preserved
- ✅ Error message: "Payment declined. Please try a different card."

---

## Scenario 3: Inventory Race Condition

**Objective:** Verify handling of out-of-stock during checkout

**Setup:** Product has stock: 1

**Steps:**
1. User A adds last item to cart
2. User B adds last item to cart (now overbooked)
3. User A completes checkout
4. User B completes checkout

**Expected Results:**
- ✅ User A: Order successful
- ✅ User B: Order fails with "Out of stock" error
- ✅ Inventory never goes negative
- ✅ User B's cart updated with error

---

## Scenario 4: Cart Persistence

**Objective:** Verify cart data persists across sessions

**Steps:**
1. Add items to cart (not logged in)
2. Close browser
3. Reopen browser, same site
4. Check cart

**Expected Results:**
- ✅ Cart items still present
- ✅ Quantities preserved
- ✅ Prices up-to-date

---

## Scenario 5: Address Validation

**Objective:** Verify invalid addresses are rejected

**Invalid Addresses to Test:**
- Missing required fields
- Invalid ZIP code
- Invalid state
- International address (if not supported)
- PO Box (if not supported)
- Overly long fields

**Expected Results:**
- ✅ Validation errors displayed inline
- ✅ Form submission blocked
- ✅ Clear error messages
- ✅ Focus on first error field
```

---

## Step 7: Results Summary

```
🎉 Workflow Complete!

📊 Summary:
   Status: ✅ Success
   Steps completed: 3/3
   Total time: 3h 35m (actual) vs 3.5-4h (estimated)
   Efficiency: 95%

📦 Deliverables (16):

   Risk Assessment:
   ✅ risk-matrix.md              - 15 risks identified, prioritized
   ✅ test-priorities.md          - Coverage targets defined
   ✅ coverage-targets.md         - 80-100% per component
   ✅ risk-mitigation-plan.md     - Mitigation strategies

   Test Strategy:
   ✅ test-strategy.md            - Complete strategy (all levels)
   ✅ test-levels.md              - Unit, Integration, E2E, Manual
   ✅ test-automation-plan.md     - 87% automation target
   ✅ test-environment-strategy.md - Local, CI, Staging, Prod
   ✅ test-data-strategy.md       - Factories + Fixtures approach

   Test Design:
   ✅ test-scenarios.md           - 25 E2E scenarios
   ✅ test-cases.xlsx             - 127 test cases
   ✅ test-data-sets.json         - 105 data sets
   ✅ expected-results.md         - Expected outcomes
   ✅ traceability-matrix.md      - Requirements → Tests mapping

   Summary:
   ✅ coverage-summary.md         - Overview
   ✅ execution-plan.md           - Daily/PR/Nightly schedule

🔍 Planning Results:
   Test Cases Designed: 127
     - Unit: 45
     - Integration: 38
     - E2E: 25
     - Manual: 19

   Automation: 87% (111/127 tests)
   Coverage Target: 80% overall
   Risks Identified: 15 (5 high, 7 medium, 3 low)

✨ Next Steps:
   1. Review artifacts: ./asmo-output/2026-02-09_16-30-45_tea_planning/
   2. Share with team for review
   3. Proceed to implementation:
      asmo workflow tea_execution_workflow --task "Implement tests based on plan"
   4. Create test implementation tasks
   5. Schedule test execution
```

---

## Step 8: Review Artifacts

```bash
cd asmo-output/2026-02-09_16-30-45_tea_planning/

# Review risk matrix
cat risk-matrix.md

# Review test strategy
cat test-strategy.md

# Review test scenarios
cat test-scenarios.md

# Review test cases
open test-cases.xlsx  # Or use LibreOffice/Excel

# Review traceability
cat traceability-matrix.md
```

---

## Step 9: Next Phase - Execute Tests

Now that planning is complete, implement the tests:

```bash
asmo workflow tea_execution_workflow --task "Implement comprehensive tests for checkout flow based on TEA planning"
```

This will:
1. Set up test automation framework
2. Implement 111 automated tests
3. Create test fixtures and factories
4. Set up CI/CD integration
5. Execute regression suite

**Estimated time:** 3.5-6 hours (execution workflow)

---

## Lessons Learned

### What Went Well ✅

1. **Comprehensive Risk Analysis**: Identified 15 risks, prioritized by impact
2. **Structured Strategy**: 4 test levels, 6 test types, clear automation plan
3. **Detailed Test Design**: 127 test cases with data sets and expected results
4. **Traceability**: Complete mapping of requirements to tests
5. **Time Efficiency**: 3h 35m for complete test planning

### ASMO Benefits 🚀

1. **Systematic Approach**: Risk → Strategy → Design (nothing missed)
2. **Comprehensive Coverage**: All aspects considered (security, performance, usability)
3. **Quality Focus**: High-priority risks get 100% coverage
4. **Automation Plan**: 87% automation defined upfront
5. **Complete Documentation**: 16 artifacts for future reference

### Without ASMO

If you had done this manually:
- ❌ Might skip risk assessment
- ❌ Inconsistent test coverage
- ❌ No automation strategy
- ❌ Missing edge cases
- ❌ No traceability matrix

**ASMO ensured:**
- ✅ Risk-based testing approach
- ✅ 100% coverage of high-priority risks
- ✅ Clear automation strategy (87%)
- ✅ All edge cases identified
- ✅ Complete traceability

---

## Key Takeaways

1. **TEA workflows are comprehensive** - From risk to strategy to design
2. **Risk-based approach** - Focus testing where it matters most
3. **Adaptive planning** - Workflow adjusted to complexity (55/100)
4. **Multiple perspectives** - test-architect, tester, business-analyst
5. **Ready for execution** - Complete plan enables smooth implementation

---

## Planning vs Execution

| Phase | Workflow | Focus | Time | Output |
|-------|----------|-------|------|--------|
| **Planning** | `tea_planning_workflow` | Risk, Strategy, Design | ~4h | 16 documents, 127 test cases |
| **Execution** | `tea_execution_workflow` | Implementation, Automation | ~5h | 111 automated tests, framework |
| **Validation** | `tea_validation_workflow` | Quality Gates, Release Readiness | ~2h | Go/No-Go decision, metrics |

**Total TEA cycle:** ~11 hours for complete test coverage

---

## Try It Yourself

```bash
# Clone the example
git clone https://github.com/asmo-examples/checkout-testing
cd checkout-testing

# Run TEA planning
asmo workflow tea_planning_workflow --task "Plan comprehensive tests for checkout flow"

# Review generated test plan
cat asmo-output/*/test-strategy.md

# Proceed to execution
asmo workflow tea_execution_workflow --task "Implement tests based on plan"
```

---

**Next Example:** [Architecture Design](./04-architecture-design.md)
