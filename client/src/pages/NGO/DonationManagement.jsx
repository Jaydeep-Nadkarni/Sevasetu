import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { showNotification } from '../../redux/slices/notificationSlice'
import api from '../../api/axiosInstance'
import { motion } from 'framer-motion'

const DonationManagement = () => {
  const dispatch = useDispatch()
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDonation, setSelectedDonation] = useState(null)
  const [tab, setTab] = useState('available') // available, accepted, in-progress, completed
  const [actionLoading, setActionLoading] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [completionDate, setCompletionDate] = useState(new Date().toISOString().split('T')[0])
  const [showCompleteModal, setShowCompleteModal] = useState(false)

  // Fetch donations
  useEffect(() => {
    fetchDonations()
  }, [tab])

  const fetchDonations = async () => {
    try {
      setLoading(true)
      let endpoint = '/donations'

      if (tab === 'available') {
        endpoint = '/donations/available'
      } else if (tab === 'accepted' || tab === 'in-progress' || tab === 'completed') {
        endpoint = '/donations/assigned'
      }

      const response = await api.get(endpoint)
      let data = response.data.donations || response.data

      // Filter by status for processed tabs
      if (tab !== 'available') {
        data = data.filter(d => {
          if (tab === 'accepted') return d.status === 'accepted'
          if (tab === 'in-progress') return d.status === 'in-progress'
          if (tab === 'completed') return d.status === 'completed'
          return true
        })
      }

      setDonations(data)
    } catch (error) {
      console.error('Fetch donations error:', error)
      dispatch(showNotification({
        message: error.response?.data?.message || '❌ Failed to fetch donations',
        type: 'error',
      }))
    } finally {
      setLoading(false)
    }
  }

  // Accept donation
  const handleAccept = async donationId => {
    setActionLoading(donationId)
    try {
      await api.patch(`/donations/${donationId}/accept`, { notes: 'Accepted by NGO' })
      dispatch(showNotification({
        message: '✅ Donation accepted successfully!',
        type: 'success',
      }))
      fetchDonations()
      setSelectedDonation(null)
    } catch (error) {
      dispatch(showNotification({
        message: error.response?.data?.message || '❌ Failed to accept donation',
        type: 'error',
      }))
    } finally {
      setActionLoading(null)
    }
  }

  // Reject donation
  const handleReject = async donationId => {
    if (!rejectReason.trim()) {
      dispatch(showNotification({
        message: '⚠️ Please provide a reason for rejection',
        type: 'error',
      }))
      return
    }

    setActionLoading(donationId)
    try {
      await api.patch(`/donations/${donationId}/reject`, { reason: rejectReason })
      dispatch(showNotification({
        message: '✅ Donation rejected',
        type: 'success',
      }))
      setShowRejectModal(false)
      setRejectReason('')
      fetchDonations()
      setSelectedDonation(null)
    } catch (error) {
      dispatch(showNotification({
        message: error.response?.data?.message || '❌ Failed to reject donation',
        type: 'error',
      }))
    } finally {
      setActionLoading(null)
    }
  }

  // Complete donation
  const handleComplete = async donationId => {
    setActionLoading(donationId)
    try {
      await api.patch(`/donations/${donationId}/complete`, { actualPickupDate: completionDate })
      dispatch(showNotification({
        message: '🎉 Donation marked as completed!',
        type: 'success',
      }))
      setShowCompleteModal(false)
      setCompletionDate(new Date().toISOString().split('T')[0])
      fetchDonations()
      setSelectedDonation(null)
    } catch (error) {
      dispatch(showNotification({
        message: error.response?.data?.message || '❌ Failed to complete donation',
        type: 'error',
      }))
    } finally {
      setActionLoading(null)
    }
  }

  // Get status badge
  const getStatusBadge = status => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 dark:bg-yellow-900', textColor: 'text-yellow-800 dark:text-yellow-200', icon: '⏳' },
      accepted: { color: 'bg-blue-100 dark:bg-blue-900', textColor: 'text-blue-800 dark:text-blue-200', icon: '✅' },
      'in-progress': { color: 'bg-purple-100 dark:bg-purple-900', textColor: 'text-purple-800 dark:text-purple-200', icon: '🚚' },
      completed: { color: 'bg-green-100 dark:bg-green-900', textColor: 'text-green-800 dark:text-green-200', icon: '🎉' },
      rejected: { color: 'bg-red-100 dark:bg-red-900', textColor: 'text-red-800 dark:text-red-200', icon: '👎' },
    }
    return statusConfig[status] || statusConfig.pending
  }

  const formatDate = dateString => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTime = dateString => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin">
          <svg className="w-16 h-16 text-blue-500" fill="none" viewBox="0 0 24 24">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🏢 Donation Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review and manage donations assigned to your organization.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-2 flex-wrap border-b border-gray-200 dark:border-gray-700">
          {[
            { key: 'available', label: '📌 Available', icon: '⏳' },
            { key: 'accepted', label: '✅ Accepted', icon: '✅' },
            { key: 'in-progress', label: '🚚 In Progress', icon: '🚚' },
            { key: 'completed', label: '🎉 Completed', icon: '🎉' },
          ].map(tabItem => (
            <button
              key={tabItem.key}
              onClick={() => setTab(tabItem.key)}
              className={`px-6 py-3 font-medium transition border-b-2 ${
                tab === tabItem.key
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              {tabItem.label}
            </button>
          ))}
        </div>

        {/* Empty State */}
        {donations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No donations found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {tab === 'available'
                ? 'No new donations in your area yet. Check back soon!'
                : `You don't have any ${tab} donations yet.`}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donations.map((donation, index) => {
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
                    <div className="h-48 bg-gradient-to-br from-blue-200 to-indigo-200 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center">
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

                    {/* Donor Name */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                      👤 {donation.contactPerson?.name || 'Donor'}
                    </p>

                    {/* Distance (for available donations) */}
                    {tab === 'available' && donation.assignedNGOs?.length > 0 && (
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-3">
                        📍 {donation.assignedNGOs[0]?.distanceKm || 'N/A'} km away
                      </p>
                    )}

                    {/* Items Count */}
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                      {donation.items.length} item{donation.items.length !== 1 ? 's' : ''} •{' '}
                      {donation.items.reduce((sum, item) => sum + item.quantity, 0)} total
                    </p>

                    {/* Contact Button (for available donations) */}
                    {tab === 'available' && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <a
                          href={`tel:${donation.contactPerson?.phone}`}
                          onClick={e => e.stopPropagation()}
                          className="flex-1 px-3 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-bold rounded hover:bg-green-200 dark:hover:bg-green-800 transition text-center"
                        >
                          📞 Call
                        </a>
                        {donation.contactPerson?.email && (
                          <a
                            href={`mailto:${donation.contactPerson?.email}`}
                            onClick={e => e.stopPropagation()}
                            className="flex-1 px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition text-center"
                          >
                            ✉️ Email
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Detail Modal */}
        {selectedDonation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDonation(null)}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full my-8"
            >
              {/* Modal Header */}
              <div className="relative">
                {selectedDonation.images?.length > 0 && (
                  <img
                    src={selectedDonation.images[0].url}
                    alt="Donation"
                    className="w-full h-64 object-cover rounded-t-2xl"
                  />
                )}
                <button
                  onClick={() => setSelectedDonation(null)}
                  className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition"
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8 space-y-6">
                {/* Status */}
                <div className="flex items-center gap-4">
                  <div className={`px-4 py-2 rounded-lg text-sm font-bold ${getStatusBadge(selectedDonation.status).color} ${getStatusBadge(selectedDonation.status).textColor}`}>
                    {getStatusBadge(selectedDonation.status).icon} {selectedDonation.status.toUpperCase()}
                  </div>
                </div>

                {/* Donor Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">👤 Donor Information</h3>
                  <p className="text-gray-900 dark:text-white font-medium">{selectedDonation.contactPerson?.name}</p>
                  <a href={`tel:${selectedDonation.contactPerson?.phone}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                    📱 {selectedDonation.contactPerson?.phone}
                  </a>
                  {selectedDonation.contactPerson?.email && (
                    <a href={`mailto:${selectedDonation.contactPerson?.email}`} className="block text-blue-600 dark:text-blue-400 hover:underline">
                      ✉️ {selectedDonation.contactPerson?.email}
                    </a>
                  )}
                </div>

                {/* Items */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📦 Items</h3>
                  <div className="space-y-3">
                    {selectedDonation.items.map((item, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{item.description}</h4>
                          <span className="text-sm text-blue-600 dark:text-blue-400 font-bold">
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

                {/* Pickup Schedule */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🕐 Pickup Schedule</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    {selectedDonation.pickupSchedule?.preferredDate ? (
                      <>
                        <p className="text-gray-900 dark:text-white font-medium">
                          📅 {formatDate(selectedDonation.pickupSchedule.preferredDate)}
                          {selectedDonation.pickupSchedule.preferredTime && ` at ${selectedDonation.pickupSchedule.preferredTime}`}
                        </p>
                        {selectedDonation.pickupSchedule.isFlexible && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">⏰ Flexible timing available</p>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400">No specific schedule preference</p>
                    )}
                  </div>
                </div>

                {/* Special Instructions */}
                {selectedDonation.specialInstructions && (
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">📝 Special Instructions</h3>
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

                  {tab === 'available' && (
                    <>
                      <button
                        onClick={() => handleAccept(selectedDonation._id)}
                        disabled={actionLoading === selectedDonation._id}
                        className="flex-1 px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                      >
                        {actionLoading === selectedDonation._id ? '⏳ Accepting...' : '✅ Accept Donation'}
                      </button>
                      <button
                        onClick={() => setShowRejectModal(true)}
                        className="px-6 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition"
                      >
                        ❌ Reject
                      </button>
                    </>
                  )}

                  {tab === 'accepted' && (
                    <button
                      onClick={() => setShowCompleteModal(true)}
                      className="flex-1 px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition"
                    >
                      🎉 Mark as Complete
                    </button>
                  )}

                  {tab === 'in-progress' && (
                    <button
                      onClick={() => setShowCompleteModal(true)}
                      className="flex-1 px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition"
                    >
                      ✅ Mark as Complete
                    </button>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Reject Modal */}
            {showRejectModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setShowRejectModal(false)}
                className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  onClick={e => e.stopPropagation()}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8"
                >
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">❌ Reject Donation</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Please provide a reason for rejecting this donation.
                  </p>
                  <textarea
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="E.g., Items don't match our current needs, storage issues, etc."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 h-24 mb-4"
                  />
                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowRejectModal(false)}
                      className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReject(selectedDonation._id)}
                      disabled={actionLoading === selectedDonation._id}
                      className="flex-1 px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                    >
                      {actionLoading === selectedDonation._id ? '⏳...' : 'Reject'}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Complete Modal */}
            {showCompleteModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setShowCompleteModal(false)}
                className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  onClick={e => e.stopPropagation()}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8"
                >
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">✅ Mark as Completed</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    When did you pick up this donation?
                  </p>
                  <input
                    type="date"
                    value={completionDate}
                    onChange={e => setCompletionDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 mb-4"
                  />
                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowCompleteModal(false)}
                      className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleComplete(selectedDonation._id)}
                      disabled={actionLoading === selectedDonation._id}
                      className="flex-1 px-4 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                    >
                      {actionLoading === selectedDonation._id ? '⏳...' : 'Complete'}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default DonationManagement
