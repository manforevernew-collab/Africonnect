import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function Admin() {
  const { isAdmin } = useAuth()
  const [stats, setStats] = useState({ pros: 0, jobs: 0, users: 0, apps: 0, kycPending: 0, addrPending: 0 })
  const [kycList, setKycList] = useState([])
  const [addrList, setAddrList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [
        { count: pros }, { count: jobs }, { count: apps },
        { data: kycData }, { data: addrData }
      ] = await Promise.all([
        supabase.from('professionals').select('*', { count: 'exact', head: true }),
        supabase.from('jobs').select('*', { count: 'exact', head: true }),
        supabase.from('applications').select('*', { count: 'exact', head: true }),
        supabase.from('kyc_verifications').select('*, profiles(full_name)').eq('status', 'pending').order('submitted_at', { ascending: false }).limit(10),
        supabase.from('address_verifications').select('*, profiles(full_name)').eq('status', 'pending').order('submitted_at', { ascending: false }).limit(10)
      ])
      setStats({ pros: pros || 0, jobs: jobs || 0, users: 0, apps: apps || 0, kycPending: kycData?.length || 0, addrPending: addrData?.length || 0 })
      setKycList(kycData || [])
      setAddrList(addrData || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function approveKYC(id, userId) {
    await supabase.from('kyc_verifications').update({ status: 'approved', verified_at: new Date().toISOString() }).eq('id', id)
    await supabase.from('profiles').update({ kyc_status: 'approved' }).eq('id', userId)
    loadData()
  }

  async function rejectKYC(id, userId) {
    await supabase.from('kyc_verifications').update({ status: 'rejected' }).eq('id', id)
    await supabase.from('profiles').update({ kyc_status: 'rejected' }).eq('id', userId)
    loadData()
  }

  async function approveAddress(id, userId) {
    await supabase.from('address_verifications').update({ status: 'approved', verified_at: new Date().toISOString() }).eq('id', id)
    await supabase.from('profiles').update({ address_status: 'approved' }).eq('id', userId)
    loadData()
  }

  async function rejectAddress(id, userId) {
    await supabase.from('address_verifications').update({ status: 'rejected' }).eq('id', id)
    await supabase.from('profiles').update({ address_status: 'rejected' }).eq('id', userId)
    loadData()
  }

  if (loading) return <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}><div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 16px' }} /><p style={{ color: 'var(--color-text-muted)' }}>Loading dashboard...</p></div>

  return (
    <div className="page-enter">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Admin Dashboard</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 32 }}>
          {[
            { value: stats.pros, label: 'Professionals', color: 'var(--color-accent)' },
            { value: stats.jobs, label: 'Jobs', color: 'var(--color-success)' },
            { value: stats.apps, label: 'Applications', color: 'var(--color-warning)' },
            { value: stats.kycPending, label: 'KYC Pending', color: 'var(--color-danger)' },
            { value: stats.addrPending, label: 'Address Pending', color: 'var(--color-danger)' },
          ].map((s, i) => (
            <div key={i} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="admin-grid">
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>KYC Verifications ({kycList.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {kycList.length > 0 ? kycList.map(k => (
                <div key={k.id} style={{ padding: 12, background: 'var(--color-bg-muted)', borderRadius: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{k.profiles?.full_name || 'User'}</span>
                    <span className="badge badge-orange" style={{ textTransform: 'capitalize' }}>{k.type}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8 }}>
                    <a href={k.id_document_url} target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent)' }}>View ID Doc</a>
                    {k.certificate_url && <> &bull; <a href={k.certificate_url} target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent)' }}>View Certificate</a></>}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-success" style={{ padding: '6px 12px', fontSize: 12, flex: 1 }} onClick={() => approveKYC(k.id, k.user_id)}>Approve</button>
                    <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: 12, flex: 1 }} onClick={() => rejectKYC(k.id, k.user_id)}>Reject</button>
                  </div>
                </div>
              )) : <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>No pending KYC verifications.</p>}
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Address Verifications ({addrList.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {addrList.length > 0 ? addrList.map(a => (
                <div key={a.id} style={{ padding: 12, background: 'var(--color-bg-muted)', borderRadius: 10 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{a.profiles?.full_name || 'User'}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4 }}>{a.address_text}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8 }}>
                    GPS: {a.gps_lat}, {a.gps_lng} &bull; <a href={a.utility_bill_url} target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent)' }}>View Bill</a>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-success" style={{ padding: '6px 12px', fontSize: 12, flex: 1 }} onClick={() => approveAddress(a.id, a.user_id)}>Approve</button>
                    <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: 12, flex: 1 }} onClick={() => rejectAddress(a.id, a.user_id)}>Reject</button>
                  </div>
                </div>
              )) : <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>No pending address verifications.</p>}
            </div>
          </div>
        </div>

        <style>{`@media (max-width: 768px) { .admin-grid { grid-template-columns: 1fr !important; } }`}</style>
      </div>
    </div>
  )
}
