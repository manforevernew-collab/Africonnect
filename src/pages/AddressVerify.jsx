import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function AddressVerify() {
  const navigate = useNavigate()
  const { user, profile, refreshProfile } = useAuth()
  const [address, setAddress] = useState('')
  const [gpsLat, setGpsLat] = useState('')
  const [gpsLng, setGpsLng] = useState('')
  const [utilityFile, setUtilityFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [existing, setExisting] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => { loadExisting() }, [])

  async function loadExisting() {
    const { data } = await supabase.from('address_verifications').select('*').eq('user_id', user.id).maybeSingle()
    if (data) {
      setExisting(data)
      setAddress(data.address_text || '')
      setGpsLat(data.gps_lat || '')
      setGpsLng(data.gps_lng || '')
    }
  }

  function getGPS() {
    if (!navigator.geolocation) { setToast({ type: 'error', message: 'Geolocation not supported.' }); setTimeout(() => setToast(null), 3000); return }
    navigator.geolocation.getCurrentPosition(
      pos => { setGpsLat(pos.coords.latitude.toFixed(6)); setGpsLng(pos.coords.longitude.toFixed(6)); setToast({ type: 'success', message: 'GPS location captured!' }); setTimeout(() => setToast(null), 3000); },
      err => { setToast({ type: 'error', message: err.message }); setTimeout(() => setToast(null), 3000); }
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!address.trim()) { setToast({ type: 'error', message: 'Enter your address.' }); setTimeout(() => setToast(null), 3000); return }
    if (!gpsLat || !gpsLng) { setToast({ type: 'error', message: 'Capture your GPS location.' }); setTimeout(() => setToast(null), 3000); return }
    if (!utilityFile && !existing?.utility_bill_url) { setToast({ type: 'error', message: 'Upload a utility bill.' }); setTimeout(() => setToast(null), 3000); return }

    setLoading(true)
    try {
      let billUrl = existing?.utility_bill_url
      if (utilityFile) {
        const path = `address/${user.id}/bill_${Date.now()}.${utilityFile.name.split('.').pop()}`
        const { error: upErr } = await supabase.storage.from('kyc').upload(path, utilityFile)
        if (upErr) throw upErr
        const { data: { publicUrl } } = supabase.storage.from('kyc').getPublicUrl(path)
        billUrl = publicUrl
      }

      const payload = {
        user_id: user.id,
        address_text: address,
        gps_lat: gpsLat,
        gps_lng: gpsLng,
        utility_bill_url: billUrl,
        status: 'pending'
      }

      if (existing) {
        await supabase.from('address_verifications').update(payload).eq('id', existing.id)
      } else {
        await supabase.from('address_verifications').insert(payload)
      }

      refreshProfile()
      setToast({ type: 'success', message: 'Address verification submitted!' })
      setTimeout(() => { setToast(null); navigate('/') }, 2000)
    } catch (e) { setToast({ type: 'error', message: e.message }); setTimeout(() => setToast(null), 3000) }
    finally { setLoading(false) }
  }

  if (profile?.address_status === 'approved') {
    return (
      <div className="container" style={{ maxWidth: 560, padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Address Verified</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>Your address has been verified.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: 20 }}>Go Home</button>
      </div>
    )
  }

  return (
    <div className="page-enter">
      {toast && <div className="toast" style={{ background: toast.type === 'error' ? 'var(--color-danger)' : 'var(--color-success)' }}>{toast.message}</div>}
      <div className="container" style={{ maxWidth: 560, paddingTop: 40, paddingBottom: 60 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Address Verification</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 28 }}>Verify your physical address with GPS and a utility bill.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Full Address *</label>
            <textarea className="input" rows={2} value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main Street, Lagos, Nigeria" required />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>GPS Location *</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="text" className="input" value={gpsLat} placeholder="Latitude" readOnly style={{ flex: 1 }} />
              <input type="text" className="input" value={gpsLng} placeholder="Longitude" readOnly style={{ flex: 1 }} />
              <button type="button" className="btn btn-outline" onClick={getGPS} style={{ whiteSpace: 'nowrap' }}>📍 Get GPS</button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>
              Utility Bill (Electricity, Water, or Bank Statement) *
              {existing?.utility_bill_url && <span style={{ color: 'var(--color-success)' }}> ✓ Uploaded</span>}
            </label>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="input" onChange={e => setUtilityFile(e.target.files[0])} style={{ padding: 8 }} />
            {utilityFile && <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Selected: {utilityFile.name}</span>}
          </div>

          <div style={{ padding: 16, background: 'var(--color-bg-muted)', borderRadius: 10, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            <strong>Why we need this:</strong><br />
            • GPS confirms you are located in Africa<br />
            • Utility bill confirms your physical address<br />
            • This builds trust for employers and job seekers<br />
            • All documents are encrypted and stored securely
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '14px' }}>
            {loading ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><div className="spinner" style={{ width: 16, height: 16, borderColor: 'white', borderTopColor: 'transparent' }} /> Submitting...</span> : 'Submit Address Verification'}
          </button>
        </form>
      </div>
    </div>
  )
}
