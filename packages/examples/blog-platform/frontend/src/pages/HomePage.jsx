import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './HomePage.css'

function HomePage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/posts')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch posts')
        return res.json()
      })
      .then(data => {
        setPosts(data.posts)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="loading">Loading posts...</div>
  }

  if (error) {
    return <div className="error">Error: {error}</div>
  }

  if (posts.length === 0) {
    return <div className="empty">No posts yet. Check back soon!</div>
  }

  return (
    <div className="home-page">
      <h1>Recent Posts</h1>
      <div className="posts-grid">
        {posts.map(post => (
          <article key={post.id} className="post-card">
            <h2>
              <Link to={`/post/${post.slug}`}>{post.title}</Link>
            </h2>
            <p className="post-meta">
              By {post.author} • {new Date(post.published_at).toLocaleDateString()}
            </p>
            {post.excerpt && <p className="post-excerpt">{post.excerpt}</p>}
          </article>
        ))}
      </div>
    </div>
  )
}

export default HomePage
