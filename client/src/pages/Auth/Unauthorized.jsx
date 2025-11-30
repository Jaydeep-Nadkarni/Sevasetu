import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'

export const Unauthorized = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const getDashboardRoute = () => {
    if (!user) return '/'
    switch (user.role) {
      case 'user':
        return '/dashboard'
      case 'ngo_admin':
        return '/ngo/dashboard'
      case 'admin':
        return '/admin/dashboard'
      default:
        return '/'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-white">403</h1>
          <p className="text-2xl font-semibold text-white mt-2">Forbidden</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <svg
            className="mx-auto h-12 w-12 text-red-500 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>

          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            You don't have permission to access this page
          </h2>
          <p className="text-gray-600 mb-8">
            Your user role doesn't allow you to view this content. If you believe this is an error, please contact support.
          </p>

          <div className="space-y-4">
            <button
              onClick={() => navigate(-1)}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
            >
              Go Back
            </button>

            <button
              onClick={() => navigate(getDashboardRoute())}
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Go to Dashboard
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full bg-secondary hover:bg-secondary-dark text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
