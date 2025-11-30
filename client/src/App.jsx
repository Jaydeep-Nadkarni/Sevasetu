import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Login } from './pages/Auth/Login'
import { Register } from './pages/Auth/Register'
import { Unauthorized } from './pages/Auth/Unauthorized'
import { Dashboard } from './pages/User/Dashboard'
import { Profile } from './pages/User/Profile'
import CreateDonation from './pages/User/CreateDonation'
import DonationHistory from './pages/User/DonationHistory'
import DonationManagement from './pages/NGO/DonationManagement'
import CreateEventNGO from './pages/NGO/CreateEvent'
import CreateEventUser from './pages/User/CreateEvent'
import EventList from './pages/Events/EventList'
import EventDetail from './pages/Events/EventDetail'
import QRScanner from './pages/NGO/QRScanner'
import CreateHelpRequest from './pages/User/CreateHelpRequest'
import HelpRequestList from './pages/HelpRequests/HelpRequestList'
import HelpRequestDetail from './pages/HelpRequests/HelpRequestDetail'
import HelpRequestManagement from './pages/NGO/HelpRequestManagement'
import NearbyMap from './pages/Map/NearbyMap'
import Progress from './pages/User/Progress'
import Leaderboard from './pages/Leaderboard'
import Certificates from './pages/User/Certificates'
import CertificateVerify from './pages/CertificateVerify'
import DonateMoney from './pages/User/DonateMoney'
import TransactionHistory from './pages/User/TransactionHistory'
import { ProtectedRoute } from './components/ProtectedRoute'
import { DashboardLayout } from './components/DashboardLayout'
import Notifications from './components/Notifications'
import { getCurrentUser } from './store/slices/authSlice'
import { Navbar } from './components/UI/Navbar'

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getCurrentUser())
    }
  }, [isAuthenticated, dispatch])

  return (
    <Router>
      {/* Notifications Component */}
      {isAuthenticated && user && (
        <Notifications 
          userId={user._id} 
          userType={user.role === 'ngo_admin' ? 'ngo' : 'donor'} 
        />
      )}
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Home Route */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <div className="container-custom py-8">
                <h1 className="text-4xl font-bold text-primary mb-4">Welcome to Sevasetu NGO Platform</h1>
                <p className="text-gray-600 mb-8">A comprehensive platform connecting donors, volunteers, and NGOs</p>
                <div className="flex gap-4">
                  <a href="/login" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
                    Login
                  </a>
                  <a href="/register" className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark">
                    Register
                  </a>
                </div>
              </div>
            </>
          }
        />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['user', 'ngo_admin', 'admin']}>
              <DashboardLayout>
                <Profile />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Gamification Routes */}
        <Route
          path="/progress"
          element={
            <ProtectedRoute allowedRoles={['user', 'ngo_admin', 'admin']}>
              <DashboardLayout>
                <Progress />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/leaderboard"
          element={
            <DashboardLayout>
              <Leaderboard />
            </DashboardLayout>
          }
        />

        <Route
          path="/certificates"
          element={
            <ProtectedRoute allowedRoles={['user', 'ngo_admin', 'admin']}>
              <DashboardLayout>
                <Certificates />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/verify-certificate/:code"
          element={<CertificateVerify />}
        />

        {/* Financial Routes */}
        <Route
          path="/donate-money"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <DashboardLayout>
                <DonateMoney />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/transactions"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <DashboardLayout>
                <TransactionHistory />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* User Donation Routes */}
        <Route
          path="/user/create-donation"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <DashboardLayout>
                <CreateDonation />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/donations"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <DashboardLayout>
                <DonationHistory />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ngo/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ngo_admin']}>
              <DashboardLayout>
                <div className="flex-1 flex flex-col overflow-hidden">
                  <main className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                      <h1 className="text-3xl font-bold text-primary mb-4">NGO Dashboard</h1>
                      <p className="text-gray-600">Welcome to your NGO management dashboard!</p>
                    </div>
                  </main>
                </div>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* NGO Donation Management Route */}
        <Route
          path="/ngo/donations"
          element={
            <ProtectedRoute allowedRoles={['ngo_admin']}>
              <DashboardLayout>
                <DonationManagement />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Event Routes */}
        <Route
          path="/events"
          element={
            <DashboardLayout>
              <EventList />
            </DashboardLayout>
          }
        />

        <Route
          path="/events/:id"
          element={
            <DashboardLayout>
              <EventDetail />
            </DashboardLayout>
          }
        />

        {/* NGO Event Creation */}
        <Route
          path="/ngo/create-event"
          element={
            <ProtectedRoute allowedRoles={['ngo_admin']}>
              <DashboardLayout>
                <CreateEventNGO />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* QR Scanner */}
        <Route
          path="/ngo/scan-qr"
          element={
            <ProtectedRoute allowedRoles={['ngo_admin', 'admin']}>
              <DashboardLayout>
                <QRScanner />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* User Event Creation */}
        <Route
          path="/user/create-event"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <DashboardLayout>
                <CreateEventUser />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Help Request Routes */}
        <Route
          path="/help-requests"
          element={
            <DashboardLayout>
              <HelpRequestList />
            </DashboardLayout>
          }
        />

        <Route
          path="/help-requests/:id"
          element={
            <DashboardLayout>
              <HelpRequestDetail />
            </DashboardLayout>
          }
        />

        <Route
          path="/user/create-help-request"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <DashboardLayout>
                <CreateHelpRequest />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ngo/help-requests"
          element={
            <ProtectedRoute allowedRoles={['ngo_admin']}>
              <DashboardLayout>
                <HelpRequestManagement />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout>
                <div className="flex-1 flex flex-col overflow-hidden">
                  <main className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                      <h1 className="text-3xl font-bold text-primary mb-4">Admin Dashboard</h1>
                      <p className="text-gray-600">Welcome to the admin panel!</p>
                    </div>
                  </main>
                </div>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

                <Route
          path="/map"
          element={
            <DashboardLayout>
              <NearbyMap />
            </DashboardLayout>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
