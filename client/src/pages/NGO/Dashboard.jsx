import React from 'react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../hooks/useAuth'
import { Sidebar } from '../../components/Sidebar'
import { Card } from '../../components/UI/Card'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

const StatCard = ({ icon, label, value, change, isDark }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Card hoverable className="h-full">
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {label}
          </p>
          <p className="text-3xl font-bold mt-2 text-primary">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {change >= 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </Card>
  </motion.div>
)

export const NGODashboard = () => {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  // Mock Data - Replace with API calls
  const stats = [
    { icon: '💰', label: 'Total Donations', value: '₹1,25,000', change: 12 },
    { icon: '📅', label: 'Events Hosted', value: '24', change: 5 },
    { icon: '🤝', label: 'Active Volunteers', value: '156', change: 8 },
    { icon: '🆘', label: 'Help Requests', value: '45', change: -2 },
  ]

  const donationData = [
    { name: 'Jan', amount: 4000 },
    { name: 'Feb', amount: 3000 },
    { name: 'Mar', amount: 2000 },
    { name: 'Apr', amount: 2780 },
    { name: 'May', amount: 1890 },
    { name: 'Jun', amount: 2390 },
  ]

  return (
    <div className={`flex h-screen ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="md:hidden p-4 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
          >
            ☰
          </button>
        </div>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">NGO Dashboard</h1>
              <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Welcome back, {user?.firstName}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} isDark={isDark} />
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card header="Donation Trends">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={donationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card header="Recent Activity">
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <div>
                          <p className="font-medium">New Donation Received</p>
                          <p className="text-xs opacity-70">2 hours ago</p>
                        </div>
                      </div>
                      <span className="font-bold text-green-500">+₹500</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default NGODashboard
