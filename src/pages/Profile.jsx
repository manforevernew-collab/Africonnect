import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Profile() {
  const { user, profile, kycVerified, addressVerified, isBusiness, isJobSeeker, signOut, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url || '')
  const [uploading, setUploading] = useState(false)

  if (!user) { navigate('/login'); return null }

  async function updateAvatar() {
    if (!avatarFile) return
    setUploading(true)
    try {
      const fileExt = avatarFile.name.split('.').pop()
      const filePath = `avatars/${user.id}.${fileExt}`
      const { error: upError } = await supabase.storage.from('avatars').upload(filePath, avatarFile, { upsert: true })
      if (upError) throw upError
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
      refreshProfile()
      setAvatarPreview(publicUrl)
    } catch (e) {
      alert(e.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="page-enter">
      <div className="container" style={{ maxWidth: 640, paddingTop: 40, paddingBottom: 60 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Your Profile</h1>

        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--color-border)' }} />
            ) : (
              <div className="avatar" style={{ width: 80, height: 80, fontSize: 28 }}>
                {user.user_metadata?.full_name?.[0] || user.email[0].toUpperCase()}
              </div>
            )}
            <div>
              <div style={{ fontWeight: 600, fontSize: 18 }}>{user.user_metadata?.full_name || 'User'}</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{user.email}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <input type="file" accept="image/*" className="input" onChange={e => {
              const f = e.target.files[0]
              if (f) {
                setAvatarFile(f)
                setAvatarPreview(URL.createObjectURL(f))
              }
            }} style={{ flex: 1, padding: 6 }} />
            <button className="btn btn-primary" onClick={updateAvatar} disabled={uploading || !avatarFile} style={{ padding: '8px 16px', fontSize: 13 }}>
              {uploading ? '...' : 'Update Photo'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: 12, background: 'var(--color-bg-muted)', borderRadius: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>ACCOUNT TYPE</div>
              <div style={{ fontWeight: 500, fontSize: 14, textTransform: 'capitalize' }}>{profile?.user_type || 'Member'}</div>
            </div>
            <div style={{ padding: 12, background: 'var(--color-bg-muted)', borderRadius: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>KYC STATUS</div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>
                {kycVerified ? <span className="kyc-badge kyc-verified">✓ Verified</span> : <span className="kyc-badge kyc-pending">⏳ Pending</span>}
              </div>
            </div>
            <div style={{ padding: 12, background: 'var(--color-bg-muted)', borderRadius: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>ADDRESS STATUS</div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>
                {addressVerified ? <span className="kyc-badge kyc-verified">✓ Verified</span> : <span className="kyc-badge kyc-pending">⏳ Pending</span>}
              </div>
            </div>
            <div style={{ padding: 12, background: 'var(--color-bg-muted)', borderRadius: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>MEMBER SINCE</div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{new Date(user.created_at).toLocaleDateString()}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
            {isJobSeeker && <Link to="/upload-resume" className="btn btn-primary" style={{ flex: 1 }}>📄 Manage Resume</Link>}
            {isJobSeeker && <Link to="/matches" className="btn btn-outline" style={{ flex: 1 }}>🎯 View Matches</Link>}
            {isBusiness && <Link to="/post-job" className="btn btn-success" style={{ flex: 1 }}>➕ Post a Job</Link>}
            {!kycVerified && <Link to="/kyc" className="btn btn-outline" style={{ flex: 1 }}>🛡️ Verify KYC</Link>}
            {kycVerified && !addressVerified && <Link to="/verify-address" className="btn btn-outline" style={{ flex: 1 }}>📍 Verify Address</Link>}
          </div>
        </div>

        <button className="btn btn-outline" onClick={async () => { await signOut(); navigate('/') }} style={{ width: '100%' }}>
          Sign Out
        </button>
      </div>
    </div>
  )
}
