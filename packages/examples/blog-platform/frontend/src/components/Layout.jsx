import { Outlet, Link } from 'react-router-dom'
import './Layout.css'

function Layout() {
  return (
    <div className="layout">
      <header className="header">
        <div className="container">
          <Link to="/" className="logo">
            <h1>Blog Platform</h1>
          </Link>
          <nav>
            <Link to="/">Home</Link>
          </nav>
        </div>
      </header>
      <main className="main">
        <div className="container">
          <Outlet />
        </div>
      </main>
      <footer className="footer">
        <div className="container">
          <p>Built with AI1st - Autonomous Development Teams</p>
        </div>
      </footer>
    </div>
  )
}

export default Layout
