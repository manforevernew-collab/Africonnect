// Ported from AfriTalent HomePage.tsx — Tailwind translated to inline styles,
// lucide icons mapped to Font Awesome, CTAs wired to this app's routes.
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const features = [
  { icon: 'fas fa-search', title: 'Smart Job Matching', desc: 'AI-powered recommendations that match your skills and aspirations with the perfect opportunities.' },
  { icon: 'fas fa-star', title: 'Honest Reviews', desc: 'Read verified employee reviews and salary insights before you apply. Make informed decisions.' },
  { icon: 'fas fa-building', title: 'Top Employers', desc: "Connect with Africa's leading companies, from startups to Fortune 500s operating on the continent." },
  { icon: 'fas fa-award', title: 'Verified Profiles', desc: 'Stand out with skill-verified profiles and professional credentials that employers trust.' },
  { icon: 'fas fa-globe-africa', title: 'Pan-African Network', desc: 'Access opportunities across Nigeria, Kenya, Ghana, South Africa, and 40+ African countries.' },
  { icon: 'fas fa-chart-line', title: 'Career Growth', desc: 'Get personalized career advice, salary benchmarks, and learning resources to level up.' },
]

const stats = [
  { value: '2M+', label: 'Active Users', icon: 'fas fa-users' },
  { value: '50K+', label: 'Job Listings', icon: 'fas fa-briefcase' },
  { value: '12K+', label: 'Companies', icon: 'fas fa-building' },
  { value: '150K+', label: 'Reviews', icon: 'fas fa-star' },
]

export default function Home() {
  const { user, kycVerified, addressVerified } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const needsKYC = user && (!kycVerified || !addressVerified)

  function handleSearch(e) {
    e.preventDefault()
    navigate(query.trim() ? `/jobs?q=${encodeURIComponent(query.trim())}` : '/jobs')
  }

  return (
    <div className="page-enter">
      {needsKYC && (
        <div style={{ background: 'rgba(245, 158, 11, 0.08)', borderBottom: '1px solid rgba(245, 158, 11, 0.2)', padding: '12px 24px' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--color-warning)', fontWeight: 500 }}>
              <i className="fas fa-exclamation-triangle" style={{ marginRight: 6 }}></i>
              Complete your verification to unlock all features
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              {!kycVerified && <Link to="/kyc" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: 12 }}>Verify KYC</Link>}
              {kycVerified && !addressVerified && <Link to="/verify-address" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: 12 }}>Verify Address</Link>}
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section style={{ position: 'relative', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', color: 'white', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.1, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: 80, left: 40, width: 288, height: 288, background: '#f59e0b', borderRadius: '50%', filter: 'blur(80px)' }}></div>
          <div style={{ position: 'absolute', bottom: 80, right: 40, width: 384, height: 384, background: '#3b82f6', borderRadius: '50%', filter: 'blur(80px)' }}></div>
        </div>

        <div style={{ position: 'relative', maxWidth: 1280, margin: '0 auto', padding: '96px 24px 128px' }}>
          <div style={{ textAlign: 'center', maxWidth: 768, margin: '0 auto' }}>
            <h1 style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 24 }}>
              Discover Africa's
              <span style={{ color: '#fbbf24' }}> Top Talent</span>
              <br />& Leading Companies
            </h1>
            <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: '#cbd5e1', marginBottom: 40, maxWidth: 640, margin: '0 auto 40px', lineHeight: 1.6 }}>
              AfriTalent connects skilled professionals with Africa's best employers.
              Read honest reviews, find your dream job, and grow your career.
            </p>

            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 48, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: 448, minWidth: 260 }}>
                <i className="fas fa-search" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 16 }}></i>
                <input
                  type="text"
                  placeholder="Job title, company, or keyword"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  style={{
                    width: '100%', padding: '16px 16px 16px 48px',
                    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 12, color: 'white', fontSize: 15, outline: 'none',
                  }}
                />
              </div>
              <button type="submit" style={{ padding: '16px 32px', background: '#f59e0b', color: 'white', fontWeight: 600, borderRadius: 12, fontSize: 15, border: 'none', cursor: 'pointer' }}>
                Search Jobs
              </button>
            </form>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 24, fontSize: 14, color: '#94a3b8' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><i className="fas fa-chart-line" style={{ color: '#fbbf24' }}></i> 50,000+ Jobs</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><i className="fas fa-building" style={{ color: '#fbbf24' }}></i> 12,000+ Companies</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><i className="fas fa-users" style={{ color: '#fbbf24' }}></i> 2M+ Professionals</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '64px 0', background: 'white' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 32 }}>
            {stats.map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <i className={stat.icon} style={{ fontSize: 28, color: '#f59e0b', marginBottom: 12, display: 'block' }}></i>
                <div style={{ fontSize: 30, fontWeight: 700, color: '#0f172a' }}>{stat.value}</div>
                <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 0', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>Why Choose AfriTalent?</h2>
            <p style={{ fontSize: 18, color: '#475569', maxWidth: 640, margin: '0 auto' }}>
              The most trusted platform for career growth and talent discovery across Africa.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 32 }}>
            {features.map(feature => (
              <div key={feature.title} className="card" style={{ padding: 32, borderRadius: 16 }}>
                <div style={{ width: 48, height: 48, background: '#fef3c7', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <i className={feature.icon} style={{ fontSize: 20, color: '#d97706' }}></i>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 600, color: '#0f172a', marginBottom: 12 }}>{feature.title}</h3>
                <p style={{ color: '#475569', lineHeight: 1.7, fontSize: 15 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 0', background: '#f59e0b' }}>
        <div style={{ maxWidth: 896, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 700, color: 'white', marginBottom: 24 }}>Ready to Accelerate Your Career?</h2>
          <p style={{ fontSize: 18, color: '#fef3c7', marginBottom: 40, maxWidth: 640, margin: '0 auto 40px' }}>
            Join millions of professionals who trust AfriTalent to find their next big opportunity.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/login" style={{ padding: '16px 32px', background: 'white', color: '#b45309', fontWeight: 600, borderRadius: 12, fontSize: 15 }}>
              Create Free Account
            </Link>
            <Link to="/post-job" style={{ padding: '16px 32px', background: '#b45309', color: 'white', fontWeight: 600, borderRadius: 12, fontSize: 15, border: '1px solid #fbbf24' }}>
              Post a Job
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
