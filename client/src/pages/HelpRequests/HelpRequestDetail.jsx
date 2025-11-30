import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import { MapPin, Calendar, Users, DollarSign, AlertCircle, CheckCircle, MessageSquare, Send } from 'lucide-react'
import api from '../../utils/api'

const HelpRequestDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)
  
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchRequest()
  }, [id])

  const fetchRequest = async () => {
    try {
      const { data } = await api.get(`/help-requests/${id}`)
      setRequest(data.helpRequest)
    } catch (error) {
      console.error('Error fetching request:', error)
      toast.error('Failed to load help request')
      navigate('/help-requests')
    } finally {
      setLoading(false)
    }
  }

  const handleClaim = async () => {
    if (!window.confirm('Are you sure you want to claim this request? This commits your NGO to helping.')) return
    
    try {
      setSubmitting(true)
      const { data } = await api.post(`/help-requests/${id}/claim`)
      setRequest(data.helpRequest)
      toast.success('Request claimed successfully!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to claim request')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusUpdate = async (newStatus) => {
    try {
      setSubmitting(true)
      const { data } = await api.patch(`/help-requests/${id}/status`, { status: newStatus })
      setRequest(data.helpRequest)
      toast.success(`Status updated to ${newStatus}`)
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return

    try {
      setSubmitting(true)
      const { data } = await api.post(`/help-requests/${id}/comment`, { text: comment })
      setRequest(prev => ({ ...prev, comments: data.comments }))
      setComment('')
      toast.success('Comment added')
    } catch (error) {
      toast.error('Failed to add comment')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="text-center py-12">Loading...</div>
  if (!request) return null

  const isRequester = user?._id === request.requester._id
  const isNGOAdmin = user?.role === 'ngo_admin'
  const isAssignedNGO = request.assignedNGO && user?.ngoOwned === request.assignedNGO._id // Assuming user.ngoOwned is populated or we check differently. 
  // Actually, user.ngoOwned is an ID in User model. But we might not have it in Redux state fully.
  // Let's rely on the fact that if they can claim, they are NGO admin.
  // For "isAssignedNGO", we can check if the user is an NGO admin and if the assignedNGO matches their NGO.
  // Since we don't have the user's NGO ID easily in frontend state without fetching profile, 
  // we can rely on backend validation for actions, but for UI hiding:
  // We'll just show "Mark Resolved" to requester for now, and maybe to any NGO admin if they claimed it (backend checks).

  return (
    <div className="container-custom py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Image */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {request.images && request.images.length > 0 ? (
              <img src={request.images[0]} alt={request.title} className="w-full h-64 object-cover" />
            ) : (
              <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-gray-400">
                No Image Available
              </div>
            )}
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium mb-2 capitalize">
                    {request.category}
                  </span>
                  <h1 className="text-3xl font-bold text-gray-900">{request.title}</h1>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase ${
                    request.urgency === 'critical' ? 'bg-red-100 text-red-800' : 
                    request.urgency === 'high' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {request.urgency} Urgency
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase ${
                    request.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {request.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 whitespace-pre-wrap mb-6">{request.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Beneficiaries</div>
                  <div className="font-semibold flex items-center gap-1">
                    <Users className="w-4 h-4" /> {request.beneficiaries}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Target Amount</div>
                  <div className="font-semibold flex items-center gap-1">
                    <DollarSign className="w-4 h-4" /> {request.targetAmount || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Deadline</div>
                  <div className="font-semibold flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> {request.deadline ? new Date(request.deadline).toLocaleDateString() : 'None'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Location</div>
                  <div className="font-semibold flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {request.location.city}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-4">
                {isNGOAdmin && request.status === 'open' && (
                  <button
                    onClick={handleClaim}
                    disabled={submitting}
                    className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    Claim Request
                  </button>
                )}

                {(isRequester || isNGOAdmin) && request.status !== 'completed' && request.status !== 'cancelled' && (
                  <button
                    onClick={() => handleStatusUpdate('completed')}
                    disabled={submitting}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" /> Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" /> Comments
            </h3>

            <div className="space-y-6 mb-8">
              {request.comments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No comments yet.</p>
              ) : (
                request.comments.map((comment, index) => (
                  <div key={index} className="flex gap-4">
                    <img
                      src={comment.user.avatar || `https://ui-avatars.com/api/?name=${comment.user.name}`}
                      alt={comment.user.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1 bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-900">{comment.user.name}</span>
                        <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-700">{comment.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {user && (
              <form onSubmit={handleCommentSubmit} className="flex gap-4">
                <img
                  src={user.profilePicture || user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}`}
                  alt="You"
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!comment.trim() || submitting}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Requester Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Requested By</h3>
            <div className="flex items-center gap-3">
              <img
                src={request.requester.avatar || `https://ui-avatars.com/api/?name=${request.requester.name}`}
                alt={request.requester.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <div className="font-semibold">{request.requester.name}</div>
                <div className="text-sm text-gray-500">Member since {new Date(request.requester.createdAt || Date.now()).getFullYear()}</div>
              </div>
            </div>
          </div>

          {/* Assigned NGO */}
          {request.assignedNGO && (
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-indigo-600">
              <h3 className="font-bold text-gray-900 mb-4">Claimed By</h3>
              <div className="flex items-center gap-3">
                <img
                  src={request.assignedNGO.logo || `https://ui-avatars.com/api/?name=${request.assignedNGO.name}`}
                  alt={request.assignedNGO.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <div className="font-semibold">{request.assignedNGO.name}</div>
                  <div className="text-sm text-gray-500">NGO Partner</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t text-sm text-gray-600">
                This NGO has committed to fulfilling this request.
              </div>
            </div>
          )}

          {/* Status Timeline (Simplified) */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Status</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="mt-1">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <div className="font-medium">Request Created</div>
                  <div className="text-xs text-gray-500">{new Date(request.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              {request.assignedNGO && (
                <div className="flex gap-3">
                  <div className="mt-1">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <div className="font-medium">Claimed by NGO</div>
                    <div className="text-xs text-gray-500">In Progress</div>
                  </div>
                </div>
              )}
              {request.status === 'completed' && (
                <div className="flex gap-3">
                  <div className="mt-1">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <div className="font-medium">Resolved</div>
                    <div className="text-xs text-gray-500">{request.impact?.completionDate ? new Date(request.impact.completionDate).toLocaleDateString() : 'Completed'}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HelpRequestDetail
