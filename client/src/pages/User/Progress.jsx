import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from 'react-query'
import { Trophy, Star, Award, TrendingUp, Clock, Target } from 'lucide-react'
import { useSocket } from '../../context/SocketContext'
import api from '../../utils/api'
import { toast } from 'react-hot-toast'

const Progress = () => {
  const { socket, invalidateQueries } = useSocket()

  // Fetch progress with React Query
  const { data: stats, isLoading, refetch } = useQuery(
    ['progress'],
    async () => {
      const { data } = await api.get('/users/progress')
      return data.data
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      onError: (error) => {
        console.error('Error fetching progress:', error)
        toast.error('Failed to load progress')
      }
    }
  )

  // Socket.IO listeners for real-time points and badge updates
  useEffect(() => {
    if (!socket) return

    const handlePointsEarned = (data) => {
      console.log('Points earned event received:', data)
      // Invalidate progress cache to trigger refetch
      invalidateQueries('progress')
      refetch()

      if (data.levelUp) {
        toast(`Level Up! 🎉 You reached ${data.newLevel}!`, {
          icon: '⭐',
          duration: 4000,
          position: 'top-right'
        })
      }
    }

    const handleBadgeEarned = () => {
      invalidateQueries('progress')
      refetch()
    }

    socket.on('points:earned', handlePointsEarned)
    socket.on('badge:earned', handleBadgeEarned)

    return () => {
      socket.off('points:earned', handlePointsEarned)
      socket.off('badge:earned', handleBadgeEarned)
    }
  }, [socket, invalidateQueries, refetch])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Journey</h1>
        <p className="text-gray-600">Track your impact and achievements</p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-indigo-100 font-medium">Current Level</p>
              <h2 className="text-3xl font-bold">{stats.currentLevelName || `Level ${stats.level}`}</h2>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="relative pt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress to Level {stats.level + 1}</span>
              <span>{Math.round(stats.progress)}%</span>
            </div>
            <div className="w-full bg-black/20 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all duration-1000"
                style={{ width: `${stats.progress}%` }}
              ></div>
            </div>
            <p className="text-xs mt-2 text-indigo-100">
              {stats.pointsToNext} points needed for next level
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-md border border-gray-100"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-yellow-100 p-3 rounded-full">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Points</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.points}</h3>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span>Top 10% of contributors</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-md border border-gray-100"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Volunteer Hours</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.volunteerHours}</h3>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Target className="w-4 h-4 text-blue-500" />
              <span>Next Goal: 50 Hours</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Badges Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-600" />
          Earned Badges
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {stats.badges && stats.badges.length > 0 ? (
            stats.badges.map((badge) => (
              <motion.div
                key={badge._id}
                whileHover={{ scale: 1.05 }}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center"
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <h3 className="font-semibold text-gray-900 text-sm">{badge.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{badge.category}</p>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
              No badges earned yet. Start donating or volunteering!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Progress
