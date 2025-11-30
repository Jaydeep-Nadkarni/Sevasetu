import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Login } from './pages/Auth/Login'
import { Register } from './pages/Auth/Register'
import { Unauthorized } from './pages/Auth/Unauthorized'
import Landing from './pages/Landing'
import { Dashboard } from './pages/User/Dashboard'
import { Profile } from './pages/User/Profile'
import Settings from './pages/Settings'
import { ActivityLog } from './pages/User/ActivityLog'
import CreateDonation from './pages/User/CreateDonation'
import DonationHistory from './pages/User/DonationHistory'
import NGODashboard from './pages/NGO/Dashboard'
import NGOProfile from './pages/NGO/Profile'
import NGOAnalytics from './pages/NGO/Analytics'
import NGODonations from './pages/NGO/Donations'
import NGOEvents from './pages/NGO/Events'
import NGOHelpRequests from './pages/NGO/HelpRequests'
import NGOSettings from './pages/NGO/Settings'
import CreateEventNGO from './pages/NGO/CreateEvent'
import CreateEventUser from './pages/User/CreateEvent'
import EventList from './pages/Events/EventList'
import EventDetail from './pages/Events/EventDetail'
import QRScanner from './pages/NGO/QRScanner'
import CreateHelpRequest from './pages/User/CreateHelpRequest'
import HelpRequestList from './pages/HelpRequests/HelpRequestList'
import HelpRequestDetail from './pages/HelpRequests/HelpRequestDetail'
import NearbyMap from './pages/Map/NearbyMap'
import Progress from './pages/User/Progress'
import Leaderboard from './pages/Leaderboard'
import Certificates from './pages/User/Certificates'
import CertificateVerify from './pages/CertificateVerify'
import DonateMoney from './pages/User/DonateMoney'
import TransactionHistory from './pages/User/TransactionHistory'
import ChatWidget from './components/Chatbot/ChatWidget'
import { ProtectedRoute } from './components/ProtectedRoute'
import { DashboardLayout } from './components/DashboardLayout'
import Notifications from './components/Notifications'
import { getCurrentUser } from './store/slices/authSlice.js'
import { Navbar } from './components/UI/Navbar'

import AdminDashboard from './pages/Admin/Dashboard'
import NGOVerification from './pages/Admin/NGOVerification'
import UserManagement from './pages/Admin/UserManagement'
import PlatformAnalytics from './pages/Admin/Analytics'

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
        <>
          <Notifications 
            userId={user._id} 
            userType={user.role === 'ngo_admin' ? 'ngo' : 'donor'} 
          />
          <ChatWidget />
        </>
      )}
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Home Route - Landing Page for Unauthenticated Users */}
        <Route
          path="/"
          element={
            isAuthenticated && user ? (
              <Navigate 
                to={
                  user.role === 'ngo_admin' ? '/ngo/dashboard' 
                  : user.role === 'admin' ? '/admin/dashboard'
                  : '/dashboard'
                }
                replace
              />
            ) : (
              <Landing />
            )
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
          path="/user/dashboard"
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

        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={['user', 'ngo_admin', 'admin']}>
              <DashboardLayout>
                <Settings />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/activity-log"
          element={
            <ProtectedRoute allowedRoles={['user', 'ngo_admin', 'admin']}>
              <DashboardLayout>
                <ActivityLog />
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
                <NGODashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ngo/profile"
          element={
            <ProtectedRoute allowedRoles={['ngo_admin']}>
              <DashboardLayout>
                <NGOProfile />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ngo/analytics"
          element={
            <ProtectedRoute allowedRoles={['ngo_admin']}>
              <DashboardLayout>
                <NGOAnalytics />
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
                <NGODonations />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ngo/events"
          element={
            <ProtectedRoute allowedRoles={['ngo_admin']}>
              <DashboardLayout>
                <NGOEvents />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ngo/help-requests"
          element={
            <ProtectedRoute allowedRoles={['ngo_admin']}>
              <DashboardLayout>
                <NGOHelpRequests />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ngo/settings"
          element={
            <ProtectedRoute allowedRoles={['ngo_admin']}>
              <DashboardLayout>
                <NGOSettings />
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
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout>
                <AdminDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/ngo-verification"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout>
                <NGOVerification />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout>
                <UserManagement />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout>
                <PlatformAnalytics />
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
