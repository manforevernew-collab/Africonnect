import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const CATEGORIES = ['All', 'Technology', 'Design', 'Sales', 'Media', 'Engineering', 'Finance', 'Marketing']

export default function Jobs() {
  const { isBusiness, kycVerified, addressVerified } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  useEffect(() => { loadJobs() }, [category])

  async function loadJobs() {
    setLoading(true)
    try {
      let query = supabase.from('jobs').select('*')
      if (category !== 'All') query = query.eq('category', category)
      const { data, error } = await query.order('posted_at', { ascending: false })
      if (error) throw error
      setJobs(data || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const filtered = jobs.filter(j => {
    const q = search.toLowerCase()
    return !q || j.title?.toLowerCase().includes(q) || j.company?.toLowerCase().includes(q) || j.location?.toLowerCase().includes(q)
  })

  const canPost = isBusiness && kycVerified && addressVerified

  return (
    <div className="page-enter">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Find Your Next Opportunity</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 15 }}>AI-matched jobs from verified African employers.</p>
        </div>
        <div style={{ maxWidth: 520, margin: '0 auto 24px', display: 'flex', gap: 8 }}>
          <input type="text" className="input" placeholder="Search by title, company, or location..." value={search} onChange={e => setSearch(e.target.value)} />
          <button className="btn btn-primary" onClick={() => {}}>Search</button>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 28 }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} className="badge" style={{ cursor: 'pointer', background: category === c ? 'var(--color-primary)' : 'var(--color-bg-muted)', color: category === c ? 'white' : 'var(--color-text-secondary)', border: 'none', padding: '6px 14px' }}>{c}</button>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Latest Openings</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{filtered.length} jobs</span>
            {canPost && <Link to="/post-job" className="btn btn-success" style={{ padding: '8px 16px', fontSize: 13 }}>+ Post a Job</Link>}
          </div>
        </div>
        {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.length > 0 ? filtered.map(job => (
              <Link to={`/jobs/${job.id}`} key={job.id} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{job.title}</div>
                  <span className="badge badge-green">{job.salary}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8 }}>{job.company} • {job.location} • {job.type}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 10 }}>{job.description}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span className="badge badge-gray">{job.category}</span>
                  <span className="badge badge-gray">{job.type}</span>
                  {job.required_skills?.slice(0, 3).map((s, i) => <span key={i} className="badge badge-blue">{s}</span>)}
                </div>
              </Link>
            )) : <div style={{ textAlign: 'center', padding: 60, color: 'var(--color-text-muted)' }}>No jobs found.</div>}
          </div>
        )}
      </div>
    </div>
  )
}
