# Example 2: Add a Feature

Complete walkthrough of implementing a new feature using ASMO.

---

## Scenario

Product owner requests a new feature:

> **Feature Request:** User Profile Page
>
> **Description:**
> Users should be able to view and edit their profile with:
> - Avatar upload
> - Display name
> - Email (read-only)
> - Bio (500 chars max)
> - Save/Cancel buttons
>
> **Acceptance Criteria:**
> - Profile page accessible at `/profile`
> - Avatar uploads to S3
> - Changes save to database
> - Validation for bio length
> - Loading states during save
> - Error handling

---

## Step 1: Analyze Complexity

```bash
asmo analyze "Add user profile page with avatar upload, name, email, and bio editing"
```

**Output:**
```
🔍 Complexity Analysis

Task: "Add user profile page with avatar upload, name, email, and bio editing"

Scores:
  Technical Scope:     7/10  (Multiple components: UI, API, storage, database)
  Business Impact:     6/10  (User-facing feature, moderate impact)
  Risk Level:          5/10  (New feature, additive change)
  Performance Impact:  5/10  (Image uploads, storage)

Overall Complexity: 60/100 (Medium-Complex)

Recommendation:
  Workflow: feature_implementation_full
  Reason: Multiple components require architectural planning

  Agents: architect, developer, tester
  Estimated Time: 5-6 hours

Phases:
  1. Architecture Design (1.5h)
     → API design, data model, storage strategy

  2. Development (2.5h)
     → UI components, API endpoints, storage integration

  3. Testing (1h)
     → Unit tests, integration tests, E2E tests

Why not dev_story_workflow?
  - Multiple systems involved (UI, API, S3, database)
  - Storage strategy needs architectural decision
  - Complexity (60) exceeds dev_story threshold (50)
```

---

## Step 2: Run ASMO

```bash
asmo run "Add user profile page with avatar upload, name, email, and bio editing"
```

---

## Step 3: Approval Checkpoint

```
📋 Workflow Plan: feature_implementation_full

Complexity: 60/100 (Medium-Complex)
Estimated Time: 5-6 hours

Phase 1: Architecture Design (architect)
  Duration: 1.5 hours
  Deliverables:
    • System design document
    • API contracts (OpenAPI)
    • Data models (TypeScript interfaces)
    • Storage strategy (S3 configuration)
    • Security considerations

Phase 2: Development (developer)
  Duration: 2.5 hours
  Deliverables:
    • UserProfile React component
    • Avatar upload component
    • API endpoints (/api/profile GET/PUT)
    • S3 integration
    • Database migration
    • Validation logic

Phase 3: Testing (tester)
  Duration: 1 hour
  Deliverables:
    • Unit tests (components, API)
    • Integration tests (full flow)
    • E2E test (user journey)

Total Cost:
  Session mode: $0.00 (free)
  API mode: ~$0.75

❓ Approve workflow? (Y/n) █
```

**Action:** Type `Y`

---

## Step 4: Phase 1 - Architecture Design

```
🤖 Phase 1/3: Architecture Design (architect)

📍 Current: Designing system architecture...

Architecture Decisions:
  ✓ API design (REST endpoints)
  ✓ Data model (User profile schema)
  ✓ Storage strategy (S3 for avatars)
  ✓ Security (signed URLs, input validation)
  ✓ Error handling strategy

✅ Architecture complete
📦 Artifacts:
   - architecture-design.md
   - api-contracts.yaml
   - data-models.ts
   - storage-strategy.md
⏱️  Time: 1h 25m
```

### Artifact: architecture-design.md

```markdown
# Architecture Design: User Profile Feature

## System Overview

```
┌─────────────┐     GET/PUT      ┌──────────────┐
│             │  /api/profile    │              │
│   React UI  │ ────────────────→│  API Server  │
│  (Profile)  │                  │  (Node.js)   │
└─────────────┘                  └──────────────┘
                                        │
                                        ├─────────────────┐
                                        │                 │
                                        ▼                 ▼
                                 ┌──────────┐      ┌──────────┐
                                 │ Database │      │ S3       │
                                 │ (Postgres)│     │ (Avatars)│
                                 └──────────┘      └──────────┘
```

## Components

### 1. Frontend (React)
- UserProfile page (`/profile`)
- AvatarUpload component
- ProfileForm component
- Loading/error states

### 2. Backend (Node.js + Express)
- GET `/api/profile` - Fetch user profile
- PUT `/api/profile` - Update profile
- POST `/api/profile/avatar` - Upload avatar

### 3. Storage (S3)
- Bucket: `user-avatars`
- Path: `avatars/{userId}/{timestamp}.jpg`
- Signed URLs (24h expiry)

### 4. Database (Postgres)
- Table: `user_profiles`
- Fields: user_id, display_name, bio, avatar_url, updated_at

## API Contracts

### GET /api/profile
```yaml
responses:
  200:
    body:
      user_id: string
      email: string
      display_name: string
      bio: string
      avatar_url: string
