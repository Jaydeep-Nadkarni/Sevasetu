import React from 'react'
import { useTheme } from '../../context/ThemeContext'
import { Card } from '../../components/UI/Card'
import { Button } from '../../components/UI/Button'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Users, BarChart3, Calendar } from 'lucide-react'
import { RecentActivity } from '../../components/RecentActivity'

export const AdminDashboard = () => {
  const { isDark } = useTheme()
  const navigate = useNavigate()

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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  }

  return (
    <motion.div
      className="max-w-7xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage platform operations and approvals
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card header="Quick Actions" className="dark:bg-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => navigate('/admin/ngo-verification')}
              className="w-full justify-center gap-2 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600"
            >
              <CheckCircle className="w-5 h-5" />
              NGO Verification
            </Button>
            <Button 
              onClick={() => navigate('/admin/users')}
              className="w-full justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Users className="w-5 h-5" />
              User Management
            </Button>
            <Button 
              onClick={() => navigate('/admin/analytics')}
              className="w-full justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              <BarChart3 className="w-5 h-5" />
              Analytics
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Two Column Layout: Pending Actions + System Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Actions */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card header="Pending Approvals" className="dark:bg-gray-800">
            <div className="space-y-4">
              {/* Pending NGO Approvals */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  NGO Verification Pending
                </h4>
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={`ngo-${i}`} className={`p-4 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    } cursor-pointer transition-all`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">Hope Foundation {i}</p>
                          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Applied 2 days ago • {['Education', 'Healthcare', 'Environment'][i % 3]}
                          </p>
                        </div>
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending Event Approvals */}
              <div className={`pt-4 border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Event Approvals Pending
                </h4>
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={`event-${i}`} className={`p-4 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    } cursor-pointer transition-all`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">Community Clean-up {i}</p>
                          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            By Organization • {1 + i} day{1 + i > 1 ? 's' : ''} ago
                          </p>
                        </div>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* System Summary */}
        <motion.div variants={itemVariants}>
          <Card header="Platform Overview" className="dark:bg-gray-800 h-full">
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-indigo-50'}`}>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-indigo-700'}`}>
                  Total Donations
                </p>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
                  ₹12,50,000
                </p>
              </div>

              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-blue-700'}`}>
                  Registered NGOs
                </p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                  120
                </p>
              </div>

              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-green-700'}`}>
                  Active Users
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                  5,430
                </p>
              </div>

              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-orange-50'}`}>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-orange-700'}`}>
                  Help Requests
                </p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                  850
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants}>
        <RecentActivity limit={10} />
      </motion.div>
    </motion.div>
  )
}

export default AdminDashboard
