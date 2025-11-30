import { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../hooks/useAuth'
import { Card } from '../../components/UI/Card'
import { Button } from '../../components/UI/Button'
import { motion } from 'framer-motion'
import RecommendationWidget from '../../components/Recommendations/RecommendationWidget'

const StatCard = ({ icon, label, value, change, isDark }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card hoverable className="h-full">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {label}
            </p>
            <p className="text-3xl font-bold mt-2 text-primary">{value}</p>
            {change && (
              <p className={`text-sm mt-1 ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {change >= 0 ? '+' : ''}{change}% from last month
              </p>
            )}
          </div>
          <div className="text-4xl">{icon}</div>
        </div>
      </Card>
    </motion.div>
  )
}

const RecentActivityItem = ({ type, description, time, isDark }) => {
  const icons = {
    donation: '❤️',
    event: '🎉',
    volunteer: '🤝',
    achievement: '🏆',
  }

  return (
    <motion.div
      className="flex items-center gap-4 py-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-2xl">{icons[type] || '•'}</div>
      <div className="flex-1">
        <p className="font-medium">{description}</p>
        <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>{time}</p>
      </div>
    </motion.div>
  )
}

export const Dashboard = () => {
  const { isDark } = useTheme()
  const { user } = useAuth()

  const stats = [
    { icon: '❤️', label: 'Total Donations', value: '₹12,500', change: 15 },
    { icon: '🤝', label: 'Volunteer Hours', value: '48', change: 8 },
    { icon: '🎉', label: 'Events Attended', value: '12', change: 20 },
    { icon: '🏆', label: 'Badges Earned', value: '8', change: 0 },
  ]

  const recentActivity = [
    { type: 'donation', description: 'Donated ₹500 to Education NGO', time: '2 days ago' },
    { type: 'event', description: 'Attended Community Clean-up Drive', time: '5 days ago' },
    { type: 'volunteer', description: 'Logged 4 volunteer hours', time: '1 week ago' },
    { type: 'achievement', description: 'Earned "Helping Hand" badge', time: '2 weeks ago' },
  ]

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

  return (
    <motion.div
      className="max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's what's happening with your account
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        variants={containerVariants}
      >
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} isDark={isDark} />
        ))}
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="mb-8"
      >
        <RecommendationWidget type="all" title="Recommended for You" />
      </motion.div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card header="Quick Actions">
            <div className="space-y-3">
              <Button variant="primary" className="w-full justify-center">
                💝 Make a Donation
              </Button>
              <Button variant="secondary" className="w-full justify-center">
                🎯 Find Opportunities
              </Button>
              <Button variant="outline" className="w-full justify-center">
                📋 View Applications
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card header="Recent Activity">
            <div className="space-y-2">
              {recentActivity.map((activity, index) => (
                <RecentActivityItem key={index} {...activity} isDark={isDark} />
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Additional Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card header="Upcoming Events">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                >
                  <p className="font-medium text-gray-900 dark:text-white">Community Service Event</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Dec {10 + i}, 2025 • 2:00 PM
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card header="Badges Earned">
            <div className="grid grid-cols-4 gap-4">
              {['🌟', '❤️', '🏆', '🎯', '🌱', '💪', '🎉', '✨'].map(
                (badge, i) => (
                  <div key={i} className="text-center">
                    <div className="text-4xl mb-2">{badge}</div>
                    <p className="text-xs text-center text-gray-600 dark:text-gray-400">Badge</p>
                  </div>
                )
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