```

### PUT /api/profile
```yaml
request:
  body:
    display_name: string (required, 1-50 chars)
    bio: string (optional, max 500 chars)

responses:
  200:
    body:
      user_id: string
      display_name: string
      bio: string
      updated_at: timestamp
```

### POST /api/profile/avatar
```yaml
request:
  multipart/form-data:
    file: image/jpeg or image/png (max 5MB)

responses:
  200:
    body:
      avatar_url: string
```

## Data Model

```typescript
interface UserProfile {
  userId: string
  email: string
  displayName: string
  bio?: string
  avatarUrl?: string
  updatedAt: Date
}
```

## Security Considerations

1. **Authentication**: JWT required for all endpoints
2. **Authorization**: Users can only modify their own profile
3. **Input Validation**:
   - Display name: 1-50 chars, alphanumeric + spaces
   - Bio: max 500 chars
   - Avatar: JPEG/PNG only, max 5MB
4. **Rate Limiting**: 10 requests/minute per user
5. **S3 Security**: Signed URLs, bucket not public

## Error Handling

- 400: Invalid input (validation errors)
- 401: Not authenticated
- 403: Not authorized (editing other user's profile)
- 413: File too large (avatar > 5MB)
- 500: Server error
```

---

## Step 5: Phase 2 - Development

```
🤖 Phase 2/3: Development (developer)

📍 Current: Implementing user profile feature...

Progress:
  ✓ Database migration created
  ✓ API endpoints implemented
  ✓ S3 integration configured
  ✓ UserProfile component created
  ✓ AvatarUpload component created
  ✓ ProfileForm component created
  ✓ Validation logic added
  ✓ Error handling implemented
  ✓ Loading states added

Files created: 12
Lines of code: 850

✅ Development complete
📦 Artifacts:
   - src/components/UserProfile.tsx
   - src/components/AvatarUpload.tsx
   - src/components/ProfileForm.tsx
   - src/api/profile.ts (API endpoints)
   - src/services/s3.service.ts
   - migrations/add-user-profiles.sql
   - implementation-guide.md
⏱️  Time: 2h 35m
```

### Key Code Snippets

**UserProfile.tsx** (React component)
```typescript
export function UserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      const data = await response.json()
      setProfile(data)
    } catch (err) {
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (updates: Partial<UserProfile>) => {
    setLoading(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const updated = await response.json()
      setProfile(updated)
    } catch (err) {
      setError('Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />
  if (!profile) return null

  return (
    <div className="user-profile">
      <h1>User Profile</h1>
      <AvatarUpload
        currentAvatar={profile.avatarUrl}
        onUpload={(url) => setProfile({ ...profile, avatarUrl: url })}
      />
      <ProfileForm
        profile={profile}
        onSave={handleSave}
      />
    </div>
  )
}
```

**API Endpoints** (Express)
```typescript
// GET /api/profile
router.get('/profile', authenticateJWT, async (req, res) => {
  try {
    const profile = await db.query(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [req.user.id]
    )
    res.json(profile.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

// PUT /api/profile
router.put('/profile', authenticateJWT, validateProfile, async (req, res) => {
  const { displayName, bio } = req.body

  try {
    const updated = await db.query(
      'UPDATE user_profiles SET display_name = $1, bio = $2, updated_at = NOW() WHERE user_id = $3 RETURNING *',
      [displayName, bio, req.user.id]
    )
    res.json(updated.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

// POST /api/profile/avatar
router.post('/profile/avatar', authenticateJWT, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }

  try {
    const key = `avatars/${req.user.id}/${Date.now()}.jpg`
    const url = await s3Service.uploadAvatar(req.file.buffer, key)

    await db.query(
      'UPDATE user_profiles SET avatar_url = $1 WHERE user_id = $2',
      [url, req.user.id]
    )

    res.json({ avatarUrl: url })
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload avatar' })
  }
})
```

---

## Step 6: Phase 3 - Testing

