import { Routes, Route } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import KYCGuard from './components/KYCGuard'
import Home from './pages/Home'
import Businesses from './pages/Businesses'
import BusinessDetail from './pages/BusinessDetail'
import Reviews from './pages/Reviews'
import Professionals from './pages/Professionals'
import ProfessionalDetail from './pages/ProfessionalDetail'
import Jobs from './pages/Jobs'
import JobDetail from './pages/JobDetail'
import PostJob from './pages/PostJob'
import UploadResume from './pages/UploadResume'
import Matches from './pages/Matches'
import KYC from './pages/KYC'
import AddressVerify from './pages/AddressVerify'
import SetupWizard from './pages/SetupWizard'
import Login from './pages/Login'
import Admin from './pages/Admin'
import Profile from './pages/Profile'
import Messages from './pages/Messages'
import NotFound from './pages/NotFound'

function App() {
  const { loading, user, profile } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Loading AfriTalent...</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/businesses" element={<Businesses />} />
          <Route path="/businesses/:id" element={<BusinessDetail />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/professionals" element={<Professionals />} />
          <Route path="/professionals/:id" element={<ProfessionalDetail />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Messages initialTab="notifications" /></ProtectedRoute>} />
          <Route path="/setup" element={<ProtectedRoute><SetupWizard /></ProtectedRoute>} />
          <Route path="/post-job" element={<ProtectedRoute requireBusiness><KYCGuard><PostJob /></KYCGuard></ProtectedRoute>} />
          <Route path="/upload-resume" element={<ProtectedRoute requireJobSeeker><KYCGuard><UploadResume /></KYCGuard></ProtectedRoute>} />
          <Route path="/matches" element={<ProtectedRoute requireJobSeeker><KYCGuard><Matches /></KYCGuard></ProtectedRoute>} />
          <Route path="/kyc" element={<ProtectedRoute><KYC /></ProtectedRoute>} />
          <Route path="/verify-address" element={<ProtectedRoute><AddressVerify /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requireAdmin><Admin /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
