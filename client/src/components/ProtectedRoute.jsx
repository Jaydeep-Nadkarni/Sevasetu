import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { getCurrentUser } from '../store/slices/authSlice.js'

export const ProtectedRoute = ({ children, allowedRoles = [], redirectTo = '/login' }) => {
  const dispatch = useDispatch()
  const { isAuthenticated, user, isLoading } = useSelector((state) => state.auth)

  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(getCurrentUser())
    }
  }, [isAuthenticated, user, dispatch])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  // Check role-based access control
  if (allowedRoles.length > 0 && user) {
    const hasAccess = allowedRoles.includes(user.role)
    if (!hasAccess) {
      console.warn(`User role '${user.role}' not in allowed roles:`, allowedRoles)
      return <Navigate to="/unauthorized" replace />
    }
  }

  return children
}