```
🤖 Phase 3/3: Testing (tester)

📍 Current: Creating comprehensive test suite...

Tests Created:
  Unit Tests:
    ✓ UserProfile component (8 tests)
    ✓ AvatarUpload component (5 tests)
    ✓ ProfileForm component (7 tests)
    ✓ API endpoints (12 tests)
    ✓ Validation logic (6 tests)

  Integration Tests:
    ✓ Full profile update flow (3 tests)
    ✓ Avatar upload flow (2 tests)

  E2E Tests:
    ✓ User profile journey (1 test)

Total: 44 tests created

Test Execution:
  ✓ All unit tests passing (38/38)
  ✓ All integration tests passing (5/5)
  ✓ E2E test passing (1/1)

Coverage: 92%

✅ Testing complete
📦 Artifacts:
   - tests/components/UserProfile.test.tsx
   - tests/components/AvatarUpload.test.tsx
   - tests/components/ProfileForm.test.tsx
   - tests/api/profile.test.ts
   - tests/e2e/profile.spec.ts
   - test-results.md
   - coverage-report.html
⏱️  Time: 58 minutes
```

### Sample Tests

**UserProfile.test.tsx**
```typescript
describe('UserProfile', () => {
  it('should load and display profile', async () => {
    const { getByText } = render(<UserProfile />)

    await waitFor(() => {
      expect(getByText('User Profile')).toBeInTheDocument()
      expect(getByText('John Doe')).toBeInTheDocument()
    })
  })

  it('should handle save profile', async () => {
    const { getByLabelText, getByText } = render(<UserProfile />)

    fireEvent.change(getByLabelText('Display Name'), {
      target: { value: 'Jane Doe' }
    })

    fireEvent.click(getByText('Save'))

    await waitFor(() => {
      expect(getByText('Profile saved')).toBeInTheDocument()
    })
  })

  it('should validate bio length', async () => {
    const { getByLabelText, getByText } = render(<UserProfile />)

    const longBio = 'a'.repeat(501) // Over 500 chars
    fireEvent.change(getByLabelText('Bio'), {
      target: { value: longBio }
    })

    fireEvent.click(getByText('Save'))

    await waitFor(() => {
      expect(getByText('Bio must be 500 characters or less')).toBeInTheDocument()
    })
  })
})
```

---

## Step 7: Results Summary

```
🎉 Workflow Complete!

📊 Summary:
   Status: ✅ Success
   Steps completed: 3/3
   Total time: 4h 58m (actual) vs 5h (estimated)
   Efficiency: 100%

📦 Deliverables:
   ✅ architecture-design.md       - System architecture
   ✅ api-contracts.yaml           - API specifications
   ✅ data-models.ts               - TypeScript interfaces
   ✅ implementation-guide.md      - Implementation details

   Code:
   ✅ UserProfile.tsx              - Main profile component
   ✅ AvatarUpload.tsx             - Avatar upload component
   ✅ ProfileForm.tsx              - Profile form component
   ✅ profile.ts                   - API endpoints
   ✅ s3.service.ts                - S3 integration
   ✅ add-user-profiles.sql        - Database migration

   Tests:
   ✅ 44 tests created
   ✅ 92% code coverage
   ✅ All tests passing

🔍 Code Changes:
   Files created: 17
   Lines of code: 1,250
   Tests: 44
   Coverage: 92%

✨ Next Steps:
   1. Review artifacts in: ./asmo-output/2026-02-09_15-45-30_feature_implementation/
   2. Run database migration: npm run migrate
   3. Configure S3 bucket: aws s3 mb s3://user-avatars
   4. Run tests: npm test
   5. Start dev server: npm run dev
   6. Test manually at: http://localhost:3000/profile
   7. Create PR when ready
```

---

## Step 8: Manual Testing

```bash
# Run database migration
npm run migrate:up

# Configure S3 (one-time)
aws s3 mb s3://user-avatars
aws s3api put-bucket-cors --bucket user-avatars --cors-configuration file://cors.json

# Start dev server
npm run dev
```

**Test in browser:**
1. Go to http://localhost:3000/profile
2. Upload avatar (JPEG/PNG, < 5MB)
3. Edit display name
4. Edit bio (test 500 char limit)
5. Click Save
6. Verify changes persist on page refresh

---

## Step 9: Create Pull Request

