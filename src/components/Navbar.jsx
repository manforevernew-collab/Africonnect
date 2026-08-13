import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

export default function Navbar() {
  const { user, profile, isAdmin, isBusiness, isJobSeeker, kycVerified, addressVerified, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const allVerified = kycVerified && addressVerified

  const navLinks = [
    { path: '/professionals', label: 'Professionals' },
    { path: '/jobs', label: 'Jobs' },
  ]

  if (isJobSeeker && allVerified) {
    navLinks.push({ path: '/matches', label: 'My Matches' })
  }

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  function getAvatarContent() {
    if (profile?.avatar_url) {
      return <img src={profile.avatar_url} alt="Avatar" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
    }
    return (
      <div className="avatar" style={{ width: 36, height: 36, fontSize: 13 }}>
        {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
      </div>
    )
  }

  return (
    <nav style={{ borderBottom: '1px solid var(--color-border)', background: 'white', position: 'sticky', top: 0, zIndex: 50 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <Link to="/" style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--color-text)' }}>
          AfriConnect<span style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-muted)', marginLeft: 6, letterSpacing: '0.5px' }}>v2</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="desktop-nav">
          {navLinks.map(link => (
            <Link key={link.path} to={link.path} className="btn btn-ghost"
              style={{ background: location.pathname === link.path ? 'var(--color-bg-muted)' : 'transparent', fontWeight: location.pathname === link.path ? 600 : 500 }}>
              {link.label}
            </Link>
          ))}

          {isBusiness && allVerified && (
            <Link to="/post-job" className="btn btn-ghost"
              style={{ background: location.pathname === '/post-job' ? 'var(--color-bg-muted)' : 'transparent', fontWeight: location.pathname === '/post-job' ? 600 : 500 }}>
              Post Job
            </Link>
          )}

          {isAdmin && (
            <Link to="/admin" className="btn btn-ghost"
              style={{ background: location.pathname === '/admin' ? 'var(--color-bg-muted)' : 'transparent', fontWeight: location.pathname === '/admin' ? 600 : 500 }}>
              Admin
            </Link>
          )}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 8 }}>
              <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {getAvatarContent()}
              </Link>
              <button className="btn btn-outline" onClick={handleSignOut} style={{ padding: '8px 14px', fontSize: 13 }}>Logout</button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ marginLeft: 8 }}>Login</Link>
          )}
        </div>

        <button className="btn btn-ghost mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'none' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? <><path d="M18 6L6 18M6 6l12 12"/></> : <><path d="M3 12h18M3 6h18M3 18h18"/></>}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-menu" style={{ display: 'none', borderTop: '1px solid var(--color-border)', padding: '12px 24px', background: 'white' }}>
          {navLinks.map(link => (
            <Link key={link.path} to={link.path} className="btn btn-ghost" style={{ display: 'block', width: '100%', textAlign: 'left' }}>{link.label}</Link>
          ))}
          {isBusiness && allVerified && <Link to="/post-job" className="btn btn-ghost" style={{ display: 'block', width: '100%', textAlign: 'left' }}>Post Job</Link>}
          {isAdmin && <Link to="/admin" className="btn btn-ghost" style={{ display: 'block', width: '100%', textAlign: 'left' }}>Admin</Link>}
        </div>
      )}
    </nav>
  )
}
