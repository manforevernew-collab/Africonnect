import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container" style={{ textAlign: 'center', padding: '100px 24px' }}>
      <h1 style={{ fontSize: 72, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 8 }}>404</h1>
      <p style={{ fontSize: 18, color: 'var(--color-text-secondary)', marginBottom: 24 }}>Page not found</p>
      <Link to="/" className="btn btn-primary">Go Home</Link>
    </div>
  )
}
