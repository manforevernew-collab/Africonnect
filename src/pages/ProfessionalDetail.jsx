import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function ProfessionalDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, kycVerified } = useAuth()
  const [pro, setPro] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => { loadData() }, [id])

  async function loadData() {
    setLoading(true)
    try {
      const [{ data: proData }, { data: reviewsData }] = await Promise.all([
        supabase.from('professionals').select('*').eq('id', id).single(),
        supabase.from('reviews').select('*').eq('professional_id', id).order('created_at', { ascending: false })
      ])
      setPro(proData)
      setReviews(reviewsData || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function submitReview() {
    if (!user) { setToast({ type: 'error', message: 'Please log in to write a review.' }); setTimeout(() => setToast(null), 3000); return }
    if (!kycVerified) { setToast({ type: 'error', message: 'Complete KYC verification to write reviews.' }); setTimeout(() => setToast(null), 3000); return }
    if (!reviewText.trim()) return
    setSubmitting(true)
    try {
      const { error } = await supabase.from('reviews').insert({
        professional_id: parseInt(id), author: user.user_metadata?.full_name || user.email,
        rating: reviewRating, text: reviewText
      })
      if (error) throw error
      const newReviews = [...reviews, { rating: reviewRating }]
      const avg = newReviews.reduce((a, b) => a + b.rating, 0) / newReviews.length
      await supabase.from('professionals').update({ rating: Math.round(avg * 10) / 10, reviews_count: newReviews.length }).eq('id', id)
      setReviewText(''); setShowReviewForm(false)
      setToast({ type: 'success', message: 'Review submitted!' }); setTimeout(() => setToast(null), 3000)
      loadData()
    } catch (e) { setToast({ type: 'error', message: e.message }); setTimeout(() => setToast(null), 3000) }
    finally { setSubmitting(false) }
  }

  if (loading) return <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}><div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 16px' }} /><p style={{ color: 'var(--color-text-muted)' }}>Loading profile...</p></div>
  if (!pro) return <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}><p style={{ color: 'var(--color-text-muted)', marginBottom: 16 }}>Professional not found.</p><button className="btn btn-primary" onClick={() => navigate('/professionals')}>Browse Professionals</button></div>

  return (
    <div className="page-enter">
      {toast && <div className="toast" style={{ background: toast.type === 'error' ? 'var(--color-danger)' : 'var(--color-success)' }}>{toast.message}</div>}
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>← Back</button>
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div className="avatar" style={{ width: 80, height: 80, fontSize: 28 }}>{pro.name?.split(' ').map(n => n[0]).join('').slice(0,2)}</div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{pro.name}</h1>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 15, marginBottom: 8 }}>{pro.role} {pro.company && `at ${pro.company}`}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14 }}><span className="star">{'★'.repeat(Math.round(pro.rating || 0))}{'☆'.repeat(5 - Math.round(pro.rating || 0))}</span><span style={{ marginLeft: 6, fontWeight: 500 }}>{pro.rating || 0}</span><span style={{ color: 'var(--color-text-muted)', marginLeft: 4 }}>({pro.reviews_count || 0} reviews)</span></span>
                <span style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>📍 {pro.location}</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }} className="profile-grid">
          <div>
            <div className="card" style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>About</h3>
              <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>{pro.bio || 'No bio provided.'}</p>
            </div>
            <div className="card" style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Skills</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {pro.skills?.map((skill, i) => <span key={i} className="badge badge-blue">{skill}</span>) || <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>No skills listed.</span>}
              </div>
            </div>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>Reviews ({reviews.length})</h3>
                <button className="btn btn-primary" onClick={() => setShowReviewForm(!showReviewForm)} style={{ padding: '8px 16px', fontSize: 13 }}>{showReviewForm ? 'Cancel' : 'Write a Review'}</button>
              </div>
              {showReviewForm && (
                <div style={{ marginBottom: 20, padding: 16, background: 'var(--color-bg-muted)', borderRadius: 10 }}>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Rating</label>
                    <select className="input" value={reviewRating} onChange={e => setReviewRating(Number(e.target.value))} style={{ width: 'auto' }}>
                      {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} star{r > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Your Review</label>
                    <textarea className="input" rows={3} value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Share your experience..." />
                  </div>
                  <button className="btn btn-primary" onClick={submitReview} disabled={submitting}>{submitting ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div className="spinner" style={{ width: 16, height: 16, borderColor: 'white', borderTopColor: 'transparent' }} /> Submitting...</span> : 'Submit Review'}</button>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {reviews.length > 0 ? reviews.map(review => (
                  <div key={review.id} style={{ paddingBottom: 16, borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{review.author}</span>
                      <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                    <div style={{ marginBottom: 4 }}><span className="star" style={{ fontSize: 12 }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span></div>
                    <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{review.text}</p>
                  </div>
                )) : <p style={{ color: 'var(--color-text-muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>No reviews yet. Be the first to review!</p>}
              </div>
            </div>
          </div>
          <div>
            <div className="card" style={{ position: 'sticky', top: 80 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-muted)' }}>Quick Info</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div><div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>COMPANY</div><div style={{ fontWeight: 500, fontSize: 14 }}>{pro.company || 'Independent'}</div></div>
                <div><div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>LOCATION</div><div style={{ fontWeight: 500, fontSize: 14 }}>{pro.location || 'Not specified'}</div></div>
                <div><div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>RATING</div><div style={{ fontWeight: 500, fontSize: 14 }}>{pro.rating || 0} / 5.0</div></div>
                <div><div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>REVIEWS</div><div style={{ fontWeight: 500, fontSize: 14 }}>{pro.reviews_count || 0}</div></div>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 20 }}>Contact {pro.name?.split(' ')[0]}</button>
            </div>
          </div>
        </div>
        <style>{`@media (max-width: 768px) { .profile-grid { grid-template-columns: 1fr !important; } }`}</style>
      </div>
    </div>
  )
}
