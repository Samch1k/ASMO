import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import CommentForm from '../components/CommentForm'
import CommentList from '../components/CommentList'
import './PostPage.css'

function PostPage() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`/api/posts/${slug}`)
      .then(res => {
        if (!res.ok) {
          if (res.status === 404) throw new Error('Post not found')
          throw new Error('Failed to fetch post')
        }
        return res.json()
      })
      .then(data => {
        setPost(data.post)
        setComments(data.comments)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [slug])

  const handleCommentAdded = (newComment) => {
    setComments([newComment, ...comments])
  }

  if (loading) {
    return <div className="loading">Loading post...</div>
  }

  if (error) {
    return (
      <div className="error-page">
        <p className="error">{error}</p>
        <Link to="/" className="back-link">← Back to home</Link>
      </div>
    )
  }

  return (
    <div className="post-page">
      <Link to="/" className="back-link">← Back to all posts</Link>

      <article className="post-content">
        <h1>{post.title}</h1>
        <p className="post-meta">
          By {post.author} • {new Date(post.published_at).toLocaleDateString()}
        </p>
        <div className="post-body">
          {post.content.split('\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </article>

      <section className="comments-section">
        <h2>Comments ({comments.length})</h2>
        <CommentForm postId={post.id} onCommentAdded={handleCommentAdded} />
        <CommentList comments={comments} />
      </section>
    </div>
  )
}

export default PostPage
