import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Filter, Search, MapPin, Calendar, AlertCircle, Users } from 'lucide-react'
import { useSocket } from '../../context/SocketContext'
import api from '../../utils/api'

const HelpRequestList = () => {
  const { socket, invalidateQueries } = useSocket()
  
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    urgency: 'all',
    city: '',
    search: ''
  })
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    count: 0
  })

  // Fetch help requests with React Query
  const { data, isLoading, refetch } = useQuery(
    ['help-requests', { ...filters, page }],
    async () => {
      const params = {
        page,
        limit: 9,
        ...filters
      }
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === 'all' || params[key] === '') delete params[key]
      })

      const { data } = await api.get('/help-requests', { params })
      setPagination(data.pagination)
      return data.helpRequests
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  )

  const requests = data || []

  // Socket.IO listeners for real-time updates
  useEffect(() => {
    if (!socket) return

    const handleHelpRequestUpdate = () => {
      invalidateQueries('help-requests')
      refetch()
    }

    socket.on('help-request:created', handleHelpRequestUpdate)
    socket.on('help-request:updated', handleHelpRequestUpdate)
    socket.on('help-request:deleted', handleHelpRequestUpdate)

    return () => {
      socket.off('help-request:created', handleHelpRequestUpdate)
      socket.off('help-request:updated', handleHelpRequestUpdate)
      socket.off('help-request:deleted', handleHelpRequestUpdate)
    }
  }, [socket, invalidateQueries, refetch])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
    setPage(1) // Reset to page 1
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-green-100 text-green-800'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container-custom py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Help Requests</h1>
          <p className="text-gray-600 mt-2">Browse and respond to community needs</p>
        </div>
        <Link
          to="/user/create-help-request"
          className="mt-4 md:mt-0 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Create Request
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              name="city"
              placeholder="Search by city..."
              value={filters.city}
              onChange={handleFilterChange}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Categories</option>
            <option value="education">Education</option>
            <option value="medical">Medical</option>
            <option value="food">Food</option>
            <option value="shelter">Shelter</option>
            <option value="disaster_relief">Disaster Relief</option>
            <option value="other">Other</option>
          </select>

          <select
            name="urgency"
            value={filters.urgency}
            onChange={handleFilterChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Urgency Levels</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-500 text-lg">No help requests found matching your filters.</p>
          <button 
            onClick={() => setFilters({ category: 'all', status: 'all', urgency: 'all', city: '', search: '' })}
            className="mt-4 text-indigo-600 hover:underline"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request) => (
            <Link
              key={request._id}
              to={`/help-requests/${request._id}`}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 flex flex-col"
            >
              <div className="h-48 bg-gray-200 relative">
                {request.images && request.images.length > 0 ? (
                  <img
                    src={request.images[0]}
                    alt={request.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-300">
                    <AlertCircle className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-4 right-4 flex gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${getUrgencyColor(request.urgency)}`}>
                    {request.urgency}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${getStatusColor(request.status)}`}>
                    {request.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <span className="capitalize">{request.category}</span>
                  <span>•</span>
                  <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{request.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">{request.description}</p>

                <div className="space-y-2 text-sm text-gray-500 mt-auto">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{request.location.city}, {request.location.state}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{request.beneficiaries} Beneficiaries</span>
                  </div>
                </div>

                {request.assignedNGO && (
                  <div className="mt-4 pt-4 border-t flex items-center gap-2">
                    <div className="text-xs text-gray-500">Claimed by:</div>
                    <div className="text-sm font-medium text-indigo-600">{request.assignedNGO.name}</div>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.total > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 bg-gray-100 rounded-lg">
            Page {page} of {pagination.total}
          </span>
          <button
            onClick={() => setPage(Math.min(pagination.total, page + 1))}
            disabled={page === pagination.total}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default HelpRequestList
