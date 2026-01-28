import { Router } from 'express'
import db from '../db/index.js'

const router = Router()

// Add comment to post
router.post('/', (req, res) => {
  try {
    const { post_id, author_name, author_email, content } = req.body

    if (!post_id || !author_name || !author_email || !content) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Verify post exists
    const post = db
      .prepare('SELECT id FROM posts WHERE id = ? AND status = "published"')
      .get(post_id)

    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }

    const result = db
      .prepare(
        `INSERT INTO comments (post_id, author_name, author_email, content)
         VALUES (?, ?, ?, ?)`
      )
      .run(post_id, author_name, author_email, content)

    const comment = db
      .prepare('SELECT * FROM comments WHERE id = ?')
      .get(result.lastInsertRowid)

    res.status(201).json({ comment })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Approve comment
router.patch('/:id/approve', (req, res) => {
  try {
    const result = db
      .prepare('UPDATE comments SET status = "approved" WHERE id = ?')
      .run(req.params.id)

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Comment not found' })
    }

    const comment = db
      .prepare('SELECT * FROM comments WHERE id = ?')
      .get(req.params.id)

    res.json({ comment })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
