import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { motion } from 'framer-motion'
import QRCode from 'qrcode.react'
import {
  MapPin,
  Calendar,
  Users,
  AlertCircle,
  Loader,
  Download,
  Copy,
  CheckCircle,
  Link2,
  Phone,
  Mail,
} from 'lucide-react'

const EventDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSelector(state => state.auth)

  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isRegistered, setIsRegistered] = useState(false)
  const [qrCode, setQrCode] = useState(null)
  const [showQR, setShowQR] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [cancellingRegistration, setCancellingRegistration] = useState(false)
  const [copiedToClipboard, setCopiedToClipboard] = useState(false)

  useEffect(() => {
    fetchEventDetails()
  }, [id])

  const fetchEventDetails = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await axios.get(`/api/events/${id}`)
      setEvent(response.data.event)
      setIsRegistered(response.data.isRegistered || false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch event details')
      console.error('Error fetching event:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    try {
      setRegistering(true)
      setError('')

      const response = await axios.post(`/api/events/${id}/join`)

      setIsRegistered(true)
      setQrCode(response.data.qrCode)
      setShowQR(true)

      // Refresh event details
      fetchEventDetails()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register for event')
      console.error('Error registering:', err)
    } finally {
      setRegistering(false)
    }
  }

  const handleCancelRegistration = async () => {
    if (!window.confirm('Are you sure you want to cancel your registration?')) {
      return
    }

    try {
      setCancellingRegistration(true)
      setError('')

      await axios.post(`/api/events/${id}/leave`)

      setIsRegistered(false)
      setShowQR(false)
      setQrCode(null)

      // Refresh event details
      fetchEventDetails()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel registration')
      console.error('Error cancelling:', err)
    } finally {
      setCancellingRegistration(false)
    }
  }

  const downloadQR = () => {
    const qrElement = document.getElementById('qr-code')
    const canvas = qrElement.querySelector('canvas')
    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = `event-${event.title}-qr.png`
    link.click()
  }

  const copyQRToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(qrCode)
      setCopiedToClipboard(true)
      setTimeout(() => setCopiedToClipboard(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const calculateDays = (dateString) => {
    const eventDate = new Date(dateString)
    const today = new Date()
    const diffTime = eventDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">{error || 'Event not found'}</p>
          <button
            onClick={() => navigate('/events')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Events
          </button>
        </div>
      </div>
    )
  }

  const daysUntilEvent = calculateDays(event.eventDate)
  const isFull = event.registeredCount >= event.capacity

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header Image */}
      {event.images && event.images.length > 0 && (
        <div className="h-96 bg-gray-200 overflow-hidden">
          <img
            src={event.images[0].url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto px-4 py-8 -mt-24 relative z-10"
      >
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-lg p-8 mb-6"
            >
              {/* Title & Status */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    {event.title}
                  </h1>
                  <div className="flex gap-2 flex-wrap">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                      {event.category}
                    </span>
                    {event.isVirtual && (
                      <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                        Virtual Event
                      </span>
                    )}
                  </div>
                </div>

                {/* Days Until */}
                {daysUntilEvent > 0 && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Event starts in</p>
                    <p className="text-3xl font-bold text-blue-600">{daysUntilEvent}</p>
                    <p className="text-sm text-gray-600">days</p>
                  </div>
                )}
              </div>

              {/* Organizer Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Organized by</p>
                <p className="font-semibold text-gray-900">
                  {event.createdBy?.name || 'Unknown'}
                </p>
              </div>

              {/* Date & Time */}
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Date & Time
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-semibold text-gray-900">{formatDate(event.eventDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Start Time</p>
                    <p className="font-semibold text-gray-900">{event.eventTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-semibold text-gray-900">{event.duration} minutes</p>
                  </div>
                </div>
              </div>

              {/* Location */}
              {!event.isVirtual && (
                <div className="bg-green-50 rounded-lg p-6 mb-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-600" />
                    Location
                  </h3>
                  <p className="font-semibold text-gray-900">{event.location}</p>
                  <p className="text-gray-600">
                    {event.city}, {event.state} {event.zipcode}
                  </p>
                </div>
              )}

              {/* Meeting Link for Virtual Events */}
              {event.isVirtual && event.meetingLink && (
                <div className="bg-purple-50 rounded-lg p-6 mb-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-purple-600" />
                    Meeting Link
                  </h3>
                  <a
                    href={event.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {event.meetingLink}
                  </a>
                </div>
              )}

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">About Event</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>

              {/* Requirements */}
              {event.requirements && event.requirements.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Requirements</h3>
                  <ul className="space-y-2">
                    {event.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700">
                        <span className="text-green-600 mt-1">✓</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Contact Info */}
              {event.contactPerson && (
                <div className="bg-amber-50 rounded-lg p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    {event.contactPerson.name && (
                      <p className="text-gray-700">
                        <span className="font-semibold">Contact Person:</span> {event.contactPerson.name}
                      </p>
                    )}
                    {event.contactPerson.phone && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-4 h-4 text-amber-600" />
                        <a href={`tel:${event.contactPerson.phone}`} className="hover:underline">
                          {event.contactPerson.phone}
                        </a>
                      </div>
                    )}
                    {event.contactPerson.email && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="w-4 h-4 text-amber-600" />
                        <a href={`mailto:${event.contactPerson.email}`} className="hover:underline">
                          {event.contactPerson.email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Registration Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-lg p-6 mb-6 sticky top-4"
            >
              {/* Capacity */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Capacity
                  </h3>
                  <span className="text-sm text-gray-600">
                    {event.capacityPercentage}% full
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-2">
                  {event.registeredCount}/{event.capacity}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      event.capacityPercentage >= 90
                        ? 'bg-red-600'
                        : event.capacityPercentage >= 75
                          ? 'bg-yellow-600'
                          : 'bg-green-600'
                    }`}
                    style={{ width: `${Math.min(event.capacityPercentage, 100)}%` }}
                  />
                </div>
                {isFull && (
                  <p className="text-sm text-red-600 mt-2 font-semibold">Event is full</p>
                )}
              </div>

              {/* Registration Buttons */}
              {isAuthenticated ? (
                isRegistered ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <p className="font-semibold text-green-900">Registered!</p>
                    </div>

                    <button
                      onClick={() => setShowQR(!showQR)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                    >
                      {showQR ? 'Hide QR Code' : 'Show QR Code'}
                    </button>

                    <button
                      onClick={handleCancelRegistration}
                      disabled={cancellingRegistration}
                      className="w-full px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
                    >
                      {cancellingRegistration ? 'Cancelling...' : 'Cancel Registration'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleRegister}
                    disabled={registering || isFull}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
                  >
                    {registering ? 'Registering...' : isFull ? 'Event Full' : 'Register Now'}
                  </button>
                )
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Login to Register
                </button>
              )}

              {/* Entry Fee */}
              {event.entryFee > 0 && (
                <p className="text-sm text-gray-600 mt-4 text-center">
                  Entry Fee: <span className="font-bold">${event.entryFee}</span>
                </p>
              )}
            </motion.div>

            {/* QR Code Card */}
            {isRegistered && showQR && qrCode && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <h3 className="font-bold text-gray-900 mb-4">Your Event QR Code</h3>

                <div id="qr-code" className="flex justify-center mb-4">
                  <QRCode value={qrCode} size={256} level="H" includeMargin={true} />
                </div>

                <p className="text-sm text-gray-600 text-center mb-4">
                  Show this QR code at the event for check-in
                </p>

                <div className="space-y-2">
                  <button
                    onClick={downloadQR}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download QR Code
                  </button>

                  <button
                    onClick={copyQRToClipboard}
                    className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    {copiedToClipboard ? 'Copied!' : 'Copy QR Data'}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default EventDetail
