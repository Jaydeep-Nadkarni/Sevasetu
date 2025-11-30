import { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Button } from './Button'
import NotificationCenter from '../Notifications/NotificationCenter'
import { motion, AnimatePresence } from 'framer-motion'

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
    <nav className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-3">
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <button
              onClick={() => navigate('/')}
              className="text-2xl font-bold text-primary dark:text-primary-light"
            >
              Sevasetu
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => navigate('/map')}
              className="px-3 py-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
            >
              Map
            </button>

            {user && (
              <>
                <button
                  onClick={() => navigate(getDashboardLink())}
                  className="px-3 py-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
                >
                  Dashboard
                </button>
                
                <NotificationCenter />
                
                {/* Points Display */}
                <div className="flex items-center gap-2 px-3 py-1 rounded-full border bg-indigo-50 border-indigo-100 dark:bg-gray-800 dark:border-gray-700 transition-colors">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm font-bold text-indigo-900 dark:text-gray-200">
                    {user.points || 0}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-white text-indigo-600 dark:bg-gray-700 dark:text-gray-300">
                    Lvl {user.level || 1}
                  </span>
                </div>
              </>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-700"
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
            </button>

            {/* User Menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user.firstName?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{user.firstName}</span>
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                      {[
                        { label: 'Profile', path: '/profile' },
                        { label: 'My Progress', path: '/progress' },
                        { label: 'My Certificates', path: '/certificates' },
                        { label: 'Leaderboard', path: '/leaderboard' },
                        { label: 'Donate Money', path: '/donate-money' },
                        { label: 'Transaction History', path: '/transactions' },
                        { label: 'Settings', path: '/settings' },
                      ].map((item) => (
                        <button
                          key={item.path}
                          onClick={() => {
                            navigate(item.path)
                            setIsUserMenuOpen(false)
                          }}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
                        >
                          {item.label}
                        </button>
                      ))}
                      <hr className="border-gray-200 dark:border-gray-700" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {!user && (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button size="sm" onClick={() => navigate('/register')}>
                  Register
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-yellow-400"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="pb-4 space-y-2 border-t border-gray-200 dark:border-gray-800 pt-2">
                <button
                  onClick={() => {
                    navigate('/map')
                    setIsMobileMenuOpen(false)
                  }}
                  className="block w-full text-left px-4 py-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
                >
                  Map
                </button>

                {user && (
                  <>
                    <button
                      onClick={() => {
                        navigate(getDashboardLink())
                        setIsMobileMenuOpen(false)
                      }}
                      className="block w-full text-left px-4 py-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
                    >
                      Dashboard
                    </button>
                    {[
                      { label: 'My Progress', path: '/progress' },
                      { label: 'My Certificates', path: '/certificates' },
                      { label: 'Leaderboard', path: '/leaderboard' },
                      { label: 'Donate Money', path: '/donate-money' },
                      { label: 'Transaction History', path: '/transactions' },
                      { label: 'Profile', path: '/profile' },
                    ].map((item) => (
                      <button
                        key={item.path}
                        onClick={() => {
                          navigate(item.path)
                          setIsMobileMenuOpen(false)
                        }}
                        className="block w-full text-left px-4 py-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
                      >
                        {item.label}
                      </button>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-red-500 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Logout
                    </button>
                  </>
                )}
                {!user && (
                  <div className="flex gap-2 px-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="w-full">
                      Login
                    </Button>
                    <Button size="sm" onClick={() => navigate('/register')} className="w-full">
                      Register
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
