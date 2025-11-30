import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'

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
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-dark py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Register</h1>

        {/* Role Selection Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => handleRoleChange('user')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
              selectedRole === 'user'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Individual User
          </button>
          <button
            onClick={() => handleRoleChange('ngo')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
              selectedRole === 'ngo'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            NGO
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-gray-500 mt-1">Min 6 chars, must include letters and numbers</p>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="10 digit phone number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* NGO Fields */}
          {selectedRole === 'ngo' && (
            <div className="space-y-6 pt-6 border-t-2 border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">NGO Information</h3>

              <div>
                <label htmlFor="ngo.name" className="block text-sm font-medium text-gray-700 mb-2">
                  NGO Name *
                </label>
                <input
                  type="text"
                  id="ngo.name"
                  name="ngo.name"
                  value={formData.ngo.name}
                  onChange={handleChange}
                  required={selectedRole === 'ngo'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="ngo.description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="ngo.description"
                  name="ngo.description"
                  value={formData.ngo.description}
                  onChange={handleChange}
                  required={selectedRole === 'ngo'}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="ngo.mission" className="block text-sm font-medium text-gray-700 mb-2">
                  Mission *
                </label>
                <textarea
                  id="ngo.mission"
                  name="ngo.mission"
                  value={formData.ngo.mission}
                  onChange={handleChange}
                  required={selectedRole === 'ngo'}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="ngo.category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="ngo.category"
                  name="ngo.category"
                  value={formData.ngo.category}
                  onChange={handleChange}
                  required={selectedRole === 'ngo'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a category</option>
                  {NGO_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="ngo.location.city" className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    id="ngo.location.city"
                    name="ngo.location.city"
                    value={formData.ngo.location.city}
                    onChange={handleChange}
                    required={selectedRole === 'ngo'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label htmlFor="ngo.location.state" className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    id="ngo.location.state"
                    name="ngo.location.state"
                    value={formData.ngo.location.state}
                    onChange={handleChange}
                    required={selectedRole === 'ngo'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="ngo.location.address" className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  id="ngo.location.address"
                  name="ngo.location.address"
                  value={formData.ngo.location.address}
                  onChange={handleChange}
                  required={selectedRole === 'ngo'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="ngo.contact.email" className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    id="ngo.contact.email"
                    name="ngo.contact.email"
                    value={formData.ngo.contact.email}
                    onChange={handleChange}
                    required={selectedRole === 'ngo'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label htmlFor="ngo.contact.phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    id="ngo.contact.phone"
                    name="ngo.contact.phone"
                    value={formData.ngo.contact.phone}
                    onChange={handleChange}
                    required={selectedRole === 'ngo'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="ngo.registrationNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Number (Optional)
                </label>
                <input
                  type="text"
                  id="ngo.registrationNumber"
                  name="ngo.registrationNumber"
                  value={formData.ngo.registrationNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-primary-dark font-semibold">
            Login here
          </Link>
        </p>
      </div>
    </div>
  )
}
