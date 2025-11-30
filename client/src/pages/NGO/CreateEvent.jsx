import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { motion } from 'framer-motion'
import { MapPin, Calendar, Clock, Users, Upload, AlertCircle, CheckCircle } from 'lucide-react'
import { LocationPicker } from '../../components/Map/LocationPicker'

const CreateEvent = () => {
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'volunteering',
    eventDate: '',
    eventTime: '',
    duration: '120',
    location: '',
    city: '',
    state: '',
    zipcode: '',
    capacity: '',
    isVirtual: false,
    meetingLink: '',
    contactPersonName: user?.name || '',
    contactPersonPhone: '',
    contactPersonEmail: user?.email || '',
    requirements: '',
    entryFee: '0',
    tags: '',
  })

  const [bannerImage, setBannerImage] = useState(null)
  const [bannerPreview, setBannerPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [coordinates, setCoordinates] = useState(null)

  const categories = [
    'fundraiser',
    'awareness',
    'volunteer',
    'workshop',
    'conference',
    'sports',
    'cultural',
    'other',
  ]

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setError('')
  }

  const handleBannerChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setBannerImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setBannerPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLocationSelect = (locationData) => {
    setFormData(prev => ({
      ...prev,
      location: locationData.address,
      city: locationData.city,
      state: locationData.state,
      zipcode: locationData.zipcode || '',
    }))
    setCoordinates({ lat: locationData.lat, lng: locationData.lng })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate required fields
      if (
        !formData.title ||
        !formData.description ||
        !formData.eventDate ||
        !formData.eventTime ||
        !formData.location ||
        !formData.city ||
        !formData.capacity
      ) {
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }

      // Get coordinates if not already fetched
      if (!coordinates && !formData.isVirtual) {
        setError('Please select a location on the map')
        setLoading(false)
        return
      }

      const submitData = new FormData()

      // Add form fields
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key])
      })

      // Add coordinates
      if (coordinates) {
        submitData.append('coordinates', JSON.stringify(coordinates))
      }

      // Add banner image
      if (bannerImage) {
        submitData.append('banner', bannerImage)
      }

      const response = await axios.post('/api/events', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setSuccess(true)
      setTimeout(() => {
        navigate('/ngo/events')
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event')
      console.error('Error creating event:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Event</h1>
          <p className="text-gray-600">Organize and manage your NGO events</p>
        </div>

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3"
          >
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">Event Created Successfully!</p>
              <p className="text-sm text-green-700">Redirecting to events page...</p>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </motion.div>
        )}

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          <form onSubmit={handleSubmit} className="p-8">
            {/* Banner Upload */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Event Banner Image
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
              >
                {bannerPreview ? (
                  <div className="space-y-2">
                    <img src={bannerPreview} alt="Banner preview" className="max-h-40 mx-auto rounded" />
                    <p className="text-sm text-gray-600">Click to change image</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-10 h-10 text-blue-500 mx-auto" />
                    <p className="text-gray-700 font-medium">Click to upload banner image</p>
                    <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleBannerChange}
                className="hidden"
              />
            </div>

            {/* Basic Information */}
            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter event title"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your event in detail"
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Entry Fee ($)
                  </label>
                  <input
                    type="number"
                    name="entryFee"
                    value={formData.entryFee}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Date & Time
              </h3>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Event Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="eventTime"
                    value={formData.eventTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Duration (minutes) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    min="15"
                    max="1440"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-green-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                Location
              </h3>

              <div className="space-y-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Search & Select Location <span className="text-red-500">*</span>
                  </label>
                  <LocationPicker onLocationSelect={handleLocationSelect} />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Full Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Street address"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="State"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      name="zipcode"
                      value={formData.zipcode}
                      onChange={handleInputChange}
                      placeholder="ZIP code"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Virtual Event Option */}
              <div className="mt-4 pt-4 border-t border-green-200">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="isVirtual"
                    checked={formData.isVirtual}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-green-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-900">This is a virtual event</span>
                </label>

                {formData.isVirtual && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Meeting Link
                    </label>
                    <input
                      type="url"
                      name="meetingLink"
                      value={formData.meetingLink}
                      onChange={handleInputChange}
                      placeholder="https://zoom.us/... or https://meet.google.com/..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Capacity & Requirements */}
            <div className="bg-purple-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Capacity & Requirements
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Event Capacity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="Number of participants"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Requirements (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    placeholder="e.g., Valid ID, Vaccination Certificate"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="e.g., fundraiser, community, social"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-amber-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    name="contactPersonName"
                    value={formData.contactPersonName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      name="contactPersonPhone"
                      value={formData.contactPersonPhone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      name="contactPersonEmail"
                      value={formData.contactPersonEmail}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition"
              >
                {loading ? 'Creating Event...' : 'Create Event'}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default CreateEvent
