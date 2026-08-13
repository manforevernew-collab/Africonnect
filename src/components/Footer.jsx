import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-muted)', padding: '40px 0 24px' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>AfriConnect</div>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              Africa's premier professional network. Verified talent, verified opportunities.
            </p>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Platform</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link to="/professionals" style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Professionals</Link>
              <Link to="/jobs" style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Jobs</Link>
              <Link to="/matches" style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>AI Matching</Link>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Trust</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>KYC Verification</span>
              <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Address Verification</span>
              <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Verified Reviews</span>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16, fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center' }}>
          © 2026 AfriConnect. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
