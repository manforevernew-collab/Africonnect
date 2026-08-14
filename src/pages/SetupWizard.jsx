import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const STEPS = [
  { id: 1, title: 'Profile Photo', icon: '📸', desc: 'Upload a display picture' },
  { id: 2, title: 'Account Type', icon: '👤', desc: 'Job Seeker or Business' },
  { id: 3, title: 'KYC Verification', icon: '🛡️', desc: 'Verify your identity' },
  { id: 4, title: 'Address', icon: '📍', desc: 'Verify your address' },
  { id: 5, title: 'Get Started', icon: '🚀', desc: 'Complete your profile' },
]

export default function SetupWizard() {
  const navigate = useNavigate()
  const { user, profile, refreshProfile } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  // Step 1: Avatar
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')

  // Step 2: Account Type
  const [userType, setUserType] = useState('job_seeker')

  // Step 3: KYC
  const [idFile, setIdFile] = useState(null)
  const [certFile, setCertFile] = useState(null)

  // Step 4: Address
  const [address, setAddress] = useState('')
  const [gpsLat, setGpsLat] = useState('')
  const [gpsLng, setGpsLng] = useState('')
  const [utilityFile, setUtilityFile] = useState(null)

  useEffect(() => {
    if (profile?.avatar_url) setAvatarPreview(profile.avatar_url)
    if (profile?.user_type) setUserType(profile.user_type)
  }, [profile])

  function getGPS() {
    if (!navigator.geolocation) {
      setToast({ type: 'error', message: 'Geolocation not supported.' })
      setTimeout(() => setToast(null), 3000)
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setGpsLat(pos.coords.latitude.toFixed(6))
        setGpsLng(pos.coords.longitude.toFixed(6))
        setToast({ type: 'success', message: 'GPS location captured!' })
        setTimeout(() => setToast(null), 3000)
      },
      err => {
        setToast({ type: 'error', message: err.message })
        setTimeout(() => setToast(null), 3000)
      }
    )
  }

  async function handleAvatarUpload() {
    if (!avatarFile) {
      setToast({ type: 'error', message: 'Please select a profile photo.' })
      setTimeout(() => setToast(null), 3000)
      return false
    }
    setLoading(true)
    try {
      const fileExt = avatarFile.name.split('.').pop()
      const filePath = `avatars/${user.id}.${fileExt}`
      const { error: upError } = await supabase.storage.from('avatars').upload(filePath, avatarFile, { upsert: true })
      if (upError) throw upError
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
      refreshProfile()
      setLoading(false)
      return true
    } catch (e) {
      setToast({ type: 'error', message: e.message })
      setTimeout(() => setToast(null), 3000)
      setLoading(false)
      return false
    }
  }

  async function handleNext() {
    if (step === 1) {
      const ok = await handleAvatarUpload()
      if (!ok) return
    }
    if (step === 2) {
      await supabase.from('profiles').update({ user_type: userType }).eq('id', user.id)
      refreshProfile()
    }
    if (step === 3) {
      if (!idFile) { setToast({ type: 'error', message: 'Upload your ID document.' }); setTimeout(() => setToast(null), 3000); return }
      setLoading(true)
      try {
        const idPath = `kyc/${user.id}/id_${Date.now()}.${idFile.name.split('.').pop()}`
        await supabase.storage.from('kyc').upload(idPath, idFile)
        const { data: { publicUrl: idUrl } } = supabase.storage.from('kyc').getPublicUrl(idPath)

        let certUrl = null
        if (userType === 'business' && certFile) {
          const certPath = `kyc/${user.id}/cert_${Date.now()}.${certFile.name.split('.').pop()}`
          await supabase.storage.from('kyc').upload(certPath, certFile)
          const { data: { publicUrl: cUrl } } = supabase.storage.from('kyc').getPublicUrl(certPath)
          certUrl = cUrl
        }

        await supabase.from('kyc_verifications').insert({
          user_id: user.id, type: userType, id_document_url: idUrl,
          certificate_url: certUrl, status: 'pending'
        })
        setLoading(false)
      } catch (e) {
        setToast({ type: 'error', message: e.message })
        setTimeout(() => setToast(null), 3000)
        setLoading(false)
        return
      }
    }
    if (step === 4) {
      if (!address.trim()) { setToast({ type: 'error', message: 'Enter your address.' }); setTimeout(() => setToast(null), 3000); return }
      if (!gpsLat || !gpsLng) { setToast({ type: 'error', message: 'Capture GPS location.' }); setTimeout(() => setToast(null), 3000); return }
      if (!utilityFile) { setToast({ type: 'error', message: 'Upload a utility bill.' }); setTimeout(() => setToast(null), 3000); return }

      setLoading(true)
      try {
        const billPath = `address/${user.id}/bill_${Date.now()}.${utilityFile.name.split('.').pop()}`
        await supabase.storage.from('kyc').upload(billPath, utilityFile)
        const { data: { publicUrl: billUrl } } = supabase.storage.from('kyc').getPublicUrl(billPath)

        await supabase.from('address_verifications').insert({
          user_id: user.id, address_text: address, gps_lat: gpsLat, gps_lng: gpsLng,
          utility_bill_url: billUrl, status: 'pending'
        })
        setLoading(false)
      } catch (e) {
        setToast({ type: 'error', message: e.message })
        setTimeout(() => setToast(null), 3000)
        setLoading(false)
        return
      }
    }
    if (step === 5) {
      await supabase.from('profiles').update({ setup_complete: true }).eq('id', user.id)
      refreshProfile()
      navigate('/')
      return
    }
    setStep(step + 1)
  }

  function handleSkip() {
    if (step < 5) setStep(step + 1)
    else navigate('/')
  }

  function renderStepContent() {
    switch (step) {
      case 1:
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: 24 }}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--color-border)' }} />
              ) : (
                <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'var(--color-bg-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: 48 }}>📸</div>
              )}
            </div>
            <input type="file" accept="image/*" className="input" onChange={e => {
              const f = e.target.files[0]
              if (f) {
                setAvatarFile(f)
                setAvatarPreview(URL.createObjectURL(f))
              }
            }} style={{ padding: 8, maxWidth: 300, margin: '0 auto' }} />
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 12 }}>A clear photo helps build trust on AfriTalent.</p>
          </div>
        )
      case 2:
        return (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 15, marginBottom: 24 }}>How will you use AfriTalent?</p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <button type="button" onClick={() => setUserType('job_seeker')} style={{
                flex: 1, maxWidth: 220, padding: 24, borderRadius: 16, border: `2px solid ${userType === 'job_seeker' ? 'var(--color-accent)' : 'var(--color-border)'}`,
                background: userType === 'job_seeker' ? 'rgba(37,99,235,0.04)' : 'white', cursor: 'pointer', transition: 'all 0.15s ease'
              }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Job Seeker</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Find jobs, upload resume, get AI-matched</div>
              </button>
              <button type="button" onClick={() => setUserType('business')} style={{
                flex: 1, maxWidth: 220, padding: 24, borderRadius: 16, border: `2px solid ${userType === 'business' ? 'var(--color-accent)' : 'var(--color-border)'}`,
                background: userType === 'business' ? 'rgba(37,99,235,0.04)' : 'white', cursor: 'pointer', transition: 'all 0.15s ease'
              }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🏢</div>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Business / Recruiter</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Post jobs, find verified talent</div>
              </button>
            </div>
          </div>
        )
      case 3:
        return (
          <div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 20 }}>Upload your government-issued ID. All data is encrypted.</p>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>
                {userType === 'business' ? 'Business Registration Certificate / CAC' : 'Government-Issued ID (Passport, NIN, Driver License)'}
              </label>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="input" onChange={e => setIdFile(e.target.files[0])} style={{ padding: 8 }} />
              {idFile && <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Selected: {idFile.name}</span>}
            </div>
            {userType === 'business' && (
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Tax ID / TIN Certificate (Optional)</label>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="input" onChange={e => setCertFile(e.target.files[0])} style={{ padding: 8 }} />
              </div>
            )}
          </div>
        )
      case 4:
        return (
          <div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 20 }}>Verify your physical address with GPS and a utility bill.</p>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Full Address *</label>
              <textarea className="input" rows={2} value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main Street, Lagos, Nigeria" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>GPS Location *</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="text" className="input" value={gpsLat} placeholder="Latitude" readOnly style={{ flex: 1 }} />
                <input type="text" className="input" value={gpsLng} placeholder="Longitude" readOnly style={{ flex: 1 }} />
                <button type="button" className="btn btn-outline" onClick={getGPS} style={{ whiteSpace: 'nowrap' }}>📍 Get GPS</button>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Utility Bill *</label>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="input" onChange={e => setUtilityFile(e.target.files[0])} style={{ padding: 8 }} />
            </div>
          </div>
        )
      case 5:
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>You are all set!</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              Your profile is under review. While you wait, explore AfriTalent.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 320, margin: '0 auto' }}>
              {userType === 'job_seeker' && (
                <button className="btn btn-primary" onClick={() => navigate('/upload-resume')} style={{ padding: '12px' }}>📄 Upload Resume</button>
              )}
              {userType === 'business' && (
                <button className="btn btn-success" onClick={() => navigate('/post-job')} style={{ padding: '12px' }}>➕ Post Your First Job</button>
              )}
              <button className="btn btn-outline" onClick={() => navigate('/')} style={{ padding: '12px' }}>🏠 Go to Home</button>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="page-enter">
      {toast && (
        <div className="toast" style={{ background: toast.type === 'error' ? 'var(--color-danger)' : 'var(--color-success)' }}>
          {toast.message}
        </div>
      )}

      <div className="container" style={{ maxWidth: 560, paddingTop: 40, paddingBottom: 60 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>Welcome to AfriTalent</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, textAlign: 'center', marginBottom: 32 }}>Let's set up your account in {STEPS.length} simple steps.</p>

        {/* Progress Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
          {STEPS.map((s, i) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: step >= s.id ? 'var(--color-primary)' : 'var(--color-bg-muted)',
                color: step >= s.id ? 'white' : 'var(--color-text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, flexShrink: 0
              }}>
                {step > s.id ? '✓' : s.id}
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 3, background: step > s.id ? 'var(--color-primary)' : 'var(--color-border)', borderRadius: 2 }} />
              )}
            </div>
          ))}
        </div>

        {/* Step Title */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>{STEPS[step - 1].icon}</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{STEPS[step - 1].title}</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>{STEPS[step - 1].desc}</p>
        </div>

        {/* Step Content */}
        <div style={{ marginBottom: 28 }}>
          {renderStepContent()}
        </div>

        {/* Navigation */}
        {step < 5 && (
          <div style={{ display: 'flex', gap: 12 }}>
            {step > 1 && (
              <button className="btn btn-outline" onClick={() => setStep(step - 1)} style={{ flex: 1, padding: '12px' }}>
                ← Back
              </button>
            )}
            <button className="btn btn-primary" onClick={handleNext} disabled={loading} style={{ flex: 1, padding: '12px' }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <div className="spinner" style={{ width: 16, height: 16, borderColor: 'white', borderTopColor: 'transparent' }} />
                  Saving...
                </span>
              ) : (
                step === 4 ? 'Finish Setup' : 'Next Step →'
              )}
            </button>
          </div>
        )}

        {step < 5 && (
          <button onClick={handleSkip} style={{ display: 'block', margin: '16px auto 0', background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: 13, cursor: 'pointer' }}>
            Skip for now →
          </button>
        )}
      </div>
    </div>
  )
}
