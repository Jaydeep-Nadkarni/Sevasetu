import React, { useState, useEffect, useCallback } from 'react'
import { io } from 'socket.io-client'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import { clearNotification } from '../store/slices/notificationSlice'
import config from '../config/config'

const Notifications = ({ userId, userType }) => {
  const [notifications, setNotifications] = useState([])
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const dispatch = useDispatch()
  const reduxNotification = useSelector(state => state.notification.notification)

  // Handle Redux notifications
  useEffect(() => {
    if (reduxNotification) {
      addNotification({
        type: reduxNotification.type || 'info',
        title: reduxNotification.type === 'error' ? 'Error' : 'Notification',
        message: reduxNotification.message,
        autoClose: true,
      })
      dispatch(clearNotification())
    }
  }, [reduxNotification, dispatch])

  // Initialize Socket.IO connection
  useEffect(() => {
    const socketInstance = io(config.apiUrl || 'http://localhost:5000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      auth: {
        userId,
        userType,
      },
    })

    // Connection events
    socketInstance.on('connect', () => {
      console.log('🟢 Connected to notification server')
      setConnected(true)

      // Join personal notification room
      if (userType === 'donor') {
        socketInstance.emit('user:join', userId)
      } else if (userType === 'ngo') {
        socketInstance.emit('ngo:join', userId)
      }
    })

    socketInstance.on('disconnect', () => {
      console.log('🔴 Disconnected from notification server')
      setConnected(false)
    })

    socketInstance.on('connect_error', error => {
      console.error('❌ Connection error:', error)
    })

    // Donation events
    socketInstance.on('donation:accepted', data => {
      addNotification({
        type: 'success',
        title: '✅ Donation Accepted',
        message: `${data.ngoName} has accepted your donation!`,
        data,
        autoClose: true,
      })
    })

    socketInstance.on('donation:completed', data => {
      addNotification({
        type: 'success',
        title: '🎉 Donation Completed',
        message: `Your donation has been successfully picked up!`,
        data,
        autoClose: true,
      })
    })

    socketInstance.on('donation:cancelled', data => {
      addNotification({
        type: 'info',
        title: '⚠️ Donation Cancelled',
        message: `A donation has been cancelled`,
        data,
        autoClose: true,
      })
    })

    socketInstance.on('ngo:contacted', data => {
      addNotification({
        type: 'info',
        title: '📞 NGO Contacted',
        message: `You have a new message from ${data.ngoName}`,
        data,
        autoClose: true,
      })
    })

    setSocket(socketInstance)

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect()
    }
  }, [userId, userType])

  // Add notification
  const addNotification = useCallback(notification => {
    const id = Date.now()
    const newNotification = {
      ...notification,
      id,
      timestamp: new Date(),
    }

    setNotifications(prev => [newNotification, ...prev])

    // Auto-remove after 5 seconds if autoClose is true
    if (notification.autoClose) {
      setTimeout(() => {
        removeNotification(id)
      }, 5000)
    }
  }, [])

  // Remove notification
  const removeNotification = useCallback(id => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  // Clear all notifications
  const clearAll = () => {
    setNotifications([])
  }

  // Format time
  const formatTime = date => {
    const now = new Date()
    const diff = now - date
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (seconds < 60) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  // Count unread
  const unreadCount = notifications.length

  return (
    <>
      {/* Toast Notifications (Top-right corner) */}
      <div className="fixed top-20 right-4 z-50 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {notifications.slice(0, 3).map(notification => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="mb-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border-l-4 border-primary pointer-events-auto backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">
                    {notification.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 leading-snug">
                    {notification.message}
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
                    {formatTime(notification.timestamp)}
                  </p>
                </div>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Notification Bell Icon (for history) */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowHistory(!showHistory)}
          className="relative bg-primary text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center"
        >
          <span className="text-2xl">🔔</span>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white dark:border-gray-900"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </motion.button>

        {/* Connection Status Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900"
          style={{
            backgroundColor: connected ? '#10b981' : '#ef4444',
          }}
          title={connected ? 'Connected' : 'Disconnected'}
        />
      </div>

      {/* Notification History Panel */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="fixed inset-0 bg-black/50 z-[45] backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-gray-900 shadow-2xl z-[50] flex flex-col border-l border-gray-200 dark:border-gray-800"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-primary text-white p-6 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">Notifications</h3>
                  <p className="text-sm opacity-90">{unreadCount} new</p>
                </div>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Notification List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                    <div className="text-6xl mb-4 opacity-50">🎉</div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">All caught up!</h4>
                    <p className="text-gray-500 dark:text-gray-400">
                      No new notifications at the moment.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {notifications.map(notification => (
                      <motion.div
                        key={notification.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group relative"
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                              {notification.title}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                              {formatTime(notification.timestamp)}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              removeNotification(notification.id)
                            }}
                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                            title="Remove"
                          >
                            ✕
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-900">
                  <button
                    onClick={clearAll}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-sm shadow-sm"
                  >
                    Clear All Notifications
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Notifications
