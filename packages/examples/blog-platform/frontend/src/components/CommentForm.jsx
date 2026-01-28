import { useState } from 'react'
import './CommentForm.css'

function CommentForm({ postId, onCommentAdded }) {
  const [formData, setFormData] = useState({
    author_name: '',
    author_email: '',
    content: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: postId,
          ...formData
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit comment')
      }

      const data = await res.json()
      setSuccess(true)
      setFormData({ author_name: '', author_email: '', content: '' })

      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <h3>Leave a Comment</h3>

      {error && <div className="form-error">{error}</div>}
      {success && (
        <div className="form-success">
          Comment submitted! It will appear after approval.
        </div>
      )}

      <div className="form-group">
        <label htmlFor="author_name">Name</label>
        <input
          type="text"
          id="author_name"
          name="author_name"
          value={formData.author_name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="author_email">Email</label>
        <input
          type="email"
          id="author_email"
          name="author_email"
          value={formData.author_email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="content">Comment</label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          rows="4"
          required
        />
      </div>

      <button type="submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Comment'}
      </button>
    </form>
  )
}

export default CommentForm
