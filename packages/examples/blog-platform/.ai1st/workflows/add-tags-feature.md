# Example Workflow: Adding Tags Feature

This document demonstrates how AI1st would autonomously build a "tags" feature for the blog platform.

## User Request

> "Add tags to blog posts with filtering capability"

## AI1st Workflow Execution

### Phase 1: Design (Parallel - 4 minutes)

**Architect Agent:**
```sql
-- Database schema changes
CREATE TABLE tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

CREATE TABLE post_tags (
  post_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (post_id, tag_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE INDEX idx_post_tags_tag_id ON post_tags(tag_id);

-- API endpoints needed:
-- GET /api/tags - List all tags with post counts
-- GET /api/tags/:slug/posts - Get posts by tag
-- POST /api/posts/:id/tags - Add tags to post
```

**UX Designer Agent:**
```
Component hierarchy:
- <TagList> - Display tags on post card
- <TagFilter> - Filter posts by tag on homepage
- <TagInput> - Add/remove tags (admin interface)

User flows:
1. User sees tags below post title
2. User clicks tag → filters posts by that tag
3. Clear filter button returns to all posts

Accessibility:
- Tags are clickable links (keyboard navigable)
- Active filter clearly indicated
- Screen reader announcements for filter changes
```

**Design Review → Approved ✓**

---

### Phase 2: Implementation (Parallel - 12 minutes)

**Backend Developer Agent:**

*Creates migration:*
```javascript
// backend/src/db/migrations/002_add_tags.sql
// (SQL from architect above)
```

*Creates tags route:*
```javascript
// backend/src/routes/tags.js
router.get('/', (req, res) => {
  const tags = db.prepare(`
    SELECT t.*, COUNT(pt.post_id) as post_count
    FROM tags t
    LEFT JOIN post_tags pt ON t.id = pt.id
    GROUP BY t.id
    ORDER BY t.name
  `).all()
  res.json({ tags })
})

router.get('/:slug/posts', (req, res) => {
  const posts = db.prepare(`
    SELECT p.*
    FROM posts p
    JOIN post_tags pt ON p.id = pt.post_id
    JOIN tags t ON pt.tag_id = t.id
    WHERE t.slug = ? AND p.status = 'published'
    ORDER BY p.published_at DESC
  `).all(req.params.slug)
  res.json({ posts })
})
```

*Updates posts route:*
```javascript
// backend/src/routes/posts.js
// Added tags to post queries
```

**UI Developer Agent (working in parallel):**

*Creates TagList component:*
```jsx
// frontend/src/components/TagList.jsx
function TagList({ tags, onTagClick }) {
  return (
    <div className="tag-list">
      {tags.map(tag => (
        <button
          key={tag.id}
          className="tag"
          onClick={() => onTagClick(tag.slug)}
          aria-label={`Filter by ${tag.name}`}
        >
          {tag.name}
        </button>
      ))}
    </div>
  )
}
```

*Creates TagFilter component:*
```jsx
// frontend/src/components/TagFilter.jsx
function TagFilter({ activeTag, onClearFilter }) {
  if (!activeTag) return null

  return (
    <div className="tag-filter-active" role="status">
      Filtered by: <strong>{activeTag}</strong>
      <button onClick={onClearFilter}>Clear</button>
    </div>
  )
}
```

*Updates HomePage:*
```jsx
// frontend/src/pages/HomePage.jsx
// Added tag filtering logic
// Added tag click handlers
// Integrated TagList and TagFilter components
```

**Merge Coordinator Agent:**
- Combines backend + frontend changes
- Resolves no conflicts (clean parallel work)
- Validates API contracts match

**Implementation Review → Approved ✓**

---

### Phase 3: Testing (Sequential - 6 minutes)

**Tester Agent:**

*Integration tests:*
```javascript
// backend/tests/tags.test.js
describe('Tags API', () => {
  test('GET /api/tags returns all tags with counts', async () => {
    const res = await request(app).get('/api/tags')
    expect(res.status).toBe(200)
    expect(res.body.tags).toBeInstanceOf(Array)
  })

  test('GET /api/tags/:slug/posts returns filtered posts', async () => {
    const res = await request(app).get('/api/tags/ai1st/posts')
    expect(res.status).toBe(200)
    expect(res.body.posts.every(p =>
      p.tags.some(t => t.slug === 'ai1st')
    )).toBe(true)
  })
})
```

*E2E tests:*
```javascript
// frontend/tests/e2e/tag-filtering.spec.js
test('user can filter posts by tag', async ({ page }) => {
  await page.goto('/')
  await page.click('text=AI1st')  // Click tag
  await expect(page.locator('.tag-filter-active')).toBeVisible()
  await expect(page.locator('.post-card')).toHaveCount(3)  // 3 AI1st posts
})
```

**All tests pass ✓**

---

## Summary

**Total Time:** 22 minutes (vs ~35 minutes sequential)

**Files Changed:**
- Backend: 3 files (migration, routes, tests)
- Frontend: 4 files (components, pages, tests)
- Total: 7 files

**Agents Involved:**
- Architect (design)
- UX Designer (mockups, flows)
- Backend Developer (API implementation)
- UI Developer (components, parallel)
- Merge Coordinator (combination)
- Tester (validation)

**Key Benefits:**
1. ✅ Parallel execution saved ~13 minutes
2. ✅ UX design prevented accessibility issues
3. ✅ All tests passing before merge
4. ✅ Zero human intervention required
5. ✅ Production-ready code

---

## How to Run This Workflow

```bash
# In the blog-platform directory
ai1st run feature_with_ux --task "Add tags to blog posts with filtering"

# AI1st will:
# 1. Load the workflow configuration
# 2. Assign agents to parallel phases
# 3. Coordinate implementation
# 4. Run tests automatically
# 5. Request approval at checkpoints
```
