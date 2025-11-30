import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { Heart, Zap, Users, Globe } from 'lucide-react'

export const Login = () => {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (error) clearError()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login({
      email: formData.email,
      password: formData.password,
    })

    if (result.payload?.user?.role) {
      const role = result.payload.user.role
      if (role === 'user') {
        navigate('/user/dashboard')
      } else if (role === 'ngo_admin') {
        navigate('/ngo/dashboard')
      } else if (role === 'admin') {
        navigate('/admin/dashboard')
      }
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Section - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-8 lg:px-12 py-12 min-h-screen">
        <div className="max-w-md mx-auto w-full">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600 cursor-pointer">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-6"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
              Register as a donor
            </Link>
          </p>

          <p className="mt-4 text-center text-gray-600 text-sm">
            Are you an NGO?{' '}
            <Link to="/register-ngo" className="text-blue-600 hover:text-blue-700 font-semibold">
              Register your organization
            </Link>
          </p>
        </div>
      </div>

      {/* Right Section - Illustration (Hidden on mobile) */}
      <div className="hidden lg:flex lg:fixed lg:right-0 lg:top-0 w-1/2 h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex-col justify-center items-center px-12 py-12 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>

        <div className="relative z-10 text-center max-w-md">
          {/* Icons Grid */}
          <div className="grid grid-cols-2 gap-6 mb-12">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center">
                <Heart className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">Give & Inspire</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Zap className="w-8 h-8 text-yellow-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">Make Impact</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">Join Community</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                <Globe className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">Change World</p>
            </div>
          </div>

          {/* Text Content */}
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Sevasetu</h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            Connect with meaningful causes, make donations, volunteer with NGOs, and create positive change in the world
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-200">
            <div>
              <p className="text-2xl font-bold text-blue-600">10K+</p>
              <p className="text-xs text-gray-600 mt-1">Active Users</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">5K+</p>
              <p className="text-xs text-gray-600 mt-1">NGOs</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-pink-600">$2M+</p>
              <p className="text-xs text-gray-600 mt-1">Raised</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
