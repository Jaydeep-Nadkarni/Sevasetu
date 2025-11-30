import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { Building2, Users, Globe, Zap } from 'lucide-react'

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

export const RegisterNGO = () => {
  const navigate = useNavigate()
  const { registerNGO, isLoading, error, clearError } = useAuth()
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
    if (!formData.ngo.name) {
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
      const result = await registerNGO({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        ngo: formData.ngo,
      })

      if (result.type.endsWith('/fulfilled')) {
        navigate('/ngo/dashboard')
      }
    } catch (err) {
      // Handle error
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Section - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-8 lg:px-12 py-12 overflow-y-auto">
        <div className="max-w-md mx-auto w-full">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Register your NGO</h1>
            <p className="text-gray-600">Join our platform and reach more supporters</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Admin Info Section */}
            <div className="pb-5 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">Your Information</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm mb-4"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
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
              <p className="text-xs text-gray-500 mb-4">Min 6 chars, must include letters and numbers</p>

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
            </div>

            {/* NGO Info Section */}
            <div className="pb-5 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">NGO Information</h3>

              <div className="mb-4">
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

              <div className="mb-4">
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

              <div className="mb-4">
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

              <div className="mb-4">
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
            </div>

            {/* Location Section */}
            <div className="pb-5 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">Location</h3>

              <div className="mb-4">
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

              <div className="grid grid-cols-2 gap-4 mb-4">
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
            </div>

            {/* Contact Section */}
            <div className="pb-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">Contact Information</h3>

              <div className="mb-4">
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

              <div className="mb-4">
                <label htmlFor="ngo.contact.phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Contact Phone *
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Registering NGO...
                </>
              ) : (
                'Complete Registration'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600 text-sm">
            Are you an individual donor?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
              Register here
            </Link>
          </p>

          <p className="mt-4 text-center text-gray-600 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Login here
            </Link>
          </p>
        </div>
      </div>

      {/* Right Section - Illustration (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex-col justify-center items-center px-12 py-12 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-emerald-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-cyan-200 rounded-full opacity-20 blur-3xl"></div>

        <div className="relative z-10 text-center max-w-md">
          {/* Icons Grid */}
          <div className="grid grid-cols-2 gap-6 mb-12">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-8 h-8 text-emerald-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">Scale Impact</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Users className="w-8 h-8 text-cyan-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">Find Supporters</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">Grow Network</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-teal-100 rounded-lg flex items-center justify-center">
                <Globe className="w-8 h-8 text-teal-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">Reach Global</p>
            </div>
          </div>

          {/* Text Content */}
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Amplify your mission</h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            Connect with thousands of donors and volunteers ready to support your cause and create meaningful impact
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-200">
            <div>
              <p className="text-2xl font-bold text-emerald-600">5K+</p>
              <p className="text-xs text-gray-600 mt-1">NGOs Active</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-cyan-600">10K+</p>
              <p className="text-xs text-gray-600 mt-1">Supporters</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">$2M+</p>
              <p className="text-xs text-gray-600 mt-1">Raised</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
