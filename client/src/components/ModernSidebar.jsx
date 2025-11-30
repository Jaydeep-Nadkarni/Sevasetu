import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector } from 'react-redux'
import {
  LayoutDashboard,
  User,
  Heart,
  Calendar,
  Gift,
  MapPin,
  Trophy,
  Award,
  Settings,
  HelpCircle,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Users,
  CheckSquare,
  DollarSign
} from 'lucide-react'

const ModernSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useSelector((state) => state.auth)
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Navigation items based on user role
  const getNavigationItems = () => {
    if (user?.role === 'user') {
      return [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: User, label: 'Profile', path: '/profile' },
        { icon: Heart, label: 'My Donations', path: '/user/donations' },
        { icon: DollarSign, label: 'Donate Money', path: '/donate-money' },
        { icon: Calendar, label: 'Events', path: '/events' },
        { icon: HelpCircle, label: 'Help Requests', path: '/help-requests' },
        { icon: MapPin, label: 'Nearby NGOs', path: '/map' },
        { icon: Trophy, label: 'Progress', path: '/progress' },
        { icon: Award, label: 'Certificates', path: '/certificates' },
        { icon: Users, label: 'Leaderboard', path: '/leaderboard' },
        { icon: Settings, label: 'Settings', path: '/settings' },
      ]
    } else if (user?.role === 'ngo_admin') {
      return [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/ngo/dashboard' },
        { icon: User, label: 'Profile', path: '/ngo/profile' },
        { icon: BarChart3, label: 'Analytics', path: '/ngo/analytics' },
        { icon: Gift, label: 'Donations', path: '/ngo/donations' },
        { icon: Calendar, label: 'Events', path: '/ngo/events' },
        { icon: HelpCircle, label: 'Help Requests', path: '/ngo/help-requests' },
        { icon: CheckSquare, label: 'QR Scanner', path: '/ngo/scan-qr' },
        { icon: Settings, label: 'Settings', path: '/settings' },
      ]
    } else if (user?.role === 'admin') {
      return [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: CheckSquare, label: 'NGO Verification', path: '/admin/ngo-verification' },
        { icon: Users, label: 'User Management', path: '/admin/users' },
        { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
        { icon: Settings, label: 'Settings', path: '/settings' },
      ]
    }
    return []
  }

  const navItems = getNavigationItems()

  const isActive = (path) => {
    return location.pathname === path
  }

  const handleNavigation = (path) => {
    navigate(path)
    if (window.innerWidth < 768) {
      onClose?.()
    }
  }

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: -300 },
  }

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
        className={`fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        } md:translate-x-0`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          {!isCollapsed && (
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"
            >
              SevaSetu
            </motion.h2>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors hidden md:block"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)

            return (
              <motion.button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  active
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <Icon className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} flex-shrink-0`} />
                {!isCollapsed && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
              </motion.button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          {!isCollapsed && (
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              v1.0.0
            </p>
          )}
        </div>
      </motion.aside>
    </>
  )
}

export default ModernSidebar
