import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getRecommendations } from '../../services/recommendationService'
import { Link } from 'react-router-dom'

const RecommendationWidget = ({ type = 'all', title = 'Recommended for You' }) => {
  const [recommendations, setRecommendations] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const data = await getRecommendations(type)
        setRecommendations(data)
      } catch (error) {
        console.error('Failed to fetch recommendations', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [type])

  if (loading) return <div className="animate-pulse h-40 bg-gray-100 rounded-lg"></div>
  
  if (!recommendations || (Array.isArray(recommendations) && recommendations.length === 0)) {
    return null
  }

  const renderEventCard = (event) => (
    <Link to={`/events/${event._id}`} key={event._id} className="block">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
              {event.category}
            </span>
            <h4 className="font-medium text-gray-900 mt-2">{event.title}</h4>
            <p className="text-sm text-gray-500 mt-1">{new Date(event.startDate).toLocaleDateString()} • {event.location.city}</p>
          </div>
        </div>
      </div>
    </Link>
  )

  const renderNGOCard = (ngo) => (
    <Link to={`/ngos/${ngo._id}`} key={ngo._id} className="block">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{ngo.name}</h4>
            <p className="text-sm text-gray-500 line-clamp-2">{ngo.mission}</p>
            <span className="text-xs text-green-600 mt-1 inline-block">{ngo.category}</span>
          </div>
        </div>
      </div>
    </Link>
  )

  const renderHelpRequestCard = (req) => (
    <Link to={`/help-requests/${req._id}`} key={req._id} className="block">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
              req.urgency === 'critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {req.urgency.toUpperCase()}
            </span>
            <h4 className="font-medium text-gray-900 mt-2">{req.title}</h4>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-blue-600 h-1.5 rounded-full" 
                style={{ width: `${(req.amountRaised / req.targetAmount) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {type === 'events' && recommendations.map(renderEventCard)}
        {type === 'ngos' && recommendations.map(renderNGOCard)}
        {type === 'helpRequests' && recommendations.map(renderHelpRequestCard)}
        
        {type === 'all' && (
          <>
            {recommendations.events?.slice(0, 2).map(renderEventCard)}
            {recommendations.ngos?.slice(0, 2).map(renderNGOCard)}
            {recommendations.helpRequests?.slice(0, 2).map(renderHelpRequestCard)}
          </>
        )}
      </div>
    </div>
  )
}

export default RecommendationWidget
