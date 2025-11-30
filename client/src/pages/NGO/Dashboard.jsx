import React, { useState, useEffect } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../hooks/useAuth'
import { Card } from '../../components/UI/Card'
import { Button } from '../../components/UI/Button'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Calendar, DollarSign, HelpCircle, CheckCircle } from 'lucide-react'
import { RecentActivity } from '../../components/RecentActivity'
import api from '../../utils/api'

export const NGODashboard = () => {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const response = await api.get('/ngo/events?limit=5&status=upcoming')
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
          Manage your NGO activities and events
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card header="Quick Actions" className="dark:bg-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => navigate('/ngo/events')}
              className="w-full justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              <Calendar className="w-5 h-5" />
              Create Event
            </Button>
            <Button 
              onClick={() => navigate('/ngo/donations')}
              className="w-full justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <DollarSign className="w-5 h-5" />
              View Donations
            </Button>
            <Button 
              onClick={() => navigate('/ngo/help-requests')}
              className="w-full justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            >
              <HelpCircle className="w-5 h-5" />
              Help Requests
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Two Column Layout: Upcoming Events + Progress Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Events */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card header="Your Upcoming Events" className="dark:bg-gray-800">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className={`py-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <p>No upcoming events yet</p>
                <Button 
                  size="sm" 
                  onClick={() => navigate('/ngo/events')}
                  className="mt-4"
                >
                  Create Event
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div
                    key={event._id}
                    onClick={() => navigate(`/ngo/events/${event._id}`)}
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
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            event.status === 'active' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                          }`}>
                            {event.status || 'Scheduled'}
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

        {/* Organization Summary */}
        <motion.div variants={itemVariants}>
          <Card header="Organization Overview" className="dark:bg-gray-800 h-full">
            <div className="space-y-4">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Verification Status
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6" />
                  {user?.verificationStatus === 'verified' ? 'Verified' : 'Pending'}
                </p>
              </div>

              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Organization Type
                </p>
                <span className="text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900 px-3 py-1 rounded-full">
                  {user?.category || 'NGO'}
                </span>
              </div>

              <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} pt-4`}>
                <Button 
                  size="sm"
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                  onClick={() => navigate('/ngo/profile')}
                >
                  View Profile
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
    </motion.div>
  )
}

export default NGODashboard
