import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { extractSkillsFromText, generateSummary, readFileAsText, isPdfFile } from '../lib/resumeParser'

const ALL_SKILLS = [
  'React', 'Node.js', 'Python', 'Figma', 'User Research', 'Prototyping',
  'Digital Marketing', 'SEO', 'Brand Strategy', 'AutoCAD', 'Project Management',
  'Machine Learning', 'TensorFlow', 'PostgreSQL', 'Product Strategy', 'Agile',
  'Payments', 'Data Analysis', 'Content Writing', 'Sales', 'JavaScript',
  'TypeScript', 'CSS', 'HTML', 'UI Design', 'UX Research', 'DevOps', 'AWS',
  'Docker', 'Kubernetes', 'Next.js', 'Vue.js', 'Angular', 'MongoDB', 'Redis',
  'GraphQL', 'REST API', 'Flutter', 'React Native', 'iOS Development',
  'Android Development', 'Swift', 'Kotlin', 'Java', 'C++', 'C#', 'Go', 'Rust',
  'Ruby', 'PHP', 'Laravel', 'Django', 'Flask', 'FastAPI', 'Spring Boot',
  'Express.js', 'Prisma', 'Sequelize', 'Firebase', 'Supabase', 'Tailwind CSS',
  'Bootstrap', 'Sass', 'Webpack', 'Vite', 'Jest', 'Cypress', 'Git', 'GitHub',
  'GitLab', 'CI/CD', 'Jenkins', 'Terraform', 'Ansible', 'Nginx', 'Linux',
  'Ubuntu', 'CentOS', 'Windows Server', 'PowerShell', 'Bash', 'Shell Scripting',
  'Tableau', 'Power BI', 'Looker', 'Pandas', 'NumPy', 'Scikit-learn', 'Keras',
  'PyTorch', 'OpenCV', 'NLP', 'Computer Vision', 'Big Data', 'Hadoop', 'Spark',
  'Elasticsearch', 'Kafka', 'RabbitMQ', 'Memcached', 'SQLite', 'Oracle',
  'MySQL', 'SQL', 'NoSQL', 'Data Science', 'Data Engineering', 'Business Intelligence',
  'Financial Analysis', 'Accounting', 'QuickBooks', 'Excel', 'Google Sheets',
  'SAP', 'ERP', 'CRM', 'Salesforce', 'HubSpot', 'Marketo', 'Mailchimp',
  'Social Media Marketing', 'Email Marketing', 'Content Strategy', 'Copywriting',
  'Market Research', 'B2B Sales', 'B2C Marketing', 'Lead Generation',
  'Stakeholder Management', 'OKRs', 'KPIs', 'Roadmapping', 'User Stories',
  'Wireframing', 'Design Systems', 'Accessibility', 'WCAG', 'Adobe XD',
  'Photoshop', 'Illustrator', 'Sketch', 'InVision', 'Canva', 'WordPress',
  'Shopify', 'WooCommerce', 'Magento', 'Drupal', 'Joomla', 'Webflow',
  'Stripe', 'PayPal', 'Square', 'Payment Gateways', 'Cybersecurity',
  'Penetration Testing', 'Ethical Hacking', 'OWASP', 'SSL/TLS', 'OAuth',
  'JWT', 'Identity Management', 'Encryption', 'Network Security'
]

