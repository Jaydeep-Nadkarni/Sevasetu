import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { Heart, Zap, Users, Globe } from 'lucide-react'

const NGO_CATEGORIES = [
  'Education',
  'Healthcare',
  'Environment',
  'Animal Welfare',
  'Disaster Relief',
  'Poverty Alleviation',
  'Women Empowerment',
  'Other',
]

export const Register = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { register, registerNGO, isLoading, error, clearError } = useAuth()
  const [selectedRole, setSelectedRole] = useState('user')

  // Initialize role from query parameter on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const roleParam = searchParams.get('role')
    if (roleParam === 'ngo') {
      setSelectedRole('ngo')
    } else {
      setSelectedRole('user')
    }
  }, [location.search])
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    ngo: {
      name: '',
      description: '',
      mission: '',
      category: '',
      location: {
        address: '',
        city: '',
        state: '',
      },
      contact: {
        email: '',
        phone: '',
        website: '',
      },
      registrationNumber: '',
    },
  })

  const handleRoleChange = (role) => {
    setSelectedRole(role)
    if (error) clearError()
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    const keys = name.split('.')
    if (keys.length === 1) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [keys[0]]: {
          ...prev[keys[0]],
          [keys[1]]: keys.length === 3 ? { ...prev[keys[0]][keys[1]], [keys[2]]: value } : value,
        },
      }))
    }
    if (error) clearError()
  }

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match'
    }
    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters long'
    }
    if (!/[0-9]/.test(formData.password) || !/[a-zA-Z]/.test(formData.password)) {
      return 'Password must contain both letters and numbers'
    }
    if (selectedRole === 'ngo' && !formData.ngo.name) {
      return 'NGO name is required'
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      return
    }

    try {
      let result
      if (selectedRole === 'user') {
        result = await register({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          role: 'user',
        })
      } else {
        result = await registerNGO({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          ngo: formData.ngo,
        })
      }

      // Check if registration was successful
      if (result.type.endsWith('/fulfilled')) {
        const role = result.payload?.user?.role
        if (role === 'user') {
          navigate('/user/dashboard')
        } else if (role === 'ngo_admin') {
          navigate('/ngo/dashboard')
        } else if (role === 'admin') {
          navigate('/admin/dashboard')
        } else {
          navigate('/user/dashboard')
        }
      } else if (result.type.endsWith('/rejected')) {
        // Handle registration error
      }
    } catch (err) {
      // Handle error
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Section - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-8 lg:px-12 py-12">
        <div className="max-w-md mx-auto w-full">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Register</h1>
            <p className="text-gray-600">Join our community and make a difference</p>
          </div>

          {/* Toggle Button */}
          <div className="flex gap-3 mb-8 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => handleRoleChange('user')}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition duration-200 ${
                selectedRole === 'user'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'bg-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Individual User
            </button>
            <button
              onClick={() => handleRoleChange('ngo')}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition duration-200 ${
                selectedRole === 'ngo'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'bg-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              NGO
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Common Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1.5">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

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
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">Min 6 chars, must include letters and numbers</p>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10 digit phone number"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* NGO Fields - Only show when NGO is selected */}
            {selectedRole === 'ngo' && (
              <div className="space-y-5 pt-5 border-t border-gray-200">
                <div>
                  <label htmlFor="ngo.name" className="block text-sm font-medium text-gray-700 mb-1.5">
                    NGO Name *
                  </label>
                  <input
                    type="text"
                    id="ngo.name"
                    name="ngo.name"
                    value={formData.ngo.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="ngo.description" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description *
                  </label>
                  <textarea
                    id="ngo.description"
                    name="ngo.description"
                    value={formData.ngo.description}
                    onChange={handleChange}
                    required
                    rows="2"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="ngo.mission" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Mission *
                  </label>
                  <textarea
                    id="ngo.mission"
                    name="ngo.mission"
                    value={formData.ngo.mission}
                    onChange={handleChange}
                    required
                    rows="2"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="ngo.category" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Category *
                  </label>
                  <select
                    id="ngo.category"
                    name="ngo.category"
                    value={formData.ngo.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">Select a category</option>
                    {NGO_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="ngo.location.city" className="block text-sm font-medium text-gray-700 mb-1.5">
                      City *
                    </label>
                    <input
                      type="text"
                      id="ngo.location.city"
                      name="ngo.location.city"
                      value={formData.ngo.location.city}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="ngo.location.state" className="block text-sm font-medium text-gray-700 mb-1.5">
                      State *
                    </label>
                    <input
                      type="text"
                      id="ngo.location.state"
                      name="ngo.location.state"
                      value={formData.ngo.location.state}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="ngo.location.address" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Address *
                  </label>
                  <input
                    type="text"
                    id="ngo.location.address"
                    name="ngo.location.address"
                    value={formData.ngo.location.address}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="ngo.contact.email" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      id="ngo.contact.email"
                      name="ngo.contact.email"
                      value={formData.ngo.contact.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="ngo.contact.phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      id="ngo.contact.phone"
                      name="ngo.contact.phone"
                      value={formData.ngo.contact.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="ngo.registrationNumber" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Registration Number (Optional)
                  </label>
                  <input
                    type="text"
                    id="ngo.registrationNumber"
                    name="ngo.registrationNumber"
                    value={formData.ngo.registrationNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-6"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Login here
            </Link>
          </p>
        </div>
      </div>

      {/* Right Section - Illustration (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex-col justify-center items-center px-12 py-12 relative overflow-hidden">
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
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Join us on a mission</h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            Be part of a global community dedicated to creating positive change through volunteering and donations
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-200">
            <div>
              <p className="text-2xl font-bold text-blue-600">10K+</p>
              <p className="text-xs text-gray-600 mt-1">Volunteers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">5K+</p>
              <p className="text-xs text-gray-600 mt-1">NGOs</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-pink-600">$2M+</p>
              <p className="text-xs text-gray-600 mt-1">Donated</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
