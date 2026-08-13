import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user, profile, kycVerified, addressVerified } = useAuth()
  const [stats, setStats] = useState({ pros: 0, jobs: 0, users: 0 })
  const [featuredPros, setFeaturedPros] = useState([])
  const [featuredJobs, setFeaturedJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [{ count: pros }, { count: jobs }, { data: prosData }, { data: jobsData }] = await Promise.all([
          supabase.from('professionals').select('*', { count: 'exact', head: true }),
          supabase.from('jobs').select('*', { count: 'exact', head: true }),
          supabase.from('professionals').select('*').order('rating', { ascending: false }).limit(4),
          supabase.from('jobs').select('*').order('posted_at', { ascending: false }).limit(3)
        ])
        setStats({ pros: pros || 0, jobs: jobs || 0, users: 0 })
        setFeaturedPros(prosData || [])
        setFeaturedJobs(jobsData || [])
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    loadData()
  }, [])

  const needsKYC = user && (!kycVerified || !addressVerified)

  return (
    <div className="page-enter">
      {needsKYC && (
        <div style={{ background: 'rgba(245, 158, 11, 0.08)', borderBottom: '1px solid rgba(245, 158, 11, 0.2)', padding: '12px 24px' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--color-warning)', fontWeight: 500 }}>
              ⚠️ Complete your verification to unlock all features
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              {!kycVerified && <Link to="/kyc" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: 12 }}>Verify KYC</Link>}
              {kycVerified && !addressVerified && <Link to="/verify-address" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: 12 }}>Verify Address</Link>}
            </div>
          </div>
        </div>
      )}

      <section style={{ textAlign: 'center', padding: '80px 24px 60px', background: 'linear-gradient(180deg, var(--color-bg-muted) 0%, white 100%)' }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, lineHeight: 1.15, marginBottom: 16, letterSpacing: '-1px' }}>
            Africa's Verified Professional Network
          </h1>
          <p style={{ fontSize: 18, color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 32 }}>
            KYC-verified talent. AI-matched opportunities. Built for Africa.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/professionals" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: 15 }}>Find Professionals</Link>
            <Link to="/jobs" className="btn btn-outline" style={{ padding: '14px 28px', fontSize: 15 }}>Browse Jobs</Link>
          </div>
        </div>
      </section>

      <section style={{ padding: '40px 24px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
            {[{ value: stats.pros, label: 'Professionals' }, { value: stats.jobs, label: 'Active Jobs' }, { value: '15+', label: 'Countries' }, { value: '100%', label: 'KYC Verified' }].map((s, i) => (
              <div key={i} className="card" style={{ textAlign: 'center', padding: '24px 16px' }}>
                <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '40px 24px' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>Top Professionals</h2>
            <Link to="/professionals" style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-accent)' }}>View all →</Link>
          </div>
          {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {featuredPros.length > 0 ? featuredPros.map(pro => (
                <Link to={`/professionals/${pro.id}`} key={pro.id} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div className="avatar">{pro.name?.split(' ').map(n => n[0]).join('').slice(0,2)}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{pro.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{pro.role}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8 }}>📍 {pro.location}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {pro.skills?.slice(0, 3).map((skill, i) => <span key={i} className="badge badge-blue">{skill}</span>)}
                  </div>
                </Link>
              )) : <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>No professionals yet.</div>}
            </div>
          )}
        </div>
      </section>

      <section style={{ padding: '40px 24px 60px' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>Latest Jobs</h2>
            <Link to="/jobs" style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-accent)' }}>View all →</Link>
          </div>
          {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {featuredJobs.length > 0 ? featuredJobs.map(job => (
                <Link to={`/jobs/${job.id}`} key={job.id} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{job.title}</div>
                    <span className="badge badge-green">{job.salary}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8 }}>{job.company} • {job.location} • {job.type}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{job.description}</div>
                </Link>
              )) : <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>No jobs posted yet.</div>}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
