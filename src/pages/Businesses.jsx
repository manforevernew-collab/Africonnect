import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Businesses() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadCompanies()
  }, [])

  async function loadCompanies() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('rating', { ascending: false })
      if (error) throw error
      setCompanies(data || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const filtered = companies.filter(c => {
    const q = search.toLowerCase()
    return !q || c.name?.toLowerCase().includes(q) || c.industry?.toLowerCase().includes(q)
  })

  return (
    <div className="page-enter">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Leading Companies</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 15 }}>
            Discover Africa's top employers. Read reviews and find your next opportunity.
          </p>
        </div>

        <div style={{ maxWidth: 600, margin: '0 auto 32px' }}>
          <div style={{ position: 'relative' }}>
            <i className="fas fa-search" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}></i>
            <input
              type="text"
              className="input"
              placeholder="Search companies by name or industry..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 44 }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div className="spinner" />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
            {filtered.length > 0 ? filtered.map(company => (
              <div key={company.id} className="card company-card" style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div className="avatar" style={{ width: 56, height: 56, borderRadius: 12, fontSize: 22, background: '#fef3c7', color: '#b45309' }}>
                    {company.name?.[0] || 'C'}
                  </div>
                  <div className="card-rating">
                    <i className="fas fa-star"></i>
                    {company.rating || '4.0'}
                  </div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{company.name}</div>
                <div style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: 14, marginBottom: 12 }}>
                  {company.industry || 'Technology'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 16 }}>
                  <i className="fas fa-map-marker-alt"></i>
                  {company.location || 'Lagos, Nigeria'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
                    {company.review_count || 0} reviews
                  </span>
                  <Link to={`/businesses/${company.id}`} style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
                    View Profile <i className="fas fa-arrow-right" style={{ fontSize: 12 }}></i>
                  </Link>
                </div>
              </div>
            )) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: 'var(--color-text-muted)' }}>
                No companies found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
