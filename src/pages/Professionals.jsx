import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const CATEGORIES = ['All', 'Technology', 'Design', 'Sales', 'Media', 'Engineering', 'Finance', 'Healthcare']

export default function Professionals() {
  const [professionals, setProfessionals] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  useEffect(() => { loadProfessionals() }, [category])

  async function loadProfessionals() {
    setLoading(true)
    try {
      let query = supabase.from('professionals').select('*')
      if (category !== 'All') query = query.contains('skills', [category])
      const { data, error } = await query.order('rating', { ascending: false })
      if (error) throw error
      setProfessionals(data || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const filtered = professionals.filter(p => {
    const q = search.toLowerCase()
    return !q || p.name?.toLowerCase().includes(q) || p.role?.toLowerCase().includes(q) || p.location?.toLowerCase().includes(q)
  })

  return (
    <div className="page-enter">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Verified Professionals</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 15 }}>
            KYC-verified talent across Africa. AI-matched opportunities.
          </p>
        </div>

        <div style={{ maxWidth: 520, margin: '0 auto 24px', display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <i className="fas fa-search" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}></i>
            <input
              type="text"
              className="input"
              placeholder="Search by name, skill, or location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 44 }}
            />
          </div>
          <button className="btn btn-primary" onClick={loadProfessionals}>Search</button>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 28 }}>
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className="badge"
              style={{
                cursor: 'pointer',
                background: category === c ? 'var(--color-primary)' : 'var(--color-bg-muted)',
                color: category === c ? 'white' : 'var(--color-text-secondary)',
                border: 'none',
                padding: '8px 16px'
              }}
            >
              {c}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Professionals</h2>
          <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{filtered.length} results</span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div className="spinner" />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {filtered.length > 0 ? filtered.map(pro => (
              <Link to={`/professionals/${pro.id}`} key={pro.id} className="pro-card">
                <div className="pro-cover"></div>
                <div className="pro-body">
                  <div className="pro-avatar">{pro.name?.split(' ').map(n => n[0]).join('').slice(0,2)}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 12, marginBottom: 4 }}>{pro.name}</div>
                  <div style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{pro.role}</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 8 }}>
                    <i className="fas fa-map-marker-alt"></i> {pro.location}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 12 }}>
                    <span className="star">{'★'.repeat(Math.round(pro.rating || 0))}{'☆'.repeat(5 - Math.round(pro.rating || 0))}</span>
                    <span style={{ marginLeft: 6 }}>{pro.rating || 0} ({pro.reviews_count || 0})</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {pro.skills?.slice(0, 3).map((skill, i) => (
                      <span key={i} className="badge badge-blue">{skill}</span>
                    ))}
                  </div>
                </div>
              </Link>
            )) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: 'var(--color-text-muted)' }}>
                No professionals found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
