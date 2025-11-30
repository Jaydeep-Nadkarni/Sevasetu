import { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
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

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
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
        className="fixed md:sticky top-16 left-0 z-40 h-[calc(100vh-64px)] md:h-screen bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-colors duration-200"
        style={{ width: collapsed ? '80px' : '280px' }}
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex flex-col h-full">
          {/* Collapse Toggle */}
          <div className="flex items-center justify-between p-4">
            {!collapsed && <h2 className="text-lg font-bold text-primary dark:text-primary-light">Menu</h2>}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg transition-colors hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
              title={collapsed ? 'Expand' : 'Collapse'}
            >
              {collapsed ? '→' : '←'}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto px-2 space-y-2 custom-scrollbar">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <motion.button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-white shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                  } ${collapsed ? 'justify-center' : ''}`}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  title={collapsed ? item.label : ''}
                >
                  <span className="text-xl">{item.icon}</span>
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </motion.button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <p className="text-xs text-center text-gray-400 dark:text-gray-500">
              {!collapsed && 'v1.0.0'}
            </p>
          </div>
        </div>
      </motion.aside>
    </>
  )
}
