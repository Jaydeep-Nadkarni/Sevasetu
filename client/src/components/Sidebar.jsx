import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'

const userNavItems = [
  { label: 'Dashboard', path: '/dashboard', icon: '📊' },
  { label: 'Profile', path: '/profile', icon: '👤' },
  { label: 'Donations', path: '/donations', icon: '❤️' },
  { label: 'Events', path: '/events', icon: '🎉' },
  { label: 'Certificates', path: '/certificates', icon: '🏆' },
  { label: 'Help Requests', path: '/help-requests', icon: '🤝' },
  { label: 'Settings', path: '/settings', icon: '⚙️' },
]

const ngoNavItems = [
  { label: 'Dashboard', path: '/ngo/dashboard', icon: '📊' },
  { label: 'Profile', path: '/ngo/profile', icon: '🏢' },
  { label: 'Analytics', path: '/ngo/analytics', icon: '📈' },
  { label: 'Donations', path: '/ngo/donations', icon: '💰' },
  { label: 'Events', path: '/ngo/events', icon: '📅' },
  { label: 'Help Requests', path: '/ngo/help-requests', icon: '🆘' },
  { label: 'Settings', path: '/ngo/settings', icon: '⚙️' },
]

const adminNavItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
  { label: 'NGO Verification', path: '/admin/ngo-verification', icon: '✅' },
  { label: 'User Management', path: '/admin/users', icon: '👥' },
  { label: 'Platform Analytics', path: '/admin/analytics', icon: '📈' },
  { label: 'Donations', path: '/admin/donations', icon: '💰' },
  { label: 'Certificates', path: '/admin/certificates', icon: '🏆' },
  { label: 'Settings', path: '/admin/settings', icon: '⚙️' },
]

export const Sidebar = ({ isOpen = true, onClose }) => {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const { isDark } = useTheme()

  let navItems = userNavItems
  if (user?.role === 'ngo_admin') navItems = ngoNavItems
  if (user?.role === 'admin') navItems = adminNavItems

  const handleNavigation = (path) => {
    navigate(path)
    if (window.innerWidth < 768) {
      onClose?.()
    }
  }

  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: -300, opacity: 0 },
  }

  const mobileBackdropVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 },
  }

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

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: 'spring', stiffness: 300, damping: 25 },
    },
  }

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-sm"
            onClick={onClose}
            variants={mobileBackdropVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className="fixed md:sticky top-16 sm:top-20 left-0 z-40 h-[calc(100vh-64px)] sm:h-[calc(100vh-80px)] md:h-screen bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-r border-gray-200/50 dark:border-gray-800/50 transition-all duration-300 overflow-hidden"
        style={{ width: collapsed ? '88px' : '280px' }}
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <motion.div 
            className="flex items-center justify-between px-4 py-4 sm:py-6 border-b border-gray-200/50 dark:border-gray-700/50 shrink-0"
            layout
          >
            <motion.div
              animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent whitespace-nowrap">
                Navigation
              </h2>
            </motion.div>
            <motion.button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2.5 rounded-xl transition-all hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 shrink-0"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <motion.svg
                className="w-5 h-5"
                animate={{ rotate: collapsed ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </motion.svg>
            </motion.button>
          </motion.div>

          {/* Navigation Items */}
          <motion.nav 
            className="flex-1 overflow-y-auto px-3 py-4 space-y-2 custom-scrollbar"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <motion.button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all relative group overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60'
                  } ${collapsed ? 'justify-center' : ''}`}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, x: collapsed ? 0 : 4 }}
                  whileTap={{ scale: 0.98 }}
                  title={collapsed ? item.label : ''}
                >
                  {!isActive && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-400/0 to-indigo-400/0 group-hover:from-blue-400/10 group-hover:to-indigo-400/10 rounded-xl"
                      animate={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  <span className="text-xl relative z-10">{item.icon}</span>
                  {!collapsed && (
                    <motion.span 
                      className="text-sm font-semibold flex-1 text-left ml-3 relative z-10"
                      animate={{ opacity: 1 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                  {isActive && !collapsed && (
                    <motion.div
                      className="w-2 h-2 rounded-full bg-white/80"
                      layoutId="activeIndicator"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>
              )
            })}
          </motion.nav>

          {/* Footer */}
          <motion.div 
            className="px-4 py-4 border-t border-gray-200/50 dark:border-gray-700/50 shrink-0 bg-white/30 dark:bg-gray-800/20"
            layout
          >
            <motion.p 
              className="text-xs text-center text-gray-500 dark:text-gray-400 font-medium"
              animate={{ opacity: collapsed ? 0.5 : 1 }}
              transition={{ duration: 0.3 }}
            >
              {!collapsed ? '🚀 v1.0.0' : '1.0'}
            </motion.p>
            <motion.p 
              className="text-xs text-center text-gray-400 dark:text-gray-500 mt-1"
              animate={{ opacity: collapsed ? 0 : 0.6 }}
              transition={{ duration: 0.3 }}
            >
              {!collapsed && 'Sevasetu Platform'}
            </motion.p>
          </motion.div>
        </div>
      </motion.aside>
    </>
  )
}
