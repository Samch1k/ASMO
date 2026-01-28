import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>404</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Page not found
      </p>
      <Link to="/">Go back home</Link>
    </div>
  )
}

export default NotFoundPage
