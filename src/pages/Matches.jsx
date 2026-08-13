import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

function calculateMatchScore(resumeSkills, jobSkills) {
  if (!jobSkills || jobSkills.length === 0) return 0
  if (!resumeSkills || resumeSkills.length === 0) return 0
  const matchCount = jobSkills.filter(s => resumeSkills.some(rs => rs.toLowerCase() === s.toLowerCase())).length
  return Math.round((matchCount / jobSkills.length) * 100)
}

function getMatchClass(score) {
  if (score >= 70) return 'match-high'
  if (score >= 40) return 'match-mid'
  return 'match-low'
}

export default function Matches() {
  const { user } = useAuth()
  const [resume, setResume] = useState(null)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [{ data: resumeData }, { data: jobsData }] = await Promise.all([
        supabase.from('resumes').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('jobs').select('*').order('posted_at', { ascending: false })
      ])
      setResume(resumeData)
      const scored = (jobsData || []).map(job => ({
        ...job,
        matchScore: calculateMatchScore(resumeData?.skills || [], job.required_skills || [])
      })).sort((a, b) => b.matchScore - a.matchScore)
      setJobs(scored)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  if (loading) return <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}><div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 16px' }} /><p style={{ color: 'var(--color-text-muted)' }}>Calculating matches...</p></div>

  if (!resume) {
    return (
      <div className="container" style={{ maxWidth: 560, padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Upload Your Resume First</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>Our AI needs your skills to find the best job matches for you.</p>
        <Link to="/upload-resume" className="btn btn-primary" style={{ padding: '12px 28px' }}>Upload Resume</Link>
      </div>
    )
  }

  return (
    <div className="page-enter">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Your AI Job Matches</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 28 }}>Based on your skills: {resume.skills?.join(', ')}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {jobs.length > 0 ? jobs.map(job => (
            <Link to={`/jobs/${job.id}`} key={job.id} className="card" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 20 }}>
              <div className={`match-score ${getMatchClass(job.matchScore)}`}>{job.matchScore}%</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{job.title}</div>
                  <span className="badge badge-green">{job.salary}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 6 }}>{job.company} • {job.location} • {job.type}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {job.required_skills?.map((s, i) => (
                    <span key={i} className="badge" style={{
                      background: resume.skills?.includes(s) ? 'rgba(37, 99, 235, 0.1)' : 'var(--color-bg-muted)',
                      color: resume.skills?.includes(s) ? 'var(--color-accent)' : 'var(--color-text-muted)'
                    }}>{resume.skills?.includes(s) ? '✓ ' : ''}{s}</span>
                  ))}
                </div>
              </div>
            </Link>
          )) : <div style={{ textAlign: 'center', padding: 60, color: 'var(--color-text-muted)' }}>No jobs available yet.</div>}
        </div>
      </div>
    </div>
  )
}