```bash
# Create feature branch (if not already)
git checkout -b feature/user-profile

# Stage changes
git add .

# Commit
git commit -m "feat: add user profile page with avatar upload

Features:
- User profile page at /profile
- Avatar upload to S3
- Display name and bio editing
- Input validation (display name, bio length)
- Loading and error states

Components:
- UserProfile (main page)
- AvatarUpload (avatar management)
- ProfileForm (form handling)

Backend:
- GET /api/profile (fetch profile)
- PUT /api/profile (update profile)
- POST /api/profile/avatar (upload avatar)

Database:
- user_profiles table
- Migration: add-user-profiles.sql

Tests:
- 44 tests (38 unit, 5 integration, 1 E2E)
- 92% code coverage

Architecture:
- Complete architecture design
- API contracts (OpenAPI)
- S3 storage strategy
- Security considerations

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Push
git push origin feature/user-profile

# Create PR
gh pr create \
  --title "feat: add user profile page with avatar upload" \
  --body "$(cat <<'EOF'
## Feature
User profile page with avatar upload and profile editing.

## Components
- **UserProfile**: Main profile page component
- **AvatarUpload**: Avatar upload and management
- **ProfileForm**: Profile editing form

## API Endpoints
- `GET /api/profile` - Fetch user profile
- `PUT /api/profile` - Update profile (name, bio)
- `POST /api/profile/avatar` - Upload avatar to S3

## Database
- New table: `user_profiles`
- Migration: `migrations/add-user-profiles.sql`

## Tests
- ✅ 44 tests (38 unit, 5 integration, 1 E2E)
- ✅ 92% code coverage
- ✅ All tests passing

## Architecture
Complete architecture design with:
- System diagrams
- API contracts (OpenAPI)
- Data models
- S3 storage strategy
- Security considerations

See: `asmo-output/.../architecture-design.md`

## Acceptance Criteria
- [x] Profile page accessible at `/profile`
- [x] Avatar uploads to S3
- [x] Display name editable (1-50 chars)
- [x] Bio editable (max 500 chars)
- [x] Validation for all inputs
- [x] Loading states during operations
- [x] Error handling for all cases
- [x] Save/Cancel buttons working

## Manual Testing
1. Run migration: `npm run migrate:up`
2. Configure S3: `aws s3 mb s3://user-avatars`
3. Start server: `npm run dev`
4. Visit: http://localhost:3000/profile
5. Test avatar upload, name/bio editing

## Deployment Notes
- Requires S3 bucket: `user-avatars`
- Environment vars: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- Run migration before deployment

## ASMO Artifacts
Complete workflow artifacts in:
`asmo-output/2026-02-09_15-45-30_feature_implementation/`

Workflow: `feature_implementation_full`
Time: 4h 58m
Phases: Architecture (1h 25m) → Development (2h 35m) → Testing (58m)

Fixes #456
EOF
)"
```

---

## Lessons Learned

### What Went Well ✅

1. **Architecture First**: Upfront design saved time during implementation
2. **Clear API Contracts**: Frontend and backend development could happen in parallel
3. **Comprehensive Testing**: 92% coverage ensures quality
4. **Complete Documentation**: Architecture, API, and implementation all documented
5. **Time Estimate Accuracy**: 4h 58m actual vs 5h estimated (100% accurate)

### ASMO Benefits 🚀

1. **Structured Approach**: Architecture → Dev → Test
2. **Nothing Forgotten**: All aspects covered (UI, API, DB, storage, tests)
3. **Quality Built-in**: Comprehensive testing automatically included
4. **Production-Ready**: Security, error handling, validation all considered
5. **Documentation**: Complete audit trail and design docs

### Without ASMO

If you had done this manually:
- ❌ Might skip architecture phase (jump straight to coding)
- ❌ Might forget S3 security considerations
- ❌ Might skip comprehensive testing
- ❌ No documentation of design decisions
- ❌ Validation might be incomplete

**ASMO ensured:**
- ✅ Proper architecture design
- ✅ Security considerations upfront
- ✅ Comprehensive testing (44 tests)
- ✅ Complete documentation
- ✅ Input validation from the start

---

## Complexity Breakdown

| Aspect | Complexity Contribution |
|--------|------------------------|
| **Multiple components** | UI, API, S3, Database → High technical scope (7/10) |
| **User-facing** | Moderate business impact (6/10) |
| **New feature** | Moderate risk (5/10) - additive, not breaking |
| **Image uploads** | Moderate performance impact (5/10) |

**Total: 60/100 (Medium-Complex)**

This complexity justified using `feature_implementation_full` instead of `dev_story_workflow`.

---

## Comparison: dev_story vs feature_implementation_full

| Workflow | Phases | Time | Best For |
|----------|--------|------|----------|
| `dev_story_workflow` | Dev + Test | 2-4h | Single component, no architecture |
| `feature_implementation_full` | **Arch + Dev + Test** | 4-8h | Multiple components, architecture needed |

**This feature needed architecture because:**
- Multiple systems (UI, API, S3, DB)
- Storage strategy decision (S3 vs local)
- Security considerations (signed URLs, input validation)
- API contract design (needed upfront for parallel dev)

---

## Try It Yourself

```bash
# Clone the example repository
git clone https://github.com/asmo-examples/user-profile-feature
cd user-profile-feature

# Install dependencies
npm install

# Run ASMO
asmo run "Add user profile page with avatar upload, name, email, and bio editing"

# Compare your results
git diff main solution/user-profile
```

---

**Next Example:** [Testing Workflow](./03-testing-workflow.md)
