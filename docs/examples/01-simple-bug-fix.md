# Example 1: Simple Bug Fix

Step-by-step walkthrough of fixing a bug using ASMO.

---

## Scenario

You've received a bug report:

> **Bug:** Users can't log in when email contains uppercase letters
>
> **Steps to reproduce:**
> 1. Create account with `John@Example.com`
> 2. Try to log in with `john@example.com`
> 3. Login fails with "Invalid credentials"
>
> **Expected:** Login should be case-insensitive
>
> **Actual:** Login fails

---

## Step 1: Check if ASMO is Needed

```bash
asmo suggest "Fix login bug where email comparison is case-sensitive"
```

**Output:**
```json
{
  "useAsmo": true,
  "reason": "Bug requires investigation and testing to ensure fix works correctly",
  "recommendedWorkflow": "bug_fix_workflow",
  "complexity": 35,
  "estimatedTime": "1-2 hours",
  "agents": ["debugger", "developer", "tester"]
}
```

**Analysis:**
- ✅ Use ASMO (complexity: 35 - simple-medium)
- Workflow: `bug_fix_workflow` (adaptive)
- Simple bug → Will skip architect and code-reviewer (saves 40% time)

---

## Step 2: Run ASMO

```bash
asmo run "Fix login bug where email comparison is case-sensitive"
```

### Output: Complexity Analysis

```
🔍 Analyzing task complexity...

Task: "Fix login bug where email comparison is case-sensitive"

Task Type: Bug Fix
Complexity Scores:
  Technical Scope:     4/10  (Single file: auth.ts)
  Business Impact:     6/10  (User-facing login issue)
  Risk Level:          3/10  (Low risk - bug fix)
  Performance Impact:  2/10  (Minimal)

Overall Complexity: 35/100 (Simple-Medium)

Time Estimate: 1-2 hours
```

### Output: Workflow Selection

```
✅ Workflow selected: bug_fix_workflow (adaptive)

Adaptive Features:
  • Skipping architect (simple bug, no architecture changes)
  • Skipping code-reviewer (simple fix, low risk)

Steps: 3/5 (40% time savings)
  1. Investigation (debugger) - 20 min
  2. Implementation (developer) - 30 min
  3. Testing (tester) - 20 min

Total time: ~1h 10min (vs 2h for full workflow)
```

---

## Step 3: Approval Checkpoint

```
📋 Workflow Plan

Workflow: bug_fix_workflow (adaptive)
Complexity: 35/100 (Simple-Medium)
Estimated Time: 1h 10min

Phase 1: Investigation
  Agent: debugger
  Duration: 20 min
  Deliverables:
    • Root cause analysis
    • Bug reproduction steps
    • Affected components

Phase 2: Implementation
  Agent: developer
  Duration: 30 min
  Deliverables:
    • Code fix
    • Unit tests
    • Implementation documentation

Phase 3: Testing
  Agent: tester
  Duration: 20 min
  Deliverables:
    • Test validation
    • Regression tests
    • Test results report

Skipped Steps (adaptive):
  ✗ Architecture Review (not needed for simple bug)
  ✗ Code Review (low complexity, low risk)

Total Cost:
  Session mode: $0.00 (free)
  API mode: ~$0.15

❓ Approve workflow? (Y/n) █
```

**Action:** Type `Y` and press Enter.

---

## Step 4: Workflow Execution

### Phase 1: Investigation (debugger)

```
🤖 Step 1/3: Investigation (debugger)

📍 Current: Analyzing login flow...

Analysis:
  ✓ Located auth logic in src/auth/auth.service.ts
  ✓ Found bug in compareEmails function (line 142)
  ✓ Email comparison is case-sensitive

Root Cause:
  Current code:
    return user.email === loginEmail

  Problem:
    String comparison is case-sensitive by default

  Solution:
    Convert both to lowercase before comparison:
    return user.email.toLowerCase() === loginEmail.toLowerCase()

✅ Investigation complete
📦 Artifact: bug-analysis.md
⏱️  Time: 18 minutes
```

