import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useMemo, useState } from 'react'
import AfriTalentLogo from './AfriTalentLogo'
import { getNewestMessageThreads, getNewestNotifications } from '../lib/inboxData'

export default function Navbar() {
  const { user, profile, isAdmin, isBusiness, isJobSeeker, kycVerified, addressVerified, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)

  const allVerified = kycVerified && addressVerified
  const conversations = useMemo(() => getNewestMessageThreads(), [])
  const notifications = useMemo(() => getNewestNotifications(), [])
  const unreadMessages = conversations.reduce((total, thread) => total + (thread.unread || 0), 0)
  const unreadNotifications = notifications.filter(item => item.unread).length
  const messagePreviews = conversations.slice(0, 5)
  const notificationPreviews = notifications.slice(0, 6)

  const navLinks = [
    { path: '/professionals', label: 'Professionals' },
    { path: '/businesses', label: 'Businesses' },
    { path: '/jobs', label: 'Jobs' },
    { path: '/reviews', label: 'Reviews' },
  ]

  if (user) {
    navLinks.push({ path: '/messages', label: 'Messages' })
  }

  if (isJobSeeker && allVerified) {
    navLinks.push({ path: '/matches', label: 'My Matches' })
  }

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  function handleNavigate(path) {
    setOpenDropdown(null)
    setMenuOpen(false)
    navigate(path)
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

  function NotificationBell() {
    return (
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setOpenDropdown(prev => prev === 'notifications' ? null : 'notifications')}
          aria-label="Notifications"
          style={{
            position: 'relative',
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: '1px solid var(--color-border)',
            background: 'white',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#475569',
            cursor: 'pointer'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
            <path d="M10 20a2 2 0 0 0 4 0" />
          </svg>
          {unreadNotifications > 0 && (
            <span style={{
              position: 'absolute',
              top: -4,
              right: -2,
              minWidth: 16,
              height: 16,
              borderRadius: 999,
              background: '#ef4444',
              color: 'white',
              fontSize: 9,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px'
            }}>{unreadNotifications}</span>
          )}
        </button>

        {openDropdown === 'notifications' && (
          <div style={{ position: 'absolute', top: 46, right: -10, width: 340, background: '#fff', border: '1px solid var(--color-border)', borderRadius: 16, boxShadow: '0 16px 40px rgba(15, 23, 42, 0.12)', zIndex: 60 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid var(--color-border)' }}>
              <strong style={{ fontSize: 14 }}>Notifications</strong>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{notificationPreviews.length} new</span>
            </div>
            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
              {notificationPreviews.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigate('/notifications')}
                  style={{
                    width: '100%',
                    border: 'none',
                    borderBottom: '1px solid var(--color-border)',
                    background: item.unread ? '#fff7ed' : '#fff',
                    textAlign: 'left',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    color: '#0f172a'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                    <strong style={{ fontSize: 13 }}>{item.title}</strong>
                    {item.unread && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block', marginTop: 4 }} />}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4, lineHeight: 1.4 }}>{item.text}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 6 }}>{item.time}</div>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => handleNavigate('/notifications')}
              style={{ width: '100%', border: 'none', borderTop: '1px solid var(--color-border)', background: '#fff', color: 'var(--color-primary)', fontWeight: 600, padding: '12px 14px', cursor: 'pointer' }}
            >
              View all notifications
            </button>
          </div>
        )}
      </div>
    )
  }

  function MessageIcon() {
    const hasUnread = unreadMessages > 0
    return (
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setOpenDropdown(prev => prev === 'messages' ? null : 'messages')}
          aria-label="Messages"
          style={{
            position: 'relative',
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: '1px solid var(--color-border)',
            background: 'white',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#475569',
            cursor: 'pointer'
          }}
        >
          {hasUnread ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z" />
              <path d="M4 8l8 6 8-6" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 8.5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.5" />
              <path d="M22 8.5L12 15 2 8.5" />
            </svg>
          )}
          {unreadMessages > 0 && (
            <span style={{
              position: 'absolute',
              top: -4,
              right: -2,
              minWidth: 16,
              height: 16,
              borderRadius: 999,
              background: '#ef4444',
              color: 'white',
              fontSize: 9,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px'
            }}>{unreadMessages}</span>
          )}
        </button>

        {openDropdown === 'messages' && (
          <div style={{ position: 'absolute', top: 46, right: -10, width: 340, background: '#fff', border: '1px solid var(--color-border)', borderRadius: 16, boxShadow: '0 16px 40px rgba(15, 23, 42, 0.12)', zIndex: 60 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid var(--color-border)' }}>
              <strong style={{ fontSize: 14 }}>Messages</strong>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{messagePreviews.length} preview{messagePreviews.length > 1 ? 's' : ''}</span>
            </div>
            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
              {messagePreviews.map(thread => {
                const lastMessage = thread.messages[thread.messages.length - 1]
                const previewText = lastMessage ? lastMessage.text : 'No messages yet'

                return (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => handleNavigate(`/messages?thread=${thread.id}`)}
                    style={{
                      width: '100%',
                      border: 'none',
                      borderBottom: '1px solid var(--color-border)',
                      background: '#fff',
                      textAlign: 'left',
                      padding: '12px 14px',
                      cursor: 'pointer',
                      color: '#0f172a'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar" style={{ width: 36, height: 36, fontSize: 11, background: '#fff1d6', color: '#b45309' }}>{thread.avatar}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                          <strong style={{ fontSize: 13 }}>{thread.contact}</strong>
                          {thread.unread > 0 && (
                            <span style={{ minWidth: 18, height: 18, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#f59e0b', color: 'white', fontSize: 10, fontWeight: 700 }}>{thread.unread}</span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{previewText}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>{lastMessage?.time || 'Now'}</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
            <button
              type="button"
              onClick={() => handleNavigate('/messages')}
              style={{ width: '100%', border: 'none', borderTop: '1px solid var(--color-border)', background: '#fff', color: 'var(--color-primary)', fontWeight: 600, padding: '12px 14px', cursor: 'pointer' }}
            >
              View messages
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <nav style={{ borderBottom: '1px solid var(--color-border)', background: 'white', position: 'sticky', top: 0, zIndex: 50 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
          <AfriTalentLogo size="sm" />
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
              <NotificationBell />
              <MessageIcon />
              <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {getAvatarContent()}
              </Link>
              <button className="btn btn-outline" onClick={handleSignOut} style={{ padding: '8px 14px', fontSize: 13 }}>Logout</button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ marginLeft: 8 }}>Login</Link>
          )}
        </div>

        <div className="mobile-nav-actions" style={{ display: 'none', alignItems: 'center', gap: 8 }}>
          {!user && (
            <Link to="/login" className="btn btn-primary" style={{ padding: '8px 12px', fontSize: 12, borderRadius: 10 }}>
              Sign In
            </Link>
          )}
          {user && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <NotificationBell />
                <MessageIcon />
              </div>
            </>
          )}
          <button className="btn btn-ghost mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'inline-flex', padding: '8px 10px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? <><path d="M18 6L6 18M6 6l12 12" /></> : <><path d="M3 12h18M3 6h18M3 18h18" /></>}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-menu" style={{ display: 'none', borderTop: '1px solid var(--color-border)', padding: '12px 24px', background: 'white', maxHeight: '70vh', overflowY: 'auto' }}>
          {navLinks.map(link => (
            <Link key={link.path} to={link.path} className="btn btn-ghost" onClick={() => setMenuOpen(false)} style={{ display: 'block', width: '100%', textAlign: 'left' }}>{link.label}</Link>
          ))}
          {isBusiness && allVerified && <Link to="/post-job" className="btn btn-ghost" onClick={() => setMenuOpen(false)} style={{ display: 'block', width: '100%', textAlign: 'left' }}>Post Job</Link>}
          {isAdmin && <Link to="/admin" className="btn btn-ghost" onClick={() => setMenuOpen(false)} style={{ display: 'block', width: '100%', textAlign: 'left' }}>Admin</Link>}
          {user ? (
            <button className="btn btn-outline" onClick={() => { setMenuOpen(false); handleSignOut() }} style={{ display: 'block', width: '100%', textAlign: 'center', marginTop: 8 }}>Logout</button>
          ) : (
            <Link to="/login" className="btn btn-primary" onClick={() => setMenuOpen(false)} style={{ display: 'block', width: '100%', textAlign: 'center', marginTop: 8 }}>Sign In</Link>
          )}
        </div>
      )}
    </nav>
  )
}

