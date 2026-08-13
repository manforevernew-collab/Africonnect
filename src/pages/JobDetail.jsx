import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isJobSeeker, kycVerified, addressVerified } = useAuth()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => { loadJob() }, [id])

  async function loadJob() {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('jobs').select('*').eq('id', id).single()
      if (error) throw error
      setJob(data)
      if (user) {
        const { data: appData } = await supabase.from('applications').select('*').eq('job_id', id).eq('user_id', user.id).maybeSingle()
        setApplied(!!appData)
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function handleApply() {
    if (!user) { setToast({ type: 'error', message: 'Please log in to apply.' }); setTimeout(() => setToast(null), 3000); return }
    if (!kycVerified || !addressVerified) { setToast({ type: 'error', message: 'Complete verification to apply for jobs.' }); setTimeout(() => setToast(null), 3000); return }
    setApplying(true)
    try {
      const { error } = await supabase.from('applications').insert({ job_id: parseInt(id), user_id: user.id })
      if (error) throw error
      setApplied(true)
      setToast({ type: 'success', message: `Application submitted for ${job.title}!` })
      setTimeout(() => setToast(null), 3000)
    } catch (e) { setToast({ type: 'error', message: e.message }); setTimeout(() => setToast(null), 3000) }
    finally { setApplying(false) }
  }

  if (loading) return <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}><div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 16px' }} /><p style={{ color: 'var(--color-text-muted)' }}>Loading job details...</p></div>
  if (!job) return <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}><p style={{ color: 'var(--color-text-muted)', marginBottom: 16 }}>Job not found.</p><button className="btn btn-primary" onClick={() => navigate('/jobs')}>Browse Jobs</button></div>

  return (
    <div className="page-enter">
      {toast && <div className="toast" style={{ background: toast.type === 'error' ? 'var(--color-danger)' : 'var(--color-success)' }}>{toast.message}</div>}
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60, maxWidth: 720 }}>
        <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>← Back to Jobs</button>
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{job.title}</h1>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 15 }}>{job.company}</p>
            </div>
            <span className="badge badge-green" style={{ fontSize: 13 }}>{job.salary}</span>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
            <span className="badge badge-gray">📍 {job.location}</span>
            <span className="badge badge-gray">💼 {job.type}</span>
            <span className="badge badge-gray">📅 {new Date(job.posted_at).toLocaleDateString()}</span>
            <span className="badge badge-blue">{job.category}</span>
          </div>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-muted)' }}>Description</h3>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>{job.description}</p>
          </div>
          {job.required_skills && job.required_skills.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-muted)' }}>Required Skills</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {job.required_skills.map((skill, i) => <span key={i} className="badge badge-blue">{skill}</span>)}
              </div>
            </div>
          )}
          <button className="btn btn-primary" style={{ width: '100%', padding: '14px' }} onClick={handleApply} disabled={applying || applied}>
            {applying ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><div className="spinner" style={{ width: 16, height: 16, borderColor: 'white', borderTopColor: 'transparent' }} /> Submitting...</span> : applied ? '✓ Application Submitted' : 'Apply Now'}
          </button>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Looking for more? <Link to="/jobs" style={{ color: 'var(--color-accent)', fontWeight: 500 }}>Browse all jobs →</Link></p>
        </div>
      </div>
    </div>
  )
}