export default function UploadResume() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [file, setFile] = useState(null)
  const [resumeText, setResumeText] = useState('')
  const [skills, setSkills] = useState([])
  const [aiSkills, setAiSkills] = useState([])
  const [summary, setSummary] = useState('')
  const [experience, setExperience] = useState('')
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [existing, setExisting] = useState(null)
  const [toast, setToast] = useState(null)
  const [bucketMissing, setBucketMissing] = useState(false)
  const [showTextInput, setShowTextInput] = useState(false)
  const [isPdf, setIsPdf] = useState(false)

  useEffect(() => { loadExisting() }, [])

  async function loadExisting() {
    const { data } = await supabase.from('resumes').select('*').eq('user_id', user.id).maybeSingle()
    if (data) {
      setExisting(data)
      setSkills(data.skills || [])
      setAiSkills(data.skills || [])
      setExperience(data.experience_summary || '')
      setSummary(data.experience_summary || '')
    }
  }

  async function handleScan() {
    let textToScan = resumeText

    if (!textToScan.trim() && file) {
      textToScan = await readFileAsText(file)
    }

    if (!textToScan.trim()) {
      setToast({ type: 'error', message: 'Paste resume text or upload a file first.' })
      setTimeout(() => setToast(null), 3000)
      return
    }

    // Check if it's a PDF binary
    if (isPdfFile(file) && !resumeText.trim()) {
      setIsPdf(true)
      setToast({ type: 'error', message: 'PDF files cannot be parsed in the browser. Please paste the text content below.' })
      setTimeout(() => setToast(null), 4000)
      setShowTextInput(true)
      return
    }

    setScanning(true)
    await new Promise(r => setTimeout(r, 600))

    const extracted = extractSkillsFromText(textToScan)
    const autoSummary = generateSummary(textToScan, extracted)

    setAiSkills(extracted)
    setSkills(extracted)
    setSummary(autoSummary)
    setExperience(autoSummary)
    setScanning(false)

    if (extracted.length === 0) {
      setToast({ type: 'warning', message: 'No skills detected. Try pasting more detailed text.' })
    } else {
      setToast({ type: 'success', message: `AI found ${extracted.length} skills!` })
    }
    setTimeout(() => setToast(null), 3000)
  }

  function toggleSkill(skill) {
    setSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill])
  }

  function addCustomSkill() {
    const input = prompt('Enter a skill to add:')
    if (input && input.trim() && !skills.includes(input.trim())) {
      setSkills(prev => [...prev, input.trim()])
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (skills.length === 0) {
      setToast({ type: 'error', message: 'Select at least one skill.' })
      setTimeout(() => setToast(null), 3000)
      return
    }

    setLoading(true)
    try {
      let fileUrl = existing?.file_url || null

      if (file) {
        try {
          const fileExt = file.name.split('.').pop()
          const filePath = `resumes/${user.id}/${Date.now()}.${fileExt}`
          const { error: upError } = await supabase.storage.from('resumes').upload(filePath, file)
          if (upError) {
            if (upError.message?.includes('Bucket') || upError.message?.includes('not found')) {
              setBucketMissing(true)
            } else {
              throw upError
            }
          } else {
            const { data: { publicUrl } } = supabase.storage.from('resumes').getPublicUrl(filePath)
            fileUrl = publicUrl
          }
        } catch (upErr) {
          console.warn('File upload skipped:', upErr.message)
          setBucketMissing(true)
        }
      }

      const payload = {
        user_id: user.id,
        file_url: fileUrl,
        skills: skills,
        experience_summary: experience || summary,
        parsed_skills: skills
      }

      if (existing) {
        const { error } = await supabase.from('resumes').update(payload).eq('id', existing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('resumes').insert(payload)
        if (error) throw error
      }

      setToast({ type: 'success', message: 'Resume saved successfully!' })
      setTimeout(() => { setToast(null); navigate('/matches') }, 2000)
    } catch (e) {
      setToast({ type: 'error', message: e.message })
      setTimeout(() => setToast(null), 3000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-enter">
      {toast && (
        <div className="toast" style={{ background: toast.type === 'warning' ? 'var(--color-warning)' : (toast.type === 'error' ? 'var(--color-danger)' : 'var(--color-success)') }}>
          {toast.message}
        </div>
      )}

      <div className="container" style={{ maxWidth: 720, paddingTop: 40, paddingBottom: 60 }}>
        <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>← Back</button>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>📄 Upload Your Resume</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 28 }}>
          Our AI scans your resume, extracts your skills, and matches you to the best jobs.
        </p>

        {bucketMissing && (
          <div style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-warning)', marginBottom: 4 }}>⚠️ Storage Bucket Not Found</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Your Supabase project is missing the "resumes" storage bucket. 
              Go to Supabase → Storage → New Bucket → Name: "resumes" → Public. 
              Your skills and summary will still be saved.
            </div>
          </div>
        )}

        {isPdf && (
          <div style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.2)', marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-accent)', marginBottom: 4 }}>📄 PDF Detected</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              For best results, copy the text from your PDF and paste it below. 
              Browser-based PDF parsing is limited.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          <div style={{ display: 'flex', gap: 10, marginBottom: 4 }}>
            <button type="button" className="btn" onClick={() => { setShowTextInput(false); setIsPdf(false); }} style={{
              flex: 1, justifyContent: 'center',
              background: !showTextInput ? 'var(--color-primary)' : 'var(--color-bg-muted)',
              color: !showTextInput ? 'white' : 'var(--color-text)',
              border: '1px solid var(--color-border)'
            }}>📎 Upload File</button>
            <button type="button" className="btn" onClick={() => { setShowTextInput(true); setIsPdf(false); }} style={{
              flex: 1, justifyContent: 'center',
              background: showTextInput ? 'var(--color-primary)' : 'var(--color-bg-muted)',
              color: showTextInput ? 'white' : 'var(--color-text)',
              border: '1px solid var(--color-border)'
            }}>📝 Paste Text</button>
          </div>

          {!showTextInput ? (
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>
                Resume (PDF, DOC, TXT) {existing?.file_url && <span style={{ color: 'var(--color-success)' }}>✓ Already uploaded</span>}
              </label>
              <input type="file" accept=".pdf,.doc,.docx,.txt" className="input" onChange={e => { setFile(e.target.files[0]); setBucketMissing(false); setIsPdf(false); }} style={{ padding: 8 }} />
              {file && <span style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4, display: 'block' }}>Selected: {file.name}</span>}
            </div>
          ) : (
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>
                Paste Resume Text
              </label>
              <textarea 
                className="input" 
                rows={6} 
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                placeholder="Copy and paste your resume text here for AI analysis..."
              />
            </div>
          )}

          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleScan} 
            disabled={scanning}
            style={{ padding: '12px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
          >
            {scanning ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <div className="spinner" style={{ width: 16, height: 16, borderColor: 'white', borderTopColor: 'transparent' }} />
                🤖 AI Scanning Resume...
              </span>
            ) : (
              <span>🤖 AI Scan Resume & Extract Skills</span>
            )}
          </button>

          {(aiSkills.length > 0 || summary) && (
            <div className="card" style={{ background: 'var(--color-bg-muted)', border: '1px dashed var(--color-accent)' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-accent)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                ✨ AI Analysis Results
              </div>

              {summary && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>
                    Auto-Generated Summary
                  </label>
                  <textarea 
                    className="input" 
                    rows={2}
                    value={experience || summary}
                    onChange={e => setExperience(e.target.value)}
                    style={{ fontSize: 13, background: 'white' }}
                  />
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>You can edit this summary above</span>
                </div>
              )}

              {aiSkills.length > 0 && (
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>
                    AI-Extracted Skills ({aiSkills.length} found)
                  </label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {aiSkills.map(skill => (
                      <span key={skill} className="badge badge-blue" style={{ fontSize: 12 }}>✓ {skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-muted)' }}>
                Your Skills ({skills.length} selected)
              </label>
              <button type="button" className="btn btn-outline" onClick={addCustomSkill} style={{ padding: '5px 12px', fontSize: 12 }}>
                + Add Custom Skill
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', maxHeight: 300, overflowY: 'auto', padding: 4 }}>
              {ALL_SKILLS.map(skill => (
                <button 
                  key={skill} 
                  type="button" 
                  onClick={() => toggleSkill(skill)} 
                  className="badge"
                  style={{
                    cursor: 'pointer',
                    background: skills.includes(skill) ? 'var(--color-accent)' : 'var(--color-bg-muted)',
                    color: skills.includes(skill) ? 'white' : 'var(--color-text-secondary)',
                    border: 'none',
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 500,
                    transition: 'all 0.15s ease'
                  }}
                >
                  {skills.includes(skill) ? '✓ ' : ''}{skill}
                </button>
              ))}
            </div>

            {skills.length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center', padding: 20 }}>
                Click "AI Scan Resume" above or manually select your skills
              </p>
            )}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '14px', marginTop: 8 }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <div className="spinner" style={{ width: 16, height: 16, borderColor: 'white', borderTopColor: 'transparent' }} />
                Saving...
              </span>
            ) : (
              existing ? 'Update Resume & Skills' : 'Save Resume & Find Matches'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
