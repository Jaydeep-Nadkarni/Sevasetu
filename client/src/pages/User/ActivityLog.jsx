import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'
import { useSocket } from '../../context/SocketContext'
import { Card } from '../../components/UI/Card'
import { Button } from '../../components/UI/Button'
import api from '../../utils/api'

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
      className={`flex items-start gap-3 py-4 px-4 rounded-lg border transition ${
        isDark
          ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'
          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
      }`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="text-2xl flex-shrink-0">{getActivityIcon(activity.type)}</div>
      <div className="flex-1 min-w-0">
        <p className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
          {getActivityDescription(activity)}
        </p>
        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {getTimeAgo(activity.createdAt)}
        </p>
      </div>
      {activity.status && (
        <span className={`text-xs px-3 py-1 rounded flex-shrink-0 whitespace-nowrap ${
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

export const ActivityLog = () => {
  const { isDark } = useTheme()
  const { socket } = useSocket()
  const [activities, setActivities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [filterType, setFilterType] = useState('all')

  const ITEMS_PER_PAGE = 20

  // Fetch activities
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true)
        const params = {
          limit: ITEMS_PER_PAGE,
          skip: (page - 1) * ITEMS_PER_PAGE,
        }
        if (filterType !== 'all') {
          params.type = filterType
        }

        const response = await api.get('/users/activity', { params })
        const newActivities = response.data.data.activities || []
        
        if (page === 1) {
          setActivities(newActivities)
        } else {
          setActivities((prev) => [...prev, ...newActivities])
        }
        
        setHasMore(newActivities.length === ITEMS_PER_PAGE)
        setError(null)
      } catch (err) {
        setError('Failed to load activity log')
        setActivities([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivities()
  }, [page, filterType])

  // Listen for real-time activity updates
  useEffect(() => {
    if (!socket || page !== 1) return

    const handleActivityUpdate = (newActivity) => {
      setActivities((prev) => [newActivity, ...prev].slice(0, ITEMS_PER_PAGE))
    }

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
  }, [socket, page])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  }

  return (
    <motion.div
      className="max-w-4xl mx-auto space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Activity Log</h1>
        <p className="text-gray-600 dark:text-gray-400">
          View your complete history of activities and contributions
        </p>
      </motion.div>

      {/* Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="dark:bg-gray-800">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={filterType === 'all' ? 'primary' : 'outline'}
              onClick={() => {
                setFilterType('all')
                setPage(1)
              }}
            >
              All Activities
            </Button>
            <Button
              size="sm"
              variant={filterType === 'money_donation' ? 'primary' : 'outline'}
              onClick={() => {
                setFilterType('money_donation')
                setPage(1)
              }}
            >
              Donations
            </Button>
            <Button
              size="sm"
              variant={filterType === 'event_attended' ? 'primary' : 'outline'}
              onClick={() => {
                setFilterType('event_attended')
                setPage(1)
              }}
            >
              Events
            </Button>
            <Button
              size="sm"
              variant={filterType === 'certificate' ? 'primary' : 'outline'}
              onClick={() => {
                setFilterType('certificate')
                setPage(1)
              }}
            >
              Certificates
            </Button>
            <Button
              size="sm"
              variant={filterType === 'achievement' ? 'primary' : 'outline'}
              onClick={() => {
                setFilterType('achievement')
                setPage(1)
              }}
            >
              Achievements
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Activities List */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        {isLoading && page === 1 ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className={`py-8 text-center rounded-lg border ${isDark ? 'bg-red-900/20 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {error}
          </div>
        ) : activities.length === 0 ? (
          <div className={`py-12 text-center rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
            <p className="text-lg font-medium">No activities found</p>
            <p className="text-sm mt-1">Your activities will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <ActivityItem
                key={activity._id || `${activity.type}-${activity.createdAt}`}
                activity={activity}
                isDark={isDark}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Load More */}
      {hasMore && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-center">
          <Button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? 'Loading...' : 'Load More Activities'}
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}

export default ActivityLog
