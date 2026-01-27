# AI1st Todo App Demo

> Simple todo application showcasing autonomous AI development orchestration

**Demo Complexity:** ⭐ Simple (15 minutes)
**Tech Stack:** React 19 • TypeScript • Zustand • Tailwind CSS • localStorage
**AI1st Features:** Basic orchestration • Sequential workflow • 3 agents

---

## What Is This?

This is a **demonstration application** for the AI1st orchestration system. While it functions as a working todo app, its primary purpose is to showcase how AI1st coordinates multiple AI agents to autonomously develop features.

## Quick Start

```bash
# Install dependencies (from monorepo root)
pnpm install

# Run development server
cd packages/examples/todo-app
pnpm dev

# Build for production
pnpm build
```

Visit [http://localhost:5173](http://localhost:5173) to see the app.

---

## AI1st Orchestration Demo

### The Scenario

Imagine you want to add a new feature: **due dates for todos**.

**Traditional Approach:**
1. You design the feature
2. You write the code
3. You test it
4. Repeat for bugs/changes

**With AI1st:**
```bash
ai1st run simple-feature "Add due date field to todos"
```

AI1st automatically:
1. **Architect Agent** (2 min): Designs data model and UI changes
2. **Developer Agent** (3 min): Implements feature with TDD
3. **Tester Agent** (2 min): Validates with comprehensive tests

**Total Time:** 7 minutes, fully autonomous

### Example Output

```
🤖 AI1st Orchestration Started
├─ 📐 Architect: Designing due date feature...
│  └─ ✓ Design complete (2m 14s) - Approval required
├─ 👤 User: Design approved ✓
├─ 👨‍💻 Developer: Implementing feature...
│  ├─ Modified: src/types.ts
│  ├─ Modified: src/store.ts
│  ├─ Modified: src/components/TodoForm.tsx
│  └─ Modified: src/components/TodoItem.tsx
│  └─ ✓ Implementation complete (3m 02s)
├─ 🧪 Tester: Running tests...
│  ├─ ✓ 10/10 tests passed
│  └─ ✓ Testing complete (1m 48s)
└─ ✅ Feature ready: "due date field" (7m 04s total)
```

---

## Application Features

### Current Functionality

- ✅ Add todos
- ✅ Mark todos as complete
- ✅ Delete todos
- ✅ Clear completed todos
- ✅ Persistent storage (localStorage)
- ✅ Responsive design
- ✅ Accessible UI (keyboard navigation, screen reader support)

### Potential AI1st Workflows

These features could be added using AI1st orchestration:

| Feature | Workflow | Est. Time |
|---------|----------|-----------|
| Due dates | `simple-feature` | 7 min |
| Priority levels | `simple-feature` | 8 min |
| Categories/tags | `simple-feature` | 10 min |
| Search/filter | `simple-feature` | 12 min |
| Dark mode | `ui-enhancement` | 5 min |
| Export to CSV | `simple-feature` | 9 min |

---

## Project Structure

```
todo-app/
├── src/
│   ├── components/
│   │   ├── TodoForm.tsx      # Form for adding todos
│   │   └── TodoItem.tsx      # Individual todo display
│   ├── store.ts              # Zustand state management
│   ├── types.ts              # TypeScript interfaces
│   ├── App.tsx               # Main application
│   └── index.css             # Tailwind CSS imports
│
├── .ai1st/
│   ├── config.ts             # AI1st configuration
│   ├── workflows/
│   │   └── simple-feature.json  # Example workflow
│   └── example-scenario.md   # Detailed walkthrough
│
├── package.json
├── vite.config.ts
└── README.md                 # This file
```

---

## AI1st Configuration

This demo uses a minimal AI1st configuration:

```typescript
// .ai1st/config.ts
export default {
  agents: ['architect', 'developer', 'tester'],
  timeouts: {
    architect: 180000,  // 3 minutes
    developer: 300000,  // 5 minutes
    tester: 180000,     // 3 minutes
  },
  parallel: {
    enabled: false,     // Sequential execution for simplicity
    maxAgents: 1,
  },
  approvalRequired: true,
}
```

**Why This Configuration?**
- **3 agents only**: Architect, Developer, Tester (minimal team)
- **Sequential workflow**: One agent at a time (easy to follow)
- **Short timeouts**: Fast iterations for simple features
- **Approval gates**: User reviews design before implementation

---

## Technology Stack

### Frontend
- **React 19**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first styling

### State Management
- **Zustand**: Lightweight state management
- **localStorage**: Persistence without backend

### AI1st Integration
- **@ai1st/core**: Orchestration engine (future integration)
- **Workflow templates**: Pre-defined agent coordination
- **Agent instructions**: Technology-specific guidance

---

## Learning Resources

### Understanding AI1st

1. **[Example Scenario](.ai1st/example-scenario.md)**: Detailed walkthrough of adding due dates
2. **[Simple Feature Workflow](.ai1st/workflows/simple-feature.json)**: JSON workflow definition
3. **[AI1st Configuration](.ai1st/config.ts)**: Project-specific settings

### Next Steps

- **Blog Platform Demo**: See parallel execution and UX workflows
- **E-commerce Demo**: See full AI1st features (config, instructions, quality gates)
- **[AI1st Documentation](../../docs)**: Comprehensive guides and API reference

---

## Comparison: Before vs After

### Traditional Development

```
User Request
    ↓
Manual Design (you)
    ↓
Manual Coding (you)
    ↓
Manual Testing (you)
    ↓
Bug Fixes (you)
    ↓
✓ Done (30-45 minutes)
```

### AI1st Orchestration

```
User Request
    ↓
ai1st run simple-feature "..."
    ↓
    ├─ Architect Agent (automated)
    ├─ Developer Agent (automated)
    └─ Tester Agent (automated)
    ↓
✓ Done (7 minutes)
```

---

## FAQ

### Is this a real todo app?

Yes! It's fully functional with persistent storage. But its primary purpose is demonstrating AI1st orchestration.

### Can I use AI1st with it right now?

The AI1st CLI is in development. This demo shows the *intended* workflow. The app works without AI1st as a standalone React application.

### How is this different from GitHub Copilot?

**GitHub Copilot**: Suggests code as you type (one developer, enhanced)
**AI1st**: Coordinates multiple specialized agents autonomously (autonomous team)

### What's next?

Try the **Blog Platform demo** to see:
- Parallel agent execution (faster delivery)
- UX-first workflows (design before code)
- More complex features (authentication, database, API)

---

## Contributing

This demo is part of the AI1st project. See the [main repository](../../..) for contribution guidelines.

---

## License

MIT © 2026 AI1st Contributors

---

**Ready for more?**
→ [Blog Platform Demo (Medium Complexity)](../blog-platform)
→ [E-commerce Demo (Full Features)](../ecommerce-catalog)
→ [AI1st Documentation](../../docs)
