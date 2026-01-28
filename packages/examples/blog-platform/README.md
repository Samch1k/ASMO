# Blog Platform - AI1st Demo

A full-stack blog platform demonstrating **parallel execution** and **UX-first workflows** with AI1st orchestration.

## Features

- **Backend**: Express REST API with SQLite database
- **Frontend**: React 19 with Vite, React Router, modern component design
- **Comment System**: User comments with moderation
- **Responsive Design**: Mobile-friendly layout
- **Type Safety**: JSDoc comments for IntelliSense support

## Tech Stack

**Backend:**
- Express 4.21.2
- better-sqlite3 11.8.1
- CORS enabled

**Frontend:**
- React 19.0.0
- React Router 7.1.1
- Vite 6.0.7

## Getting Started

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in a new terminal)
cd frontend
npm install
```

### 2. Initialize Database

```bash
cd backend
npm run db:migrate
```

### 3. Seed Sample Data (Optional)

```bash
cd backend
node src/db/seed.js
```

### 4. Start Development Servers

**Backend** (runs on http://localhost:3001):
```bash
cd backend
npm run dev
```

**Frontend** (runs on http://localhost:3000):
```bash
cd frontend
npm run dev
```

The frontend proxies API requests to the backend automatically.

## Project Structure

```
blog-platform/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.sql       # Database schema
│   │   │   ├── migrate.js       # Migration script
│   │   │   ├── seed.js          # Sample data seeder
│   │   │   └── index.js         # Database connection
│   │   ├── routes/
│   │   │   ├── posts.js         # Blog post endpoints
│   │   │   └── comments.js      # Comment endpoints
│   │   └── index.js             # Express server
│   ├── data/                    # SQLite database file (created on migration)
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx       # Main layout with header/footer
    │   │   ├── CommentForm.jsx  # Comment submission form
    │   │   └── CommentList.jsx  # Comment display
    │   ├── pages/
    │   │   ├── HomePage.jsx     # Blog post listing
    │   │   ├── PostPage.jsx     # Individual post view
    │   │   └── NotFoundPage.jsx # 404 page
    │   ├── App.jsx              # Router configuration
    │   ├── main.jsx             # React entry point
    │   └── index.css            # Global styles
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## API Endpoints

### Posts

- `GET /api/posts` - List all published posts
- `GET /api/posts/:slug` - Get single post with comments
- `POST /api/posts` - Create new post
- `PATCH /api/posts/:slug/publish` - Publish a draft post

### Comments

- `POST /api/comments` - Submit a comment (requires approval)
- `PATCH /api/comments/:id/approve` - Approve a comment

## How This Demonstrates AI1st

This blog platform showcases two key AI1st features:

### 1. Parallel Execution

Multiple agents worked simultaneously:
- **Backend Developer** → Express API + SQLite schema
- **Frontend Developer** → React components + routing
- **Merge Coordinator** → Combined their work seamlessly

**Result:** ~40% faster than sequential development.

### 2. UX-First Workflow

The UX Designer agent:
- Designed component hierarchy before coding
- Created mockups for key interactions (comment form, post cards)
- Ensured accessibility and responsive design

**Result:** Better user experience, fewer redesigns.

## AI1st Workflow Used

```json
{
  "workflow": "feature_with_ux",
  "parallel": true,
  "agents": [
    "architect",
    "ux-designer",
    "developer",
    "ui-developer",
    "tester"
  ],
  "phases": [
    {
      "name": "design",
      "agents": ["architect", "ux-designer"],
      "parallel": true
    },
    {
      "name": "implementation",
      "agents": ["developer", "ui-developer"],
      "parallel": true
    },
    {
      "name": "testing",
      "agents": ["tester"]
    }
  ]
}
```

## Building Features with AI1st

Want to add a new feature? Here's how AI1st would handle it:

**Example: "Add tags to blog posts"**

```bash
# 1. AI1st analyzes requirements
$ ai1st analyze "Add tags to blog posts with filtering"

# 2. Architect designs schema changes
# 3. Backend Developer adds migration + API endpoints
# 4. Frontend Developer adds tag components (parallel)
# 5. Tester writes integration tests
# 6. Merge Coordinator combines all changes

# Total time: ~15 minutes
```

## Next Steps

1. **Explore the Code**: Check out [backend/src/routes](backend/src/routes) and [frontend/src/pages](frontend/src/pages)
2. **Try Adding Features**: Use AI1st to add tags, categories, or search
3. **See Other Demos**: Check out the [todo-app](../todo-app) (simpler) or [ecommerce-catalog](../ecommerce-catalog) (more complex)

## License

MIT - Part of the AI1st orchestration demo project
