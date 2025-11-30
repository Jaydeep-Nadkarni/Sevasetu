import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import ImageUpload from '../../components/ImageUpload'
import { showNotification } from '../../redux/slices/notificationSlice'
import api from '../../api/axiosInstance'
import { motion } from 'framer-motion'

const CreateDonation = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [latitude, setLatitude] = useState(null)
  const [longitude, setLongitude] = useState(null)
  const [address, setAddress] = useState('')
  const [images, setImages] = useState([])
  const [items, setItems] = useState([{ category: 'food', description: '', quantity: 1, unit: 'kg' }])

  const [formData, setFormData] = useState({
    items: [],
    location: {
      coordinates: [],
      address: '',
      city: '',
      state: '',
      zipcode: '',
    },
    images: [],
    contactPerson: {
      name: '',
      phone: '',
      email: '',
    },
    specialInstructions: '',
    accessInstructions: '',
    pickupSchedule: {
      preferredDate: '',
      preferredTime: '',
      isFlexible: true,
    },
  })

  // Get user's current location
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords
          setLatitude(latitude)
          setLongitude(longitude)
          dispatch(showNotification({ message: '📍 Location retrieved successfully', type: 'success' }))
        },
        error => {
          dispatch(showNotification({ message: '❌ Unable to get location', type: 'error' }))
        }
      )
    }
  }

  // Handle input changes
  const handleInputChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle location change
  const handleLocationChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [name]: value,
      },
    }))
  }

  // Handle contact person change
  const handleContactChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      contactPerson: {
        ...prev.contactPerson,
        [name]: value,
      },
    }))
  }

  // Handle item addition/change
  const handleItemChange = (index, field, value) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const addItem = () => {
    setItems([...items, { category: 'food', description: '', quantity: 1, unit: 'kg' }])
  }

  const removeItem = index => {
    setItems(items.filter((_, i) => i !== index))
  }

  // Handle image upload
  const handleImagesSelected = selectedImages => {
    setImages(selectedImages)
  }

  // Handle pickup schedule change
  const handlePickupChange = e => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      pickupSchedule: {
        ...prev.pickupSchedule,
        [name]: type === 'checkbox' ? checked : value,
      },
    }))
  }

  // Validate form
  const validateForm = () => {
    if (!formData.contactPerson.name || !formData.contactPerson.phone) {
      dispatch(showNotification({ message: '⚠️ Please fill in contact details', type: 'error' }))
      return false
    }

    if (items.length === 0 || items.some(item => !item.description)) {
      dispatch(showNotification({ message: '⚠️ Please add at least one item with description', type: 'error' }))
      return false
    }

    if (!latitude || !longitude) {
      dispatch(showNotification({ message: '⚠️ Please set a location', type: 'error' }))
      return false
    }

    if (!formData.location.address || !formData.location.city) {
      dispatch(showNotification({ message: '⚠️ Please provide address and city', type: 'error' }))
      return false
    }

    return true
  }

  // Submit form
  const handleSubmit = async e => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      // Prepare form data
      const submitData = new FormData()

      // Add items array
      submitData.append('items', JSON.stringify(items))

      // Add location with coordinates
      submitData.append('location', JSON.stringify({
        ...formData.location,
        coordinates: [longitude, latitude],
      }))

      // Add contact person
      submitData.append('contactPerson', JSON.stringify(formData.contactPerson))

      // Add other fields
      submitData.append('specialInstructions', formData.specialInstructions)
      submitData.append('accessInstructions', formData.accessInstructions)
      submitData.append('pickupSchedule', JSON.stringify(formData.pickupSchedule))

      // Add images
      images.forEach(image => {
        if (image instanceof File) {
          submitData.append('images', image)
        }
      })

      // Submit to API
      const response = await api.post('/donations', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      dispatch(showNotification({
        message: '✅ Donation created successfully! NGOs will be notified.',
        type: 'success',
      }))

      // Navigate to donation history after 1.5s
      setTimeout(() => navigate('/user/donations'), 1500)
    } catch (error) {
      console.error('Create donation error:', error)
      dispatch(showNotification({
        message: error.response?.data?.message || '❌ Failed to create donation',
        type: 'error',
      }))
    } finally {
      setLoading(false)
    }
  }

  const itemCategories = ['food', 'clothes', 'essentials', 'medical', 'electronics', 'books', 'other']
  const units = ['kg', 'lbs', 'pieces', 'boxes', 'items', 'liters', 'packs', 'count']
  const qualityConditions = ['new', 'like-new', 'good', 'fair', 'used']

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              🎁 Create Donation
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Share items with NGOs in your area. They'll be automatically matched to nearby organizations.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Donation Items Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                📦 What are you donating?
              </h2>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Category */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Category
                        </label>
                        <select
                          value={item.category}
                          onChange={e => handleItemChange(index, 'category', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                        >
                          {itemCategories.map(cat => (
                            <option key={cat} value={cat}>
                              {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Quantity
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                          />
                          <select
                            value={item.unit}
                            onChange={e => handleItemChange(index, 'unit', e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                          >
                            {units.map(u => (
                              <option key={u} value={u}>
                                {u}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description *
                      </label>
                      <textarea
                        value={item.description}
                        onChange={e => handleItemChange(index, 'description', e.target.value)}
                        placeholder="E.g., Basmati rice, new clothes, medical supplies..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 h-20"
                      />
                    </div>

                    {/* Quality & Expiry */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Condition
                        </label>
                        <select
                          value={item.qualityCondition || 'good'}
                          onChange={e => handleItemChange(index, 'qualityCondition', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                        >
                          {qualityConditions.map(q => (
                            <option key={q} value={q}>
                              {q.charAt(0).toUpperCase() + q.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Expiry Date (if applicable)
                        </label>
                        <input
                          type="date"
                          value={item.expiryDate || ''}
                          onChange={e => handleItemChange(index, 'expiryDate', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Remove Item Button */}
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition"
                      >
                        Remove Item
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>

              <button
                type="button"
                onClick={addItem}
                className="mt-4 px-6 py-2 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-800 transition font-medium"
              >
                + Add Another Item
              </button>
            </div>

            {/* Images Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                📸 Add Photos
              </h2>
              <ImageUpload
                onImagesSelected={handleImagesSelected}
                maxImages={5}
                folder="donations"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Photos help NGOs understand the items better. You can upload up to 5 images.
              </p>
            </div>

            {/* Location Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                📍 Pickup Location
              </h2>

              {/* Get Location Button */}
              <button
                type="button"
                onClick={getLocation}
                className="mb-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium flex items-center gap-2"
              >
                📌 Use My Current Location
              </button>

              {latitude && longitude && (
                <p className="text-sm text-green-600 dark:text-green-400 mb-4">
                  ✅ Location set: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.location.address}
                    onChange={handleLocationChange}
                    placeholder="Street address"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.location.city}
                    onChange={handleLocationChange}
                    placeholder="City"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.location.state}
                    onChange={handleLocationChange}
                    placeholder="State"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Zipcode
                  </label>
                  <input
                    type="text"
                    name="zipcode"
                    value={formData.location.zipcode}
                    onChange={handleLocationChange}
                    placeholder="Zipcode"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                👤 Contact Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.contactPerson.name}
                    onChange={handleContactChange}
                    placeholder="Your name"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.contactPerson.phone}
                    onChange={handleContactChange}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.contactPerson.email}
                    onChange={handleContactChange}
                    placeholder="your@email.com"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Pickup Schedule Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                🕐 Pickup Schedule
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    name="preferredDate"
                    value={formData.pickupSchedule.preferredDate}
                    onChange={handlePickupChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preferred Time
                  </label>
                  <input
                    type="time"
                    name="preferredTime"
                    value={formData.pickupSchedule.preferredTime}
                    onChange={handlePickupChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isFlexible"
                      checked={formData.pickupSchedule.isFlexible}
                      onChange={handlePickupChange}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Flexible timing
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Special Instructions Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                📝 Additional Information
              </h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Special Instructions
                </label>
                <textarea
                  name="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={handleInputChange}
                  placeholder="E.g., Items need to be refrigerated, fragile items, specific handling instructions..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 h-20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Access Instructions
                </label>
                <textarea
                  name="accessInstructions"
                  value={formData.accessInstructions}
                  onChange={handleInputChange}
                  placeholder="E.g., Key with neighbor, building access code, gate number..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 h-20"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8 flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '⏳ Creating Donation...' : '🎁 Create Donation'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/user/donations')}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default CreateDonation
