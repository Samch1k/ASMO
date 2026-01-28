import db from './index.js'

// Clear existing data
db.prepare('DELETE FROM comments').run()
db.prepare('DELETE FROM posts').run()

// Sample posts
const posts = [
  {
    title: 'Getting Started with AI1st',
    slug: 'getting-started-with-ai1st',
    excerpt: 'Learn how to set up AI1st orchestration system for autonomous development teams.',
    content: `AI1st is a breakthrough orchestration system that transforms AI from a helpful assistant into an autonomous development team.

In this post, we'll explore the core concepts and show you how to get started with your first AI1st project.

The system coordinates multiple specialized AI agents (architect, developer, tester, etc.) to work together autonomously, handling complex software development tasks with minimal human intervention.`,
    author: 'Alex Smith',
    status: 'published'
  },
  {
    title: 'Parallel Execution with AI Agents',
    slug: 'parallel-execution-with-ai-agents',
    excerpt: 'Discover how AI1st enables multiple agents to work simultaneously on different parts of your codebase.',
    content: `One of the most powerful features of AI1st is parallel execution. Instead of agents working sequentially, multiple agents can work on different tasks simultaneously.

For example, while the backend developer agent implements API endpoints, the UI developer agent can create frontend components in parallel. The system automatically merges their work and resolves conflicts.

This dramatically reduces development time for complex features.`,
    author: 'Jamie Chen',
    status: 'published'
  },
  {
    title: 'UX-First Development Workflow',
    slug: 'ux-first-development-workflow',
    excerpt: 'How AI1st puts user experience at the center of the development process.',
    content: `Traditional development often treats UX as an afterthought. AI1st takes a different approach.

The UX Designer agent works alongside the Architect to design interfaces before implementation begins. This ensures that technical decisions support user needs rather than constraining them.

The result? Better user experiences and fewer costly redesigns later in the project.`,
    author: 'Taylor Martinez',
    status: 'published'
  },
  {
    title: 'Building This Blog with AI1st',
    slug: 'building-this-blog-with-ai1st',
    excerpt: 'A behind-the-scenes look at how this blog platform was built using AI1st orchestration.',
    content: `This blog platform you're reading was built using AI1st! Here's how it worked:

1. The Architect agent designed the database schema and API structure
2. The Backend Developer created Express routes and SQLite integration
3. The Frontend Developer built React components in parallel
4. The Tester agent wrote integration tests
5. The DevOps agent set up deployment scripts

Total development time: approximately 30 minutes of autonomous work.`,
    author: 'Morgan Lee',
    status: 'published'
  }
]

console.log('Seeding database...')

// Insert posts
for (const post of posts) {
  const result = db
    .prepare(
      `INSERT INTO posts (title, slug, content, excerpt, author, status, published_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
    )
    .run(post.title, post.slug, post.content, post.excerpt, post.author, post.status)

  console.log(`  ✓ Created post: ${post.title}`)

  // Add some comments to the first post
  if (post.slug === 'getting-started-with-ai1st') {
    const comments = [
      {
        author_name: 'Sarah Johnson',
        author_email: 'sarah@example.com',
        content: 'This is exactly what I\'ve been looking for! Can\'t wait to try it out.',
        status: 'approved'
      },
      {
        author_name: 'David Park',
        author_email: 'david@example.com',
        content: 'Great introduction. The autonomous coordination aspect is really impressive.',
        status: 'approved'
      }
    ]

    for (const comment of comments) {
      db.prepare(
        `INSERT INTO comments (post_id, author_name, author_email, content, status)
         VALUES (?, ?, ?, ?, ?)`
      ).run(result.lastInsertRowid, comment.author_name, comment.author_email, comment.content, comment.status)
    }

    console.log(`    ✓ Added ${comments.length} comments`)
  }
}

console.log('✓ Database seeded successfully')
db.close()
