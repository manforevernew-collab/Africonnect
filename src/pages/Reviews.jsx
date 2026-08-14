// Ported from AfriTalent ReviewsPage.tsx — layout identical, data from the live
// Supabase backend (reviews + companies tables), Write a Review wired to a real insert.
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

function timeAgo(dateStr) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (days < 1) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks} week${weeks > 1 ? 's' : ''} ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`
  const years = Math.floor(months / 12)
  return `${years} year${years > 1 ? 's' : ''} ago`
}

export default function Reviews() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [reviews, setReviews] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ company_id: '', rating: 5, title: '', body: '' })

  useEffect(() => {
    loadReviews()
    loadCompanies()
  }, [])

  async function loadReviews() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, company:companies(name)')
        .order('created_at', { ascending: false })
      if (error) throw error
      setReviews(data || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function loadCompanies() {
    try {
      const { data, error } = await supabase.from('companies').select('id, name').order('name')
      if (error) throw error
      setCompanies(data || [])
    } catch (e) { console.error(e) }
  }

  async function handleHelpful(reviewId) {
    try {
      await supabase.rpc('increment_helpful', { review_id: reviewId })
      loadReviews()
    } catch (e) { console.error(e) }
  }

  function openForm() {
    if (!user) { navigate('/login'); return }
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.company_id || !form.title.trim() || !form.body.trim()) return
    setSubmitting(true)
    try {
      const { error } = await supabase.from('reviews').insert({
        company_id: form.company_id,
        user_id: user.id,
        rating: form.rating,
        title: form.title.trim(),
        body: form.body.trim(),
        author_name: user.user_metadata?.full_name || profile?.full_name || 'Anonymous',
        author_role: profile?.user_type === 'business' || profile?.user_type === 'recruiter' ? 'Employer' : 'Professional',
      })
      if (error) throw error
      setShowForm(false)
      setForm({ company_id: '', rating: 5, title: '', body: '' })
      loadReviews()
    } catch (e) { console.error(e) }
    finally { setSubmitting(false) }
  }

  return (
    <div className="page-enter">
      <div style={{ maxWidth: 896, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>Company Reviews</h1>
          <p style={{ fontSize: 18, color: '#475569', maxWidth: 640, margin: '0 auto' }}>
            Real reviews from real employees. Get the inside scoop before you apply.
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div className="spinner" />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {reviews.length > 0 ? reviews.map(r => (
              <div key={r.id} style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, background: '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#b45309', flexShrink: 0 }}>
                      {r.company?.name?.[0] || 'C'}
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 600, color: '#0f172a', fontSize: 15 }}>{r.company?.name || 'Company'}</h3>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <i key={i} className="fas fa-star" style={{ fontSize: 13, color: i < (r.rating || 0) ? '#f59e0b' : '#e2e8f0' }}></i>
                        ))}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: 14, color: '#94a3b8' }}>{timeAgo(r.created_at)}</span>
                </div>
                <h4 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>{r.title}</h4>
                <p style={{ color: '#475569', lineHeight: 1.7, marginBottom: 16, fontSize: 15 }}>{r.body}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ fontSize: 14, color: '#64748b' }}>
                    <span style={{ fontWeight: 500, color: '#334155' }}>{r.author_name}</span> &mdash; {r.author_role}
                  </div>
                  <button onClick={() => handleHelpful(r.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <i className="fas fa-thumbs-up"></i> Helpful ({r.helpful_count || 0})
                  </button>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: 60, color: 'var(--color-text-muted)' }}>
                No reviews yet. Be the first to share your experience.
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 48, textAlign: 'center' }}>
          <button onClick={openForm} style={{ padding: '12px 32px', background: '#f59e0b', color: 'white', fontWeight: 600, borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 15 }}>
            Write a Review
          </button>
        </div>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }} onClick={() => setShowForm(false)}>
          <div style={{ background: 'white', borderRadius: 16, padding: 32, width: '100%', maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>Write a Review</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Company</label>
                <select className="input" value={form.company_id} onChange={e => setForm({ ...form, company_id: e.target.value })} required>
                  <option value="">Select a company...</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Rating</label>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button type="button" key={n} onClick={() => setForm({ ...form, rating: n })} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                      <i className="fas fa-star" style={{ fontSize: 22, color: n <= form.rating ? '#f59e0b' : '#e2e8f0' }}></i>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Title</label>
                <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Summarize your experience" required />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Review</label>
                <textarea className="input" value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} placeholder="Share the details..." required />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
