import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useSocket } from '../context/SocketContext'
import { Card } from './UI/Card'
import api from '../utils/api'

const ActivityItem = ({ activity, isDark }) => {
  const getActivityIcon = (type) => {
    const icons = {
      donation: '❤️',
      money_donation: '💰',
      event_joined: '🎉',
      event_attended: '✅',
      certificate: '🏆',
      volunteer: '🤝',
      achievement: '⭐',
      help_request: '🆘',
    }
    return icons[type] || '•'
  }

  const getActivityDescription = (activity) => {
    switch (activity.type) {
      case 'donation':
        return `Donated ${activity.itemName || 'items'} to ${activity.ngoName || 'an NGO'}`
      case 'money_donation':
        return `Donated ₹${activity.amount || '0'} to ${activity.ngoName || 'an NGO'}`
      case 'event_joined':
        return `Joined event: ${activity.eventName || 'Unknown Event'}`
      case 'event_attended':
        return `Attended event: ${activity.eventName || 'Unknown Event'}`
      case 'certificate':
        return `Earned certificate: ${activity.certificateName || 'Achievement'}`
      case 'volunteer':
        return `Logged ${activity.hours || '0'} volunteer hours`
      case 'achievement':
        return `Earned badge: ${activity.badgeName || 'Achievement'}`
      case 'help_request':
        return `Created help request: ${activity.title || 'Request'}`
      default:
        return activity.description || 'Activity recorded'
    }
  }

  const getTimeAgo = (date) => {
    if (!date) return 'Recently'
    const now = new Date()
    const then = new Date(date)
    const seconds = Math.floor((now - then) / 1000)
    
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return then.toLocaleDateString()
  }

  return (
    <motion.div
      className="flex items-start gap-3 py-3 px-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
    >
      <div className="text-2xl flex-shrink-0 mt-1">{getActivityIcon(activity.type)}</div>
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
          {getActivityDescription(activity)}
        </p>
        <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
          {getTimeAgo(activity.createdAt)}
        </p>
      </div>
      {activity.status && (
        <span className={`text-xs px-2 py-1 rounded flex-shrink-0 ${
          activity.status === 'completed' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
            : activity.status === 'pending'
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
        }`}>
          {activity.status}
        </span>
      )}
    </motion.div>
  )
}

export const RecentActivity = ({ userId = null, limit = 10, className = '' }) => {
  const { isDark } = useTheme()
  const { socket } = useSocket()
  const [activities, setActivities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch activities on mount
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true)
        const endpoint = userId ? `/users/${userId}/activity` : '/users/activity'
        const response = await api.get(endpoint, {
          params: { limit }
        })
        setActivities(response.data.data.activities || [])
        setError(null)
      } catch (err) {
        console.error('Failed to fetch activities:', err)
        setError('Failed to load recent activity')
        setActivities([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivities()
  }, [userId, limit])

  // Listen for real-time activity updates
  useEffect(() => {
    if (!socket) return

    const handleActivityUpdate = (newActivity) => {
      console.log('Real-time activity received:', newActivity)
      setActivities((prev) => {
        // Add new activity to the beginning
        const updated = [newActivity, ...prev]
        // Keep only the latest activities based on limit
        return updated.slice(0, limit)
      })
    }

    // Listen for different activity types
    socket.on('activity:new', handleActivityUpdate)
    socket.on('donation:created', handleActivityUpdate)
    socket.on('event:joined', handleActivityUpdate)
    socket.on('event:attended', handleActivityUpdate)
    socket.on('certificate:earned', handleActivityUpdate)
    socket.on('payment:completed', handleActivityUpdate)

    return () => {
      socket.off('activity:new', handleActivityUpdate)
      socket.off('donation:created', handleActivityUpdate)
      socket.off('event:joined', handleActivityUpdate)
      socket.off('event:attended', handleActivityUpdate)
      socket.off('certificate:earned', handleActivityUpdate)
      socket.off('payment:completed', handleActivityUpdate)
    }
  }, [socket, limit])

  return (
    <Card header="Recent Activity" className={className}>
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className={`py-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {error}
        </div>
      ) : activities.length === 0 ? (
        <div className={`py-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <p>No recent activities yet</p>
          <p className="text-sm mt-1">Your activities will appear here</p>
        </div>
      ) : (
        <div className="space-y-1">
          {activities.map((activity) => (
            <ActivityItem 
              key={activity._id || `${activity.type}-${activity.createdAt}`}
              activity={activity}
              isDark={isDark}
            />
          ))}
        </div>
      )}

      {activities.length > 0 && (
        <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <Link 
            to="/activity-log"
            className="text-sm text-primary hover:text-primary-dark font-medium transition"
          >
            View all activities →
          </Link>
        </div>
      )}
    </Card>
  )
}

export default RecentActivity
