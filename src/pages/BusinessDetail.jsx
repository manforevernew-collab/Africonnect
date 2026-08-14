import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function BusinessDetail() {
  const { id } = useParams()
  const [company, setCompany] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    loadCompany()
  }, [id])

  async function loadCompany() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      setCompany(data)

      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*')
        .eq('company_id', id)
        .order('created_at', { ascending: false })
      setReviews(reviewsData || [])
    } catch (e) {
      console.error(e)
      setNotFound(true)
    } finally { setLoading(false) }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <div className="spinner" />
      </div>
    )
  }

  if (notFound || !company) {
    return (
      <div className="container" style={{ paddingTop: 60, textAlign: 'center' }}>
        <h2 style={{ marginBottom: 12 }}>Company not found</h2>
        <Link to="/businesses" className="btn btn-primary">Back to Businesses</Link>
      </div>
    )
  }

  return (
    <div className="page-enter">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60, maxWidth: 860 }}>
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div className="avatar" style={{ width: 72, height: 72, borderRadius: 16, fontSize: 28, background: '#fef3c7', color: '#b45309' }}>
              {company.name?.[0] || 'C'}
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>{company.name}</h1>
              <div style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: 14, marginBottom: 6 }}>
                {company.industry || 'Technology'}
              </div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
                <i className="fas fa-map-marker-alt"></i> {company.location || 'Lagos, Nigeria'}
              </div>
            </div>
            <div className="card-rating" style={{ fontSize: 15 }}>
              <i className="fas fa-star"></i>
              {company.rating || '4.0'} · {company.review_count || reviews.length} reviews
            </div>
          </div>
          {company.description && (
            <p style={{ marginTop: 20, color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>{company.description}</p>
          )}
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Reviews</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {reviews.length > 0 ? reviews.map(review => (
            <div key={review.id} className="card review-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <div className="review-stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <i key={i} className={i < (review.rating || 0) ? 'fas fa-star' : 'far fa-star'}></i>
                  ))}
                </div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{review.title}</div>
              <div style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>{review.body}</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                <strong style={{ color: 'var(--color-text)' }}>{review.author_name}</strong> — {review.author_role}
              </div>
            </div>
          )) : (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
              No reviews yet for this company.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
