import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

export default function KYCGuard({ children }) {
  const { kycVerified, addressVerified, profile } = useAuth()

  if (!kycVerified) {
    return (
      <div className="container" style={{ maxWidth: 560, padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🛡️</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>KYC Verification Required</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
          To access this feature, you need to complete identity verification. This helps us maintain a trusted professional network.
        </p>
        <Link to="/kyc" className="btn btn-primary" style={{ padding: '12px 28px' }}>
          Start KYC Verification
        </Link>
      </div>
    )
  }

  if (!addressVerified) {
    return (
      <div className="container" style={{ maxWidth: 560, padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📍</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Address Verification Required</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
          Please verify your address with GPS location and a utility bill to continue.
        </p>
        <Link to="/verify-address" className="btn btn-primary" style={{ padding: '12px 28px' }}>
          Verify Address
        </Link>
      </div>
    )
  }

  return children
}