**Artifact: bug-analysis.md**
```markdown
# Bug Analysis: Case-Sensitive Email Login

## Root Cause
Email comparison in `src/auth/auth.service.ts:142` is case-sensitive.

## Current Code
```typescript
function compareEmails(userEmail: string, loginEmail: string): boolean {
  return userEmail === loginEmail
}
```

## Problem
JavaScript string comparison is case-sensitive by default:
- `"John@Example.com" === "john@example.com"` → `false`

## Solution
Convert both emails to lowercase before comparison:
```typescript
function compareEmails(userEmail: string, loginEmail: string): boolean {
  return userEmail.toLowerCase() === loginEmail.toLowerCase()
}
```

## Impact
- Affects all login attempts with mixed-case emails
- No security implications (makes login more permissive, not less)
- No database changes required

## Test Cases
1. Uppercase email: `JOHN@EXAMPLE.COM` → should work
2. Lowercase email: `john@example.com` → should work
3. Mixed case email: `John@Example.Com` → should work
```

---

### Phase 2: Implementation (developer)

```
🤖 Step 2/3: Implementation (developer)

📍 Current: Implementing fix in auth.service.ts...

Changes:
  ✓ Modified compareEmails function
  ✓ Added toLowerCase() to both emails
  ✓ Updated unit tests
  ✓ Added test cases for mixed-case emails

Files changed:
  M src/auth/auth.service.ts       (+2, -1)
  M src/auth/auth.service.test.ts  (+15, -0)

✅ Implementation complete
📦 Artifacts:
   - src/auth/auth.service.ts (modified)
   - src/auth/auth.service.test.ts (modified)
   - fix-implementation.md
⏱️  Time: 28 minutes
```

**Code Changes:**

```diff
// src/auth/auth.service.ts
function compareEmails(userEmail: string, loginEmail: string): boolean {
-  return userEmail === loginEmail
+  return userEmail.toLowerCase() === loginEmail.toLowerCase()
}
```

```typescript
// src/auth/auth.service.test.ts (added tests)
describe('compareEmails', () => {
  it('should be case-insensitive', () => {
    expect(compareEmails('John@Example.com', 'john@example.com')).toBe(true)
    expect(compareEmails('john@example.com', 'JOHN@EXAMPLE.COM')).toBe(true)
    expect(compareEmails('JoHn@ExAmPlE.cOm', 'john@example.com')).toBe(true)
  })

  it('should still validate correct emails', () => {
    expect(compareEmails('john@example.com', 'john@example.com')).toBe(true)
  })

  it('should reject different emails', () => {
    expect(compareEmails('john@example.com', 'jane@example.com')).toBe(false)
  })
})
```

---

### Phase 3: Testing (tester)

```
🤖 Step 3/3: Testing (tester)

📍 Current: Running tests...

Test Execution:
  ✓ Unit tests: 8/8 passing
  ✓ Integration tests: 3/3 passing
  ✓ Regression tests: 12/12 passing

New Tests:
  ✓ Case-insensitive email login (uppercase)
  ✓ Case-insensitive email login (lowercase)
  ✓ Case-insensitive email login (mixed case)

Manual Validation:
  ✓ Tested in dev environment
  ✓ Verified login with JOHN@EXAMPLE.COM
  ✓ Verified login with john@example.com
  ✓ Verified existing functionality unchanged

✅ Testing complete
📦 Artifacts:
   - test-results.md
   - regression-test-report.md
⏱️  Time: 22 minutes
```

---

## Step 5: Results Summary

```
🎉 Workflow Complete!

📊 Summary:
   Status: ✅ Success
   Steps completed: 3/3
   Steps skipped: 2 (adaptive optimization)
   Total time: 1h 8m (actual) vs 1h 10m (estimated)
   Efficiency: 97%

📦 Deliverables:
   ✅ bug-analysis.md                - Root cause analysis
   ✅ fix-implementation.md          - Implementation details
   ✅ test-results.md                - Test validation
   ✅ src/auth/auth.service.ts       - Fixed code
   ✅ src/auth/auth.service.test.ts  - New test cases

🔍 Code Changes:
   Files changed: 2
   Lines added: 17
   Lines removed: 1
   Tests added: 3

✅ All Tests Passing: 23/23

✨ Next Steps:
   1. Review artifacts in: ./asmo-output/2026-02-09_14-30-15_bug_fix_workflow/
   2. Review code changes: git diff
   3. Run full test suite: npm test
   4. Commit changes: git commit -m "fix: make email login case-insensitive"
   5. Create PR: gh pr create --title "Fix case-sensitive email login"
```

---

## Step 6: Review Artifacts

