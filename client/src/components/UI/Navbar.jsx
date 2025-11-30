import { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Button } from './Button'
import NotificationCenter from '../Notifications/NotificationCenter'
import LevelIndicator from '../LevelIndicator'
import { motion, AnimatePresence } from 'framer-motion'

const HamburgerIcon = ({ isOpen }) => (
  <div className="flex flex-col justify-center items-center w-6 h-6 relative">
    <motion.div
      className="w-6 h-0.5 bg-current rounded-full"
      animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
      transition={{ duration: 0.3 }}
    />
    <motion.div
      className="w-6 h-0.5 bg-current rounded-full mt-1.5"
      animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.3 }}
    />
    <motion.div
      className="w-6 h-0.5 bg-current rounded-full mt-1.5"
      animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
      transition={{ duration: 0.3 }}
    />
  </div>
)

export const Navbar = ({ onMenuClick }) => {
  const { isDark, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const getDashboardLink = () => {
    if (!user) return '/dashboard'
    switch (user.role) {
      case 'ngo_admin':
        return '/ngo/dashboard'
      case 'admin':
        return '/admin/dashboard'
      default:
        return '/dashboard'
    }
  }

  const handleMobileMenuClick = () => {
    if (onMenuClick) {
      onMenuClick()
    } else {
      setIsMobileMenuOpen(!isMobileMenuOpen)
    }
  }

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <motion.div 
            className="flex-shrink-0 flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            {onMenuClick && (
              <motion.button
                onClick={onMenuClick}
                className="md:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </motion.button>
            )}
            <motion.button
              onClick={() => navigate('/')}
              className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Sevasetu
            </motion.button>
          </motion.div>

          {/* Desktop Menu */}
          <motion.div 
            className="hidden md:flex items-center gap-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <motion.button
              onClick={() => navigate('/map')}
              className="px-4 py-2 rounded-xl font-medium transition-all text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/80"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Map
            </motion.button>

            {user && (
              <>
                <motion.button
                  onClick={() => navigate(getDashboardLink())}
                  className="px-4 py-2 rounded-xl font-medium transition-all text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/80"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Dashboard
                </motion.button>
                
                <NotificationCenter />
                
                {/* Level Indicator with Real-time Updates */}
                <LevelIndicator 
                  initialLevel={user.level || 1}
                  initialPoints={user.points || 0}
                />
              </>
            )}

            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl transition-all bg-gray-100/80 text-gray-700 dark:bg-gray-800/80 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              whileHover={{ scale: 1.1, rotate: 20 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.293 1.293a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zm2.828 2.828a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zM10 7a3 3 0 100 6 3 3 0 000-6zm-4.293 1.293a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zM3 10a1 1 0 011-1h1a1 1 0 110 2H4a1 1 0 01-1-1zm11 0a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zm-10.707 4.293a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zm9.192 2.828a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zM10 17a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zm-4.293-1.293a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </motion.button>

            {/* User Menu */}
            {user && (
              <div className="relative ml-2">
                <motion.button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all hover:bg-gray-100 dark:hover:bg-gray-800/80 text-gray-700 dark:text-gray-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div 
                    className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                    whileHover={{ scale: 1.1 }}
                  >
                    {user.firstName?.charAt(0).toUpperCase()}
                  </motion.div>
                  <span className="text-sm font-semibold hidden sm:inline">{user.firstName}</span>
                  <motion.svg
                    className="w-4 h-4"
                    animate={{ rotate: isUserMenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </motion.svg>
                </motion.button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 overflow-hidden backdrop-blur-sm"
                    >
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700/50">
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                      <div className="py-2">
                        {[
                          { label: 'Profile', path: '/profile', icon: '👤' },
                          { label: 'My Progress', path: '/progress', icon: '📊' },
                          { label: 'My Certificates', path: '/certificates', icon: '🎓' },
                          { label: 'Leaderboard', path: '/leaderboard', icon: '🏆' },
                          { label: 'Donate Money', path: '/donate-money', icon: '💰' },
                          { label: 'Transaction History', path: '/transactions', icon: '💳' },
                          { label: 'Settings', path: '/settings', icon: '⚙️' },
                        ].map((item) => (
                          <motion.button
                            key={item.path}
                            onClick={() => {
                              navigate(item.path)
                              setIsUserMenuOpen(false)
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-200 transition-colors flex items-center gap-2"
                            whileHover={{ x: 4 }}
                          >
                            <span>{item.icon}</span>
                            {item.label}
                          </motion.button>
                        ))}
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700/50 py-2">
                        <motion.button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                          whileHover={{ x: 4 }}
                        >
                          <span>🚪</span>
                          Logout
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {!user && (
              <motion.div 
                className="flex gap-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button size="sm" onClick={() => navigate('/register')}>
                  Register
                </Button>
              </motion.div>
            )}
          </motion.div>

          {/* Mobile Menu Button */}
          <motion.div 
            className="md:hidden flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <motion.button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl transition-all bg-gray-100/80 text-gray-700 dark:bg-gray-800/80 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              whileHover={{ scale: 1.1, rotate: 20 }}
              whileTap={{ scale: 0.95 }}
            >
              {isDark ? '☀️' : '🌙'}
            </motion.button>
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <HamburgerIcon isOpen={isMobileMenuOpen} />
            </motion.button>
          </motion.div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence mode="wait">
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden border-t border-gray-200/50 dark:border-gray-700/50"
            >
              <motion.div 
                className="py-4 px-4 sm:px-6 space-y-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.2 }}
              >
                <motion.button
                  onClick={() => {
                    navigate('/map')
                    setIsMobileMenuOpen(false)
                  }}
                  className="w-full text-left px-4 py-3 rounded-xl font-medium transition-all hover:bg-gray-100 dark:hover:bg-gray-800/80 text-gray-700 dark:text-gray-200"
                  whileHover={{ x: 4 }}
                >
                  🗺️ Map
                </motion.button>

                {user && (
                  <>
                    <motion.button
                      onClick={() => {
                        navigate(getDashboardLink())
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full text-left px-4 py-3 rounded-xl font-medium transition-all hover:bg-gray-100 dark:hover:bg-gray-800/80 text-gray-700 dark:text-gray-200"
                      whileHover={{ x: 4 }}
                    >
                      📊 Dashboard
                    </motion.button>
                    {[
                      { label: 'My Progress', path: '/progress', icon: '📈' },
                      { label: 'My Certificates', path: '/certificates', icon: '🎓' },
                      { label: 'Leaderboard', path: '/leaderboard', icon: '🏆' },
                      { label: 'Donate Money', path: '/donate-money', icon: '💰' },
                      { label: 'Transaction History', path: '/transactions', icon: '💳' },
                      { label: 'Profile', path: '/profile', icon: '👤' },
                      { label: 'Settings', path: '/settings', icon: '⚙️' },
                    ].map((item) => (
                      <motion.button
                        key={item.path}
                        onClick={() => {
                          navigate(item.path)
                          setIsMobileMenuOpen(false)
                        }}
                        className="w-full text-left px-4 py-3 rounded-xl transition-all hover:bg-gray-100 dark:hover:bg-gray-800/80 text-gray-700 dark:text-gray-200 flex items-center gap-2"
                        whileHover={{ x: 4 }}
                      >
                        <span>{item.icon}</span>
                        {item.label}
                      </motion.button>
                    ))}
                    <motion.button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center gap-2"
                      whileHover={{ x: 4 }}
                    >
                      <span>🚪</span>
                      Logout
                    </motion.button>
                  </>
                )}
                {!user && (
                  <div className="flex gap-2 pt-2">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="w-full">
                      Login
                    </Button>
                    <Button size="sm" onClick={() => navigate('/register')} className="w-full">
                      Register
                    </Button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
