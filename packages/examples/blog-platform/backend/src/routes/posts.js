import { Router } from 'express'
import db from '../db/index.js'

const router = Router()

// Get all published posts
router.get('/', (req, res) => {
  try {
    const posts = db
      .prepare(
        `SELECT id, title, slug, excerpt, author, published_at, created_at
         FROM posts
         WHERE status = 'published'
         ORDER BY published_at DESC`
      )
      .all()

    res.json({ posts })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get single post by slug
router.get('/:slug', (req, res) => {
  try {
    const post = db
      .prepare(
        `SELECT id, title, slug, content, author, published_at, created_at
         FROM posts
         WHERE slug = ? AND status = 'published'`
      )
      .get(req.params.slug)

    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }

    // Get approved comments
    const comments = db
      .prepare(
        `SELECT id, author_name, content, created_at
         FROM comments
         WHERE post_id = ? AND status = 'approved'
         ORDER BY created_at DESC`
      )
      .all(post.id)

    res.json({ post, comments })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create new post
router.post('/', (req, res) => {
  try {
    const { title, slug, content, excerpt, author } = req.body

    if (!title || !slug || !content || !author) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const result = db
      .prepare(
        `INSERT INTO posts (title, slug, content, excerpt, author)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(title, slug, content, excerpt, author)

    const post = db
      .prepare('SELECT * FROM posts WHERE id = ?')
      .get(result.lastInsertRowid)

    res.status(201).json({ post })
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Post with this slug already exists' })
    }
    res.status(500).json({ error: error.message })
  }
})

// Publish post
router.patch('/:slug/publish', (req, res) => {
  try {
    const result = db
      .prepare(
        `UPDATE posts
         SET status = 'published',
             published_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE slug = ?`
      )
      .run(req.params.slug)

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Post not found' })
    }

    const post = db
      .prepare('SELECT * FROM posts WHERE slug = ?')
      .get(req.params.slug)

    res.json({ post })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
