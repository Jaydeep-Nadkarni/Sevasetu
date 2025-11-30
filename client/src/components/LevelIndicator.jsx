import { useEffect, useState } from 'react'
import { useSocket } from '../context/SocketContext'
import { motion } from 'framer-motion'
import { Trophy, Zap } from 'lucide-react'

export const LevelIndicator = ({ initialLevel = 1, initialPoints = 0 }) => {
  const { socket } = useSocket()
  const [level, setLevel] = useState(initialLevel)
  const [points, setPoints] = useState(initialPoints)
  const [isLevelingUp, setIsLevelingUp] = useState(false)

  useEffect(() => {
    if (!socket) return

    const handlePointsEarned = (data) => {
      console.log('Level indicator received points event:', data)
      
      // Update points
      setPoints(data.totalPoints)
      
      // Handle level up animation
      if (data.levelUp) {
        setIsLevelingUp(true)
        setLevel(data.newLevel)
        
        // Reset animation after a delay
        setTimeout(() => {
          setIsLevelingUp(false)
        }, 1500)
      }
    }

    socket.on('points:earned', handlePointsEarned)

    return () => {
      socket.off('points:earned', handlePointsEarned)
    }
  }, [socket])

  return (
    <motion.div 
      className="flex items-center gap-2 px-3 py-1 rounded-full border bg-indigo-50 border-indigo-100 dark:bg-gray-800 dark:border-gray-700 transition-all duration-300"
      animate={isLevelingUp ? { scale: 1.1 } : { scale: 1 }}
    >
      <motion.span 
        className="text-yellow-500"
        animate={isLevelingUp ? { rotate: 360 } : { rotate: 0 }}
        transition={{ duration: 0.6 }}
      >
        ★
      </motion.span>
      <span className="text-sm font-bold text-indigo-900 dark:text-gray-200">
        {points}
      </span>
      <motion.span 
        className="text-xs px-1.5 py-0.5 rounded-full bg-white text-indigo-600 dark:bg-gray-700 dark:text-gray-300 font-semibold flex items-center gap-1"
        animate={isLevelingUp ? { scale: 1.2, backgroundColor: '#4f46e5' } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {isLevelingUp && <Zap className="w-3 h-3" />}
        Lvl {level}
      </motion.span>
    </motion.div>
  )
}

export default LevelIndicator
