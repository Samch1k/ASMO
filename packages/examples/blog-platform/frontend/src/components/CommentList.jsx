import './CommentList.css'

function CommentList({ comments }) {
  if (comments.length === 0) {
    return <p className="no-comments">No comments yet. Be the first to comment!</p>
  }

  return (
    <div className="comment-list">
      {comments.map(comment => (
        <div key={comment.id} className="comment">
          <div className="comment-header">
            <strong>{comment.author_name}</strong>
            <span className="comment-date">
              {new Date(comment.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="comment-content">{comment.content}</p>
        </div>
      ))}
    </div>
  )
}

export default CommentList
