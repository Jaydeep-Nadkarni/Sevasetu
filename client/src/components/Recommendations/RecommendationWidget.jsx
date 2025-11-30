import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getRecommendations } from '../../services/recommendationService'
import { Link } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { MapPin, Zap } from 'lucide-react'

const RecommendationWidget = ({ type = 'all', title = 'Recommended for You', subtype = null }) => {
  const { isDark } = useTheme()
  const [recommendations, setRecommendations] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const data = await getRecommendations(type)
        
        // If subtype is specified, extract that subset
        if (subtype && data[subtype]) {
          setRecommendations(data[subtype])
        } else {
          setRecommendations(data)
        }
      } catch (error) {
        console.error('Failed to fetch recommendations', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [type, subtype])

  if (loading) {
    return (
      <div className={`animate-pulse h-40 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}></div>
    )
  }
  
  if (!recommendations || (Array.isArray(recommendations) && recommendations.length === 0)) {
    return null
  }

  const renderEventCard = (event) => (
    <Link to={`/events/${event._id}`} key={event._id} className="block">
      <motion.div
        whileHover={{ y: -4 }}
        className={`p-4 rounded-lg shadow-sm border transition-all ${
          isDark
            ? 'bg-gray-700 border-gray-600 hover:border-orange-500'
            : 'bg-white border-gray-100 hover:border-orange-500'
        }`}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900 px-2 py-1 rounded-full">
              {event.category}
            </span>
            <h4 className={`font-medium mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {event.title}
            </h4>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              📅 {new Date(event.startDate).toLocaleDateString()} • 📍 {event.location?.city || 'Online'}
            </p>
          </div>
        </div>
      </motion.div>
    </Link>
  )

  const renderNGOCard = (ngo) => (
    <Link to={`/ngos/${ngo._id}`} key={ngo._id} className="block">
      <motion.div
        whileHover={{ y: -4 }}
        className={`p-4 rounded-lg shadow-sm border transition-all ${
          isDark
            ? 'bg-gray-700 border-gray-600 hover:border-orange-500'
            : 'bg-white border-gray-100 hover:border-orange-500'
        }`}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-1">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {ngo.name}
            </h4>
            <p className={`text-sm line-clamp-2 mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {ngo.mission}
            </p>
            <span className="text-xs text-green-600 dark:text-green-400 mt-1 inline-block">
              {ngo.category}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  )

  const renderNearbyNGOCard = (ngo) => (
    <Link to={`/ngos/${ngo._id}`} key={ngo._id} className="block">
      <motion.div
        whileHover={{ y: -4 }}
        className={`p-4 rounded-lg shadow-sm border transition-all ${
          isDark
            ? 'bg-gray-700 border-gray-600 hover:border-orange-500'
            : 'bg-white border-gray-100 hover:border-orange-500'
        }`}
      >
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {ngo.name}
            </h4>
            {ngo.distance && (
              <span className={`text-xs font-semibold flex items-center gap-1 ${
                isDark ? 'text-orange-400' : 'text-orange-600'
              }`}>
                <MapPin className="w-3 h-3" />
                {ngo.distance}
              </span>
            )}
          </div>
          <p className={`text-sm line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {ngo.mission}
          </p>
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full">
              {ngo.category}
            </span>
            <span className="text-xs">
              ⭐ {ngo.rating || 4.5}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  )

  const renderHelpRequestCard = (req) => (
    <Link to={`/help-requests/${req._id}`} key={req._id} className="block">
      <motion.div
        whileHover={{ y: -4 }}
        className={`p-4 rounded-lg shadow-sm border transition-all ${
          isDark
            ? 'bg-gray-700 border-gray-600 hover:border-orange-500'
            : 'bg-white border-gray-100 hover:border-orange-500'
        }`}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 w-fit ${
              req.urgency === 'critical' 
                ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100' 
                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-100'
            }`}>
              <Zap className="w-3 h-3" />
              {req.urgency?.toUpperCase()}
            </span>
            <h4 className={`font-medium mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {req.title}
            </h4>
            <div className={`mt-2 w-full rounded-full h-1.5 ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all" 
                style={{ width: `${(req.amountRaised / req.targetAmount) * 100}%` }}
              ></div>
            </div>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {((req.amountRaised / req.targetAmount) * 100).toFixed(0)}% funded
            </p>
          </div>
        </div>
      </motion.div>
    </Link>
  )

  return (
    <div className="space-y-4">
      {title && (
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
          {title}
        </h3>
      )}
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {type === 'events' && recommendations.map(renderEventCard)}
        {type === 'ngos' && recommendations.map(renderNGOCard)}
        {type === 'nearbyNGOs' && recommendations.map(renderNearbyNGOCard)}
        {type === 'helpRequests' && recommendations.map(renderHelpRequestCard)}
        
        {type === 'all' && (
          <>
            {recommendations.events?.slice(0, 2).map(renderEventCard)}
            {recommendations.ngos?.slice(0, 2).map(renderNGOCard)}
            {recommendations.nearbyNGOs?.slice(0, 2).map(renderNearbyNGOCard)}
            {recommendations.helpRequests?.slice(0, 2).map(renderHelpRequestCard)}
          </>
        )}
      </div>
    </div>
  )
}

export default RecommendationWidget
