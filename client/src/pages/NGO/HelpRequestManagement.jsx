import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react'
import api from '../../utils/api'

const HelpRequestManagement = () => {
  const [claimedRequests, setClaimedRequests] = useState([])
  const [openRequests, setOpenRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      // Fetch claimed requests (we need an endpoint or filter for this, 
      // but for now we can filter client side or use the list endpoint if it supported 'assignedToMe')
      // Since list endpoint doesn't support 'assignedToMe' explicitly yet, 
      // let's assume we can fetch all and filter, or better, add a query param to list endpoint later.
      // For now, I'll fetch all and filter client side as a quick solution, 
      // though inefficient for large data.
      // Ideally: GET /help-requests?assignedTo=my_ngo_id
      
      // Let's just fetch open requests and claimed requests separately if possible.
      // Actually, the list endpoint returns all for NGO admin.
      const { data } = await api.get('/help-requests?limit=100')
      
      // We need to know the current NGO's ID to filter 'claimedRequests'.
      // The user object has 'ngoOwned' which is the NGO ID.
      // But we need to get it from profile or auth state.
      // Let's assume we can filter by checking if assignedNGO is not null.
      // Wait, we need to know WHICH NGO claimed it.
      // Let's fetch the user profile to get the NGO ID first if not in Redux.
      const profileRes = await api.get('/auth/me')
      const ngoId = profileRes.data.data.ngoOwned

      const allRequests = data.helpRequests
      
      setClaimedRequests(allRequests.filter(r => r.assignedNGO && r.assignedNGO._id === ngoId))
      setOpenRequests(allRequests.filter(r => r.status === 'open'))

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Help Request Management</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-indigo-600">
          <div className="text-gray-500">Active Claims</div>
          <div className="text-3xl font-bold">{claimedRequests.filter(r => r.status === 'in_progress').length}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-600">
          <div className="text-gray-500">Resolved Requests</div>
          <div className="text-3xl font-bold">{claimedRequests.filter(r => r.status === 'completed').length}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-600">
          <div className="text-gray-500">Open Opportunities</div>
          <div className="text-3xl font-bold">{openRequests.length}</div>
        </div>
      </div>

      {/* Claimed Requests Section */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-indigo-600" /> Your Active Claims
        </h2>
        
        {claimedRequests.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
            You haven't claimed any requests yet.
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requester</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Claimed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {claimedRequests.map((request) => (
                  <tr key={request._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{request.title}</div>
                      <div className="text-sm text-gray-500">{request.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                          {request.requester.name?.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{request.requester.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        request.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {request.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/help-requests/${request._id}`} className="text-indigo-600 hover:text-indigo-900">
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Open Requests Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" /> New Opportunities
          </h2>
          <Link to="/help-requests" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {openRequests.slice(0, 6).map((request) => (
            <div key={request._id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full capitalize">
                  {request.category}
                </span>
                <span className={`text-xs font-bold uppercase ${
                  request.urgency === 'critical' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {request.urgency}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">{request.title}</h3>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2">{request.description}</p>
              <div className="flex items-center justify-between mt-auto pt-4 border-t">
                <div className="text-sm text-gray-500">{request.location.city}</div>
                <Link 
                  to={`/help-requests/${request._id}`}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HelpRequestManagement
