import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Login } from './pages/Auth/Login'
import { Register } from './pages/Auth/Register'
import { Unauthorized } from './pages/Auth/Unauthorized'
import { ProtectedRoute } from './components/ProtectedRoute'
import { getCurrentUser } from './store/slices/authSlice'

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state) => state.auth)

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getCurrentUser())
    }
  }, [isAuthenticated, dispatch])

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Home Route */}
          <Route
            path="/"
            element={
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
            }
          />

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <div className="container-custom py-8">
                  <h1 className="text-3xl font-bold text-primary mb-4">User Dashboard</h1>
                  <p className="text-gray-600">Welcome to your dashboard! This is where you'll manage your account and donations.</p>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/ngo/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ngo_admin']}>
                <div className="container-custom py-8">
                  <h1 className="text-3xl font-bold text-primary mb-4">NGO Dashboard</h1>
                  <p className="text-gray-600">Welcome to your NGO management dashboard!</p>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <div className="container-custom py-8">
                  <h1 className="text-3xl font-bold text-primary mb-4">Admin Dashboard</h1>
                  <p className="text-gray-600">Welcome to the admin panel!</p>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
