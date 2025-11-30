import { useState, useEffect } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../hooks/useAuth'
import { Card } from '../../components/UI/Card'
import { Button } from '../../components/UI/Button'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Heart, Zap, MapPin } from 'lucide-react'
import RecommendationWidget from '../../components/Recommendations/RecommendationWidget'
import { RecentActivity } from '../../components/RecentActivity'
import api from '../../utils/api'

export const Dashboard = () => {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const response = await api.get('/events?limit=5&status=upcoming')
        setUpcomingEvents(response.data.data?.events || [])
      } catch (error) {
        console.error('Failed to fetch upcoming events:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUpcomingEvents()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  }

  return (
    <motion.div
      className="max-w-7xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's a quick overview of your impact and opportunities
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card header="Quick Actions" className="dark:bg-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => navigate('/donate-money')}
              className="w-full justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              <Heart className="w-5 h-5" />
              Make a Donation
            </Button>
            <Button 
              onClick={() => navigate('/events')}
              className="w-full justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            >
              <Zap className="w-5 h-5" />
              Find Events
            </Button>
            <Button 
              onClick={() => navigate('/map')}
              variant="outline"
              className="w-full justify-center gap-2"
            >
              <MapPin className="w-5 h-5" />
              Nearby NGOs
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Two Column Layout: Upcoming Events + Progress Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Events */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card header="Upcoming Events" className="dark:bg-gray-800">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className={`py-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <p>No upcoming events yet</p>
                <Button 
                  size="sm" 
                  onClick={() => navigate('/events')}
                  className="mt-4"
                >
                  Explore Events
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div
                    key={event._id}
                    onClick={() => navigate(`/events/${event._id}`)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900 px-2 py-1 rounded-full">
                            {event.category || 'Event'}
                          </span>
                        </div>
                        <p className="font-medium text-gray-900 dark:text-white">{event.title}</p>
                        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          📅 {new Date(event.startDate).toLocaleDateString()} • 📍 {event.location?.city || 'Online'}
                        </p>
                      </div>
                      <span className="text-2xl flex-shrink-0">🎉</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Progress Summary */}
        <motion.div variants={itemVariants}>
          <Card header="Your Progress" className="dark:bg-gray-800 h-full">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Level
                  </span>
                  <span className="text-2xl font-bold text-primary">{user?.level || 1}</span>
                </div>
                <div className={`w-full rounded-full h-2 ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all"
                    style={{ width: `${((user?.points || 0) % 1000) / 10}%` }}
                  ></div>
                </div>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {user?.points || 0} points
                </p>
              </div>

              <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} pt-4`}>
                <Button 
                  size="sm"
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                  onClick={() => navigate('/progress')}
                >
                  View Full Progress
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants}>
        <RecentActivity limit={8} />
      </motion.div>

      {/* Recommended for You */}
      <motion.div variants={itemVariants}>
        <Card header="Recommended for You" className="dark:bg-gray-800">
          <RecommendationWidget type="all" title="" />
        </Card>
      </motion.div>

      {/* Nearby NGOs */}
      <motion.div variants={itemVariants}>
        <Card header="🎯 NGOs Near You" className="dark:bg-gray-800">
          <RecommendationWidget type="nearbyNGOs" title="" />
        </Card>
      </motion.div>
    </motion.div>
  )
}