```bash
cd asmo-output/2026-02-09_14-30-15_bug_fix_workflow/

# Review analysis
cat bug-analysis.md

# Review implementation
cat fix-implementation.md

# Review test results
cat test-results.md

# Check execution log
cat execution-log.json
```

---

## Step 7: Review Code Changes

```bash
# Check git status
git status

# Review changes
git diff

# Run tests
npm test
```

**Output:**
```
 PASS  src/auth/auth.service.test.ts
  compareEmails
    ✓ should be case-insensitive (4 ms)
    ✓ should still validate correct emails (1 ms)
    ✓ should reject different emails (1 ms)

Test Suites: 1 passed, 1 total
Tests:       23 passed, 23 total
Snapshots:   0 total
Time:        2.456 s

✅ All tests passed!
```

---

## Step 8: Commit Changes

```bash
# Stage changes
git add src/auth/

# Commit with descriptive message
git commit -m "fix: make email login case-insensitive

- Convert emails to lowercase before comparison
- Add test cases for uppercase, lowercase, and mixed case
- Fixes #123

Tested:
- All existing tests pass
- New tests for case-insensitive comparison
- Manual testing in dev environment

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Step 9: Create Pull Request

```bash
# Push to remote
git push origin fix/case-sensitive-email

# Create PR
gh pr create \
  --title "fix: make email login case-insensitive" \
  --body "$(cat <<'EOF'
## Problem
Users couldn't log in when email case didn't match registration.

Example:
- Register: John@Example.com
- Login: john@example.com → ❌ Failed

## Solution
Convert emails to lowercase before comparison.

## Changes
- Modified `compareEmails()` in `auth.service.ts`
- Added 3 test cases for case-insensitive comparison
- All tests passing (23/23)

## Testing
- ✅ Unit tests
- ✅ Integration tests
- ✅ Manual testing in dev environment

## Artifacts
ASMO workflow artifacts in: asmo-output/2026-02-09_14-30-15_bug_fix_workflow/

Fixes #123
EOF
)"
```

---

## Lessons Learned

### What Went Well ✅

1. **Fast Investigation**: Debugger found root cause in 18 minutes
2. **Simple Fix**: One-line code change solved the problem
3. **Comprehensive Testing**: 3 new tests ensure bug doesn't reoccur
4. **Adaptive Workflow**: Skipped architect and code-reviewer (saved 40% time)
5. **Complete Documentation**: All analysis, implementation, and test results documented

### ASMO Benefits 🚀

1. **Systematic Approach**: Investigation → Implementation → Testing
2. **Time Savings**: 1h 8m (adaptive) vs ~2h (full workflow)
3. **Quality Assurance**: Comprehensive testing automatically included
4. **Documentation**: Full audit trail of root cause, fix, and validation
5. **No Oversight**: Workflow ensured testing wasn't skipped

### Without ASMO

If you had done this manually:
- ❌ Might skip investigation (just guess the fix)
- ❌ Might forget to add tests
- ❌ No documentation of root cause
- ❌ Risk of incomplete testing

**ASMO ensured:**
- ✅ Proper investigation
- ✅ Comprehensive testing
- ✅ Complete documentation
- ✅ Quality assurance

---

## Key Takeaways

1. **Use ASMO for bugs** - Even simple bugs benefit from systematic workflow
2. **Trust adaptive features** - Workflow automatically optimized for simple bugs
3. **Review artifacts** - Rich documentation helps future debugging
4. **Don't skip tests** - ASMO ensures comprehensive testing
5. **Total time: ~1h** - Fast and thorough

---

## Complexity Comparison

| Bug Type | Complexity | Workflow Steps | Time |
|----------|-----------|---------------|------|
| **This example** | 35 (Simple-Medium) | 3 steps (debugger, developer, tester) | ~1h |
| **Medium bug** | 55 | 4 steps (+ code-reviewer) | ~2h |
| **Complex bug** | 80 | 5 steps (+ architect + code-reviewer) | ~3h |

**Adaptive workflow saved 40% time** by skipping unnecessary steps.

---

## Try It Yourself

```bash
# Clone the example repository
git clone https://github.com/asmo-examples/case-sensitive-email-bug
cd case-sensitive-email-bug

# Checkout branch with bug
git checkout bug/case-sensitive-email

# Run ASMO
asmo run "Fix login bug where email comparison is case-sensitive"

# Compare your results with the solution
git checkout solution/case-sensitive-email
```

---

**Next Example:** [Add a Feature](./02-add-feature.md)
