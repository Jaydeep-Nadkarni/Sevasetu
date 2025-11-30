import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useQuery } from '@tanstack/react-query'
import { showNotification } from '../../store/slices/notificationSlice'
import { useSocket } from '../../context/SocketContext'
import api from '../../utils/api'
import { motion } from 'framer-motion'

const DonationHistory = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { socket, invalidateQueries } = useSocket()
  const [selectedDonation, setSelectedDonation] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [cancellingId, setCancellingId] = useState(null)

  // Fetch donations with React Query
  const { data: donations = [], isLoading, refetch } = useQuery({
    queryKey: ['my-donations'],
    queryFn: async () => {
      const response = await api.get('/donations/my')
      return response.data.donations || response.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    onError: (error) => {
      dispatch(showNotification({
        message: error.response?.data?.message || '❌ Failed to fetch donations',
        type: 'error',
      }))
    }
  })

  // Socket.IO listeners for real-time updates
  useEffect(() => {
    if (!socket) return

    const handleDonationUpdate = () => {
      invalidateQueries('my-donations')
      refetch()
    }

    socket.on('donation:created', handleDonationUpdate)
    socket.on('donation:updated', handleDonationUpdate)
    socket.on('donation:accepted', handleDonationUpdate)
    socket.on('donation:cancelled', handleDonationUpdate)

    return () => {
      socket.off('donation:created', handleDonationUpdate)
      socket.off('donation:updated', handleDonationUpdate)
      socket.off('donation:accepted', handleDonationUpdate)
      socket.off('donation:cancelled', handleDonationUpdate)
    }
  }, [socket, invalidateQueries, refetch])

  // Cancel donation
  const handleCancelDonation = async donationId => {
    if (!window.confirm('Are you sure you want to cancel this donation?')) return

    setCancellingId(donationId)
    try {
      await api.delete(`/donations/${donationId}`)
      dispatch(showNotification({
        message: '✅ Donation cancelled successfully',
        type: 'success',
      }))
      // Invalidate cache to trigger refetch
      invalidateQueries('my-donations')
      refetch()
      setSelectedDonation(null)
    } catch (error) {
      dispatch(showNotification({
        message: error.response?.data?.message || '❌ Failed to cancel donation',
        type: 'error',
      }))
    } finally {
      setCancellingId(null)
    }
  }

  // Filter donations
  const filteredDonations =
    statusFilter === 'all' ? donations : donations.filter(d => d.status === statusFilter)

  // Get status color and badge
  const getStatusBadge = status => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 dark:bg-yellow-900', textColor: 'text-yellow-800 dark:text-yellow-200', icon: '⏳' },
      accepted: { color: 'bg-blue-100 dark:bg-blue-900', textColor: 'text-blue-800 dark:text-blue-200', icon: '✅' },
      'in-progress': { color: 'bg-purple-100 dark:bg-purple-900', textColor: 'text-purple-800 dark:text-purple-200', icon: '🚚' },
      completed: { color: 'bg-green-100 dark:bg-green-900', textColor: 'text-green-800 dark:text-green-200', icon: '🎉' },
      cancelled: { color: 'bg-red-100 dark:bg-red-900', textColor: 'text-red-800 dark:text-red-200', icon: '❌' },
      rejected: { color: 'bg-orange-100 dark:bg-orange-900', textColor: 'text-orange-800 dark:text-orange-200', icon: '👎' },
    }
    const config = statusConfig[status] || statusConfig.pending
    return config
  }

  const formatDate = dateString => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTime = dateString => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin">
          <svg className="w-16 h-16 text-orange-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              📚 Donation History
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your donations and see which NGOs are helping.
            </p>
          </div>
          <button
            onClick={() => navigate('/user/create-donation')}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-lg hover:shadow-lg transition"
          >
            + New Donation
          </button>
        </div>

        {/* Status Filter */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {['all', 'pending', 'accepted', 'in-progress', 'completed', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === status
                  ? 'bg-orange-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              {status === 'all' ? '📋 All' : getStatusBadge(status).icon + ' ' + status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Empty State */}
        {filteredDonations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No donations yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start sharing items with NGOs in your area.
            </p>
            <button
              onClick={() => navigate('/user/create-donation')}
              className="px-6 py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition"
            >
              Create Your First Donation
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDonations.map((donation, index) => {
              const statusConfig = getStatusBadge(donation.status)
              return (
                <motion.div
                  key={donation._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedDonation(donation)}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition cursor-pointer overflow-hidden group"
                >
                  {/* Image */}
                  {donation.images?.length > 0 ? (
                    <div className="h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden relative">
                      <img
                        src={donation.images[0].url}
                        alt="Donation"
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-orange-200 to-red-200 dark:from-orange-900 dark:to-red-900 flex items-center justify-center">
                      <span className="text-6xl">📦</span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4">
                    {/* Status Badge */}
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${statusConfig.color} ${statusConfig.textColor}`}>
                      {statusConfig.icon} {donation.status.toUpperCase()}
                    </div>

                    {/* Items Summary */}
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {donation.items[0]?.description || 'Unnamed Donation'}
                    </h3>

                    {/* Items Count */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {donation.items.length} item{donation.items.length !== 1 ? 's' : ''} • {donation.items.reduce((sum, item) => sum + item.quantity, 0)} total
                    </p>

                    {/* Location */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
                      📍 {donation.location?.city || 'Location'}, {donation.location?.state || 'State'}
                    </p>

                    {/* Date */}
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {formatDate(donation.createdAt)}
                    </p>

                    {/* NGO Count */}
                    {donation.assignedNGOs?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                          {donation.assignedNGOs.filter(a => a.status === 'accepted').length > 0
                            ? `✅ ${donation.assignedNGOs.filter(a => a.status === 'accepted').length} NGO${donation.assignedNGOs.filter(a => a.status === 'accepted').length !== 1 ? 's' : ''} helping`
                            : `📌 ${donation.assignedNGOs.length} NGO${donation.assignedNGOs.length !== 1 ? 's' : ''} notified`}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Donation Detail Modal */}
        {selectedDonation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDonation(null)}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-0 md:p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-none md:rounded-2xl shadow-2xl w-full md:max-w-2xl min-h-screen md:min-h-0 md:my-8 flex flex-col"
            >
              {/* Modal Header */}
              <div className="relative shrink-0">
                {selectedDonation.images?.length > 0 && (
                  <img
                    src={selectedDonation.images[0].url}
                    alt="Donation"
                    className="w-full h-48 md:h-64 object-cover md:rounded-t-2xl"
                  />
                )}
                <button
                  onClick={() => setSelectedDonation(null)}
                  className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition z-10"
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4 md:p-8 space-y-6 flex-1 overflow-y-auto">
                {/* Status */}
                <div className="flex items-center gap-4">
                  <div className={`px-4 py-2 rounded-lg text-sm font-bold ${getStatusBadge(selectedDonation.status).color} ${getStatusBadge(selectedDonation.status).textColor}`}>
                    {getStatusBadge(selectedDonation.status).icon} {selectedDonation.status.toUpperCase()}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Created: {formatDate(selectedDonation.createdAt)} at {formatTime(selectedDonation.createdAt)}
                  </p>
                </div>

                {/* Items */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📦 Items</h3>
                  <div className="space-y-3">
                    {selectedDonation.items.map((item, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{item.description}</h4>
                          <span className="text-sm text-orange-600 dark:text-orange-400 font-bold">
                            {item.quantity} {item.unit}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Category: {item.category} • Condition: {item.qualityCondition}
                        </p>
                        {item.expiryDate && (
                          <p className="text-sm text-red-600 dark:text-red-400">
                            Expires: {formatDate(item.expiryDate)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📍 Pickup Location</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-900 dark:text-white font-medium">{selectedDonation.location?.address}</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedDonation.location?.city}, {selectedDonation.location?.state} {selectedDonation.location?.zipcode}
                    </p>
                  </div>
                </div>

                {/* Contact Person */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">👤 Contact Information</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2">
                    <p className="text-gray-900 dark:text-white font-medium">{selectedDonation.contactPerson?.name}</p>
                    <p className="text-gray-600 dark:text-gray-400">📱 {selectedDonation.contactPerson?.phone}</p>
                    {selectedDonation.contactPerson?.email && (
                      <p className="text-gray-600 dark:text-gray-400">✉️ {selectedDonation.contactPerson?.email}</p>
                    )}
                  </div>
                </div>

                {/* Assigned NGOs */}
                {selectedDonation.assignedNGOs?.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      🏢 Assigned NGOs ({selectedDonation.assignedNGOs.length})
                    </h3>
                    <div className="space-y-3">
                      {selectedDonation.assignedNGOs.map((assignment, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {assignment.ngo?.name || 'NGO'}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              📍 {assignment.distanceKm} km away
                            </p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(assignment.status).color} ${getStatusBadge(assignment.status).textColor}`}>
                            {assignment.status.toUpperCase()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Special Instructions */}
                {selectedDonation.specialInstructions && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">📝 Special Instructions</h3>
                    <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      {selectedDonation.specialInstructions}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setSelectedDonation(null)}
                    className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  >
                    Close
                  </button>
                  {(selectedDonation.status === 'pending' || selectedDonation.status === 'accepted') && (
                    <button
                      onClick={() => {
                        handleCancelDonation(selectedDonation._id)
                      }}
                      disabled={cancellingId === selectedDonation._id}
                      className="flex-1 px-6 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                    >
                      {cancellingId === selectedDonation._id ? '⏳ Cancelling...' : '❌ Cancel Donation'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default DonationHistory
