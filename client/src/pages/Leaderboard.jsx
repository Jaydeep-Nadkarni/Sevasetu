import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Trophy, Medal, Crown } from 'lucide-react'
import { useSocket } from '../context/SocketContext'
import api from '../utils/api'
import { toast } from 'react-hot-toast'

const Leaderboard = () => {
  const { socket, invalidateQueries } = useSocket()

  // Fetch leaderboard with React Query
  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data } = await api.get('/users/leaderboard?limit=50')
      return data.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    onError: (error) => {
      console.error('Error fetching leaderboard:', error)
      toast.error('Failed to load leaderboard')
    }
  })

  // Socket.IO listeners for real-time leaderboard updates
  useEffect(() => {
    if (!socket) return

    const handleLeaderboardUpdate = () => {
      invalidateQueries('leaderboard')
      refetch()
    }

    socket.on('leaderboard:updated', handleLeaderboardUpdate)
    socket.on('points:earned', handleLeaderboardUpdate)

    return () => {
      socket.off('leaderboard:updated', handleLeaderboardUpdate)
      socket.off('points:earned', handleLeaderboardUpdate)
    }
  }, [socket, invalidateQueries, refetch])

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <Crown className="w-6 h-6 text-yellow-500" />
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 2:
        return <Medal className="w-6 h-6 text-amber-600" />
      default:
        return <span className="font-bold text-gray-500 w-6 text-center">{index + 1}</span>
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Community Leaderboard</h1>
        <p className="text-gray-600">Celebrating our top contributors</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-2 text-center">Rank</div>
          <div className="col-span-6">User</div>
          <div className="col-span-2 text-center">Level</div>
          <div className="col-span-2 text-right">Points</div>
        </div>

        {/* List */}
        <div className="divide-y divide-gray-100">
          {users.map((user, index) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors ${
                index < 3 ? 'bg-gradient-to-r from-yellow-50/30 to-transparent' : ''
              }`}
            >
              <div className="col-span-2 flex justify-center items-center">
                {getRankIcon(index)}
              </div>
              
              <div className="col-span-6 flex items-center gap-3">
                <div className="relative">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.firstName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border-2 border-white shadow-sm">
                      {user.firstName?.charAt(0)}
                    </div>
                  )}
                  {index === 0 && (
                    <div className="absolute -top-2 -right-1">
                      <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {user.firstName} {user.lastName}
                  </h3>
                  <div className="flex gap-1 mt-0.5">
                    {user.badges && user.badges.slice(0, 3).map((badge, i) => (
                      <span key={i} title={badge.name} className="text-xs">
                        {badge.icon}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="col-span-2 text-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  Lvl {user.level}
                </span>
              </div>

              <div className="col-span-2 text-right font-bold text-gray-900">
                {user.points.toLocaleString()}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Leaderboard
