# Example Scenario: Adding Due Dates to Todos

This document demonstrates how AI1st would orchestrate the implementation of a new feature: adding due dates to todo items.

## User Request

> "Add due date field to todos so I can track when tasks are due"

## AI1st Orchestration

### Phase 1: Design (Architect Agent - 2 minutes)

**Analysis:**
- Need to extend Todo interface with optional `dueDate` field
- Add date picker in TodoForm
- Display due date in TodoItem with visual indicators
- Sort todos by due date (optional enhancement)

**Design Decisions:**
```typescript
interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: number
  dueDate?: number  // NEW: Optional due date timestamp
}
```

**UI Changes:**
- Add date input to TodoForm
- Show due date badge in TodoItem
- Color-code overdue items (red), due today (yellow), future (green)

**Approval:** ✓ User reviews and approves design

---

### Phase 2: Implementation (Developer Agent - 3 minutes)

**Changes Made:**

1. **Update types** (`src/types.ts`):
   - Add `dueDate?: number` to Todo interface
   - Add `updateTodoDueDate: (id: string, dueDate: number | undefined) => void` to TodoStore

2. **Update store** (`src/store.ts`):
   - Implement `updateTodoDueDate` action
   - Persist due dates to localStorage

3. **Update TodoForm** (`src/components/TodoForm.tsx`):
   - Add date input field
   - Handle due date in form submission

4. **Update TodoItem** (`src/components/TodoItem.tsx`):
   - Display due date badge
   - Add visual indicators for overdue/upcoming tasks
   - Add edit due date functionality

**Implementation Time:** ~3 minutes (TDD approach)

---

### Phase 3: Testing (Tester Agent - 2 minutes)

**Test Cases:**
1. ✓ Create todo with due date
2. ✓ Create todo without due date
3. ✓ Update existing todo due date
4. ✓ Clear due date from todo
5. ✓ Visual indicators for overdue (past date)
6. ✓ Visual indicators for due today
7. ✓ Visual indicators for future dates
8. ✓ localStorage persistence works
9. ✓ Edge case: Invalid dates handled
10. ✓ Edge case: Very far future dates

**All Tests Passed:** ✓

---

## Total Time: 7 minutes

**Breakdown:**
- Design: 2 minutes
- Implementation: 3 minutes
- Testing: 2 minutes

**Result:** Fully working feature with quality validation, delivered autonomously by AI1st orchestration system.

---

## Key Benefits Demonstrated

1. **Autonomous Coordination:** No need to manually switch between design, coding, and testing
2. **Quality Gates:** Approval checkpoints ensure design is validated before implementation
3. **Comprehensive Testing:** Automated test coverage including edge cases
4. **Fast Delivery:** 7 minutes from request to working feature
5. **Documentation:** This scenario document auto-generated as part of workflow

---

## Try It Yourself

To see AI1st in action with this Todo app:

```bash
# Install AI1st CLI
npm install -g @ai1st/cli

# Initialize in this project
cd packages/examples/todo-app
ai1st init

# Run a workflow
ai1st run simple-feature "Add due date field to todos"
```

Watch as the architect, developer, and tester agents autonomously collaborate to implement your feature!
