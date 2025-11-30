import { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../hooks/useAuth'
import { Sidebar } from '../../components/Sidebar'
import { Card } from '../../components/UI/Card'
import { Input } from '../../components/UI/Input'
import { Button } from '../../components/UI/Button'
import { ImageUpload } from '../../components/ImageUpload'
import { motion } from 'framer-motion'

export const Profile = () => {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [profileImage, setProfileImage] = useState(user?.profilePicture || null)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    city: user?.location?.city || '',
    state: user?.location?.state || '',
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone must be 10 digits'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleImageUpload = (uploadData) => {
    console.log('Image uploaded:', uploadData)
    setProfileImage(uploadData.url)
    // Update user profile with image URL via API
  }

  const handleImageDelete = () => {
    console.log('Image deleted')
    setProfileImage(null)
    // Update user profile via API
  }

  const handleSave = async () => {
    if (!validateForm()) return
    setIsSaving(true)
    try {
      // API call would go here
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  return (
    <div className={`flex h-screen ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Menu Button */}
        <div className="md:hidden p-4 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8 flex items-center justify-between"
            >
              <div>
                <h1 className="text-4xl font-bold mb-2">My Profile</h1>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Manage your account information
                </p>
              </div>
              <Button
                variant={isEditing ? 'outline' : 'primary'}
                onClick={() => {
                  if (isEditing) {
                    setFormData({
                      firstName: user?.firstName || '',
                      lastName: user?.lastName || '',
                      email: user?.email || '',
                      phone: user?.phone || '',
                      bio: user?.bio || '',
                      city: user?.location?.city || '',
                      state: user?.location?.state || '',
                    })
                  }
                  setIsEditing(!isEditing)
                }}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Picture & Basic Info */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card>
                  <div className="text-center">
                    {/* Profile Picture */}
                    {profileImage ? (
                      <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden border-4 border-primary">
                        <img
                          src={profileImage}
                          alt={`${user?.firstName} ${user?.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className={`w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center text-5xl font-bold ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        {user?.firstName?.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <h2 className="text-2xl font-bold">
                      {user?.firstName} {user?.lastName}
                    </h2>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                      {user?.email}
                    </p>

                    {isEditing && (
                      <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-700">
                        <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Profile Picture
                        </label>
                        <ImageUpload
                          onUpload={handleImageUpload}
                          onDelete={handleImageDelete}
                          currentImageUrl={profileImage}
                          maxSize={5242880}
                        />
                      </div>
                    )}

                    {/* User Stats */}
                    <div className={`mt-6 pt-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-lg font-bold text-primary">8</p>
                          <p className="text-xs">Badges</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-primary">48</p>
                          <p className="text-xs">Hours</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Profile Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="lg:col-span-2"
              >
                <Card header="Personal Information">
                  <form className="space-y-6">
                    {/* Name Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        disabled={!isEditing}
                        error={errors.firstName}
                        required
                      />
                      <Input
                        label="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        disabled={!isEditing}
                        error={errors.lastName}
                        required
                      />
                    </div>

                    {/* Email & Phone Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                        error={errors.email}
                        required
                      />
                      <Input
                        label="Phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                        error={errors.phone}
                        placeholder="10-digit number"
                      />
                    </div>

                    {/* Location Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="City"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                      <Input
                        label="State"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </div>

                    {/* Bio */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        disabled={!isEditing}
                        rows="4"
                        className={`w-full px-4 py-2 rounded-lg border transition ${isDark ? 'bg-gray-700 text-white border-gray-600 focus:border-primary' : 'bg-white text-gray-900 border-gray-300 focus:border-primary'} focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed`}
                        placeholder="Tell us about yourself"
                      />
                    </div>

                    {/* Save Button */}
                    {isEditing && (
                      <div className="flex gap-4 pt-4 border-t border-gray-300 dark:border-gray-700">
                        <Button
                          variant="primary"
                          onClick={handleSave}
                          isLoading={isSaving}
                          className="flex-1"
                        >
                          Save Changes
                        </Button>
                      </div>
                    )}
                  </form>
                </Card>
              </motion.div>
            </div>

            {/* Additional Sections */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8"
            >
              {/* Preferences */}
              <Card header="Preferences">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Receive email updates
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Event Reminders</p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Get reminded about events
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded"
                    />
                  </div>
                </div>
              </Card>

              {/* Danger Zone */}
              <Card header="Danger Zone">
                <div className="space-y-4">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    These actions cannot be undone.
                  </p>
                  <Button variant="danger" className="w-full">
                    Deactivate Account
                  </Button>
                  <Button variant="danger" className="w-full">
                    Delete Account
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
