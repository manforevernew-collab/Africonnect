// Ported from AfriTalent Footer.tsx — links adapted to this app's routes.
import { Link } from 'react-router-dom'
import AfriTalentLogo from './AfriTalentLogo'

const socials = [
  { icon: 'fab fa-twitter', href: 'https://twitter.com/afritalent' },
  { icon: 'fab fa-linkedin-in', href: 'https://linkedin.com/company/afritalent' },
  { icon: 'fab fa-instagram', href: 'https://instagram.com/afritalent' },
  { icon: 'fab fa-youtube', href: 'https://youtube.com/afritalent' },
]

const linkStyle = { fontSize: 14, color: '#cbd5e1', display: 'block' }

export default function Footer() {
  return (
    <footer style={{ background: '#0f172a', color: '#cbd5e1' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32 }}>
          <div>
            <AfriTalentLogo size="md" variant="light" />
            <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7, marginTop: 16, marginBottom: 16 }}>
              Africa's premier platform connecting top talent with leading businesses.
              Discover, review, and grow with AfriTalent.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              {socials.map(s => (
                <a key={s.icon} href={s.href} target="_blank" rel="noopener noreferrer"
                  style={{ padding: 8, background: '#1e293b', borderRadius: 8, color: '#cbd5e1', fontSize: 14, display: 'inline-flex' }}>
                  <i className={s.icon}></i>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ color: 'white', fontWeight: 600, marginBottom: 16, fontSize: 15 }}>For Talent</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link to="/jobs" style={linkStyle}>Browse Jobs</Link>
              <Link to="/reviews" style={linkStyle}>Company Reviews</Link>
              <Link to="/professionals" style={linkStyle}>Professionals</Link>
              <Link to="/matches" style={linkStyle}>AI Matching</Link>
            </div>
          </div>

          <div>
            <h3 style={{ color: 'white', fontWeight: 600, marginBottom: 16, fontSize: 15 }}>For Employers</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link to="/post-job" style={linkStyle}>Post a Job</Link>
              <Link to="/professionals" style={linkStyle}>Search Talent</Link>
              <Link to="/businesses" style={linkStyle}>Businesses</Link>
            </div>
          </div>

          <div>
            <h3 style={{ color: 'white', fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Contact Us</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="fas fa-envelope" style={{ color: '#f59e0b' }}></i>
                <a href="mailto:hello@afritalent.com" style={{ color: '#cbd5e1' }}>hello@afritalent.com</a>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="fas fa-phone" style={{ color: '#f59e0b' }}></i>
                <a href="tel:+2348001234567" style={{ color: '#cbd5e1' }}>+234 800 123 4567</a>
              </span>
              <span style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <i className="fas fa-map-marker-alt" style={{ color: '#f59e0b', marginTop: 3 }}></i>
                <span>Lagos, Nigeria<br />Nairobi, Kenya<br />Accra, Ghana</span>
              </span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <p style={{ fontSize: 14, color: '#64748b' }}>
            &copy; {new Date().getFullYear()} AfriTalent. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: 24, fontSize: 14, color: '#64748b' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Cookie Policy</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
