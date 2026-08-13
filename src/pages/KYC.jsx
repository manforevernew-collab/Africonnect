import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function KYC() {
  const navigate = useNavigate()
  const { user, profile, refreshProfile } = useAuth()
  const [userType, setUserType] = useState(profile?.user_type || 'job_seeker')
  const [idFile, setIdFile] = useState(null)
  const [certFile, setCertFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [existing, setExisting] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (profile?.user_type) setUserType(profile.user_type)
    loadExisting()
  }, [profile])

  async function loadExisting() {
    const { data } = await supabase.from('kyc_verifications').select('*').eq('user_id', user.id).maybeSingle()
    if (data) setExisting(data)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!idFile && !existing?.id_document_url) { setToast({ type: 'error', message: 'Please upload your ID document.' }); setTimeout(() => setToast(null), 3000); return }
    if (userType === 'business' && !certFile && !existing?.certificate_url) { setToast({ type: 'error', message: 'Please upload your business certificate.' }); setTimeout(() => setToast(null), 3000); return }

    setLoading(true)
    try {
      // Update profile user_type
      await supabase.from('profiles').update({ user_type: userType }).eq('id', user.id)

      let idUrl = existing?.id_document_url
      let certUrl = existing?.certificate_url

      if (idFile) {
        const path = `kyc/${user.id}/id_${Date.now()}.${idFile.name.split('.').pop()}`
        const { error: upErr } = await supabase.storage.from('kyc').upload(path, idFile)
        if (upErr) throw upErr
        const { data: { publicUrl } } = supabase.storage.from('kyc').getPublicUrl(path)
        idUrl = publicUrl
      }

      if (userType === 'business' && certFile) {
        const path = `kyc/${user.id}/cert_${Date.now()}.${certFile.name.split('.').pop()}`
        const { error: upErr } = await supabase.storage.from('kyc').upload(path, certFile)
        if (upErr) throw upErr
        const { data: { publicUrl } } = supabase.storage.from('kyc').getPublicUrl(path)
        certUrl = publicUrl
      }

      const payload = {
        user_id: user.id,
        type: userType,
        id_document_url: idUrl,
        certificate_url: certUrl,
        status: 'pending'
      }

      if (existing) {
        await supabase.from('kyc_verifications').update(payload).eq('id', existing.id)
      } else {
        await supabase.from('kyc_verifications').insert(payload)
      }

      refreshProfile()
      setToast({ type: 'success', message: 'KYC submitted for review!' })
      setTimeout(() => { setToast(null); navigate('/verify-address') }, 2000)
    } catch (e) { setToast({ type: 'error', message: e.message }); setTimeout(() => setToast(null), 3000) }
    finally { setLoading(false) }
  }

  if (profile?.kyc_status === 'approved') {
    return (
      <div className="container" style={{ maxWidth: 560, padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>KYC Verified</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>Your identity has been verified.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: 20 }}>Go Home</button>
      </div>
    )
  }

  return (
    <div className="page-enter">
      {toast && <div className="toast" style={{ background: toast.type === 'error' ? 'var(--color-danger)' : 'var(--color-success)' }}>{toast.message}</div>}
      <div className="container" style={{ maxWidth: 560, paddingTop: 40, paddingBottom: 60 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Identity Verification</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 28 }}>Upload your government-issued documents. All data is encrypted.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Account Type</label>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={() => setUserType('job_seeker')} className="btn" style={{
                flex: 1, justifyContent: 'center',
                background: userType === 'job_seeker' ? 'var(--color-primary)' : 'var(--color-bg-muted)',
                color: userType === 'job_seeker' ? 'white' : 'var(--color-text)',
                border: '1px solid var(--color-border)'
              }}>👤 Job Seeker</button>
              <button type="button" onClick={() => setUserType('business')} className="btn" style={{
                flex: 1, justifyContent: 'center',
                background: userType === 'business' ? 'var(--color-primary)' : 'var(--color-bg-muted)',
                color: userType === 'business' ? 'white' : 'var(--color-text)',
                border: '1px solid var(--color-border)'
              }}>🏢 Business</button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>
              {userType === 'business' ? 'Business Registration Certificate / CAC Document' : "Government-Issued ID (Passport, NIN, Driver's License)"}
              {existing?.certificate_url && userType === 'business' && <span style={{ color: 'var(--color-success)' }}> ✓ Uploaded</span>}
              {existing?.id_document_url && <span style={{ color: 'var(--color-success)' }}> ✓ Uploaded</span>}
            </label>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="input" onChange={e => setIdFile(e.target.files[0])} style={{ padding: 8 }} />
            {idFile && <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Selected: {idFile.name}</span>}
          </div>

          {userType === 'business' && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Tax ID / TIN Certificate (Optional)</label>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="input" onChange={e => setCertFile(e.target.files[0])} style={{ padding: 8 }} />
              {certFile && <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Selected: {certFile.name}</span>}
            </div>
          )}

          <div style={{ padding: 16, background: 'var(--color-bg-muted)', borderRadius: 10, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            <strong>What happens next?</strong><br />
            1. Upload your documents<br />
            2. Our team reviews within 24 hours<br />
            3. You will be notified via email<br />
            4. Then proceed to address verification
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '14px' }}>
            {loading ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><div className="spinner" style={{ width: 16, height: 16, borderColor: 'white', borderTopColor: 'transparent' }} /> Submitting...</span> : 'Submit for Verification'}
          </button>
        </form>
      </div>
    </div>
  )
}
